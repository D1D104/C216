# C216-L1

Repositório da disciplina C216 (Sistemas Distribuídos)

## Testes do backend

Com o Poetry instalado, execute na raiz do repositório:

```bash
make install
make test
```

O comando `make test` executa todos os testes do backend com Pytest. Os testes
de serviço ficam em `backend/tests/unit/` e os testes HTTP com `TestClient` em
`backend/tests/integration/`; ambos são executados pelo CI.

## API de itens

A API oferece operações de criação, consulta, substituição, atualização parcial
e exclusão em `/items/`. A listagem aceita o parâmetro de consulta `name` para
filtrar itens pelo nome. A documentação interativa fica disponível em
`/docs` ao iniciar o backend com `make run`.
