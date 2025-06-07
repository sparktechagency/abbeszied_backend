import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { Chat } from './chat.model';
import mongoose from 'mongoose';
import { User } from '../user/user.models';

const createChatIntoDB = async (participants: string[]) => {
  const isExistChat = await Chat.findOne({
    participants: { $all: participants },
  });

  if (isExistChat) {
    return isExistChat;
  }
  const newChat = await Chat.create({
    participants: participants,
    lastMessage: null,
  });
  if (!newChat) {
    throw new Error('Failed to create chat');
  }

  //@ts-ignore
  const io = global.io;
  newChat.participants.forEach((participant) => {
    //@ts-ignore
    io.emit(`newChat::${participant._id}`, newChat);
  });
  return newChat;
};

const markChatAsRead = async (userId: string, chatId: string) => {
  return Chat.findByIdAndUpdate(
    chatId,
    { $addToSet: { readBy: userId } },
    { new: true },
  );
};

const getAllChatsFromDB = async (
  userId: string,
  query: Record<string, any>,
) => {
  const searchTerm = query.searchTerm?.toLowerCase();

  // First get all chats for the user
  const chats = await Chat.find({
    participants: { $in: [userId] },
    deletedBy: { $ne: userId },
  })
    .populate('lastMessage')
    .lean()
    .sort({ updatedAt: -1 });

  const unreadChat = await Chat.countDocuments({
    participants: userId,
    readBy: { $ne: userId },
  });

  const chatLists = await Promise.all(
    chats.map(async (chat) => {
      const otherParticipantIds = chat.participants.filter(
        (participantId) => participantId.toString() !== userId,
      );

      const otherParticipants = await User.find({
        _id: { $in: otherParticipantIds },
      })
        .select('_id image fullName email')
        .lean();

      const isRead = !!(
        Array.isArray(chat.readBy) &&
        chat.readBy.some((id: any) => id.toString() === userId)
      );

      return {
        ...chat,
        participants: otherParticipants,
        isRead,
      };
    }),
  );

  // Filter chats based on searchTerm if provided
  const filteredChatLists = searchTerm
    ? chatLists.filter((chat) => {
        // Check if any participant's userName matches the searchTerm
        return chat.participants.some((participant) =>
          participant.fullName.toLowerCase().includes(searchTerm),
        );
      })
    : chatLists;

  return {
    data: filteredChatLists,
    unreadChat,
  };
};
const softDeleteChatForUser = async (chatId: string, id: string) => {
  const userId = new mongoose.Types.ObjectId(id);
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new AppError(httpStatus.NOT_FOUND, 'Chat not found');
  }

  if (!chat.participants.some((id) => id.toString() === userId.toString())) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User is not authorized');
  }

  // If already deleted by this user, just return
  if (chat.deletedBy.some((id) => id.toString() === userId.toString())) {
    return chat;
  }

  // Add userId to deletedBy array
  chat.deletedBy.push(userId);

  // Optional: If all participants deleted, mark status deleted (soft delete for everyone)
  if (chat.deletedBy.length === chat.participants.length) {
    chat.isDeleted = true;
  }

  await chat.save();

  //@ts-ignore
  const io = global.io;
  chat.participants.forEach((participant) => {
    //@ts-ignore
    io.emit(`chatDeletedForUser::${participant._id}`, { chatId, userId });
  });

  return chat;
};

export const ChatService = {
  createChatIntoDB,
  getAllChatsFromDB,
  markChatAsRead,
  softDeleteChatForUser,
};
