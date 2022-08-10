import path from 'path';

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
		const fragmentID = req.params.id.split('.')[0];

		logger.debug({ body: req.body }, '==== GET /fragments/:id ====');
		logger.debug(`owner id: ${req.user} and fragment id with ext: ${req.params.id}`);

		// Get a fragment
		const fragmentById = await Fragment.byId(req.user as string, fragmentID);

		// If the id does not represent a known fragment, returns an HTTP 404 with an appropriate error message.
		if (!fragmentById) {
			return res.status(404).json(createErrorResponse(404, 'No fragment with this id'));
		}

		// Get the fragment's data
		const fragmentData = await fragmentById.getData();

		// Conversions Extensions
		const conversionExtension = path.extname(req.params.id);

		// check convert is valid
		if (conversionExtension) {
			logger.debug(`Convert Type: ${conversionExtension}`);
			// converting other formats to plain text means only mimeType change, we don't need data change
			const { convertedResult, convertedType } = await fragmentById.convertType(
				fragmentData,
				conversionExtension
			);

			// If the extension used represents an unknown or unsupported type, or if the fragment cannot be converted to this type,
			// an HTTP 415 error is returned instead, with an appropriate message. For example, a plain text fragment cannot be returned as a PNG.
			if (!convertedResult) {
				return res
					.status(415)
					.json(
						createErrorResponse(
							415,
							`Fragment extension is not unsupported type OR cannot be converted to ${conversionExtension}`
						)
					);
			}

			res.set('Content-Type', convertedType);
			res.status(200).send(convertedResult);
		}
		// Send the raw Buffer
		else {
			logger.debug(`fragment type in get id: ${fragmentById.type}`);

			// Set headers
			res.setHeader('Content-type', fragmentById.type);

			// Response
			res.status(200).send(fragmentData);
		}
	} catch (err: any) {
		logger.debug(`GET /fragments/:id ERROR /n ${err}`);
		res.status(500).json(createErrorResponse(500, err.message));
	}
};
