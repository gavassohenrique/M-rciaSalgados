CREATE TABLE produtos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100),
  preco NUMERIC
);

INSERT INTO produtos (nome, preco)
VALUES ('Coxinha', 5), ('Pastel', 6);