import { AffiliatedDoctor } from './affliated.model';
import { IAffiliatedDoctor } from './affliated.interface';
import { IPaginationOptions } from '../../../../types/pagination';
import { paginationHelper } from '../../../../helpers/paginationHelper';

export const AffiliatedDoctorService = {
  // Create a new affiliated doctor
  createDoctor: async (doctorData: IAffiliatedDoctor) => {
    const newDoctor = new AffiliatedDoctor(doctorData);
    await newDoctor.save();
    return newDoctor;
  },

  // Update an affiliated doctor by ID
  updateDoctor: async (id: string, doctorData: IAffiliatedDoctor) => {
    const updatedDoctor = await AffiliatedDoctor.findByIdAndUpdate(id, doctorData, { new: true });
    return updatedDoctor;
  },

  // Get all affiliated doctors
getAllDoctors: async (options: IPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

  const sortCondition: { [key: string]: 1 | -1 } = {};
  sortCondition[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const doctors = await AffiliatedDoctor.find()
    .sort(sortCondition)
    .skip(skip)
    .limit(limit);

  const total = await AffiliatedDoctor.countDocuments();

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: doctors,
  };
},

  // Get a single affiliated doctor by ID
  getDoctorById: async (id: string) => {
    const doctor = await AffiliatedDoctor.findById(id);
    return doctor;
  },
    // Delete an affiliated doctor by ID
  deleteDoctor: async (id: string) => {
    const deletedDoctor = await AffiliatedDoctor.findByIdAndDelete(id);
    return deletedDoctor;
  },
  //update the active status of an affiliated doctor
  updateDoctorStatus: async (id: string, active: boolean) => {
    const updatedDoctor = await AffiliatedDoctor.findByIdAndUpdate(id, { active }, { new: true });
    return updatedDoctor;
  },
  // Get all active affiliated doctors
  getActiveDoctors: async () => {
    const activeDoctors = await AffiliatedDoctor.find({ active: true });
    return activeDoctors;
  },
  // Get all inactive affiliated doctors
  getInactiveDoctors: async () => {
    const inactiveDoctors = await AffiliatedDoctor.find({ active: false });
    return inactiveDoctors;
  }
};
