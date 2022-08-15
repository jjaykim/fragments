import { Request, Response } from 'express';

import { createSuccessResponse, createErrorResponse } from '../../response';
import { Fragment } from '../../model/fragment';
import logger from '../../logger';

const apiURL = process.env.API_URL as string;

/**
 * POST /fragments
 * Creates a new fragment for the current (i.e., authenticated user)
 */
export const postFragments = async (req: Request, res: Response) => {
	const user = req.user as string;
	const data = req.body;
	const type: string = req.headers['content-type'] as string;

	logger.debug('==== POST /fragments ====');

	// Check the Content-Type is supported or not
	if (Fragment.isSupportedType(type)) {
		try {
			// Generate a new Fragment metadata record based on Request
			const fragment = new Fragment({ ownerId: user, type });

			// Store metadata and data
			await fragment.setData(data);

			logger.debug({ fragment }, '==== Successfully Created a new Fragment ====');

			// Set headers
			res.setHeader('Content-type', fragment.type);
			res.setHeader('Location', `${apiURL}/v1/fragments/${fragment.id}` as string);

			// Return successful response
			res.status(201).json(
				createSuccessResponse({
					fragment,
				})
			);
		} catch (err: any) {
			logger.error(err.message, 'Something went wrong...');
			res.status(500).json(createErrorResponse(401, err.message));
		}
	} else {
		logger.error(`${type} is not supported Content Type`);
		res.status(415).json(createErrorResponse(415, `${type} is not supported Content Type`));
	}
};
