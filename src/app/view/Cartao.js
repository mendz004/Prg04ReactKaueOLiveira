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

const periodos = [{ value: 'atual', label: 'Fatura atual' }];
const CARD_GRADIENT_FALLBACK = 'linear-gradient(135deg, #0f172a 0%, #29348a 52%, #4338ca 100%)';

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}

// Extrai apenas os dois dígitos do dia (ex: "2026-07-10T00:00:00" -> "10")
const extrairDia = (valor) => {
  if (!valor) return '';
  const str = String(valor);
  if (str.includes('-')) {
    const partes = str.split('T')[0].split('-');
    if (partes.length === 3) return partes[2];
  }
  return str;
};

// Formata data ISO para o padrão brasileiro DD/MM/AAAA
const formatarDataBR = (valor) => {
  if (!valor) return '';
  const str = String(valor);
  if (str.includes('T')) {
    const [dataPart] = str.split('T');
    const [ano, mes, dia] = dataPart.split('-');
    return `${dia}/${mes}/${ano}`;
  }
  return str;
};

function Cartao() {
  const [cards, setCards] = useState([]);
  const [contasOrigem, setContasOrigem] = useState([]); // Busca do back-end
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
  const [paymentForm, setPaymentForm] = useState({ contaId: '', valor: '' });

  // 1. BUSCAR CARTÕES E CONTAS DO BACK-END
  const fetchCartoes = useCallback(async () => {
    const usuarioStorage = localStorage.getItem('usuarioAppFinanceiro');
    if (!usuarioStorage) return;
    const usuarioLogado = JSON.parse(usuarioStorage);
    if (!usuarioLogado?.token) return;

    const config = { headers: { Authorization: `Bearer ${usuarioLogado.token}` } };

    try {
      const response = await axios.get('http://localhost:8080/cartoes', config);
      
      let dados = response.data;
      if (typeof dados === 'string') {
        try {
          dados = JSON.parse(dados);
        } catch (e) {
          console.error("Erro ao converter cartões:", e);
          dados = [];
        }
      }

      const listaCartoes = Array.isArray(dados) ? dados : (dados.content || []);
      setCards(listaCartoes);

      if (listaCartoes.length > 0) {
        setSelectedCardId((currentCardId) => currentCardId ?? listaCartoes[0].id);
      }
    } catch (error) {
      console.error("Erro ao buscar cartões do back-end", error);
    }
  }, []);

  const fetchContas = useCallback(async () => {
    const usuarioStorage = localStorage.getItem('usuarioAppFinanceiro');
    if (!usuarioStorage) return;
    const usuarioLogado = JSON.parse(usuarioStorage);
    const config = { headers: { Authorization: `Bearer ${usuarioLogado.token}` } };

    try {
      const response = await axios.get('http://localhost:8080/contas', config);
      const listaContas = Array.isArray(response.data) ? response.data : (response.data.content || []);
      setContasOrigem(listaContas);
      
      if (listaContas.length > 0) {
        setPaymentForm(prev => ({ ...prev, contaId: listaContas[0].id }));
      }
    } catch (error) {
      console.error("Erro ao buscar contas", error);
    }
  }, []);

  useEffect(() => {
    fetchCartoes();
    fetchContas();
  }, [fetchCartoes, fetchContas]);

  const selectedCard = useMemo(() => {
    if (cards.length === 0) return null;
    return cards.find((card) => card.id === selectedCardId) || cards[0];
  }, [cards, selectedCardId]);

  // Pega as despesas do cartão
  const despesasDoCartao = useMemo(() => {
    if (!selectedCard) return [];
    return selectedCard.despesas || selectedCard.lancamentos || [];
  }, [selectedCard]);

  // Calcula a soma da fatura atual em tempo real
  const faturaAtual = useMemo(() => {
    return despesasDoCartao.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
  }, [despesasDoCartao]);

  const limiteDisponivel = selectedCard ? (selectedCard.limiteTotal || 0) - faturaAtual : 0;
  
  const percentualUso = selectedCard && selectedCard.limiteTotal
    ? Math.min(100, Math.round((faturaAtual / selectedCard.limiteTotal) * 100))
    : 0;

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
      nome: selectedCard.nome || '',
      limiteTotal: String(selectedCard.limiteTotal || ''),
      fechamento: extrairDia(selectedCard.diaFechamento || selectedCard.fechamento),
      vencimento: extrairDia(selectedCard.diaVencimento || selectedCard.vencimento)
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
  async function handleCreateCard(event) {
    event.preventDefault();

    if (!newCard.nome.trim() || !newCard.limiteTotal || !newCard.fechamento || !newCard.vencimento) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    const usuarioStorage = localStorage.getItem('usuarioAppFinanceiro');
    if (!usuarioStorage) {
      alert("Sessão expirada. Faça login novamente.");
      return;
    }

    const usuarioLogado = JSON.parse(usuarioStorage);
    if (!usuarioLogado || !usuarioLogado.token) {
      alert("Erro: Você precisa estar logado para cadastrar um cartão!");
      return;
    }

    const config = { headers: { Authorization: `Bearer ${usuarioLogado.token}` } };

    const dataAtual = new Date();
    const ano = dataAtual.getFullYear();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');

    const diaFechamentoFormatado = String(newCard.fechamento).padStart(2, '0');
    const diaVencimentoFormatado = String(newCard.vencimento).padStart(2, '0');

    const idDoUsuarioLogado = usuarioLogado.id || usuarioLogado.usuarioId || null;

    const payload = {
      nome: newCard.nome.trim(),
      limiteTotal: Number(newCard.limiteTotal),
      diaFechamento: `${ano}-${mes}-${diaFechamentoFormatado}T00:00:00`,
      diaVencimento: `${ano}-${mes}-${diaVencimentoFormatado}T00:00:00`,
      usuarioId: idDoUsuarioLogado
    };

    try {
      if (editingCardId) {
        await axios.put(`http://localhost:8080/cartoes/${editingCardId}`, payload, config);
      } else {
        await axios.post('http://localhost:8080/cartoes', payload, config);
      }

      fetchCartoes();
      closeCardModal();
    } catch (error) {
      console.error("Erro ao salvar cartão", error);
      alert("Houve um erro ao salvar o cartão. Verifique se a sessão expirou.");
    }
  }

  // 3. EXCLUIR CARTÃO NO BACK-END
  async function handleDeleteCard() {
    if (!selectedCard || !window.confirm("Deseja realmente excluir este cartão?")) return;

    const usuarioStorage = localStorage.getItem('usuarioAppFinanceiro');
    if (!usuarioStorage) return;
    const usuarioLogado = JSON.parse(usuarioStorage);
    const config = { headers: { Authorization: `Bearer ${usuarioLogado.token}` } };

    try {
      await axios.delete(`http://localhost:8080/cartoes/${selectedCard.id}`, config);
      setSelectedCardId(null);
      fetchCartoes();
      setShowCardMenu(false);
    } catch (error) {
      console.error("Erro ao excluir cartão", error);
    }
  }

  // 4. PAGAR FATURA
  async function handlePaymentSubmit(event) {
    event.preventDefault();

    if (!paymentForm.contaId) {
      alert("Por favor, selecione uma conta de origem.");
      return;
    }

    const valorDoPagamento = paymentType === 'total' ? faturaAtual : Number(paymentValue);

    if (valorDoPagamento <= 0) {
      alert("O valor do pagamento deve ser maior que zero.");
      return;
    }

    const usuarioStorage = localStorage.getItem('usuarioAppFinanceiro');
    const usuarioLogado = JSON.parse(usuarioStorage);
    const config = { headers: { Authorization: `Bearer ${usuarioLogado.token}` } };

    const payload = {
      contaId: paymentForm.contaId,
      valor: valorDoPagamento
    };

    try {
      await axios.post(`http://localhost:8080/cartoes/${selectedCard.id}/pagar-fatura`, payload, config);
      alert("Fatura paga com sucesso!");
      setShowPaymentModal(false);
      setPaymentValue('');
      fetchCartoes(); // Atualiza a tela para mostrar a fatura zerada e o limite restaurado
      fetchContas(); // Atualiza o saldo das contas
    } catch (error) {
      console.error("Erro ao pagar fatura:", error);
      alert(error.response?.data?.message || "Erro ao pagar a fatura. Verifique o saldo da conta.");
    }
  }

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
          <div className={`receita-empty ${styles.emptyWrapper}`}>
            <h3>Nenhum cartão cadastrado ainda.</h3>
            <p>Clique em "+ Novo Cartão" para começar a organizar suas faturas.</p>
          </div>
        ) : (
          <>
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
                        <span
                          className={styles.cardTabDot}
                          style={{ background: card.bg || CARD_GRADIENT_FALLBACK }}
                          aria-hidden="true"
                        />
                        <span className={styles.cardTabName}>{card.nome}</span>
                      </button>
                    ))}
                  </div>

                  <article className={styles.creditCard} style={{ background: selectedCard.bg || CARD_GRADIENT_FALLBACK }}>
                    <div className={styles.cardSheen} aria-hidden="true" />

                    <div className={styles.cardTopRow}>
                      <div className={styles.cardChip} aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </div>

                      <div className={styles.cardMenuWrap}>
                        <button
                          type="button"
                          className={styles.cardMenuButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCardMenu(!showCardMenu);
                          }}
                          aria-label="Mais opções do cartão"
                        >
                          •••
                        </button>
                        {showCardMenu && (
                          <div className={styles.cardMenu}>
                            <button 
                              type="button" 
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                openEditCardModal();
                              }}
                            >
                              Editar cartão
                            </button>
                            <button 
                              type="button" 
                              className={styles.cardMenuDelete} 
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleDeleteCard();
                              }}
                            >
                              Excluir cartão
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.cardMiddle}>
                      <p className={styles.cardBrand}>Cartão de crédito</p>
                      <span className={styles.cardName}>{selectedCard.nome}</span>
                      <p className={styles.cardNumber} aria-hidden="true">•••• •••• •••• ••••</p>
                    </div>

                    <div className={styles.cardFooter}>
                      <div>
                        <p className={styles.cardLabel}>Limite</p>
                        <p className={styles.cardValue}>{formatCurrency(selectedCard.limiteTotal)}</p>
                      </div>
                      <div className={styles.cardDates}>
                        <div>
                          <p className={styles.cardLabel}>Fechamento</p>
                          <p className={styles.cardValue}>Dia {extrairDia(selectedCard.diaFechamento || selectedCard.fechamento)}</p>
                        </div>
                        <div>
                          <p className={styles.cardLabel}>Vencimento</p>
                          <p className={styles.cardValue}>Dia {extrairDia(selectedCard.diaVencimento || selectedCard.vencimento)}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                </section>

                <section className={styles.summaryCard}>
                  <div className={styles.summaryHeader}>
                    <div>
                      <p className={styles.summaryKicker}>Fatura atual</p>
                      <h2>{formatCurrency(faturaAtual)}</h2>
                    </div>
                    <span className={`${styles.statusBadge} ${(selectedCard.status || 'Aberta').toLowerCase() === 'atrasada' ? styles.statusDanger : ''}`}>
                      {selectedCard.status || 'Aberta'}
                    </span>
                  </div>

                  <div className={styles.progressLabelRow}>
                    <span className={styles.progressPercentage}>{percentualUso}% utilizado</span>
                  </div>

                  <div className={styles.progressWrap}>
                    <div className={styles.progressTrack}>
                      <div
                        className={`${styles.progressBar} ${percentualUso >= 90 ? styles.progressDanger : percentualUso >= 70 ? styles.progressWarning : ''}`}
                        style={{ width: `${percentualUso}%` }}
                      />
                    </div>
                    <div className={styles.progressMeta}>
                      <span className={styles.availableText}>Limite disponível: {formatCurrency(limiteDisponivel)}</span>
                      <span>Limite total: {formatCurrency(selectedCard.limiteTotal)}</span>
                    </div>
                  </div>

                  <div className={styles.infoRow}>
                    <span>Fechamento: dia {extrairDia(selectedCard.diaFechamento || selectedCard.fechamento)}</span>
                    <span>Vencimento: dia {extrairDia(selectedCard.diaVencimento || selectedCard.vencimento)}</span>
                  </div>
                </section>

                <section className={styles.actionsRow}>
                  <button className="btn_comecar" onClick={() => setShowPaymentModal(true)} disabled={faturaAtual === 0}>
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
                    {despesasDoCartao.length === 0 ? (
                      <div className={styles.emptyState}>Nenhum lançamento para este período.</div>
                    ) : (
                      despesasDoCartao.map((item) => (
                        <article key={item.id} className={styles.extratoItem}>
                          <div className={styles.extratoItemMain}>
                            <span className={styles.extratoIcon}>{item.icon || '🛍️'}</span>
                            <div>
                              <p className={styles.extratoTitle}>{item.descricao}</p>
                              <p className={styles.extratoMeta}>
                                <span>{formatarDataBR(item.data)}</span>
                                {item.categoria && <span className={styles.extratoCategoria}>{item.categoria}</span>}
                              </p>
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

      {/* MODAL PAGAR FATURA */}
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
                  value={paymentForm.contaId}
                  onChange={(event) => setPaymentForm((currentForm) => ({ ...currentForm, contaId: event.target.value }))}
                  required
                >
                  <option value="">Selecione uma conta...</option>
                  {contasOrigem.map((conta) => (
                    <option key={conta.id} value={conta.id}>
                      {conta.nome || conta.descricao} (Saldo: {formatCurrency(conta.saldoAtual)})
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>Valor (R$)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={paymentType === 'total' ? faturaAtual : paymentValue}
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