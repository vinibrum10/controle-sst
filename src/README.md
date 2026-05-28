# Arquitetura do Controle SST

O deploy atual continua estatico e usa os arquivos da raiz:

- `index.html`
- `styles.css`
- `app.js`
- `build-netlify.js`

A pasta `src/` organiza a evolucao do sistema em modulos. Ela espelha as rotas e componentes atuais para facilitar uma migracao futura para React, Vite ou outro empacotador, sem quebrar o Netlify Drop atual.

## Pastas

- `components/`: componentes reutilizaveis de tela, como menu lateral, cabecalho, cards e listas.
- `pages/`: paginas/rotas principais do sistema.
- `services/`: integracoes e regras de acesso a dados, como localStorage, OneDrive e futuras APIs.
- `data/`: configuracoes compartilhadas, como grupos de navegacao e mapa de rotas.

## Regra de crescimento

Para adicionar uma nova funcionalidade, crie primeiro a pagina em `pages/`, registre a rota em `data/navigation.js` e depois conecte a tela real no app atual.
