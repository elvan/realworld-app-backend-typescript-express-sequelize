import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

// Initialize Express app
const app = express();

// Load environment variables
const API_PREFIX = process.env.API_PREFIX || '/api';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RealWorld Conduit API',
      version: '1.0.0',
      description: 'The RealWorld API implementation with Express and Sequelize',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8000}${API_PREFIX}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use(`${API_PREFIX}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use(API_PREFIX, routes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', message: 'Server is running' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    errors: {
      message: 'Not found',
    },
  });
});

// Global error handler
app.use(errorHandler);

export default app;
