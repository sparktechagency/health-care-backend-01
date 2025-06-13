import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { OrderService } from './order.service';
import { Order } from './order.model';
import XLSX from 'xlsx';
import ApiError from '../../../errors/ApiError';
import { IOrder } from './order.interface';
const createOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.createOrder(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Order created successfully',
    data: result,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await OrderService.getAllOrders(query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Orders fetched successfully',
    data: result,
  });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getOrderById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Order fetched successfully',
    data: result,
  });
});

const updateOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.updateOrder(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Order updated successfully',
    data: result,
  });
});

const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.deleteOrder(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Order deleted successfully',
    data: result,
  });
});
const importOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.importOrders(req, res);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Orders imported successfully',
    data: result,
  });
});

const exportOrders = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const orders = await Order.find(
      {},
      {
        trackingNo: 1,
        company: 1,
        country: 1,
        name: 1,
        email: 1,
        phone: 1,
        address: 1,
        city: 1,
        zipCode: 1,
        price: 1,
        _id: 0,
      }
    ).lean();
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(orders);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });
    const filename = `orders_${new Date().toISOString()}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(buffer);
  }
);
export const OrderController = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  importOrders,
  exportOrders,
};
