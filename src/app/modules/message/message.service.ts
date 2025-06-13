import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IMessage } from './message.interface';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import config from '../../../config';
const createMessage = async (
  payload: IMessage
): Promise<{ message: string }> => {
  try {
    const messageTemplate = emailTemplate.sendMessage(payload);
    await emailHelper.sendEmail({
      to: config.email.user!,
      subject: 'New Message',
      html: messageTemplate.html,
    });
    return { message: 'Message sent successfully' };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to send message'
    );
  }
};

export const MessageService = {
  createMessage,
};
