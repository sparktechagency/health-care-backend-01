import { StatusCodes } from 'http-status-codes';
  import ApiError from '../../../errors/ApiError';
  import { About } from './about.model';
  import { IAbout } from './about.interface';
  import { AboutValidation } from './about.validation';
    import unlinkFile from '../../../shared/unlinkFile';
    
  const createAbout = async (payload: IAbout): Promise<IAbout> => {
    await AboutValidation.createAboutZodSchema.parseAsync(payload);
    const result = await About.create(payload);
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create about!');
    }
    return result;
  };
  
  const getAllAbouts = async (queryFields: Record<string, any>): Promise<IAbout[]> => {
  const { search, page, limit } = queryFields;
    const query = search ? { $or: [{ title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { image: { $regex: search, $options: 'i' } }] } : {};
    let queryBuilder = About.find(query);
  
    if (page && limit) {
      queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
    }
    delete queryFields.search;
    delete queryFields.page;
    delete queryFields.limit;
    queryBuilder.find(queryFields);
    return await queryBuilder;
  };
  
  
  const getAboutById = async (id: string): Promise<IAbout | null> => {
    const result = await About.findById(id);
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'About not found!');
    }
    return result;
  };
  
  const updateAbout = async (id: string, payload: IAbout): Promise<IAbout | null> => {
      await AboutValidation.updateAboutZodSchema.parseAsync(payload);
    const isExistAbout = await getAboutById(id);
    if (!isExistAbout) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'About not found!');
    }
    if (typeof isExistAbout.image === 'string' && typeof payload.image === 'string') {
          await unlinkFile(isExistAbout.image);
        }
    const result = await About.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update about!');
    }
    return result;
  };
  
  const deleteAbout = async (id: string): Promise<IAbout | null> => {
    const isExistAbout = await getAboutById(id);
    if (!isExistAbout) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'About not found!');
    }
        
          if (typeof isExistAbout.image === 'string') {
           await unlinkFile(isExistAbout.image);
         }
         
    const result = await About.findByIdAndDelete(id);
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete about!');
    }
    return result;
  };
  
  export const AboutService = {
    createAbout,
    getAllAbouts,
    getAboutById,
    updateAbout,
    deleteAbout,
  };
