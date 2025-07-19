// src/swaggerOptions.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'My API',
            version: '1.0.0',
            description:
                'This is a simple CRUD API application made with Express and documented with Swagger',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    name: 'Authorization',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    in: 'header',
                },
            },
        },
        servers: [
            { url: 'http://localhost:3000', description: 'Local Server' },
        ],
    },
    // Assuming your route handlers are annotated with JSDoc comments and located under src/routes
    apis: ['./src/routes/**/*.ts'],
};

const openapiSpecification = swaggerJsdoc(options);

export default openapiSpecification;
