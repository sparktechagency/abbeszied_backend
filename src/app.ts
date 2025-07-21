/* app.ts */
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import path from 'path';
import handleStripeWebhook from './app/helpers/stripe/handleStripeWebhook'; 
// Import your other middleware & routers if needed
import globalErrorHandler from './app/middleware/globalErrorhandler';
import notFound from './app/middleware/notfound';
import router from './app/routes';
import { welcome } from './app/utils/welcome';

const app: Application = express();

// View engine setup (optional)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Stripe webhook endpoint: use express.raw to get raw body required for Stripe signature verification
app.post(
  '/api/v1/stripe/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook,
);

// Serve static files from 'public'
app.use(express.static('public'));

// Middleware for parsing urlencoded and JSON bodies (non-webhook routes)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Cookie parser and CORS setup
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
    // methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  }),
);

// Your API routes
app.use('/api/v1', router);

// Basic route for testing
app.get('/', (req: Request, res: Response) => {
   res.send(welcome());
});

// Error handling middleware
app.use(globalErrorHandler);
app.use(notFound);

export default app;
