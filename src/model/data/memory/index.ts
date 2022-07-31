import { IFragment } from '../../../types/fragment';

import { MemoryDB } from './memory-db';

// Create two in-memory databases: one for fragment metadata and the other for raw data
const data = new MemoryDB();
const metadata = new MemoryDB();

export const resetFragment = () => {
	metadata.clear();
	data.clear();
};

// Write a fragment's metadata to memory db. Returns a Promise
export const writeFragment = (fragment: IFragment) => {
	return metadata.put(fragment.ownerId, fragment.id, fragment);
};

// Read a fragment's metadata from memory db. Returns a Promise
export const readFragment = (ownerId: string, id: string) => {
	return metadata.get(ownerId, id);
};

// Write a fragment's data to memory db. Returns a Promise
export const writeFragmentData = (ownerId: string, id: string, value: Buffer) => {
	return data.put(ownerId, id, value);
};

// Read a fragment's data from memory db. Returns a Promise
export const readFragmentData = (ownerId: string, id: string) => {
	return data.get(ownerId, id);
};

// Get a list of fragment ids/objects for the given user from memory db. Returns a Promise
export const listFragments = async (ownerId: string, expand = false) => {
	const fragments: any[] = await metadata.query(ownerId);

	// If we don't get anything back, or are supposed to give expanded fragments, return
	if (expand || !fragments) {
		return fragments;
	}

	// Otherwise, map to only send back the ids
	return fragments.map((fragment) => fragment.id);
};

// Delete a fragment's metadata and data from memory db. Returns a Promise
export const deleteFragment = (ownerId: string, id: string) => {
	return Promise.all([
		// Delete metadata
		metadata.del(ownerId, id),
		// Delete data
		data.del(ownerId, id),
	]);
};
