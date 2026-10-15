// ============================================================
// Solicitação de Link de Campanha — Amigos do Bem (versão v2)
// Frontend: navegação, validações, máscaras, campos repetíveis e envio.
// Sem: imagens utilizadas, prazo pronto, código de identificação,
//      tags, natureza da doação e páginas de agradecimento.
//
// URL do Google Apps Script (preencher na Fase do backend).
// Enquanto estiver vazio, o envio é bloqueado com aviso (não finge sucesso).
// ============================================================
const APPS_SCRIPT_URL = "";

const TRANSITION_MS = 400;

const navigateWithTransition = (url) => {
  document.body.classList.add("page-leaving");
  setTimeout(() => { window.location.href = url; }, TRANSITION_MS);
};

window.addEventListener("pageshow", () => {
  document.body.classList.remove("page-leaving");
});

// Atalho para o painel de gestão (Fase futura): Ctrl + Shift + A
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "a") {
    event.preventDefault();
    window.location.href = "admin.html";
  }
});

// ---------- Intro ----------
const continueBtn = document.getElementById("continueBtn");
if (continueBtn) {
  continueBtn.addEventListener("click", () => navigateWithTransition("formulario.html"));
}

// ============================================================
// Formulário
// ============================================================
const form = document.getElementById("campanhaForm");

