/**
 * The main entry-point for the v1 version of the fragments API.
 */
import express from 'express';
import contentType from 'content-type';

import { Fragment } from '../../model/fragment';

import { getFragments } from './get';
import { postFragments } from './post';
import { getByIdFragments } from './getById';
import { getByIdInfoFragments } from './getByIdInfo';

// Create a router on which to mount our API endpoints
export const apis = express.Router();

// Support sending various Content-Types on the body up to 5M in size
const rawBody = () =>
	express.raw({
		inflate: true,
		limit: '5mb',
		type: (req) => {
			// See if we can parse this content type. If we can, `req.body` will be
			// a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
			// will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
			const { type } = contentType.parse(req);
			return Fragment.isSupportedType(type);
		},
	});

/**
 * GET APIs
 */
apis.get('/fragments', getFragments);
apis.get('/fragments/:id', getByIdFragments);
apis.get('/fragments/:id/info', getByIdInfoFragments);

/**
 * POST APIs
 */
apis.post('/fragments', rawBody(), postFragments);
