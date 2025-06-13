import { Model, Types } from 'mongoose';
  
  export type ISubscriber = {
    email: string
  };
  
  export type SubscriberModel = Model<ISubscriber>;
