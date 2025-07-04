import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Consultation } from './consultation.model';
import { IConsultation } from './consultation.interface';
import { stripeHelper } from '../../../helpers/stripeHelper';
import { Types } from 'mongoose';
import stripe from '../../../config/stripe';
import { User } from '../user/user.model';
import { CONSULTATION_TYPE, STATUS } from '../../../enums/consultation';
import { populate } from 'dotenv';
import { NotificationService } from '../notification/notification.service';
import catchAsync from '../../../shared/catchAsync';
import { Request, Response } from 'express';
import { DoctorService } from '../user/doctor/doctor.service';
import { UserService } from '../user/user.service';
import { HelperService } from '../../../helpers/helper.service';
import { IMedicine } from '../medicine/medicine.interface';
import config from '../../../config';
import { Order } from '../order/order.model';
import { USER_ROLES } from '../../../enums/user';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import { Medicine } from '../medicine/medicine.model';
import { Discount } from '../discount/discount.model';
import {assignDoctorByWorkload} from '../../../helpers/helper.service'
import { ShippingService } from '../shipping-cost/shipping.services';
import { ShippingCost } from '../shipping-cost/shippingCost.model';

// Helper function to find a doctor for consultation based on category and country
const findDoctorForConsultation = async (country?: string): Promise<string | null> => {
  try {
    // Find all available doctors regardless of category
    const searchCriteria: any = {
      role: USER_ROLES.DOCTOR,
      status: 'active', 
      verified: true, 
    };

    // Only filter by country if provided
    if (country) {
      searchCriteria.country = country;
    }

    const doctors = await User.find(searchCriteria)
      .select('_id firstName lastName country')
      .sort({ _id: 1 }); // Consistent ordering

    if (!doctors || doctors.length === 0) {
      console.warn(`No doctors found${country ? ` in country: ${country}` : ''}`);
      
      // If no doctors found in specific country, try to find any available doctor globally
      if (country) {
        console.log('Searching for doctors globally...');
        const globalDoctors = await User.find({
          role: USER_ROLES.DOCTOR,
          status: 'active',
          verified: true,
        })
        .select('_id firstName lastName country')
        .sort({ _id: 1 });
        
        if (!globalDoctors || globalDoctors.length === 0) {
          console.warn('No doctors found globally');
          return null;
        }
        
        // Use global doctors if country-specific search failed
        return await assignDoctorByWorkload(globalDoctors);
      }
      
      return null;
    }

    console.log(`Found ${doctors.length} available doctors for assignment`);
    return await assignDoctorByWorkload(doctors);
    
  } catch (error) {
    console.error('Error in findDoctorForConsultation:', error);
    return null;
  }
};



// const CONSULTATION_FEE_EURO = 25;

// const createConsultation = async (
//   payload: IConsultation & { discountCode?: string },
//   userId: string
// ): Promise<any> => {
//   payload.userId = new Types.ObjectId(userId);

//   let medicineAmount = 0;
//   let originalAmount = 0;
//   let discountAmount = 0;
//   let shippingCost = 0;
//   let finalAmount = 0;
//   let appliedDiscount = null;

//   // Fetch user to get their country
//   const user = await User.findById(userId);
//   if (!user || !user.country) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'User or user country not found'
//     );
//   }
//   const userCountry = user.country;

//   // Auto-assign doctor based on load balancing (no category restriction)
//   if (!payload.doctorId) {
//     const assignedDoctorId = await findDoctorForConsultation(userCountry);
//     if (assignedDoctorId) {
//       payload.doctorId = new Types.ObjectId(assignedDoctorId);
//     } else {
//       throw new ApiError(
//         StatusCodes.BAD_REQUEST,
//         'No available doctors found at the moment. Please try again later.'
//       );
//     }
//   }

//   // Calculate medicine total
//   if (payload.selectedMedicines && payload.selectedMedicines.length > 0) {
//     for (const selectedMedicine of payload.selectedMedicines) {
//       try {
//         const medicine = await Medicine.findById(selectedMedicine.medicineId);
//         if (!medicine) {
//           throw new ApiError(
//             StatusCodes.BAD_REQUEST,
//             `Medicine with ID ${selectedMedicine.medicineId} not found`
//           );
//         }

//         const variation = medicine.variations.find(
//           (v: any) =>
//             v._id.toString() === selectedMedicine.variationId.toString()
//         );
//         if (!variation) {
//           throw new ApiError(
//             StatusCodes.BAD_REQUEST,
//             `Variation with ID ${selectedMedicine.variationId} not found`
//           );
//         }

//         const unit = variation.units.find(
//           (u: any) =>
//             u._id.toString() === selectedMedicine.unitId.toString()
//         );
//         if (!unit) {
//           throw new ApiError(
//             StatusCodes.BAD_REQUEST,
//             `Unit with ID ${selectedMedicine.unitId} not found`
//           );
//         }

//         const medicineTotal = unit.sellingPrice * selectedMedicine.count;
//         selectedMedicine.total = medicineTotal;
//         medicineAmount += medicineTotal;
//       } catch (error) {
//         throw new ApiError(
//           StatusCodes.BAD_REQUEST,
//           `Error processing medicine selection: ${
//             error instanceof Error ? error.message : error
//           }`
//         );
//       }
//     }
//   }

//   // Always add fixed consultation fee
//   originalAmount = medicineAmount + CONSULTATION_FEE_EURO;

//   // Calculate shipping cost based on user country
//   try {
//     const shippingCostData = await ShippingCost.findOne({
//       country: user.country,
//     });

