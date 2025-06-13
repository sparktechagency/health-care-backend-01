import { Request, Response } from 'express';
    import catchAsync from '../../../shared/catchAsync';
    import sendResponse from '../../../shared/sendResponse';
    import { StatusCodes } from 'http-status-codes';
    import { AboutService } from './about.service';

    const createAbout = catchAsync(async (req: Request, res: Response) => {
      
      if (req.files && 'image' in req.files && req.files.image[0]) {
        req.body.image = '/images/' + req.files.image[0].filename;
      }
    
      const result = await AboutService.createAbout(req.body);
      sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: 'About created successfully',
        data: result,
      });
    });

    const getAllAbouts = catchAsync(async (req: Request, res: Response) => {
      const query = req.query;

      const result = await AboutService.getAllAbouts(query);
      sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Abouts fetched successfully',
        data: result,
      });
    });

    const getAboutById = catchAsync(async (req: Request, res: Response) => {
      const result = await AboutService.getAboutById(req.params.id);
      sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'About fetched successfully',
        data: result,
      });
    });

    const updateAbout = catchAsync(async (req: Request, res: Response) => {
    
      if (req.files && 'image' in req.files && req.files.image[0]) {
        req.body.image = '/images/' + req.files.image[0].filename;
      }
    
      const result = await AboutService.updateAbout(req.params.id, req.body);
      sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'About updated successfully',
        data: result,
      });
    });

    const deleteAbout = catchAsync(async (req: Request, res: Response) => {
      const result = await AboutService.deleteAbout(req.params.id);
      sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'About deleted successfully',
        data: result,
      });
    });

    export const AboutController = {
      createAbout,
      getAllAbouts,
      getAboutById,
      updateAbout,
      deleteAbout,
    };
