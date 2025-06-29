import { Model } from 'mongoose';
import ApiError from '../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { User } from '../app/modules/user/user.model';
import { Consultation } from '../app/modules/consultation/consultation.model';
import { STATUS } from '../enums/consultation';
import { USER_ROLES } from '../enums/user';
import { Medicine } from '../app/modules/medicine/medicine.model';

const getAllDataFromDB = async (query: any, model: Model<any>) => {
  const {
    search = '',
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    ...filtersData
  } = query;

  const andConditions: any = [];

  if (search) {
    andConditions.push({
      $or: [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    });
  }

  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const whereConditions =
    andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

  const data = await model
    .find(whereConditions)
    .populate('subCategory')
    .sort({ [sortBy]: sortOrder })
    // .skip((Number(page) - 1) * Number(limit))
    // .limit(Number(limit))
    .select('-password');

  const totalPages = Math.ceil(
    (await model.countDocuments(whereConditions)) / Number(limit)
  );

  return {
    data,
    totalPages,
  };
};
const getSingleDataFromDB = async (id: string, model: Model<any>) => {
  const result = await model.findById(id);
  if (!result) throw new Error('Data not found');
  return result;
};
const deleteDataByIDFromDB = async (id: string, Model: Model<any>) => {
  const isExistData = await Model.findById(id);
  if (!isExistData) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Data not found');
  }
  const deletedData = await Model.findByIdAndDelete(id);
  if (!deletedData) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Data not found');
  }
  return deletedData;
};
const addDataToDB = async (data: any, model: Model<any>) => {
  const result = await model.create(data);

  return result;
};

