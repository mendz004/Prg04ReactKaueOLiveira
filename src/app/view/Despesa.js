import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/receita.css';
import '../../styles/buttons.css';
import navbarStyles from '../components/navBar.module.css';

const categorias = ['ALIMENTACAO', 'TRANSPORTE', 'SAUDE', 'LAZER', 'EDUCACAO', 'MORADIA', 'INVESTIMENTOS', 'OUTROS'];

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
    case 'EDUCACAO': return '📚';
    case 'MORADIA': return '🏠';
    case 'INVESTIMENTOS': return '📈';
    case 'ALIMENTACAO':
    case 'ALIMENTAÇÃO': return '🛒';
    default: return '💸';
  }
};

function Despesa() {
  const [despesas, setDespesas] = useState([]);
  const [contas, setContas] = useState([]);
  const [cartoes, setCartoes] = useState([]);

  const [search, setSearch] = useState('');
  const [mesSelecionado, setMesSelecionado] = useState('2026-07');
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    descricao: '',
    data: new Date().toISOString().slice(0, 10),
    formaPagamento: 'PIX',
    categoria: 'ALIMENTAÇÃO',
    origem: '',
    valor: ''
  });

  const [editingId, setEditingId] = useState(null);

  // 1. BUSCAR DADOS DO BACK-END (Com Parse Forçado)
  const fetchDespesas = async () => {
    const usuarioStorage = localStorage.getItem('usuarioAppFinanceiro');
    if (!usuarioStorage) return;
    const usuarioLogado = JSON.parse(usuarioStorage);
    const config = { headers: { Authorization: `Bearer ${usuarioLogado.token}` } };

    try {
      const response = await axios.get('http://localhost:8080/despesas', config);

      let dados = response.data;

      // CONVERSÃO MÁGICA: Se o Spring Boot enviou como "Texto", transformamos em Array
      if (typeof dados === 'string') {
        try {
          dados = JSON.parse(dados);
        } catch (e) {
          console.error("Erro ao tentar converter o texto do backend para JSON:", e);
          dados = [];
        }
      }

      console.log(">>> Dados processados como Array:", dados);

      if (Array.isArray(dados)) {
        setDespesas(dados);
      } else if (dados && Array.isArray(dados.content)) {
        setDespesas(dados.content);
      } else {
        setDespesas([]);
      }
    } catch (error) {
      console.error("Erro ao buscar despesas do back-end", error);
      setDespesas([]);
    }
  };

  const fetchContas = async () => {
    const usuarioStorage = localStorage.getItem('usuarioAppFinanceiro');
    if (!usuarioStorage) return;
    const usuarioLogado = JSON.parse(usuarioStorage);
    const config = { headers: { Authorization: `Bearer ${usuarioLogado.token}` } };
    try {
      const response = await axios.get('http://localhost:8080/contas', config);
      const data = Array.isArray(response.data) ? response.data : (response.data?.content || []);
      setContas(data);
    } catch (error) {
      console.error("Erro ao buscar contas do back-end", error);
      setContas([]);
    }
  };

  const fetchCartoes = async () => {
    const usuarioStorage = localStorage.getItem('usuarioAppFinanceiro');
    if (!usuarioStorage) return;
    const usuarioLogado = JSON.parse(usuarioStorage);
    const config = { headers: { Authorization: `Bearer ${usuarioLogado.token}` } };
    try {
      const response = await axios.get('http://localhost:8080/cartoes', config);
      const data = Array.isArray(response.data) ? response.data : (response.data?.content || []);
      setCartoes(data);
    } catch (error) {
      console.error("Erro ao buscar cartões do back-end", error);
      setCartoes([]);
    }
  };

  useEffect(() => {
    fetchDespesas();
    fetchContas();
    fetchCartoes();
  }, []);

  const despesasFiltradas = useMemo(() => {
    if (!Array.isArray(despesas)) return [];

    return despesas.filter((item) => {
      if (!item) return false;

      // Se selecionou "TODOS", ignora a checagem de mês/ano
      let matchesMonth = true;

      if (mesSelecionado !== 'TODOS' && item.data) {
        let ano = '';
        let mes = '';

        if (Array.isArray(item.data)) {
          ano = item.data[0];
          mes = String(item.data[1]).padStart(2, '0');
        } else {
          const dateStr = String(item.data);
          if (dateStr.includes('/')) {
            const partes = dateStr.split(' ')[0].split('/');
            if (partes.length >= 3) {
              ano = partes[2];
              mes = partes[1];
            }
          } else if (dateStr.includes('-')) {
            const partes = dateStr.split('T')[0].split('-');
            if (partes.length >= 3) {
              ano = partes[0];
              mes = partes[1];
            }
          }
        }

        const itemMonth = `${ano}-${mes}`;
        matchesMonth = (itemMonth === mesSelecionado);
      }

      const matchesSearch = (item.descricao || '').toLowerCase().includes(search.toLowerCase());

      return matchesMonth && matchesSearch;
    });
  }, [despesas, search, mesSelecionado]);

  const totalGasto = useMemo(() => {
    if (!Array.isArray(despesasFiltradas)) return 0;
    return despesasFiltradas.reduce((sum, item) => sum + Number(item.valor || 0), 0);
  }, [despesasFiltradas]);

  const isCartao = form.formaPagamento === 'CARTAO_CREDITO';
  const isDinheiro = form.formaPagamento === 'DINHEIRO'; // Variável para controlar se é dinheiro

  // 2. CADASTRAR OU ATUALIZAR DESPESA
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validação ajustada: origem só é obrigatória se não for Dinheiro
    if (!form.descricao.trim() || !form.valor || (!isDinheiro && !form.origem)) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const payload = {
      descricao: form.descricao.trim(),
      data: `${form.data}T00:00:00`,
      formaPagamento: form.formaPagamento,
      categoria: form.categoria,
      valor: Number(form.valor),
      // Se for dinheiro ou cartão, contaId vai nulo. Se for PIX/BOLETO, envia a origem
      contaId: (!isCartao && !isDinheiro) ? Number(form.origem) : null,
      cartaoId: isCartao ? Number(form.origem) : null,
      efetivada: true
    };

    const usuarioStorage = localStorage.getItem('usuarioAppFinanceiro');
    if (!usuarioStorage) {
      alert("Sessão expirada. Faça login novamente.");
      return;
    }
    const usuarioLogado = JSON.parse(usuarioStorage);
    const config = { headers: { Authorization: `Bearer ${usuarioLogado.token}` } };

    try {
      if (editingId) {
        await axios.put(`http://localhost:8080/despesas/${editingId}`, payload, config);
      } else {
        await axios.post('http://localhost:8080/despesas', payload, config);
      }

      fetchDespesas();
      setShowModal(false);
      setEditingId(null);
      setForm({
        descricao: '',
        data: new Date().toISOString().slice(0, 10),
        formaPagamento: 'PIX',
        categoria: 'ALIMENTAÇÃO',
        origem: '',
        valor: ''
      });
    } catch (error) {
      console.error("Erro ao salvar despesa", error);
      alert("Houve um erro ao salvar a despesa. Verifique se o seu token não expirou.");
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      descricao: '',
      data: new Date().toISOString().slice(0, 10),
      formaPagamento: 'PIX',
      categoria: 'ALIMENTAÇÃO',
      origem: '',
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

    const ehDespesaCartao = item.formaPagamento === 'CARTAO_CREDITO' || item.cartao != null;

    setForm({
      descricao: item.descricao || '',
      data: formattedDate,
      formaPagamento: ehDespesaCartao ? 'CARTAO_CREDITO' : (item.formaPagamento || 'PIX'),
      categoria: item.categoria || 'ALIMENTAÇÃO',
      origem: ehDespesaCartao ? (item.cartao?.id || item.cartaoId || '') : (item.conta?.id || item.contaId || ''),
      valor: String(item.valor || '')
    });
    setShowModal(true);
  };

  // 3. EXCLUIR DESPESA
  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente excluir esta despesa?")) {
      const usuarioStorage = localStorage.getItem('usuarioAppFinanceiro');
      if (!usuarioStorage) return;
      const usuarioLogado = JSON.parse(usuarioStorage);
      const config = { headers: { Authorization: `Bearer ${usuarioLogado.token}` } };
      try {
        await axios.delete(`http://localhost:8080/despesas/${id}`, config);
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
              <option value="TODOS">Todos os meses</option>
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

              <div className="receita-field">
                <label htmlFor="formaPagamento">Forma de pagamento</label>
                <select
                  id="formaPagamento"
                  value={form.formaPagamento}
                  onChange={(event) => setForm((prev) => ({
                    ...prev,
                    formaPagamento: event.target.value,
                    origem: ''
                  }))}
                >
                  <option value="PIX">PIX</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="BOLETO">Boleto</option>
                  <option value="CARTAO_CREDITO">Cartão de Crédito</option>
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

              {/* Renderização condicional: o campo desaparece se a forma de pagamento for DINHEIRO */}
              {!isDinheiro && (
                <div className="receita-field">
                  <label htmlFor="origem">
                    {isCartao ? 'Selecione o Cartão' : 'Origem do Pagamento (Conta)'}
                  </label>
                  <select
                    id="origem"
                    value={form.origem}
                    onChange={(event) => setForm((prev) => ({ ...prev, origem: event.target.value }))}
                  >
                    <option value="" disabled>
                      {isCartao ? 'Selecione um cartão...' : 'Selecione uma conta...'}
                    </option>

                    {isCartao
                      ? cartoes.map((cartao) => (
                        <option key={cartao.id} value={cartao.id}>
                          Cartão: {cartao.nome}
                        </option>
                      ))
                      : contas.map((conta) => (
                        <option key={conta.id} value={conta.id}>
                          Conta: {conta.nomeConta}
                        </option>
                      ))
                    }
                  </select>
                </div>
              )}

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