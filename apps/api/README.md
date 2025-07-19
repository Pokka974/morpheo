# Deep Dreamer API

Deep Dreamer API is a RESTful API for interpreting dreams using AI models and managing user authentication and profiles. Used in Deep Dreamer React Native mobile App.

## Table of Contents

-   [Features](#features)
-   [Prerequisites](#prerequisites)
-   [Installation](#installation)
-   [Configuration](#configuration)
-   [Usage](#usage)
-   [API Documentation](#api-documentation)
-   [Logging](#logging)
-   [Testing](#testing)
-   [License](#license)

## Features

-   **ChatGPT Dream Interpretation**: Interpret dreams using OpenAI's GPT models to provide insights and explanations.
-   **DALL-E Dream Description Image Generation**: Generate surreal dream images based on dream descriptions using OpenAI's DALL-E model.
-   **Authentication System with JWT**: Secure authentication system using JSON Web Tokens (JWT) for user login and access control.
-   **User Management**: CRUD operations for managing user profiles, including reading, updating, and deleting user accounts.

## Prerequisites

-   Node.js installed on your machine.
-   npm (Node Package Manager) installed.
-   PostgreSQL 16
-   A valid OpenAI API key

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/Pokka974/deep-dreamer-api.git
    ```

2. Navigate to the project directory:

    ```bash
    cd deep-dreamer-api
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

-   The server will start running on http://localhost:3000 by default.

## Configuration

-   Check the .env.example file and create your own .env file (or rename and remove the .example)

    ```bash
    OPENAI_API_KEY=YOUR_OPENAI_KEY
    PORT=3000
    JWT_SECRET="YOUR_SECRET"
    DATABASE_URL="postgresql://DATABASE:PASSWORD@HOSTNAME:PORT/databasename?schema="
    ```

## Usage

-   Run the project with nodemon:

    ```bash
    npm run start
    ```

-   To access the database monitoring system with Prisma

    ```bash
    npm run prisma
    ```

-   That will launch Prisma Studio on http://localhost:5555 by default

## API Documentation

-   API documentation is available through Swagger UI.
-   Access the API documentation at http://localhost:3000/api-docs after starting the server..

## Logging

-   The API uses Winston for logging. Log files are stored in the logs/winston directory by default.
-   Log levels include info, warn, error, verbose, silly and debug.
-   The API also uses Morgan for every HTTP requests. Log file is store in the logs/access.log by default.

## Testing

## License

-   This project is licensed under the MIT License.
