import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/buttons.css';
import navbarStyles from '../components/navBar.module.css';
import styles from './objetivo.module.css';

const API_OBJETIVO_URL = 'http://localhost:8080/objetivos';
const API_CONTA_URL = 'http://localhost:8080/contas';

const emojis = ['🎯', '✈️', '🚗', '🏠', '🎓', '💍', '🛟', '🎮'];
const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Receita', path: '/receita' },
  { label: 'Conta', path: '/conta' },
  { label: 'Cartão', path: '/cartao' },
  { label: 'Objetivo', path: '/objetivo' },
  { label: 'Orçamento', path: '/orcamento' },
  { label: 'Relatório', path: '/relatorio' }
];

const currency = (value) => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
}).format(value || 0);

const emptyForm = () => ({
  nome: '',
  icone: '🎯',
  valorAlvo: '',
  valorAtual: '',
  dataPrevista: '',
  status: 'EM_ANDAMENTO'
});

// Helper para converter qualquer formato de data retornado pelo Java em Date válido
function parseJavaDate(dateVal) {
  if (!dateVal) return new Date();
  if (Array.isArray(dateVal)) {
    return new Date(dateVal[0], dateVal[1] - 1, dateVal[2]);
  }
  return new Date(`${String(dateVal).split('T')[0]}T12:00:00`);
}

function relativeDate(date) {
  const targetDate = parseJavaDate(date);
  const now = new Date();
  const months = Math.round((targetDate - now) / (1000 * 60 * 60 * 24 * 30.44));

  if (months <= 0) return 'prazo alcançado';
  return months === 1 ? 'daqui a 1 mês' : `daqui a ${months} meses`;
}

