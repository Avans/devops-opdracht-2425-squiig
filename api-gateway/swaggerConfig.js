const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Prestiges API - WEBS5 Stan & Kas',
      version: '1.0.0',
      description: 'Backend API for the WEBS5-Cloud \"Prestiges\" project',
    },
  },
  apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
