const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Closet Map API",
            version: process.env.npm_package_version
        },
        servers: [
            {
                url: "/api"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Enter your Firebase ID Token (you can get this from the app logs or by printing 'user.getIdToken()' in code)"
                },
                userIdAuth: {
                    type: "apiKey",
                    in: "header",
                    name: "x-user-id",
                    description: "Enter your Firebase User UID"
                }
            }
        },
        security: [
            {
                bearerAuth: [],
                userIdAuth: []
            }
        ]
    },
    apis: [
        path.join(__dirname, "routes/*.js"),
        path.join(__dirname, "../server.js")
    ]
};

module.exports = swaggerJSDoc(options);
