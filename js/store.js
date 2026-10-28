/* ==========================================================
   ESTADO + PERSISTÊNCIA (localStorage) + REGRAS DE NEGÓCIO
   ========================================================== */
const CHAVE = "nova-ava-v1";
const inicial = () => ({
  usuario: null,
  tema: null,
  aulas: { 1: [0, 1, 2], 2: [0, 1, 2], 3: [0, 1, 2, 3], 4: [0, 1], 5: [0, 1, 2], 6: [0, 1, 2, 3, 4] },
  entregas: { 6: { texto: "Resenha enviada.", arquivo: "resenha.pdf", data: emDias(-6) } }
});

const Store = {
  estado: inicial(),

  carregar() {
    try { const s = localStorage.getItem(CHAVE); if (s) this.estado = { ...inicial(), ...JSON.parse(s) }; } catch (e) { /* sem storage */ }
  },
  salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(this.estado)); } catch (e) { /* sem storage */ }
  },
  reiniciar() {
    try { localStorage.removeItem(CHAVE); } catch (e) { /* sem storage */ }
    this.estado = inicial();
  },

  curso: (id) => CURSOS.find((c) => c.id === Number(id)),
  aulasFeitas(id) { return this.estado.aulas[id] || []; },
  progresso(id) { return Math.round((this.aulasFeitas(id).length / this.curso(id).aulas.length) * 100); },
  progressoGeral() { return Math.round(CURSOS.reduce((s, c) => s + this.progresso(c.id), 0) / CURSOS.length); },

  alternarAula(cursoId, i) {
    const f = this.aulasFeitas(cursoId);
    this.estado.aulas[cursoId] = f.includes(i) ? f.filter((x) => x !== i) : [...f, i];
    this.salvar();
  },
  proximaAula() {
    for (const c of CURSOS) {
      const i = c.aulas.findIndex((_, k) => !this.aulasFeitas(c.id).includes(k));
      if (i >= 0) return { curso: c, i };
    }
    return null;
  },

  statusAtividade(a) {
    if (this.estado.entregas[a.id]) return "Entregue";
    return a.prazo < emDias(0) ? "Atrasada" : "Pendente";
  },
  entregar(id, texto, arquivo) {
    this.estado.entregas[id] = { texto, arquivo, data: emDias(0) };
    this.salvar();
  },

  media(id) { const [a, b] = NOTAS[id]; return (a + b) / 2; },
  mediaGeral() { return CURSOS.reduce((s, c) => s + this.media(c.id), 0) / CURSOS.length; },
  situacao(id) { return this.media(id) >= 6 && FREQUENCIA[id] >= 75 ? "Aprovado" : "Em risco"; }
};