//     if (shippingCostData) {
//       shippingCost = shippingCostData.cost;
//     } else {
//       shippingCost = 0; // Default if no shipping cost defined
//     }
//   } catch (error) {
//     throw new ApiError(
//       StatusCodes.INTERNAL_SERVER_ERROR,
//       `Error calculating shipping cost: ${
//         error instanceof Error ? error.message : error
//       }`
//     );
//   }

//   // Apply discount logic
//   if (payload.discountCode) {
//     try {
//       const discount = await Discount.findOne({
//         discountCode: payload.discountCode.trim(),
//         startDate: { $lte: new Date() },
//         endDate: { $gte: new Date() },
//       });

//       if (!discount) {
//         throw new ApiError(
//           StatusCodes.BAD_REQUEST,
//           'Invalid or expired discount code'
//         );
//       }

//       if (
//         discount.country?.length > 0 &&
//         !discount.country.includes(userCountry)
//       ) {
//         throw new ApiError(
//           StatusCodes.BAD_REQUEST,
//           `This coupon code is not valid in your country (${userCountry})`
//         );
//       }

//       if (
//         !discount.parcentage ||
//         discount.parcentage <= 0 ||
//         discount.parcentage > 100
//       ) {
//         throw new ApiError(
//           StatusCodes.BAD_REQUEST,
//           'Invalid discount percentage'
//         );
//       }

//       discountAmount = (originalAmount * discount.parcentage) / 100;
//       finalAmount = originalAmount - discountAmount + shippingCost;

//       appliedDiscount = {
//         discountId: discount._id.toString(),
//         discountCode: discount.discountCode,
//         discountPercentage: discount.parcentage,
//         discountAmount,
//       };

//       if (finalAmount < 0) finalAmount = shippingCost;
//     } catch (error) {
//       if (error instanceof ApiError) throw error;
//       throw new ApiError(
//         StatusCodes.BAD_REQUEST,
//         `Error applying discount: ${
//           error instanceof Error ? error.message : error
//         }`
//       );
//     }
//   } else {
//     finalAmount = originalAmount + shippingCost;
//   }

//   // Store values in payload
//   payload.originalAmount = originalAmount;
//   payload.discountAmount = discountAmount;
//   payload.shippingCost = shippingCost;
//   payload.totalAmount = finalAmount;

//   if (appliedDiscount) {
//     payload.appliedDiscount = appliedDiscount;
//   }

//   const result = await Consultation.create(payload);

//   if (!result) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'Failed to create consultation!'
//     );
//   }

//   // Stripe Checkout Session
//   const createCheckOutSession = await stripeHelper.createCheckoutSession(
//     userId,
//     result._id.toString(),
//     finalAmount
//   );

//   return {
//     consultationId: result._id,
//     checkoutUrl: createCheckOutSession.url,
//     originalAmount,
//     discountAmount,
//     shippingCost,
//     totalAmount: finalAmount,
//     appliedDiscount,
//     assignedDoctorId: payload.doctorId,
//   };
// };

const CONSULTATION_FEE_EURO = 25;

