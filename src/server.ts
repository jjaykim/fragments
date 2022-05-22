import stoppable from 'stoppable'; // We want to gracefully shutdown our server

import logger from './logger'; // Get our logger instance
import app from './app'; // Get our express app instance

// Get the desired port from the process environment. Default to `8080`
const port = parseInt((process.env.PORT as string) || '8080', 10);

// Start a server listening on this port
// Export our server instance so other parts of our code can access it if necessary.
export const server = stoppable(
	app.listen(port, () => {
		// Log a message that the server has started, and which port it's using.
		logger.info({ port }, `Server started`);
	})
);
