import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/receita.css';
import '../../styles/buttons.css';
import navbarStyles from '../components/navBar.module.css';

const initialContas = [
  {
    id: 1,
    nome: 'Conta Corrente Principal',
    tipo: 'Conta Corrente',
    instituicao: 'Nubank',
    saldo: 8420,
    icone: '🏦'
  },
  {
    id: 2,
    nome: 'Caixinha de Emergência',
    tipo: 'Poupança',
    instituicao: 'Itaú',
    saldo: 3200,
    icone: '💰'
  },
  {
    id: 3,
    nome: 'Dinheiro Físico',
    tipo: 'Carteira',
    instituicao: 'Físico',
    saldo: 650,
    icone: '💵'
  }
];

const instituicoes = ['Nubank', 'Itaú', 'Caixa', 'Inter', 'Bradesco', 'Físico'];
const dashboardNavItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Receita', path: '/receita' },
  { label: 'Despesa', path: '/despesa' },
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

function Conta() {
  const [contas, setContas] = useState(initialContas);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    tipo: 'Conta Corrente',
    instituicao: 'Nubank',
    saldo: ''
  });
  const [editingId, setEditingId] = useState(null);

  const saldoTotal = useMemo(() => {
    return contas.reduce((sum, item) => sum + item.saldo, 0);
  }, [contas]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.nome.trim() || !form.saldo) {
      return;
    }

    const payload = {
      id: editingId ?? Date.now(),
      nome: form.nome.trim(),
      tipo: form.tipo,
      instituicao: form.instituicao,
      saldo: Number(form.saldo),
      icone: form.instituicao === 'Nubank' ? '🏦' : form.instituicao === 'Itaú' ? '🏛️' : form.instituicao === 'Físico' ? '💵' : '💳'
    };

    if (editingId) {
      setContas((prev) => prev.map((item) => (item.id === editingId ? payload : item)));
    } else {
      setContas((prev) => [payload, ...prev]);
    }

    setShowModal(false);
    setEditingId(null);
    setForm({
      nome: '',
      tipo: 'Conta Corrente',
      instituicao: 'Nubank',
      saldo: ''
    });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      nome: '',
      tipo: 'Conta Corrente',
      instituicao: 'Nubank',
      saldo: ''
    });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      nome: item.nome,
      tipo: item.tipo,
      instituicao: item.instituicao,
      saldo: String(item.saldo)
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setContas((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="receita-page">
      <div className="receita-shell">
        <nav className={`${navbarStyles.navbar} navbar navbar-expand-lg navbar-dark sticky-top mb-4`}>
          <Link className={`navbar-brand ${navbarStyles.logo}`} to="/conta">
            🏦 Contas
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#contaNav"
            aria-controls="contaNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="contaNav">
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

        <header className="receita-header">
          <div>
            <p className="receita-kicker">Controle do patrimônio</p>
            <h1>Minhas Contas</h1>
          </div>

          <div className="receita-header-actions">
            <button className="headerButton" onClick={openCreate}>+ Nova Conta</button>
          </div>
        </header>

        <section className="receita-summary-card">
          <p className="receita-summary-label">Saldo Total</p>
          <p className="receita-summary-value">{formatCurrency(saldoTotal)}</p>
          <p className="receita-summary-foot">Somatório das contas cadastradas</p>
        </section>

        <section className="receita-list">
          {contas.map((item) => (
            <article key={item.id} className="receita-item">
              <div className="receita-item-main">
                <div className="receita-badge" aria-hidden="true">{item.icone}</div>
                <div className="receita-info">
                  <div className="receita-title-row">
                    <h3>{item.nome}</h3>
                    <span className="receita-value">{formatCurrency(item.saldo)}</span>
                  </div>
                  <div className="receita-meta">
                    {item.tipo} · {item.instituicao}
                  </div>
                </div>
              </div>

              <div className="receita-actions">
                <button className="receita-action-btn" onClick={() => openEdit(item)} aria-label={`Editar ${item.nome}`}>
                  ✏️
                </button>
                <button className="receita-action-btn" onClick={() => handleDelete(item.id)} aria-label={`Excluir ${item.nome}`}>
                  🗑️
                </button>
                <button className="receita-action-btn" aria-label={`Ver extrato de ${item.nome}`}>
                  📄
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>

      {showModal && (
        <div className="receita-modal-overlay" role="dialog" aria-modal="true">
          <div className="receita-modal">
            <div className="receita-modal-header">
              <h2>{editingId ? 'Editar Conta' : 'Nova Conta'}</h2>
              <button className="receita-action-btn" onClick={() => setShowModal(false)} aria-label="Fechar modal">✕</button>
            </div>

            <form className="receita-form" onSubmit={handleSubmit}>
              <div className="receita-field">
                <label htmlFor="nome">Nome</label>
                <input
                  id="nome"
                  type="text"
                  placeholder="Ex: Conta Corrente Principal"
                  value={form.nome}
                  onChange={(event) => setForm((prev) => ({ ...prev, nome: event.target.value }))}
                  required
                />
              </div>

              <div className="receita-field">
                <label htmlFor="tipo">Tipo</label>
                <input
                  id="tipo"
                  type="text"
                  placeholder="Ex: Conta Poupança"
                  value={form.tipo}
                  onChange={(event) => setForm((prev) => ({ ...prev, tipo: event.target.value }))}
                  required
                />
              </div>

              <div className="receita-field">
                <label htmlFor="instituicao">Instituição Financeira</label>
                <select id="instituicao" value={form.instituicao} onChange={(event) => setForm((prev) => ({ ...prev, instituicao: event.target.value }))}>
                  {instituicoes.map((instituicao) => (
                    <option key={instituicao} value={instituicao}>{instituicao}</option>
                  ))}
                </select>
              </div>

              <div className="receita-field">
                <label htmlFor="saldo">Saldo Atual (R$)</label>
                <input
                  id="saldo"
                  className="receita-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={form.saldo}
                  onChange={(event) => setForm((prev) => ({ ...prev, saldo: event.target.value }))}
                  required
                />
              </div>

              <div className="receita-form-actions">
                <button type="button" className="headerButton" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn_comecar">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Conta;
