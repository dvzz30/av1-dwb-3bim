import express from "express";
import "dotenv/config";
import swaggerUI from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import equipesRoutes from "./src/routes/equipesRoutes.js";
import prisma 

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Equipes de Futebol",
      version: "1.0.0",
      description: "API didática para cadastro e gerenciamento de equipes.",
    },
    servers: [{ url: `http://localhost:${port}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "Token",
        },
      },
      schemas: {
        Equipe: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            nome: { type: "string", example: "Corinthians" },
            pais: { type: "string", example: "Brasil" },
            cidade: { type: "string", example: "São Paulo" },
            estadio: { type: "string", example: "Neo Química Arena" },
            titulos: { type: "integer", example: 8 },
          },
        },
      },
    },
  },
  apis: ["./server.js", "./src/routes/*.js"],
});

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.json({
    mensagem: "Servidor Express funcionando!",
    tema: "Cadastro de equipes de futebol",
    rotas: [
      "POST /equipes",
      "GET /equipes",
      "GET /equipes/:id",
      "PUT /equipes/:id",
      "PATCH /equipes/:id",
      "DELETE /equipes/:id",
    ],
  });
});

app.use("/equipes", equipesRoutes);

try {
  await prisma.$connect();
  console.log("Conectado ao banco de dados!")
  

  app.listen(port,() => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error.message);

    await prisma.$disconnect();
    process.exitCode = 1;
  }
