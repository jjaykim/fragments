import request from 'supertest';

import app from '../../src/app';

describe('POST /v1/fragments', () => {
	// If the request is missing the Authorization header, it should be forbidden
	test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

	// If the wrong username/password pair are used (no such user), it should be forbidden
	test('incorrect credentials are denied', () =>
		request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

	/**
	 * If the Content-Type of the fragment being sent with the request is not supported,
	 * returns an HTTP 415
	 */
	test('create a fragment with an unsupported type errors as expected', async () => {
		const res = await request(app)
			.post('/v1/fragments')
			.auth('user1@email.com', 'password1')
			.set('Content-Type', 'abc/defg');
		expect(res.statusCode).toBe(415);
	});

	test('post without data does not work', async () => {
		const res = await request(app)
			.post('/v1/fragments')
			.auth('user1@email.com', 'password1')
			.send();

		expect(res.statusCode).toBe(500);
	});

	/**
	 * User with valid username/password pair should be able to create a plain text fragment
	 * responses include all necessary and expected properties (id, created, type, etc),
	 * and these values match what you expect for a given request (e.g., size, type, ownerId)
	 */
	test('authenticated users can create a plain text fragment', async () => {
		const data = Buffer.from('hello');
		const res = await request(app)
			.post('/v1/fragments')
			.auth('user1@email.com', 'password1')
			.set('Content-Type', 'text/plain')
			.send(data);

		const body = JSON.parse(res.text);
		expect(res.statusCode).toBe(201);
		expect(body.status).toBe('ok');
		expect(Object.keys(body.fragment)).toEqual([
			'id',
			'ownerId',
			'size',
			'type',
			'created',
			'updated',
		]);
		expect(body.fragment.size).toEqual(data.byteLength);
		expect(body.fragment.type).toContain('text/plain');
	});

	test('response include a Location header with a URL to GET the fragment', async () => {
		const data = Buffer.from('hello');
		const res = await request(app)
			.post('/v1/fragments')
			.auth('user1@email.com', 'password1')
			.set('Content-Type', 'text/plain')
			.send(data);
		expect(res.statusCode).toBe(201);
		expect(res.headers['content-type']).toContain('text/plain');
		expect(res.headers.location).toEqual(
			`${process.env.API_URL}/v1/fragments/${JSON.parse(res.text).fragment.id}`
		);
	});
});
