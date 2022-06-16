import { Request, Response } from 'express';

import { createErrorResponse } from '../../response';
import { Fragment } from '../../model/fragment';
import logger from '../../logger';

/**
 * GET /fragments/:id
 * Gets an authenticated user's fragment data with the given id
 * The response includes fragment data.
 */
export const getByIdFragments = async (req: Request, res: Response) => {
	try {
		logger.debug(`owner id and id: ${req.user}, ${req.params.id}`);

		// Get a fragment
		const fragment = await Fragment.byId(req.user as string, req.params.id);

		// Get the fragment's data
		const fragmentData = await fragment.getData();

		logger.debug(`fragment Data:${fragmentData.toString()}`);

		// Response
		res.send(fragmentData.toString());
	} catch (err: any) {
		res.status(404).json(createErrorResponse(404, err.message));
	}
};
