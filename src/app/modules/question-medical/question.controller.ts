import { Request, Response } from 'express';
    import catchAsync from '../../../shared/catchAsync';
    import sendResponse from '../../../shared/sendResponse';
    import { StatusCodes } from 'http-status-codes';
    import { QuestionService } from './question.service';

    const createQuestion = catchAsync(async (req: Request, res: Response) => {
      
      const result = await QuestionService.createQuestion(req.body);
      sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: 'Question created successfully',
        data: result,
      });
    });

    const getAllQuestions = catchAsync(async (req: Request, res: Response) => {
      const query = req.query;

      const result = await QuestionService.getAllQuestions(query);
      sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Questions fetched successfully',
        data: result,
      });
    });

    const getQuestionById = catchAsync(async (req: Request, res: Response) => {
      const result = await QuestionService.getQuestionById(req.params.id);
      sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Question fetched successfully',
        data: result,
      });
    });

    const updateQuestion = catchAsync(async (req: Request, res: Response) => {
    
      const result = await QuestionService.updateQuestion(req.params.id, req.body);
      sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Question updated successfully',
        data: result,
      });
    });

    const deleteQuestion = catchAsync(async (req: Request, res: Response) => {
      const result = await QuestionService.deleteQuestion(req.params.id);
      sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Question deleted successfully',
        data: result,
      });
    });

    export const QuestionController = {
      createQuestion,
      getAllQuestions,
      getQuestionById,
      updateQuestion,
      deleteQuestion,
    };
