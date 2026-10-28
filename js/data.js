/* ==========================================================
   DADOS DE EXEMPLO — edite aqui para adaptar à instituição
   ========================================================== */
const p2 = (n) => String(n).padStart(2, "0");
const paraISO = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const emDias = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return paraISO(d); };

const CURSOS = [
  { id: 1, nome: "Engenharia de Software", area: "Tecnologia", prof: "Rafael Lima",
    desc: "Princípios de arquitetura, APIs e qualidade de software.",
    aulas: ["Introdução à arquitetura", "Monolitos e microsserviços", "APIs REST", "Mensageria e eventos", "Observabilidade"],
    materiais: ["Slides – Arquitetura.pdf", "Guia de APIs REST.pdf"] },
  { id: 2, nome: "Banco de Dados", area: "Tecnologia", prof: "Helena Prado",
    desc: "Modelagem relacional, SQL e boas práticas de performance.",
    aulas: ["Modelo entidade-relacionamento", "Normalização", "SQL básico", "Joins e subconsultas", "Índices"],
    materiais: ["Apostila de SQL.pdf", "Exercícios resolvidos.pdf"] },
  { id: 3, nome: "Gestão Financeira", area: "Negócios", prof: "Carlos Dias",
    desc: "Fluxo de caixa, orçamento e análise de investimentos.",
    aulas: ["Fundamentos financeiros", "Fluxo de caixa", "Orçamento empresarial", "Custo de capital", "Análise de investimentos"],
    materiais: ["Planilha de fluxo de caixa.xlsx", "Casos de estudo.pdf"] },
  { id: 4, nome: "Design de Interfaces", area: "Design", prof: "Júlia Alves",
    desc: "UX, UI, sistemas de design e prototipação.",
    aulas: ["Fundamentos de UX", "Pesquisa com usuários", "Design systems", "Prototipação", "Testes de usabilidade"],
    materiais: ["Checklist de usabilidade.pdf", "Kit de componentes.fig"] },
  { id: 5, nome: "Inteligência Artificial", area: "Tecnologia", prof: "Tiago Reis",
    desc: "Aprendizado de máquina, redes neurais e ética em IA.",
    aulas: ["O que é IA", "Regressão e classificação", "Redes neurais", "Avaliação de modelos", "IA responsável"],
    materiais: ["Notebook de classificação.pdf", "Leituras complementares.pdf"] },
  { id: 6, nome: "Ética e Sociedade", area: "Humanas", prof: "Marta Nunes",
    desc: "Ética profissional, cidadania e impacto social da tecnologia.",
    aulas: ["Ética e moral", "Cidadania digital", "Tecnologia e trabalho", "Privacidade e LGPD", "Responsabilidade social"],
    materiais: ["Textos de apoio.pdf"] }
];

const ATIVIDADES = [
  { id: 1, cursoId: 1, titulo: "Projeto: API REST", prazo: emDias(2) },
  { id: 2, cursoId: 2, titulo: "Lista de exercícios 4", prazo: emDias(4) },
  { id: 3, cursoId: 4, titulo: "Protótipo de alta fidelidade", prazo: emDias(7) },
  { id: 4, cursoId: 3, titulo: "Estudo de caso: fluxo de caixa", prazo: emDias(9) },
  { id: 5, cursoId: 5, titulo: "Classificador simples", prazo: emDias(12) },
  { id: 6, cursoId: 6, titulo: "Resenha crítica", prazo: emDias(-5) },
  { id: 7, cursoId: 2, titulo: "Modelagem relacional", prazo: emDias(-2) }
];

const NOTAS = { 1: [8.5, 9.0], 2: [7.5, 8.0], 3: [9.0, 9.5], 4: [8.0, 8.5], 5: [7.0, 8.0], 6: [9.5, 9.0] };
const FREQUENCIA = { 1: 96, 2: 92, 3: 100, 4: 94, 5: 90, 6: 98 };
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MESES_LONGOS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
