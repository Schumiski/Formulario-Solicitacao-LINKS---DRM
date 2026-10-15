# DOCUMENTACAO.md — Formulário de Solicitação de Links de Campanha de Doação
### ONG Amigos do Bem · Versões V1 e V2

> **A V2 (esta pasta) é a versão OFICIAL.** Este documento é a referência das duas versões
> do frontend: a V1 (raiz do projeto) é a versão original, e a V2 é a versão simplificada
> adotada como oficial. Esta pasta é **autocontida** — contém todos os arquivos necessários
> para publicar o site.

Última atualização: 15/10/2026 — V2 oficializada; pasta autocontida para publicação.

---

## 1. Visão geral

Formulário **interno** (preenchido pelos departamentos da ONG) que coleta informações para a
equipe criar **manualmente** um link de campanha em `https://doar.amigosdobem.org/{codigo}`.

- **Backend:** Google Apps Script → Google Sheets + e-mails (GmailApp). Ainda não implementado.
- **Envio:** `POST` JSON para `APPS_SCRIPT_URL` (constante em `script*.js`). Enquanto vazia, o
  envio é **bloqueado com aviso** (não finge sucesso).
- **Publicação prevista:** GitHub Pages (sem build).

### Jornada

| Versão | Etapas |
|---|---|
| V1 | `index.html` → `formulario.html` → `confirmacao.html` |
| V2 | `index-v2.html` → `formulario-v2.html` → `confirmacao-v2.html` |

### Arquivos

| Versão | Arquivos |
|---|---|
| V1 (raiz) — legada | `index.html`, `formulario.html`, `confirmacao.html`, `styles.css`, `script.js` |
| **V2 (`V2/`) — oficial** | `index-v2.html`, `formulario-v2.html`, `confirmacao-v2.html`, `styles-v2.css`, `styles.css` (base importada), `script-v2.js` |

### Estrutura da pasta V2 (autocontida)

```
V2/
├── index-v2.html          # Introdução
├── formulario-v2.html     # Formulário (4 blocos)
├── confirmacao-v2.html    # Confirmação
├── styles-v2.css          # Estilos da V2 (importa styles.css base)
├── styles.css             # Base visual (cópia local — necessária para o @import)
├── script-v2.js           # Lógica: validações, máscaras, repetíveis, envio
└── DOCUMENTACAO.md        # Este documento
```

> Nenhuma referência a arquivos fora da pasta. Todos os caminhos (`href`, `src`, `@import`)
> resolvem dentro de `V2/`.

---

## 2. Diferenças entre V1 e V2

| Aspecto | V1 (raiz) | V2 (`V2/`) |
|---|---|---|
| Departamento | `<select>` com 9 setores + "Outros" (campo condicional) | `<input type="text">` livre |
| Intuito do link | Obrigatório (`intuito_link`) | **Removido** |
| Público-alvo | Obrigatório | Obrigatório |
| Imagens utilizadas (descrição) | Opcional | **Removido** |
| Prazo pronto (≥ hoje + 7 dias) | Obrigatório, bloqueio rígido | **Removido** |
| Pilar/Tema | Select com "Água e Moradia" + opção "Outros" (campo condicional) | Select sem "Outros"; "Água e Moradia" dividido em "Água" e "Moradia" |
| Frequência almejada | Não existe | Novo campo: checkbox (Única/Pontual, Mensal/Recorrente), ≥ 1 opção |
| Frequência padrão | Radio Única/Mensal (independente) | Radio Única/Mensal; se "almejada" tiver 1 opção, pré-marcada automaticamente |
| Valor mínimo | Campo de texto com máscara de moeda (livre) | Radio fixo: R$30 / R$50 / R$100 / Outros (campo condicional com máscara) |
| Código de identificação (slug) | Campo próprio com normalização + prévia da URL | **Campo removido**; slug derivado automaticamente do **nome da campanha** (só prévia, sem edição) |
| Nome da campanha | Obrigatório (`nome`) | Obrigatório (`nome`); alimenta a prévia do slug |
| Tags | Opcional (texto com vírgulas → array) | **Removido** |
| Natureza da doação | Select com 10 opções | **Removido** |
| Título/msg página de agradecimento | Opcionais | **Removidos** |
| Imagem de agradecimento | Padrão do pilar / Personalizada (MKT) | **Removida** |
| Imagem da campanha | Padrão do pilar / Personalizada (MKT) + briefing | Mantida igual |
| Formas de pagamento | PIX Qr Code / Boleto Bancário / Cartão de Crédito (pré-marcadas) | PIX / Boleto Bancário / Cartão de Crédito (pré-marcadas; valor "PIX Qr Code" virou "PIX") |
| Bloco de projetos | "Sobre os Projetos" | Renomeado: "Sobre os Planos de Doação" (mesma estrutura repetível) |
| Dados Adicionais | Chave/valor repetível | Mantido igual |
| Honeypot / fill_ms | Sim | Sim (herdado; `fill_ms` ainda é coletado no envio) |
| Atalho admin (Ctrl+Shift+A) | Sim | Sim |

