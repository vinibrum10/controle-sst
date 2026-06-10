// Valida req.body com um schema Zod. Em caso de erro, responde 400 com a
// lista de problemas encontrados.
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Dados invalidos.",
        detalhes: result.error.issues.map((issue) => ({
          campo: issue.path.join("."),
          mensagem: issue.message
        }))
      });
    }
    req.body = result.data;
    return next();
  };
}

module.exports = { validateBody };
