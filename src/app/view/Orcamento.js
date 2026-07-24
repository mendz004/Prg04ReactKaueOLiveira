import React, { useState, useEffect, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import style from './orcamento.module.css';
import { api } from '../../api/Api';

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Receita', path: '/receita' },
  { label: 'Despesa', path: '/despesa' },
  { label: 'Conta', path: '/conta' },
  { label: 'Cartão', path: '/cartao' },
  { label: 'Objetivo', path: '/objetivo' },
  { label: 'Orçamento', path: '/orcamento' },
  { label: 'Relatório', path: '/relatorio' }
];

// Ícones padrão por categoria
const categoryIcons = {
  TRANSPORTE: '🚗',
  LAZER: '🎉',
  ALIMENTACAO: '🥗',
  SAUDE: '💊',
  EDUCACAO: '📚',
  OUTROS: '🏷️'
};

const categorias = ['ALIMENTACAO', 'TRANSPORTE', 'SAUDE', 'LAZER', 'EDUCACAO', 'MORADIA', 'INVESTIMENTOS', 'OUTROS'];
const dataAtual = new Date();

const formInicial = {
  categoria: 'ALIMENTACAO',
  limite: '',
  mes: String(dataAtual.getMonth() + 1),
  ano: String(dataAtual.getFullYear()),
  valorGasto: '0'
};

