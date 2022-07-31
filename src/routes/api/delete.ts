/**
 * Allows the authenticated user to delete one of their existing fragments with the given id.
 */
import { Request, Response } from 'express';

import { createSuccessResponse, createErrorResponse } from '../../response';
import logger from '../../logger';
import { Fragment } from '../../model/fragment';

export const deleteFragments = async (req: Request, res: Response) => {
	try {
		const fragmentID = req.params.id;
		logger.debug(`owner id: ${req.user} and fragment id:  ${fragmentID}`);

		const fragment = await Fragment.byId(req.user as string, fragmentID);

		// If the id is not found, returns an HTTP 404 with an appropriate error message.
		if (!fragment) {
			return res.status(404).json(createErrorResponse(404, 'Id not found'));
		}

		await Fragment.delete(req.user as string, fragmentID);

		// Once the fragment is deleted, an HTTP 200 is returned, along with the ok status:
		res.status(200).json(createSuccessResponse());
	} catch (err: any) {
		res.status(500).json(createErrorResponse(500, err.message));
	}
};
