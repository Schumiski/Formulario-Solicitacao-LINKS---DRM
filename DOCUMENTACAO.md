# DOCUMENTACAO.md — Formulário de Solicitação de Links de Campanha de Doação
### ONG Amigos do Bem · Versões V1 e V2

> **A V2 (esta pasta) é a versão OFICIAL.** Este documento é a referência das duas versões
> do frontend: a V1 (raiz do projeto) é a versão original, e a V2 é a versão simplificada
> adotada como oficial. Esta pasta é **autocontida** — contém todos os arquivos necessários
> para publicar o site.

Última atualização: 16/10/2026 — modo referência compartilha datas, nome, título e texto.

---

## 1. Visão geral

Formulário **interno** (preenchido pelos departamentos da ONG) que coleta informações para a
equipe criar **manualmente** um link de campanha em `https://doar.amigosdobem.org/{codigo}`.

- **Backend:** Google Apps Script → Google Sheets + e-mails (GmailApp). Pronto em
  `apps-script.gs` — falta implantar (ver README).
- **Envio:** `POST` JSON para `APPS_SCRIPT_URL` (constante em `script.js`). Enquanto vazia, o
  envio é **bloqueado com aviso** (não finge sucesso).
- **Publicação prevista:** GitHub Pages (sem build).

### Jornada

| Versão | Etapas |
|---|---|
| V1 | `index.html` → `formulario.html` → `confirmacao.html` |
| V2 | `index.html` → `formulario.html` → `confirmacao.html` |

### Arquivos

| Versão | Arquivos |
|---|---|
| V1 (raiz) — legada | `index.html`, `formulario.html`, `confirmacao.html`, `styles.css`, `script.js` |
| **V2 (`V2/`) — oficial** | `index.html`, `formulario.html`, `confirmacao.html`, `styles.css`, `script.js` |

> As duas versões usam os **mesmos nomes de arquivo**, em pastas diferentes. Ao publicar,
> suba apenas o conteúdo de `V2/`.

### Estrutura da pasta V2 (autocontida)

```
V2/
├── index.html             # Introdução
├── formulario.html        # Formulário (4 blocos)
├── confirmacao.html       # Confirmação
├── styles.css             # Estilos (base + ajustes da V2, em um único arquivo)
├── script.js              # Lógica: validações, máscaras, repetíveis, envio
├── DOCUMENTACAO.md        # Este documento
└── README.md              # Guia rápido
```

> Nenhuma referência a arquivos fora da pasta. Todos os caminhos (`href`, `src`)
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
| Pilar/Tema | Select com "Água e Moradia" + opção "Outros" (campo condicional) | Select sem "Outros"; "Água e Moradia" dividido em "Água" e "Moradia"; **múltipla escolha** (1 ou mais) |
| Frequência almejada | Não existe | Novo campo: checkbox (Única/Pontual, Mensal/Recorrente), ≥ 1 opção |
| Frequência padrão | Radio Única/Mensal (independente) | Radio Única/Mensal; se "almejada" tiver 1 opção, pré-marcada automaticamente |
| Campanha de referência | Não existe | Novo campo decisivo (primeiro de "Sobre a Página de Doação"): Sim/Não; se Sim, aparecem URL + ID do link **e** datas, nome, título, texto e imagem (esses campos são comuns aos dois modos); ocultos no Sim: frequência padrão, exigir endereço e formas de pagamento |
| Valor mínimo | Campo de texto com máscara de moeda (livre) | Campo único de texto com máscara (obrigatório; > 0; nos dois modos); último item de Planos |
| Código de identificação (slug) | Campo próprio com normalização + prévia da URL | **Campo removido**; slug derivado automaticamente do **nome da campanha** (só prévia, sem edição) |
| Nome da campanha | Obrigatório (`nome`) | Obrigatório (`nome`); alimenta a prévia do slug |
| Tags | Opcional (texto com vírgulas → array) | **Removido** |
| Natureza da doação | Select com 10 opções | **Removido** |
| Título/msg página de agradecimento | Opcionais | **Removidos** |
| Imagem de agradecimento | Padrão do pilar / Personalizada (MKT) | **Removida** |
| Imagem da campanha | Padrão do pilar / Personalizada (MKT) + briefing | Mantida; personalizada exige **ID do briefing** já solicitado ao MKT; exibida nos dois modos |
| Formas de pagamento | PIX Qr Code / Boleto Bancário / Cartão de Crédito (pré-marcadas) | PIX / Boleto Bancário / Cartão de Crédito (pré-marcadas; valor "PIX Qr Code" virou "PIX") |
| Bloco de projetos | "Sobre os Projetos" | Renomeado: "Sobre os Planos de Doação"; novo radio "Usar Plano Padrão" (pré-marcado) × "Plano Personalizado" — a lista repetível só aparece no modo personalizado |
| Dados Adicionais | Chave/valor repetível | **Removido da V2** (16/10/2026) |
| Honeypot / fill_ms | Sim | Sim (honeypot enviado no payload; `fill_ms` validado no servidor) |
| Atalho admin (Ctrl+Shift+A) | Sim | Removido (reentra junto com o painel) |

