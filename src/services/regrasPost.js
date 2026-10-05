const db = require("../data/db");

const MAX_PALAVRAS = 500;
const MAX_POSTS_POR_DIA = 3;

function contarPalavras(texto) {
  const limpo = String(texto || "").trim();
  return limpo ? limpo.split(/\s+/).length : 0;
}

function hoje() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/Campo_Grande" });
}

function validarLimitePalavras(conteudo) {
  const total = contarPalavras(conteudo);
  if (total > MAX_PALAVRAS) {
    return `O artigo tem ${total} palavras; o limite é ${MAX_PALAVRAS}`;
  }
  return null;
}

function validarLimiteDiario(escritorId) {
  const criadosHoje = db.criacoes.filter((c) => c.escritorId === escritorId && c.dia === hoje()).length;
  if (criadosHoje >= MAX_POSTS_POR_DIA) {
    return `O escritor já publicou ${MAX_POSTS_POR_DIA} artigos hoje`;
  }
  return null;
}

function registrarCriacao(escritorId) {
  db.criacoes.push({ escritorId, dia: hoje() });
}

module.exports = { contarPalavras, validarLimitePalavras, validarLimiteDiario, registrarCriacao };
