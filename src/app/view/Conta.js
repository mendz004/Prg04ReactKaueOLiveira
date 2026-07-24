import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/Api'; // Importando a conexão com a API
import '../../styles/receita.css';
import '../../styles/buttons.css';
import navbarStyles from '../components/navBar.module.css';

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
  // Inicializamos com um array vazio
  const [contas, setContas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    tipo: 'Conta Corrente',
    saldo: ''
  });
  const [editingId, setEditingId] = useState(null);

  // 1. BUSCAR DADOS DO BACK-END
  useEffect(() => {
    async function carregarContas() {
      // 1. Pega o usuário logado
      const usuarioStorage = localStorage.getItem('usuarioAppFinanceiro');
      
      if (!usuarioStorage) {
        return; // Se não tiver usuário, nem tenta buscar
      }

      const usuarioLogado = JSON.parse(usuarioStorage);

      // 2. Monta o cabeçalho com o Token
      const config = {
          headers: {
              Authorization: `Bearer ${usuarioLogado.token}`
          }
      };

      try {
        // 3. Faz o GET enviando o Token de permissão!
        const response = await api.get('/contas', config); 
        
        // Coloca as contas que vieram do banco na tela
        setContas(response.data); 
      } catch (error) {
        console.error("Erro ao carregar as contas:", error);
      }
    }

    carregarContas();
  }, []);

  const saldoTotal = useMemo(() => {
    return contas.reduce((sum, item) => sum + (item.saldoAtual || 0), 0);
  }, [contas]);

  // 2. CRIAR OU ATUALIZAR NO BACK-END
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.nome.trim() || !form.saldo) return;

    // 1. BUSCAR O USUÁRIO LOGADO NO NAVEGADOR
    const usuarioStorage = localStorage.getItem('usuarioAppFinanceiro');

    if (!usuarioStorage) {
      alert("Sessão expirada ou usuário não encontrado. Por favor, faça login novamente.");
      return;
    }

    // Converte a string salva de volta para um objeto JavaScript
    const usuarioLogado = JSON.parse(usuarioStorage);

    // 2. DTO DINÂMICO E ALINHADO COM O SPRING BOOT
    const payload = {
      nomeConta: form.nome.trim(),
      tipo: form.tipo,
      saldoAtual: Number(form.saldo),
      usuarioId: Number(usuarioLogado.id)
    };

    // 3. CONFIGURAR O CABEÇALHO COM O TOKEN
    // Certifique-se de que a propriedade que guarda o token no seu objeto seja 'token'
    const config = {
        headers: {
            Authorization: `Bearer ${usuarioLogado.token}` 
        }
    };

    try {
      if (editingId) {
        // Passando a 'config' como terceiro parâmetro no PUT
        const response = await api.put(`/contas/${editingId}`, payload, config);
        setContas((prev) => prev.map((item) => (item.id === editingId ? response.data : item)));
      } else {
        // Passando a 'config' como terceiro parâmetro no POST
        const response = await api.post('/contas', payload, config);
        setContas((prev) => [response.data, ...prev]);
      }

      setShowModal(false);
      setEditingId(null);
      setForm({
        nome: '',
        tipo: 'Conta Corrente',
        instituicao: 'Nubank', // Apenas mantive como estava no seu original
        saldo: ''
      });
    } catch (error) {
      console.error("Erro ao salvar conta:", error);
      alert("Ocorreu um erro ao salvar a conta.");
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      nome: '',
      tipo: 'Conta Corrente',
      saldo: ''
    });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      nome: item.nomeConta || '',
      tipo: item.tipo,
      saldo: String(item.saldoAtual || 0)
    });
    setShowModal(true);
  };

  // 3. DELETAR DO BACK-END
  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta conta? O saldo também será removido.")) return;

    // 1. BUSCAR O USUÁRIO LOGADO PARA PEGAR O TOKEN
    const usuarioStorage = localStorage.getItem('usuarioAppFinanceiro');

    if (!usuarioStorage) {
      alert("Sessão expirada. Por favor, faça login novamente.");
      return;
    }

    const usuarioLogado = JSON.parse(usuarioStorage);

    // 2. CONFIGURAR O CABEÇALHO COM O TOKEN
    const config = {
        headers: {
            Authorization: `Bearer ${usuarioLogado.token}`
        }
    };

    try {
      // 3. ENVIAR A REQUISIÇÃO DELETE COM AS CONFIGURAÇÕES DE CABEÇALHO
      await api.delete(`/contas/${id}`, config);
      
      // Remove da lista na tela
      setContas((prev) => prev.filter((item) => item.id !== id));
      
    } catch (error) {
      console.error("Erro ao deletar conta:", error);
      
      // Tratamento extra caso o erro seja 403 (sem permissão) ou 401
      if (error.response && (error.response.status === 403 || error.response.status === 401)) {
          alert("Você não tem permissão para deletar esta conta ou sua sessão expirou.");
      } else {
          alert("Ocorreu um erro ao deletar a conta.");
      }
    }
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
          {contas.length === 0 ? (
            <div className="receita-empty">Nenhuma conta cadastrada.</div>
          ) : (
            contas.map((item) => (
              <article key={item.id} className="receita-item">
                <div className="receita-item-main">
                  {/* Se o banco não tiver o icone, colocamos um emoji padrão de banco 🏦 */}
                  <div className="receita-badge" aria-hidden="true">{item.icone || '🏦'}</div>
                  <div className="receita-info">
                    <div className="receita-title-row">
                      {/* Trocamos item.nome por item.nomeConta */}
                      <h3>{item.nomeConta}</h3>
                      {/* Trocamos item.saldo por item.saldoAtual */}
                      <span className="receita-value">{formatCurrency(item.saldoAtual || 0)}</span>
                    </div>
                    <div className="receita-meta">
                      {item.tipo} {item.instituicao ? `· ${item.instituicao}` : ''}
                    </div>
                  </div>
                </div>

                <div className="receita-actions">
                  <button className="receita-action-btn" onClick={() => openEdit(item)} aria-label={`Editar ${item.nomeConta}`}>
                    ✏️
                  </button>
                  <button className="receita-action-btn" onClick={() => handleDelete(item.id)} aria-label={`Excluir ${item.nomeConta}`}>
                    🗑️
                  </button>
                  <button className="receita-action-btn" aria-label={`Ver extrato de ${item.nomeConta}`}>
                    📄
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
