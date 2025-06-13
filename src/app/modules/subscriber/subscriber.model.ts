import { Schema, model } from 'mongoose';
  import { ISubscriber, SubscriberModel } from './subscriber.interface';
  
  const subscriberSchema = new Schema<ISubscriber, SubscriberModel>({
    email: { type: String, required: true }
  }, { timestamps: true });
  
  export const Subscriber = model<ISubscriber, SubscriberModel>('Subscriber', subscriberSchema);
