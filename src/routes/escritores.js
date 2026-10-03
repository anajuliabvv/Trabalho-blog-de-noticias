const express = require("express");
const db = require("../data/db");

const router = express.Router();

function validar(body) {
  const { nome, email } = body || {};
  if (!nome || typeof nome !== "string" || !nome.trim()) return "Campo \"nome\" é obrigatório";
  if (!email || typeof email !== "string" || !email.includes("@")) return "Campo \"email\" inválido";
  return null;
}

router.get("/", (req, res) => res.json(db.escritores));

router.get("/:id", (req, res) => {
  const escritor = db.escritores.find((e) => e.id === Number(req.params.id));
  if (!escritor) return res.status(404).json({ erro: "Escritor não encontrado" });
  res.json(escritor);
});

router.post("/", (req, res) => {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ erro });
  if (db.escritores.some((e) => e.email === req.body.email)) {
    return res.status(409).json({ erro: "Já existe um escritor com esse email" });
  }
  const escritor = { id: db.seq.escritores++, nome: req.body.nome.trim(), email: req.body.email };
  db.escritores.push(escritor);
  res.status(201).json(escritor);
});

router.put("/:id", (req, res) => {
  const escritor = db.escritores.find((e) => e.id === Number(req.params.id));
  if (!escritor) return res.status(404).json({ erro: "Escritor não encontrado" });
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ erro });
  escritor.nome = req.body.nome.trim();
  escritor.email = req.body.email;
  res.json(escritor);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = db.escritores.findIndex((e) => e.id === id);
  if (idx === -1) return res.status(404).json({ erro: "Escritor não encontrado" });
  if (db.posts.some((p) => p.escritorId === id)) {
    return res.status(409).json({ erro: "Escritor possui posts; exclua os posts antes" });
  }
  db.escritores.splice(idx, 1);
  res.status(204).send();
});

module.exports = router;
