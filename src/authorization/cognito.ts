// Configure a JWT token strategy for Passport based on
// Identity Token provided by Cognito. The token will be
// parsed from the Authorization header (i.e., Bearer Token).
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import dotenv from 'dotenv';

import logger from '../logger';

import { authorize } from './authorize-middleware';

dotenv.config();

// We expect AWS_COGNITO_POOL_ID and AWS_COGNITO_CLIENT_ID to be defined.
if (!(process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID)) {
	throw new Error('missing expected env vars: AWS_COGNITO_POOL_ID, AWS_COGNITO_CLIENT_ID');
}

// Create a Cognito JWT Verifier, which will confirm that any JWT we
// get from a user is valid and something we can trust. See:
// https://github.com/awslabs/aws-jwt-verify#cognitojwtverifier-verify-parameters
const jwtVerifier = CognitoJwtVerifier.create({
	// These variables must be set in the .env
	userPoolId: process.env.AWS_COGNITO_POOL_ID as string,
	clientId: process.env.AWS_COGNITO_CLIENT_ID as string,
	// We expect an Identity Token (vs. Access Token)
	tokenUse: 'id',
});

// At startup, download and cache the public keys (JWKS) we need in order to
// verify our Cognito JWTs, see https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets
// You can try this yourself using:
// curl https://cognito-idp.us-east-1.amazonaws.com/<user-pool-id>/.well-known/jwks.json
const verifyCognito = async () => {
	try {
		await jwtVerifier.hydrate();
		logger.info('Cognito JWKS cached');
	} catch (err: any) {
		logger.error({ err }, 'Unable to cache Cognito JWKS');
	}
};
verifyCognito();

// For our Passport authentication strategy, we'll look for the Bearer Token
// in the Authorization header, then verify that with our Cognito JWT Verifier.
export const strategy = new BearerStrategy(async (token: string, done: any) => {
	try {
		// Verify this JWT
		const user = await jwtVerifier.verify(token);
		logger.debug({ user }, 'verified user token');

		// Create a user, but only bother with their email
		done(null, user.email);
	} catch (err) {
		logger.error({ err, token }, 'could not verify token');
		done(null, false);
	}
});

export const authenticate = () => authorize('bearer');
