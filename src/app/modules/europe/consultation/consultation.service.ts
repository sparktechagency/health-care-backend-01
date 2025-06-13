import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import { EuropeConsultation } from './consultation.model';
import { IConsultation } from './consultation.interface';
import { stripeHelper } from '../../../../helpers/stripeHelper';
import { Types } from 'mongoose';
import stripe from '../../../../config/stripe';
import { User } from '../../user/user.model';
import { CONSULTATION_TYPE, STATUS } from '../../../../enums/consultation';
import { populate } from 'dotenv';
import { NotificationService } from '../../notification/notification.service';
import catchAsync from '../../../../shared/catchAsync';
import { Request, Response } from 'express';
import { DoctorService } from '../../user/doctor/doctor.service';
import { UserService } from '../../user/user.service';
import { HelperService } from '../../../../helpers/helper.service';
import { IMedicine } from '../../medicine/medicine.interface';
import config from '../../../../config';
import { Order } from '../../order/order.model';
import { USER_ROLES } from '../../../../enums/user';
import { emailHelper } from '../../../../helpers/emailHelper';
import { emailTemplate } from '../../../../shared/emailTemplate';

const createConsultation = async (
  payload: IConsultation,
  userId: string
): Promise<any> => {
  payload.userId = new Types.ObjectId(userId);
  const result = await EuropeConsultation.create(payload);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create consultation!'
    );
  }
  const createCheckOutSession = await stripeHelper.createCheckoutSession(
    userId,
    result._id.toString()
  );

  return createCheckOutSession.url;
};
const createConsultationSuccess = async (
  session_id: string,
  id: string,
  res: Response
): Promise<any> => {
  const consultation: any = await EuropeConsultation.findById(id)
    .populate('userId')
    .populate('subCategory')
    .populate('doctorId');
  const result = await stripe.checkout.sessions.retrieve(session_id);
  if (result.payment_status === 'paid') {
    const paymentIntentID = result.payment_intent;
    const isExistConsultation = await EuropeConsultation.findById(id);
    if (!isExistConsultation) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Consultation not found!');
    }
    const allDoctors = await User.find({
      subCategory: isExistConsultation.subCategory,
    });
    let selectRandomDoctor: any =
      allDoctors[Math.floor(Math.random() * allDoctors.length)];
    if (!selectRandomDoctor) {
      selectRandomDoctor = await User.findOne({ role: USER_ROLES.DOCTOR });
    }
    const updateConsultation = await EuropeConsultation.findByIdAndUpdate(
      id,
      {
        $set: {
          doctorId: selectRandomDoctor._id,
          status: STATUS.PENDING,
          paymentIntentID,
        },
      },
      { new: true }
    );
    if (!updateConsultation) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to update consultation!'
      );
    }
    //@ts-ignore
    const io = global.io;
    await NotificationService.createNotification(
      {
        title: `A new consultation request by ${consultation?.userId?.firstName}`,
        description: `A new consultation request by ${consultation?.userId?.firstName} on ${consultation?.subCategory?.name}`,

        reciever: selectRandomDoctor._id,
      },
      io
    );
    await emailHelper.sendEmail({
      to: consultation.userId.email,
      subject:
        'Dear customer, we thank you very much for your trust and payment.',
      html: emailTemplate.sendNotification({
        email: consultation?.userId?.email,
        name: consultation?.userId?.firstName || 'Unknown',
        message: `Dear customer, 
Your answers have been sent to the doctor. Based on this, the doctor will decide what the best treatment is for you. If this results in a prescription, you will receive a message that the doctor has sent your prescription to a connected pharmacy with further information.
If you have any questions in the meantime, please do not hesitate to ask us (support@dokterforyou.com).
 Kind regards, team Doctor For You

`,
      }).html,
    });
    await emailHelper.sendEmail({
      to: selectRandomDoctor.email,
      subject:
        'Dear Doctor, a consultation has been requested by a client. kindly request to review this asap.',
      html: emailTemplate.sendNotification({
        email: selectRandomDoctor.email,
        name: selectRandomDoctor.email || 'Unknown',
        message: `Dear Doctor, a consultation has been requested by a client. kindly request to review this asap.
`,
      }).html,
    });
    return updateConsultation;
  }

  return {};
};
const getMyConsultations = async (userId: string, query: any): Promise<any> => {
  const searchQuery = {
    userId: new Types.ObjectId(userId),
    status: { $in: ['accepted', 'processing'] },
  };
  if (query.consultationType) {
    if (query.consultationType === CONSULTATION_TYPE.FORWARDTO) {
      //@ts-ignore
      searchQuery.forwardToPartner = true;
    } else if (query.consultationType === CONSULTATION_TYPE.MEDICATION) {
      //@ts-ignore
      searchQuery.medicins = { $exists: true, $ne: [] };
    }
  }

  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;

  const result = await EuropeConsultation.find(searchQuery)
    .populate('category')
    .populate('subCategory')
    .populate('medicins._id')
    .populate('suggestedMedicine._id')
    .populate('doctorId')
    .skip(limit * (page - 1))
    .limit(limit)
    .sort({ createdAt: -1 });

  return result;
};

