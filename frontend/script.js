const API = "/api";

const $ = (id) => document.getElementById(id);

function mostrarMensagem(id, texto, tipo = "sucesso") {
  const el = $(id);
  el.textContent = texto;
  el.className = `message ${tipo}`;
}

function moedaParaNumero(valor) {
  const limpo = valor.replace(/[^0-9,.-]/g, "").replace(/\./g, "").replace(",", ".");
  return Number(limpo);
}

function validarProduto() {
  const nome = $("nome").value.trim();
  const preco = moedaParaNumero($("preco").value);
  const estoque = Number($("estoque").value);
  const minimo = Number($("estoqueMinimo").value);

  if (!nome) return "Informe o nome do produto.";
  if (!Number.isFinite(preco) || preco <= 0) return "Informe um preço maior que zero.";
  if (!Number.isInteger(estoque) || estoque < 0) return "O estoque deve ser um número inteiro maior ou igual a zero.";
  if (!Number.isInteger(minimo) || minimo < 0) return "O estoque mínimo deve ser um número inteiro maior ou igual a zero.";
  return null;
}

async function requisicao(url, options = {}) {
  let resposta;
  try {
    resposta = await fetch(url, options);
  } catch (erro) {
    throw new Error("Não foi possível conectar ao servidor. Verifique se o backend está funcionando.");
  }

  let dados = {};
  try {
    dados = await resposta.json();
  } catch (_) {
    dados = {};
  }

  if (!resposta.ok) {
    throw new Error(dados.erro || `Erro HTTP ${resposta.status}.`);
  }
  return dados;
}

async function verificarConexao() {
  const status = $("status");
  try {
    const dados = await requisicao(`${API}/health`);
    status.textContent = `● ${dados.banco}`;
    status.className = "status online";
  } catch (erro) {
    status.textContent = "● servidor indisponível";
    status.className = "status offline";
  }
}

async function carregar() {
  try {
    const produtos = await requisicao(`${API}/produtos`);
    const lista = $("lista");
    const select = $("produtoId");
    lista.innerHTML = "";
    select.innerHTML = "";

    if (!produtos.length) {
      lista.innerHTML = "<p>Nenhum produto cadastrado.</p>";
      select.innerHTML = "<option value=\"\">Cadastre um produto primeiro</option>";
      return;
    }

    produtos.forEach((p) => {
      const item = document.createElement("div");
      item.className = `produto ${p.estoque_baixo ? "baixo" : ""}`;
      item.innerHTML = `
        <strong>${p.nome}</strong>
        <span>R$ ${Number(p.preco).toFixed(2).replace(".", ",")}</span>
        <span>Estoque: <b>${p.estoque}</b></span>
        <span>Mínimo: ${p.estoque_minimo}</span>
        ${p.estoque_baixo ? '<em>ESTOQUE BAIXO</em>' : ''}
      `;
      lista.appendChild(item);

      const option = document.createElement("option");
      option.value = p.id;
      option.textContent = `${p.nome} (estoque: ${p.estoque})`;
      select.appendChild(option);
    });
  } catch (erro) {
    $("lista").innerHTML = `<p class="erro">${erro.message}</p>`;
  }
}

async function carregarHistorico() {
  try {
    const dados = await requisicao(`${API}/movimentacoes`);
    const el = $("historico");
    el.innerHTML = dados.length ? dados.map((m) => `
      <div class="mov ${m.tipo.toLowerCase()}">
        <b>${m.tipo}</b> — ${m.produto} — ${m.quantidade} unidade(s)
        <span>${m.estoque_anterior} → ${m.estoque_posterior}</span>
        ${m.pedido_id ? `<span>Pedido: ${m.pedido_id}</span>` : ""}
        ${m.motivo ? `<small>${m.motivo}</small>` : ""}
      </div>
    `).join("") : "<p>Nenhuma movimentação registrada.</p>";
  } catch (erro) {
    $("historico").innerHTML = `<p class="erro">${erro.message}</p>`;
  }
}

$("preco").addEventListener("input", (e) => {
  let valor = e.target.value.replace(/\D/g, "");
  if (!valor) { e.target.value = ""; return; }
  valor = (Number(valor) / 100).toFixed(2);
  e.target.value = `R$ ${valor.replace(".", ",")}`;
});

$("produtoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const erro = validarProduto();
  if (erro) return mostrarMensagem("produtoMsg", erro, "erro");

  try {
    await requisicao(`${API}/produtos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: $("nome").value.trim(),
        preco: moedaParaNumero($("preco").value),
        estoque: Number($("estoque").value),
        estoque_minimo: Number($("estoqueMinimo").value)
      })
    });
    mostrarMensagem("produtoMsg", "Produto cadastrado com sucesso!");
    e.target.reset();
    $("estoque").value = 0;
    $("estoqueMinimo").value = 5;
    await carregar();
  } catch (erro) {
    mostrarMensagem("produtoMsg", erro.message, "erro");
  }
});

$("movForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const quantidade = Number($("quantidade").value);
  if (!$("produtoId").value) return mostrarMensagem("movMsg", "Selecione um produto.", "erro");
  if (!Number.isInteger(quantidade) || quantidade <= 0) return mostrarMensagem("movMsg", "Informe uma quantidade inteira maior que zero.", "erro");

  try {
    const dados = await requisicao(`${API}/estoque/movimentacao`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        produto_id: Number($("produtoId").value),
        tipo: $("tipo").value,
        quantidade,
        pedido_id: $("pedidoId").value.trim() || null,
        motivo: $("motivo").value.trim()
      })
    });
    const alerta = dados.estoque_baixo ? " Estoque mínimo atingido: atenção à reposição!" : "";
    mostrarMensagem("movMsg", `${dados.mensagem} Estoque atual: ${dados.estoque_atual}.${alerta}`);
    e.target.reset();
    await carregar();
    await carregarHistorico();
  } catch (erro) {
    mostrarMensagem("movMsg", erro.message, "erro");
  }
});

verificarConexao();
carregar();
carregarHistorico();
