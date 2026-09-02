from app import app, validar_produto


def test_nome_vazio():
    assert validar_produto({"nome": "", "preco": 5}) == "Informe o nome do produto."


def test_preco_invalido():
    assert validar_produto({"nome": "Coxinha", "preco": 0}) == "O preço deve ser maior que zero."


def test_estoque_negativo():
    assert validar_produto({"nome": "Coxinha", "preco": 5, "estoque": -1}) == "Estoque e estoque mínimo não podem ser negativos."


def test_produto_valido():
    assert validar_produto({"nome": "Coxinha", "preco": 5, "estoque": 10, "estoque_minimo": 3}) is None


def test_rota_inexistente():
    client = app.test_client()
    resposta = client.get("/rota-que-nao-existe")
    assert resposta.status_code == 404
    assert resposta.get_json()["erro"] == "Rota não encontrada."
