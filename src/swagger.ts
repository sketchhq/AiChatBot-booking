import { INestApplication } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle("Pet ELF Store API")
    .setDescription("API Documentation")
    .setVersion("1.0")
    .addBearerAuth(
  {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    in: 'header',
    name: 'Authorization',
  },
  'access-token',
)
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("swagger", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: "Pet ELF Store API Docs",
    useGlobalPrefix: true, // REQUIRED for Docker + global prefix
  });
}