if (form) {
  const startedAt = Date.now();

  // ---------- Helpers ----------
  const pad = (n) => String(n).padStart(2, "0");
  const toIso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayIso = () => toIso(new Date());

  const formatMoney = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 9);
    if (!digits) return "";
    const cents = digits.padStart(3, "0");
    const integerPart = cents.slice(0, -2).replace(/^0+(?=\d)/, "");
    const decimalPart = cents.slice(-2);
    return `${integerPart || "0"},${decimalPart}`;
  };

  const moneyToNumber = (value) => {
    const digits = String(value || "").replace(/\D/g, "");
    if (!digits) return 0;
    return Number(digits) / 100;
  };

  const slugify = (value) => String(value || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const checkedValue = (name) => {
    const el = form.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : "";
  };

  const checkedArray = (name) =>
    [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((el) => el.value);

  const valueOf = (name) => {
    const el = form.elements[name];
    return el ? String(el.value || "").trim() : "";
  };

  // ---------- Datas mínimas ----------
  const dataInicio = document.getElementById("dataInicio");
  const dataFim = document.getElementById("dataFim");

  dataInicio.min = todayIso();
  dataFim.min = todayIso();

  const syncDateBounds = () => {
    if (dataInicio.value) dataFim.min = dataInicio.value;
  };
  dataInicio.addEventListener("change", syncDateBounds);

  // ---------- Slug (prévia da URL a partir do nome da campanha) ----------
  const nomeCampanhaInput = document.getElementById("nomeCampanha");
  const slugPreview = document.getElementById("slugPreview");
  const BASE_URL = "https://doar.amigosdobem.org/";

  const updateSlugPreview = () => {
    slugPreview.textContent = BASE_URL + slugify(nomeCampanhaInput.value);
  };
  nomeCampanhaInput.addEventListener("input", updateSlugPreview);
  updateSlugPreview();

  // ---------- Máscara de dinheiro ----------
  form.addEventListener("input", (event) => {
    const t = event.target;
    if (t.name === "valor_minimo_outro" || t.name === "projeto_valor") {
      t.value = formatMoney(t.value);
    }
  });

  // ---------- Valor mínimo travado (opção "Outros") ----------
  const valorMinimoOutroWrap = document.getElementById("valorMinimoOutroWrap");
  const valorMinimoOutro = document.getElementById("valorMinimoOutro");

  const syncValorMinimoOutro = () => {
    const visible = checkedValue("valor_minimo_opcao") === "outros";
    valorMinimoOutroWrap.hidden = !visible;
    valorMinimoOutro.required = visible;
    if (!visible) valorMinimoOutro.value = "";
  };
  form.querySelectorAll('input[name="valor_minimo_opcao"]').forEach((r) =>
    r.addEventListener("change", syncValorMinimoOutro)
  );
  syncValorMinimoOutro();

  const resolveValorMinimo = () => {
    const opcao = checkedValue("valor_minimo_opcao");
    if (opcao === "outros") return moneyToNumber(valorMinimoOutro.value);
    return moneyToNumber(opcao);
  };

  // ---------- Briefings condicionais de imagem ----------
  const bindImageTipo = (tipoName, wrapId, textareaName) => {
    const wrap = document.getElementById(wrapId);
    const textarea = form.elements[textareaName];
    const sync = () => {
      const visible = checkedValue(tipoName) === "personalizada_mkt";
      wrap.hidden = !visible;
      textarea.required = visible;
      if (!visible) textarea.value = "";
    };
    form.querySelectorAll(`input[name="${tipoName}"]`).forEach((r) => r.addEventListener("change", sync));
    sync();
  };
  bindImageTipo("imagem_campanha_tipo", "imagemCampanhaBriefingWrap", "imagem_campanha_briefing");

  // ---------- Frequência almejada → frequência padrão ----------
  const syncFrequenciaPadrao = () => {
    const almejadas = checkedArray("frequencia_almejada");
    const unica = form.querySelector('input[name="frequencia_padrao"][value="Única"]');
    const mensal = form.querySelector('input[name="frequencia_padrao"][value="Mensal"]');

    if (almejadas.length === 1) {
      if (almejadas[0] === "Única/Pontual") unica.checked = true;
      if (almejadas[0] === "Mensal/Recorrente") mensal.checked = true;
    } else if (almejadas.length >= 2) {
      unica.checked = false;
      mensal.checked = false;
    }
  };
  form.querySelectorAll('input[name="frequencia_almejada"]').forEach((c) =>
    c.addEventListener("change", syncFrequenciaPadrao)
  );

  // ---------- Campos repetíveis ----------
  const projetosContainer = document.getElementById("projetosContainer");
  const dadosContainer = document.getElementById("dadosContainer");
  const projetoTemplate = document.getElementById("projetoTemplate");
  const dadoTemplate = document.getElementById("dadoTemplate");

  const renumber = (container, itemSelector, label) => {
    [...container.querySelectorAll(itemSelector)].forEach((item, i) => {
      const idx = item.querySelector(".repeat-index");
      if (idx) idx.textContent = `#${i + 1}`;
    });
  };

  const addItem = (container, template, itemSelector) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector(".remove-item").addEventListener("click", () => {
      node.remove();
      renumber(container, itemSelector);
    });
    container.appendChild(node);
    renumber(container, itemSelector);
    return node;
  };

  const addProjeto = () => addItem(projetosContainer, projetoTemplate, ".projeto-item");
  const addDado = () => addItem(dadosContainer, dadoTemplate, ".dado-item");

  document.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.add === "projeto") addProjeto();
      else addDado();
    });
  });

  // Primeiro projeto já criado por padrão.
  addProjeto();

  // ---------- Coleta de dados ----------
  const collectPayload = () => {
    const projetos = [...projetosContainer.querySelectorAll(".projeto-item")].map((item) => ({
      nome: item.querySelector('[name="projeto_nome"]').value.trim(),
      valor_sugerido: moneyToNumber(item.querySelector('[name="projeto_valor"]').value) || null,
      descricao: item.querySelector('[name="projeto_descricao"]').value.trim(),
    }));

    const dadosAdicionais = [...dadosContainer.querySelectorAll(".dado-item")].map((item) => ({
      rotulo: item.querySelector('[name="dado_rotulo"]').value.trim(),
      valor: item.querySelector('[name="dado_valor"]').value.trim(),
    }));

    return {
      submetido_em: new Date().toISOString(),
      solicitante_nome: valueOf("solicitante_nome"),
      solicitante_email: valueOf("solicitante_email"),
      solicitante_departamento: valueOf("solicitante_departamento"),

      publico_alvo: valueOf("publico_alvo"),
      pilar: valueOf("pilar"),
      frequencia_almejada: checkedArray("frequencia_almejada"),

      valor_minimo: resolveValorMinimo(),
      frequencia_padrao: checkedValue("frequencia_padrao"),
      exigir_endereco: checkedValue("exigir_endereco") === "Sim",
      data_inicio: valueOf("data_inicio"),
      data_fim: valueOf("data_fim"),
      formas_pagamento: checkedArray("formas_pagamento"),
      nome: valueOf("nome"),
      titulo_pagina_inicial: valueOf("titulo_pagina_inicial"),
      mensagem_pagina_inicial: valueOf("mensagem_pagina_inicial"),

      imagem_campanha: {
        tipo: checkedValue("imagem_campanha_tipo"),
        briefing: valueOf("imagem_campanha_briefing"),
      },

      projetos,
      dados_adicionais: dadosAdicionais,
    };
  };

  // ---------- Validação ----------
  const firstInvalid = (selector) => form.querySelector(selector);

  const validate = () => {
    const requiredText = [
      ["solicitante_nome", "Informe o nome do solicitante."],
      ["solicitante_departamento", "Informe o departamento."],
      ["publico_alvo", "Informe o público-alvo."],
      ["pilar", "Selecione o pilar."],
      ["nome", "Informe o nome da campanha."],
    ];
    for (const [name, msg] of requiredText) {
      if (!valueOf(name)) return { msg, el: form.elements[name] };
    }

    if (!slugify(valueOf("nome"))) {
      return { msg: "O nome da campanha deve conter letras ou números para gerar o link.", el: nomeCampanhaInput };
    }

    const email = valueOf("solicitante_email");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return { msg: "Informe um e-mail válido do solicitante.", el: form.elements.solicitante_email };
    }

    if (checkedArray("frequencia_almejada").length === 0) {
      return { msg: "Selecione a frequência de doação almejada.", el: form.querySelector('input[name="frequencia_almejada"]') };
    }
    if (!checkedValue("frequencia_padrao")) {
      return { msg: "Selecione a frequência padrão.", el: firstInvalid('input[name="frequencia_padrao"]') };
    }
    if (!checkedValue("exigir_endereco")) {
      return { msg: "Informe se o endereço é obrigatório.", el: firstInvalid('input[name="exigir_endereco"]') };
    }
    if (!checkedValue("imagem_campanha_tipo")) {
      return { msg: "Selecione o tipo da imagem da campanha.", el: firstInvalid('input[name="imagem_campanha_tipo"]') };
    }

    if (!checkedValue("valor_minimo_opcao")) {
      return { msg: "Selecione o valor mínimo travado da doação.", el: firstInvalid('input[name="valor_minimo_opcao"]') };
    }
    if (resolveValorMinimo() <= 0) {
      return { msg: "O valor mínimo deve ser maior que zero.", el: valorMinimoOutro };
    }

    if (!valueOf("data_inicio")) {
      return { msg: "Informe a data de início.", el: dataInicio };
    }
    if (!valueOf("data_fim")) {
      return { msg: "Informe a data de fim.", el: dataFim };
    }
    if (valueOf("data_fim") < valueOf("data_inicio")) {
      return { msg: "A data de fim deve ser igual ou posterior à data de início.", el: dataFim };
    }

    if (checkedArray("formas_pagamento").length === 0) {
      return { msg: "Selecione ao menos uma forma de pagamento.", el: form.querySelector('input[name="formas_pagamento"]') };
    }

    if (checkedValue("imagem_campanha_tipo") === "personalizada_mkt" && !valueOf("imagem_campanha_briefing")) {
      return { msg: "Descreva a arte personalizada da campanha solicitada ao MKT.", el: form.elements.imagem_campanha_briefing };
    }

    const projetos = [...projetosContainer.querySelectorAll(".projeto-item")];
    if (projetos.length === 0) {
      return { msg: "Adicione ao menos um plano.", el: projetosContainer };
    }
    for (const item of projetos) {
      const nome = item.querySelector('[name="projeto_nome"]').value.trim();
      const descricao = item.querySelector('[name="projeto_descricao"]').value.trim();
      if (!nome || !descricao) {
        return { msg: "Preencha nome e descrição de cada plano.", el: item };
      }
    }

    for (const item of dadosContainer.querySelectorAll(".dado-item")) {
      const rotulo = item.querySelector('[name="dado_rotulo"]').value.trim();
      const valor = item.querySelector('[name="dado_valor"]').value.trim();
      if (!rotulo || !valor) {
        return { msg: "Preencha rótulo e valor de cada dado adicional.", el: item };
      }
    }

    return null;
  };

  // ---------- Envio ----------
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const error = validate();
    if (error) {
      if (error.el && error.el.scrollIntoView) {
        error.el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      alert(error.msg);
      return;
    }

    if (!APPS_SCRIPT_URL) {
      alert(
        "O enviar está temporariamente indisponível: o endpoint ainda não foi configurado. " +
        "Fale com a equipe responsável."
      );
      return;
    }

    const submitBtn = form.querySelector(".submit-btn");
    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    try {
      const payload = collectPayload();
      payload.fill_ms = Date.now() - startedAt;

      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Falha no servidor (" + response.status + ").");
      const result = await response.json().catch(() => null);
      if (!result || !result.ok) {
        throw new Error((result && result.error) || "A solicitação foi rejeitada.");
      }

      navigateWithTransition("confirmacao.html");
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
      alert("Não foi possível enviar a solicitação. Verifique sua conexão e tente novamente.");
    }
  });
}
