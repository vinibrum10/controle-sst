# SGEPI — Sistema de Gestão de Equipes e Programas Institucionais

Sistema online para gerenciar tarefas semanais de equipes, prazos, pedidos de apoio e indicadores de desempenho, além de programas institucionais de SST (Rota Segura, Rota Segura 2026, Treinamentos, Inspeções e Auditorias). Os dados ficam armazenados em um banco PostgreSQL e podem ser acessados por toda a equipe, com login por usuário e controle de permissões por perfil.

## O que faz

- Login por e-mail e senha, com perfis ADMIN, GESTOR, TST, VISUALIZADOR e COLABORADOR.
- Cadastro de pessoas da equipe, capacidade semanal em horas e foto.
- Cadastro de tarefas por semana, responsável, prazo, prioridade e tipo: rotineira ou eventual.
- Quadro Kanban de execução de tarefas (pendente, em andamento, concluída) com arrastar e soltar.
- Dashboard com indicadores, carga por pessoa, status das tarefas e rankings.
- Pedido de apoio automático: o programa procura primeiro quem está sem tarefa aberta na semana e depois quem tem maior capacidade livre.
- Envio automático de e-mail (pelo backend) ao criar uma tarefa com responsável cadastrado e ao designar apoio - sem depender de cliente de e-mail (`mailto:`).
- Programas de SST: Rota Segura, Treinamentos, Inspeções e Auditorias, com achados e planos de ação.
- Rota Segura 2026: edições, critérios, regras, equipes, avaliações de APR, penalidades, ranking e premiações.
- Exportação e importação dos dados em JSON, e restauração dos dados de demonstração (apenas Administrador).
- Layout responsivo (desktop, tablet e celular) com menu lateral organizado por módulos.

## Estrutura do projeto

- `web/`: front-end em Vite + React + TypeScript + Tailwind CSS (veja `web/README.md`). O build (`web/dist`) é servido pelo Express em produção.
- `server/`: API REST em Express (rotas, middlewares e utilitários, incluindo envio de e-mail em `server/utils/mailer.js` e `server/utils/notificacoes.js`).
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
| `SMTP_HOST` | Servidor SMTP para envio automático de e-mail (ex.: `smtp.gmail.com`) |
| `SMTP_PORT` | Porta do servidor SMTP (`587` para TLS/STARTTLS, `465` para SSL) |
| `SMTP_SECURE` | `true` para conexão SSL direta (porta 465) ou `false` para STARTTLS (587) |
| `SMTP_USER` | Usuário de autenticação no servidor SMTP |
| `SMTP_PASS` | Senha/token de autenticação no servidor SMTP |
| `SMTP_FROM` | E-mail exibido como remetente das notificações (padrão: `SMTP_USER`) |

### Envio automático de e-mail

Ao criar uma tarefa com um responsável que tenha e-mail cadastrado, e ao designar uma pessoa de apoio (pedido de ajuda automático), o backend envia uma notificação por e-mail automaticamente - sem abrir nenhum cliente de e-mail na tela.

- Se `SMTP_HOST`, `SMTP_USER` e `SMTP_PASS` estiverem configurados no `.env`, o e-mail é enviado de verdade via SMTP.
- Se essas variáveis **não** estiverem configuradas, o envio fica desativado: o sistema registra a tentativa no log do servidor (sem expor credenciais) e a interface exibe uma mensagem informando que o envio automático não está configurado.
- Em ambos os casos, o usuário recebe uma mensagem clara de sucesso ou de erro/aviso na tela após criar a tarefa ou solicitar apoio.

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

## Usuários e perfis (papéis)

O seed cria um usuário administrador padrão:

- E-mail: `admin@controlesst.com.br`
- Senha: `ControleSST@123`

Demais usuários podem se cadastrar pela tela de login e começam com o perfil `COLABORADOR`; um ADMIN pode alterar o perfil em **Administração > Usuários**. Perfis disponíveis:

