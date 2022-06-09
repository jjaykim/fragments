import { Request, Response } from 'express';

import { createSuccessResponse, createErrorResponse } from '../../response';
import { Fragment } from '../../model/fragment';
import logger from '../../logger';

/**
 * Gets an authenticated user's fragment data with the given ID
 */
export const getByIdFragments = async (req: Request, res: Response) => {
	logger.debug(`owner id and id: ${req.user}, ${req.params.id}`);

	try {
		const fragment = await Fragment.byId(req.user as string, req.params.id);

		const fragmentData = await fragment.getData();

		res.status(200).json(createSuccessResponse({ fragmentData: fragmentData.toString() }));
	} catch (err: any) {
		res.status(404).json(createErrorResponse(404, err.message));
	}
};
