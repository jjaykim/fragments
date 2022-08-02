import { Request, Response } from 'express';

import { createSuccessResponse, createErrorResponse } from '../../response';
import { Fragment } from '../../model/fragment';
import logger from '../../logger';

/**
 * GET /fragments/:id/info
 * Allows the authenticated user to get (i.e., read) the metadata for one of their existing fragments with the specified id.
 * If no such fragment exists, returns an HTTP 404 with an appropriate error message.
 */

export const getByIdInfoFragments = async (req: Request, res: Response) => {
	try {
		logger.debug({ body: req.body }, 'GET /fragments/:id/info');
		logger.debug(`owner id and id: ${req.user}, ${req.params.id}`);

		// Get a fragment
		const fragment = await Fragment.byId(req.user as string, req.params.id);

		// If the id does not represent a known fragment, returns an HTTP 404 with an appropriate error message.
		if (!fragment) {
			return res.status(404).json(createErrorResponse(404, 'No fragment with this id'));
		}

		logger.debug({ fragment }, "Get fragment's info: ");

		// Response
		res.json(
			createSuccessResponse({
				fragment,
			})
		);
	} catch (err: any) {
		res.status(404).json(createErrorResponse(404, err.message));
	}
};
