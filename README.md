# API do Blog

API REST em JavaScript com Express.js para um blog com escritores, leitores e posts.

## Como rodar

```bash
npm install
npm start        # http://localhost:3000
```

Requisitos: Node.js 18 ou superior. Os dados ficam em memória e são perdidos ao reiniciar.

## Entidades

- **Escritor**: `id`, `nome`, `email`
- **Leitor**: `id`, `nome`, `email`
- **Post**: `id`, `titulo`, `conteudo`, `escritorId`, `palavras`, `criadoEm`, `atualizadoEm`
- **Leitura**: `id`, `postId`, `leitorId`, `data` (relaciona leitor e post)

## Regras de negócio

1. Cada escritor pode publicar no máximo **3 artigos por dia**. Excluir um artigo não libera vaga.
2. Cada artigo pode ter no máximo **500 palavras** (validado ao criar e ao editar).

Violações retornam `422` com uma mensagem de erro.

## Endpoints

### Escritores (CRUD completo)
| Método | Rota | Descrição |
|---|---|---|
| GET | /escritores | Lista escritores |
| GET | /escritores/:id | Busca um escritor |
| POST | /escritores | Cria (`nome`, `email`) |
| PUT | /escritores/:id | Atualiza |
| DELETE | /escritores/:id | Exclui (bloqueado se tiver posts) |

### Leitores
| Método | Rota | Descrição |
|---|---|---|
| GET | /leitores | Lista leitores |
| GET | /leitores/:id | Busca um leitor |
| POST | /leitores | Cria (`nome`, `email`) |

### Posts (CRUD completo)
| Método | Rota | Descrição |
|---|---|---|
| GET | /posts | Lista posts. Filtros: `?q=termo&escritorId=1` |
| GET | /posts/:id | Busca post específico |
| POST | /posts | Posta (`titulo`, `conteudo`, `escritorId`) |
| PUT | /posts/:id | Edita (`titulo`, `conteudo`) |
| DELETE | /posts/:id | Exclui |
| POST | /posts/:id/leituras | Registra leitura (`leitorId`) |
| GET | /posts/:id/leituras | Lista leituras do post |

### Códigos de resposta
`200`, `201`, `204` sucesso · `400` dados inválidos · `404` não encontrado · `409` conflito · `422` regra de negócio violada.

## Divisão do trabalho

- **Integrante A**: `src/routes/escritores.js`, `src/routes/leitores.js`
- **Integrante B**: `src/routes/posts.js`, `src/services/regrasPost.js`