const updateConsultation = async (id: string, payload: any): Promise<any> => {
  const consultation: any = await EuropeConsultation.findById(id)
    .populate('userId')
    .populate('subCategory')
    .populate('doctorId');
  if (payload.status === 'accepted') {
    await emailHelper.sendEmail({
      to: consultation.userId.email,
      subject:
        'Dear customer, a connected Pharmacy has approved your prescription.',
      html: emailTemplate.sendNotification({
        email: consultation.userId.email,
        name: consultation?.userId?.firstName || 'Unknown',
        message: `
        Dear customer,
At your account at Dokterforyou.com you can find a copy of the prescription and the paymentlink for the medication. If you make the payment before 3:00 PM on workdays, your prescription will be processed immediately by the pharmacy and they will handover within 24 hours your medication to PostNL. PostNL will deliver your medication by express delivery.
If you have chosen for only an receipt, you’ll find the receipt in your profile at www.dokterforyou.com. Beware that a receipt is valid for 7 days from now an that you can use it only once.
We thank you for your trust and look forward to see you back on our website. 
If you have any questions in the meantime, please do not hesitate to ask us (support@dokterforyou.com).
 Kind regards, team Dokter For You
`,
      }).html,
    });
  }
  const result = await EuropeConsultation.findByIdAndUpdate(id, { $set: payload });
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to update consultation!'
    );
  }
  return result;
};
const prescribeMedicine = async (id: string, payload: any): Promise<any> => {
  const consultation: any = await getConsultationByID(id);
  const result = await EuropeConsultation.findByIdAndUpdate(id, {
    $set: { ...payload, status: STATUS.PRESCRIBED },
  });

  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to update consultation!'
    );
  }

  const allMedicinsPrice = consultation?.suggestedMedicine
    ?.map((medicine: any) => {
      const totals = Number(medicine.total);
      return {
        price: medicine?._id?.sellingPrice
          ? medicine?._id?.sellingPrice * totals * medicine.count * 100
          : 0,
      };
    })
    .reduce((prev: number, current: any) => prev + current.price, 0);

  const priceToUpdate = allMedicinsPrice ? allMedicinsPrice / 100 : 0;
  await EuropeConsultation.findByIdAndUpdate(id, {
    totalAmount: priceToUpdate,
  });

  const doctor = await User.findById(result?.doctorId);
  const isExistPharmecy = await User.find({ role: USER_ROLES.PHARMACY });

  if (isExistPharmecy) {
    await NotificationService.createNotification(
      {
        title: `A new prescription request by ${doctor?.firstName}`,
        description: `A new prescription request by ${doctor?.firstName}.`,
        reciever: isExistPharmecy[0]?._id,
      },
      // @ts-ignore
      global.io
    );

    await emailHelper.sendEmail({
      to: consultation.userId.email,
      subject: 'Dear customer, the doctor has approved your consultation',
      html: emailTemplate.sendNotification({
        email: consultation.userId.email,
        name: consultation?.userId?.firstName || 'Unknown',
        message: ` Dear customer, 
If you have chosen that a connected pharmacy sends you the prescribed medication, then the doctor has sent the prescription for you to an connected Pharmacy. Once the Pharmacy accepts the receipt, you will receive a payment link for the medication. 
If you have chosen for only an receipt, then the doctor has sent the prescription for you to an connected Pharmacy for a double check. Once the Pharmacy checks the receipt, you will receive this receipt in your profile at our website. Beware that a receipt is valid for 7 days from the moment it’s sent and that you can use it only once.
We thank you for your trust and look forward to see you back on our website. If you have any questions in the meantime, please do not hesitate to ask us (support@dokterforyou.com). 
Kind regards, team Doctor For You`,
      }).html,
    });
  }

  return result;
};

