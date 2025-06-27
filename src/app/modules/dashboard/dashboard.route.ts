import express from 'express';
import { DashboardController } from './dashboard.controller';
const router = express.Router();

router.get('/graph', DashboardController.getDashboardInfo);
router.get('/analysis', DashboardController.getDashboardStats);

export const DashboardRoutes = router;
