import request from 'supertest';

import app from '../../src/app';

describe('GET /v1/fragments/:id/info', () => {
	// If the request is missing the Authorization header, it should be forbidden
	test('unauthenticated requests are denied', () =>
		request(app).get('/v1/fragments/:id').expect(401));

	// If the wrong username/password pair are used (no such user), it should be forbidden
	test('incorrect credentials are denied', () =>
		request(app)
			.post('/v1/fragments/:id')
			.auth('invalid@email.com', 'incorrect_password')
			.expect(401));

	// Using a valid username/password pair should give a success result with fragment's info with given id
	test("authenticated users get fragment's info data with the given id", async () => {
		const postRes = await request(app)
			.post('/v1/fragments')
			.auth('user1@email.com', 'password1')
			.set('Content-Type', 'text/plain')
			.send('This is fragment');

		const fragmentData = JSON.parse(postRes.text).fragment;

		const getRes = await request(app)
			.get(`/v1/fragments/${fragmentData.id}/info`)
			.auth('user1@email.com', 'password1');

		expect(getRes.status).toBe(200);
		expect(getRes.body.status).toBe('ok');
		expect(getRes.body.fragment).toEqual(fragmentData);
	});

	// No fragment with the given id
	test('If no such fragment exists, returns an HTTP 404', async () => {
		await request(app)
			.post('/v1/fragments')
			.auth('user1@email.com', 'password1')
			.set('Content-Type', 'text/plain')
			.send('This is fragment');

		const getRes = await request(app)
			.get('/v1/fragments/noSuchID/info')
			.auth('user1@email.com', 'password1');

		expect(getRes.status).toBe(404);
	});
});
