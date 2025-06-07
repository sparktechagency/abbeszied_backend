
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ChatService } from './chat.service';


const createChat = catchAsync(async (req, res) => {
     const participant = req.body.participant;
     const { userId }: any = req.user;
     const participants = [userId, participant];
     const result = await ChatService.createChatIntoDB(participants);

     sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'Chat created successfully',
          data: result,
     });
});

const markChatAsRead = catchAsync(async (req, res) => {
     const { id } = req.params;
     const user: any = req?.user;

     const result = await ChatService.markChatAsRead(user.id, id);
     sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'Chat marked as read',
          data: result,
     });
});
const getChats = catchAsync(async (req, res) => {
     const { userId }: any = req.user;

     const result = await ChatService.getAllChatsFromDB(userId, req.query);
     sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'Chats retrieved successfully',
          data: result,
     });
});
const deleteChat = catchAsync(async (req, res) => {
     const { userId }: any = req.user;
     const { chatId } = req.params;
     const result = await ChatService.softDeleteChatForUser(chatId, userId);
     sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'Chats deleted successfully',
          data: result,
     });
});

export const ChatController = {
     createChat,
     getChats,
     markChatAsRead,
     deleteChat,
};
