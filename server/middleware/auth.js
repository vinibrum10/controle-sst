const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET nao configurado. Defina a variavel de ambiente JWT_SECRET.");
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Token de autenticacao ausente." });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: "Token invalido ou expirado." });
  }
}

// Restringe a rota a usuarios com um dos papeis informados.
function requireRole(...papeis) {
  return (req, res, next) => {
    if (!req.user || !papeis.includes(req.user.papel)) {
      return res.status(403).json({ error: "Sem permissao para esta acao." });
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole, JWT_SECRET };
