const express = require("express");
const escritoresRoutes = require("./routes/escritores");
const leitoresRoutes = require("./routes/leitores");

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.json({ mensagem: "API do Blog no ar" }));
app.use("/escritores", escritoresRoutes);
app.use("/leitores", leitoresRoutes);

app.use((req, res) => res.status(404).json({ erro: "Rota não encontrada" }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erro: "Erro interno do servidor" });
});

module.exports = app;