function Orcamento() {
  const [orcamentos, setOrcamentos] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [menuAbertoId, setMenuAbertoId] = useState(null);
  const [form, setForm] = useState(formInicial);

  // Busca Orçamentos e Despesas da API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const usuarioStorage = localStorage.getItem('usuarioAppFinanceiro');
    if (!usuarioStorage) {
      setLoading(false);
      return;
    }
    const usuarioLogado = JSON.parse(usuarioStorage);
    if (!usuarioLogado?.token) {
      setLoading(false);
      return;
    }

    const config = { headers: { Authorization: `Bearer ${usuarioLogado.token}` } };

    try {
      const [resOrcamentos, resDespesas] = await Promise.allSettled([
        api.get('/orcamentos', config),
        api.get('/despesas', config)
      ]);

      if (resOrcamentos.status === 'fulfilled') {
        setOrcamentos(Array.isArray(resOrcamentos.value.data) ? resOrcamentos.value.data : []);
      }
      if (resDespesas.status === 'fulfilled') {
        setDespesas(Array.isArray(resDespesas.value.data) ? resDespesas.value.data : []);
      }
    } catch (error) {
      console.error("Erro ao carregar orçamentos e despesas:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- CÁLCULO DINÂMICO DE GASTOS POR CATEGORIA ---
  const orcamentosComGastos = useMemo(() => {
    return orcamentos.map((orc) => {
      const catOrcamento = (orc.categoria || orc.nome || '').toUpperCase();

      // Soma todas as despesas vinculadas a esta categoria
      const gastoCalculado = despesas
        .filter((d) => {
          const catDespesa = (d.categoria || d.origem || '').toUpperCase();
          return catDespesa === catOrcamento;
        })
        .reduce((sum, d) => sum + Number(d.valor || 0), 0);

      const gastoTotal = Number(orc.valorAtual ?? orc.valorGasto ?? orc.gasto ?? gastoCalculado);
      const limite = Number(orc.valorLimite ?? orc.limite ?? 0);
      const percent = limite > 0 ? Math.min(100, Math.round((gastoTotal / limite) * 100)) : 0;
      const disponivel = limite - gastoTotal;
      const icon = categoryIcons[catOrcamento] || '📊';

      return {
        ...orc,
        categoriaFormatted: catOrcamento,
        gasto: gastoTotal,
        limite,
        percent,
        disponivel,
        icon
      };
    });
  }, [orcamentos, despesas]);

  // Totais do Topo
  const totalGasto = useMemo(() => {
    return orcamentosComGastos.reduce((acc, item) => acc + item.gasto, 0);
  }, [orcamentosComGastos]);

  const totalLimite = useMemo(() => {
    return orcamentosComGastos.reduce((acc, item) => acc + item.limite, 0);
  }, [orcamentosComGastos]);

  const totalPercent = totalLimite > 0 ? Math.round((totalGasto / totalLimite) * 100) : 0;
  const totalDisponivel = totalLimite - totalGasto;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.limite || Number(form.limite) <= 0 || !form.mes || !form.ano) return;

    const usuarioStorage = localStorage.getItem('usuarioAppFinanceiro');
    if (!usuarioStorage) {
      alert("Sessão expirada. Faça login novamente.");
      return;
    }

    const usuarioLogado = JSON.parse(usuarioStorage);
    if (!usuarioLogado?.token) {
      alert("Você precisa estar logado!");
      return;
    }

    const idDoUsuarioLogado = usuarioLogado.id || usuarioLogado.usuarioId || null;
    const config = { headers: { Authorization: `Bearer ${usuarioLogado.token}` } };

    // Payload idêntico ao OrcamentoPostDto, com o ID incluso
    const payload = {
      id: editingId, // <-- O ID agora é enviado
      categoria: form.categoria,
      valorLimite: Number(form.limite),
      valorAtual: Number(form.valorGasto || 0),
      mes: Number(form.mes),
      ano: Number(form.ano),
      usuarioId: idDoUsuarioLogado
    };

    try {
      if (editingId) {
        await api.put(`/orcamentos/${editingId}`, payload, config);
      } else {
        await api.post('/orcamentos', payload, config);
      }
      
      fetchData();
      setForm(formInicial);
      setEditingId(null);
      setShowModal(false);
    } catch (error) {
      console.error('Erro detalhado do Java:', error.response?.data || error);
      alert('Não foi possível salvar o orçamento.');
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(formInicial);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setMenuAbertoId(null);
    const currentId = item.id || item.idOrcamento; // <-- Captura segura do ID
    setEditingId(currentId);
    setForm({
      categoria: item.categoria || item.nome || 'ALIMENTACAO',
      limite: String(item.valorLimite ?? item.limite ?? ''),
      mes: String(item.mes ?? dataAtual.getMonth() + 1),
      ano: String(item.ano ?? dataAtual.getFullYear()),
      valorGasto: String(item.valorAtual ?? item.valorGasto ?? item.gasto ?? '0')
    });
    setShowModal(true);
  };

  const handleDelete = async (item) => {
    setMenuAbertoId(null);

    const currentId = item.id || item.idOrcamento; // <-- Captura segura do ID
    if (!currentId) return;

    if (!window.confirm(`Deseja excluir o orçamento de ${item.categoriaFormatted}?`)) return;

    const usuarioStorage = localStorage.getItem('usuarioAppFinanceiro');
    if (!usuarioStorage) return;

    const usuarioLogado = JSON.parse(usuarioStorage);
    const config = { headers: { Authorization: `Bearer ${usuarioLogado.token}` } };

    try {
      await api.delete(`/orcamentos/${currentId}`, config);
      fetchData(); // Recarrega do banco para garantir consistência
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      alert('Não foi possível excluir o orçamento.');
    }
  };

  return (
    <div className={style.orcamentoPage || style.container}>
      {/* BANNER / HEADER VERDE */}
      <div className={style.banner || style.headerBanner}>
        <div className={style.bannerTop || style.navRow}>
          <div className={style.titleGroup || style.logo}>
            <span className={style.icon}>📊</span>
            <h2>Orçamentos</h2>
          </div>

          <nav className={style.navLinks || style.navbar}>
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className={style.navLink}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className={style.bannerContent || style.bannerBody}>
          <div className={style.statBlock}>
            <h1>{totalPercent}%</h1>
            <span>consumido</span>
          </div>

          <div className={style.divider} />

          <div className={style.infoBlock}>
            <h3>
              R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              <small> de R$ {totalLimite.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</small>
            </h3>
            <p>
              {totalDisponivel >= 0
                ? `Você ainda tem R$ ${totalDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} disponível.`
                : `Você ultrapassou em R$ ${Math.abs(totalDisponivel).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} o limite!`
              }
            </p>
          </div>
        </div>
      </div>

      {/* TÍTULO DA SEÇÃO */}
      <div className={style.sectionHeader}>
        <div>
          <h2>Limites por categoria</h2>
          <p>Acompanhe seus gastos em tempo real.</p>
        </div>
        <button type="button" className={style.newBudgetButton} onClick={openCreate}>
          + Novo orcamento
        </button>
      </div>

      {/* LISTA DE CARDS POR CATEGORIA */}
      {loading ? (
        <p className={style.loadingText}>Carregando orçamentos...</p>
      ) : (
        <div className={style.cardsGrid || style.grid}>
          {orcamentosComGastos.map((item) => (
            <div key={item.id || item.idOrcamento || item.categoriaFormatted} className={style.card || style.categoryCard}>
              <div className={style.cardHeader}>
                <div className={style.categoryMeta}>
                  <div className={style.iconCircle}>{item.icon}</div>
                  <h3>{item.categoriaFormatted}</h3>
                </div>
                <div className={style.menuWrap}>
                  <button
                    type="button"
                    className={style.optionsBtn}
                    onClick={() => setMenuAbertoId((current) => current === (item.id || item.idOrcamento) ? null : (item.id || item.idOrcamento))}
                    aria-label={`Opções do orçamento de ${item.categoriaFormatted}`}
                  >
                    •••
                  </button>
                  {menuAbertoId === (item.id || item.idOrcamento) && (
                    <div className={style.menu}>
                      <button type="button" onClick={() => openEdit(item)}>Editar</button>
                      <button type="button" className={style.deleteOption} onClick={() => handleDelete(item)}>Excluir</button>
                    </div>
                  )}
                </div>
              </div>

              <p className={style.cardSubtext}>
                {item.gasto === 0
                  ? 'Você ainda não gastou nada aqui.'
                  : `Gasto atual: R$ ${item.gasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                }
              </p>

              <div className={style.cardFooter}>
                <div className={style.values}>
                  <strong>R$ {item.gasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  <span> de R$ {item.limite.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <span className={style.percentage}>{item.percent}%</span>
              </div>

              <div className={style.progressTrack}>
                <div
                  className={style.progressBar}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={style.overlay} role="dialog" aria-modal="true" aria-labelledby="orcamento-titulo">
          <form className={style.modal} onSubmit={handleSubmit}>
            <header>
              <div>
                <p>{editingId ? 'EDITAR LIMITE' : 'NOVO LIMITE'}</p>
                <h2 id="orcamento-titulo">{editingId ? 'Editar orçamento' : 'Novo orçamento'}</h2>
              </div>
              <button type="button" onClick={() => setShowModal(false)} aria-label="Fechar">&times;</button>
            </header>
            <label>
              Categoria
              <select value={form.categoria} onChange={(event) => setForm((current) => ({ ...current, categoria: event.target.value }))}>
                {categorias.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
              </select>
            </label>
            <label>
              Limite mensal (R$)
              <input type="number" min="0.01" step="0.01" value={form.limite} onChange={(event) => setForm((current) => ({ ...current, limite: event.target.value }))} required />
            </label>
            <div className={style.formRow}>
              <label>
                Mês
                <input type="number" min="1" max="12" step="1" value={form.mes} onChange={(event) => setForm((current) => ({ ...current, mes: event.target.value }))} required />
              </label>
              <label>
                Ano
                <input type="number" min="2000" step="1" value={form.ano} onChange={(event) => setForm((current) => ({ ...current, ano: event.target.value }))} required />
              </label>
            </div>
            <label>
              Valor gasto (R$)
              <input type="number" min="0" step="0.01" value={form.valorGasto} onChange={(event) => setForm((current) => ({ ...current, valorGasto: event.target.value }))} required />
            </label>
            <footer>
              <button type="button" onClick={() => setShowModal(false)}>Cancelar</button>
              <button type="submit" className={style.newBudgetButton}>Salvar</button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}

export default Orcamento;