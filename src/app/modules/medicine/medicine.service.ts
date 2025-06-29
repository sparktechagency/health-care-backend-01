import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Medicine } from './medicine.model';
import { IMedicine } from './medicine.interface';
import { MedicineValidation } from './medicine.validation';
import unlinkFile from '../../../shared/unlinkFile';
import { Consultation } from '../consultation/consultation.model';
import mongoose from 'mongoose';

const createMedicine = async (payload: IMedicine): Promise<IMedicine> => {
  await MedicineValidation.createMedicineZodSchema.parseAsync(payload);
  const result = await Medicine.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create medicine!');
  }
  return result;
};
const getAllMedicines = async (
  queryFields: Record<string, any>
): Promise<IMedicine[]> => {
  const { search, page, limit } = queryFields;
  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { dosage: { $regex: search, $options: 'i' } },
          { country: { $regex: search, $options: 'i' } },
          { image: { $regex: search, $options: 'i' } },
          { unitPerBox: { $regex: search, $options: 'i' } },
          { medicineType: { $regex: search, $options: 'i' } },
          { form: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      }
    : {};
  let queryBuilder = Medicine.find(query);

  // if (page && limit) {
  //   queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  // } else {
  //   queryBuilder = queryBuilder.skip((1 - 1) * 10).limit(10);
  // }
  delete queryFields.search;
  delete queryFields.page;
  delete queryFields.limit;
  queryBuilder.find(queryFields).populate('subCategory');
  return await queryBuilder;
};

const getMedicineById = async (id: string): Promise<IMedicine | null> => {
  const result = await Medicine.findById(id).populate('subCategory');
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Medicine not found!');
  }
  return result;
};

// const updateMedicine = async (
//   id: string,
//   payload: IMedicine
// ): Promise<IMedicine | null> => {
//   await MedicineValidation.updateMedicineZodSchema.parseAsync(payload);
//   const isExistMedicine = await getMedicineById(id);
//   if (!isExistMedicine) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Medicine not found!');
//   }
//   if (
//     typeof isExistMedicine.image === 'string' &&
//     typeof payload.image === 'string'
//   ) {
//     await unlinkFile(isExistMedicine.image);
//   }
//   const result = await Medicine.findByIdAndUpdate(id, payload, { new: true });
//   if (!result) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update medicine!');
//   }
//   return result;
// };
const updateMedicine = async (
  id: string,
  payload: any 
  // payload:IMedicine
): Promise<IMedicine | null> => {
  const isExistMedicine = await getMedicineById(id);
  if (!isExistMedicine) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Medicine not found!');
  }

  // Handle image cleanup
  if (
    typeof isExistMedicine.image === 'string' &&
    typeof payload.image === 'string'
  ) {
    await unlinkFile(isExistMedicine.image);
  }

  // Parse JSON strings if needed (especially for multipart/form-data)
  if (typeof payload.variations === 'string') {
    try {
      payload.variations = JSON.parse(payload.variations);
    } catch (err) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid JSON in variations');
    }
  }

  // Validate after parsing
  await MedicineValidation.updateMedicineZodSchema.parseAsync(payload);

  const result = await Medicine.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update medicine!');
  }

  return result;
};

const deleteMedicine = async (id: string): Promise<IMedicine | null> => {
  const isExistMedicine = await getMedicineById(id);
  if (!isExistMedicine) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Medicine not found!');
  }

  if (typeof isExistMedicine.image === 'string') {
    await unlinkFile(isExistMedicine.image);
  }

  const result = await Medicine.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete medicine!');
  }
  return result;
};

export const getUserMedicinesService = async (userId: string) => {
  try {
    const consultations = await Consultation.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .select('selectedMedicines suggestedMedicine _id createdAt updatedAt')
      .populate({
        path: 'selectedMedicines.medicineId',
        select: 'name description price category brand manufacturer'
      })
      .populate({
        path: 'suggestedMedicine._id',
        select: 'name description price category brand manufacturer'
      })
      .lean();

    // Transform the data to make it more user-friendly
    const transformedData = consultations.map(consultation => ({
      consultationId: consultation._id,
      createdAt: consultation.createdAt,
      updatedAt: consultation.updatedAt,
      selectedMedicines: consultation.selectedMedicines?.map(med => ({
        medicine: med.medicineId,
        variationId: med.variationId,
        unitId: med.unitId,
        count: med.count,
        total: med.total
      })) || [],
      suggestedMedicines: consultation.suggestedMedicine?.map(med => ({
        medicine: med._id,
        dosage: med.dosage,
        count: med.count,
        total: med.total
      })) || []
    }));

    // Filter out consultations that have no medicines
    const consultationsWithMedicines = transformedData.filter(
      consultation => 
        consultation.selectedMedicines.length > 0 || 
        consultation.suggestedMedicines.length > 0
    );

    return {
      consultations: consultationsWithMedicines,
      totalConsultations: consultationsWithMedicines.length,
      summary: {
        totalSelectedMedicines: consultationsWithMedicines.reduce(
          (sum, consultation) => sum + consultation.selectedMedicines.length, 0
        ),
        totalSuggestedMedicines: consultationsWithMedicines.reduce(
          (sum, consultation) => sum + consultation.suggestedMedicines.length, 0
        )
      }
    };
    
  } catch (error) {
    console.error('Error in getUserMedicinesService:', error);
    throw new Error('Failed to fetch medicines for the user.');
  }
};

// Alternative simplified service if you just want the raw data
export const getUserMedicinesSimpleService = async (userId: string) => {
  try {
    const consultations = await Consultation.find({
      userId: new mongoose.Types.ObjectId(userId),
      $or: [
        { selectedMedicines: { $exists: true, $not: { $size: 0 } } },
        { suggestedMedicine: { $exists: true, $not: { $size: 0 } } }
      ]
    })
      .select('selectedMedicines suggestedMedicine')
      .populate('selectedMedicines.medicineId', 'name description price')
      .populate('suggestedMedicine._id', 'name description price')
      .lean();

    return consultations;
  } catch (error) {
    console.error('Error in getUserMedicinesSimpleService:', error);
    throw new Error('Failed to fetch medicines for the user.');
  }
};

export const MedicineService = {
  createMedicine,
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  getUserMedicinesService
};
