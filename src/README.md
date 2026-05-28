# Arquitetura futura

O app atual continua funcionando como site estatico em `index.html`, `styles.css` e `app.js`.

Esta pasta prepara a organizacao para uma proxima fase em modulos:

- `components/`: partes reutilizaveis da interface.
- `pages/`: telas principais do sistema.
- `services/`: integracoes com OneDrive, planilha, e-mail ou banco de dados.
- `data/`: dados temporarios, mocks e configuracoes compartilhadas.

Quando o projeto migrar para React/Vite ou outro empacotador, a navegacao criada por rotas internas podera ser movida para arquivos dentro desta estrutura.
