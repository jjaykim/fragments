# Dockerfile for fragments microservice

# Stage 1: Convert all of TypeScript files to JavaScript
# This specifies the parent (or base) image to use as a starting point for our own image.
# Our image is as close to our development environment as possible
# Only builds the TS code ready to run in production.
# Use node version 16.15.1 (LTS Version)
FROM node:16-alpine@sha256:c785e617c8d7015190c0d41af52cc69be8a16e3d9eb7cb21f0bb58bcfca14d6b as development

# Use /app as our working directory
# All subsequent commands will be relative to /app
WORKDIR /app

# Copy files into image, change the owner to node user
COPY --chown=node:node . /app

# Copy the package.json and package-lock.json files into the working dir (/app)
# Copy files and folders from build context to a path inside image
# We could also use a relative path instead of `/app/`, since our WORKDIR is already set to /app
COPY package*.json .

# Install node dependencies defined in package-lock.json
# RUN npm install
RUN npm ci --only=production \
    && npm uninstall sharp \
    && npm install --platform=linuxmusl sharp@0.30.3

COPY . .

RUN npm run build

#####################################################################################
# Stage 2: Only have JavaScript files

# Copy developemnt to another container as production
FROM development as production

# Adds key=value pairs with arbitrary metadata about your image.
LABEL maintainer="Jay Kim <jkim594@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# Install dumb-init
# dumb-init improve signal handling, but it also takes care of other functions of an init system
RUN apk update && apk add --no-cache dumb-init=1.2.5-r1

# Environment variables become part of the built image, and will persist in any containers run using this image.
# Define things that will always be different at run-time instead of build-time.
# Ref: https://github.com/Yelp/dumb-init
ENV NODE_ENV=production

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Only install dependecies without devDependencies
# used in automated environments such as test platforms, continuous integration, and deployment
# https://docs.npmjs.com/cli/v8/commands/npm-ci
RUN npm ci --omit=dev

# Copy the folder compiled with JavaScript to current working directory, change the owner to node user, group
COPY --chown=node:node --from=development /app/dist ./

# Copy our HTPASSWD file
COPY --chown=node:node ./tests/.htpasswd ./tests/.htpasswd

# Switch user to node before runing the app
# To prevent any attacks form hackers
USER node

# Start the container by running our server
CMD ["dumb-init", "node", "dist/src/index.js"]

# We run our service on port 8080
EXPOSE 8080

# Define a command to run in order to monitor the health of our container's process
HEALTHCHECK --interval=10s --timeout=30s --start-period=5s --retries=3 \
CMD curl --fail localhost:${PORT} || exit 1
