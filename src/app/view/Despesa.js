import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/receita.css';
import '../../styles/buttons.css';
import navbarStyles from '../components/navBar.module.css';

const categorias = ['ALIMENTAÇÃO', 'TRANSPORTE', 'SAUDE', 'LAZER', 'EDUCACAO', 'MORADIA', 'INVESTIMENTOS', 'OUTROS'];

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
  }).format(value || 0);
}

const formatDate = (dateProp) => {
  if (!dateProp) return "--/--/----";
  if (Array.isArray(dateProp)) {
    const [year, month, day] = dateProp;
    const dia = String(day).padStart(2, '0');
    const mes = String(month).padStart(2, '0');
    return `${dia}/${mes}/${year}`;
  }
  const d = new Date(dateProp);
  if (isNaN(d.getTime())) {
    const partes = String(dateProp).split('T')[0].split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    return "--/--/----";
  }
  return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

// Ícones dinâmicos por categoria
const getCategoryIcon = (categoria) => {
  switch (categoria?.toUpperCase()) {
    case 'TRANSPORTE': return '🚗';
    case 'SAUDE': return '🩺';
    case 'LAZER': return '🎉';
    case 'EDUCACAO':
    case 'EDUCACAO': return '📚';
    case 'MORADIA': return '🏠';
    case 'INVESTIMENTOS': return '📈';
    case 'ALIMENTACAO': return '🛒';
    default: return '💸';
  }
};

function Despesa() {
  const [despesas, setDespesas] = useState([]);
  const [contas, setContas] = useState([]);
  const [cartoes, setCartoes] = useState([]); // Hook movido para dentro do componente corretamente

  const [search, setSearch] = useState('');
  const [mesSelecionado, setMesSelecionado] = useState('2026-07');
  const [showModal, setShowModal] = useState(false);
  const [showAlert] = useState(true);

  const [form, setForm] = useState({
    descricao: '',
    data: new Date().toISOString().slice(0, 10),
    formaPagamento: 'PIX',
    categoria: 'ALIMENTAÇÃO',
    origem: '',
    valor: ''
  });

  const [editingId, setEditingId] = useState(null);

  // 1. BUSCAR DADOS DO BACK-END
  const fetchDespesas = async () => {
    try {
      const response = await axios.get('http://localhost:8080/despesas');
      setDespesas(response.data);
    } catch (error) {
      console.error("Erro ao buscar despesas do back-end", error);
    }
  };

  const fetchContas = async () => {
    try {
      const response = await axios.get('http://localhost:8080/contas');
      setContas(response.data);
    } catch (error) {
      console.error("Erro ao buscar contas do back-end", error);
    }
  };

  const fetchCartoes = async () => {
    try {
      const response = await axios.get('http://localhost:8080/cartoes');
      setCartoes(response.data);
    } catch (error) {
      console.error("Erro ao buscar cartões do back-end", error);
    }
  };

  useEffect(() => {
    fetchDespesas();
    fetchContas();
    fetchCartoes(); // Busca os cartões ao carregar a página
  }, []);



  const despesasFiltradas = useMemo(() => {
    return despesas.filter((item) => {
      if (!item.data) return false;

      let ano = '';
      let mes = '';

      if (Array.isArray(item.data)) {
        // Se o Java mandar como Array: [2026, 7, 20]
        ano = item.data[0];
        mes = String(item.data[1]).padStart(2, '0');
      } else {
        const dateStr = String(item.data);

        if (dateStr.includes('/')) {
          // Se o Java mandar formato BR: "20/07/2026"
          const partes = dateStr.split(' ')[0].split('/');
          if (partes.length >= 3) {
            ano = partes[2];
            mes = partes[1];
          }
        } else if (dateStr.includes('-')) {
          // Se o Java mandar ISO: "2026-07-20T00:00:00"
          const partes = dateStr.split('T')[0].split('-');
          if (partes.length >= 3) {
            ano = partes[0];
            mes = partes[1];
          }
        }
      }

      const itemMonth = `${ano}-${mes}`;
      const matchesMonth = itemMonth === mesSelecionado;
      const matchesSearch = item.descricao?.toLowerCase().includes(search.toLowerCase());

      return matchesMonth && matchesSearch;
    });
  }, [despesas, search, mesSelecionado]);

  const totalGasto = useMemo(() => {
    return despesasFiltradas.reduce((sum, item) => sum + Number(item.valor || 0), 0);
  }, [despesasFiltradas]);

  // 2. CADASTRAR OU ATUALIZAR DESPESA
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.descricao.trim() || !form.valor) return;

    // Tratamento Inteligente da Forma de Pagamento
    let formaPagamentoFinal = form.formaPagamento;
    let cartaoIdFinal = null;

    if (form.formaPagamento.startsWith('CARTAO_')) {
      formaPagamentoFinal = 'CARTAO_CREDITO'; // Nome que o seu backend espera
      cartaoIdFinal = Number(form.formaPagamento.replace('CARTAO_', ''));
    }

    const payload = {
      descricao: form.descricao.trim(),
      data: `${form.data}T00:00:00`,
      formaPagamento: formaPagamentoFinal,
      categoria: form.categoria,
      contaId: Number(form.origem),
      valor: Number(form.valor),
      cartaoId: cartaoIdFinal,
      efetivada: true
    };

  

    try {
      if (editingId) {
        await axios.put(`http://localhost:8080/despesas/${editingId}`, payload);
      } else {
        await axios.post('http://localhost:8080/despesas', payload);
      }

      fetchDespesas();
      setShowModal(false);
      setEditingId(null);
      setForm({
        descricao: '',
        data: new Date().toISOString().slice(0, 10),
        formaPagamento: 'PIX',
        categoria: 'ALIMENTACAO',
        origem: 'Itau',
        valor: ''
      });
    } catch (error) {
      console.error("Erro ao salvar despesa", error);
      alert("Houve um erro ao salvar a despesa. Verifique o console.");
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      descricao: '',
      data: new Date().toISOString().slice(0, 10),
      formaPagamento: 'PIX',
      categoria: 'ALIMENTAÇÃO',
      origem: '', // <-- DEIXE VAZIO AQUI
      valor: ''
    });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);

    let formattedDate = new Date().toISOString().slice(0, 10);
    if (Array.isArray(item.data)) {
      formattedDate = `${item.data[0]}-${String(item.data[1]).padStart(2, '0')}-${String(item.data[2]).padStart(2, '0')}`;
    } else if (item.data) {
      formattedDate = String(item.data).split('T')[0];
    }

    setForm({
      descricao: item.descricao,
      data: formattedDate,
      formaPagamento: item.formaPagamento || 'PIX',
      categoria: item.categoria,
      origem: item.origem,
      valor: String(item.valor)
    });
    setShowModal(true);
  };

  // 3. EXCLUIR DESPESA
  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente excluir esta despesa?")) {
      try {
        await axios.delete(`http://localhost:8080/despesas/${id}`);
        fetchDespesas();
      } catch (error) {
        console.error("Erro ao excluir", error);
      }
    }
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
                  <div className="receita-badge" aria-hidden="true">{getCategoryIcon(item.categoria)}</div>
                  <div className="receita-info">
                    <div className="receita-title-row">
                      <h3>{item.descricao}</h3>
                      <span className="receita-value receita-value-danger">{formatCurrency(item.valor)}</span>
                    </div>
                    <div className="receita-meta">
                      {formatDate(item.data)} · {item.categoria} · {item.conta ? `Conta: ${item.conta.nomeConta}` : item.cartao ? `Cartão: ${item.cartao.nome}` : 'Sem origem'}
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

              {/* SELECT MISTO DE FORMAS DE PAGAMENTO */}
              <div className="receita-field">
                <label htmlFor="formaPagamento">Forma de pagamento</label>
                <select
                  id="formaPagamento"
                  value={form.formaPagamento}
                  onChange={(event) => setForm((prev) => ({ ...prev, formaPagamento: event.target.value }))}
                >
                  <option value="PIX">PIX</option>
                  <option value="DINHEIRO">DINHEIRO</option>
                  <option value="BOLETO">BOLETO</option>

                  {cartoes.map((cartao) => (
                    <option key={cartao.id} value={`CARTAO_${cartao.id}`}>
                      Cartão: {cartao.nome}
                    </option>
                  ))}
                </select>
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
                <label htmlFor="origem">Origem do Pagamento (Conta)</label>
                <select
                  id="origem"
                  value={form.origem}
                  onChange={(event) => setForm((prev) => ({ ...prev, origem: event.target.value }))}
                >
                  <option value="" disabled>Selecione uma conta...</option>

                  {contas.map((conta) => (
                    <option key={conta.id} value={conta.id}>
                      {conta.nomeConta}
                    </option>
                  ))}

                </select>
              </div>

              <div className="receita-form-actions">
                <button type="button" className="headerButton" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="headerButton">Salvar</button>
              </div>
            </form>
          </div>
        </div >
      )
      }
    </div >
  );
}

export default Despesa;