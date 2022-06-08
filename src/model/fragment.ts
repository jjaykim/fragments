import { nanoid } from 'nanoid'; // Use https://www.npmjs.com/package/nanoid to create unique IDs
import contentType from 'content-type'; // Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers

// Functions for working with fragment metadata/data using our DB
import { ContentType, IJestTest, IFragment } from '../types/fragment';

import { memory } from './data/index';

export class Fragment implements IFragment {
	id: string;

	ownerId: string;

	created: string;

	updated: string;

	type: string;

	size: number;

	constructor({
		id = '',
		ownerId = '',
		created = new Date().toISOString(),
		updated = new Date().toISOString(),
		type = '',
		size = 0,
	}: IJestTest) {
		this.id = id || nanoid();

		if (!ownerId || !type) throw new Error('ownerId and type are required');
		this.ownerId = ownerId;

		if (typeof size !== 'number' || size < 0) throw new Error('size must be a number and positive');
		this.size = size;

		if (!Fragment.isSupportedType(type)) throw new Error(`${type} is invalid types`);
		this.type = type;

		this.created = created;
		this.updated = updated;
	}

	/**
	 * Get all fragments (id or full) for the given user
	 * @param {string} ownerId user's hashed email
	 * @param {boolean} expand whether to expand ids to full fragments
	 * @returns Promise<Array<Fragment>>
	 */
	static async byUser(ownerId: string, expand: boolean = false) {
		try {
			const fragments = await memory.listFragments(ownerId, expand);
			return fragments;
		} catch (err: any) {
			throw new Error(`Error: ${err}`);
		}
	}

	/**
	 * Gets a fragment for the user by the given id.
	 * @param {string} ownerId user's hashed email
	 * @param {string} id fragment's id
	 * @returns Promise<Fragment>
	 */
	static async byId(ownerId: string, id: string) {
		try {
			return new Fragment(await memory.readFragment(ownerId, id));
		} catch (err: any) {
			throw new Error(`Error: ${err}`);
		}
	}

	/**
	 * Delete the user's fragment data and metadata for the given id
	 * @param {string} ownerId user's hashed email
	 * @param {string} id fragment's id
	 * @returns Promise
	 */
	static delete(ownerId: string, id: string) {
		return memory.deleteFragment(ownerId, id);
	}

	/**
	 * Saves the current fragment to the database
	 * @returns Promise
	 */
	save() {
		this.updated = new Date().toISOString();

		return memory.writeFragment(this);
	}

	/**
	 * Gets the fragment's data from the database
	 * @returns Promise<Buffer>
	 */
	getData() {
		return memory.readFragmentData(this.ownerId, this.id);
	}

	/**
	 * Set's the fragment's data in the database
	 * @param {Buffer} data
	 * @returns Promise
	 */
	async setData(data?: Buffer) {
		if (!data) throw new Error('Buffer is required');

		try {
			this.updated = new Date().toISOString();
			this.size = Buffer.byteLength(data);

			await memory.writeFragment(this);

			return await memory.writeFragmentData(this.ownerId, this.id, data);
		} catch (err: any) {
			throw new Error(`Error: ${err}`);
		}
	}

	/**
	 * Returns the mime type (e.g., without encoding) for the fragment's type:
	 * "text/html; charset=utf-8" -> "text/html"
	 * @returns {string} fragment's mime type (without encoding)
	 */
	get mimeType(): string {
		const { type } = contentType.parse(this.type);
		return type;
	}

	/**
	 * Returns true if this fragment is a text/* mime type
	 * @returns {boolean} true if fragment's type is text/*
	 */
	get isText(): boolean {
		// TODO
		return this.type.includes('text/');
	}

	/**
	 * Returns the formats into which this fragment type can be converted
	 * @returns {Array<string>} list of supported mime types
	 */
	get formats(): Array<string> {
		// TODO
		const result: Array<string> = [];

		if (this.isText) result.push(this.mimeType);

		return result;
	}

	/**
	 * Returns true if we know how to work with this content type
	 * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
	 * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
	 */
	static isSupportedType(value: string): boolean {
		// TODO
		if (ContentType.find((ele) => ele === value)) return true;

		return false;
	}
}