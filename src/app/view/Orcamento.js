import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/buttons.css';
import navbarStyles from '../components/navBar.module.css';
import styles from './orcamento.module.css';

const icon = {
  MORADIA: '🏠',
  ALIMENTAÇÃO: '🛒',
  TRANSPORTE: '🚗',
  SAÚDE: '🩺',
  EDUCAÇÃO: '📚',
  LAZER: '🎉',
  INVESTIMENTOS: '📈',
  OUTROS: '✨'
};

const cats = Object.keys(icon);
const initial = [
  { id: 1, categoria: 'ALIMENTAÇÃO', limite: 1000, gasto: 680, mes: '07', ano: '2026' },
  { id: 2, categoria: 'TRANSPORTE', limite: 500, gasto: 420, mes: '07', ano: '2026' },
  { id: 3, categoria: 'LAZER', limite: 300, gasto: 370, mes: '07', ano: '2026' },
  { id: 4, categoria: 'SAÚDE', limite: 450, gasto: 0, mes: '07', ano: '2026' }
];

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

const money = (value) => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
}).format(value); 

const fresh = () => ({
  categoria: 'ALIMENTAÇÃO',
  limite: '',
  gasto: '',
  mes: '07',
  ano: '2026'
});

export default function Orcamento() {
  const [items, setItems] = useState(initial);
  const [period, setPeriod] = useState('07-2026');
  const [form, setForm] = useState(fresh);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState('');

  const [mes, ano] = period.split('-');
  const budgets = useMemo(
    () => items.filter((item) => item.mes === mes && item.ano === ano),
    [items, mes, ano]
  );
  const total = budgets.reduce((sum, item) => sum + item.limite, 0);
  const spent = budgets.reduce((sum, item) => sum + item.gasto, 0);
  const pct = total ? Math.round((spent / total) * 100) : 0;
  const exceeded = budgets.filter((item) => item.gasto >= item.limite);

  const open = () => {
    setEditId(null);
    setError('');
    setForm({ ...fresh(), mes, ano });
    setModal(true);
  };

  const edit = (item) => {
    setEditId(item.id);
    setError('');
    setForm({
      ...item,
      limite: String(item.limite),
      gasto: String(item.gasto)
    });
    setMenu(null);
    setModal(true);
  };

  const save = (event) => {
    event.preventDefault();

    if (items.some((item) => (
      item.id !== editId
      && item.categoria === form.categoria
      && item.mes === form.mes
      && item.ano === form.ano
    ))) {
      setError('Esta categoria já possui um orçamento neste mês.');
      return;
    }

    const next = {
      ...form,
      id: editId || Date.now(),
      limite: Number(form.limite),
      gasto: Number(form.gasto || 0)
    };

    setItems((all) => (
      editId
        ? all.map((item) => (item.id === editId ? next : item))
        : [...all, next]
    ));
    setModal(false);
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <nav className={`${navbarStyles.navbar} navbar navbar-expand-lg navbar-dark sticky-top mb-4`}>
          <Link className={`navbar-brand ${navbarStyles.logo}`} to="/orcamento">
            📊 Orçamentos
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#budgetNav">
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="budgetNav">
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
            <p>PLANEJE COM CLAREZA</p>
            <h1>Meus Orçamentos</h1>
            <small>Controle seus limites e mantenha os gastos em dia.</small>
          </div>
          <div>
            <select value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="07-2026">Julho 2026</option>
              <option value="06-2026">Junho 2026</option>
              <option value="05-2026">Maio 2026</option>
            </select>
            <button className="headerButton" onClick={open}>+ Novo Orçamento</button>
          </div>
        </header>

        {!!exceeded.length && (
          <aside className={styles.alert}>
            ⚠️
            <div>
              <strong>
                {exceeded.length === 1
                  ? `Atenção: você ultrapassou seu orçamento de ${exceeded[0].categoria.toLowerCase()}!`
                  : `Atenção: ${exceeded.length} categorias ultrapassaram o orçamento.`}
              </strong>
              <small>Revise seus gastos para retomar o controle.</small>
            </div>
          </aside>
        )}

        <section className={styles.health}>
          <div className={styles.donut} style={{ '--p': `${Math.min(pct, 100) * 3.6}deg` }}>
            <div>
              <b>{pct}%</b>
              <small>consumido</small>
            </div>
          </div>
          <div className={styles.healthText}>
            <p>SAÚDE DO MÊS</p>
            <h2>{money(spent)} <span>de {money(total)}</span></h2>
            <small>
              {total >= spent
                ? `Você ainda tem ${money(total - spent)} disponível.`
                : `Você ultrapassou o planejado em ${money(spent - total)}.`}
            </small>
            <i style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <div className={styles.stats}>
            <span><b>{budgets.length}</b> categorias</span>
            <span><b>{exceeded.length}</b> em alerta</span>
          </div>
        </section>

        <section className={styles.listHead}>
          <div>
            <h2>Limites por categoria</h2>
            <small>Acompanhe seus gastos em tempo real.</small>
          </div>
        </section>

        <section className={styles.list}>
          {budgets.length ? budgets.map((item) => {
            const progress = Math.round((item.gasto / item.limite) * 100);
            const state = progress >= 100 ? 'danger' : progress > 70 ? 'warning' : 'safe';
            const left = item.limite - item.gasto;

            return (
              <article className={styles.card} key={item.id}>
                <div className={styles.icon}>{icon[item.categoria]}</div>
                <div className={styles.main}>
                  <div className={styles.cardTop}>
                    <div>
                      <h3>{item.categoria}</h3>
                      <small>
                        {!item.gasto
                          ? 'Você ainda não gastou nada aqui. ✨'
                          : left >= 0 ? `Restam ${money(left)}` : `Você estourou ${money(-left)}`}
                      </small>
                    </div>
                    <div className={styles.menuWrap}>
                      <button onClick={() => setMenu(menu === item.id ? null : item.id)}>•••</button>
                      {menu === item.id && (
                        <div className={styles.menu}>
                          <button onClick={() => edit(item)}>Editar</button>
                          <button onClick={() => { setItems((all) => all.filter((budget) => budget.id !== item.id)); setMenu(null); }}>
                            Excluir orçamento
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.values}>
                    <b>{money(item.gasto)}</b>
                    <span>de {money(item.limite)}</span>
                    <strong className={styles[state]}>{progress}%</strong>
                  </div>
                  <div className={`${styles.track} ${styles[state]}`}>
                    <i style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                </div>
              </article>
            );
          }) : (
            <div className={styles.empty}>
              🎯
              <h3>Nenhum orçamento neste período</h3>
              <p>Defina um limite para começar a controlar seus gastos.</p>
              <button className="headerButton" onClick={open}>+ Definir limite</button>
            </div>
          )}
        </section>
      </div>

      {modal && (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <form className={styles.modal} onSubmit={save}>
            <header>
              <div>
                <p>PLANEJAMENTO MENSAL</p>
                <h2>{editId ? 'Editar limite' : 'Novo orçamento'}</h2>
              </div>
              <button type="button" onClick={() => setModal(false)}>×</button>
            </header>
            {error && <aside>{error}</aside>}
            <label>
              Categoria
              <select value={form.categoria} onChange={(event) => setForm({ ...form, categoria: event.target.value })}>
                {cats.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <div className={styles.formRow}>
              <label>
                Valor limite (R$)
                <input type="number" min="1" step="0.01" value={form.limite} onChange={(event) => setForm({ ...form, limite: event.target.value })} required />
              </label>
              <label>
                Valor gasto (R$)
                <input type="number" min="0" step="0.01" value={form.gasto} onChange={(event) => setForm({ ...form, gasto: event.target.value })} />
              </label>
            </div>
            <div className={styles.formRow}>
              <label>
                Mês
                <select value={form.mes} onChange={(event) => setForm({ ...form, mes: event.target.value })}>
                  {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((month) => <option key={month}>{month}</option>)}
                </select>
              </label>
              <label>
                Ano
                <input type="number" min="2020" value={form.ano} onChange={(event) => setForm({ ...form, ano: event.target.value })} />
              </label>
            </div>
            <footer>
              <button type="button" onClick={() => setModal(false)}>Cancelar</button>
              <button className="headerButton">Salvar orçamento</button>
            </footer>
          </form>
        </div>
      )}
    </main>
  );
}
