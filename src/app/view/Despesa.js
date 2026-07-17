import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/receita.css';
import '../../styles/buttons.css';
import navbarStyles from '../components/navBar.module.css';

const initialDespesas = [
  {
    id: 1,
    descricao: 'Mercado da semana',
    data: '2026-07-12',
    categoria: 'ALIMENTAÇÃO',
    origem: 'Itaú',
    valor: 150,
    icone: '🛒',
    paga: true
  },
  {
    id: 2,
    descricao: 'Combustível',
    data: '2026-07-10',
    
    categoria: 'TRANSPORTE',
    origem: 'Cartão Nubank',
    valor: 85,
    icone: '⛽',
    paga: false
  },
  {
    id: 3,
    descricao: 'Consulta médica',
    data: '2026-07-04',
    categoria: 'SAÚDE',
    origem: 'Caixa',
    valor: 240,
    icone: '🩺',
    paga: true
  }
];

const categorias = ['ALIMENTAÇÃO', 'TRANSPORTE', 'SAÚDE', 'LAZER', 'EDUCAÇÃO', 'MORADIA', 'INVESTIMENTOS', 'OUTROS'];
const origens = ['Itaú', 'Nubank', 'Caixa', 'Inter', 'Cartão Nubank', 'Cartão Itaú'];
const dashboardNavItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Receita', path: '/receita' },
  { label: 'Conta', path: '/conta' },
  { label: 'Cartão', path: '/cartao' },
  { label: 'Objetivo', path: '/objetivo' },
  { label: 'Orçamento', path: '/orcamento' },
  { label: 'Relatório', path: '/relatorio' }
];

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
}

