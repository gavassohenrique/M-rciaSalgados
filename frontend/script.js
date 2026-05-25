const API = "http://localhost:3000";

function carregar() {
  fetch(API + "/produtos")
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById("lista");
      lista.innerHTML = "";

      data.forEach(p => {
        const li = document.createElement("li");
        li.innerText = `${p.nome} - R$ ${p.preco}`;
        lista.appendChild(li);
      });
    });
}

function adicionar() {
  const nome = document.getElementById("nome").value;
  const preco = document.getElementById("preco").value;

  fetch(API + "/produtos", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ nome, preco })
  }).then(() => carregar());
}

carregar();