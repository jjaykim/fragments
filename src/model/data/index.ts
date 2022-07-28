interface Memory {
	readFragment: any;
	writeFragment: any;
	readFragmentData: any;
	writeFragmentData: any;
	listFragments: any;
	deleteFragment: any;
}

export const memory: Memory = process.env.AWS_REGION ? require('./aws') : require('./memory');