---

## 3. Schema de dados — V2 (JSON)

Fonte da verdade para o payload montado por `script.js`.

### 3.1 Metadados da solicitação

```json
{
  "submetido_em": "ISO8601",
  "solicitante_nome": "string",          // obrigatório
  "solicitante_email": "string",         // obrigatório — domínio precisa estar em CONFIG.DOMINIOS_EMAIL (servidor)
  "solicitante_departamento": "string",  // obrigatório — texto livre
  "website": "string",                   // honeypot (campo oculto) — sempre vazio em uso real
  "fill_ms": "number"                    // milissegundos até o envio (anti-bot)
}
```

### 3.2 Bloco "Sobre a Captação"

```json
{
  "frequencia_almejada": ["Única/Pontual", "Mensal/Recorrente"], // ≥ 1
  "publico_alvo": "string",
  "pilar": ["Educação | Trabalho e Renda | Saúde | Água | Moradia | Segurança Alimentar"] // ≥ 1 (múltipla escolha)
}
```

### 3.3 Bloco "Sobre a Página de Doação"

```json
{
  "campanha_referencia": "boolean",      // obrigatório — true = usar campanha existente como modelo
  "campanha_referencia_url": "string",   // exigido se campanha_referencia = true
  "campanha_referencia_id": "string",    // exigido se campanha_referencia = true
  "valor_minimo": "number (BRL)",        // texto com máscara; obrigatório nos dois modos; > 0
  "frequencia_padrao": "Única | Mensal", // exigido se campanha_referencia = false
  "exigir_endereco": "boolean | null",   // exigido se campanha_referencia = false
  "data_inicio": "date (YYYY-MM-DD)",    // >= hoje; exigido nos dois modos
  "data_fim": "date (YYYY-MM-DD)",       // >= data_inicio; exigido nos dois modos
  "formas_pagamento": ["PIX", "Boleto Bancário", "Cartão de Crédito"], // ≥ 1 se campanha_referencia = false
  "nome": "string",                      // exigido nos dois modos — gera o slug
  "titulo_pagina_inicial": "string",     // opcional (nos dois modos)
  "mensagem_pagina_inicial_tipo": "padrao | personalizada", // obrigatório; pré-marcado "padrao"
  "mensagem_pagina_inicial": "string",   // exigido se tipo = personalizada; vazio se padrao
  "imagem_campanha": {                   // exigido nos dois modos
    "tipo": "padrao_pilar | personalizada_mkt",
    "briefing": "string | null"          // exigido se personalizada_mkt — ID do briefing solicitado ao MKT
  }
}
```

> **Campanha de referência:** primeiro item de "Sobre a Página de Doação". Se **Sim**,
> aparecem "Insira a URL do link", "Insira o ID do link" **e também** "Data de início",
> "Data de fim", "Nome da Campanha", "Título da Página de Doação", "Texto da Página de
> Doação" e "Imagem da Campanha"; ocultos no modo Sim: frequência padrão, exigir endereço
> e formas de pagamento (enviados zerados). Se **Não**, a configuração manual completa é
> exigida. Datas, nome e imagem são **obrigatórios nos dois modos**; título e texto são
> opcionais nos dois modos. O bloco "Sobre os Planos de Doação" (incl. valor mínimo) vale
> nos dois modos.

> **Slug:** não é campo do formulário. O frontend gera a prévia
> `https://doar.amigosdobem.org/{slugify(nome)}` em tempo real (nos dois modos). A equipe
> usa esse slug ao criar o link manualmente.