| Perfil | Acesso |
| --- | --- |
| `ADMIN` | Acesso total, incluindo gestão de usuários, configuração das edições do Rota Segura 2026, importação/restauração de dados e exclusão de registros. |
| `GESTOR` | Gestão de funcionários, tarefas, programas de SST (treinamentos, inspeções, auditorias, rotas seguras) e exportação de dados. |
| `TST` | Lançamento e edição de treinamentos, inspeções, auditorias, achados, planos de ação e avaliações/penalidades do Rota Segura 2026. |
| `VISUALIZADOR` | Consulta de funcionários e demais áreas liberadas para leitura. |
| `COLABORADOR` | Acesso às próprias tarefas, execução/Kanban e pedidos de apoio. |

As áreas administrativas (ex.: Usuários, Configuração da edição do Rota Segura 2026) só aparecem no menu para usuários `ADMIN` e também são bloqueadas no backend para os demais perfis.

## Principais módulos

- **Dashboard**: indicadores semanais, carga por pessoa, status das tarefas e rankings.
- **Tarefas**: criação de tarefas e quadro Kanban de execução (pendente, em andamento, concluída).
- **Equipe**: cadastro de funcionários e pedidos de apoio/ajuda automática.
- **Programas de SST**: Rota Segura (rotas, desvios e planos de ação), Treinamentos, Inspeções e Auditorias.
- **Rota Segura 2026**: edições, critérios, regras, equipes/colaboradores, avaliações de APR, penalidades, ranking e premiações.
- **Administração**: relatórios, dados do programa (exportar/importar/restaurar), usuários e configurações.

## Comandos

- `npm run dev`: inicia o servidor em modo desenvolvimento (nodemon).
- `npm run build`: instala as dependências do front-end e gera `web/dist`.
- `npm start`: inicia o servidor em produção, servindo a API e `web/dist`.
- `npm run migrate:dev`: cria/atualiza migrações do banco em desenvolvimento.
- `npm run migrate:deploy`: aplica migrações pendentes em produção.
- `npm run seed`: popula o banco com dados de demonstração.
- `npm run studio`: abre o Prisma Studio para inspecionar o banco.
- `npm test`: executa a suíte de testes do backend (Jest).

## Deploy no Render

Use como Web Service no Render (veja `render.yaml` para um Blueprint pronto):

- Build Command: `npm install && npm run build && npx prisma generate && npx prisma migrate deploy`
- Start Command: `npm start`
- Variáveis de ambiente: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV=production` e, para envio automático de e-mail, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.

Após o primeiro deploy, rode `npm run seed` (via Shell do Render) para criar o usuário administrador e os dados de demonstração.

## Deploy no Railway

O projeto inclui um `railway.json` com a configuração do build, start e health check:

- Build Command: `npm install && npm run build && npx prisma migrate deploy`
- Start Command: `npm start`
- Health Check Path: `/api/health`
- Variáveis de ambiente obrigatórias: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV=production`, `PORT` (o Railway define automaticamente). Para envio automático de e-mail, configure também `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.

Requisitos:

- Node.js `^20.19.0` ou `>=22.12.0` (definido em `.nvmrc` e em `engines` do `package.json`, exigido pelo Vite 8 usado no front-end).

Checklist de verificação pós-deploy:

1. Acompanhe os logs do build no painel do Railway e confirme que `web/dist` foi gerado (procure por `vite build` e `built in`) e que `npx prisma migrate deploy` rodou sem erros.
2. Acesse `https://<seu-dominio>.up.railway.app/api/health` e confirme `{"status":"ok","database":"ok"}`.
3. Acesse a raiz do domínio e confirme que a SPA React carrega (tela de login).
4. Confirme nas variáveis de ambiente do serviço: `DATABASE_URL` (apontando para o Postgres do projeto), `JWT_SECRET`, `JWT_EXPIRES_IN` e `NODE_ENV=production`.
5. Após o primeiro deploy, rode `npm run seed` (via terminal/CLI do Railway) para criar o usuário administrador e os dados de demonstração, se necessário.
6. Se for usar envio automático de e-mail, confirme `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` e `SMTP_FROM` e cheque os logs do servidor ao criar uma tarefa para confirmar o envio (`[email] Notificação ... enviada para ...`).
