import { Router } from 'express';
import { FAQController } from './faq.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

// Create a new FAQ
router.post(
  '/create',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  FAQController.createFAQ,
);

// Get all FAQs
router.get(
  '/',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  FAQController.getAllFAQs,
);

// Get active FAQs
router.get(
  '/active',
  auth(USER_ROLE.CLIENT, USER_ROLE.COACH, USER_ROLE.CORPORATE),
  FAQController.getActiveFAQs,
);

// Get a single FAQ by ID
router.get(
  '/:id',
  auth(
    USER_ROLE.ADMIN,
    USER_ROLE.SUPER_ADMIN,
    USER_ROLE.CLIENT,
    USER_ROLE.COACH,
    USER_ROLE.CORPORATE,
  ),
  FAQController.getFAQById,
);

// Update a FAQ
router.patch(
  '/:id',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  FAQController.updateFAQ,
);

// Delete a FAQ
router.delete(
  '/:id',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  FAQController.deleteFAQ,
);

export const FAQRoutes = router;
