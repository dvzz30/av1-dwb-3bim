import express from "express";
import autenticar from "../middlewares/autenticar.js";

const router = express.Router();

let proximoId = 4;
const equipes = [
  {
    id: 1,
    nome: "Corinthians",
    pais: "Brasil",
    cidade: "São Paulo",
    estadio: "Neo Química Arena",
    titulos: 8,
  },
  {
    id: 2,
    nome: "Manchester City",
    pais: "Inglaterra",
    cidade: "Manchester",
    estadio: "Etihad Stadium",
    titulos: 10,
  },
  {
    id: 3,
    nome: "Real Madrid",
    pais: "Espanha",
    cidade: "Madrid",
    estadio: "Santiago Bernabeu",
    titulos: 15,
  },
];

const validarEquipe = (dados) => {
  const { nome, pais, cidade, estadio, titulos } = dados;

  if (!nome || !pais || !cidade || !estadio || titulos === undefined) {
    return "Informe nome, pais, cidade, estadio e titulos";
  }

  if (!Number.isInteger(titulos) || titulos < 0) {
    return "Titulos deve ser um numero inteiro maior ou igual a zero";
  }

  return null;
};

const atualizarEquipe = (req, res) => {
  const id = Number(req.params.id);
  const indice = equipes.findIndex((equipe) => equipe.id === id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ mensagem: "O ID deve ser um numero inteiro" });
  }

  if (indice === -1) {
    return res.status(404).json({ mensagem: "Equipe nao encontrada" });
  }

  const mensagemErro = validarEquipe(req.body);
  if (mensagemErro) {
    return res.status(400).json({ mensagem: mensagemErro });
  }

  const { nome, pais, cidade, estadio, titulos } = req.body;
  equipes[indice] = { id, nome, pais, cidade, estadio, titulos };

  return res.json({
    mensagem: "Equipe atualizada com sucesso",
    equipe: equipes[indice],
  });
};

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
 */
router.get("/", (req, res) => {
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
 *       400:
 *         description: O ID informado não é um número inteiro.
 *       404:
 *         description: Equipe não encontrada.
 */
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ mensagem: "O ID deve ser um numero inteiro" });
  }

  const equipe = equipes.find((equipe) => equipe.id === id);

  if (!equipe) {
    return res.status(404).json({ mensagem: "Equipe nao encontrada" });
  }

  return res.json(equipe);
});

/**
 * @swagger
 * /equipes:
 *   post:
 *     tags: [Equipe]
 *     summary: Cadastra uma equipe
 *     description: Cria uma nova equipe. Esta rota exige autenticação por token.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Equipe'
 *     responses:
 *       201:
 *         description: Equipe cadastrada com sucesso.
 *       400:
 *         description: Dados inválidos.
 *       401:
 *         description: Token ausente ou inválido.
 */
router.post("/", autenticar, (req, res) => {
  const mensagemErro = validarEquipe(req.body);
  if (mensagemErro) {
    return res.status(400).json({ mensagem: mensagemErro });
  }

  const { nome, pais, cidade, estadio, titulos } = req.body;
  const novaEquipe = {
    id: proximoId++,
    nome,
    pais,
    cidade,
    estadio,
    titulos,
  };

  equipes.push(novaEquipe);

  return res.status(201).json({
    mensagem: "Equipe cadastrada com sucesso",
    equipe: novaEquipe,
  });
});

router.put("/:id", autenticar, atualizarEquipe);
router.patch("/:id", autenticar, atualizarEquipe);

/**
 * @swagger
 * /equipes/{id}:
 *   delete:
 *     tags: [Equipe]
 *     summary: Exclui uma equipe
 *     description: Exclui uma equipe pelo ID. Esta rota exige autenticação por token.
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
 *       400:
 *         description: O ID informado não é um número inteiro.
 *       401:
 *         description: Token ausente ou inválido.
 *       404:
 *         description: Equipe não encontrada.
 */
router.delete("/:id", autenticar, (req, res) => {
  const id = Number(req.params.id);
  const indice = equipes.findIndex((equipe) => equipe.id === id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ mensagem: "O ID deve ser um numero inteiro" });
  }

  if (indice === -1) {
    return res.status(404).json({ mensagem: "Equipe nao encontrada" });
  }

  const equipeRemovida = equipes.splice(indice, 1)[0];

  return res.json({
    mensagem: "Equipe excluida com sucesso",
    equipe: equipeRemovida,
  });
});

export default router;
