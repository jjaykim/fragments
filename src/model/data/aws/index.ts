import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { PutCommand, GetCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

import { IFragment } from '../../../types/fragment';
import logger from '../../../logger';

import { s3Client } from './s3Client';
import { ddbDocClient } from './ddbDocClient';

logger.debug('#### AWS DATA ####');

// Write a fragment's metadata to memory db. Returns a Promise
export const writeFragment = (fragment: IFragment) => {
	// Configure our PUT params, with the name of the table and item (attributes and keys)
	const params = {
		TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
		Item: fragment,
	};

	// Create a PUT command to send to DynamoDB
	const command = new PutCommand(params);

	try {
		return ddbDocClient.send(command);
	} catch (err) {
		logger.warn({ err, params, fragment }, 'error writing fragment to DynamoDB');
		throw err;
	}
};

// Read a fragment's metadata from memory db. Returns a Promise
export const readFragment = async (ownerId: string, id: string) => {
	// Configure our GET params, with the name of the table and key (partition key + sort key)
	const params = {
		TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
		Key: { ownerId, id },
	};

	// Create a GET command to send to DynamoDB
	const command = new GetCommand(params);

	try {
		// Wait for the data to come back from AWS
		const data = await ddbDocClient.send(command);
		// We may or may not get back any data (e.g., no item found for the given key).
		// If we get back an item (fragment), we'll return it.  Otherwise we'll return `undefined`.
		logger.info({ data }, 'data got in readFragment');

		return data?.Item;
	} catch (err) {
		logger.warn({ err, params }, 'error reading fragment from DynamoDB');
		throw err;
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
	// Configure our QUERY params, with the name of the table and the query expression
	const params: {
		TableName: string;
		KeyConditionExpression: string;
		ExpressionAttributeValues: {};
		ProjectionExpression?: string;
	} = {
		TableName: process.env.AWS_DYNAMODB_TABLE_NAME as string,
		// Specify that we want to get all items where the ownerId is equal to the
		// `:ownerId` that we'll define below in the ExpressionAttributeValues.
		KeyConditionExpression: 'ownerId = :ownerId',
		// Use the `ownerId` value to do the query
		ExpressionAttributeValues: {
			':ownerId': ownerId,
		},
	};

	// Limit to only `id` if we aren't supposed to expand. Without doing this
	// we'll get back every attribute.  The projection expression defines a list
	// of attributes to return, see:
	// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ProjectionExpressions.html
	if (!expand) {
		params.ProjectionExpression = 'id';
	}

	// Create a QUERY command to send to DynamoDB
	const command = new QueryCommand(params);

	try {
		// Wait for the data to come back from AWS
		const data = await ddbDocClient.send(command);

		// If we haven't expanded to include all attributes, remap this array from
		// [ {"id":"6-b-3pSg9F054u-11oItP"}, {"id":"AmXx1tgo-H1iJLFL3DQcE"} ,... ] to
		// [ "6-b-3pSg9F054u-11oItP", "AmXx1tgo-H1iJLFL3DQcE", ... ]
		return !expand ? data?.Items!.map((item: any) => item.id) : data?.Items;
	} catch (err) {
		logger.error({ err, params }, 'error getting all fragments for user from DynamoDB');
		throw err;
	}
};

// Delete a fragment's metadata and data from memory db. Returns a Promise
export const deleteFragment = async (ownerId: string, id: string) => {
	const params = {
		Bucket: process.env.AWS_S3_BUCKET_NAME,
		// Our key will be a mix of the ownerID and fragment id, written as a path
		Key: `${ownerId}/${id}`,
	};

	const command = new DeleteObjectCommand(params);

	const dynamoDBParams = {
		TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
		Key: { ownerId, id },
	};

	// Create a DELETE command to send to DynamoDB
	const dynamoDBCommand = new DeleteCommand(dynamoDBParams);

	try {
		await s3Client.send(command);
	} catch (err) {
		const { Bucket, Key } = params;
		logger.error({ err, Bucket, Key }, 'Unable to delete S3 object');
		throw new Error('Unable to delete S3 object');
	}

	try {
		// Delete metadata
		await ddbDocClient.send(dynamoDBCommand);
	} catch (err) {
		const { TableName, Key } = dynamoDBParams;
		logger.error({ err, TableName, Key }, 'Unable to delete metadata in DynamoDB');
		throw new Error('Unable to delete metadata in DynamoDB');
	}
};
