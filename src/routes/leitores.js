const express = require("express");
const db = require("../data/db");

const router = express.Router();

router.get("/", (req, res) => res.json(db.leitores));

router.get("/:id", (req, res) => {
  const leitor = db.leitores.find((l) => l.id === Number(req.params.id));
  if (!leitor) return res.status(404).json({ erro: "Leitor não encontrado" });
  res.json(leitor);
});

router.post("/", (req, res) => {
  const { nome, email } = req.body || {};
  if (!nome || !email || !email.includes("@")) {
    return res.status(400).json({ erro: "Campos \"nome\" e \"email\" válidos são obrigatórios" });
  }
  if (db.leitores.some((l) => l.email === email)) {
    return res.status(409).json({ erro: "Já existe um leitor com esse email" });
  }
  const leitor = { id: db.seq.leitores++, nome: nome.trim(), email };
  db.leitores.push(leitor);
  res.status(201).json(leitor);
});

module.exports = router;
