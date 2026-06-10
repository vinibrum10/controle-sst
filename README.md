# Controle SST

Sistema online para controlar tarefas semanais da equipe de SST, prazos, pedidos de ajuda e indicadores de desempenho. Os dados ficam armazenados em um banco PostgreSQL e podem ser acessados por toda a equipe, com login por usuário.

## O que faz

- Login por e-mail e senha, com perfis Administrador, Gestor e Colaborador.
- Cadastro de pessoas da equipe, capacidade semanal em horas e foto.
- Cadastro de tarefas por semana, responsável, prazo, prioridade e tipo: rotineira ou eventual.
- Quadro Kanban de execução de tarefas (pendente, em andamento, concluída) com arrastar e soltar.
- Dashboard com indicadores, carga por pessoa, status das tarefas e rankings.
- Pedido de ajuda automático: o programa procura primeiro quem está sem tarefa aberta na semana e depois quem tem maior capacidade livre.
- Exportação e importação dos dados em JSON, e restauração dos dados de demonstração (apenas Administrador).

## Estrutura do projeto

- `index.html`, `styles.css`: shell da aplicação e estilos.
- `src/main.js`: ponto de entrada do front-end (tema, navegação, autenticação).
- `src/router.js`, `src/config/navigation.js`: roteamento por hash e menu lateral.
- `src/state/store.js`: estado central da aplicação.
- `src/services/api`: chamadas HTTP para o backend.
- `src/hooks`: regras de negócio do front-end (carregam dados da API e atualizam o estado).
- `src/components`, `src/pages`: componentes de interface e páginas/rotas.
- `server/`: API REST em Express (rotas, middlewares e utilitários).
- `prisma/`: schema do banco de dados, migrações e seed dos dados de demonstração.

## Configuração

Copie `.env.example` para `.env` e preencha os valores:

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | String de conexão do PostgreSQL |
| `JWT_SECRET` | Segredo usado para assinar os tokens de login (gere com `openssl rand -base64 48`) |
| `JWT_EXPIRES_IN` | Validade do token de login (ex.: `7d`) |
| `PORT` | Porta do servidor Express (padrão `3000`) |
| `NODE_ENV` | `development` ou `production` |

## Desenvolvimento local

```bash
npm install
npx prisma migrate dev   # cria/atualiza as tabelas no banco
npm run seed              # popula dados de demonstração e o usuário admin
npm run dev                # inicia o servidor com recarregamento automático
```

A aplicação fica disponível em `http://localhost:3000`.

Usuário administrador criado pelo seed:

- E-mail: `admin@controlesst.com.br`
- Senha: `ControleSST@123`

## Comandos

- `npm run dev`: inicia o servidor em modo desenvolvimento (nodemon).
- `npm start`: inicia o servidor em produção.
- `npm run migrate:dev`: cria/atualiza migrações do banco em desenvolvimento.
- `npm run migrate:deploy`: aplica migrações pendentes em produção.
- `npm run seed`: popula o banco com dados de demonstração.
- `npm run studio`: abre o Prisma Studio para inspecionar o banco.

## Deploy no Render

Use como Web Service no Render (veja `render.yaml` para um Blueprint pronto):

- Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
- Start Command: `npm start`
- Variáveis de ambiente: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV=production`

Após o primeiro deploy, rode `npm run seed` (via Shell do Render) para criar o usuário administrador e os dados de demonstração.
