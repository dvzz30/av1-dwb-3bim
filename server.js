import express from "express";
import "dotenv/config";
import swaggerUI from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

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
          },
        },
      },
    },
  },
  apis: ["./server.js"],
});

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

let proximoId = 4;
const equipes = [
  {
    id: 1,
    nome: "Corinthians",
    pais: "Brasil",
    cidade: "São Paulo",
    estadio: "Neo Química Arena",
    titulos: 8
  },
  {
    id: 2,
    nome: "Manchester City",
    pais: "Inglaterra",
    cidade: "Manchester",
    estadio: "Etihad Stadium",
    titulos: 10
  },
  {
    id: 3,
    nome: "Real Madrid",
    pais: "Espanha",
    cidade: "Madrid",
    estadio: "Santiago Bernabeu",
    titulos: 15
  }
];

function autenticar(req, res, next) {
  const autHeader = req.headers.authorization;
  const tokenSecreto = process.env.TOKEN_SECRETO;

  console.log(tokenSecreto)

  if(autHeader !== `Bearer ${tokenSecreto}`) {
    return res.status(401).json({
      erro:"Acesso não autorizado. Token ausente ou inválido."
    })
  }
  next();
}


app.get("/", (req, res) => {
  res.json({
    mensagem: "Servidor Express funcionando!",
    tema: "Cadastro de equipes de futebol",
    rotas: [
      "POST /equipes",
      "GET /equipes",
      "GET /equipes/:id",
      "PUT /equipes/:id",
      "DELETE /equipes/:id"
    ]
  });
});

/**
 * @swagger
 * /equipes:
 *   get:
 *     tags: [Equipe]
 *     summary: Lista todas as equipes
 *     description: Retorna todos os registros de equipes cadastrados.
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Equipe'
 *             example:
 *               - id: 1
 *       400:
 *         description: Requisição inválida.
 */
app.get("/equipes", (req, res) => {
  res.json(equipes);
});

/**
 * @swagger
 * /equipes/{id}:
 *   get:
 *     tags: [Equipe]
 *     summary: Busca uma equipe por ID
 *     description: Retorna uma equipe específica usando seu ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Equipe encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipe'
 *             example:
 *               id: 1
 *       400:
 *         description: O ID informado não é um número inteiro.
 *       404:
 *         description: Equipe não encontrada.
 */
app.get("/equipes/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ mensagem: "O ID deve ser um numero inteiro" });
  }

  const equipe = equipes.find((equipe) => equipe.id === id);

  if (!equipe) {
    return res.status(404).json({
      mensagem: "Equipe nao encontrada"
    });
  }

  res.json(equipe);
});

/**
 * @swagger
 * /equipes:
 *   post:
 *     tags: [Equipe]
 *     summary: Cadastra uma equipe
 *     description: Cria uma nova equipe. Esta rota exige Bearer Token.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Equipe'
 *           example:
 *             id: 4
 *     responses:
 *       201:
 *         description: Equipe cadastrada com sucesso.
 *         content:
 *           application/json:
 *             example:
 *               id: 4
 *       400:
 *         description: Dados inválidos.
 *       401:
 *         description: Token ausente ou inválido.
 */
app.post("/equipes", autenticar, (req, res) => {
  const { nome, pais, cidade, estadio, titulos } = req.body;

  if (!nome || !pais || !cidade || !estadio || titulos === undefined) {
    return res.status(400).json({
      mensagem: "Informe nome, pais, cidade, estadio e titulos"
    });
  }

  if (!Number.isInteger(titulos) || titulos < 0) {
    return res.status(400).json({
      mensagem: "Titulos deve ser um numero inteiro maior ou igual a zero"
    });
  }

  const novaEquipe = {
    id: proximoId++,
    nome,
    pais,
    cidade,
    estadio,
    titulos
  };

  equipes.push(novaEquipe);

  res.status(201).json({
    mensagem: "Equipe cadastrada com sucesso",
    equipe: novaEquipe
  });
});

const atualizarEquipe = (req, res) => {
  const id = Number(req.params.id);
  const indice = equipes.findIndex((equipe) => equipe.id === id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ mensagem: "O ID deve ser um numero inteiro" });
  }

  if (indice === -1) {
    return res.status(404).json({ mensagem: "Equipe nao encontrada" });
  }

  const { nome, pais, cidade, estadio, titulos } = req.body;

  if (!nome || !pais || !cidade || !estadio || titulos === undefined) {
    return res.status(400).json({
      mensagem: "Informe nome, pais, cidade, estadio e titulos"
    });
  }

  if (!Number.isInteger(titulos) || titulos < 0) {
    return res.status(400).json({
      mensagem: "Titulos deve ser um numero inteiro maior ou igual a zero"
    });
  }

  equipes[indice] = { id, nome, pais, cidade, estadio, titulos };

  res.json({
    mensagem: "Equipe atualizada com sucesso",
    equipe: equipes[indice]
  });
};

app.put("/equipes/:id", autenticar, atualizarEquipe);

/**
 * @swagger
 * /equipes/{id}:
 *   patch:
 *     tags: [Equipe]
 *     summary: Atualiza parcialmente uma equipe
 *     description: Atualiza os dados de uma equipe. Esta rota exige Bearer Token.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Equipe'
 *           example:
 *             id: 1
 *     responses:
 *       200:
 *         description: Equipe atualizada com sucesso.
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *       400:
 *         description: Dados inválidos.
 *       401:
 *         description: Token ausente ou inválido.
 *       404:
 *         description: Equipe não encontrada.
 */
app.patch("/equipes/:id", autenticar, atualizarEquipe);

/**
 * @swagger
 * /equipes/{id}:
 *   delete:
 *     tags: [Equipe]
 *     summary: Exclui uma equipe
 *     description: Exclui uma equipe pelo ID. Esta rota exige Bearer Token.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Equipe excluída com sucesso.
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *       400:
 *         description: O ID informado não é um número inteiro.
 *       401:
 *         description: Token ausente ou inválido.
 *       404:
 *         description: Equipe não encontrada.
 */
app.delete("/equipes/:id", autenticar, (req, res) => {
  const id = Number(req.params.id);
  const indice = equipes.findIndex((equipe) => equipe.id === id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ mensagem: "O ID deve ser um numero inteiro" });
  }

  if (indice === -1) {
    return res.status(404).json({ mensagem: "Equipe nao encontrada" });
  }

  const equipeRemovida = equipes.splice(indice, 1)[0];

  res.json({
    mensagem: "Equipe excluida com sucesso",
    equipe: equipeRemovida
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
