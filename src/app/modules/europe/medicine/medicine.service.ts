import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import { Medicine } from './medicine.model';
import { IMedicine } from './medicine.interface';
import { MedicineValidation } from './medicine.validation';
import unlinkFile from '../../../../shared/unlinkFile';

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

const updateMedicine = async (
  id: string,
  payload: IMedicine
): Promise<IMedicine | null> => {
  await MedicineValidation.updateMedicineZodSchema.parseAsync(payload);
  const isExistMedicine = await getMedicineById(id);
  if (!isExistMedicine) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Medicine not found!');
  }
  if (
    typeof isExistMedicine.image === 'string' &&
    typeof payload.image === 'string'
  ) {
    await unlinkFile(isExistMedicine.image);
  }
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

export const MedicineService = {
  createMedicine,
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
};
