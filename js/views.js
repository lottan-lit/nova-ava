/* ==========================================================
   VIEWS — cada função devolve o HTML de uma página
   ========================================================== */
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const partesData = (iso) => { const [, m, d] = iso.split("-"); return { dia: d, mes: MESES[Number(m) - 1] }; };
const iniciais = (nome) => nome.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");

/* ---------- componentes ---------- */
function cursoCard(c) {
  const p = Store.progresso(c.id);
  return `
    <a class="card course" href="#/disciplina/${c.id}">
      <span class="tag">${c.area}</span>
      <h3>${esc(c.nome)}</h3>
      <p>Prof. ${esc(c.prof)}</p>
      <div class="bar" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><i style="--w:${p}%"></i></div>
      <div class="meta"><span>${p}% concluído</span><span>${Store.aulasFeitas(c.id).length}/${c.aulas.length} aulas</span></div>
    </a>`;
}

function atividadeItem(a) {
  const st = Store.statusAtividade(a), d = partesData(a.prazo);
  const acao = st === "Entregue"
    ? `<span class="pill">Entregue</span>`
    : `<button class="pill on" data-acao="abrir-entrega" data-id="${a.id}" type="button">${st === "Atrasada" ? "Entregar (atrasada)" : "Entregar"}</button>`;
  return `
    <li class="item">
      <div class="date"><b>${d.dia}</b><small>${d.mes}</small></div>
      <div><strong>${esc(a.titulo)}</strong><span>${esc(Store.curso(a.cursoId).nome)}</span></div>
      ${acao}
    </li>`;
}

const listaVazia = (msg) => `<p class="muted">${msg}</p>`;
const pendentes = () => ATIVIDADES.filter((a) => Store.statusAtividade(a) !== "Entregue").sort((a, b) => a.prazo.localeCompare(b.prazo));

