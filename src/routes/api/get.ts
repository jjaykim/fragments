import { Request, Response } from 'express';

import { createSuccessResponse, createErrorResponse } from '../../response';
import { Fragment } from '../../model/fragment';
import logger from '../../logger';

/**
 * Get a list of fragments for the current user.
 * The response includes a fragments array of ids.
 * If `?expand=1`, expanded to include a full representations of the fragments' metadata (not just id).
 * If a user has no fragments, an empty array [] is returned.
 */
export const getFragments = async (req: Request, res: Response) => {
	try {
		logger.debug(`req.query: ${JSON.stringify(req.query)}`);

		// query check
		const expand = !!(req.query.expand && req.query.expand === '1');

		// Depending on expand, get all full fragments or just id
		const fragment = await Fragment.byUser(req.user as string, expand);

		// Response
		res.status(200).json(
			createSuccessResponse({
				fragments: fragment,
			})
		);
	} catch (err: any) {
		res.status(401).json(createErrorResponse(401, err.message));
	}
};
