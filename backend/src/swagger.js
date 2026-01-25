const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Closet Map API",
            version: "1.0.0"
        },
        servers: [
            {
                url: "/api"
            }
        ]
    },
    apis: [
        path.join(__dirname, "routes/*.js"),
        path.join(__dirname, "../server.js")
    ]
};

module.exports = swaggerJSDoc(options);
