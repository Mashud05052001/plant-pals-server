import cors from 'cors';
import httpStatus from 'http-status';
// import { AllRoutes } from './app/routes';
import cookieParser from 'cookie-parser';
import notFound from './app/middleware/notFound';
import express, { Application, Request, Response } from 'express';
import globalErrorHandler from './app/middleware/globalErrorHandler';
import { AllRoutes } from './app/routes';

const app: Application = express();

// parser
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: '🔥 Welcome to the PlantPals API',
  });
});

app.use('/api/v1', AllRoutes);
// global error handler
app.use(globalErrorHandler);
// not found
app.use(notFound);

export default app;
