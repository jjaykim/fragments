// Configure HTTP Basic Auth strategy for Passport, see:
// https://github.com/http-auth/http-auth-passport
import auth from 'http-auth';
import passport from 'passport';
import authPassport from 'http-auth-passport';

// We expect HTPASSWD_FILE to be defined.
if (!process.env.HTPASSWD_FILE) {
	throw new Error('missing expected env var: HTPASSWD_FILE');
}
export const strategy = () =>
	// For our Passport authentication strategy, we'll look for a
	// username/password pair in the Authorization header.
	authPassport(
		auth.basic({
			file: process.env.HTPASSWD_FILE,
		})
	);

export const authenticate = () => passport.authenticate('http', { session: false });
