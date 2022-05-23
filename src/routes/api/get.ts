import { Request, Response } from 'express';

/**
 * Get a list of fragments for the current user
 */
export const getFragments = (req: Request, res: Response) => {
	// TODO: this is just a placeholder to get something working...
	res.status(200).json({
		status: 'ok',
		fragments: [],
	});
};
