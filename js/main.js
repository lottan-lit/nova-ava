/* ==========================================================
   APP — rotas, ações, modal, tema e inicialização
   ========================================================== */
const $ = (s) => document.querySelector(s);
const ui = { aba: "aulas", filtro: "Todas", busca: "", mes: 0 };

const ROTAS = {
  painel:     { icone: "M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z", menu: "Painel" },
  disciplinas:{ icone: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5", menu: "Disciplinas" },
  disciplina: { oculta: true, menu: "Disciplinas" },
  atividades: { icone: "M9 11l3 3 8-8M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9", menu: "Atividades" },
  notas:      { icone: "M4 20V10M10 20V4M16 20v-7M22 20H2", menu: "Notas" },
  calendario: { icone: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4", menu: "Calendário" },
  conta:      { icone: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0", menu: "Conta" }
};

/* ---------- utilidades ---------- */
function aviso(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("on");
  clearTimeout(aviso.id); aviso.id = setTimeout(() => t.classList.remove("on"), 2400);
}

function aplicarTema() {
  const t = Store.estado.tema;
  t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme");
}

/* ---------- render ---------- */
function rotaAtual() {
  const [, nome = "painel", param] = location.hash.slice(1).split("/");
  return { nome: ROTAS[nome] ? nome : "painel", param };
}

function render() {
  const logado = Boolean(Store.estado.usuario);
  $("#login").hidden = logado; $("#shell").hidden = !logado;
  if (!logado) return;

  const { nome, param } = rotaAtual(), u = Store.estado.usuario;
  const c = nome === "disciplina" ? Store.curso(param) : null;
  const titulos = {
    painel: [`Olá, ${u.nome.split(" ")[0]} 👋`, `Você tem ${pendentes().length} atividades pendentes.`],
    disciplinas: ["Disciplinas", "Todas as disciplinas do semestre."],
    disciplina: [c ? c.nome : "Disciplina", c ? `Prof. ${c.prof}` : ""],
    atividades: ["Atividades", "Acompanhe prazos e entregas."],
    notas: ["Notas", "Seu desempenho em cada disciplina."],
    calendario: ["Calendário", "Datas importantes do semestre."],
    conta: ["Minha conta", "Dados e preferências do aluno."]
  };
  [$("#titulo").textContent, $("#subtitulo").textContent] = titulos[nome];
  $("#avatar").textContent = iniciais(u.nome);
  $("#app").innerHTML = Views[nome](ui, param);

  $("#nav").innerHTML = Object.entries(ROTAS).filter(([, r]) => !r.oculta).map(([k, r]) => `
    <button data-acao="ir" data-rota="${k}" ${r.menu === ROTAS[nome].menu ? 'aria-current="page"' : ""} type="button">
      <svg viewBox="0 0 24 24"><path d="${r.icone}"/></svg>${r.menu}</button>`).join("");
}

/* ---------- modal de entrega ---------- */
function abrirEntrega(id) {
  const a = ATIVIDADES.find((x) => x.id === Number(id));
  const m = $("#modal");
  m.innerHTML = `
    <form data-form="entrega" data-id="${a.id}">
      <h2>${esc(a.titulo)}</h2><p class="muted">${esc(Store.curso(a.cursoId).nome)} · prazo ${a.prazo.split("-").reverse().join("/")}</p>
      <div class="field"><label for="e-texto">Comentário</label><textarea id="e-texto" name="texto" rows="3" placeholder="Escreva algo sobre a sua entrega"></textarea></div>
      <div class="field"><label for="e-arq">Arquivo</label><input id="e-arq" name="arquivo" type="file"></div>
      <div class="row"><button class="btn btn-solid" type="submit">Enviar entrega</button>
        <button class="btn btn-soft" data-acao="fechar" type="button">Cancelar</button></div>
    </form>`;
  m.showModal();
}

/* ---------- ações (data-acao) ---------- */
const ACOES = {
  ir: (el) => { location.hash = `#/${el.dataset.rota}`; },
  aba: (el) => { ui.aba = el.dataset.aba; render(); },
  filtro: (el) => { ui.filtro = el.dataset.f; render(); },
  mes: (el) => { ui.mes += Number(el.dataset.d); render(); },
  aula: (el) => { Store.alternarAula(el.dataset.curso, Number(el.dataset.i)); render(); },
  baixar: (el) => aviso(`Download simulado: ${el.dataset.nome}`),
  "abrir-entrega": (el) => abrirEntrega(el.dataset.id),
  fechar: () => $("#modal").close(),
  tema: () => {
    const escuro = Store.estado.tema ? Store.estado.tema === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    Store.estado.tema = escuro ? "light" : "dark"; Store.salvar(); aplicarTema();
  },
  sair: () => { Store.estado.usuario = null; Store.salvar(); render(); },
  reiniciar: () => { Store.reiniciar(); aplicarTema(); location.hash = "#/painel"; render(); aviso("Simulação reiniciada."); }
};

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-acao]");
  if (el && ACOES[el.dataset.acao]) ACOES[el.dataset.acao](el);
});

/* ---------- formulários (data-form) ---------- */
const FORMS = {
  login: (f) => {
    Store.estado.usuario = { nome: f.nome.value.trim(), email: f.email.value.trim(), ra: `2026${Math.floor(1000 + Math.random() * 9000)}`, curso: "Sistemas de Informação" };
    Store.salvar(); location.hash = "#/painel"; render();
  },
  conta: (f) => {
    Object.assign(Store.estado.usuario, { nome: f.nome.value.trim(), email: f.email.value.trim() });
    Store.salvar(); render(); aviso("Dados atualizados.");
  },
  entrega: (f) => {
    Store.entregar(f.dataset.id, f.texto.value.trim(), f.arquivo.files[0]?.name || "sem arquivo");
    $("#modal").close(); render(); aviso("Entrega enviada com sucesso.");
  }
};

document.addEventListener("submit", (e) => {
  const f = e.target.closest("[data-form]");
  if (!f) return;
  e.preventDefault(); FORMS[f.dataset.form](f);
});

$("#busca").addEventListener("input", (e) => {
  ui.busca = e.target.value;
  const { nome } = rotaAtual();
  if (nome === "disciplinas" || nome === "atividades") render();
});

window.addEventListener("hashchange", () => { ui.aba = "aulas"; ui.filtro = "Todas"; ui.busca = ""; $("#busca").value = ""; render(); window.scrollTo(0, 0); });

/* fecha o modal ao clicar no fundo */
$("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") e.target.close(); });

/* ---------- init ---------- */
Store.carregar(); aplicarTema(); render();
