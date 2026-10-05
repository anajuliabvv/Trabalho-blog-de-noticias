const express = require("express");
const path = require("path");
const escritoresRoutes = require("./routes/escritores");
const leitoresRoutes = require("./routes/leitores");
const postsRoutes = require("./routes/posts");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.get("/", (req, res) => res.json({ mensagem: "API do Blog no ar" }));
app.use("/escritores", escritoresRoutes);
app.use("/leitores", leitoresRoutes);
app.use("/posts", postsRoutes);

app.use((req, res) => res.status(404).json({ erro: "Rota não encontrada" }));

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ erro: "JSON inválido" });
  }
  console.error(err);
  res.status(500).json({ erro: "Erro interno do servidor" });
});

module.exports = app;