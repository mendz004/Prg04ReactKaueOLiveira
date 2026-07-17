import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/receita.css';
import '../../styles/buttons.css';
import navbarStyles from '../components/navBar.module.css';
import styles from './cartao.module.css';

const dashboardNavItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Receita', path: '/receita' },
  { label: 'Conta', path: '/conta' },
  { label: 'Cartão', path: '/cartao' },
  { label: 'Objetivo', path: '/objetivo' },
  { label: 'Orçamento', path: '/orcamento' },
  { label: 'Relatório', path: '/relatorio' }
];

const initialCards = [
  {
    id: 1,
    nome: 'Nubank',
    limiteTotal: 5000,
    limiteUsado: 1250,
    faturaAtual: 1250,
    status: 'Aberta',
    fechamento: 10,
    vencimento: 25,
    bg: 'linear-gradient(135deg, #4c1d95 0%, #1d4ed8 100%)',
    lancamentos: [
      { id: 1, period: 'atual', data: '12/07', icon: '🛒', descricao: 'Mercado', valor: 128.4 },
      { id: 2, period: 'atual', data: '08/07', icon: '☕', descricao: 'Café da manhã', valor: 24 },
      { id: 3, period: 'anterior', data: '05/06', icon: '🚗', descricao: 'Posto', valor: 89.9 },
      { id: 4, period: 'proxima', data: '18/08', icon: '🎬', descricao: 'Cinema', valor: 52 }
    ]
  },
  {
    id: 2,
    nome: 'Black Itaú',
    limiteTotal: 8000,
    limiteUsado: 3600,
    faturaAtual: 3600,
    status: 'Atrasada',
    fechamento: 5,
    vencimento: 20,
    bg: 'linear-gradient(135deg, #020617 0%, #334155 100%)',
    lancamentos: [
      { id: 5, period: 'atual', data: '11/07', icon: '✈️', descricao: 'Passagem', valor: 610 },
      { id: 6, period: 'atual', data: '06/07', icon: '🧾', descricao: 'Software', valor: 115 },
      { id: 7, period: 'anterior', data: '02/06', icon: '🍽️', descricao: 'Restaurante', valor: 214 },
      { id: 8, period: 'proxima', data: '22/08', icon: '🎮', descricao: 'Jogos', valor: 180 }
    ]
  }
];

