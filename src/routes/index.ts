import express, { Request, Response } from 'express';

import { version, author, repository } from '../../package.json'; // version and author from our package.json file
import { authenticate } from '../authorization';

import { apis } from './api/index';

// Create a router that we can use to mount our API
export const routes = express.Router();

// Define a simple health check route. If the server is running
// we'll respond with a 200 OK.  If not, the server isn't healthy.
routes.get('/', (req: Request, res: Response) => {
	// Clients shouldn't cache this response (always request it fresh)
	// See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#controlling_caching
	res.setHeader('Cache-Control', 'no-cache');

	// Send a 200 'OK' response with info about our repo
	res.status(200).json({
		status: 'ok',
		author,
		githubUrl: repository.url,
		version,
	});
});

/**
 * Expose all of our API routes on /v1/* to include an API version.
 */
routes.use(`/v1`, authenticate(), apis);
