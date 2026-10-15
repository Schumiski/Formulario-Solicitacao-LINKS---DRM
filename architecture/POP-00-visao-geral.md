# POP-00 — Visão Geral

## Objetivo
Formulário interno para os departamentos da ONG Amigos do Bem solicitarem a criação de um
link de campanha de doação. A equipe responsável cria o link **manualmente** na plataforma
(`doar.amigosdobem.org`).

## Entradas
- Dados do solicitante (nome, e-mail, departamento).
- Bloco "Sobre a Campanha" (intuito, público, imagens, prazo, pilar).
- Bloco "Sobre o link" (configuração da campanha).
- Bloco "Sobre os Projetos" (lista repetível).
- Bloco "Sobre os Dados Adicionais" (lista repetível chave/valor).

## Saídas
- Payload JSON enviado ao Google Apps Script (Sheets + e-mails). *(Fase posterior.)*
- Tela de confirmação ao usuário.

## Etapas da jornada
`index.html` (Introdução) → `formulario.html` (Formulário) → `confirmacao.html` (Confirmação).

## Escopo desta entrega (Fase A — frontend)
- Páginas HTML, estilos e validações client-side.
- **Fora do escopo agora:** `apps-script.gs`, painel de gestão, publicação.

## Casos de borda
- Prazo menor que 7 dias → bloqueado.
- Slug com caracteres inválidos → normalizado/avisado.
- Datas incoerentes (`data_fim < data_inicio`) → bloqueado.
- Nenhum projeto informado → bloqueado.
- Nenhuma forma de pagamento marcada → bloqueado.