> **Texto da página:** radio "Usar texto padrão" (pré-marcado — a página usa o texto
> padrão da plataforma) × "Texto personalizado" (exibe a área de escrita, obrigatória se
> selecionada; ao voltar para "padrão", o texto é limpo). O payload registra
> `mensagem_pagina_inicial_tipo`; `mensagem_pagina_inicial` só vem preenchido no modo
> personalizado. Vale nos dois modos (referência e manual).

### 3.4 Bloco "Sobre os Planos de Doação"

```json
{
  "planos_tipo": "padrao | personalizado", // obrigatório; pré-marcado "padrao"
  "projetos": [                         // só se planos_tipo = personalizado (vazio se padrao)
    {
      "nome": "string",              // obrigatório — Ex.: Água / Alimento / Educação / Outros
      "valor_sugerido": "number | null", // null = valor em aberto
      "descricao": "string"          // obrigatório
    }
  ]
}
```

> **Planos:** radio "Usar Plano Padrão" (pré-marcado — a equipe usa os planos padrão da
> plataforma; a lista fica oculta e `projetos` é enviado vazio) × "Plano Personalizado"
> (a lista repetível é exibida; itens obrigatórios). O valor mínimo travado é o **último**
> item do bloco (campo único de texto com máscara, obrigatório nos dois modos).

### 3.5 Campos removidos em relação à V1 e descontinuados na V2

`intuito_link`, `imagens_utilizadas`, `prazo_pronto`, `codigo_identificacao` (como input),
`tags`, `natureza_da_doacao`, `titulo_pagina_agradecimento`,
`mensagem_pagina_agradecimento`, `imagem_agradecimento`, `solicitante_departamento_outro`,
`pilar_outro`. Descontinuados na V2 em 16/10/2026: `dados_adicionais` (bloco "Sobre os
Dados Adicionais" removido), `valor_minimo_opcao` e `valor_minimo_outro` (viraram o
campo único `valor_minimo`).

---

## 4. Validações client-side — V2

> **Modo manual × referência:** as regras marcadas com *(manual)* valem só quando
> "Usar campanha de referência?" = **Não**. Com **Sim**, exigem-se URL + ID do link de
> referência, além das regras comuns (datas, nome e imagem — obrigatórios nos dois
> modos). Frequência padrão, endereço e formas de pagamento são *(manual)*.

