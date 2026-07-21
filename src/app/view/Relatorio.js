import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/buttons.css';
import navbarStyles from '../components/navBar.module.css';
import styles from './relatorio.module.css';

const API_RECEITA_URL = 'http://localhost:8080/receitas';
const API_DESPESA_URL = 'http://localhost:8080/despesas';
const API_CONTA_URL = 'http://localhost:8080/contas';

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

const categoryColors = {
  MORADIA: '#8b5cf6',
  ALIMENTACAO: '#f59e0b',
  ALIMENTAÇÃO: '#f59e0b',
  TRANSPORTE: '#06b6d4',
  LAZER: '#ef4444',
  SAUDE: '#22c55e',
  SAÚDE: '#22c55e',
  EDUCACAO: '#3b82f6',
  EDUCAÇÃO: '#3b82f6',
  INVESTIMENTOS: '#10b981',
  OUTROS: '#6b7280'
};

const money = (value) => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
}).format(value || 0);

// Mapeia dinamicamente a propriedade da conta vinda do Java
const getContaNome = (c) => 
  c?.nome || 
  c?.nomeConta || 
  c?.banco || 
  c?.descricao || 
  c?.instituicao || 
  c?.tipoConta || 
  `Conta #${c?.id || c?.idConta}`;

function Donut({ categories }) {
  const total = categories.reduce((sum, [, value]) => sum + value, 0);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (!total) {
    return (
      <div className={styles.donutWrap}>
        <svg viewBox="0 0 140 140" aria-label="Sem despesas">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="19" />
          <text x="70" y="74" textAnchor="middle" className={styles.donutLabel}>R$ 0</text>
        </svg>
      </div>
    );
  }

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

function Evolution({ days }) {
  const maxCalculated = Math.max(...days.flatMap(([, inc, exp]) => [inc, exp]), 100);
  const max = maxCalculated * 1.1;
  const width = 560;
  const height = 185;

  const points = days
    .map(([, income], index) => {
      const x = 45 + index * (495 / Math.max(days.length - 1, 1));
      const y = 160 - (income / max) * 125;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg className={styles.evolution} viewBox={`0 0 ${width} ${height}`} aria-label="Evolução de receitas e despesas">
      {[35, 80, 125, 160].map((y) => (
        <line key={y} x1="38" y1={y} x2="540" y2={y} className={styles.gridLine} />
      ))}
      {days.map(([day, , expense], index) => {
        const x = 45 + index * (495 / Math.max(days.length - 1, 1));
        const barHeight = (expense / max) * 125;

        return (
          <g key={day + index}>
            <rect x={x - 8} y={160 - barHeight} width="16" height={barHeight} rx="4" className={styles.expenseBar} />
            <text x={x} y="180" textAnchor="middle" className={styles.axisText}>{day}</text>
          </g>
        );
      })}
      <polyline points={points} fill="none" className={styles.incomeLine} />
      {days.map(([, income], index) => {
        const x = 45 + index * (495 / Math.max(days.length - 1, 1));
        const y = 160 - (income / max) * 125;
        return <circle key={index} cx={x} cy={y} r="4" className={styles.incomePoint} />;
      })}
    </svg>
  );
}

export default function Relatorio() {
  const [period, setPeriod] = useState('Julho 2026');
  const [account, setAccount] = useState('Todas as contas');
  
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [contas, setContas] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const [resReceitas, resDespesas, resContas] = await Promise.allSettled([
        axios.get(API_RECEITA_URL),
        axios.get(API_DESPESA_URL),
        axios.get(API_CONTA_URL)
      ]);

      if (resReceitas.status === 'fulfilled') setReceitas(resReceitas.value.data || []);
      if (resDespesas.status === 'fulfilled') setDespesas(resDespesas.value.data || []);
      if (resContas.status === 'fulfilled') setContas(resContas.value.data || []);
    } catch (err) {
      console.error('Erro ao buscar dados do relatório:', err);
    }
  };

  const { categories, days, income, expense, balance } = useMemo(() => {
    const selectedMonth = '07'; 
    const selectedYear = '2026';

    const filteredReceitas = receitas.filter((r) => {
      const data = r.data ? new Date(r.data) : null;
      const matchMonth = data ? String(data.getMonth() + 1).padStart(2, '0') === selectedMonth : true;
      const matchAccount = account === 'Todas as contas' || String(r.contaId || r.conta?.id || r.idConta) === account;
      return matchMonth && matchAccount;
    });

    const filteredDespesas = despesas.filter((d) => {
      const data = d.data ? new Date(d.data) : null;
      const matchMonth = data ? String(data.getMonth() + 1).padStart(2, '0') === selectedMonth : true;
      const matchAccount = account === 'Todas as contas' || String(d.contaId || d.conta?.id || d.idConta) === account;
      return matchMonth && matchAccount;
    });

    const totalIncome = filteredReceitas.reduce((sum, item) => sum + Number(item.valor || 0), 0);
    const totalExpense = filteredDespesas.reduce((sum, item) => sum + Number(item.valor || 0), 0);

    const categoryMap = {};
    filteredDespesas.forEach((item) => {
      const cat = (item.categoria || 'OUTROS').toUpperCase();
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(item.valor || 0);
    });

    const parsedCategories = Object.entries(categoryMap).map(([cat, val]) => [
      cat.charAt(0) + cat.slice(1).toLowerCase(),
      val,
      categoryColors[cat] || '#8b5cf6'
    ]);

    const daysMap = {
      '01': { inc: 0, exp: 0 },
      '05': { inc: 0, exp: 0 },
      '10': { inc: 0, exp: 0 },
      '15': { inc: 0, exp: 0 },
      '20': { inc: 0, exp: 0 },
      '25': { inc: 0, exp: 0 },
      '30': { inc: 0, exp: 0 }
    };

    filteredReceitas.forEach((r) => {
      const day = r.data ? String(new Date(r.data).getDate()).padStart(2, '0') : '15';
      const closestDay = Object.keys(daysMap).reduce((prev, curr) => 
        Math.abs(Number(curr) - Number(day)) < Math.abs(Number(prev) - Number(day)) ? curr : prev
      );
      daysMap[closestDay].inc += Number(r.valor || 0);
    });

    filteredDespesas.forEach((d) => {
      const day = d.data ? String(new Date(d.data).getDate()).padStart(2, '0') : '15';
      const closestDay = Object.keys(daysMap).reduce((prev, curr) => 
        Math.abs(Number(curr) - Number(day)) < Math.abs(Number(prev) - Number(day)) ? curr : prev
      );
      daysMap[closestDay].exp += Number(d.valor || 0);
    });

    const parsedDays = Object.entries(daysMap).map(([day, val]) => [day, val.inc, val.exp]);

    return {
      categories: parsedCategories.length ? parsedCategories : [['Sem despesas', 0, '#e5e7eb']],
      days: parsedDays,
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense
    };
  }, [receitas, despesas, account]);

  const totalCategoryExpense = categories.reduce((sum, [, value]) => sum + value, 0);
  const sortedCategories = useMemo(
    () => [...categories].sort((first, second) => second[1] - first[1]),
    [categories]
  );

  const topCategory = sortedCategories[0];
  const topPercentage = totalCategoryExpense ? Math.round((topCategory[1] / totalCategoryExpense) * 100) : 0;

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
            </select>
          </label>
          <label>
            Conta
            <select value={account} onChange={(event) => setAccount(event.target.value)}>
              <option value="Todas as contas">Todas as contas</option>
              {contas.map((c) => {
                const contaId = c.id ?? c.idConta;
                return (
                  <option key={contaId} value={String(contaId)}>
                    {getContaNome(c)}
                  </option>
                );
              })}
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
              <small>{balance >= 0 ? 'Você fechou no positivo' : 'Atenção aos gastos do mês'}</small>
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
              <Donut categories={categories} />
              <ul className={styles.legend}>
                {sortedCategories.map(([name, value, color]) => (
                  <li key={name}>
                    <i style={{ background: color }} />
                    <span>
                      {name}
                      <small>{totalCategoryExpense ? Math.round((value / totalCategoryExpense) * 100) : 0}% do total</small>
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
            <Evolution days={days} />
          </article>
        </section>

        <section className={styles.insights}>
          <header>
            <p>RESUMO AUTOMÁTICO</p>
            <h2>Insights para você</h2>
          </header>
          <div>
            <article>
              <span>🏠</span>
              <p>
                {topCategory && topCategory[1] > 0
                  ? <>Seu maior gasto neste mês foi com <b>{topCategory[0]} ({topPercentage}%)</b>.</>
                  : <>Nenhuma despesa registrada para análise neste período.</>}
              </p>
            </article>
            <article>
              <span>🎉</span>
              <p>Você manteve um total de <b>{money(expense)} em despesas</b> durante este período.</p>
            </article>
            <article>
              <span>🌱</span>
              <p>
                {income > 0 
                  ? balance >= 0
                    ? <>Parabéns! Suas receitas superaram as despesas em <b>{Math.round((balance / income) * 100)}%</b>.</>
                    : <>Suas despesas superaram suas receitas neste mês.</>
                  : <>Insira receitas para calcular seu saldo positivo.</>}
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}