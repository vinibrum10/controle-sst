# Controle SST — Frontend (React)

Novo front-end em Vite + React + TypeScript + Tailwind CSS, em migração
gradual (tela por tela) a partir do front-end vanilla JS em `../src`.

## Status da migração

- [x] Login (e-mail/senha + cadastro)
- [ ] Layout principal / sidebar
- [ ] Dashboard
- [ ] Funcionários
- [ ] Criar tarefa
- [ ] Kanban (execução de tarefas)
- [ ] Apoio e ajuda
- [ ] Treinamentos
- [ ] Inspeções e auditorias
- [ ] Dados do programa
- [ ] Configurações

Enquanto a migração não termina, o front-end vanilla em `../src` continua
sendo o servido em produção (ver `server/index.js`).

## Desenvolvimento

```bash
npm install
npm run dev
```

O servidor de desenvolvimento roda em `http://localhost:5173` e faz proxy
de `/api/*` para o backend Express em `http://localhost:3000` (rode
`npm run dev` na raiz do projeto para subir a API).

## Build

```bash
npm run build
```

Gera os arquivos estáticos em `web/dist`.