| # | Regra | Mensagem |
|---|---|---|
| V1 | Campos obrigatórios preenchidos (solicitante_nome, solicitante_departamento, publico_alvo) | Mensagem específica por campo |
| V2 | Nome da campanha precisa gerar slug não vazio (nos dois modos) | "O nome da campanha deve conter letras ou números para gerar o link." |
| V3 | E-mail válido | "Informe um e-mail válido do solicitante." |
| V4 | ≥ 1 frequência almejada | "Selecione a frequência de doação almejada." |
| V5 | Frequência padrão marcada *(manual)* | "Selecione a frequência padrão." |
| V6 | Exigir endereço marcado *(manual)* | "Informe se o endereço é obrigatório." |
| V7 | Tipo da imagem da campanha marcado (nos dois modos) | "Selecione o tipo da imagem da campanha." |
| V8 | Valor mínimo preenchido (campo texto com máscara) | "Informe o valor mínimo travado da doação." |
| V9 | Valor mínimo final > 0 | "O valor mínimo deve ser maior que zero." |
| V10 | `data_inicio` preenchida, >= hoje e formato YYYY-MM-DD (nos dois modos) | "Informe a data de início." / "A data de início não pode ser anterior a hoje." |
| V11 | `data_fim` preenchida e formato YYYY-MM-DD (nos dois modos) | "Informe a data de fim." |
| V12 | `data_fim >= data_inicio` (nos dois modos) | "A data de fim deve ser igual ou posterior à data de início." |
| V13 | ≥ 1 forma de pagamento *(manual)* | "Selecione ao menos uma forma de pagamento." |
| V14 | Briefing (ID) se imagem personalizada (nos dois modos) | "Informe o ID do briefing solicitado ao MKT." |
| V15 | Se plano personalizado: ≥ 1 plano; nome e descrição obrigatórios | "Adicione ao menos um plano." / "Preencha nome e descrição de cada plano." |
| V16 | Tipo dos planos marcado (`planos_tipo`; pré-marcado "padrao") | "Selecione usar plano padrão ou plano personalizado." |
| V17 | ≥ 1 pilar/tema (múltipla escolha) | "Selecione ao menos um pilar/tema." |
| V18 | Campanha de referência marcada (Sim/Não) | "Informe se será usada campanha de referência." |
| V19 | Se referência = Sim: URL válida (http:// ou https://) | "Insira a URL do link de referência (começando com http:// ou https://)." |
| V20 | Se referência = Sim: ID preenchido | "Insira o ID do link de referência." |
| V21 | Tipo do texto da página marcado (pré-marcado "padrão") | "Selecione usar texto padrão ou texto personalizado." |
| V22 | Se texto = personalizado: texto preenchido | "Escreva o texto personalizado da página de doação." |

### Máscaras / normalizações
- **Moeda (R$):** dígitos → `0,00` (pt-BR). Campos `valor_minimo`, `projeto_valor`.
- **Slug:** derivado de `nome` (minúsculas, sem acentos, espaços → `-`); usado só na prévia.
- **Datas mínimas:** `data_inicio >= hoje`; `data_fim >= data_inicio`.

### Anti-bot e proteção do endpoint (servidor)
- Honeypot (`website`, oculto) enviado no payload; preenchido ⇒ resposta `ok` silenciosa sem gravar.
- `fill_ms` validado no servidor: abaixo de `CONFIG.MIN_FILL_MS` (3s) ⇒ resposta `ok` silenciosa sem gravar.
- E-mail do solicitante precisa ter domínio em `CONFIG.DOMINIOS_EMAIL` (padrão: `amigosdobem.org`).
- Rate limit global: `CONFIG.MAX_ENVIOS_HORA` (padrão: 20/hora) via `CacheService`.
- Campos de texto protegidos contra injeção de fórmula no Sheets (prefixo `'` em células
  iniciadas por `=`, `+`, `-`, `@` — helper `sheetSafe`).

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
- Campos **opcionais**: `titulo_pagina_inicial`, `mensagem_pagina_inicial` (se tipo =
  "padrao"), `projeto_valor` e — no modo plano padrão — a lista `projetos` (oculta,
  enviada vazia).
- O `<form>` usa `novalidate`: a validação nativa do navegador está desligada e todo o
  bloqueio vem do `validate()` do JS (mensagens customizadas + scroll até o campo).
- **Correções (15/10/2026):** a regra `data_inicio >= hoje` passou a existir também no
  `validate()` (antes existia só no atributo `min`, ignorado por causa do `novalidate`);
  regex de e-mail reforçada; rejeição do servidor (`{ ok: false, error }`) agora exibe a
  mensagem retornada em vez de um alerta genérico.
- **Ajustes (15/10/2026):** `pilar` virou múltipla escolha (checkbox, array no payload);
  adicionado "Usar campanha de referência?" (primeiro item de "Sobre a Página de Doação")
  com URL + ID condicionais. Smoke test cliente+servidor: **21/21 OK**
  (`.tmp/smoke-test.js`). O teste leave-one-out 24/24 anterior refere-se à versão sem
  referência/`pilar` múltiplo.
- **Ajuste (16/10/2026):** no modo referência (Sim), passam a ser exibidos e validados
  também "Data de início", "Data de fim", "Nome da Campanha", "Título da Página de
  Doação" e "Texto da Página de Doação" (regras V2, V10, V11 e V12 agora valem nos dois
  modos; título/texto seguem opcionais). Ocultos no Sim: frequência padrão, exigir
  endereço e formas de pagamento.
- **Ajustes (16/10/2026):** "Imagem da Campanha" passou a ser exibida **nos dois modos**
  (V7 e V14 sem *(manual)*; no modo Sim o payload não zera mais `imagem_campanha`).
  Campo "Personalizada (MKT)" mudou: bloco "Solicite Briefing ao MKT" + placeholder
  "Escreva o ID do Briefing" (o briefing agora é um **ID** já solicitado ao MKT; V14
  atualizada).
- **Ajustes (16/10/2026):** bloco "Sobre os Dados Adicionais" **removido**
  (`dados_adicionais` sai do payload; V16 reutilizada). "Sobre os Planos de Doação":
  novo radio `planos_tipo` "Usar Plano Padrão" (pré-marcado; lista oculta; `projetos`
  vazio) × "Plano Personalizado" (lista visível; V15 só no modo personalizado);
  valor mínimo virou **campo único de texto** com máscara (`valor_minimo_opcao` e
  `valor_minimo_outro` removidos; V8/V9) e passou a ser o **último** item do bloco.

---

## 5. Envio

