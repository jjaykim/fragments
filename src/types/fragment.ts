export interface IFragment {
	id: string;
	ownerId: string;
	created: string;
	updated: string;
	type: string;
	size: number | any;
}

export interface IJestTest {
	id?: string;
	ownerId?: string;
	created?: string;
	updated?: string;
	type?: string;
	size?: number | any;
}

export const ContentTypes = [
	`text/plain`,
	'text/plain; charset=utf-8',
	`text/markdown`,
	`text/html`,
	`application/json`,
	// `image/png`,
	// `image/jpeg`,
	// `image/webp`,
	// `image/gif`,
];

export const ValidConversionExtensions = [
	{ type: 'text/plain', VCE: ['text/plain'] },
	{ type: 'text/markdown', VCE: ['text/html'] },
	// { type: 'text/markdown', VCE: ['text/markdown', 'text/html', 'text/plain'] },
	// { type: 'text/html', VCE: ['text/html', 'text/text'] },
	// { type: 'application/json', VCE: ['application/json', 'text/plain'] },
	// {
	// 	type: ['image/png', 'image/jpg', 'image/webp', 'image/gif'],
	// 	VCE: ['image/png', 'image/jpg', 'image/webp', 'image/gif'],
	// },
];
