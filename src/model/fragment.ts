import { nanoid } from 'nanoid'; // Use https://www.npmjs.com/package/nanoid to create unique IDs
import contentType from 'content-type'; // Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers

// Functions for working with fragment metadata/data using our DB
import { ContentTypes, IFragment, IJestTest, ValidConversionExtensions } from '../types/fragment';
import logger from '../logger';

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
			logger.error({ err }, 'ERROR! Unable to get all gragments');
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
			const fragment = await memory.readFragment(ownerId, id);
			if (fragment) {
				if (fragment instanceof Fragment === false) {
					return new Fragment(fragment);
				}
				return fragment;
			}
		} catch (err: any) {
			logger.error({ err }, 'ERROR! Unable to get a fragment by the given id');
			throw new Error(err);
		}
	}

	/**
	 * Delete the user's fragment data and metadata for the given id
	 * @param {string} ownerId user's hashed email
	 * @param {string} id fragment's id
	 * @returns Promise
	 */
	static delete(ownerId: string, id: string) {
		try {
			return memory.deleteFragment(ownerId, id);
		} catch (err: any) {
			logger.error({ err }, 'ERROR! Unable to delete fragment');
			throw new Error(`Error: ${err}`);
		}
	}

	/**
	 * Saves the current fragment to the database
	 * @returns Promise
	 */
	save() {
		try {
			this.updated = new Date().toISOString();

			return memory.writeFragment(this);
		} catch (err: any) {
			logger.error({ err }, 'ERROR! Unable to save fragment');
			throw new Error(`Error: ${err}`);
		}
	}

	/**
	 * Gets the fragment's data from the database
	 * @returns Promise<Buffer>
	 */
	async getData() {
		try {
			return await memory.readFragmentData(this.ownerId, this.id);
		} catch (err: any) {
			logger.error({ err }, 'ERROR! Unable to read fragment data');
			throw new Error(`Error: ${err}`);
		}
	}

	/**
	 * Set's the fragment's data in the database
	 * @param {Buffer} data
	 * @returns Promise
	 */
	async setData(data?: Buffer) {
		if (!data) throw new Error('Data is empty');
		if (!Buffer.isBuffer(data)) throw new Error('Data is not buffer');

		try {
			this.size = Buffer.byteLength(data);

			await this.save();

			return await memory.writeFragmentData(this.ownerId, this.id, data);
		} catch (err: any) {
			logger.error({ err }, 'ERROR! Unable to set fragment data');
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
		return this.type.includes('text/');
	}

	/**
	 * Returns the formats into which this fragment type can be converted
	 * @returns {Array<string>} list of supported mime types
	 */
	get formats(): Array<string> {
		const type = ValidConversionExtensions.find((item) => item.type.includes(this.mimeType));

		return type ? type.VCE : [];
	}

	/**
	 * Returns true if we know how to work with this content type
	 * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
	 * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
	 */
	static isSupportedType(value: string): boolean {
		if (ContentTypes.find((ele) => ele === value)) return true;

		return false;
	}
}
