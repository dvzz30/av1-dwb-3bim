import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

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

app.get("/equipes", (req, res) => {
  res.json(equipes);
});

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

app.post("/equipes", (req, res) => {
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

app.put("/equipes/:id", (req, res) => {
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
});

app.delete("/equipes/:id", (req, res) => {
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
