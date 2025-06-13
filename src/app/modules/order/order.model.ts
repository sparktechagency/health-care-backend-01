import { Schema, model } from 'mongoose';
import { IOrder, OrderModel } from './order.interface';

const orderSchema = new Schema<IOrder, OrderModel>(
  {
    trackingNo: { type: String, required: false },
    company: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: false },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    orderDate: { type: Date, required: false },
    price: { type: Number, required: false },
    status: { type: String, required: false },
    zipCode: { type: String, required: false },
  },
  { timestamps: true }
);

export const Order = model<IOrder, OrderModel>('Order', orderSchema);