const createConsultation = async (
  payload: IConsultation & { discountCode?: string },
  userId: string
): Promise<any> => {
  payload.userId = new Types.ObjectId(userId);

  let medicineAmount = 0;
  let originalAmount = 0;
  let discountAmount = 0;
  let shippingCost = 0;
  let finalAmount = 0;
  let appliedDiscount = null;

  const user = await User.findById(userId);
  if (!user || !user.country) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User or user country not found');
  }
  const userCountry = user.country;

  // Auto-assign doctor if not provided
  if (!payload.doctorId) {
    const assignedDoctorId = await findDoctorForConsultation(userCountry);
    if (assignedDoctorId) {
      payload.doctorId = new Types.ObjectId(assignedDoctorId);
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No available doctors found at the moment.');
    }
  }

  // Calculate medicine total
  if (payload.selectedMedicines && payload.selectedMedicines.length > 0) {
    for (const selectedMedicine of payload.selectedMedicines) {
      const medicine = await Medicine.findById(selectedMedicine.medicineId);
      if (!medicine) {
        throw new ApiError(StatusCodes.BAD_REQUEST, `Medicine with ID ${selectedMedicine.medicineId} not found`);
      }

      const variation = medicine.variations.find(
        (v: any) => v._id.toString() === selectedMedicine.variationId.toString()
      );
      if (!variation) {
        throw new ApiError(StatusCodes.BAD_REQUEST, `Variation with ID ${selectedMedicine.variationId} not found`);
      }

      const unit = variation.units.find(
        (u: any) => u._id.toString() === selectedMedicine.unitId.toString()
      );
      if (!unit) {
        throw new ApiError(StatusCodes.BAD_REQUEST, `Unit with ID ${selectedMedicine.unitId} not found`);
      }

      const medicineTotal = unit.sellingPrice * selectedMedicine.count;
      selectedMedicine.total = medicineTotal;
      medicineAmount += medicineTotal;
    }
  }

  // Check if it's only medicine (skip consultation fee)
  const includeConsultationFee = !payload.isMedicine;
  const consultationFee = includeConsultationFee ? CONSULTATION_FEE_EURO : 0;

  // Calculate original amount
  originalAmount = medicineAmount + consultationFee;

  // Calculate shipping cost
  try {
    const shippingCostData = await ShippingCost.findOne({ country: user.country });
    shippingCost = shippingCostData?.cost || 0;
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Error calculating shipping cost: ${error instanceof Error ? error.message : error}`
    );
  }

  // Apply discount if present
  if (payload.discountCode) {
    const discount = await Discount.findOne({
      discountCode: payload.discountCode.trim(),
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    if (!discount) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid or expired discount code');
    }

    if (discount.country?.length && !discount.country.includes(userCountry)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `This coupon code is not valid in your country (${userCountry})`
      );
    }

    if (!discount.parcentage || discount.parcentage <= 0 || discount.parcentage > 100) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid discount percentage');
    }

    discountAmount = (originalAmount * discount.parcentage) / 100;
    finalAmount = originalAmount - discountAmount + shippingCost;

    appliedDiscount = {
      discountId: discount._id.toString(),
      discountCode: discount.discountCode,
      discountPercentage: discount.parcentage,
      discountAmount,
    };

    if (finalAmount < 0) finalAmount = shippingCost;
  } else {
    finalAmount = originalAmount + shippingCost;
  }

  // Store calculated values
  payload.originalAmount = originalAmount;
  payload.discountAmount = discountAmount;
  payload.shippingCost = shippingCost;
  payload.totalAmount = finalAmount;

  if (appliedDiscount) {
    payload.appliedDiscount = appliedDiscount;
  }

  const result = await Consultation.create(payload);

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create consultation!');
  }

  const createCheckOutSession = await stripeHelper.createCheckoutSession(
    userId,
    result._id.toString(),
    finalAmount
  );

  return {
    consultationId: result._id,
    checkoutUrl: createCheckOutSession.url,
    originalAmount,
    discountAmount,
    shippingCost,
    totalAmount: finalAmount,
    appliedDiscount,
    assignedDoctorId: payload.doctorId,
  };
};


const getMedicinePricing = async (
  medicineId: string,
  variationId: string,
  unitId: string
): Promise<{ sellingPrice: number; dosage: string; unitPerBox: string }> => {
  const medicine = await Medicine.findById(medicineId);
  if (!medicine) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Medicine not found');
  }

  const variation = medicine.variations.find(
    (v: any) => v._id.toString() === variationId
  );
  if (!variation) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Medicine variation not found');
  }

  const unit = variation.units.find(
    (u: any) => u._id.toString() === unitId
  );
  if (!unit) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Medicine unit not found');
  }

  return {
    sellingPrice: unit.sellingPrice,
    dosage: variation.dosage,
    unitPerBox: unit.unitPerBox,
  };
};

const createConsultationSuccess = async (
  session_id: string,
  id: string,
  res: Response
): Promise<any> => {

  const consultation: any = await Consultation.findById(id)
    .populate('userId')
    .populate('subCategory')
    .populate('doctorId');
    
  const result = await stripe.checkout.sessions.retrieve(session_id);
  if (result.payment_status === 'paid') {
    const paymentIntentID = result.payment_intent;
    const isExistConsultation = await Consultation.findById(id);
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
    const updateConsultation = await Consultation.findByIdAndUpdate(
      id,
      {
        $set: {
          doctorId: selectRandomDoctor?._id,
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
// const getMyConsultations = async (userId: string, query: any): Promise<any> => {
//   const searchQuery = {
//     userId: new Types.ObjectId(userId),
//     status: { $in: ['accepted', 'processing'] },
//   };
//   if (query.consultationType) {
//     if (query.consultationType === CONSULTATION_TYPE.FORWARDTO) {
//       //@ts-ignore
//       searchQuery.forwardToPartner = true;
//     } else if (query.consultationType === CONSULTATION_TYPE.MEDICATION) {
//       //@ts-ignore
//       searchQuery.medicins = { $exists: true, $ne: [] };
//     }
//   }

//   const limit = Number(query.limit) || 10;
//   const page = Number(query.page) || 1;

// const result = await Consultation.find(searchQuery)
//   .populate('category')
//   .populate('subCategory')
//   .populate('selectedMedicines.medicineId') 
//   .populate('selectedMedicines.unitId')      
//   .populate('suggestedMedicine._id')
//   .populate('doctorId')
//   .skip(limit * (page - 1))
//   .limit(limit)
//   .sort({ createdAt: -1 });

//   return result;
// };

export const getMyConsultations = async (userId: string, query: any): Promise<any> => {
  const searchQuery: any = {
    userId: new Types.ObjectId(userId),
    status: { $in: ['accepted', 'processing'] },
  };

  if (query.consultationType) {
    if (query.consultationType === CONSULTATION_TYPE.FORWARDTO) {
      searchQuery.forwardToPartner = true;
    } else if (query.consultationType === CONSULTATION_TYPE.MEDICATION) {
      searchQuery.medicins = { $exists: true, $ne: [] };
    }
  }

  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;
  const skip = limit * (page - 1);

  const consultationsRaw = await Consultation.find(searchQuery)
    .populate('category')
    .populate('subCategory')
    .populate('medicins._id')
    .populate('suggestedMedicine._id')
    .populate('selectedMedicines.medicineId')
    .populate('selectedMedicines.variationId')
    .populate('selectedMedicines.unitId')
    .populate('doctorId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const consultations = consultationsRaw.map((consultation) => {
    let totalPrice = 0;
    let medicineImage = '';

    // const updatedSuggestedMedicine = (consultation.suggestedMedicine || []).map((item: any) => {
    //   const medicine = item?._id;
    //   const count = item?.count || 1;

    //   let variationDetails = null;
    //   let unitDetails = null;
    //   let unitPrice = 0;

    //   if (medicine?.variations?.length) {
    //     variationDetails = medicine.variations.find(
    //       (v: any) => v._id?.toString() === item.dosage?.toString()
    //     );

    //     if (variationDetails) {
    //       unitDetails = variationDetails.units.find(
    //         (u: any) => u._id?.toString() === item.total?.toString()
    //       );

    //       unitPrice = unitDetails?.sellingPrice || 0;
    //     }
    //   }

    //   if (!medicineImage && medicine?.image) {
    //     medicineImage = medicine.image;
    //   }

    //   const itemTotalPrice = unitPrice * count;
    //   totalPrice += itemTotalPrice;

    //   return {
    //     _id: medicine._id,
    //     name: medicine.name,
    //     company: medicine.company,
    //     dosage: variationDetails
    //       ? { _id: variationDetails._id, dosage: variationDetails.dosage }
    //       : null,
    //     count,
    //     total: unitDetails
    //       ? {
    //           _id: unitDetails._id,
    //           unitPerBox: unitDetails.unitPerBox,
    //           sellingPrice: unitDetails.sellingPrice,
    //         }
    //       : null,
    //     totalPrice: itemTotalPrice,
    //     image: medicineImage,
    //   };
    // });
const updatedSuggestedMedicine = (consultation.suggestedMedicine || []).map((item: any) => {
  const medicine = item?._id;
  const count = item?.count || 1;

  let variationDetails = null;
  let unitDetails = null;
  let unitPrice = 0;

  if (medicine?.variations?.length) {
    variationDetails = medicine.variations.find(
      (v: any) => v._id?.toString() === item.dosage?.toString()
    );

    if (variationDetails) {
      unitDetails = variationDetails.units.find(
        (u: any) => u._id?.toString() === item.total?.toString()
      );

      unitPrice = unitDetails?.sellingPrice || 0;
    }
  }

  const itemTotalPrice = unitPrice * count;
  totalPrice += itemTotalPrice;

  return {
    _id: medicine._id,
    name: medicine.name,
    company: medicine.company,
    dosage: variationDetails
      ? { _id: variationDetails._id, dosage: variationDetails.dosage }
      : null,
    count,
    total: unitDetails
      ? {
          _id: unitDetails._id,
          unitPerBox: unitDetails.unitPerBox,
          sellingPrice: unitDetails.sellingPrice,
        }
      : null,
    totalPrice: itemTotalPrice,
    image: medicine?.image || '', 
  };
});

    const updatedSelectedMedicines = (consultation.selectedMedicines || []).map((item: any) => {
      const medicine = item.medicineId;
      const variationId = item.variationId;
      const unitId = item.unitId;
      const count = item.count || 1;

      let variationDetails = null;
      let unitDetails = null;
      let unitPrice = 0;

      if (medicine?.variations?.length) {
        variationDetails = medicine.variations.find(
          (v: any) => v._id?.toString() === variationId?.toString()
        );

        if (variationDetails) {
          unitDetails = variationDetails.units.find(
            (u: any) => u._id?.toString() === unitId?.toString()
          );

          unitPrice = unitDetails?.sellingPrice || 0;
        }
      }

      if (!medicineImage && medicine?.image) {
        medicineImage = medicine.image;
      }

      const itemTotalPrice = unitPrice * count;
      totalPrice += itemTotalPrice;

      return {
        _id: medicine._id,
        name: medicine.name,
        company: medicine.company,
        dosage: variationDetails
          ? { _id: variationDetails._id, dosage: variationDetails.dosage }
          : null,
        count,
        total: unitDetails
          ? {
              _id: unitDetails._id,
              unitPerBox: unitDetails.unitPerBox,
              sellingPrice: unitDetails.sellingPrice,
            }
          : null,
        totalPrice: itemTotalPrice,
        image: medicine?.image,
      };
    });

    return {
      ...consultation,
      suggestedMedicine: updatedSuggestedMedicine,
      selectedMedicines: updatedSelectedMedicines,
      totalPrice,
    };
  });

  return consultations;
};

const updateConsultation = async (id: string, payload: any): Promise<any> => {
  const consultation: any = await Consultation.findById(id)
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
  const result = await Consultation.findByIdAndUpdate(id, { $set: payload });
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
  const result = await Consultation.findByIdAndUpdate(id, {
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
  await Consultation.findByIdAndUpdate(id, {
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
  const searchQuery: any = { ...query };

  if (query.consultationType) {
    if (query.consultationType === CONSULTATION_TYPE.FORWARDTO) {
      searchQuery.forwardToPartner = true;
    } else if (query.consultationType === CONSULTATION_TYPE.MEDICATION) {
      searchQuery.medicins = { $exists: true, $ne: [] };
    }
    delete searchQuery.consultationType;
  }

  if (query.doctorId) {
    searchQuery.doctorId = new Types.ObjectId(query.doctorId);
  }

  if (!searchQuery.status) {
    searchQuery.status = {
      $in: [
        STATUS.DRAFT,
        STATUS.PENDING,
        STATUS.PROCESSING,
        STATUS.PRESCRIBED,
        STATUS.ACCEPTED,
        STATUS.REJECTED,
        'delivered',
      ],
    };
  } else {
    if (typeof searchQuery.status === 'string') {
      searchQuery.status = { $in: [searchQuery.status] };
    } else if (Array.isArray(searchQuery.status)) {
      searchQuery.status = { $in: searchQuery.status };
    }
  }

  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const skip = limit * (page - 1);

  const consultationsRaw = await Consultation.find(searchQuery)
    .populate('category')
    .populate('subCategory')
    .populate('medicins._id')
    .populate('suggestedMedicine._id')
    .populate({
      path: 'doctorId',
      select: 'firstName lastName email designation profile subCategory',
      populate: {
        path: 'subCategory',
        select: 'name',
      },
    })
    .populate({
      path: 'userId',
      select: 'firstName lastName email profile contact country',
    })
    .sort({ createdAt: -1 })
    .sort({ createdAt: -1 }) 
    .skip(skip)
    .limit(limit)
    .lean();

  if (!consultationsRaw.length) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No consultations found!');
  }

    const consultations = consultationsRaw.map((consultation) => {
    let totalPrice = 0;
    let medicineImage = '';

    const updatedSuggestedMedicine = (consultation.suggestedMedicine || []).map((item: any) => {
      const medicine = item?._id;
      const count = item?.count || 1;

      let variationDetails = null;
      let unitDetails = null;
      let unitPrice = 0;

      if (medicine?.variations?.length) {
        variationDetails = medicine.variations.find(
          (v: any) => v._id?.toString() === item.dosage?.toString()
        );

        if (variationDetails) {
          unitDetails = variationDetails.units.find(
            (u: any) => u._id?.toString() === item.total?.toString()
          );

          unitPrice = unitDetails?.sellingPrice || 0;
        }
      }

      if (!medicineImage && medicine?.image) {
        medicineImage = medicine.image;
      }

      const itemTotalPrice = unitPrice * count;
      totalPrice += itemTotalPrice;

      return {
        _id: medicine._id,
        name: medicine.name,
        company: medicine.company,
        dosage: variationDetails
          ? { _id: variationDetails._id, dosage: variationDetails.dosage }
          : null,
        count,
        total: unitDetails
          ? {
              _id: unitDetails._id,
              unitPerBox: unitDetails.unitPerBox,
              sellingPrice: unitDetails.sellingPrice,
            }
          : null,
        totalPrice: itemTotalPrice,
         image: medicineImage,
      };
    });

    const { totalAmount, ...rest } = consultation;

    return {
      ...rest,
      suggestedMedicine: updatedSuggestedMedicine,
      totalPrice,
    };
  });

  const totalCount = await Consultation.countDocuments(searchQuery);

  return {
    consultations,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      hasNext: page < Math.ceil(totalCount / limit),
      hasPrev: page > 1,
    },
  };
};

// Function to get consultations by doctor ID
const getConsultationsByDoctorId = async (doctorId: string, query: any = {}): Promise<any> => {
  const searchQuery = {
    doctorId: new Types.ObjectId(doctorId),
    ...query
  };

  // Set default status filter if not provided
  if (!searchQuery.status) {
    searchQuery.status = {
      $in: [
        STATUS.PENDING,
        STATUS.PROCESSING,
        STATUS.PRESCRIBED,
        STATUS.ACCEPTED,
      ],
    };
  }

  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const skip = limit * (page - 1);

  const consultations = await Consultation.find(searchQuery)
    .populate('category')
    .populate('subCategory')
    .populate('medicins._id')
    .populate('suggestedMedicine._id')
    .populate({
      path: 'userId',
      select: 'firstName lastName email profile contact dateOfBirth gender'
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalCount = await Consultation.countDocuments(searchQuery);

  return {
    consultations,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      hasNext: page < Math.ceil(totalCount / limit),
      hasPrev: page > 1
    }
  };
};

// const getConsultationByID = async (id: string): Promise<any> => {
//   const result = await Consultation.findById(id)
//     .populate('category')
//     .populate('subCategory')
//     .populate('medicins._id')
//     .populate('doctorId')
//     .populate('userId')
//     .populate('suggestedMedicine._id') 
//     .lean();

//   if (!result) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Consultation not found!');
//   }

//   let totalPrice = 0;
//    let medicineImage = '';
//   const updatedSuggestedMedicines = (result.suggestedMedicine || []).map((item: any) => {
//     const medicine = item._id;
//     const count = item.count || 1;

//     let variationDetails = null;
//     let unitDetails = null;
//     let unitPrice = 0;

//     if (medicine?.variations?.length) {
//       variationDetails = medicine.variations.find(
//         (v: any) => v._id?.toString() === item.dosage?.toString()
//       );

//       if (variationDetails) {
//         unitDetails = variationDetails.units.find(
//           (u: any) => u._id?.toString() === item.total?.toString()
//         );

//         unitPrice = unitDetails?.sellingPrice || 0;
//       }
//          if (!medicineImage && medicine?.image) {
//         medicineImage = medicine.image;
//       }
//     }

//     const itemTotalPrice = unitPrice * count;
//     totalPrice += itemTotalPrice;

//     return {
//       _id: medicine._id,
//       name: medicine.name,
//       company: medicine.company,
//       dosage: variationDetails ? {
//         _id: variationDetails._id,
//         dosage: variationDetails.dosage,
//       } : null,
//       count,
//       total: unitDetails ? {
//         _id: unitDetails._id,
//         unitPerBox: unitDetails.unitPerBox,
//         sellingPrice: unitDetails.sellingPrice,
//       } : null,
//       totalPrice: itemTotalPrice,
//       image: medicineImage,
//     };
//   });

//   const { totalAmount, ...rest } = result;

//   return {
//     ...rest,
//     suggestedMedicine: updatedSuggestedMedicines,
//     totalPrice,
//   };
// };

const getConsultationByID = async (id: string): Promise<any> => {
  const result = await Consultation.findById(id)
    .populate('category')
    .populate('subCategory')
    .populate('medicins._id')
    .populate('doctorId')
    .populate('userId')
    .populate('suggestedMedicine._id')
    .populate('selectedMedicines.medicineId')
    .lean();

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Consultation not found!');
  }

  let totalPrice = 0;

  const updatedSuggestedMedicines = (result.suggestedMedicine || []).map((item: any) => {
    const medicine = item._id;
    const count = item.count || 1;

    let variationDetails = null;
    let unitDetails = null;
    let unitPrice = 0;

    if (medicine?.variations?.length) {
      variationDetails = medicine.variations.find(
        (v: any) => v._id?.toString() === item.dosage?.toString()
      );

      if (variationDetails) {
        unitDetails = variationDetails.units.find(
          (u: any) => u._id?.toString() === item.total?.toString()
        );
        unitPrice = unitDetails?.sellingPrice || 0;
      }
    }

    const itemTotalPrice = unitPrice * count;
    totalPrice += itemTotalPrice;

    return {
      _id: medicine._id,
      name: medicine.name,
      company: medicine.company,
      dosage: variationDetails ? {
        _id: variationDetails._id,
        dosage: variationDetails.dosage,
      } : null,
      count,
      total: unitDetails ? {
        _id: unitDetails._id,
        unitPerBox: unitDetails.unitPerBox,
        sellingPrice: unitDetails.sellingPrice,
      } : null,
      totalPrice: itemTotalPrice,
      image: medicine?.image || '', // Assign individual medicine image
    };
  });

  const updatedSelectedMedicines = (result.selectedMedicines || []).map((item: any) => {
    const med = item.medicineId;
    const selectedVariationId = item.variationId?.toString();
    const selectedUnitId = item.unitId?.toString();

    const selectedVariation = med?.variations?.find(
      (v: any) => v._id?.toString() === selectedVariationId
    );

    const selectedUnit = selectedVariation?.units?.find(
      (u: any) => u._id?.toString() === selectedUnitId
    );

    const filteredVariations = selectedVariation
      ? [
          {
            _id: selectedVariation._id,
            dosage: selectedVariation.dosage,
            units: selectedUnit
              ? [
                  {
                    _id: selectedUnit._id,
                    unitPerBox: selectedUnit.unitPerBox,
                    sellingPrice: selectedUnit.sellingPrice,
                  },
                ]
              : [],
          },
        ]
      : [];

    return {
      _id: item._id,
      medicineId: {
        _id: med._id,
        name: med.name,
        company: med.company,
        country: med.country,
        image: med.image, // Assign individual medicine image
        form: med.form,
        description: med.description,
        subCategory: med.subCategory,
        addedBy: med.addedBy,
        createdAt: med.createdAt,
        updatedAt: med.updatedAt,
        __v: med.__v,
        variations: filteredVariations,
      },
      count: item.count,
      totalPrice: item.total,
    };
  });

  const { totalAmount, ...rest } = result;

  return {
    ...rest,
    suggestedMedicine: updatedSuggestedMedicines,
    selectedMedicines: updatedSelectedMedicines,
    totalPrice,
  };
};

const refundByIDFromDB = async (id: string) => {
  const consultation = await Consultation.findById(id);
  if (!consultation) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Consultation does not exist');
  }
  
  const paymentIntentID = consultation.paymentIntentID;
  if (!paymentIntentID) {
    const paymentStatus = consultation.get('paymentStatus');
    if (paymentStatus === 'pending' || !paymentStatus) {
      return { message: 'No payment to refund - consultation was not paid' };
    }
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Missing paymentIntentID for this consultation'
    );
  }
  
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentID,
  });
  
  if (!refund) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to process refund!');
  }
  
  return refund;
};


const rejectConsultation = async (id: string, opinion: string) => {
  const consultation = await getConsultationByID(id);
  const rejectConsultation = await Consultation.findByIdAndUpdate(
    id,
    { status: STATUS.REJECTED, rejectedOpinion: opinion },
    { new: true }
  );

  if (!rejectConsultation) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to reject consultation!');
  }

  // Trigger refund (wait for this)
  const refund = await refundByIDFromDB(id);
  if (!refund) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Could not refund the money');
  }

  // Prepare parallel operations
  const notificationPromise = NotificationService.createNotification(
    {
      title: 'Rejected Consultation',
      description: 'Your consultation request has been rejected by doctor and the money is also successfully refunded to your account.',
      reciever: consultation?.userId,
    },
    //@ts-ignore
    global.io
  );

  const emailPromise = emailHelper.sendEmail({
    to: consultation.userId.email,
    subject: 'Dear customer, the doctor has rejected your consultation',
    html: emailTemplate.sendNotification({
      email: consultation.userId.email,
      name: consultation?.userId?.firstName || 'Unknown',
      message: `Dear customer, 
The doctor has rejected your consultation. The money has been refunded to your account. The doctor rejected the consultation with the following reason: ${opinion}.
`,
    }).html,
  });

  // Wait for both async operations to complete in parallel
  await Promise.all([notificationPromise, emailPromise]);

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
  await updateConsultation(id, data);

  const consultation = await getConsultationByID(id); // Ensure populated fields: userId (email, firstName), doctorId, subCategory

  //@ts-ignore
  const io = global.io;

  // In-app notification
  await NotificationService.createNotification(
    {
      title: `Doctor ${consultation.doctorId?.fileName || 'Doctor'} sent a meeting link for consultation`,
      description: `Doctor ${consultation.doctorId?.firstName || 'Doctor'} sent a meeting link for consultation on ${consultation.subCategory?.name || 'a category'}`,
      meetingLink: consultation.link,
      reciever: consultation.userId._id,
    },
    io
  );

  // Email notification
  const userEmail = consultation.userId?.email;
  if (userEmail && consultation.link) {
    await emailHelper.sendEmail({
      to: userEmail,
      subject: 'Your Consultation Meeting Link',
      html: `
        <p>Dear ${consultation.userId?.firstName || 'User'},</p>
        <p>Your consultation has been scheduled with Dr. ${consultation.doctorId?.firstName || 'our specialist'}.</p>
        <p><strong>Meeting Link:</strong> <a href="${consultation.link}" target="_blank">${consultation.link}</a></p>
        <p><strong>Category:</strong> ${consultation.subCategory?.name || 'N/A'}</p>
        <p>Please be ready at the scheduled time. Thank you for choosing Dokter For You.</p>
      `,
    });
  }

  return {
    message: 'Consultation scheduled successfully',
  };
};

const withdrawDoctorMoney = async (id: string) => {
  const doctor = await User.findById(id);
  const allDoctorConsultation = await Consultation.countDocuments({
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
  await Consultation.findByIdAndUpdate(id, {
    withrawn: true,
    withdrawnDate: todaysDate,
  });
  return {};
};


// const buyMedicine = async (userId: string, id: string) => {
//   const user = await User.findById(userId);
//   if (!user) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');
//   }

//   const rawConsultation = await Consultation.findById(id).lean();
//   if (!rawConsultation) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Consultation not found');
//   }

//   console.log('Raw Consultation Data:', JSON.stringify(rawConsultation, null, 2));

//   if (!rawConsultation.suggestedMedicine || rawConsultation.suggestedMedicine.length === 0) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'No suggested medicines found');
//   }

//   let allMedicinsPrice = 0;
//   const processedMedicines: any[] = [];

//   for (const medication of rawConsultation.suggestedMedicine) {
//     try {
//       console.log('Processing medication:', JSON.stringify(medication, null, 2));

//       const medicineId = medication._id;
//       if (!medicineId) {
//         console.warn('No medicine ID found in medication:', medication);
//         continue;
//       }

//       const medicine = await Medicine.findById(medicineId);
//       if (!medicine) {
//         console.warn('Medicine not found with ID:', medicineId);
//         continue;
//       }

//       const count = Number(medication.count) || 0;
//       if (count <= 0) {
//         console.warn(`Invalid count for medicine ${medicine.name}: ${count}`);
//         continue;
//       }

//       let sellingPrice = 0;
//       let unitsInBox = 1;

//       // If medication.total is an object with sellingPrice, use it; otherwise, try to resolve by ObjectId
//       if (
//         medication.total &&
//         typeof medication.total === 'object' &&
//         'sellingPrice' in medication.total
//       ) {
//         sellingPrice = Number((medication.total as any).sellingPrice) || 0;
//         unitsInBox = Number((medication.total as any).unitPerBox) || 1;
//       } else if (medicine.variations && medication.dosage && medication.total) {
//         const variation = medicine.variations.find(
//           (v: any) => v._id?.toString() === medication.dosage?.toString()
//         );
//         if (variation) {
//           const unit = variation.units?.find(
//             (u: any) => u._id?.toString() === medication.total?.toString()
//           );
//           if (unit) {
//             sellingPrice = Number(unit.sellingPrice) || 0;
//             unitsInBox = Number(unit.unitPerBox) || 1;
//           }
//         }
//       }

//       if (sellingPrice <= 0) {
//         console.warn(`Invalid selling price for medicine ${medicine.name}: ${sellingPrice}`);
//         continue;
//       }

//       const medicationTotal = sellingPrice * unitsInBox * count;
//       console.log(`Calculation for ${medicine.name}:
//         - Selling Price: ${sellingPrice}
//         - Units per Box: ${unitsInBox}
//         - Count: ${count}
//         - Total: ${medicationTotal}`);

//       if (medicationTotal > 0) {
//         allMedicinsPrice += medicationTotal;
//         processedMedicines.push({
//           medicineId,
//           name: medicine.name,
//           count,
//           sellingPrice,
//           unitsInBox,
//           total: medicationTotal
//         });
//         console.log(`✅ Successfully processed: ${medicine.name} - Total: ${medicationTotal}`);
//       } else {
//         console.warn(`❌ Zero total calculated for ${medicine.name}`);
//       }
//     } catch (error) {
//       console.error('Error processing medication:', error);
//       continue;
//     }
//   }

//   console.log('\n=== FINAL SUMMARY ===');
//   console.log('Total medicines in consultation:', rawConsultation.suggestedMedicine.length);
//   console.log('Successfully processed:', processedMedicines.length);
//   console.log('Total calculated price:', allMedicinsPrice);
//   console.log('Processed medicines:', processedMedicines);

//   if (allMedicinsPrice <= 0) {
//     const errorDetails = rawConsultation.suggestedMedicine.map((med, index) => ({
//       index: index + 1,
//       medicineId: med._id || 'No ID',
//       count: med.count || 'No count',
//       total: med.total || 'No total field'
//     }));
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       `Cannot calculate medicine cost. Details: ${JSON.stringify(errorDetails)}. Please check: 1) Medicine IDs exist, 2) Selling Price > 0, 3) Count > 0`
//     );
//   }

//   const serviceFee = 2000; // €20 in cents
//   const totalAmountInCents = Math.round(allMedicinsPrice * 100) + serviceFee;

//   await Consultation.findByIdAndUpdate(
//     id,
//     { totalAmount: allMedicinsPrice },
//     { runValidators: true }
//   );

//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ['card', 'ideal'],
//     line_items: [
//       {
//         price_data: {
//           currency: 'eur',
//           product_data: {
//             name: 'Consultation Prescribed Medicines',
//             description: `${processedMedicines.length} medicine(s): ${processedMedicines.map(m => m.name).join(', ')}`,
//           },
//           unit_amount: totalAmountInCents,
//         },
//         quantity: 1,
//       },
//     ],
//     mode: 'payment',
//     success_url: `https://api.dokterforyou.com/api/v1/consultation/buySuccess?session_id={CHECKOUT_SESSION_ID}&id=${id}`,
//     cancel_url: `https://www.dokterforyou.com/profile`,
//     metadata: {
//       userId,
//       consultationId: id,
//       medicineCount: processedMedicines.length.toString(),
//     },
//   });

//   return session.url;
// };
const buyMedicine = async (userId: string, id: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');
  }

  const rawConsultation = await Consultation.findById(id).lean();
  if (!rawConsultation) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Consultation not found');
  }

  if (!rawConsultation.suggestedMedicine || rawConsultation.suggestedMedicine.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No suggested medicines found');
  }

  let allMedicinsPrice = 0;
  const processedMedicines: any[] = [];

  for (const medication of rawConsultation.suggestedMedicine) {
    try {
      const medicineId = medication._id;
      if (!medicineId) continue;

      const medicine = await Medicine.findById(medicineId);
      if (!medicine) continue;

      const count = Number(medication.count) || 0;
      if (count <= 0) continue;

      let sellingPrice = 0;
      let unitsInBox = 1;

      if (
        medication.total &&
        typeof medication.total === 'object' &&
        'sellingPrice' in medication.total
      ) {
        sellingPrice = Number((medication.total as any).sellingPrice) || 0;
        unitsInBox = Number((medication.total as any).unitPerBox) || 1;
      } else if (medicine.variations && medication.dosage && medication.total) {
        const variation = medicine.variations.find(
          (v: any) => v._id?.toString() === medication.dosage?.toString()
        );
        if (variation) {
          const unit = variation.units?.find(
            (u: any) => u._id?.toString() === medication.total?.toString()
          );
          if (unit) {
            sellingPrice = Number(unit.sellingPrice) || 0;
            unitsInBox = Number(unit.unitPerBox) || 1;
          }
        }
      }

      if (sellingPrice <= 0) continue;

      const medicationTotal = sellingPrice * unitsInBox * count;
      allMedicinsPrice += medicationTotal;

      processedMedicines.push({
        medicineId,
        name: medicine.name,
        count,
        sellingPrice,
        unitsInBox,
        total: medicationTotal,
      });
    } catch (error) {
      continue;
    }
  }

  if (allMedicinsPrice <= 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Total medicine price must be greater than zero');
  }

  // ✅ Fetch dynamic shipping cost based on user country
  let shippingCost = 0;
  try {
    const shipping = await ShippingCost.findOne({ country: user.country });
    shippingCost = shipping?.cost || 0;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to calculate shipping cost');
  }

  const totalAmount = allMedicinsPrice + shippingCost;
  const totalAmountInCents = Math.round(totalAmount * 100); // Stripe expects amount in cents

  // ✅ Save medicine total only (not shipping) to consultation
  await Consultation.findByIdAndUpdate(
    id,
    { totalAmount: allMedicinsPrice },
    { runValidators: true }
  );

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'ideal'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Consultation Prescribed Medicines',
            description: `${processedMedicines.length} medicine(s): ${processedMedicines.map(m => m.name).join(', ')}`,
          },
          unit_amount: totalAmountInCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `https://api.dokterforyou.com/api/v1/consultation/buySuccess?session_id={CHECKOUT_SESSION_ID}&id=${id}`,
    cancel_url: `https://www.dokterforyou.com/profile`,
    metadata: {
      userId,
      consultationId: id,
      medicineCount: processedMedicines.length.toString(),
      shippingCost: shippingCost.toFixed(2),
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
    await Consultation.findByIdAndUpdate(isExistConsultation._id, {
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

// Function to get doctor workload statistics
const getDoctorWorkloadStats = async (country?: string): Promise<any> => {
  const matchCriteria: any = {
    role: USER_ROLES.DOCTOR,
    status: 'active',
    verified: true
  };
  
  if (country) {
    matchCriteria.country = country;
  }

  const doctors = await User.find(matchCriteria).select('firstName lastName country');

  const doctorStats = await Promise.all(
    doctors.map(async (doctor) => {
      const totalConsultations = await Consultation.countDocuments({
        doctorId: doctor._id
      });
      
      const activeConsultations = await Consultation.countDocuments({
        doctorId: doctor._id,
        status: { $in: [STATUS.PENDING, STATUS.PROCESSING, STATUS.ACCEPTED] }
      });

      const completedConsultations = await Consultation.countDocuments({
        doctorId: doctor._id,
        status: STATUS.PRESCRIBED
      });

      return {
        doctorId: doctor._id,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        country: doctor.country,
        totalConsultations,
        activeConsultations,
        completedConsultations
      };
    })
  );

  return doctorStats.sort((a, b) => a.activeConsultations - b.activeConsultations);
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
  getMedicinePricing,
  getDoctorWorkloadStats,
  getConsultationsByDoctorId
};
