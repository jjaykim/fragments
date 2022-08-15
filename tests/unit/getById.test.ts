import fs from 'fs';

import request from 'supertest';

import app from '../../src/app';

describe('GET /v1/fragments/:id', () => {
	const testFilePath = `${__dirname}/assets/myEmoji.png`;

	// If the request is missing the Authorization header, it should be forbidden
	test('unauthenticated requests are denied', () =>
		request(app).get('/v1/fragments/:id').expect(401));

	// If the wrong username/password pair are used (no such user), it should be forbidden
	test('incorrect credentials are denied', () =>
		request(app)
			.post('/v1/fragments/:id')
			.auth('invalid@email.com', 'incorrect_password')
			.expect(401));

	// Using a valid username/password pair should give a success result with fragment data with given id
	test('authenticated users get fragment data with the given id', async () => {
		const postRes = await request(app)
			.post('/v1/fragments')
			.auth('user1@email.com', 'password1')
			.set('Content-Type', 'text/plain')
			.send('This is fragment');
		const { id } = JSON.parse(postRes.text).fragment;

		const getRes = await request(app)
			.get(`/v1/fragments/${id}`)
			.auth('user1@email.com', 'password1');
		expect(getRes.statusCode).toBe(200);
		expect(getRes.text).toEqual('This is fragment');
	});

	// If the extension used represents an unknown or unsupported type,
	// or if the fragment cannot be converted to this type
	// HTTP 415 error is returned instead
	test('if fragment cannot be converted to the type, return 415 error', async () => {
		const postRes = await request(app)
			.post('/v1/fragments')
			.auth('user1@email.com', 'password1')
			.set('Content-Type', 'text/plain')
			.send('This is fragment');
		const { id } = JSON.parse(postRes.text).fragment;

		const getRes = await request(app)
			.get(`/v1/fragments/${id}.js`)
			.auth('user1@email.com', 'password1');
		expect(getRes.statusCode).toBe(415);
	});

	// Only need to support Markdown fragments (.md) converted to HTML (.html)
	test('Markdown can be converted to HTML', async () => {
		const postRes = await request(app)
			.post('/v1/fragments')
			.auth('user1@email.com', 'password1')
			.set('Content-Type', 'text/markdown')
			.send('# This is fragment');
		const { id } = JSON.parse(postRes.text).fragment;

		const getRes = await request(app)
			.get(`/v1/fragments/${id}.html`)
			.auth('user1@email.com', 'password1');

		expect(getRes.statusCode).toBe(200);
		expect(getRes.headers['content-type']).toEqual('text/html; charset=utf-8');
	});

	// Convert Markdown fragments (.md) to Plan Text (.txt)
	test('markdown data can be converted to plain text, user can get converted result by specifying extension', async () => {
		const postRes = await request(app)
			.post('/v1/fragments')
			.auth('user2@email.com', 'password2')
			.set('Content-Type', 'text/markdown')
			.send('# This is fragment 2');
		const { id } = JSON.parse(postRes.text).fragment;

		const getRes = await request(app)
			.get(`/v1/fragments/${id}.txt`)
			.auth('user2@email.com', 'password2');

		expect(getRes.statusCode).toBe(200);
		expect(getRes.headers['content-type']).toEqual('text/plain; charset=utf-8');
	});

	// Get PNG image fragment (.png)
	test('get the image fragment', async () => {
		const postRes = await request(app)
			.post('/v1/fragments')
			.auth('user1@email.com', 'password1')
			.set('Content-Type', 'image/png')
			.send(fs.readFileSync(testFilePath));

		expect(postRes.statusCode).toBe(201);

		const id = postRes.header.location.split('fragments/')[1];

		const getRes = await request(app)
			.get(`/v1/fragments/${id}`)
			.auth('user1@email.com', 'password1');

		expect(getRes.statusCode).toBe(200);
	});

	// Convert PNG image fragment (.png) to JPEG, WEBP or GIF image formats (.jpeg, .webp, or .gif)
	test('get the image fragment by converting it to other image formats', async () => {
		const postRes = await request(app)
			.post('/v1/fragments')
			.auth('user1@email.com', 'password1')
			.set('Content-Type', 'image/png')
			.send(fs.readFileSync(testFilePath));

		expect(postRes.statusCode).toBe(201);

		const id = postRes.header.location.split('fragments/')[1];

		const getResPng = await request(app)
			.get(`/v1/fragments/${id}.jpeg`)
			.auth('user1@email.com', 'password1');

		expect(getResPng.statusCode).toBe(200);

		const getResWebp = await request(app)
			.get(`/v1/fragments/${id}.webp`)
			.auth('user1@email.com', 'password1');

		expect(getResWebp.statusCode).toBe(200);

		const getResGif = await request(app)
			.get(`/v1/fragments/${id}.gif`)
			.auth('user1@email.com', 'password1');

		expect(getResGif.statusCode).toBe(200);
	});
});
