const express = require("express");
const db = require("../data/db");
const regras = require("../services/regrasPost");

const router = express.Router();

router.get("/", (req, res) => {
  const { q, escritorId } = req.query;
  let resultado = db.posts;
  if (escritorId) resultado = resultado.filter((p) => p.escritorId === Number(escritorId));
  if (q) {
    const termo = String(q).toLowerCase();
    resultado = resultado.filter(
      (p) => p.titulo.toLowerCase().includes(termo) || p.conteudo.toLowerCase().includes(termo)
    );
  }
  res.json(resultado);
});

router.get("/:id", (req, res) => {
  const post = db.posts.find((p) => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ erro: "Post não encontrado" });
  res.json(post);
});

router.post("/", (req, res) => {
  const { titulo, conteudo, escritorId } = req.body || {};
  if (!titulo || !conteudo || !escritorId) {
    return res.status(400).json({ erro: "Campos \"titulo\", \"conteudo\" e \"escritorId\" são obrigatórios" });
  }
  if (!db.escritores.some((e) => e.id === Number(escritorId))) {
    return res.status(404).json({ erro: "Escritor não encontrado" });
  }
  const erroPalavras = regras.validarLimitePalavras(conteudo);
  if (erroPalavras) return res.status(422).json({ erro: erroPalavras });

  const erroDiario = regras.validarLimiteDiario(Number(escritorId));
  if (erroDiario) return res.status(422).json({ erro: erroDiario });

  const agora = new Date().toISOString();
  const post = {
    id: db.seq.posts++,
    titulo,
    conteudo,
    escritorId: Number(escritorId),
    palavras: regras.contarPalavras(conteudo),
    criadoEm: agora,
    atualizadoEm: agora,
  };
  db.posts.push(post);
  regras.registrarCriacao(post.escritorId);
  res.status(201).json(post);
});

router.put("/:id", (req, res) => {
  const post = db.posts.find((p) => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ erro: "Post não encontrado" });

  const { titulo, conteudo } = req.body || {};
  if (!titulo || !conteudo) {
    return res.status(400).json({ erro: "Campos \"titulo\" e \"conteudo\" são obrigatórios" });
  }
  const erroPalavras = regras.validarLimitePalavras(conteudo);
  if (erroPalavras) return res.status(422).json({ erro: erroPalavras });

  post.titulo = titulo;
  post.conteudo = conteudo;
  post.palavras = regras.contarPalavras(conteudo);
  post.atualizadoEm = new Date().toISOString();
  res.json(post);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = db.posts.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ erro: "Post não encontrado" });
  db.posts.splice(idx, 1);
  db.leituras = db.leituras.filter((l) => l.postId !== id);
  res.status(204).send();
});

router.post("/:id/leituras", (req, res) => {
  const post = db.posts.find((p) => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ erro: "Post não encontrado" });
  const leitorId = Number((req.body || {}).leitorId);
  if (!db.leitores.some((l) => l.id === leitorId)) {
    return res.status(404).json({ erro: "Leitor não encontrado" });
  }
  const leitura = { id: db.seq.leituras++, postId: post.id, leitorId, data: new Date().toISOString() };
  db.leituras.push(leitura);
  res.status(201).json(leitura);
});

router.get("/:id/leituras", (req, res) => {
  const id = Number(req.params.id);
  if (!db.posts.some((p) => p.id === id)) return res.status(404).json({ erro: "Post não encontrado" });
  res.json(db.leituras.filter((l) => l.postId === id));
});

module.exports = router;
