import { StatusCodes } from 'http-status-codes';
  import ApiError from '../../../errors/ApiError';
  import { Subscriber } from './subscriber.model';
  import { ISubscriber } from './subscriber.interface';
  
  const createSubscriber = async (payload: ISubscriber): Promise<ISubscriber> => {
    
    const result = await Subscriber.create(payload);
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create subscriber!');
    }
    return result;
  };
  
  const getAllSubscribers = async (queryFields: Record<string, any>): Promise<ISubscriber[]> => {
  const { search, page, limit } = queryFields;
    const query = search ? { $or: [{ email: { $regex: search, $options: 'i' } }] } : {};
    let queryBuilder = Subscriber.find(query);
  
    if (page && limit) {
      queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
    }
    delete queryFields.search;
    delete queryFields.page;
    delete queryFields.limit;
    queryBuilder.find(queryFields);
    return await queryBuilder;
  };
  
  
  const getSubscriberById = async (id: string): Promise<ISubscriber | null> => {
    const result = await Subscriber.findById(id);
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Subscriber not found!');
    }
    return result;
  };
  
  const updateSubscriber = async (id: string, payload: ISubscriber): Promise<ISubscriber | null> => {
      
    const isExistSubscriber = await getSubscriberById(id);
    if (!isExistSubscriber) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Subscriber not found!');
    }
    
    const result = await Subscriber.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update subscriber!');
    }
    return result;
  };
  
  const deleteSubscriber = async (id: string): Promise<ISubscriber | null> => {
    const isExistSubscriber = await getSubscriberById(id);
    if (!isExistSubscriber) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Subscriber not found!');
    }
        
    const result = await Subscriber.findByIdAndDelete(id);
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete subscriber!');
    }
    return result;
  };
  
  export const SubscriberService = {
    createSubscriber,
    getAllSubscribers,
    getSubscriberById,
    updateSubscriber,
    deleteSubscriber,
  };
