import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import pino from 'pino-http';
import passport from 'passport';

import authorization from './authorization';
import { routes } from './routes/index';
import logger from './logger';

// Create an express app instance we can use to attach middleware and HTTP routes
const app = express();

// Use logging middleware
app.use(pino(logger)); // Use our default logger instance, which is already configured

// Use security middleware
app.use(helmet());

// Use CORS middleware so we can make requests across origins
app.use(cors());

// Use gzip/deflate compression middleware
app.use(compression());

// Set up our passport authorization middleware
passport.use(authorization().strategy);
app.use(passport.initialize());

// Define our routes
app.use('/', routes);

// Add 404 middleware to handle any requests for resources that can't be found
app.use((req: Request, res: Response) => {
	res.status(404).json({
		status: 'error',
		error: {
			message: 'not found',
			code: 404,
		},
	});
});

// Add error-handling middleware to deal with anything else
// eslint-disable-next-line no-unused-vars
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	// We may already have an error response we can use, but if not, use a generic
	// 500 server error and message.
	const status = err.status || 500;
	const message = err.message || 'unable to process request';

	// If this is a server error, log something so we can see what's going on.
	if (status > 499) {
		logger.error({ err }, `Error processing request`);
	}

	res.status(status).json({
		status: 'error',
		error: {
			message,
			code: status,
		},
	});
});

// Export our `app` so we can access it in server.js
export default app;
