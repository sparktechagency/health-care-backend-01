import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { ConsultationService } from './consultation.service';
import ApiError from '../../../errors/ApiError';


// const createConsultation = catchAsync(async (req: Request, res: Response) => {

//   const result = await ConsultationService.createConsultation(req.body, req.user?.id);
//   sendResponse(res, {
//     statusCode: StatusCodes.CREATED,
//     success: true,
//     message: 'Consultation created successfully',
//     data: result,
//   });
   
// });
const createConsultation = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
  }

  const result = await ConsultationService.createConsultation(req.body, userId);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Consultation created successfully',
    data: result,
  });
});


const createConsultationSuccess = catchAsync(
  async (req: Request, res: Response) => {
    const { session_id, id } = req.query;

    console.log("consultation id", id)
    if (!session_id || !id) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Session id and id are required'
      );
    }

    const result = await ConsultationService.createConsultationSuccess(
      session_id!.toString(),
      id!.toString(),
      res
    );
    return res.redirect('https://www.dokterforyou.com/profile?isSuccess=true');
  }
);
const getMyConsultations = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const query = req.query;
  const result = await ConsultationService.getMyConsultations(userId, query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Consultations fetched successfully',
    pagination: {
      limit: Number(query.limit) || 10,
      page: Number(query.page) || 1,
      total: result.length,
      totalPage: Math.ceil(result.length / (Number(query.limit) || 10)),
    },
    data: result,
  });
});
const updateConsultation = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (req.files && 'pdfFile' in req.files && req.files.pdfFile) {
    req.body.pdfFile = `uploads/pdfFiles/${req.files.pdfFile[0].filename}`;
  }
  const result = await ConsultationService.updateConsultation(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Consultation updated successfully',
    data: result,
  });
});
const prescribeMedicine = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ConsultationService.prescribeMedicine(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Medicine prescribed successfully',
    data: result,
  });
});

const getAllConsultations = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await ConsultationService.getAllConsultations(query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Consultations fetched successfully',
    pagination: {
      limit: Number(query.limit) || 10,
      page: Number(query.page) || 1,
      total: result.length,
      totalPage: Math.ceil(result.length / (Number(query.limit) || 10)),
    },
    data: result,
  });
});

const getConsultationByID = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ConsultationService.getConsultationByID(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Consultation fetched successfully',
    data: result,
  });
});
const refundMoney = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ConsultationService.refundByIDFromDB(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Consultation refunded successfully',
    data: result,
  });
});

const rejectConsultation = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { opinion } = req.body;
  const result = await ConsultationService.rejectConsultation(id, opinion);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Consultation rejected successfully',
    data: result,
  });
});

const scheduleConsultation = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await ConsultationService.scheduleConsultationToDB(
    req?.body,
    id
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Consultation scheduled successfully',
    data: result,
  });
});
const addLink = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await ConsultationService.addLinkToConsultation(req.body, id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Link added to consultation successfully',
    data: result,
  });
});
const withdrawDoctorMoney = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await ConsultationService.withdrawDoctorMoney(userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Money withdraw successfully',
    data: result,
  });
});
const buyMedicine = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { id } = req.params;
  const result = await ConsultationService.buyMedicine(userId, id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Medicine bought successfully',
    data: result,
  });
});
const buyMedicineSuccess = catchAsync(async (req: Request, res: Response) => {
  const { session_id, id } = req.query;
  const result = await ConsultationService.buyMedicineSuccess(
    session_id as string,
    id as string,
    res
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Medicine bought successfully',
    data: result,
  });
});
export const ConsultationController = {
  createConsultation,
  createConsultationSuccess,
  getMyConsultations,
  updateConsultation,
  prescribeMedicine,
  getAllConsultations,
  refundMoney,
  getConsultationByID,
  rejectConsultation,
  scheduleConsultation,
  addLink,
  withdrawDoctorMoney,
  buyMedicine,
  buyMedicineSuccess,
};