---

## 3. Schema de dados — V2 (JSON)

Fonte da verdade para o payload montado por `script-v2.js`.

### 3.1 Metadados da solicitação

```json
{
  "submetido_em": "ISO8601",
  "solicitante_nome": "string",          // obrigatório
  "solicitante_email": "string",         // obrigatório
  "solicitante_departamento": "string",  // obrigatório — texto livre
  "fill_ms": "number"                    // milissegundos até o envio (anti-bot)
}
```

### 3.2 Bloco "Sobre a Captação"

```json
{
  "frequencia_almejada": ["Única/Pontual", "Mensal/Recorrente"], // ≥ 1
  "publico_alvo": "string",
  "pilar": "Educação | Trabalho e Renda | Saúde | Água | Moradia | Segurança Alimentar"
}
```

### 3.3 Bloco "Sobre a Página de Doação"

```json
{
  "valor_minimo": "number (BRL)",        // 30 | 50 | 100 | valor digitado em "Outros"
  "frequencia_padrao": "Única | Mensal",
  "exigir_endereco": "boolean",
  "data_inicio": "date (YYYY-MM-DD)",
  "data_fim": "date (YYYY-MM-DD)",       // >= data_inicio
  "formas_pagamento": ["PIX", "Boleto Bancário", "Cartão de Crédito"],
  "nome": "string",                      // obrigatório — alimenta o slug
  "titulo_pagina_inicial": "string",     // opcional
  "mensagem_pagina_inicial": "string",   // opcional
  "imagem_campanha": {
    "tipo": "padrao_pilar | personalizada_mkt",
    "briefing": "string | null"          // exigido se personalizada_mkt
  }
}
```

> **Slug:** não é campo do formulário. O frontend gera a prévia
> `https://doar.amigosdobem.org/{slugify(nome)}` em tempo real. A equipe usa esse slug ao
> criar o link manualmente.

### 3.4 Bloco "Sobre os Planos de Doação" (repetível)

```json
{
  "projetos": [
    {
      "nome": "string",              // obrigatório — Ex.: Água / Alimento / Educação / Outros
      "valor_sugerido": "number | null", // null = valor em aberto
      "descricao": "string"          // obrigatório
    }
  ]
}
```

### 3.5 Bloco "Sobre os Dados Adicionais" (repetível)

```json
{
  "dados_adicionais": [
    { "rotulo": "string", "valor": "string" }
  ]
}
```

### 3.6 Campos removidos em relação à V1

`intuito_link`, `imagens_utilizadas`, `prazo_pronto`, `codigo_identificacao` (como input),
`tags`, `natureza_da_doacao`, `titulo_pagina_agradecimento`,
`mensagem_pagina_agradecimento`, `imagem_agradecimento`, `solicitante_departamento_outro`,
`pilar_outro`.

---

## 4. Validações client-side — V2

| # | Regra | Mensagem |
|---|---|---|
| V1 | Campos obrigatórios preenchidos (solicitante_nome, solicitante_departamento, publico_alvo, pilar, nome) | Mensagem específica por campo |
| V2 | Nome da campanha precisa gerar slug não vazio | "O nome da campanha deve conter letras ou números para gerar o link." |
| V3 | E-mail válido | "Informe um e-mail válido do solicitante." |
| V4 | ≥ 1 frequência almejada | "Selecione a frequência de doação almejada." |
| V5 | Frequência padrão marcada | "Selecione a frequência padrão." |
| V6 | Exigir endereço marcado | "Informe se o endereço é obrigatório." |
| V7 | Tipo da imagem da campanha marcado | "Selecione o tipo da imagem da campanha." |
| V8 | Opção de valor mínimo marcada | "Selecione o valor mínimo travado da doação." |
| V9 | Valor mínimo final > 0 | "O valor mínimo deve ser maior que zero." |
| V10 | `data_inicio` preenchida | "Informe a data de início." |
| V11 | `data_fim` preenchida | "Informe a data de fim." |
| V12 | `data_fim >= data_inicio` | "A data de fim deve ser igual ou posterior à data de início." |
| V13 | ≥ 1 forma de pagamento | "Selecione ao menos uma forma de pagamento." |
| V14 | Briefing se imagem personalizada | "Descreva a arte personalizada da campanha solicitada ao MKT." |
| V15 | ≥ 1 plano; nome e descrição obrigatórios | "Adicione ao menos um plano." / "Preencha nome e descrição de cada plano." |
| V16 | Dado adicional: rótulo e valor | "Preencha rótulo e valor de cada dado adicional." |

