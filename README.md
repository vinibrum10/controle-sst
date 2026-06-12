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

- `web/`: front-end em Vite + React + TypeScript + Tailwind CSS (veja `web/README.md`). O build (`web/dist`) é servido pelo Express em produção.
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
npm run dev                # inicia o servidor com recarregamento automático (API na porta 3000)
```

Em outro terminal, inicie o front-end React:

```bash
cd web
npm install
npm run dev   # inicia o Vite na porta 5173, com proxy de /api para http://localhost:3000
```

Durante o desenvolvimento, a aplicação fica disponível em `http://localhost:5173`.

Para rodar a aplicação completa como em produção (front-end já compilado e servido pelo Express):

```bash
npm install
npm run build   # compila o front-end em web/dist
npm start       # serve a API e o front-end em http://localhost:3000
```

Usuário administrador criado pelo seed:

- E-mail: `admin@controlesst.com.br`
- Senha: `ControleSST@123`

## Comandos

- `npm run dev`: inicia o servidor em modo desenvolvimento (nodemon).
- `npm run build`: instala as dependências do front-end e gera `web/dist`.
- `npm start`: inicia o servidor em produção, servindo a API e `web/dist`.
- `npm run migrate:dev`: cria/atualiza migrações do banco em desenvolvimento.
- `npm run migrate:deploy`: aplica migrações pendentes em produção.
- `npm run seed`: popula o banco com dados de demonstração.
- `npm run studio`: abre o Prisma Studio para inspecionar o banco.

## Deploy no Render

Use como Web Service no Render (veja `render.yaml` para um Blueprint pronto):

- Build Command: `npm install && npm run build && npx prisma generate && npx prisma migrate deploy`
- Start Command: `npm start`
- Variáveis de ambiente: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV=production`

Após o primeiro deploy, rode `npm run seed` (via Shell do Render) para criar o usuário administrador e os dados de demonstração.

## Deploy no Railway

O projeto inclui um `railway.json` com a configuração do build, start e health check:

- Build Command: `npm install && npm run build && npx prisma migrate deploy`
- Start Command: `npm start`
- Health Check Path: `/api/health`
- Variáveis de ambiente obrigatórias: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV=production`, `PORT` (o Railway define automaticamente)

Requisitos:

- Node.js `^20.19.0` ou `>=22.12.0` (definido em `.nvmrc` e em `engines` do `package.json`, exigido pelo Vite 8 usado no front-end).

Checklist de verificação pós-deploy:

1. Acompanhe os logs do build no painel do Railway e confirme que `web/dist` foi gerado (procure por `vite build` e `built in`) e que `npx prisma migrate deploy` rodou sem erros.
2. Acesse `https://<seu-dominio>.up.railway.app/api/health` e confirme `{"status":"ok","database":"ok"}`.
3. Acesse a raiz do domínio e confirme que a SPA React carrega (tela de login).
4. Confirme nas variáveis de ambiente do serviço: `DATABASE_URL` (apontando para o Postgres do projeto), `JWT_SECRET`, `JWT_EXPIRES_IN` e `NODE_ENV=production`.
5. Após o primeiro deploy, rode `npm run seed` (via terminal/CLI do Railway) para criar o usuário administrador e os dados de demonstração, se necessário.
