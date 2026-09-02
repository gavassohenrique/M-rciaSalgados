# Marcia Salgados

Sistema web para cadastro de produtos e automação de controle de estoque e rastreabilidade de movimentações.

## Arquitetura

- **Front-end:** HTML, CSS e JavaScript, servido pelo Nginx.
- **Back-end:** Python + Flask.
- **Banco:** PostgreSQL.
- **Infraestrutura:** Docker Compose e Kubernetes.

O fluxo demonstrado na atividade é:

**Interface → requisição HTTP → Flask/Python → processamento/validação → PostgreSQL → resultado → Interface.**

## Funcionalidades da atividade

- Cadastro de produto com nome, preço, estoque inicial e estoque mínimo.
- Validação no front-end e repetição da validação no back-end.
- Máscara de preço em reais (`R$ 0,00`).
- Tooltips com dicas de contexto nos campos.
- Tratamento de servidor indisponível e erros de acesso ao banco.
- Entrada e saída de estoque.
- Bloqueio de saída quando não há estoque suficiente.
- Registro do histórico com estoque anterior e posterior.
- Vinculação opcional da saída a um número de pedido.
- Alerta visual quando o estoque atinge o mínimo.
- Testes automatizados das principais validações do Flask.

## Executar com Docker Compose

No PowerShell, dentro da pasta do projeto:

```powershell
docker compose down
# Se esta instalação já tinha o banco antigo do projeto e você NÃO precisa preservar os dados:
docker compose down -v

docker compose up -d --build
```

Aguarde alguns segundos e acesse:

- Front-end: http://localhost:8080
- API: http://localhost:5000
- Saúde da API: http://localhost:5000/health
- Produtos: http://localhost:5000/produtos

O `database/init.sql` cria as tabelas automaticamente em uma instalação nova do PostgreSQL.

## Testar validações

1. Tente cadastrar sem nome → o front-end bloqueia.
2. Digite preço `0` → o front-end bloqueia.
3. Digite estoque negativo → o campo e o back-end bloqueiam.
4. Cadastre um produto válido → o produto aparece na tela e no PostgreSQL.
5. Faça uma saída maior que o estoque → a API retorna erro e o estoque não é alterado.
6. Faça uma entrada → o estoque aumenta e a movimentação aparece no histórico.
7. Faça uma saída informando `PED-001` → o histórico mostra o vínculo com o pedido.
8. Reduza o estoque até o mínimo → a interface sinaliza **ESTOQUE BAIXO**.

## Testes automatizados

Dentro de `backend`:

```powershell
pip install -r requirements.txt
pytest -q
```

## Kubernetes no Docker Desktop

Depois de construir as imagens localmente:

```powershell
docker build -t marcia-salgados-backend:local ./backend
docker build -t marcia-salgados-frontend:local ./frontend
kubectl apply -f k8s/
kubectl get pods
kubectl get services
```

Para abrir o front-end localmente:

```powershell
kubectl port-forward service/frontend-service 8081:80
```

Acesse `http://localhost:8081`.

> O banco do Kubernetes usa o script da ConfigMap `k8s/database-init-configmap.yaml`. Em um ambiente de produção, recomenda-se usar armazenamento persistente e credenciais gerenciadas com maior segurança.
