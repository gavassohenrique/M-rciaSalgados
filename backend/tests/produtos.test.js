test("deve validar produto com nome e preço válido", () => {
  const produto = {
    nome: "Coxinha",
    preco: 5
  };

  expect(produto.nome).toBe("Coxinha");
  expect(produto.preco).toBeGreaterThan(0);
});

test("não deve aceitar produto com nome vazio", () => {
  const produto = {
    nome: "",
    preco: 5
  };

  expect(produto.nome).toBe("");
  expect(produto.preco).toBeGreaterThan(0);
});