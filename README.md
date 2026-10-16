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
├── apps-script.gs         # Backend (Google Apps Script) — NÃO publicar no site
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

## Configuração do envio (backend)

O formulário envia um `POST` JSON para o Google Apps Script. O backend está em
[`apps-script.gs`](apps-script.gs) — ele **não** é publicado no site; vai para o
Apps Script da sua planilha.

### Implantação (uma vez)

1. Crie uma **planilha Google Sheets**.
2. **Extensões → Apps Script**.
3. Cole o conteúdo de `apps-script.gs` no `Code.gs`.
4. Ajuste o `CONFIG` no topo do script:
   - `EMAILS_EQUIPE`: lista de e-mails que recebem o aviso de nova solicitação
     (já preenchida com os 3 avisadores: rosana.palladino@, matheus.schumiski@ e
     filipe.dornelles@amigosdobem.org).
   - `DOMINIOS_EMAIL`: domínios aceitos no e-mail do solicitante
     (padrão `["amigosdobem.org"]`; lista vazia aceita qualquer e-mail).
   - `MAX_ENVIOS_HORA`: limite global de envios por hora (padrão 20; `0` desativa).
   - `MIN_FILL_MS`: tempo mínimo de preenchimento em ms (padrão 3000; `0` desativa).
5. **Implantar → Nova implantação → tipo "App da Web"**:
   - Executar como: **Eu**
   - Quem tem acesso: **Qualquer pessoa** (ou o domínio da ONG)
6. Copie a **URL "/exec"** gerada.
7. Cole a URL em `script.js` (linha 10) e **publique o frontend novamente**:

```js
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/{ID}/exec";
```

> Enquanto `APPS_SCRIPT_URL` estiver vazia, o envio é **bloqueado com aviso** —
> por design, o formulário nunca finge sucesso sem backend. É esse o aviso que aparece
> preenchendo o formulário publicado antes de implantar o backend.

### O que o backend faz

- Revalida todas as regras no servidor (nunca confia só no frontend).
- Protege o endpoint: honeypot, tempo mínimo de preenchimento, domínio de e-mail e rate limit.
- Neutraliza injeção de fórmula nas células da planilha.
- Grava uma linha por solicitação na aba **"Respostas"** (criada automaticamente).
- Envia **e-mail de confirmação** ao solicitante (GmailApp).
- Envia **e-mail de aviso** à equipe (`CONFIG.EMAILS_EQUIPE`, se houver destinatários).
- Registra o `slug_sugerido` (prévia do link) para a equipe criar o link manualmente.

## Validações

Todas as regras são aplicadas no navegador (`validate()` em `script.js`), com
mensagens em português e scroll até o campo inválido. Verificado por teste automatizado
leave-one-out (24 cenários) — ver [`DOCUMENTACAO.md` §4](DOCUMENTACAO.md).

Principais regras:
- Campos obrigatórios marcados com `*` bloqueiam o envio.
- ≥ 1 pilar/tema (múltipla escolha).
- "Usar campanha de referência?": se Sim, além da URL + ID do link informado, aparecem
  e são exigidos datas de início/fim, nome da campanha e imagem (título e texto são
  opcionais); ocultos no Sim: frequência padrão, exigir endereço e formas de pagamento.
- Modo manual: `data_inicio >= hoje`; `data_fim >= data_inicio`; ≥ 1 forma de pagamento.
  Datas e nome também valem no modo Sim.
- Planos: "Usar Plano Padrão" (pré-marcado; equipe usa os planos padrão da plataforma;
  lista oculta) × "Plano Personalizado" (lista de planos visível e obrigatória).
- Valor mínimo travado: campo de texto com máscara (obrigatório; > 0; nos dois modos).
- Bloco "Sobre os Dados Adicionais": **removido** (16/10/2026).
- Imagem da campanha: "Padrão do pilar" (pré-marcado) ou "Personalizada (MKT)" — no modo
  personalizado, exige o **ID do briefing** já solicitado ao MKT ("Solicite Briefing ao
  MKT"). Exibida nos dois modos (referência e manual).
- Texto da página: "Usar texto padrão" (pré-marcado) ou "Texto personalizado" — no modo
  personalizado, a área de escrita é exibida e obrigatória.
- Nome da campanha gera a prévia da URL (`doar.amigosdobem.org/{slug}`).

## Atalho do painel de gestão (futuro)

O atalho `Ctrl + Shift + A` será adicionado junto com o painel (`admin.html`), ainda não
implementado — antes ele ficava ativo e levava a um 404.
