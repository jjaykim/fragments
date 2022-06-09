/**
 * The main entry-point for the v1 version of the fragments API.
 */
import express from 'express';
import contentType from 'content-type';

import { Fragment } from '../../model/fragment';

import { getFragments } from './get';
import { postFragments } from './post';
import { getByIdFragments } from './getById';

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
 * GET /v1/fragments
 */
apis.get('/fragments', getFragments);

/**
 * POST /v1/fragments
 * Use a raw body parser for POST, which will give a `Buffer` Object or `{}` at `req.body`
 */
apis.post('/fragments', rawBody(), postFragments);

/**
 * GET /v1/fragments/:id
 * Gets an authenticated user's fragment data (i.e., raw binary data) with the given id.
 */
apis.get('/fragments/:id', getByIdFragments);
