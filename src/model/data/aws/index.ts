import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

import { IFragment } from '../../../types/fragment';
import { MemoryDB } from '../memory/memory-db';
import logger from '../../../logger';

import { s3Client } from './s3Client';

// Create two in-memory databases: one for fragment metadata and the other for raw data
const metadata = new MemoryDB();

export const resetFragment = () => {
	metadata.clear();
};

// Write a fragment's metadata to memory db. Returns a Promise
export const writeFragment = (fragment: IFragment) => {
	return metadata.put(fragment.ownerId, fragment.id, fragment);
};

// Read a fragment's metadata from memory db. Returns a Promise
export const readFragment = (ownerId: string, id: string) => {
	try {
		return metadata.get(ownerId, id);
	} catch (error: any) {
		throw new Error(error);
	}
};

// Writes a fragment's data to an S3 Object in a Bucket
// https://github.com/awsdocs/aws-sdk-for-javascript-v3/blob/main/doc_source/s3-example-creating-buckets.md#upload-an-existing-object-to-an-amazon-s3-bucket
export const writeFragmentData = async (ownerId: string, id: string, value: Buffer) => {
	// Create the PUT API params from our details
	const params = {
		Bucket: process.env.AWS_S3_BUCKET_NAME as string,
		// Our key will be a mix of the ownerID and fragment id, written as a path
		Key: `${ownerId}/${id}`,
		Body: value,
	};

	// Create a PUT Object command to send to S3
	const command = new PutObjectCommand(params);

	try {
		// Use our client to send the command
		await s3Client.send(command);
	} catch (err) {
		// If anything goes wrong, log enough info that we can debug
		const { Bucket, Key } = params;
		logger.error({ err, Bucket, Key }, 'Error uploading fragment data to S3');
		throw new Error('unable to upload fragment data');
	}
};

// Convert a stream of data into a Buffer, by collecting
// chunks of data until finished, then assembling them together.
// We wrap the whole thing in a Promise so it's easier to consume.
const streamToBuffer = (stream) =>
	new Promise((resolve, reject) => {
		// As the data streams in, we'll collect it into an array.
		const chunks: any[] = [];

		// Streams have events that we can listen for and run
		// code.  We need to know when new `data` is available,
		// if there's an `error`, and when we're at the `end`
		// of the stream.

		// When there's data, add the chunk to our chunks list
		stream.on('data', (chunk: any) => chunks.push(chunk));
		// When there's an error, reject the Promise
		stream.on('error', reject);
		// When the stream is done, resolve with a new Buffer of our chunks
		stream.on('end', () => resolve(Buffer.concat(chunks)));
	});

// Reads a fragment's data from S3 and returns (Promise<Buffer>)
// https://github.com/awsdocs/aws-sdk-for-javascript-v3/blob/main/doc_source/s3-example-creating-buckets.md#getting-a-file-from-an-amazon-s3-bucket
export const readFragmentData = async (ownerId: string, id: string) => {
	// Create the PUT API params from our details
	const params = {
		Bucket: process.env.AWS_S3_BUCKET_NAME,
		// Our key will be a mix of the ownerID and fragment id, written as a path
		Key: `${ownerId}/${id}`,
	};

	// Create a GET Object command to send to S3
	const command = new GetObjectCommand(params);

	try {
		// Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
		const s3Data = await s3Client.send(command);
		// Convert the ReadableStream to a Buffer
		return streamToBuffer(s3Data.Body);
	} catch (err) {
		const { Bucket, Key } = params;
		logger.error({ err, Bucket, Key }, 'Error streaming fragment data from S3');
		throw new Error('unable to read fragment data');
	}
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
export const deleteFragment = async (ownerId: string, id: string) => {
	const params = {
		Bucket: process.env.AWS_S3_BUCKET_NAME,
		// Our key will be a mix of the ownerID and fragment id, written as a path
		Key: `${ownerId}/${id}`,
	};

	const command = new DeleteObjectCommand(params);

	try {
		await s3Client.send(command);
	} catch (err) {
		const { Bucket, Key } = params;
		logger.error({ err, Bucket, Key }, 'Unable to delete S3 object');
		throw new Error('Unable to delete S3 object');
	}
};
