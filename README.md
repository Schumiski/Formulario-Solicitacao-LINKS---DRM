# Formulário de Solicitação de Links de Campanha — V2 (oficial)

Versão oficial do formulário interno da ONG **Amigos do Bem** para solicitar a criação de
links de campanha de doação em `https://doar.amigosdobem.org/{codigo}`.

> A V2 é a versão **oficial** (a V1, na raiz do projeto, está legada).
> Documentação completa (schema, validações, diferenças V1×V2): [`DOCUMENTACAO.md`](DOCUMENTACAO.md).

---

## Estrutura

```
V2/
├── index.html             # Página de introdução (entrada da jornada)
├── formulario.html        # Formulário (4 blocos)
├── confirmacao.html       # Confirmação após o envio
├── styles.css             # Estilos (base + ajustes da V2)
├── script.js              # Validações, máscaras, campos repetíveis e envio
├── DOCUMENTACAO.md        # Documentação técnica completa
└── README.md              # Este arquivo
```

Pasta **autocontida**: todos os arquivos necessários para publicar o site estão aqui,
sem dependências externas.

## Como executar localmente

Não há build nem dependências. Basta abrir `index.html` em um navegador
(duplo clique ou servidor estático):

```bash
# opcional — servidor local
npx serve V2
```

Jornada: `index.html` → `formulario.html` → `confirmacao.html`.

## Publicação

1. Suba os arquivos desta pasta para a **raiz** do repositório (GitHub Pages).
2. Ative: Settings → Pages → Source: `main` / root.
3. Veja o checklist completo em [`DOCUMENTACAO.md` §6](DOCUMENTACAO.md).

## Configuração do envio

O formulário envia um `POST` JSON para o Google Apps Script. Abra `script.js` e
preencha a constante na linha 10:

```js
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/{ID}/exec";
```

Enquanto estiver vazia (`""`), o envio é **bloqueado com aviso** — por design, o
formulário nunca finge sucesso sem backend.

**Pendência:** o backend (`apps-script.gs` — gravação na planilha + e-mails) ainda não
foi criado.

## Validações

Todas as regras são aplicadas no navegador (`validate()` em `script.js`), com
mensagens em português e scroll até o campo inválido. Verificado por teste automatizado
leave-one-out (24 cenários) — ver [`DOCUMENTACAO.md` §4](DOCUMENTACAO.md).

Principais regras:
- Campos obrigatórios marcados com `*` bloqueiam o envio.
- `data_fim >= data_inicio`.
- Valor mínimo > 0; ≥ 1 forma de pagamento; ≥ 1 plano (nome e descrição).
- Imagem personalizada exige briefing para o MKT.
- Nome da campanha gera a prévia da URL (`doar.amigosdobem.org/{slug}`).

## Atalho do painel de gestão (futuro)

`Ctrl + Shift + A` → `admin.html` (painel ainda não implementado).
