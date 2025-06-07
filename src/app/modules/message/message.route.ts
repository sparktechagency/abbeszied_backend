import express from 'express';
import { MessageController } from './message.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import fileUpload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
const upload = fileUpload('./public/uploads/images');

const router = express.Router();

router.post(
  '/send-message/:chatId',
  auth(
    USER_ROLE.CLIENT,
    USER_ROLE.COACH,
    USER_ROLE.SUPER_ADMIN,
    USER_ROLE.ADMIN,
  ),
  upload.fields([{ name: 'images', maxCount: 5 }]),
  parseData(),
  MessageController.sendMessage,
);
router.get(
  '/:id',
  auth(
     USER_ROLE.CLIENT,
     USER_ROLE.COACH,
     USER_ROLE.SUPER_ADMIN,
     USER_ROLE.ADMIN,
   ),
  MessageController.getAllMessage,
);
router.post(
  '/react/:messageId',
  auth(
     USER_ROLE.CLIENT,
     USER_ROLE.COACH,
     USER_ROLE.SUPER_ADMIN,
     USER_ROLE.ADMIN,
   ),
  MessageController.addReaction,
);
router.delete(
  '/delete/:messageId',
  auth(
     USER_ROLE.CLIENT,
     USER_ROLE.COACH,
     USER_ROLE.SUPER_ADMIN,
     USER_ROLE.ADMIN,
   ),
  MessageController.deleteMessage,
);

export const messageRoutes = router;
