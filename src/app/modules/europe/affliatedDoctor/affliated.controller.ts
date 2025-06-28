import { Request, Response } from 'express';
import { AffiliatedDoctorService } from './affliated.service';
import fileUploadHandler from '../../../middlewares/fileUploadHandler';
import { IPaginationOptions } from '../../../../types/pagination';


export const AffiliatedDoctorController = {
  // Create a new affiliated doctor
 createDoctor : async (req: Request, res: Response): Promise<void> => {

    try {
        //form data upload
      fileUploadHandler()(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ success: false, message: err.message });
        }

        const { name, specialization } = req.body;
        let image: string | null = null;
        if (
          req.files &&
          typeof req.files === 'object' &&
          !Array.isArray(req.files) &&
          'image' in req.files &&
          Array.isArray((req.files as { [fieldname: string]: Express.Multer.File[] })['image'])
        ) {
          image = `/images/${(req.files as { [fieldname: string]: Express.Multer.File[] })['image'][0].filename}`;
        }

        if (!name || !specialization || !image) {
          return res.status(400).json({
            success: false,
            message: 'Name, specialization, and image are required fields',
          });
        }

        const newDoctor = await AffiliatedDoctorService.createDoctor({
          name,
          specialization,
          image,
        });


        res.status(201).json({
          success: true,
          message: 'Affiliated Doctor created successfully',
          data: newDoctor,
        });
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating affiliated doctor',
        errorMessages: error,
      });
    }
  },

  // Update an affiliated doctor
  updateDoctor: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
    fileUploadHandler()(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ success: false, message: err.message });
        }

        const { name, specialization } = req.body;
        let image: string | null = null;
        if (
          req.files &&
          typeof req.files === 'object' &&
          !Array.isArray(req.files) &&
          'image' in req.files &&
          Array.isArray((req.files as { [fieldname: string]: Express.Multer.File[] })['image'])
        ) {
          image = `/images/${(req.files as { [fieldname: string]: Express.Multer.File[] })['image'][0].filename}`;
        }

      const updatedDoctor = await AffiliatedDoctorService.updateDoctor(id, { name, specialization, image: image ?? "" });
      if (!updatedDoctor) {
        res.status(404).json({
          success: false,
          message: 'Affiliated Doctor not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Affiliated Doctor updated successfully',
        data: updatedDoctor,
      });
    });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating affiliated doctor',
        errorMessages: error,
      });
    }
  },

  // Get all affiliated doctors
getAllDoctors: async (req: Request, res: Response): Promise<void> => {
  try {
    const paginationOptions: IPaginationOptions = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      sortBy: req.query.sortBy as string,
      sortOrder: (req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc')
        ? req.query.sortOrder as 'asc' | 'desc'
        : undefined,
    };

    const result = await AffiliatedDoctorService.getAllDoctors(paginationOptions);

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching affiliated doctors',
      errorMessages: error,
    });
  }
},

  // Get an affiliated doctor by ID
  getDoctorById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const doctor = await AffiliatedDoctorService.getDoctorById(id);

      if (!doctor) {
        res.status(404).json({
          success: false,
          message: 'Affiliated Doctor not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: doctor,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching affiliated doctor by ID',
        errorMessages: error,
      });
    }
  },
    // Delete an affiliated doctor
    deleteDoctor: async (req: Request, res: Response): Promise<void> => {
      try {
        const { id } = req.params;
        const deletedDoctor = await AffiliatedDoctorService.deleteDoctor(id);
  
        if (!deletedDoctor) {
          res.status(404).json({
            success: false,
            message: 'Affiliated Doctor not found',
          });
          return;
        }
  
        res.status(200).json({
          success: true,
          message: 'Affiliated Doctor deleted successfully',
          data: deletedDoctor,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error deleting affiliated doctor',
          errorMessages: error,
        });
      }
    },
  // Update the active status of an affiliated doctor
  updateDoctorStatus: async (req: Request, res: Response): Promise<void> => { 
    try {
    const { id } = req.params;
    const { active } = req.body;
    const updatedDoctor = await AffiliatedDoctorService.updateDoctorStatus(id, active);
  
    if (!updatedDoctor) {
      res.status(404).json({
        success: false,
        message: 'Affiliated Doctor not found',
      });
      return;
    }
  
    res.status(200).json({
      success: true,
      message: 'Affiliated Doctor status updated successfully',
      data: updatedDoctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating affiliated doctor status',
      errorMessages: error,
    });
  }
  },
  // Get all active affiliated doctors
  getActiveDoctors: async (req: Request, res: Response): Promise<void> => {
    try {
      const activeDoctors = await AffiliatedDoctorService.getActiveDoctors();
      res.status(200).json({
        success: true,
        data: activeDoctors,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching active affiliated doctors',
        errorMessages: error,
      });
    }
  },
  // Get all inactive affiliated doctors  
  getInactiveDoctors: async (req: Request, res: Response): Promise<void> => {
    try {
      const inactiveDoctors = await AffiliatedDoctorService.getInactiveDoctors();
      res.status(200).json({
        success: true,
        data: inactiveDoctors,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching inactive affiliated doctors',
        errorMessages: error,
      });
    }
  }
};
