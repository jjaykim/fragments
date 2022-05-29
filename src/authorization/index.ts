// Prefer Amazon Cognito
export default () => {
	// Also allow for an .htpasswd file to be used, but not in production
	if (process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID) {
		const { strategy } = require('./cognito');
		const { authenticate } = require('./cognito');
		return { strategy, authenticate };
	}

	if (process.env.HTPASSWD_FILE && process.env.NODE_ENV !== 'production') {
		const strategy = require('./basic-auth').strategy();
		const { authenticate } = require('./basic-auth');
		return { strategy, authenticate };
	}

	// In all other cases, we need to stop now and fix our config
	throw new Error('missing env vars: no authorization configuration found');
};
