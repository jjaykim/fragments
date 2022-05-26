// src/response.js

/**
 * A successful response looks like:
 *
 * {
 *   "status": "ok",
 *   ...
 * }
 */
export const createSuccessResponse = (data?: any) => {
	return {
		status: 'ok',
		// TODO ...
		...data,
	};
};

/**
 * An error response looks like:
 *
 * {
 *   "status": "error",
 *   "error": {
 *     "code": 400,
 *     "message": "invalid request, missing ...",
 *   }
 * }
 */
export const createErrorResponse = (code: number, message: string) => {
	// TODO ...
	return {
		status: 'error',
		error: {
			code,
			message,
		},
	};
};
