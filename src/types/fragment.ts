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

export const ContentType = [
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
