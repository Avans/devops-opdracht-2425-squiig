import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Prestiges API - DEVOPS/WEBS5-Cloud Stan',
      version: '1.0.0',
      description: 'Backend API for the DEVOPS/WEBS5-Cloud "Prestiges" project',
    },
  },
  apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
