import cors from 'cors';
import httpStatus from 'http-status';
// import { AllRoutes } from './app/routes';
import cookieParser from 'cookie-parser';
import notFound from './app/middleware/notFound';
import express, { Application, Request, Response } from 'express';
import globalErrorHandler from './app/middleware/globalErrorHandler';

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

// all routes => uncommend it after creating a module & add a route inside of the app -> routes -> index.ts
// app.use('/api', AllRoutes);
// global error handler
app.use(globalErrorHandler);
// not found
app.use(notFound);

export default app;
