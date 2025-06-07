import { Router } from 'express';
import { ChatController } from './chat.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();
router.get('/', auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.CLIENT, USER_ROLE.COACH), ChatController.getChats);
router.post(
     '/create-chat',
     auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.CLIENT, USER_ROLE.COACH),
     ChatController.createChat,
);
router.patch(
     '/mark-chat-as-read/:id',
     auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.CLIENT, USER_ROLE.COACH),
     ChatController.markChatAsRead,
);
router.delete(
     '/delete/:chatId',
     auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.CLIENT, USER_ROLE.COACH),
     ChatController.deleteChat,
);
export const chatRoutes = router;
