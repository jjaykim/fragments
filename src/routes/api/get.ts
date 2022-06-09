import { Request, Response } from 'express';

import { createSuccessResponse, createErrorResponse } from '../../response';
import { Fragment } from '../../model/fragment';
import logger from '../../logger';

/**
 * Get a list of fragments for the current user
 */
export const getFragments = async (req: Request, res: Response) => {
	try {
		logger.debug(`req.query: ${JSON.stringify(req.query)}`);

		const expand = !!(req.query.expand && req.query.expand === '1');

		const fragment = await Fragment.byUser(req.user as string, expand);

		res.status(200).json(
			createSuccessResponse({
				fragments: fragment,
			})
		);
	} catch (err: any) {
		res.status(401).json(createErrorResponse(401, err.message));
	}
};
