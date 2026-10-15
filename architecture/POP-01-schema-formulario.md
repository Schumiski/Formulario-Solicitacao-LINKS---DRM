# POP-01 — Schema do Formulário

Contrato de dados do formulário. A fonte da verdade é `gemini.md` §3. Este POP descreve o
mapeamento campo → `name` do HTML.

## Identificação do solicitante
| Campo | name | Tipo | Obrigatório |
|---|---|---|---|
| Nome | `solicitante_nome` | texto | sim |
| E-mail | `solicitante_email` | email | sim |
| Departamento | `solicitante_departamento` | select | sim |
| Departamento (descrição) | `solicitante_departamento_outro` | texto | sim, se "Outros" |

**Opções de `solicitante_departamento`:**
T.I · Captação / D.I PF · Comercial · Projetos · Educação · Jurídico · D.I - PJ ·
Controladoria · MKT · Outros.
Quando "Outros", `script.js` resolve `solicitante_departamento` para o texto digitado em
`solicitante_departamento_outro`.

## Sobre a Campanha
| Campo | name | Tipo | Obrigatório |
|---|---|---|---|
| Intuito do link | `intuito_link` | textarea | sim |
| Público-alvo | `publico_alvo` | texto | sim |
| Quais imagens serão utilizadas | `imagens_utilizadas` | textarea | não |
| Prazo pronto | `prazo_pronto` | date | sim (≥ hoje+7) |
| Pilar/Tema | `pilar` | select | sim |
| Pilar/Tema (descrição) | `pilar_outro` | texto | sim, se "Outros" |

**Opções de `pilar`:** Educação · Trabalho e Renda · Saúde · Água e Moradia ·
Segurança Alimentar · Outros. Quando "Outros", `script.js` resolve `pilar` para o texto
digitado em `pilar_outro`.

## Sobre o link
| Campo | name | Tipo | Obrigatório |
|---|---|---|---|
| Código de identificação | `codigo_identificacao` | texto (slug) | sim |
| Valor mínimo | `valor_minimo` | texto (moeda) | sim |
| Frequência padrão | `frequencia_padrao` | radio (Única/Mensal) | sim |
| Exigir endereço | `exigir_endereco` | radio (Sim/Não) | sim |
| Data de início | `data_inicio` | date | sim |
| Data de fim | `data_fim` | date | sim |
| Formas de pagamento | `formas_pagamento[]` | checkbox | ≥ 1 |
| TAGs | `tags` | texto (vírgula) | não |
| Natureza da doação | `natureza_da_doacao` | select | sim |
| Nome | `nome` | texto | sim |
| Título página inicial | `titulo_pagina_inicial` | texto | não |
| Mensagem página inicial | `mensagem_pagina_inicial` | textarea | não |
| Título página agradecimento | `titulo_pagina_agradecimento` | texto | não |
| Mensagem página agradecimento | `mensagem_pagina_agradecimento` | textarea | não |
| Imagem campanha | `imagem_campanha_tipo` + `imagem_campanha_briefing` | radio + textarea | sim |
| Imagem agradecimento | `imagem_agradecimento_tipo` + `imagem_agradecimento_briefing` | radio + textarea | sim |

## Sobre os Projetos (lista repetível)
| Campo | name | Obrigatório |
|---|---|---|
| Nome | `projeto_nome` | sim |
| Valor sugerido | `projeto_valor` | não |
| Descrição | `projeto_descricao` | sim |

## Sobre os Dados Adicionais (lista repetível)
| Campo | name | Obrigatório |
|---|---|---|
| Rótulo | `dado_rotulo` | sim |
| Valor | `dado_valor` | sim |

## Payload montado por `script.js`
Ver `gemini.md` §3. Blocos repetíveis viram arrays; `formas_pagamento` e `tags` viram arrays.
