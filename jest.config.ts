// Get the full path to our env.jest file
import path from 'path';

import type { Config } from '@jest/types';

const envFile = path.join(__dirname, 'env.jest');

// Read the environment variables we use for Jest from our env.jest file
require('dotenv').config({ path: envFile });

// Log a message to remind developers how to see more detail from log messages
console.info(`Using LOG_LEVEL=${process.env.LOG_LEVEL}. Use 'debug' in env.jest for more detail`);

// Set our Jest options, see https://jestjs.io/docs/configuration
export default async (): Promise<Config.InitialOptions> => {
	return {
		bail: 1,
		verbose: true,
		testTimeout: 5000,
		preset: 'ts-jest',
	};
};