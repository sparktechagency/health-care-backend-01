import { Request, Response } from 'express';
import { AffiliatedDoctorService } from './affliated.service';
import fileUploadHandler from '../../../middlewares/fileUploadHandler';


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
          image = `/uploads/images/${(req.files as { [fieldname: string]: Express.Multer.File[] })['image'][0].filename}`;
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
          image = `/uploads/images/${(req.files as { [fieldname: string]: Express.Multer.File[] })['image'][0].filename}`;
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
      const doctors = await AffiliatedDoctorService.getAllDoctors();
      res.status(200).json({
        success: true,
        data: doctors,
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
};
