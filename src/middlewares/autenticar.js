export default function autenticar(req, res, next) {
  const authorizationHeader = req.headers.authorization ?? "";
  const tokenSecreto = process.env.TOKEN_SECRETO || "token-secreto-padrao";
  const tokenRecebido = authorizationHeader.startsWith("Bearer ")
    ? authorizationHeader.slice(7).trim()
    : "";

  if (tokenRecebido !== tokenSecreto) {
    return res.status(401).json({
      erro: "Acesso não autorizado. Token ausente ou inválido.",
    });
  }

  next();
}
