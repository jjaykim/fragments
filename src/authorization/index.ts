/* eslint-disable prefer-destructuring */
// import { strategy as cognitoStrategy, authenticate as cognitoAuthenticate } from './cognito';

// import { strategy as basicAuthStrategy, authenticate as basicAuthAuthenticate } from './basic-auth';

// Prefer Amazon Cognito
export default () => {
	if (process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID) {
		const strategy = require('./cognito').strategy;
		const authenticate = require('./cognito').authenticate;
		return { strategy, authenticate };
	}
	// Also allow for an .htpasswd file to be used, but not in production
	if (process.env.HTPASSWD_FILE && process.env.NODE_ENV !== 'production') {
		const strategy = require('./basic-auth').strategy;
		const authenticate = require('./basic-auth').authenticate;
		return { strategy, authenticate };
	}

	// In all other cases, we need to stop now and fix our config

	throw new Error('missing env vars: no authorization configuration found');
};