/* ---------- páginas ---------- */
const Views = {
  painel() {
    const pa = Store.proximaAula(), pg = Store.progressoGeral();
    const hero = pa
      ? `<small>Continue de onde parou</small><h2>${esc(pa.curso.nome)}</h2><p>Aula ${pa.i + 1} · ${esc(pa.curso.aulas[pa.i])}</p>`
      : `<small>Tudo em dia</small><h2>Semestre concluído</h2><p>Você finalizou todas as aulas.</p>`;
    return `
      <div class="grid grid-hero">
        <article class="card hero"><div>${hero}</div>
          <a class="btn" href="#/disciplina/${pa ? pa.curso.id : 1}">${pa ? "Continuar aula" : "Ver disciplinas"}</a></article>
        <article class="card stat">
          <div class="ring" style="--p:${pg}" data-label="${pg}%"></div>
          <strong>${Store.mediaGeral().toFixed(1)}</strong><span>Média geral · progresso ${pg}%</span>
        </article>
      </div>
      <div class="grid grid-2">
        <article class="card"><h2>Minhas disciplinas <a class="back" href="#/disciplinas">ver todas</a></h2>
          <div class="grid grid-3">${CURSOS.slice(0, 4).map(cursoCard).join("")}</div></article>
        <article class="card"><h2>Próximos prazos <a class="back" href="#/atividades">ver todas</a></h2>
          <ul class="list">${pendentes().slice(0, 3).map(atividadeItem).join("") || listaVazia("Nenhuma pendência. 🎉")}</ul></article>
      </div>`;
  },

  disciplinas(ui) {
    const t = ui.busca.toLowerCase();
    const lista = CURSOS.filter((c) => (c.nome + c.prof + c.area).toLowerCase().includes(t));
    return `<div class="grid grid-3">${lista.map(cursoCard).join("") || listaVazia("Nenhuma disciplina encontrada.")}</div>`;
  },

  disciplina(ui, id) {
    const c = Store.curso(id);
    if (!c) return listaVazia("Disciplina não encontrada.");
    const p = Store.progresso(c.id), feitas = Store.aulasFeitas(c.id);
    const abas = [["aulas", "Aulas"], ["materiais", "Materiais"], ["atividades", "Atividades"]]
      .map(([k, n]) => `<button class="tab" role="tab" aria-selected="${ui.aba === k}" data-acao="aba" data-aba="${k}" type="button">${n}</button>`).join("");
    let corpo = "";
    if (ui.aba === "aulas") {
      corpo = `<div class="list">${c.aulas.map((t, i) => `
        <button class="check ${feitas.includes(i) ? "done" : ""}" data-acao="aula" data-curso="${c.id}" data-i="${i}" type="button">
          <span class="box">${feitas.includes(i) ? "✓" : ""}</span>
          <div><strong>Aula ${i + 1} · ${esc(t)}</strong><span>${feitas.includes(i) ? "Concluída" : "Marcar como concluída"}</span></div>
        </button>`).join("")}</div>`;
    } else if (ui.aba === "materiais") {
      corpo = `<ul class="list">${c.materiais.map((m) => `
        <li class="item"><div><strong>${esc(m)}</strong><span>Material de apoio</span></div>
        <button class="pill on" data-acao="baixar" data-nome="${esc(m)}" type="button">Baixar</button></li>`).join("")}</ul>`;
    } else {
      const lista = ATIVIDADES.filter((a) => a.cursoId === c.id);
      corpo = `<ul class="list">${lista.map(atividadeItem).join("") || listaVazia("Sem atividades nesta disciplina.")}</ul>`;
    }
    return `
      <a class="back" href="#/disciplinas">← Voltar às disciplinas</a>
      <article class="card">
        <span class="tag-static">${c.area}</span>
        <h2 style="font-size:1.6rem;margin:12px 0 4px">${esc(c.nome)}</h2>
        <p class="muted">Prof. ${esc(c.prof)} · ${esc(c.desc)}</p>
        <div class="bar" style="margin:18px 0 8px"><i style="--w:${p}%"></i></div>
        <div class="meta"><span>${p}% concluído</span><span>Média ${Store.media(c.id).toFixed(1)} · Frequência ${FREQUENCIA[c.id]}%</span></div>
      </article>
      <div class="tabs" role="tablist">${abas}</div>
      <article class="card">${corpo}</article>`;
  },

  atividades(ui) {
    const t = ui.busca.toLowerCase();
    const lista = ATIVIDADES.filter((a) => (ui.filtro === "Todas" || Store.statusAtividade(a) === ui.filtro)
      && (a.titulo + Store.curso(a.cursoId).nome).toLowerCase().includes(t)).sort((a, b) => a.prazo.localeCompare(b.prazo));
    const filtros = ["Todas", "Pendente", "Atrasada", "Entregue"]
      .map((f) => `<button class="tab" role="tab" aria-selected="${ui.filtro === f}" data-acao="filtro" data-f="${f}" type="button">${f}</button>`).join("");
    return `<div class="tabs" role="tablist">${filtros}</div>
      <article class="card"><h2>Atividades <span>${lista.length} itens</span></h2>
      <ul class="list">${lista.map(atividadeItem).join("") || listaVazia("Nada por aqui.")}</ul></article>`;
  },

  notas() {
    const linhas = CURSOS.map((c) => {
      const [n1, n2] = NOTAS[c.id];
      return `<tr><td><a href="#/disciplina/${c.id}">${esc(c.nome)}</a></td><td>${n1.toFixed(1)}</td><td>${n2.toFixed(1)}</td>
        <td><b>${Store.media(c.id).toFixed(1)}</b></td><td>${FREQUENCIA[c.id]}%</td><td><span class="pill ${Store.situacao(c.id) === "Aprovado" ? "" : "on"}">${Store.situacao(c.id)}</span></td></tr>`;
    }).join("");
    return `<article class="card"><h2>Boletim <span>Média geral ${Store.mediaGeral().toFixed(1)}</span></h2>
      <div class="scroll-x"><table class="table"><thead><tr><th>Disciplina</th><th>Nota 1</th><th>Nota 2</th><th>Média</th><th>Freq.</th><th>Situação</th></tr></thead><tbody>${linhas}</tbody></table></div></article>`;
  },

  calendario(ui) {
    const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + ui.mes);
    const ano = base.getFullYear(), mes = base.getMonth(), total = new Date(ano, mes + 1, 0).getDate(), hoje = emDias(0);
    const prefixo = `${ano}-${p2(mes + 1)}`;
    const vazios = Array(base.getDay()).fill(`<div class="dia vazio"></div>`).join("");
    const dias = Array.from({ length: total }, (_, k) => {
      const iso = `${prefixo}-${p2(k + 1)}`;
      return `<div class="dia ${iso === hoje ? "hoje" : ""}">${k + 1}${ATIVIDADES.some((a) => a.prazo === iso) ? "<i></i>" : ""}</div>`;
    }).join("");
    const doMes = ATIVIDADES.filter((a) => a.prazo.startsWith(prefixo)).sort((a, b) => a.prazo.localeCompare(b.prazo));
    return `<div class="grid grid-2">
      <article class="card">
        <div class="cal-head"><button class="icon-btn" data-acao="mes" data-d="-1" aria-label="Mês anterior" type="button">‹</button>
          <strong>${MESES_LONGOS[mes]} ${ano}</strong>
          <button class="icon-btn" data-acao="mes" data-d="1" aria-label="Próximo mês" type="button">›</button></div>
        <div class="cal">${["D", "S", "T", "Q", "Q", "S", "S"].map((d) => `<div class="sem">${d}</div>`).join("")}${vazios}${dias}</div>
      </article>
      <article class="card"><h2>Prazos do mês</h2><ul class="list">${doMes.map(atividadeItem).join("") || listaVazia("Sem prazos neste mês.")}</ul></article>
    </div>`;
  },

  conta() {
    const u = Store.estado.usuario, feitas = Object.values(Store.estado.entregas).length;
    return `<div class="grid grid-2">
      <article class="card">
        <div class="profile"><div class="avatar">${iniciais(u.nome)}</div>
          <div><h2 style="margin:0">${esc(u.nome)}</h2><p class="muted">RA ${u.ra} · ${esc(u.curso)}</p></div></div>
        <form data-form="conta" style="margin-top:24px">
          <div class="field"><label for="c-nome">Nome</label><input id="c-nome" name="nome" value="${esc(u.nome)}" required></div>
          <div class="field"><label for="c-email">E-mail</label><input id="c-email" name="email" type="email" value="${esc(u.email)}" required></div>
          <div class="row"><button class="btn btn-solid" type="submit">Salvar alterações</button>
            <button class="btn btn-soft" data-acao="tema" type="button">Alternar tema</button></div>
        </form>
      </article>
      <article class="card"><h2>Resumo</h2>
        <ul class="list">
          <li class="item"><div><strong>${Store.progressoGeral()}%</strong><span>Progresso geral</span></div></li>
          <li class="item"><div><strong>${Store.mediaGeral().toFixed(1)}</strong><span>Média geral</span></div></li>
          <li class="item"><div><strong>${feitas} de ${ATIVIDADES.length}</strong><span>Atividades entregues</span></div></li>
        </ul>
        <div class="row" style="margin-top:20px"><button class="btn btn-soft" data-acao="sair" type="button">Sair</button>
          <button class="btn btn-soft" data-acao="reiniciar" type="button">Reiniciar simulação</button></div>
      </article>
    </div>`;
  }
};
