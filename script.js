// ============================================================
// Solicitação de Link de Campanha — Amigos do Bem (versão v2)
// Frontend: navegação, validações, máscaras, campos repetíveis e envio.
// Sem: imagens utilizadas, prazo pronto, código de identificação,
//      tags, natureza da doação e páginas de agradecimento.
//
// URL do Google Apps Script (preencher na Fase do backend).
// Enquanto estiver vazio, o envio é bloqueado com aviso (não finge sucesso).
// ============================================================
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwGoLC6V3jQZnnUHAcJ02hZVWctTo6lJ6sJ-HB17nbZG8jNbC5WT5HVB0NQjjreusmHoQ/exec";

const TRANSITION_MS = 400;

const navigateWithTransition = (url) => {
  document.body.classList.add("page-leaving");
  setTimeout(() => { window.location.href = url; }, TRANSITION_MS);
};

window.addEventListener("pageshow", () => {
  document.body.classList.remove("page-leaving");
});

// Atalho Ctrl+Shift+A para o painel de gestão: adicionar junto com admin.html (Fase futura).

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
    if (t.name === "valor_minimo" || t.name === "projeto_valor") {
      t.value = formatMoney(t.value);
    }
  });

  // ---------- Valor mínimo travado (campo único com máscara) ----------
  const valorMinimo = document.getElementById("valorMinimo");
  const resolveValorMinimo = () => moneyToNumber(valorMinimo.value);

  // ---------- Planos: padrão × personalizado ----------
  const planosWrap = document.getElementById("planosWrap");
  const isPlanosPersonalizado = () => checkedValue("planos_tipo") === "personalizado";

  const syncPlanosTipo = () => {
    planosWrap.hidden = !isPlanosPersonalizado();
  };
  form.querySelectorAll('input[name="planos_tipo"]').forEach((r) =>
    r.addEventListener("change", syncPlanosTipo)
  );
  syncPlanosTipo();

  // ---------- Campos condicionais por tipo (radio + wrap + textarea) ----------
  const bindTipoCondicional = (tipoName, wrapId, textareaName, valorPersonalizado) => {
    const wrap = document.getElementById(wrapId);
    const textarea = form.elements[textareaName];
    const sync = () => {
      const visible = checkedValue(tipoName) === valorPersonalizado;
      wrap.hidden = !visible;
      textarea.required = visible;
      if (!visible) textarea.value = "";
    };
    form.querySelectorAll(`input[name="${tipoName}"]`).forEach((r) => r.addEventListener("change", sync));
    sync();
  };
  bindTipoCondicional("imagem_campanha_tipo", "imagemCampanhaBriefingWrap", "imagem_campanha_briefing", "personalizada_mkt");
  bindTipoCondicional("mensagem_pagina_inicial_tipo", "mensagemPaginaInicialWrap", "mensagem_pagina_inicial", "personalizada");

  // ---------- Campanha de referência (primeiro item de "Sobre a Página de Doação") ----------
  const campanhaReferenciaWrap = document.getElementById("campanhaReferenciaWrap");
  const campanhaManualWrap = document.getElementById("campanhaManualWrap");
  const campanhaReferenciaUrl = document.getElementById("campanhaReferenciaUrl");
  const campanhaReferenciaId = document.getElementById("campanhaReferenciaId");

  const isReferencia = () => checkedValue("campanha_referencia") === "Sim";

  const syncCampanhaReferencia = () => {
    const referencia = isReferencia();
    campanhaReferenciaWrap.hidden = !referencia;
    campanhaManualWrap.hidden = referencia;
    campanhaReferenciaUrl.required = referencia;
    campanhaReferenciaId.required = referencia;
    if (!referencia) {
      campanhaReferenciaUrl.value = "";
      campanhaReferenciaId.value = "";
    }
  };
  form.querySelectorAll('input[name="campanha_referencia"]').forEach((r) =>
    r.addEventListener("change", syncCampanhaReferencia)
  );
  syncCampanhaReferencia();

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

  // ---------- Campos repetíveis (planos) ----------
  const projetosContainer = document.getElementById("projetosContainer");
  const projetoTemplate = document.getElementById("projetoTemplate");

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

  document.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.add === "projeto") addProjeto();
    });
  });

  // Primeiro projeto já criado por padrão (aparece ao escolher plano personalizado).
  addProjeto();

  // ---------- Coleta de dados ----------
  const collectPayload = () => {
    const referencia = isReferencia();

    const projetos = isPlanosPersonalizado()
      ? [...projetosContainer.querySelectorAll(".projeto-item")].map((item) => ({
          nome: item.querySelector('[name="projeto_nome"]').value.trim(),
          valor_sugerido: moneyToNumber(item.querySelector('[name="projeto_valor"]').value) || null,
          descricao: item.querySelector('[name="projeto_descricao"]').value.trim(),
        }))
      : [];

    return {
      submetido_em: new Date().toISOString(),
      solicitante_nome: valueOf("solicitante_nome"),
      solicitante_email: valueOf("solicitante_email"),
      solicitante_departamento: valueOf("solicitante_departamento"),
      website: form.elements.website ? form.elements.website.value : "",

      publico_alvo: valueOf("publico_alvo"),
      pilar: checkedArray("pilar"),
      frequencia_almejada: checkedArray("frequencia_almejada"),

      campanha_referencia: referencia,
      campanha_referencia_url: referencia ? valueOf("campanha_referencia_url") : "",
      campanha_referencia_id: referencia ? valueOf("campanha_referencia_id") : "",

      valor_minimo: resolveValorMinimo(),
      planos_tipo: checkedValue("planos_tipo"),
      frequencia_padrao: referencia ? "" : checkedValue("frequencia_padrao"),
      exigir_endereco: referencia ? null : checkedValue("exigir_endereco") === "Sim",
      data_inicio: valueOf("data_inicio"),
      data_fim: valueOf("data_fim"),
      formas_pagamento: referencia ? [] : checkedArray("formas_pagamento"),
      nome: valueOf("nome"),
      titulo_pagina_inicial: valueOf("titulo_pagina_inicial"),
      mensagem_pagina_inicial_tipo: checkedValue("mensagem_pagina_inicial_tipo"),
      mensagem_pagina_inicial: valueOf("mensagem_pagina_inicial"),

      imagem_campanha: {
        tipo: checkedValue("imagem_campanha_tipo"),
        briefing: valueOf("imagem_campanha_briefing"),
      },

      projetos,
    };
  };

  // ---------- Validação ----------
  const firstInvalid = (selector) => form.querySelector(selector);

  const validate = () => {
    const requiredText = [
      ["solicitante_nome", "Informe o nome do solicitante."],
      ["solicitante_departamento", "Informe o departamento."],
      ["publico_alvo", "Informe o público-alvo."],
    ];
    for (const [name, msg] of requiredText) {
      if (!valueOf(name)) return { msg, el: form.elements[name] };
    }

    const email = valueOf("solicitante_email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return { msg: "Informe um e-mail válido do solicitante.", el: form.elements.solicitante_email };
    }

    if (checkedArray("pilar").length === 0) {
      return { msg: "Selecione ao menos um pilar/tema.", el: form.querySelector('input[name="pilar"]') };
    }

    if (checkedArray("frequencia_almejada").length === 0) {
      return { msg: "Selecione a frequência de doação almejada.", el: form.querySelector('input[name="frequencia_almejada"]') };
    }

    const modo = checkedValue("campanha_referencia");
    if (!modo) {
      return { msg: "Informe se será usada campanha de referência.", el: firstInvalid('input[name="campanha_referencia"]') };
    }

    if (modo === "Sim") {
      const url = valueOf("campanha_referencia_url");
      if (!/^https?:\/\/\S+$/i.test(url)) {
        return { msg: "Insira a URL do link de referência (começando com http:// ou https://).", el: campanhaReferenciaUrl };
      }
      if (!valueOf("campanha_referencia_id")) {
        return { msg: "Insira o ID do link de referência.", el: campanhaReferenciaId };
      }
    }

    // Comuns aos dois modos (referência e manual).
    if (!valueOf("nome")) {
      return { msg: "Informe o nome da campanha.", el: form.elements.nome };
    }
    if (!slugify(valueOf("nome"))) {
      return { msg: "O nome da campanha deve conter letras ou números para gerar o link.", el: nomeCampanhaInput };
    }
    if (!valueOf("data_inicio")) {
      return { msg: "Informe a data de início.", el: dataInicio };
    }
    if (valueOf("data_inicio") < todayIso()) {
      return { msg: "A data de início não pode ser anterior a hoje.", el: dataInicio };
    }
    if (!valueOf("data_fim")) {
      return { msg: "Informe a data de fim.", el: dataFim };
    }
    if (valueOf("data_fim") < valueOf("data_inicio")) {
      return { msg: "A data de fim deve ser igual ou posterior à data de início.", el: dataFim };
    }
    if (!checkedValue("mensagem_pagina_inicial_tipo")) {
      return { msg: "Selecione usar texto padrão ou texto personalizado.", el: firstInvalid('input[name="mensagem_pagina_inicial_tipo"]') };
    }
    if (checkedValue("mensagem_pagina_inicial_tipo") === "personalizada" && !valueOf("mensagem_pagina_inicial")) {
      return { msg: "Escreva o texto personalizado da página de doação.", el: form.elements.mensagem_pagina_inicial };
    }
    if (!checkedValue("imagem_campanha_tipo")) {
      return { msg: "Selecione o tipo da imagem da campanha.", el: firstInvalid('input[name="imagem_campanha_tipo"]') };
    }
    if (checkedValue("imagem_campanha_tipo") === "personalizada_mkt" && !valueOf("imagem_campanha_briefing")) {
      return { msg: "Informe o ID do briefing solicitado ao MKT.", el: form.elements.imagem_campanha_briefing };
    }

    if (modo === "Não") {
      if (!checkedValue("frequencia_padrao")) {
        return { msg: "Selecione a frequência padrão.", el: firstInvalid('input[name="frequencia_padrao"]') };
      }
      if (!checkedValue("exigir_endereco")) {
        return { msg: "Informe se o endereço é obrigatório.", el: firstInvalid('input[name="exigir_endereco"]') };
      }
      if (checkedArray("formas_pagamento").length === 0) {
        return { msg: "Selecione ao menos uma forma de pagamento.", el: form.querySelector('input[name="formas_pagamento"]') };
      }
    }

    if (!checkedValue("planos_tipo")) {
      return { msg: "Selecione usar plano padrão ou plano personalizado.", el: firstInvalid('input[name="planos_tipo"]') };
    }
    if (isPlanosPersonalizado()) {
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
    }

    if (!valueOf("valor_minimo")) {
      return { msg: "Informe o valor mínimo travado da doação.", el: valorMinimo };
    }
    if (resolveValorMinimo() <= 0) {
      return { msg: "O valor mínimo deve ser maior que zero.", el: valorMinimo };
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
        "O envio está temporariamente indisponível: o endpoint ainda não foi configurado. " +
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
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
        alert((result && result.error) || "A solicitação foi rejeitada.");
        return;
      }

      navigateWithTransition("confirmacao.html");
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
      alert("Não foi possível enviar a solicitação. Verifique sua conexão e tente novamente.");
    }
  });
}
