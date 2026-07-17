import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/buttons.css';
import navbarStyles from '../components/navBar.module.css';
import styles from './relatorio.module.css';

const nav = [
  ['Dashboard', '/dashboard'],
  ['Receita', '/receita'],
  ['Despesa', '/despesa'],
  ['Conta', '/conta'],
  ['Cartão', '/cartao'],
  ['Objetivo', '/objetivo'],
  ['Orçamento', '/orcamento'],
  ['Relatório', '/relatorio']
];

const categories = [
  ['Moradia', 1350, '#8b5cf6'],
  ['Alimentação', 680, '#f59e0b'],
  ['Transporte', 420, '#06b6d4'],
  ['Lazer', 370, '#ef4444'],
  ['Saúde', 240, '#22c55e']
];

const days = [
  ['01', 420, 120],
  ['05', 0, 280],
  ['10', 950, 150],
  ['15', 3200, 430],
  ['20', 180, 690],
  ['25', 0, 310],
  ['30', 0, 180]
];

const money = (value) => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
}).format(value);

function Donut() {
  const total = categories.reduce((sum, [, value]) => sum + value, 0);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className={styles.donutWrap}>
      <svg viewBox="0 0 140 140" aria-label="Despesas por categoria">
        {categories.map(([name, value, color]) => {
          const dash = (value / total) * circumference;
          const circle = (
            <circle
              key={name}
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="19"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 70 70)"
            />
          );

          offset += dash;
          return circle;
        })}
        <text x="70" y="66" textAnchor="middle" className={styles.donutValue}>
          {money(total).replace(',00', '')}
        </text>
        <text x="70" y="84" textAnchor="middle" className={styles.donutLabel}>
          despesas
        </text>
      </svg>
    </div>
  );
}

function Evolution() {
  const max = 3400;
  const width = 560;
  const height = 185;
  const points = days
    .map(([, income], index) => `${45 + index * 70},${160 - (income / max) * 125}`)
    .join(' ');

  return (
    <svg className={styles.evolution} viewBox={`0 0 ${width} ${height}`} aria-label="Evolução de receitas e despesas">
      {[35, 80, 125, 160].map((y) => (
        <line key={y} x1="38" y1={y} x2="540" y2={y} className={styles.gridLine} />
      ))}
      {days.map(([day, , expense], index) => {
        const x = 45 + index * 70;
        const barHeight = (expense / max) * 125;

        return (
          <g key={day}>
            <rect x={x - 10} y={160 - barHeight} width="20" height={barHeight} rx="4" className={styles.expenseBar} />
            <text x={x} y="180" textAnchor="middle" className={styles.axisText}>{day}</text>
          </g>
        );
      })}
      <polyline points={points} fill="none" className={styles.incomeLine} />
      {days.map(([, income], index) => (
        <circle key={index} cx={45 + index * 70} cy={160 - (income / max) * 125} r="4" className={styles.incomePoint} />
      ))}
    </svg>
  );
}

export default function Relatorio() {
  const [period, setPeriod] = useState('Julho 2026');
  const [account, setAccount] = useState('Todas as contas');

  const income = 5050;
  const expense = 3060;
  const balance = income - expense;
  const total = categories.reduce((sum, [, value]) => sum + value, 0);
  const sorted = useMemo(() => [...categories].sort((first, second) => second[1] - first[1]), []);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <nav className={`${navbarStyles.navbar} navbar navbar-expand-lg navbar-dark sticky-top mb-4`}>
          <Link className={`navbar-brand ${navbarStyles.logo}`} to="/relatorio">
            📈 Relatórios
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#reportNav">
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="reportNav">
            <ul className={`navbar-nav ms-auto gap-1 py-2 py-lg-0 ${navbarStyles.list}`}>
              {nav.map(([label, path]) => (
                <li key={path} className="nav-item">
                  <Link className="nav-link" to={path}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <header className={styles.header}>
          <div>
            <p>VISÃO FINANCEIRA</p>
            <h1>Relatórios</h1>
            <small>Entenda seus hábitos e tome decisões melhores.</small>
          </div>
          <button className={styles.export} onClick={() => window.print()}>
            ⇩ Exportar relatório
          </button>
        </header>

        <section className={styles.filters}>
          <label>
            Período
            <select value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option>Julho 2026</option>
              <option>Últimos 3 meses</option>
              <option>Últimos 6 meses</option>
              <option>Período personalizado</option>
            </select>
          </label>
          <label>
            Conta
            <select value={account} onChange={(event) => setAccount(event.target.value)}>
              <option>Todas as contas</option>
              <option>Conta Nubank</option>
              <option>Conta Itaú</option>
              <option>Carteira</option>
            </select>
          </label>
          <span>Dados consolidados de {period}</span>
        </section>

        <section className={styles.kpis}>
          <article className={styles.income}>
            <span>↗</span>
            <div>
              <p>Total de receitas</p>
              <strong>{money(income)}</strong>
              <small>Entradas no período</small>
            </div>
          </article>
          <article className={styles.expense}>
            <span>↘</span>
            <div>
              <p>Total de despesas</p>
              <strong>{money(expense)}</strong>
              <small>Saídas no período</small>
            </div>
          </article>
          <article className={styles.balance}>
            <span>◈</span>
            <div>
              <p>Balanço do mês</p>
              <strong>{money(balance)}</strong>
              <small>Você fechou no positivo</small>
            </div>
          </article>
        </section>

        <section className={styles.charts}>
          <article className={styles.chartCard}>
            <header>
              <div>
                <h2>Despesas por categoria</h2>
                <p>Como seu dinheiro foi distribuído</p>
              </div>
            </header>
            <div className={styles.donutContent}>
              <Donut />
              <ul className={styles.legend}>
                {sorted.map(([name, value, color]) => (
                  <li key={name}>
                    <i style={{ background: color }} />
                    <span>
                      {name}
                      <small>{Math.round((value / total) * 100)}% do total</small>
                    </span>
                    <b>{money(value)}</b>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className={styles.chartCard}>
            <header>
              <div>
                <h2>Evolução no tempo</h2>
                <p>Receitas e despesas durante o mês</p>
              </div>
              <div className={styles.chartKey}><i /> Receitas <i /> Despesas</div>
            </header>
            <Evolution />
          </article>
        </section>

        <section className={styles.insights}>
          <header>
            <p>✦ RESUMO AUTOMÁTICO</p>
            <h2>Insights para você</h2>
          </header>
          <div>
            <article>
              <span>🏠</span>
              <p>Seu maior gasto neste mês foi com <b>Moradia (44%)</b>.</p>
            </article>
            <article>
              <span>🎉</span>
              <p>Você gastou <b>{money(150)} a mais em Lazer</b> comparado ao mês passado.</p>
            </article>
            <article>
              <span>🌱</span>
              <p>Parabéns! Suas receitas superaram as despesas em <b>{Math.round((balance / income) * 100)}%</b>.</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
