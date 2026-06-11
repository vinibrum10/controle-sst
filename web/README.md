# Controle SST — Frontend (React)

Front-end em Vite + React + TypeScript + Tailwind CSS. Substitui o antigo
front-end vanilla JS e é o front-end servido em produção (ver
`server/index.js`).

## Telas migradas

- [x] Login (e-mail/senha + cadastro)
- [x] Layout principal / sidebar
- [x] Dashboard
- [x] Funcionários
- [x] Criar tarefa
- [x] Kanban (execução de tarefas)
- [x] Apoio e ajuda
- [x] Rota Segura
- [x] Treinamentos
- [x] Inspeções e auditorias
- [x] Dados do programa
- [x] Configurações

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

Gera os arquivos estáticos em `web/dist`, servidos pelo Express em produção.
