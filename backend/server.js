const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || "db",
  user: "user",
  password: "password",
  database: "appdb",
  port: 5432
});

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

app.get("/produtos", async (req, res) => {
  const result = await pool.query("SELECT * FROM produtos");
  res.json(result.rows);
});

app.post("/produtos", async (req, res) => {
  const { nome, preco } = req.body;

  await pool.query(
    "INSERT INTO produtos (nome, preco) VALUES ($1, $2)",
    [nome, preco]
  );

  res.json({ message: "Produto cadastrado" });
});

app.listen(3000, () => console.log("Backend rodando na 3000"));