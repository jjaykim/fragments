// jest.config.js

// Get the full path to our env.jest file
import { join } from 'path';

import type { Config } from '@jest/types';

const envFile = join(__dirname, 'env.jest');

// Read the environment variables we use for Jest from our env.jest file
require('dotenv').config({ path: envFile });

// Log a message to remind developers how to see more detail from log messages
console.info(`Using LOG_LEVEL=${process.env.LOG_LEVEL}. Use 'debug' in env.jest for more detail`);

// Set our Jest options, see https://jestjs.io/docs/configuration
export default async (): Promise<Config.InitialOptions> => {
	return {
		verbose: true,
		testTimeout: 5000,
		bail: 1,
		preset: 'ts-jest',
		coveragePathIgnorePatterns: ['/node_modules/', 'package.json', 'package-lock.json'],
		collectCoverage: true,
	};
};
