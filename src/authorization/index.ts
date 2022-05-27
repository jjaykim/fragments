// Prefer Amazon Cognito
if (process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID) {
	import('./cognito').then(({ strategy, authenticate }) => {
		return { strategy, authenticate };
	});
}
// Also allow for an .htpasswd file to be used, but not in production
else if (process.env.HTPASSWD_FILE && process.env.NODE_ENV !== 'production') {
	import('./basic-auth').then(({ strategy, authenticate }) => {
		return { strategy, authenticate };
	});
}
// In all other cases, we need to stop now and fix our config
else {
	throw new Error('missing env vars: no authorization configuration found');
}
