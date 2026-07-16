import 'bootstrap/dist/css/bootstrap.min.css';
import style from './dashboard.module.css';
import '../../styles/buttons.css';
import navbarStyles from '../components/navBar.module.css';
import { Link } from 'react-router-dom';

const summaryCards = [
  {
    title: 'Saldo Geral',
    value: 'R$ 18.430,00',
    subtitle: 'Disponível agora',
    color: '#1e293b'
  },
  {
    title: 'Receitas do Mês',
    value: 'R$ 8.240,00',
    subtitle: '+12% em relação ao mês passado',
    color: '#4f9a7b)'
  },
  {
    title: 'Despesas do Mês',
    value: 'R$ 4.980,00',
    subtitle: '-3% em relação ao mês passado',
    color: '#ef4444'
  },
  {
    title: 'Fatura Atual',
    value: 'R$ 1.680,00',
    subtitle: 'Limite disponível: R$ 2.320,00',
    color: '#f59e0b'
  }
];

const monthData = [
  { month: 'Jan', receitas: 5200, despesas: 2900 },
  { month: 'Fev', receitas: 6100, despesas: 3400 },
  { month: 'Mar', receitas: 5800, despesas: 3600 },
  { month: 'Abr', receitas: 6900, despesas: 4100 },
  { month: 'Mai', receitas: 7200, despesas: 3850 },
  { month: 'Jun', receitas: 7800, despesas: 4300 }
];

const categoryShare = [
  { name: 'Alimentação', value: 34, color: '#4f9a7b' },
  { name: 'Transporte', value: 22, color: '#1e293b' },
  { name: 'Lazer', value: 18, color: '#f59e0b' },
  { name: 'Saúde', value: 14, color: '#a78bfa' },
  { name: 'Outros', value: 12, color: '#ef4444' }
];

const alerts = [
  {
    title: 'Atenção',
    text: 'Você já consumiu 85% do limite de alimentação este mês.'
  },
  {
    title: 'Resumo',
    text: 'Seu saldo de reserva continua acima de 30% da sua renda mensal.'
  }
];

const budgets = [
  { name: 'Alimentação', used: 85, total: 100, color: '#4f9a7b' },
  { name: 'Transporte', used: 62, total: 100, color: '#1e293b' },
  { name: 'Lazer', used: 41, total: 100, color: '#f59e0b' }
];

const goals = [
  {
    name: 'Viagem para a Praia',
    saved: 4200,
    target: 6000,
    color: '#4f9a7b'
  },
  {
    name: 'Carro Novo',
    saved: 16500,
    target: 30000,
    color: '#1e293b'
  }
];

const movements = [
  { icon: '💸', name: 'Salário', date: '12/07', value: '+ R$ 3.200,00', type: 'income' },
  { icon: '🥗', name: 'Supermercado', date: '11/07', value: '- R$ 430,00', type: 'expense' },
  { icon: '🚗', name: 'Combustível', date: '10/07', value: '- R$ 180,00', type: 'expense' },
  { icon: '🎉', name: 'Lazer', date: '09/07', value: '- R$ 240,00', type: 'expense' },
  { icon: '💳', name: 'Pagamento de cartão', date: '08/07', value: '- R$ 520,00', type: 'expense' }
];

const dashboardNavItems = [
  { label: 'Receita', path: '/receita' },
  { label: 'Despesa', path: '/despesa' },
  { label: 'Conta', path: '/conta' },
  { label: 'Cartao', path: '/cartao' },
  { label: 'Objetivo', path: '/objetivo' },
  { label: 'Orcamento', path: '/orcamento' },
  { label: 'Relatorio', path: '/relatorio' }
];

