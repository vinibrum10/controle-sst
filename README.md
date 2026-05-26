# Controle SST

Programa local para controlar tarefas semanais da equipe de SST, prazos, pedidos de ajuda e indicadores de desempenho.

## Como abrir

Abra `abrir-controle-sst.bat` com dois cliques ou abra `index.html` no navegador. Os dados ficam salvos no `localStorage` do próprio navegador.

## O que faz

- Cadastro de pessoas da equipe e capacidade semanal em horas.
- Cadastro de tarefas por semana, responsável, prazo, prioridade e tipo: rotineira ou eventual.
- Dashboard com tarefas ativas, vencidas, próximas do prazo, carga por pessoa e status.
- Botão de pedir ajuda que procura primeiro quem está sem tarefa aberta na semana e depois quem tem maior capacidade livre.
- Rankings de quem mais pede ajuda, quem mais entrega no prazo e quem mais atrasa.
- Exportação e importação dos dados em JSON.

## Observação

Esta primeira versão é local e funciona sem servidor. Para usar em rede com várias pessoas ao mesmo tempo, o próximo passo é transformar a persistência em banco de dados e criar login por usuário.
