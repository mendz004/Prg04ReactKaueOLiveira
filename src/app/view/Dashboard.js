import { useState, useEffect, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import style from './dashboard.module.css';
import '../../styles/buttons.css';
import navbarStyles from '../components/navBar.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/Api';

const dashboardNavItems = [
  { label: 'Receita', path: '/receita' },
  { label: 'Despesa', path: '/despesa' },
  { label: 'Conta', path: '/conta' },
  { label: 'Cartao', path: '/cartao' },
  { label: 'Objetivo', path: '/objetivo' },
  { label: 'Orcamento', path: '/orcamento' },
  { label: 'Relatorio', path: '/relatorio' }
];

// Paleta de cores para categorização dinâmica
const PALETTE = ['#4f9a7b', '#1e293b', '#f59e0b', '#a78bfa', '#ef4444', '#3b82f6', '#ec4899'];

function Dashboard() {
  const navigate = useNavigate();
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [objetivos, setObjetivos] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  function handleLogout() {
    localStorage.clear();
    navigate('/login', { replace: true });
  }

  // Busca dados de todas as rotas do Spring Boot
  useEffect(() => {
    const fetchData = async () => {
      const usuarioStorage = localStorage.getItem('usuarioAppFinanceiro');
      if (!usuarioStorage) {
        setLoading(false);
        return;
      }
      const usuarioLogado = JSON.parse(usuarioStorage);
      const config = { headers: { Authorization: `Bearer ${usuarioLogado.token}` } };

      try {
        const [resReceitas, resDespesas, resObjetivos, resOrcamentos] = await Promise.allSettled([
          api.get('/receitas', config),
          api.get('/despesas', config),
          api.get('/objetivos', config),
          api.get('/orcamentos', config)
        ]);

        if (resReceitas.status === 'fulfilled') {
          setReceitas(Array.isArray(resReceitas.value.data) ? resReceitas.value.data : []);
        }
        if (resDespesas.status === 'fulfilled') {
          setDespesas(Array.isArray(resDespesas.value.data) ? resDespesas.value.data : []);
        }
        if (resObjetivos.status === 'fulfilled') {
          setObjetivos(Array.isArray(resObjetivos.value.data) ? resObjetivos.value.data : []);
        }
        if (resOrcamentos.status === 'fulfilled') {
          setOrcamentos(Array.isArray(resOrcamentos.value.data) ? resOrcamentos.value.data : []);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- 1. CÁLCULOS FINANCEIROS GERAIS ---
  const totalReceitas = useMemo(() => {
    return receitas.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
  }, [receitas]);

  const totalDespesas = useMemo(() => {
    return despesas.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
  }, [despesas]);

  const saldoGeral = totalReceitas - totalDespesas;

  // Os orçamentos armazenam o limite; o gasto é obtido das despesas da mesma categoria.
  // Isso mantém o dashboard sincronizado com a tela de Orçamentos e com a API.
  const orcamentosComGastos = useMemo(() => {
    return orcamentos.map((orcamento) => {
      const categoria = (orcamento.categoria || orcamento.nome || '').toUpperCase();
      const gasto = despesas
        .filter((despesa) => (despesa.categoria || despesa.origem || '').toUpperCase() === categoria)
        .reduce((total, despesa) => total + (Number(despesa.valor) || 0), 0);

      return {
        ...orcamento,
        gasto,
        limite: Number(orcamento.limite || orcamento.valorLimite || 0)
      };
    });
  }, [orcamentos, despesas]);

  // --- 2. DISTRIBUIÇÃO DINÂMICA DE DESPESAS POR CATEGORIA ---
  const categoryShare = useMemo(() => {
    if (!despesas.length || totalDespesas === 0) return [];

    // Agrupa os valores de despesa por Categoria/Origem
    const grouped = despesas.reduce((acc, item) => {
      const cat = item.categoria || item.origem || 'OUTROS';
      acc[cat] = (acc[cat] || 0) + (Number(item.valor) || 0);
      return acc;
    }, {});

    // Mapeia para porcentagem e atribui cores
    return Object.entries(grouped).map(([name, amount], index) => {
      const percentage = Math.round((amount / totalDespesas) * 100);
      return {
        name,
        amount,
        value: percentage,
        color: PALETTE[index % PALETTE.length]
      };
    });
  }, [despesas, totalDespesas]);

  // Gradient para o gráfico Donut/Rosca
  const donutGradient = useMemo(() => {
    if (!categoryShare.length) return 'conic-gradient(#e2e8f0 0% 100%)';

    let currentAcc = 0;
    const slices = categoryShare.map((item) => {
      const start = currentAcc;
      currentAcc += item.value;
      return `${item.color} ${start}% ${currentAcc}%`;
    });

    return `conic-gradient(${slices.join(', ')})`;
  }, [categoryShare]);

  // --- 3. ÚLTIMAS MOVIMENTAÇÕES (RECEITAS + DESPESAS) ---
  const movements = useMemo(() => {
    const list = [
      ...receitas.map((r) => ({
        id: `rec-${r.id}`,
        icon: '💸',
        name: r.descricao || 'Receita',
        date: r.data ? new Date(r.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '--/--',
        rawDate: new Date(r.data || Date.now()),
        value: `+ R$ ${Number(r.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        type: 'income'
      })),
      ...despesas.map((d) => ({
        id: `desp-${d.id}`,
        icon: '🛒',
        name: d.descricao || 'Despesa',
        date: d.data ? new Date(d.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '--/--',
        rawDate: new Date(d.data || Date.now()),
        value: `- R$ ${Number(d.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        type: 'expense'
      }))
    ];

    return list.sort((a, b) => b.rawDate - a.rawDate).slice(0, 5);
  }, [receitas, despesas]);

  // Cards sintéticos do topo
  const summaryCards = [
    {
      title: 'Saldo Geral',
      value: `R$ ${saldoGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: 'Calculado em tempo real',
      color: '#1e293b'
    },
    {
      title: 'Receitas Totais',
      value: `R$ ${totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: `${receitas.length} lançamentos`,
      color: '#4f9a7b'
    },
    {
      title: 'Despesas Totais',
      value: `R$ ${totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: `${despesas.length} lançamentos`,
      color: '#ef4444'
    },
    {
      title: 'Objetivos Ativos',
      value: `${objetivos.length}`,
      subtitle: 'Metas em andamento',
      color: '#f59e0b'
    }
  ];

  return (
    <div className={style.dashboardPage}>
      {/* NAVBAR */}
      <nav className={`${navbarStyles.navbar} navbar navbar-expand-lg navbar-dark sticky-top mb-4`}>
        <Link className={`navbar-brand ${navbarStyles.logo}`} to="/dashboard">
          📊 Dashboard
        </Link>

        <button
          className="navbar-toggler" type="button" data-bs-toggle="collapse"
          data-bs-target="#dashboardNav" aria-controls="dashboardNav" aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="dashboardNav">
          <ul className={`navbar-nav ms-auto gap-1 py-2 py-lg-0 ${navbarStyles.list}`}>
            {dashboardNavItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link className="nav-link" to={item.path}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="nav-item d-flex align-items-center">
              <button type="button" className={`btn btn-sm ${navbarStyles.logoutButton}`} onClick={handleLogout}>
                Sair
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* HEADER */}
      <header className={style.dashboardHeader}>
        <div>
          <p className={style.kicker}>Painel financeiro</p>
          <h1>Dashboard</h1>
        </div>

        <Link to="/receita" className="headerButton text-decoration-none d-inline-flex align-items-center justify-content-center">
          + Nova transação
        </Link>
      </header>

      {/* CARDS RESUMO DADOS REAIS */}
      <section className={style.summaryGrid}>
        {summaryCards.map((card) => (
          <article
            key={card.title}
            className={style.summaryCard}
            style={{ borderTop: `4px solid ${card.color}` }}
          >
            <span className={style.cardLabel}>{card.title}</span>
            <p className={style.cardValue}>{loading ? '...' : card.value}</p>
            <p className={style.cardSubtle}>{card.subtitle}</p>
          </article>
        ))}
      </section>

      {/* SEÇÃO GRÁFICOS */}
      <section className={style.chartsGrid}>
        {/* DISTRIBUIÇÃO DE DESPESAS DINÂMICA */}
        <article className={style.panelCard}>
          <h2 className={style.sectionTitle}>Distribuição de despesas</h2>

          {categoryShare.length === 0 ? (
            <div className="p-4 text-center text-muted">
              Cadastre despesas para visualizar a distribuição por categoria.
            </div>
          ) : (
            <div className={style.donutWrap}>
              <div className={style.donutChart} style={{ background: donutGradient }}>
                <div className={style.donutInner}>
                  <div>
                    <strong>100%</strong>
                    <span>dos gastos</span>
                  </div>
                </div>
              </div>

              <div className={style.legendList}>
                {categoryShare.map((item) => (
                  <div key={item.name} className={style.legendItem}>
                    <div className={style.legendMeta}>
                      <span className={style.legendDot} style={{ background: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <strong>{item.value}%</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* ORÇAMENTOS */}
        <article className={style.panelCard}>
          <h2 className={style.sectionTitle}>Alertas e orçamento</h2>

          {orcamentosComGastos.length === 0 ? (
            <p className="text-muted small">Nenhum orçamento definido para este mês.</p>
          ) : (
            <div className={style.budgetList}>
              {orcamentosComGastos.map((budget) => {
                const usedPct = budget.limite ? Math.min(100, Math.round((budget.gasto / budget.limite) * 100)) : 0;
                return (
                  <div key={budget.id || budget.categoria} className={style.budgetItem}>
                    <div className={style.budgetLabelRow}>
                      <strong>{budget.categoria || budget.nome}</strong>
                      <span>{usedPct}% usado</span>
                    </div>

                    <small className="text-muted">
                      R$ {budget.gasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de R$ {budget.limite.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </small>

                    <div className={style.progressTrack} style={{ marginTop: 10 }}>
                      <div
                        className={style.progressBar}
                        style={{ width: `${usedPct}%`, background: usedPct > 90 ? '#ef4444' : '#4f9a7b' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </section>

      {/* OBJETIVOS E MOVIMENTAÇÕES */}
      <section className={style.lowerGrid}>
        {/* OBJETIVOS FINANCEIROS DINÂMICOS */}
        <article className={style.panelCard}>
          <h2 className={style.sectionTitle}>Objetivos financeiros</h2>

          {objetivos.length === 0 ? (
            <p className="text-muted small">Nenhum objetivo cadastrado ainda. Crie metas na aba Objetivo!</p>
          ) : (
            <div className={style.goalGrid}>
              {objetivos.map((goal, index) => {
                // Procura o valor guardado/atual
                const saved = Number(goal.valorAtual || goal.valorGuardado || goal.guardado || 0);

                // Procura o valor da meta (incluindo goal.meta e goal.valorAlvo)
                const target = Number(goal.meta || goal.valorMeta || goal.valorAlvo || goal.valorTotal || goal.valor || goal.objetivo || 1);

                const percent = Math.min(100, Math.round((saved / target) * 100));
                const color = PALETTE[index % PALETTE.length];

                return (
                  <div key={goal.id || goal.nome} className={style.goalCard}>
                    <div className={style.goalHead}>
                      <strong>{goal.nome || goal.descricao}</strong>
                      <span>{percent}%</span>
                    </div>

                    <div className={style.goalValue}>
                      R$ {saved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>

                    <div className={style.goalMeta}>
                      <span>Meta: R$ {target.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className={style.progressTrack}>
                      <div
                        className={style.progressBar}
                        style={{ width: `${percent}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </article>

        {/* ÚLTIMAS MOVIMENTAÇÕES DADOS REAIS */}
        <article className={style.panelCard}>
          <h2 className={style.sectionTitle}>Últimas movimentações</h2>

          <div className={style.movList}>
            {loading ? (
              <p>Carregando movimentações...</p>
            ) : movements.length === 0 ? (
              <p className="text-muted small">Nenhuma movimentação cadastrada.</p>
            ) : (
              movements.map((item) => (
                <article key={item.id} className={style.movementItem}>
                  <div className={style.movIcon} aria-hidden="true">{item.icon}</div>

                  <div className={style.movText}>
                    <strong>{item.name}</strong>
                    <span>{item.date}</span>
                  </div>

                  <div className={`${style.movValue} ${item.type === 'income' ? style.income : style.expense}`}>
                    {item.value}
                  </div>
                </article>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

export default Dashboard;
