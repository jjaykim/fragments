import request from 'supertest';

import app from '../../src/app';

describe('/ 404 handler check', () => {
	test('should return HTTP 404 response', async () => {
		const res = await request(app).get('/errorTest');
		expect(res.statusCode).toBe(404);
		expect(res.body.status).toBe('error');
		expect(res.body.error.message).toBe('not found');
		expect(res.body.error.code).toBe(404);
	});
});
