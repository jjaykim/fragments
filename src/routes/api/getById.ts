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
export const getByIdFragments = async (req: Request, res: Response) => {
	try {
		logger.debug(`owner id and id: ${req.user}, ${req.params.id}`);

		// Get a fragment
		const fragment = await Fragment.byId(req.user as string, req.params.id.split('.')[0]);

		// Get the fragment's data
		const fragmentData = await fragment.getData();

		logger.debug(`fragment Data:${fragmentData}`);

		// Conversions Extensions
		// Only need to support Markdown fragments (.md) converted to HTML (.html)
		const convertType = mime.lookup(req.params.id as string);
		logger.debug(`Convert Type: ${convertType}`);

		if (fragment.type === 'text/markdown' && convertType === 'text/html') {
			const md = new MarkdownIt();
			logger.debug('Processing convert to HTML');

			logger.debug(md.render('hello'));

			// Set headers
			res.setHeader('Content-type', convertType);

			// Response
			res.send(md.render(fragmentData as string));
		} else if (convertType && !fragment.formats.includes(convertType)) {
			res
				.status(415)
				.json(
					createErrorResponse(
						415,
						`Fragment extension is not unsupported type OR cannot be converted to ${convertType}`
					)
				);
		} else {
			// Set headers
			res.setHeader('Content-type', fragment.type);

			// Response
			res.send(fragmentData);
		}
	} catch (err: any) {
		res.status(404).json(createErrorResponse(404, err.message));
	}
};
