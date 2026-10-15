# POP-03 — Frontend

## Arquivos
| Arquivo | Finalidade |
|---|---|
| `index.html` | Introdução e entrada da jornada |
| `formulario.html` | Formulário principal (4 blocos + solicitante) |
| `confirmacao.html` | Mensagem final |
| `styles.css` | Identidade visual Amigos do Bem, responsivo |
| `script.js` | Navegação, validações, máscaras, campos repetíveis, envio |

## Blocos do formulário
1. Identificação do solicitante.
2. Sobre a Campanha.
3. Sobre o link.
4. Sobre os Projetos (repetível).
5. Sobre os Dados Adicionais (repetível).

## Campos repetíveis
- Implementados com `<template>` (`#projetoTemplate`, `#dadoTemplate`) e botões
  "Adicionar"/"Remover". O primeiro item já vem criado no carregamento.
- `script.js` não depende do índice visual; lê os itens do DOM ao montar o payload.

## Envio
- `POST` para a constante `APPS_SCRIPT_URL` (a ser preenchida na Fase do backend).
- Payload JSON construído por `script.js` (ver POP-01).
- Enquanto `APPS_SCRIPT_URL` estiver vazio, o envio é **bloqueado com aviso** (não finge
  sucesso) — coerente com a Regra de Ouro do protocolo (não simular integração real).

## Segurança
- CSP e `no-referrer` nas páginas (molde PQT).
- Sem segredos no frontend.

## Pendências do backend (Fase posterior)
- `apps-script.gs` (gravação + e-mails).
- Painel de gestão (`admin.html`/`admin.js`).
- Publicação (GitHub Pages + Web App).
