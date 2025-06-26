import { StatusCodes } from 'http-status-codes';
import { CONSULTATION_TYPE, STATUS } from '../../../../enums/consultation';
import ApiError from '../../../../errors/ApiError';
import { Consultation } from '../../consultation/consultation.model';
import { User } from '../user.model';
import path from 'path';
import { stripeHelper } from '../../../../helpers/stripeHelper';
import stripe from '../../../../config/stripe';
import { config } from 'dotenv';
import fs from 'fs';
const getDoctorStatus = async (id: string) => {
  const [
    totalRegularConsultation,
    totalVideoConsultation,
    totalMedicationByPatient,
    totalDigitalPrescription,
  ] = await Promise.all([
    Consultation.countDocuments({
      doctorId: id,
      consultationType: CONSULTATION_TYPE.REGULAR,
    }),
    Consultation.countDocuments({
      doctorId: id,
      consultationType: CONSULTATION_TYPE.VIDEO,
    }),
    Consultation.countDocuments({
      doctorId: id,
      medicines: { $exists: true, $not: { $size: 0 } },
    }),
    Consultation.countDocuments({
      doctorId: id,
      medicines: { $exists: true, $size: 0 },
    }),
  ]);
  const totalAcceptedConsultation = await Consultation.countDocuments({
    doctorId: id,
    status: STATUS.ACCEPTED,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dailyAcceptedConsultation = await Consultation.countDocuments({
    doctorId: id,
    createdAt: {
      $gte: today,
      $lt: tomorrow,
    },
  });

  const consultations = await Consultation.countDocuments({
    doctorId: id,
    status: STATUS.ACCEPTED,
  });
  const totalEarn = consultations * 25 * 0.15;
  const totalWithdrawn = await Consultation.countDocuments({
    doctorId: id,
    withrawn: true,
  });
  const balanceAvailable = totalEarn - totalWithdrawn * 25 * 0.15;

  return {
    totalEarning: totalAcceptedConsultation * 25 * 0.15,
    dailyEarning: dailyAcceptedConsultation * 25 * 0.15,
    totalRegularConsultation,
    totalVideoConsultation,
    totalMedicationByPatient,
    totalDigitalPrescription,
    balanceAvailable,
  };
};

const getDoctorActivityStatusFromDB = async (id: string, year: number) => {
  const today = new Date();
  const currentYear = year || today.getFullYear();
  const currentMonth = today.getMonth();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);

  // Lifetime data
  const [
    lifetimeRegularConsultation,
    lifetimeVideoConsultation,
    lifetimeConsultationWithMeds,
    lifetimeConsultationWithoutMeds,
    totalLifetimeConsultation,
  ] = await Promise.all([
    Consultation.countDocuments({
      doctorId: id,
      consultationType: CONSULTATION_TYPE.REGULAR,
    }),
    Consultation.countDocuments({
      doctorId: id,
      consultationType: CONSULTATION_TYPE.VIDEO,
    }),
    Consultation.countDocuments({
      doctorId: id,
      medicines: { $exists: true, $not: { $size: 0 } },
    }),
    Consultation.countDocuments({
      doctorId: id,
      medicines: { $exists: true, $size: 0 },
    }),
    Consultation.countDocuments({
      doctorId: id,
    }),
  ]);

  // Get all months data for the current year
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const monthsData = await Promise.all(
    Array.from({ length: 12 }, async (_, month) => {
      const monthFirstDay = new Date(currentYear, month, 1);
      const monthLastDay = new Date(currentYear, month + 1, 0);

      const [regular, video, withMeds, withoutMeds, total] = await Promise.all([
        Consultation.countDocuments({
          doctorId: id,
          consultationType: CONSULTATION_TYPE.REGULAR,
          createdAt: { $gte: monthFirstDay, $lte: monthLastDay },
        }),
        Consultation.countDocuments({
          doctorId: id,
          consultationType: CONSULTATION_TYPE.VIDEO,
          createdAt: { $gte: monthFirstDay, $lte: monthLastDay },
        }),
        Consultation.countDocuments({
          doctorId: id,
          medicines: { $exists: true, $not: { $size: 0 } },
          createdAt: { $gte: monthFirstDay, $lte: monthLastDay },
        }),
        Consultation.countDocuments({
          doctorId: id,
          createdAt: { $gte: monthFirstDay, $lte: monthLastDay },
        }),
        Consultation.countDocuments({
          doctorId: id,
          createdAt: { $gte: monthFirstDay, $lte: monthLastDay },
        }),
      ]);

      return {
        month: monthNames[month],
        regular,
        video,
        withMeds,
        withoutMeds,
        total,
      };
    })
  );

  return {
    lifetime: {
      lifetimeRegularConsultation,
      lifetimeVideoConsultation,
      lifetimeConsultationWithMeds,
      lifetimeConsultationWithoutMeds,
      totalLifetimeConsultation,
    },
    monthlyBreakdown: monthsData,
  };
};
const getDoctorEarningStatusFromDB = async (id: string, year: number) => {
  const result = await getDoctorActivityStatusFromDB(id, year);
  return {
    lifetime: Object.fromEntries(
      Object.entries(result.lifetime).map(([key, value]) => [
        key,
        typeof value === 'number' ? value * 25 : value,
      ])
    ),
    monthlyBreakdown: result.monthlyBreakdown.map(month =>
      Object.fromEntries(
        Object.entries(month).map(([key, value]) => [
          key,
          typeof value === 'number' ? value * 25 : value,
        ])
      )
    ),
  };
};
const uploadFileToStripe = async (filePath: string): Promise<string> => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const fileExtension = path.extname(filePath).toLowerCase();

    let mimeType: string;
    switch (fileExtension) {
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg';
        break;
      case '.png':
        mimeType = 'image/png';
        break;
      case '.pdf':
        mimeType = 'application/pdf';
        break;
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }

    const file = await stripe.files.create({
      purpose: 'identity_document',
      file: {
        data: fileBuffer,
        name: fileName,
        type: mimeType,
      },
    });
    return file.id;
  } catch (error) {
    console.error('Error uploading file to Stripe:', error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to upload file to Stripe'
    );
  }
};
const setUpStripeConnectAccount = async (
  data: any,
  files: any,
  user: any,
  paths: any,
  ip: string
): Promise<string> => {
  const values = await JSON.parse(data);

  const isExistUser = await User.findOne({ email: user?.email });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  if (isExistUser.email !== user.email) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Email doesn't match");
  }

  const dob = new Date(values.dateOfBirth);

  // // Process KYC
  // const KYCFiles = files;
  // if (!KYCFiles || KYCFiles.length < 2) {
  //   throw new ApiError(StatusCodes.BAD_REQUEST, 'Two KYC files are required!');
  // }
  // const uploadsPath = path.join(__dirname, '../../../../../');

  // // File upload to Stripe
  // const frontFileId = await uploadFileToStripe(
  //   `${uploadsPath}/uploads/${paths[0]}`
  // );
  // const backFileId = await uploadFileToStripe(
  //   `${uploadsPath}/uploads/${paths[1]}`
  // );

  // Create token
  const token = await stripe.tokens.create({
    account: {
      individual: {
        dob: {
          day: dob.getDate(),
          month: dob.getMonth() + 1,
          year: dob.getFullYear(),
        },
        id_number: values.idNumber,
        first_name: values.name.split(' ')[0] || isExistUser.firstName,
        last_name: values.name.split(' ')[1] || isExistUser.lastName,
        email: user.email,
        phone: values.phoneNumber,
        address: {
          city: values.address.city,
          country: 'NL',
          line1: values.address.line1,
          state: values.address.state,
          postal_code: values.address.postal_code,
        },
        // ...(values.idNumber && { ssn_last_4: values.idNumber.slice(-4) }),
        // verification: {
        //   document: {
        //     front: frontFileId,
        //     back: backFileId,
        //   },
        // },
      },
      business_type: 'individual',
      tos_shown_and_accepted: true,
    },
  });

  // Create account
  const account = await stripe.accounts.create({
    type: 'custom',
    country: values.address.country,
    email: values.email || isExistUser.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_profile: {
      mcc: '5734',
      name: `${isExistUser.firstName}`,
      url: 'https://dokter-for-you.vercel.app',
    },
    external_account: {
      object: 'bank_account',
      account_number: values.bank_info.account_number,
      country: values.bank_info.country,
      currency: values.bank_info.currency,
      account_holder_name: values.bank_info.account_holder_name,
      account_holder_type: values.bank_info.account_holder_type,
      routing_number: values.bank_info.routing_number,
    },
    tos_acceptance: {
      date: Math.floor(Date.now() / 1000),
      ip: ip,
    },
  });

  // Update account with additional information
  await stripe.accounts.update(account.id, {
    account_token: token.id,
  });

  // Save to the DB
  if (account.id && account?.external_accounts?.data.length) {
    // Create update object with nested accountInformation
    const updateData = {
      accountInformation: {
        stripeAccountId: account.id,
        bankAccountNumber: values.bank_info.account_number,
        externalAccountId: account.external_accounts.data[0].id,
        status: 'active',
      },
    };

    // Update the user document with the new data
    await User.findByIdAndUpdate(user.id, { $set: updateData }, { new: true });
  }

  // Create account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    //@ts-ignore
    refresh_url: config.stripe_refresh_url || 'https://example.com/reauth',
    //@ts-ignore
    return_url: config.stripe_return_url || 'https://example.com/return',
    type: 'account_onboarding',
    collect: 'eventually_due',
  });

  return accountLink.url;
};
const getDoctorEarningsFromDB = async (user: string) => {
  const isExistUser = await User.findOne({ _id: user });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  const consultations = await Consultation.countDocuments({
    doctorId: user,
    status: STATUS.ACCEPTED,
  });
  const totalEarn = consultations * 25 * 0.15;
  const totalWithdrawn = await Consultation.countDocuments({
    doctorId: user,
    withrawn: true,
  });
  const balanceAvailable = totalEarn - totalWithdrawn * 25 * 0.15;
  return {
    totalEarn,
    totalWithdrawn,
    balanceAvailable,
  };
};

const getDoctorEarningHistory = async (user: string) => {
  const isExistUser = await User.findOne({ _id: user });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  const consultations = await Consultation.find({
    doctorId: user,
    status: { $in: [STATUS.ACCEPTED, STATUS.PROCESSING, STATUS.PRESCRIBED] },
  })
    .populate('userId')
    .populate('subCategory')
    .populate('category')
    .populate('doctorId');

  return consultations;
};

export const DoctorService = {
  getDoctorStatus,
  getDoctorActivityStatusFromDB,
  getDoctorEarningStatusFromDB,
  setUpStripeConnectAccount,
  getDoctorEarningsFromDB,
  getDoctorEarningHistory,
  uploadFileToStripe
};