function Dashboard() {
  const maxValue = Math.max(...monthData.flatMap((item) => [item.receitas, item.despesas]));
  const donutGradient = `conic-gradient(${categoryShare
    .map((item, index) => {
      const start = categoryShare
        .slice(0, index)
        .reduce((acc, current) => acc + current.value, 0);
      const end = start + item.value;

      return `${item.color} ${start}% ${end}%`;
    })
    .join(', ')})`;

  return (
    <div className={style.dashboardPage}>
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
          </ul>
        </div>
      </nav>

      <header className={style.dashboardHeader}>
        <div>
          <p className={style.kicker}>Painel financeiro</p>
          <h1>Dashboard</h1>
        </div>

        <button type="button" className="headerButton">
          + Nova transação
        </button>
      </header>

      <section className={style.summaryGrid}>
        {summaryCards.map((card) => (
          <article
            key={card.title}
            className={style.summaryCard}
            style={{ borderTop: `4px solid ${card.color}` }}
          >
            <span className={style.cardLabel}>{card.title}</span>
            <p className={style.cardValue}>{card.value}</p>
            <p className={style.cardSubtle}>{card.subtitle}</p>
          </article>
        ))}
      </section>

      <section className={style.chartsGrid}>
        <article className={style.panelCard}>
          <h2 className={style.sectionTitle}>Receitas vs. despesas</h2>

          <div className={style.barChart}>
            {monthData.map((item) => (
              <div key={item.month} className={style.barColumn}>
                <div className={style.barPair}>
                  <div
                    className={style.bar}
                    style={{
                      height: `${(item.receitas / maxValue) * 100}%`,
                      background: 'var(--cor-01)'
                    }}
                  />
                  <div
                    className={style.bar}
                    style={{
                      height: `${(item.despesas / maxValue) * 100}%`,
                      background: '#ef4444'
                    }}
                  />
                </div>
                <span className={style.monthLabel}>{item.month}</span>
              </div>
            ))}
          </div>
        </article>

        <article className={style.panelCard}>
          <h2 className={style.sectionTitle}>Distribuição de despesas</h2>

          <div className={style.donutWrap}>
            <div className={style.donutChart} style={{ background: donutGradient }}>
              <div className={style.donutInner}>
                <div>
                  <strong>44%</strong>
                  <span>gasto útil</span>
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
        </article>
      </section>

      <section className={style.lowerGrid}>
        <article className={style.panelCard}>
          <h2 className={style.sectionTitle}>Alertas e orçamento</h2>

          <div className={style.alertList}>
            {alerts.map((alert) => (
              <div key={alert.title} className={style.alertItem}>
                <strong>{alert.title}</strong>
                <span>{alert.text}</span>
              </div>
            ))}
          </div>

          <div className={style.budgetList} style={{ marginTop: 18 }}>
            {budgets.map((budget) => (
              <div key={budget.name} className={style.budgetItem}>
                <div className={style.budgetLabelRow}>
                  <strong>{budget.name}</strong>
                  <span>{budget.used}% usado</span>
                </div>

                <div className={style.progressTrack} style={{ marginTop: 10 }}>
                  <div
                    className={style.progressBar}
                    style={{ width: `${budget.used}%`, background: budget.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className={style.panelCard}>
          <h2 className={style.sectionTitle}>Objetivos financeiros</h2>

          <div className={style.goalGrid}>
            {goals.map((goal) => {
              const percent = Math.min(100, Math.round((goal.saved / goal.target) * 100));

              return (
                <div key={goal.name} className={style.goalCard}>
                  <div className={style.goalHead}>
                    <strong>{goal.name}</strong>
                    <span>{percent}%</span>
                  </div>

                  <div className={style.goalValue}>
                    R$ {goal.saved.toLocaleString('pt-BR')}
                  </div>

                  <div className={style.goalMeta}>
                    <span>Meta: R$ {goal.target.toLocaleString('pt-BR')}</span>
                    <span>Atual</span>
                  </div>

                  <div className={style.progressTrack}>
                    <div
                      className={style.progressBar}
                      style={{ width: `${percent}%`, background: goal.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className={style.panelCard} style={{ marginTop: 24 }}>
        <h2 className={style.sectionTitle}>Últimas movimentações</h2>

        <div className={style.movList}>
          {movements.map((item) => (
            <article key={`${item.name}-${item.date}`} className={style.movementItem}>
              <div className={style.movIcon} aria-hidden="true">{item.icon}</div>

              <div className={style.movText}>
                <strong>{item.name}</strong>
                <span>{item.date}</span>
              </div>

              <div className={`${style.movValue} ${item.type === 'income' ? style.income : style.expense}`}>
                {item.value}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
