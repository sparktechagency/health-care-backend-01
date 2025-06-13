import { Model, Types } from 'mongoose';

export type IInfo = {
  name: string;
  description: string;
};

export type InfoModel = Model<IInfo>;
