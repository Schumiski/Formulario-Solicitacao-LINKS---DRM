# POP-02 — Validações (client-side)

Toda regra abaixo é aplicada no navegador. **Na Fase do backend, cada regra deve ser
revalidada no servidor** (nunca confiar só no cliente).

| # | Regra | Mensagem |
|---|---|---|
| V1 | Campos obrigatórios preenchidos | "Preencha todos os campos obrigatórios." |
| V2 | `prazo_pronto >= hoje + 7 dias` (rígido) | "O prazo mínimo é de 7 dias a partir de hoje." |
| V3 | `codigo_identificacao` só `a-z0-9-` | normalizado automaticamente; avisar se vazio |
| V4 | `valor_minimo > 0` | "Informe um valor maior que zero." |
| V5 | E-mail válido (`solicitante_email`) | "E-mail inválido." |
| V6 | `data_fim >= data_inicio` | "A data de fim deve ser igual ou posterior à data de início." |
| V7 | ≥ 1 forma de pagamento marcada | "Selecione ao menos uma forma de pagamento." |
| V8 | ≥ 1 projeto informado | "Adicione ao menos um projeto." |
| V9 | Projeto: nome e descrição obrigatórios | "Preencha nome e descrição do projeto." |
| V10 | Dado adicional: rótulo e valor obrigatórios | "Preencha rótulo e valor do dado adicional." |
| V11 | Imagem personalizada exige briefing | "Descreva a arte personalizada solicitada ao MKT." |
| V12 | Departamento "Outros" exige descrição | "Descreva o departamento." |
| V13 | Pilar/Tema "Outros" exige descrição | "Informe o tema da campanha." |

## Máscaras / normalizações
- **Moeda (R$):** dígitos → `0,00` (pt-BR). Campo `valor_minimo`, `projeto_valor`.
- **Slug:** minúsculas, espaços → `-`, remove caracteres inválidos. Prévia:
  `https://doar.amigosdobem.org/{codigo}`.
- **TAGs:** texto separado por vírgula → array sem espaços em branco nas pontas.

## Anti-bot (herdado do molde PQT)
- Honeypot (`website`) e tempo mínimo de preenchimento (`fill_ms`).