const contasOrigem = ['Conta Corrente', 'NuConta', 'Itaú', 'Caixa'];
const periodos = [
  { value: 'atual', label: 'Fatura atual' }
];

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function Cartao() {
  const [cards, setCards] = useState(initialCards);
  const [selectedCardId, setSelectedCardId] = useState(initialCards[0].id);
  const [periodoSelecionado] = useState('atual');
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [showCardMenu, setShowCardMenu] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState('total');
  const [paymentValue, setPaymentValue] = useState('');
  const [newCard, setNewCard] = useState({ nome: '', limiteTotal: '', fechamento: '', vencimento: '' });
  const [paymentForm, setPaymentForm] = useState({ conta: contasOrigem[0], valor: '' });

  const selectedCard = useMemo(() => cards.find((card) => card.id === selectedCardId) || cards[0], [cards, selectedCardId]);

  const limiteDisponivel = selectedCard.limiteTotal - selectedCard.limiteUsado;
  const percentualUso = Math.min(100, Math.round((selectedCard.limiteUsado / selectedCard.limiteTotal) * 100));

  const lancamentosFiltrados = useMemo(() => {
    return selectedCard.lancamentos.filter((item) => item.period === periodoSelecionado);
  }, [periodoSelecionado, selectedCard]);

  function openNewCardModal() {
    setEditingCardId(null);
    setNewCard({ nome: '', limiteTotal: '', fechamento: '', vencimento: '' });
    setShowCardModal(true);
  }

  function openEditCardModal() {
    setEditingCardId(selectedCard.id);
    setNewCard({
      nome: selectedCard.nome,
      limiteTotal: String(selectedCard.limiteTotal),
      fechamento: String(selectedCard.fechamento),
      vencimento: String(selectedCard.vencimento)
    });
    setShowCardMenu(false);
    setShowCardModal(true);
  }

  function closeCardModal() {
    setShowCardModal(false);
    setEditingCardId(null);
    setNewCard({ nome: '', limiteTotal: '', fechamento: '', vencimento: '' });
  }

  function handleCreateCard(event) {
    event.preventDefault();
    if (!newCard.nome.trim() || !newCard.limiteTotal || !newCard.fechamento || !newCard.vencimento) {
      return;
    }

    const dadosDoFormulario = {
      nome: newCard.nome.trim(),
      limiteTotal: Number(newCard.limiteTotal),
      fechamento: Number(newCard.fechamento),
      vencimento: Number(newCard.vencimento)
    };
    const cartaoAtualizado = editingCardId
      ? { ...cards.find((card) => card.id === editingCardId), ...dadosDoFormulario }
      : {
        id: Date.now(),
        ...dadosDoFormulario,
        limiteUsado: 0,
        faturaAtual: 0,
        status: 'Fechada',
        bg: 'linear-gradient(135deg, #0f172a 0%, #4338ca 100%)',
        lancamentos: []
      };

    setCards((prev) => editingCardId
      ? prev.map((card) => (card.id === editingCardId ? cartaoAtualizado : card))
      : [cartaoAtualizado, ...prev]);
    setSelectedCardId(cartaoAtualizado.id);
    closeCardModal();
  }

  function handleDeleteCard() {
    if (cards.length === 1) {
      return;
    }

    const remainingCards = cards.filter((card) => card.id !== selectedCard.id);
    setCards(remainingCards);
    setSelectedCardId(remainingCards[0].id);
    setShowCardMenu(false);
  }

  function handlePaymentSubmit(event) {
    event.preventDefault();
    const valorPago = paymentType === 'total' ? selectedCard.faturaAtual : Number(paymentValue || 0);
    if (!valorPago || valorPago <= 0) {
      return;
    }

    setCards((prev) => prev.map((card) => {
      if (card.id !== selectedCard.id) {
        return card;
      }

      const novoUso = Math.max(0, card.limiteUsado - valorPago);
      return {
        ...card,
        limiteUsado: novoUso,
        faturaAtual: 0,
        status: 'Fechada'
      };
    }));

    setPaymentType('total');
    setPaymentValue('');
    setPaymentForm({ conta: contasOrigem[0], valor: '' });
    setShowPaymentModal(false);
  }

  return (
    <div className={`receita-page ${styles.page}`}>
      <div className="receita-shell">
        <nav className={`${navbarStyles.navbar} navbar navbar-expand-lg navbar-dark sticky-top mb-4`}>
          <Link className={`navbar-brand ${navbarStyles.logo}`} to="/cartao">
            💳 Cartões de Crédito
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#cartaoNav"
            aria-controls="cartaoNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="cartaoNav">
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
            <p className="receita-kicker">Controle e organização</p>
            <h1>Cartões de Crédito</h1>
          </div>

          <div className="receita-header-actions">
            <button className="headerButton" onClick={openNewCardModal}>+ Novo Cartão</button>
          </div>
        </header>

        <section className={styles.carouselSection} aria-label="Seleção de cartões">
          <div className={styles.carouselTrack}>
            {cards.map((card) => (
              <button
                key={card.id}
                type="button"
                className={`${styles.cardTab} ${selectedCard.id === card.id ? styles.cardTabActive : ''}`}
                onClick={() => setSelectedCardId(card.id)}
              >
                <span className={styles.cardTabName}>{card.nome}</span>
              </button>
            ))}
          </div>

          <article className={styles.creditCard} style={{ background: selectedCard.bg }}>
            <div className={styles.cardTopRow}>
              <div className={styles.cardMenuWrap}>
                <button
                  type="button"
                  className={styles.cardMenuButton}
                  onClick={() => setShowCardMenu((open) => !open)}
                  aria-label="Opções do cartão"
                  aria-expanded={showCardMenu}
                >
                  •••
                </button>
                {showCardMenu && (
                  <div className={styles.cardMenu}>
                    <button type="button" onClick={openEditCardModal}>Editar cartão</button>
                    <button type="button" className={styles.cardMenuDelete} onClick={handleDeleteCard} disabled={cards.length === 1}>
                      Excluir cartão
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.cardMiddle}>
              <span className={styles.cardName}>{selectedCard.nome}</span>
            </div>
            <div className={styles.cardFooter}>
              <div>
                <p className={styles.cardLabel}>Limite</p>
                <p className={styles.cardValue}>{formatCurrency(selectedCard.limiteTotal)}</p>
              </div>
              <div>
                <p className={styles.cardLabel}>Fechamento</p>
                <p className={styles.cardValue}>Dia {selectedCard.fechamento}</p>
                <p className={styles.cardLabel}>Vencimento</p>
                <p className={styles.cardValue}>Dia {selectedCard.vencimento}</p>
              </div>
            </div>
          </article>
        </section>

        <section className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <div>
              <p className={styles.summaryKicker}>Fatura atual</p>
              <h2>{formatCurrency(selectedCard.faturaAtual)}</h2>
            </div>
            <span className={`${styles.statusBadge} ${selectedCard.status.toLowerCase() === 'atrasada' ? styles.statusDanger : ''}`}>
              {selectedCard.status}
            </span>
          </div>

          <div className={styles.progressWrap}>
            <div className={styles.progressTrack}>
              <div className={styles.progressBar} style={{ width: `${percentualUso}%` }} />
            </div>
            <div className={styles.progressMeta}>
              <span className={styles.availableText}>Limite disponível: {formatCurrency(limiteDisponivel)}</span>
              <span>Limite total: {formatCurrency(selectedCard.limiteTotal)}</span>
            </div>
          </div>

          <div className={styles.infoRow}>
            <span>Fechamento: dia {selectedCard.fechamento}</span>
            <span>Vencimento: dia {selectedCard.vencimento}</span>
          </div>
        </section>

        <section className={styles.actionsRow}>
          <button className="btn_comecar" onClick={() => setShowPaymentModal(true)} disabled={selectedCard.faturaAtual === 0}>
            Pagar Fatura
          </button>
        </section>

        <section className={styles.extratoPanel}>
          <div className={styles.extratoHeader}>
            <div>
              <p className={styles.summaryKicker}>Extrato da fatura</p>
              <h3>Lançamentos</h3>
            </div>
            <div className={styles.periodSelector} role="tablist" aria-label="Período da fatura">
              {periodos.map((periodo) => (
                <button
                  key={periodo.value}
                  type="button"
                  className={`${styles.periodButton} ${periodoSelecionado === periodo.value ? styles.periodButtonActive : ''}`}
                >
                  {periodo.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.extratoList}>
            {lancamentosFiltrados.length === 0 ? (
              <div className={styles.emptyState}>Nenhum lançamento para este período.</div>
            ) : (
              lancamentosFiltrados.map((item) => (
                <article key={item.id} className={styles.extratoItem}>
                  <div className={styles.extratoItemMain}>
                    <span className={styles.extratoIcon} aria-hidden="true">{item.icon}</span>
                    <div>
                      <p className={styles.extratoTitle}>{item.descricao}</p>
                      <p className={styles.extratoMeta}>{item.data}</p>
                    </div>
                  </div>
                  <span className={styles.extratoValue}>{formatCurrency(item.valor)}</span>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      {showCardModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Cadastrar novo cartão">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3>{editingCardId ? 'Editar cartão' : 'Novo cartão'}</h3>
              <button type="button" className={styles.modalClose} onClick={closeCardModal} aria-label="Fechar">✕</button>
            </div>
            <form className={styles.modalForm} onSubmit={handleCreateCard}>
              <label className={styles.field}>
                <span>Nome do Cartão</span>
                <input type="text" value={newCard.nome} onChange={(event) => setNewCard((prev) => ({ ...prev, nome: event.target.value }))} placeholder="Cartão C6" />
              </label>
              <label className={styles.field}>
                <span>Limite Total (R$)</span>
                <input type="number" min="0" step="0.01" value={newCard.limiteTotal} onChange={(event) => setNewCard((prev) => ({ ...prev, limiteTotal: event.target.value }))} placeholder="5000" />
              </label>
              <div className={styles.inlineFields}>
                <label className={styles.field}>
                  <span>Dia de Fechamento</span>
                  <input type="number" min="1" max="31" value={newCard.fechamento} onChange={(event) => setNewCard((prev) => ({ ...prev, fechamento: event.target.value }))} placeholder="10" />
                </label>
                <label className={styles.field}>
                  <span>Dia de Vencimento</span>
                  <input type="number" min="1" max="31" value={newCard.vencimento} onChange={(event) => setNewCard((prev) => ({ ...prev, vencimento: event.target.value }))} placeholder="25" />
                </label>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className="headerButton" onClick={closeCardModal}>Cancelar</button>
                <button type="submit" className="btn_comecar">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Pagar fatura">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3>Pagar fatura</h3>
              <button type="button" className={styles.modalClose} onClick={() => setShowPaymentModal(false)} aria-label="Fechar">✕</button>
            </div>
            <form className={styles.modalForm} onSubmit={handlePaymentSubmit}>
              <p className={styles.amountLabel}>Valor da fatura: {formatCurrency(selectedCard.faturaAtual)}</p>
              <label className={styles.field}>
                <span>Conta de origem</span>
                <select value={paymentForm.conta} onChange={(event) => setPaymentForm((prev) => ({ ...prev, conta: event.target.value }))}>
                  {contasOrigem.map((conta) => (
                    <option key={conta} value={conta}>{conta}</option>
                  ))}
                </select>
              </label>
              <div className={styles.paymentTypeGroup}>
                <button type="button" className={`${styles.paymentTypeButton} ${paymentType === 'total' ? styles.paymentTypeActive : ''}`} onClick={() => setPaymentType('total')}>
                  Total
                </button>
                <button type="button" className={`${styles.paymentTypeButton} ${paymentType === 'parcial' ? styles.paymentTypeActive : ''}`} onClick={() => setPaymentType('parcial')}>
                  Parcial
                </button>
              </div>
              {paymentType === 'parcial' && (
                <label className={styles.field}>
                  <span>Valor do pagamento</span>
                  <input type="number" min="0" step="0.01" value={paymentValue} onChange={(event) => setPaymentValue(event.target.value)} placeholder="150.00" />
                </label>
              )}
              <div className={styles.modalActions}>
                <button type="button" className="headerButton" onClick={() => setShowPaymentModal(false)}>Cancelar</button>
                <button type="submit" className="btn_comecar">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cartao;
