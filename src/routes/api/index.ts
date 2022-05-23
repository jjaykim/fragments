/**
 * The main entry-point for the v1 version of the fragments API.
 */
import express from 'express';

import { getFragments } from './get';

// Create a router on which to mount our API endpoints
export const apis = express.Router();

// Define our first route, which will be: GET /v1/fragments
apis.get('/fragments', getFragments);

// Other routes will go here later on...