function Despesa() {
  const [despesas, setDespesas] = useState(initialDespesas);
  const [search, setSearch] = useState('');
  const [mesSelecionado, setMesSelecionado] = useState('2026-07');
  const [showModal, setShowModal] = useState(false);
  const [showAlert] = useState(true);
  const [form, setForm] = useState({
    descricao: '',
    data: new Date().toISOString().slice(0, 10),
    categoria: 'ALIMENTAÇÃO',
    origem: 'Itaú',
    valor: ''
  });
  const [editingId, setEditingId] = useState(null);

  const despesasFiltradas = useMemo(() => {
    return despesas.filter((item) => {
      const matchesMonth = item.data.startsWith(mesSelecionado);
      const matchesSearch = item.descricao.toLowerCase().includes(search.toLowerCase());
      return matchesMonth && matchesSearch;
    });
  }, [despesas, search, mesSelecionado]);

  const totalGasto = useMemo(() => {
    return despesasFiltradas.reduce((sum, item) => sum + item.valor, 0);
  }, [despesasFiltradas]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.descricao.trim() || !form.valor) {
      return;
    }

    const payload = {
      id: editingId ?? Date.now(),
      descricao: form.descricao.trim(),
      data: form.data,
      categoria: form.categoria,
      origem: form.origem,
      valor: Number(form.valor),
      icone: form.categoria === 'TRANSPORTE' ? '🚗' : form.categoria === 'SAÚDE' ? '🩺' : form.categoria === 'LAZER' ? '🎉' : form.categoria === 'EDUCAÇÃO' ? '📚' : form.categoria === 'MORADIA' ? '🏠' : form.categoria === 'INVESTIMENTOS' ? '📈' : '🛒',
      paga: true
    };

    if (editingId) {
      setDespesas((prev) => prev.map((item) => (item.id === editingId ? payload : item)));
    } else {
      setDespesas((prev) => [payload, ...prev]);
    }

    setShowModal(false);
    setEditingId(null);
    setForm({
      descricao: '',
      data: new Date().toISOString().slice(0, 10),
      categoria: 'ALIMENTAÇÃO',
      origem: 'Itaú',
      valor: ''
    });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      descricao: '',
      data: new Date().toISOString().slice(0, 10),
      categoria: 'ALIMENTAÇÃO',
      origem: 'Itaú',
      valor: ''
    });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      descricao: item.descricao,
      data: item.data,
      categoria: item.categoria,
      origem: item.origem,
      valor: String(item.valor)
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setDespesas((prev) => prev.filter((item) => item.id !== id));
  };

  

  return (
    <div className="receita-page">
      <div className="receita-shell">
        <nav className={`${navbarStyles.navbar} navbar navbar-expand-lg navbar-dark sticky-top mb-4`}>
          <Link className={`navbar-brand ${navbarStyles.logo}`} to="/despesa">
            💸 Despesas
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#despesaNav"
            aria-controls="despesaNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="despesaNav">
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

        {showAlert && (
          <div className="receita-alert">
            Atenção: Você atingiu 100% do orçamento desta categoria.
          </div>
        )}

        <header className="receita-header">
          <div>
            <p className="receita-kicker">Saídas de dinheiro</p>
            <h1>Minhas Despesas</h1>
          </div>

          <div className="receita-header-actions">
            <select className="receita-select" value={mesSelecionado} onChange={(event) => setMesSelecionado(event.target.value)}>
              <option value="2026-07">Julho 2026</option>
              <option value="2026-06">Junho 2026</option>
              <option value="2026-05">Maio 2026</option>
            </select>
            <button className="headerButton" onClick={openCreate}>+ Nova Despesa</button>
          </div>
        </header>

        <section className="receita-summary-card receita-summary-card-danger">
          <p className="receita-summary-label">Total gasto</p>
          <p className="receita-summary-value">{formatCurrency(totalGasto)}</p>
          <p className="receita-summary-foot">No período selecionado · {despesasFiltradas.length} despesas</p>
        </section>

        <section className="receita-controls">
          <input
            className="receita-search"
            type="text"
            placeholder="Buscar por descrição..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </section>

        <section className="receita-list">
          {despesasFiltradas.length === 0 ? (
            <div className="receita-empty">Nenhuma despesa encontrada para este mês.</div>
          ) : (
            despesasFiltradas.map((item) => (
              <article key={item.id} className="receita-item">
                <div className="receita-item-main">
                  <div className="receita-badge" aria-hidden="true">{item.icone}</div>
                  <div className="receita-info">
                    <div className="receita-title-row">
                      <h3>{item.descricao}</h3>
                      <span className="receita-value receita-value-danger">{formatCurrency(item.valor)}</span>
                    </div>
                    <div className="receita-meta">
                      {formatDate(item.data)} · {item.categoria} · {item.origem}
                    </div>
                  </div>
                </div>

                <div className="receita-actions">
                 
                  <button className="receita-action-btn" onClick={() => openEdit(item)} aria-label={`Editar ${item.descricao}`}>
                    ✏️
                  </button>
                  <button className="receita-action-btn" onClick={() => handleDelete(item.id)} aria-label={`Excluir ${item.descricao}`}>
                    🗑️
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </div>

      {showModal && (
        <div className="receita-modal-overlay" role="dialog" aria-modal="true">
          <div className="receita-modal">
            <div className="receita-modal-header">
              <h2>{editingId ? 'Editar Despesa' : 'Nova Despesa'}</h2>
              <button className="receita-action-btn" onClick={() => setShowModal(false)} aria-label="Fechar modal">✕</button>
            </div>

            <form className="receita-form" onSubmit={handleSubmit}>
              <div className="receita-field">
                <label htmlFor="valor">Valor (R$)</label>
                <input
                  id="valor"
                  className="receita-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={form.valor}
                  onChange={(event) => setForm((prev) => ({ ...prev, valor: event.target.value }))}
                  required
                />
              </div>

              <div className="receita-field">
                <label htmlFor="descricao">Descrição</label>
                <input
                  id="descricao"
                  type="text"
                  placeholder="Ex: Mercado da semana"
                  value={form.descricao}
                  onChange={(event) => setForm((prev) => ({ ...prev, descricao: event.target.value }))}
                  required
                />
              </div>

              <div className="receita-field">
                <label htmlFor="data">Data</label>
                <input
                  id="data"
                  type="date"
                  value={form.data}
                  onChange={(event) => setForm((prev) => ({ ...prev, data: event.target.value }))}
                  required
                />
              </div>

              <div className="receita-field">
                <label htmlFor="categoria">Categoria</label>
                <select id="categoria" value={form.categoria} onChange={(event) => setForm((prev) => ({ ...prev, categoria: event.target.value }))}>
                  {categorias.map((categoria) => (
                    <option key={categoria} value={categoria}>{categoria}</option>
                  ))}
                </select>
              </div>

              <div className="receita-field">
                <label htmlFor="origem">Origem do Pagamento</label>
                <select id="origem" value={form.origem} onChange={(event) => setForm((prev) => ({ ...prev, origem: event.target.value }))}>
                  {origens.map((origem) => (
                    <option key={origem} value={origem}>{origem}</option>
                  ))}
                </select>
              </div>

              <div className="receita-form-actions">
                <button type="button" className="headerButton" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="headerButton">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 

export default Despesa;
