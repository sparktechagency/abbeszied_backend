
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { MessageService } from './message.service';

const sendMessage = catchAsync(async (req, res) => {
     const chatId: any = req.params.chatId;
     const { userId }: any = req.user;
     req.body.sender = userId;
     req.body.chatId = chatId;

     const message = await MessageService.sendMessageToDB(req.body);
     sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'Send Message Successfully',
          data: message,
     });
});

const getAllMessage = catchAsync(async (req, res) => {
     const messages = await MessageService.getMessagesFromDB(req.params.id, req.query);
     sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'Message Retrieve Successfully',
          data: messages.messages,
          meta: messages.pagination,
     });
});
const addReaction = catchAsync(async (req, res) => {
     const { userId }: any = req.user;
     const { messageId } = req.params;
     const { reactionType } = req.body;
     const messages = await MessageService.addReactionToMessage(userId, messageId, reactionType);
     sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'Reaction Added Successfully',
          data: messages,
     });
});
const deleteMessage = catchAsync(async (req, res) => {
     const { userId }: any = req.user;
     const { messageId } = req.params;
     const messages = await MessageService.deleteMessage(userId, messageId);
     sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'Delete Message Successfully',
          data: messages,
     });
});

export const MessageController = {
     sendMessage,
     getAllMessage,
     addReaction,
     deleteMessage,
};
