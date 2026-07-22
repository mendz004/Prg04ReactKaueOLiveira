import { useCallback, useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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

const contasOrigem = ['Conta Corrente', 'NuConta', 'Itaú', 'Caixa'];
const periodos = [{ value: 'atual', label: 'Fatura atual' }];

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}

function Cartao() {
  const [cards, setCards] = useState([]); // Agora começa vazio!
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [periodoSelecionado] = useState('atual');

  // Modais e Menus
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [showCardMenu, setShowCardMenu] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Formulários
  const [paymentType, setPaymentType] = useState('total');
  const [paymentValue, setPaymentValue] = useState('');
  const [newCard, setNewCard] = useState({ nome: '', limiteTotal: '', fechamento: '', vencimento: '' });
  const [paymentForm, setPaymentForm] = useState({ conta: contasOrigem[0], valor: '' });

  // 1. BUSCAR CARTÕES DO BACK-END
  const fetchCartoes = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8080/cartoes');
      setCards(response.data);

      // Se tiver cartões e nenhum selecionado, seleciona o primeiro
      if (response.data.length > 0) {
        setSelectedCardId((currentCardId) => currentCardId ?? response.data[0].id);
      }
    } catch (error) {
      console.error("Erro ao buscar cartões do back-end", error);
    }
  }, []);

  useEffect(() => {
    fetchCartoes();
  }, [fetchCartoes]);

  // Proteção de estado: pega o cartão selecionado ou nulo se não houver cartões
  const selectedCard = useMemo(() => {
    if (cards.length === 0) return null;
    return cards.find((card) => card.id === selectedCardId) || cards[0];
  }, [cards, selectedCardId]);

  // Cálculos dinâmicos (protegidos contra null)
  const limiteDisponivel = selectedCard ? (selectedCard.limiteTotal || 0) - (selectedCard.limiteUsado || 0) : 0;
  const percentualUso = selectedCard && selectedCard.limiteTotal
    ? Math.min(100, Math.round(((selectedCard.limiteUsado || 0) / selectedCard.limiteTotal) * 100))
    : 0;

  const lancamentosFiltrados = useMemo(() => {
    if (!selectedCard || !selectedCard.lancamentos) return [];
    return selectedCard.lancamentos.filter((item) => item.period === periodoSelecionado);
  }, [periodoSelecionado, selectedCard]);

  // Ações de Modal
  function openNewCardModal() {
    setEditingCardId(null);
    setNewCard({ nome: '', limiteTotal: '', fechamento: '', vencimento: '' });
    setShowCardModal(true);
  }

  function openEditCardModal() {
    if (!selectedCard) return;
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

  // 2. CADASTRAR OU EDITAR CARTÃO NO BACK-END
  // 2. CADASTRAR OU EDITAR CARTÃO NO BACK-END
  async function handleCreateCard(event) {
    event.preventDefault();
    if (!newCard.nome.trim() || !newCard.limiteTotal || !newCard.fechamento || !newCard.vencimento) {
      return;
    }

    // Como o Java espera um 'java.util.Date', precisamos montar uma data completa.
    // Vamos usar o ano e o mês atuais, e encaixar o dia que o usuário digitou.
    const dataAtual = new Date();
    const ano = dataAtual.getFullYear();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');

    // Garante que o dia terá 2 dígitos (ex: '5' vira '05')
    const diaFechamentoFormatado = String(newCard.fechamento).padStart(2, '0');
    const diaVencimentoFormatado = String(newCard.vencimento).padStart(2, '0');

    const usuarioStorage = localStorage.getItem('usuarioAppFinanceiro');

    let idDoUsuarioLogado = null;
    if (usuarioStorage) {
      const usuarioObj = JSON.parse(usuarioStorage);
      idDoUsuarioLogado = usuarioObj.id; // Ou o nome do campo que guarda o ID
    }

    if (!idDoUsuarioLogado) {
      alert("Erro: Você precisa estar logado para cadastrar um cartão!");
      return;
    }

    // Montando o pacote EXATAMENTE como o CartaoPostDto pede
    const payload = {
      nome: newCard.nome.trim(),
      limiteTotal: Number(newCard.limiteTotal),
      diaFechamento: `${ano}-${mes}-${diaFechamentoFormatado}T00:00:00`,
      diaVencimento: `${ano}-${mes}-${diaVencimentoFormatado}T00:00:00`,
      usuarioId: idDoUsuarioLogado
    };

    try {
      if (editingCardId) {
        await axios.put(`http://localhost:8080/cartoes/${editingCardId}`, payload);
      } else {
        await axios.post('http://localhost:8080/cartoes', payload);
      }

      fetchCartoes(); // Atualiza a lista com o ID real do banco
      closeCardModal();
    } catch (error) {
      console.error("Erro ao salvar cartão", error);
      alert("Houve um erro ao salvar o cartão. Verifique o console.");
    }
  }

  // 3. EXCLUIR CARTÃO NO BACK-END
  async function handleDeleteCard() {
    if (!selectedCard || !window.confirm("Deseja realmente excluir este cartão?")) return;

    try {
      await axios.delete(`http://localhost:8080/cartoes/${selectedCard.id}`);

      // Limpa a seleção e busca a lista atualizada
      setSelectedCardId(null);
      fetchCartoes();
      setShowCardMenu(false);
    } catch (error) {
      console.error("Erro ao excluir cartão", error);
    }
  }

  function handlePaymentSubmit(event) {
    event.preventDefault();
    alert("Função de pagamento em desenvolvimento!");
    setShowPaymentModal(false);
  }

  // 4. PAGAR FATURA (Ainda simulado, pois depende de integração com a Conta)
  // Extrai apenas os dois dígitos do dia da data enviada pelo Java (ex: "2026-07-10T00:00:00" -> "10")
  const extrairDia = (valor) => {
    if (!valor) return '';
    if (String(valor).includes('-')) return String(valor).substring(8, 10);
    return valor;
  };

  return (
    <div className={`receita-page ${styles.page}`}>
      <div className="receita-shell">
        <nav className={`${navbarStyles.navbar} navbar navbar-expand-lg navbar-dark sticky-top mb-4`}>
          <Link className={`navbar-brand ${navbarStyles.logo}`} to="/cartao">
            💳 Cartões de Crédito
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#cartaoNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="cartaoNav">
            <ul className={`navbar-nav ms-auto gap-1 py-2 py-lg-0 ${navbarStyles.list}`}>
              {dashboardNavItems.map((item) => (
                <li key={item.path} className="nav-item">
                  <Link className="nav-link" to={item.path}>{item.label}</Link>
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

        {cards.length === 0 ? (
          <div className="receita-empty" style={{ textAlign: 'center', marginTop: '50px' }}>
            <h3>Nenhum cartão cadastrado ainda.</h3>
            <p>Clique em "+ Novo Cartão" para começar a organizar suas faturas.</p>
          </div>
        ) : (
          <>
            {/* O conteúdo do cartão só renderiza se existir pelo menos um cartão (selectedCard) */}
            {selectedCard && (
              <>
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

                  <article className={styles.creditCard} style={{ background: selectedCard.bg || 'linear-gradient(135deg, #0f172a 0%, #4338ca 100%)' }}>
                    <div className={styles.cardTopRow}>
                      <div className={styles.cardMenuWrap}>
                        <button type="button" className={styles.cardMenuButton} onClick={() => setShowCardMenu(!showCardMenu)}>•••</button>
                        {showCardMenu && (
                          <div className={styles.cardMenu}>
                            <button type="button" onClick={openEditCardModal}>Editar cartão</button>
                            <button type="button" className={styles.cardMenuDelete} onClick={handleDeleteCard}>Excluir cartão</button>
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
                        <p className={styles.cardValue}>Dia {extrairDia(selectedCard.diaFechamento || selectedCard.fechamento)}</p>
                        <p className={styles.cardLabel}>Vencimento</p>
                        <p className={styles.cardValue}>Dia {extrairDia(selectedCard.diaVencimento || selectedCard.vencimento)}</p>
                      </div>
                    </div>
                  </article>
                </section>

                <section className={styles.summaryCard}>
                  <div className={styles.summaryHeader}>
                    <div>
                      <p className={styles.summaryKicker}>Fatura atual</p>
                      <h2>{formatCurrency(selectedCard.faturaAtual || 0)}</h2>
                    </div>
                    <span className={`${styles.statusBadge} ${(selectedCard.status || 'Aberta').toLowerCase() === 'atrasada' ? styles.statusDanger : ''}`}>
                      {selectedCard.status || 'Aberta'}
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
                    <span>Fechamento: dia {extrairDia(selectedCard.diaFechamento)}</span>
                    <span>Vencimento: dia {extrairDia(selectedCard.diaVencimento)}</span>
                  </div>
                </section>

                <section className={styles.actionsRow}>
                  <button className="btn_comecar" onClick={() => setShowPaymentModal(true)} disabled={(selectedCard.faturaAtual || 0) === 0}>
                    Pagar Fatura
                  </button>
                </section>

                <section className={styles.extratoPanel}>
                  <div className={styles.extratoHeader}>
                    <div>
                      <p className={styles.summaryKicker}>Extrato da fatura</p>
                      <h3>Lançamentos</h3>
                    </div>
                    <div className={styles.periodSelector}>
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
                            <span className={styles.extratoIcon}>{item.icon}</span>
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
              </>
            )}
          </>
        )}
      </div>

      {/* MODAL NOVO/EDITAR CARTÃO */}
      {showCardModal && (
        <div className={styles.modalOverlay} role="dialog">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3>{editingCardId ? 'Editar cartão' : 'Novo cartão'}</h3>
              <button type="button" className={styles.modalClose} onClick={closeCardModal}>✕</button>
            </div>
            <form className={styles.modalForm} onSubmit={handleCreateCard}>
              <label className={styles.field}>
                <span>Nome do Cartão</span>
                <input type="text" value={newCard.nome} onChange={(e) => setNewCard((prev) => ({ ...prev, nome: e.target.value }))} placeholder="Ex: Cartão Nubank" required />
              </label>
              <label className={styles.field}>
                <span>Limite Total (R$)</span>
                <input type="number" min="0" step="0.01" value={newCard.limiteTotal} onChange={(e) => setNewCard((prev) => ({ ...prev, limiteTotal: e.target.value }))} placeholder="5000.00" required />
              </label>
              <div className={styles.inlineFields}>
                <label className={styles.field}>
                  <span>Dia de Fechamento</span>
                  <input type="number" min="1" max="31" value={newCard.fechamento} onChange={(e) => setNewCard((prev) => ({ ...prev, fechamento: e.target.value }))} placeholder="10" required />
                </label>
                <label className={styles.field}>
                  <span>Dia de Vencimento</span>
                  <input type="number" min="1" max="31" value={newCard.vencimento} onChange={(e) => setNewCard((prev) => ({ ...prev, vencimento: e.target.value }))} placeholder="25" required />
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
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="payment-modal-title">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3 id="payment-modal-title">Pagar fatura</h3>
              <button type="button" className={styles.modalClose} onClick={() => setShowPaymentModal(false)} aria-label="Fechar">✕</button>
            </div>
            <form className={styles.modalForm} onSubmit={handlePaymentSubmit}>
              <label className={styles.field}>
                <span>Tipo de pagamento</span>
                <select value={paymentType} onChange={(event) => setPaymentType(event.target.value)}>
                  <option value="total">Valor total</option>
                  <option value="parcial">Outro valor</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>Conta de origem</span>
                <select
                  value={paymentForm.conta}
                  onChange={(event) => setPaymentForm((currentForm) => ({ ...currentForm, conta: event.target.value }))}
                >
                  {contasOrigem.map((conta) => <option key={conta} value={conta}>{conta}</option>)}
                </select>
              </label>
              <label className={styles.field}>
                <span>Valor (R$)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={paymentType === 'total' ? selectedCard?.faturaAtual || '' : paymentValue}
                  readOnly={paymentType === 'total'}
                  onChange={(event) => {
                    setPaymentValue(event.target.value);
                    setPaymentForm((currentForm) => ({ ...currentForm, valor: event.target.value }));
                  }}
                />
              </label>
              <div className={styles.modalActions}>
                <button type="button" className="headerButton" onClick={() => setShowPaymentModal(false)}>Cancelar</button>
                <button type="submit" className="btn_comecar">Confirmar pagamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cartao;
