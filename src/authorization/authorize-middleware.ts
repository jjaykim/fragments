import { NextFunction, Request, Response } from 'express';
import passport from 'passport';

import { createErrorResponse } from '../response';
import { hash } from '../hash';
import logger from '../logger';

/**
 * @param {'bearer' | 'http'} strategyName - the passport strategy to use
 * @returns {Function} - the middleware function to use for authentication
 */
export const authorize = (strategyName: string): Function => {
	return function (req: Request, res: Response, next: NextFunction) {
		/**
		 * Define a custom callback to run after the user has been authenticated
		 * where we can modify the way that errors are handled, and hash emails.
		 * @param {Error} err - an error object
		 * @param {string} email - an authenticated user's email address
		 */
		function callback(err: string, email: string) {
			// Something failed, let the the error handling middleware deal with it
			if (err) {
				logger.warn({ err }, 'error authenticating user');
				return next(createErrorResponse(500, 'Unable to authenticate user'));
			}

			// Not authorized, return a 401
			if (!email) {
				return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
			}

			// Authorized. Hash the user's email, attach to the request, and continue
			req.user = hash(email);
			logger.debug({ email, hash: req.user }, 'Authenticated user');
			return next();
		}

		// Call the given passport strategy's authenticate() method, passing the
		// req, res, next objects.  Invoke our custom callback when done.
		passport.authenticate(strategyName, { session: false }, callback)(req, res, next);
	};
};