- `POST` para `APPS_SCRIPT_URL` (em `script.js`, linha 10) com
  `mode: "cors"` e `Content-Type: text/plain;charset=UTF-8` (workaround padrão do Apps Script).
- Espera resposta JSON `{ ok: true }`; rejeição do servidor (`{ ok: false, error }`) mostra
  a mensagem retornada; falha de rede reabilita o botão e mostra alerta genérico.
- Enquanto `APPS_SCRIPT_URL` estiver vazio, envio bloqueado com aviso (não finge sucesso).
- Página de confirmação: `confirmacao.html`.

---

## 6. Publicação (subir o site)

A pasta `V2/` é a raiz do site. Publicação no **GitHub Pages** (sem build):

1. Subir o conteúdo de `V2/` para a **raiz** do repositório.
2. Ativar: Settings → Pages → Source: `main` / root.
3. Preencher `APPS_SCRIPT_URL` em `script.js` (linha 10) com a URL `/exec` do Web App
   do Google Apps Script — **sem isso o envio fica bloqueado por design**.
4. Testar a jornada completa: `index.html` → `formulario.html` → envio → `confirmacao.html`.

### Checklist antes de publicar

- [x] HTML/CSS/JS todos dentro de `V2/` (sem dependências externas)
- [x] Nomes padrão: `index.html`, `formulario.html`, `confirmacao.html`
- [x] CSS unificado em `styles.css` (sem `@import` externo)
- [x] CSP e `no-referrer` presentes nas 3 páginas
- [ ] `APPS_SCRIPT_URL` preenchida (aguarda backend)
- [ ] Domínio/HTTPS do hosting configurado

---

## 7. Pendências

1. ~~Backend `apps-script.gs`~~ — **Criado** (`apps-script.gs` nesta pasta): gravação na
   planilha (aba "Respostas"), revalidação server-side, confirmação ao solicitante e
   aviso à equipe (GmailApp). Falta implantar (ver README).
2. **Implantar o backend** no Google Apps Script + preencher `APPS_SCRIPT_URL` em
   `script.js` + testar ponta a ponta. `CONFIG.EMAILS_EQUIPE` já vem com os 3
   avisadores (rosana.palladino@, matheus.schumiski@ e
   filipe.dornelles@amigosdobem.org); antes de implantar, confirmar com a equipe os
   domínios em `CONFIG.DOMINIOS_EMAIL` (padrão `amigosdobem.org`) e os limites
   `MAX_ENVIOS_HORA` / `MIN_FILL_MS`.
3. **Painel de gestão** (`admin.html` / `admin.js`): login, listagem, status, exportação CSV.
4. ~~Definir versão oficial~~ — **Resolvido: a V2 é a oficial** (15/10/2026).
5. ~~Migrar `gemini.md` e POPs para o schema da V2~~ — **Resolvido** (15/10/2026):
   `gemini.md` (§3 schema, §6 regras) e `architecture/POP-00` a `POP-03` reescritos para
   a V2.
6. ~~Sincronizar o backend com as mudanças do frontend~~ — **Resolvido** (16/10/2026):
   - `validar()` agora exige `data_inicio`, `data_fim`, `nome` e `imagem_campanha`
     (incl. briefing se personalizada) **nos dois modos** (antes só no manual).
   - `mensagem_pagina_inicial_tipo`: coluna em `CABECALHOS`/`montarLinha` + revalidação
     (tipo obrigatório; se `personalizada`, `mensagem_pagina_inicial` preenchido).
   - `planos_tipo`: coluna + revalidação (tipo obrigatório; se `personalizado`, ≥ 1
     projeto com nome+descrição; se `padrao`, `projetos` vazio aceito).
   - **Removidos** a coluna e as validações de `dados_adicionais`.
   - E-mails: o aviso à equipe passou a exibir **período** (e nome) **nos dois modos**
     (decisão de 16/10/2026); frequência padrão e formas de pagamento continuam só no
     modo manual; `valor_minimo` exibido uma única vez (antes aparecia duplicado).

---

## 8. Regras mantidas das duas versões

1. Sem upload de imagem — arte padrão do pilar ou briefing ao MKT.
2. Sem segredos no frontend; CSP e `no-referrer` nas páginas.
3. Nunca perder dados silenciosamente — falha de envio sempre avisada.
4. Campos repetíveis com `<template>` + adicionar/remover; payload lido do DOM.
5. LGPD: dados tratados conforme a política da ONG.