function Objetivo() {
  const [goals, setGoals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [tab, setTab] = useState('EM_ANDAMENTO');
  const [goalModal, setGoalModal] = useState(false);
  const [depositModal, setDepositModal] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deposit, setDeposit] = useState({ valor: '', contaId: '' });
  const [celebration, setCelebration] = useState(false);

  // Carrega Objetivos e Contas ao abrir a página
  useEffect(() => {
    fetchGoals();
    fetchAccounts();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await axios.get(API_OBJETIVO_URL);
      console.log('Objetivos do Java:', res.data);
      setGoals(res.data || []);
    } catch (err) {
      console.error('Erro ao buscar objetivos:', err);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(API_CONTA_URL);
      setAccounts(res.data || []);
      if (res.data && res.data.length > 0) {
        setDeposit((prev) => ({ ...prev, contaId: res.data[0].id }));
      }
    } catch (err) {
      console.error('Erro ao buscar contas:', err);
    }
  };

  const activeGoals = useMemo(
    () => goals.filter((goal) => goal.status === 'EM_ANDAMENTO'),
    [goals]
  );

  const shownGoals = goals.filter((goal) => (
    tab === 'EM_ANDAMENTO'
      ? goal.status === 'EM_ANDAMENTO'
      : goal.status === 'CONCLUIDO'
  ));

  const totalSaved = activeGoals.reduce((sum, goal) => sum + (goal.valorAtual || 0), 0);
  const remaining = activeGoals.reduce(
    (sum, goal) => sum + Math.max((goal.valorAlvo || 0) - (goal.valorAtual || 0), 0),
    0
  );

  const openNewGoal = () => {
    setEditingId(null);
    setForm(emptyForm());
    setGoalModal(true);
  };

  const openEdit = (goal) => {
    const id = goal.id || goal.idObjetivo;
    setEditingId(id);
    
    let rawDate = goal.dataLimite || goal.dataPrevista;
    let dateStr = '';
    if (Array.isArray(rawDate)) {
      const [y, m, d] = rawDate;
      dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    } else if (typeof rawDate === 'string') {
      dateStr = rawDate.split('T')[0];
    }

    setForm({
      ...goal,
      valorAlvo: String(goal.valorAlvo || ''),
      valorAtual: String(goal.valorAtual || ''),
      dataPrevista: dateStr || ''
    });
    setMenuId(null);
    setGoalModal(true);
  };

  const saveGoal = async (event) => {
    event.preventDefault();

    // Busca o usuário logado
    const usuarioStorage = localStorage.getItem('usuarioAppFinanceiro');
    let idDoUsuarioLogado = null;

    if (usuarioStorage) {
      const usuarioObj = JSON.parse(usuarioStorage);
      idDoUsuarioLogado = usuarioObj.id;
    }

    if (!idDoUsuarioLogado) {
      alert("Erro: Você precisa estar logado para cadastrar um objetivo!");
      return;
    }

    const payload = {
      nome: form.nome.trim(),
      icone: form.icone,
      valorAlvo: Number(form.valorAlvo),
      valorAtual: Number(form.valorAtual || 0),
      dataLimite: form.dataPrevista.includes('T') 
        ? form.dataPrevista 
        : `${form.dataPrevista}T00:00:00`,
      status: form.status,
      usuarioId: idDoUsuarioLogado 
    };

    try {
      if (editingId) {
        await axios.put(`${API_OBJETIVO_URL}/${editingId}`, payload);
      } else {
        await axios.post(API_OBJETIVO_URL, payload);
      }
      setGoalModal(false);
      fetchGoals();
    } catch (err) {
      console.error('Erro detalhado do Java:', err.response?.data);
      alert('Erro ao salvar objetivo. Verifique o console.');
    }
  };

  // Função para deletar objetivo
  const deleteGoal = async (id) => {
    if (!id) {
      alert("Erro: ID do objetivo não foi encontrado!");
      return;
    }

    if (window.confirm("Tem certeza que deseja excluir este objetivo?")) {
      try {
        await axios.delete(`${API_OBJETIVO_URL}/${id}`);
        fetchGoals();
      } catch (err) {
        console.error('Erro ao deletar objetivo:', err);
        alert('Erro ao excluir objetivo. Verifique o console.');
      }
    }
  };

  const confirmDeposit = async (event) => {
    event.preventDefault();

    const value = Number(deposit.valor);
    if (!value || value <= 0) return;

    const novoValorAtual = Math.min(depositModal.valorAlvo, (depositModal.valorAtual || 0) + value);
    const estaConcluido = novoValorAtual >= depositModal.valorAlvo;

    let rawDate = depositModal.dataLimite || depositModal.dataPrevista;
    let dataIso = '';
    if (Array.isArray(rawDate)) {
      const [y, m, d] = rawDate;
      dataIso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T00:00:00`;
    } else if (typeof rawDate === 'string') {
      dataIso = rawDate.includes('T') ? rawDate : `${rawDate}T00:00:00`;
    }

    const usuarioStorage = localStorage.getItem('usuarioAppFinanceiro');
    let idDoUsuarioLogado = null;
    if (usuarioStorage) {
      const usuarioObj = JSON.parse(usuarioStorage);
      idDoUsuarioLogado = usuarioObj.id;
    }

    const payload = {
      nome: depositModal.nome,
      icone: depositModal.icone,
      valorAlvo: depositModal.valorAlvo,
      valorAtual: novoValorAtual,
      status: estaConcluido ? 'CONCLUIDO' : depositModal.status,
      dataLimite: dataIso,
      usuarioId: idDoUsuarioLogado
    };

    const targetId = depositModal.id || depositModal.idObjetivo;

    try {
      await axios.put(`${API_OBJETIVO_URL}/${targetId}`, payload);
      setDepositModal(null);
      setDeposit({ valor: '', contaId: accounts[0]?.id || '' });
      setCelebration(true);
      window.setTimeout(() => setCelebration(false), 2500);
      fetchGoals();
    } catch (err) {
      console.error('Erro ao efetuar depósito:', err);
      alert('Erro ao guardar dinheiro no objetivo.');
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <nav className={`${navbarStyles.navbar} navbar navbar-expand-lg navbar-dark sticky-top mb-4`}>
          <Link className={`navbar-brand ${navbarStyles.logo}`} to="/objetivo">
            🎯 Objetivos
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#goalNav" aria-controls="goalNav" aria-expanded="false" aria-label="Abrir navegação">
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="goalNav">
            <ul className={`navbar-nav ms-auto gap-1 py-2 py-lg-0 ${navbarStyles.list}`}>
              {navItems.map((item) => (
                <li key={item.path} className="nav-item">
                  <Link className="nav-link" to={item.path}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <header className={styles.header}>
          <div>
            <h1>Meus Objetivos</h1>
          </div>
          <button className="headerButton" onClick={openNewGoal}>+ Novo Objetivo</button>
        </header>

        <section className={styles.summary} aria-label="Resumo dos objetivos">
          <div>
            <p>Total guardado</p>
            <strong className={styles.objetivoValue}>{currency(totalSaved)}</strong>
            <span>em {activeGoals.length} objetivos ativos</span>
          </div>
          <div className={styles.summaryDivider} />
          <div>
            <p>Restam</p>
            <strong>{currency(remaining)}</strong>
            <span>para realizar seus planos</span>
          </div>
        </section>

        <section className={styles.toolbar}>
          <div className={styles.tabs} role="tablist">
            <button className={tab === 'EM_ANDAMENTO' ? styles.tabActive : ''} onClick={() => setTab('EM_ANDAMENTO')}>
              Em andamento <span>{activeGoals.length}</span>
            </button>
            <button className={tab === 'CONCLUIDO' ? styles.tabActive : ''} onClick={() => setTab('CONCLUIDO')}>
              Concluídos <span>{goals.filter((goal) => goal.status === 'CONCLUIDO').length}</span>
            </button>
          </div>
        </section>

        <section className={styles.grid}>
          {shownGoals.length ? shownGoals.map((goal) => {
            const currentId = goal.id || goal.idObjetivo;
            const progress = Math.min(Math.round(((goal.valorAtual || 0) / goal.valorAlvo) * 100), 100);

            return (
              <article className={styles.card} key={currentId}>
                <div className={styles.cardTop}>
                  <div className={styles.goalIcon}>{goal.icone}</div>
                  <div className={styles.goalTitle}>
                    <h2>{goal.nome}</h2>
                    <p>🗓️ {relativeDate(goal.dataLimite || goal.dataPrevista)}</p>
                  </div>
                  <div className={styles.menuWrap}>
                    <button className={styles.menuButton} onClick={() => setMenuId(menuId === currentId ? null : currentId)} aria-label={`Opções de ${goal.nome}`}>
                      •••
                    </button>
                    {menuId === currentId && (
                      <div className={styles.menu}>
                        <button onClick={() => openEdit(goal)}>Editar</button>
                        <button className={styles.delete} onClick={() => deleteGoal(currentId)}>Excluir</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.progressInfo}>
                  <span>{currency(goal.valorAtual)} <small>de {currency(goal.valorAlvo)}</small></span>
                  <strong>{progress}%</strong>
                </div>
                <div className={styles.progressTrack} aria-label={`${progress}% concluído`}>
                  <div className={styles.progressBar} style={{ width: `${progress}%` }} />
                </div>
                <p className={styles.remaining}>
                  {progress === 100
                    ? 'Objetivo concluído! 🎉'
                    : `Faltam ${currency(Math.max(goal.valorAlvo - (goal.valorAtual || 0), 0))} para chegar lá`}
                </p>
                {goal.status === 'EM_ANDAMENTO' && (
                  <button className={styles.depositButton} onClick={() => { setDepositModal(goal); setDeposit({ valor: '', contaId: accounts[0]?.id || '' }); }}>
                    + Guardar dinheiro
                  </button>
                )}
              </article>
            );
          }) : (
            <div className={styles.empty}>
              {tab === 'EM_ANDAMENTO' ? 'Nenhum objetivo em andamento.' : 'Nenhum objetivo concluído ainda. Continue guardando! 🌱'}
            </div>
          )}
        </section>
      </div>

      {goalModal && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="goal-modal-title">
          <form className={styles.modal} onSubmit={saveGoal}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.kicker}>Seu próximo passo</p>
                <h2 id="goal-modal-title">{editingId ? 'Editar objetivo' : 'Novo objetivo'}</h2>
              </div>
              <button type="button" className={styles.close} onClick={() => setGoalModal(false)} aria-label="Fechar">×</button>
            </div>
            <label>
              Nome
              <input value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} placeholder="Ex.: Viagem dos sonhos" required />
            </label>
            <fieldset>
              <legend>Escolha um ícone</legend>
              <div className={styles.emojiPicker}>
                {emojis.map((emoji) => (
                  <button type="button" key={emoji} className={form.icone === emoji ? styles.emojiSelected : ''} onClick={() => setForm({ ...form, icone: emoji })}>
                    {emoji}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className={styles.formRow}>
              <label>
                Valor alvo (R$)
                <input type="number" min="1" step="0.01" value={form.valorAlvo} onChange={(event) => setForm({ ...form, valorAlvo: event.target.value })} required />
              </label>
              <label>
                Valor inicial (R$)
                <input type="number" min="0" step="0.01" value={form.valorAtual} onChange={(event) => setForm({ ...form, valorAtual: event.target.value })} />
              </label>
            </div>
            <div className={styles.formRow}>
              <label>
                Data prevista
                <input type="date" value={form.dataPrevista} onChange={(event) => setForm({ ...form, dataPrevista: event.target.value })} required />
              </label>
              <label>
                Status
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  <option value="EM_ANDAMENTO">Em andamento</option>
                  <option value="CANCELADO">Cancelado</option>
                  <option value="CONCLUIDO">Concluído</option>
                </select>
              </label>
            </div>
            <div className={styles.modalActions}>
              <button type="button" className={styles.cancel} onClick={() => setGoalModal(false)}>Cancelar</button>
              <button className="headerButton" type="submit">Salvar objetivo</button>
            </div>
          </form>
        </div>
      )}

      {depositModal && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="deposit-modal-title">
          <form className={`${styles.modal} ${styles.depositModal}`} onSubmit={confirmDeposit}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.kicker}>Um passo mais perto</p>
                <h2 id="deposit-modal-title">Depositar para {depositModal.nome}</h2>
              </div>
              <button type="button" className={styles.close} onClick={() => setDepositModal(null)} aria-label="Fechar">×</button>
            </div>
            <div className={styles.depositProgress}>
              <span>{depositModal.icone}</span>
              <div>
                <strong>{currency(depositModal.valorAtual)} guardados</strong>
                <p>Faltam {currency(Math.max(depositModal.valorAlvo - (depositModal.valorAtual || 0), 0))}</p>
              </div>
            </div>
            <label className={styles.bigField}>
              Valor a guardar (R$)
              <input autoFocus type="number" min="0.01" step="0.01" placeholder="0,00" value={deposit.valor} onChange={(event) => setDeposit({ ...deposit, valor: event.target.value })} required />
            </label>
            <label>
              Conta de origem
              <select value={deposit.contaId} onChange={(event) => setDeposit({ ...deposit, contaId: event.target.value })}>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.nomeConta || acc.nome}</option>
                ))}
              </select>
            </label>
            <button className={`headerButton ${styles.confirm}`} type="submit">Confirmar depósito</button>
          </form>
        </div>
      )}

      {celebration && (
        <div className={styles.celebration} role="status">
          <span>🎉</span>
          <strong>Excelente aporte!</strong>
          <small>Seu sonho está mais perto.</small>
        </div>
      )}
    </main>
  );
}

export default Objetivo;