const getWebsiteStatus = async () => {
  const currentDate = new Date();

  const totalUsers = await User.countDocuments();

  const [
    totalPendingConsultation,
    totalFinishedConsultation,
    totalConsultationPharmecy,
    totalConsultationPharmecyAccepted,
  ] = await Promise.all([
    Consultation.countDocuments({ status: STATUS.PENDING }),
    Consultation.countDocuments({ status: STATUS.ACCEPTED }),
    Consultation.countDocuments({ medicins: { $exists: true, $ne: [] } }),
    Consultation.countDocuments({
      medicins: { $exists: true, $ne: [] },
      pharmecyAccepted: true,
    }),
  ]);
  const dailyConsultations = await Consultation.countDocuments({
    status: { $ne: STATUS.DRAFT },
    createdAt: {
      $gte: new Date(currentDate.setHours(0, 0, 0, 0)),
      $lt: new Date(currentDate.setHours(23, 59, 59, 999)),
    },
  });
  const dailyUsers = await User.countDocuments({
    role: USER_ROLES.USER,
    createdAt: {
      $gte: new Date(currentDate.setHours(0, 0, 0, 0)),
      $lt: new Date(currentDate.setHours(23, 59, 59, 999)),
    },
  });

  return {
    totalUsers,
    dailyUsers,
    totalEarnings: {
      total: (totalPendingConsultation + totalFinishedConsultation) * 25,
      daily: dailyConsultations * 25,
    },
    workload: {
      pending: totalPendingConsultation,
      finished: totalFinishedConsultation,
    },
    workActivity: {
      consult: totalConsultationPharmecy,
      pharmecy: totalConsultationPharmecyAccepted,
    },
  };
};
const getMonthlyEarnings = async (year: number) => {
  const monthlyConsultations = await Consultation.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01T00:00:00.000Z`),
          $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        totalConsultations: { $sum: 1 },
      },
    },
    {
      $project: {
        month: '$_id',
        totalConsultations: { $multiply: ['$totalConsultations', 25] },
        _id: 0,
      },
    },
    {
      $sort: { month: 1 },
    },
  ]);

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

  // Create an array with all months
  const allMonths = Array.from({ length: 12 }, (_, i) => ({
    month: monthNames[i],
    totalConsultations: 0,
  }));

  // Merge actual data with empty months
  const result = allMonths.map((emptyMonth, index) => {
    const actualMonth = monthlyConsultations.find(m => m.month === index + 1);
    return {
      month: emptyMonth.month,
      totalEarnings: actualMonth ? actualMonth.totalConsultations : 0,
    };
  });

  return result;
};
const getMonthlyUserCount = async (year: Number) => {
  const currentYear = Number(year) || new Date().getFullYear();
  const monthlyUsers = await User.aggregate([
    {
      $match: {
        role: 'USER',
        createdAt: {
          $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          $lt: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        month: '$_id',
        count: 1,
        _id: 0,
      },
    },
    {
      $sort: { month: 1 },
    },
  ]);

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
  const result = monthNames.map((month, index) => ({
    month,
    count: monthlyUsers.find(m => m.month === index + 1)?.count || 0,
  }));

  return result;
};
const getMonthlyWorkLoad = async (year: number) => {
  const monthlyWorkload = await Consultation.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01T00:00:00.000Z`),
          $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
        },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          status: '$status',
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        month: '$_id.month',
        status: '$_id.status',
        count: 1,
        _id: 0,
      },
    },
    {
      $sort: { month: 1 },
    },
  ]);

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

  return monthNames.map(month => ({
    month,
    pending:
      monthlyWorkload.find(
        m =>
          m.month === monthNames.indexOf(month) + 1 &&
          m.status === STATUS.PENDING
      )?.count || 0,
    accepted:
      monthlyWorkload.find(
        m =>
          m.month === monthNames.indexOf(month) + 1 &&
          m.status === STATUS.ACCEPTED
      )?.count || 0,
  }));
};
export const assignDoctorByWorkload = async (doctors: any[]): Promise<string> => {
  // Get consultation counts for each doctor
  const doctorConsultationCounts = await Promise.all(
    doctors.map(async (doctor) => {
      const consultationCount = await Consultation.countDocuments({
        doctorId: doctor._id,
        status: { 
          $in: [
            STATUS.PENDING, 
            STATUS.PROCESSING, 
            STATUS.ACCEPTED
          ] 
        }, // Count only active consultations
      });
      
      // Get total consultations for additional balancing
      const totalConsultations = await Consultation.countDocuments({
        doctorId: doctor._id
      });
      
      // Get consultations created today for even more granular balancing
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayConsultations = await Consultation.countDocuments({
        doctorId: doctor._id,
        createdAt: { $gte: today, $lt: tomorrow }
      });
      
      return {
        doctorId: doctor._id.toString(),
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        country: doctor.country,
        consultationCount,
        totalConsultations,
        todayConsultations,
        // Create a weighted score for better load balancing
        loadScore: (consultationCount * 3) + (todayConsultations * 2) + (totalConsultations * 0.1),
      };
    })
  );

  // Log all doctor loads for debugging
  console.log('Doctor workload analysis:');
  doctorConsultationCounts.forEach(doctor => {
    console.log(`${doctor.doctorName}: Active=${doctor.consultationCount}, Today=${doctor.todayConsultations}, Total=${doctor.totalConsultations}, Score=${doctor.loadScore}`);
  });

  // Sort doctors by load score (ascending - least busy first)
  // If scores are equal, sort by doctorId to ensure consistent ordering
  doctorConsultationCounts.sort((a, b) => {
    if (a.loadScore !== b.loadScore) {
      return a.loadScore - b.loadScore;
    }
    // Secondary sort by doctorId for consistency when scores are equal
    return a.doctorId.localeCompare(b.doctorId);
  });

  // If multiple doctors have the same lowest score, use round-robin approach
  const lowestScore = doctorConsultationCounts[0].loadScore;
  const doctorsWithLowestScore = doctorConsultationCounts.filter(d => d.loadScore === lowestScore);
  
  let selectedDoctor;
  
  if (doctorsWithLowestScore.length > 1) {
    // Use round-robin based on current timestamp for equal-load doctors
    const roundRobinIndex = Math.floor(Date.now() / 1000) % doctorsWithLowestScore.length;
    selectedDoctor = doctorsWithLowestScore[roundRobinIndex];
    console.log(`Multiple doctors with same load (${lowestScore}), using round-robin selection (${roundRobinIndex})`);
  } else {
    selectedDoctor = doctorConsultationCounts[0];
  }
  
  console.log(`Doctor assigned: ${selectedDoctor.doctorName} from ${selectedDoctor.country} (Active=${selectedDoctor.consultationCount}, Score=${selectedDoctor.loadScore})`);
  
  return selectedDoctor.doctorId;
};
const verifyConsultationData = async (consultationId: string) => {
  try {
    // Get consultation
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      console.log('❌ Consultation not found');
      return false;
    }

    console.log('✅ Consultation found');
    console.log('Suggested medicines count:', consultation.suggestedMedicine?.length || 0);

    if (!consultation.suggestedMedicine || consultation.suggestedMedicine.length === 0) {
      console.log('❌ No suggested medicines in consultation');
      return false;
    }

    // Check each suggested medicine
    for (let i = 0; i < consultation.suggestedMedicine.length; i++) {
      const med = consultation.suggestedMedicine[i];
      console.log(`\n--- Checking medicine ${i + 1} ---`);
      console.log('Medicine object:', JSON.stringify(med, null, 2));

      const medicineId = med._id;
      if (!medicineId) {
        console.log('❌ No medicine ID found');
        continue;
      }

      // Check if medicine exists
      const medicine = await Medicine.findById(medicineId);
      if (!medicine) {
        console.log(`❌ Medicine not found in database with ID: ${medicineId}`);
        continue;
      }

      console.log('✅ Medicine found:', medicine.name);
      console.log('Medicine details:');
      console.log('- sellingPrice:', medicine.get('sellingPrice'));
      console.log('- unitPerBox:', medicine.get('unitPerBox'));
      console.log('- Available fields:', Object.keys(medicine.toObject()));

      // Check medication count
      console.log('Medication count:', med.count);
      console.log('Medication total field:', med.total);
    }

    return true;
  } catch (error) {
    console.error('Error verifying data:', error);
    return false;
  }
};


export const HelperService = {
  getAllDataFromDB,
  getSingleDataFromDB,
  deleteDataByIDFromDB,
  addDataToDB,
  getWebsiteStatus,
  getMonthlyEarnings,
  getMonthlyUserCount,
  getMonthlyWorkLoad,
  assignDoctorByWorkload,
  verifyConsultationData
};
