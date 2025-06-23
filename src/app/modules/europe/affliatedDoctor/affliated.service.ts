import { AffiliatedDoctor } from './affliated.model';
import { IAffiliatedDoctor } from './affliated.interface';

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
  getAllDoctors: async () => {
    const doctors = await AffiliatedDoctor.find();
    return doctors;
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