const getAllConsultations = async (query: any): Promise<any> => {
  if (query.consultationType) {
    if (query.consultationType === CONSULTATION_TYPE.FORWARDTO) {
      query.forwardToPartner = true;
    } else if (query.consultationType === CONSULTATION_TYPE.MEDICATION) {
      query.medicins = { $exists: true, $ne: [] };
    }
  }
  const result = await EuropeConsultation.find({
    ...query,
    status: {
      $in: query.status || [
        'pending',
        'processing',
        'prescribed',
        'accepted',
        'rejected',
        'delivered',
      ],
    },
  })
    .populate('category')
    .populate('subCategory')
    .populate('medicins._id')
    .populate('suggestedMedicine._id')
    .populate('doctorId')
    .populate('userId')
    .skip(Number(query.limit || 10) * (Number(query.page || 1) - 1));
  if (!result.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Consultation not found!');
  }
  return result;
};
const getConsultationByID = async (id: string): Promise<any> => {
  const result = await EuropeConsultation.findById(id)
    .populate('category')
    .populate('subCategory')
    .populate('medicins._id')
    .populate('doctorId')
    .populate('userId')
    .populate('suggestedMedicine._id')
    .populate('medicins._id');

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Consultation not found!');
  }
  const totalPrice =
    result?.suggestedMedicine?.reduce(
      //@ts-ignore
      (acc, curr) => acc + (curr?._id?.sellingPrice || 0),
      0
    ) || 0;
  //@ts-ignore
  const finalResult = { ...result._doc, totalPrice };
  return finalResult;
};

const refundByIDFromDB = async (id: string) => {
  const consultation = await EuropeConsultation.findById(id);
  if (!consultation) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Consultation does not exist');
  }
  const refund = await stripe.refunds.create({
    payment_intent: consultation?.paymentIntentID as string,
  });
  if (!refund) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to process refund!');
  }
  return refund;
};

const rejectConsultation = async (id: string, opinion: string) => {
  const consultation = await getConsultationByID(id);
  const rejectConsultation = await EuropeConsultation.findByIdAndUpdate(
    id,
    { status: STATUS.REJECTED, rejectedOpinion: opinion },
    { new: true }
  );
  if (!rejectConsultation) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to reject consultation!'
    );
  }
  const refund = await refundByIDFromDB(id);
  if (!refund) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Could not refund the money'
    );
  }
  await NotificationService.createNotification(
    {
      title: 'Rejected Consultation',
      description:
        'Your consultation request has been rejected by doctor and the money is also successfully refunded to your account.',
      reciever: consultation?.userId,
    },
    //@ts-ignore
    global.io
  );

  await emailHelper.sendEmail({
    to: consultation.userId.email,
    subject: 'Dear customer, the doctor has rejected your consultation',
    html: emailTemplate.sendNotification({
      email: consultation.userId.email,
      name: consultation?.userId?.firstName || 'Unknown',
      message: ` Dear customer, 
The doctor has rejected your consultation. The money has been refunded to your account. The doctor rejected the consultation with the following reason: ${opinion}.
`,
    }).html,
  });

  return {};
};

