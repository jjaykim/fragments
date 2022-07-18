import { Request, Response } from 'express';
import mime from 'mime-types';
import MarkdownIt from 'markdown-it';

import { createErrorResponse } from '../../response';
import { Fragment } from '../../model/fragment';
import logger from '../../logger';

/**
 * GET /fragments/:id
 * Gets an authenticated user's fragment data with the given id
 * The response includes fragment data.
 */
// eslint-disable-next-line consistent-return
export const getByIdFragments = async (req: Request, res: Response) => {
	try {
		const fragmentID = req.params.id.split('.')[0];
		const ext = req.params.id.split('.')[1];

		logger.debug(`owner id: ${req.user} and fragment id:  ${fragmentID}`);

		// Get a fragment
		const fragment = await Fragment.byId(req.user as string, fragmentID);

		// Get the fragment's data
		const fragmentData = await fragment.getData();

		logger.debug(`fragment Data: ${fragmentData}`);

		// Conversions Extensions
		// Only need to support Markdown fragments (.md) converted to HTML (.html)
		logger.debug(`input fragment type: ${ext}`);

		const convertType = mime.lookup(ext);
		logger.debug(`Convert Type: ${convertType}`);

		// check convert is valid
		if (convertType) {
			const convertableFormats = fragment.formats;

			logger.debug(`mimeType: ${fragment.mimeType}`);
			logger.debug(`convertable formats:  ${convertableFormats}`);

			if (!convertableFormats.includes(convertType)) {
				logger.debug('convert type is not include in convertable formats');
				return res
					.status(415)
					.json(
						createErrorResponse(
							415,
							`Fragment extension is not unsupported type OR cannot be converted to ${convertType}`
						)
					);
			}

			if (fragment.type === 'text/markdown' && convertType === 'text/html') {
				const md = new MarkdownIt();

				logger.debug('Processing convert to HTML successfully');
				logger.debug(md.render(fragmentData.toString()));

				const convertedData = Buffer.from(md.render(fragmentData.toString()));

				// Set headers
				res.setHeader('Content-type', convertType as string);

				// Response
				res.status(200).send(convertedData);
			}
		}
		// Send the raw Buffer
		else {
			logger.debug(`fragment type in get id: ${fragment.type}`);

			// Set headers
			res.setHeader('Content-type', fragment.type);

			// Response
			res.status(200).send(fragmentData);
		}
	} catch (err: any) {
		res.status(404).json(createErrorResponse(404, err.message));
	}
};