### Máscaras / normalizações
- **Moeda (R$):** dígitos → `0,00` (pt-BR). Campos `valor_minimo_outro`, `projeto_valor`.
- **Slug:** derivado de `nome` (minúsculas, sem acentos, espaços → `-`); usado só na prévia.
- **Datas mínimas:** `data_inicio >= hoje`; `data_fim >= data_inicio`.

### Anti-bot
- Honeypot (`website`, oculto) + `fill_ms` no payload (tempo de preenchimento).

> **Regra do Protocolo 0:** na Fase do backend, todas as validações devem ser **revalidadas
> no servidor** (Apps Script). Nunca confiar só no cliente.

### Verificação (15/10/2026) — formulário analisado e comprovado

Teste automatizado **leave-one-out** (jsdom, 24 cenários): para cada campo obrigatório,
o formulário foi preenchido exceto aquele campo → **envio bloqueado com a mensagem
esperada**; formulário totalmente vazio → bloqueado; tudo preenchido → `validate()` passa
e o envio só é retido pelo endpoint não configurado. **Resultado: 24/24 OK.**

Cobertura confirmada (HTML `required`/`*` × `validate()`):

| Grupo | Cenários testados |
|---|---|
| Solicitante | nome vazio · e-mail vazio · e-mail inválido · departamento vazio |
| Captação | frequência almejada vazia · público-alvo vazio · pilar vazio |
| Página de doação | frequência padrão vazia · exigir endereço vazio · datas vazias · fim < início · formas de pagamento vazias · nome vazio · nome sem slug válido · valor mínimo sem opção · "Outros" sem valor · imagem sem tipo · imagem personalizada sem briefing |
| Planos | plano sem nome · plano sem descrição |
| Dados adicionais | item adicionado e vazio (bloqueado) |

Notas de comportamento (por design):
- Campos **opcionais**: `titulo_pagina_inicial`, `mensagem_pagina_inicial`,
  `projeto_valor`, `imagens_utilizadas` (inexistente na V2) e **zero itens** em
  Dados Adicionais (lista opcional; itens existentes são todos obrigatórios).
- O `<form>` usa `novalidate`: a validação nativa do navegador está desligada e todo o
  bloqueio vem do `validate()` do JS (mensagens customizadas + scroll até o campo).

---

## 5. Envio

- `POST` para `APPS_SCRIPT_URL` (em `script-v2.js`, linha 10) com
  `mode: "cors"` e `Content-Type: text/plain;charset=UTF-8` (workaround padrão do Apps Script).
- Espera resposta JSON `{ ok: true }`; qualquer falha reabilita o botão e mostra alerta.
- Enquanto `APPS_SCRIPT_URL` estiver vazio, envio bloqueado com aviso (não finge sucesso).
- Página de confirmação: `confirmacao-v2.html`.

---

## 6. Publicação (subir o site)

A pasta `V2/` é a raiz do site. Publicação prevista no **GitHub Pages** (sem build):

1. Publicar a pasta `V2/` como raiz do site (repositório dedicado, subpasta via Actions,
   ou mover o conteúdo de `V2/` para a raiz do repositório).
2. Página inicial: `index-v2.html` (renomear para `index.html` na raiz publicada, se o
   provedor não aceitar nome alternativo).
3. Preencher `APPS_SCRIPT_URL` em `script-v2.js` (linha 10) com a URL `/exec` do Web App
   do Google Apps Script — **sem isso o envio fica bloqueado por design**.
4. Testar a jornada completa: intro → formulário → envio → confirmação.

### Checklist antes de publicar

- [x] HTML/CSS/JS todos dentro de `V2/` (sem dependências externas)
- [x] `styles.css` base copiado para dentro de `V2/` (resolve o `@import`)
- [x] CSP e `no-referrer` presentes nas 3 páginas
- [ ] `APPS_SCRIPT_URL` preenchida (aguarda backend)
- [ ] Domínio/HTTPS do hosting configurado

---

## 7. Pendências (comuns às duas versões)

1. **Backend** `apps-script.gs`: gravação na planilha (aba "Respostas"), validação
   server-side, e-mail de confirmação ao solicitante e aviso à equipe (GmailApp).
2. **Handshake do endpoint** testado de ponta a ponta.
3. **Painel de gestão** (`admin.html` / `admin.js`): login, listagem, status, exportação CSV.
4. ~~Definir versão oficial~~ — **Resolvido: a V2 é a oficial** (15/10/2026).
   Pendência documental: atualizar `../gemini.md` e POPs em `../architecture/` para
   refletir o schema da V2 (Protocolo 0: documento antes do código).

---

## 8. Regras mantidas das duas versões

1. Sem upload de imagem — arte padrão do pilar ou briefing ao MKT.
2. Sem segredos no frontend; CSP e `no-referrer` nas páginas.
3. Nunca perder dados silenciosamente — falha de envio sempre avisada.
4. Campos repetíveis com `<template>` + adicionar/remover; payload lido do DOM.
5. LGPD: dados tratados conforme a política da ONG.
