import request from 'supertest';

import app from '../../src/app';

describe('GET /v1/fragments', () => {
	// If the request is missing the Authorization header, it should be forbidden
	test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

	// If the wrong username/password pair are used (no such user), it should be forbidden
	test('incorrect credentials are denied', () =>
		request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

	// Using a valid username/password pair should give a success result with a .fragments array
	test('authenticated users get a fragments array', async () => {
		const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
		expect(res.statusCode).toBe(200);
		expect(res.body.status).toBe('ok');
		expect(Array.isArray(res.body.fragments)).toBe(true);
	});

	// Gets all fragments belonging to the authenticated user, expanded to include a full representations of the fragments' metadata
	test('GET /fragments?expand=1', async () => {
		const postRes1 = await request(app)
			.post('/v1/fragments')
			.auth('user1@email.com', 'password1')
			.set('Content-Type', 'text/plain')
			.send('This is fragment 1');

		const fragment1 = JSON.parse(postRes1.text).fragment;

		const postRes2 = await request(app)
			.post('/v1/fragments')
			.auth('user1@email.com', 'password1')
			.set('Content-Type', 'text/plain')
			.send('This is fragment 2');

		const fragment2 = JSON.parse(postRes2.text).fragment;

		const getRes = await request(app)
			.get('/v1/fragments')
			.query({ expand: 1 })
			.auth('user1@email.com', 'password1');

		expect(getRes.statusCode).toBe(200);
		expect(getRes.body.status).toBe('ok');
		expect(Array.isArray(getRes.body.fragments)).toBe(true);
		expect(getRes.body.fragments).toEqual([fragment1, fragment2]);
	});
});
