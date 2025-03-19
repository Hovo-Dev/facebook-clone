# Use an official Node.js runtime as a base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock for dependency installation
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install --frozen-lockfile

# Copy the entire project into the container
COPY . .

# Build the NestJS application
RUN yarn build

# Expose the application port (adjust if needed)
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Command to run the compiled NestJS application
CMD ["node", "dist/main.js"]