const scheduleConsultationToDB = async (data: IConsultation, id: string) => {
  const consultation = await getConsultationByID(id);
  await updateConsultation(id, data);
  //@ts-ignore
  const io = global.io;
  await NotificationService.createNotification(
    {
      title: `Your consultation on ${consultation.subCategory.name} is scheduled`,
      description: `Your consultation on ${
        consultation.subCategory.name
      } with doctor ${
        consultation.doctorId.firstName
      } was scheduled on ${data?.scheduledDate?.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      reciever: consultation.userId._id,
    },
    io
  );
  return {
    message: 'consultation scheduled successfully',
  };
};

const addLinkToConsultation = async (data: IConsultation, id: string) => {
  const consultation = await getConsultationByID(id);
  await updateConsultation(id, data);
  //@ts-ignore
  const io = global.io;
  await NotificationService.createNotification(
    {
      title: `Doctor ${consultation.doctorId.fileName} sent a meeting link for consultation`,
      description: `Doctor ${consultation.doctorId.firstName} sent a meeting link for consultation on ${consultation.subCategory.name}`,
      reciever: consultation.userId._id,
    },
    io
  );
  return {
    message: 'consultation scheduled successfully',
  };
};

const withdrawDoctorMoney = async (id: string) => {
  const doctor = await User.findById(id);
  const allDoctorConsultation = await EuropeConsultation.countDocuments({
    status: 'accepted',
    doctorId: id,
    withrawn: { $ne: true },
  });
  const totalAmount = 25 * allDoctorConsultation * 0.15;
  if (totalAmount === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No money to withdraw');
  }
  const teacherStripeAccountId = doctor?.accountInformation?.stripeAccountId;
  if (!teacherStripeAccountId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher payment not setup');
  }
  const transfer = await stripe.transfers.create({
    amount: totalAmount * 100,
    currency: 'usd',
    destination: teacherStripeAccountId,
  });

  if (!transfer) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to transfer money!');
  }
  const todaysDate = new Date();
  await EuropeConsultation.findByIdAndUpdate(id, {
    withrawn: true,
    withdrawnDate: todaysDate,
  });
  return {};
};

const buyMedicine = async (userId: string, id: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');
  }
  const isExistConsultation = await getConsultationByID(id);
  let allMedicinsPrice = 0;
  allMedicinsPrice = isExistConsultation?.suggestedMedicine?.reduce(
    (
      total: number,
      medication: {
        count: number;
        _id: { sellingPrice: string; unitPerBox: string[] };
      }
    ) => {
      const pricePerUnit =
        Number(medication?._id?.sellingPrice) *
        Number(medication?._id?.unitPerBox[0]);
      return total + pricePerUnit * Number(medication?.count);
    },
    0
  );
  await EuropeConsultation.findByIdAndUpdate(
    id,
    {
      totalAmount: allMedicinsPrice,
    },
    { runValidators: true }
  );
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'ideal'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Consultation service Medicins.',
            description: 'Prescription medicins',
          },
          unit_amount: allMedicinsPrice * 100 + 2000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `https://api.dokterforyou.com/api/v1/consultation/buySuccess?session_id={CHECKOUT_SESSION_ID}&id=${id}`,
    cancel_url: `https://www.dokterforyou.com/profile`,
    metadata: {
      userId,
    },
  });
  return session.url;
};

const buyMedicineSuccess = async (
  session_id: string,
  id: string,
  res: Response
) => {
  const todaysDate = new Date();
  const session = await stripe.checkout.sessions.retrieve(session_id);
  const isExistConsultation = await getConsultationByID(id);
  if (session?.payment_status === 'paid') {
    await EuropeConsultation.findByIdAndUpdate(isExistConsultation._id, {
      $set: {
        paid: true,
        paymentIntentID: session.payment_intent,
        orderDate: todaysDate,
        status: 'processing',
      },
    });
  }
  await Order.create({
    address: `${isExistConsultation.address.streetAndHouseNo}, ${isExistConsultation.address.place}, ${isExistConsultation.address.country}`,
    name: `${isExistConsultation.userId.firstName} ${isExistConsultation.userId.lastName}`,
    email: isExistConsultation.userId.email || 'N/A',
    phone: isExistConsultation.userId.contact || 'N/A',
    company: 'Apotheek Zaandam Oost',
    country: 'Netherlands',
    orderDate: todaysDate,
    city: isExistConsultation.address.place,
    price: isExistConsultation.totalAmount,
    zipCode:
      isExistConsultation.address.postalCode ||
      isExistConsultation.userId.postcode ||
      'N/A',
    trackingNo: '____',
    status: 'processing',
  });

  await emailHelper.sendEmail({
    to: isExistConsultation.userId.email,
    subject:
      'Dear customer, we thank you very much for your trust and payment.',
    html: emailTemplate.sendNotification({
      email: isExistConsultation.userId.email,
      name: isExistConsultation?.userId?.firstName || 'Unknown',
      message: `Dear customer, we thank you very much for your trust and payment. 
If you make the payment before 3:00 PM on workdays, your prescription will be processed immediately by the pharmacy and you will receive your medication at home the next working day. If you have any questions in the meantime, please do not hesitate to mail us (support@dokterforyou.com). Kind regards, team Dokter For You`,
    }).html,
  });
  return res.redirect(`https://www.dokterforyou.com/profile`);
};
export const ConsultationService = {
  createConsultation,
  createConsultationSuccess,
  getMyConsultations,
  updateConsultation,
  prescribeMedicine,
  getAllConsultations,
  getConsultationByID,
  refundByIDFromDB,
  rejectConsultation,
  scheduleConsultationToDB,
  addLinkToConsultation,
  withdrawDoctorMoney,
  buyMedicine,
  buyMedicineSuccess,
};
