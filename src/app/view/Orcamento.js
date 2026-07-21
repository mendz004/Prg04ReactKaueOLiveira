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

// Ícones padrão por categoria (caso o orçamento não possua)
const categoryIcons = {
  TRANSPORTE: '🚗',
  LAZER: '🎉',
  ALIMENTACAO: '🥗',
  SAUDE: '💊',
  EDUCACAO: '📚',
  OUTROS: '🏷️'
};

function Orcamento() {
  const [orcamentos, setOrcamentos] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Busca Orçamentos e Despesas da API Spring Boot
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resOrcamentos, resDespesas] = await Promise.allSettled([
          api.get('/orcamentos'),
          api.get('/despesas')
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

    fetchData();
  }, []);

  // --- CÁLCULO DINÂMICO DE GASTOS POR CATEGORIA ---
  const orcamentosComGastos = useMemo(() => {
    return orcamentos.map((orc) => {
      const catOrcamento = (orc.categoria || orc.nome || '').toUpperCase();

      // Soma todas as despesas que pertencem a esta mesma categoria
      const gastoTotal = despesas
        .filter((d) => {
          const catDespesa = (d.categoria || d.origem || '').toUpperCase();
          return catDespesa === catOrcamento;
        })
        .reduce((sum, d) => sum + Number(d.valor || 0), 0);

      const limite = Number(orc.limite || orc.valorLimite || 0);
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

  // Totais do Topo/Banner
  const totalGasto = useMemo(() => {
    return orcamentosComGastos.reduce((acc, item) => acc + item.gasto, 0);
  }, [orcamentosComGastos]);

  const totalLimite = useMemo(() => {
    return orcamentosComGastos.reduce((acc, item) => acc + item.limite, 0);
  }, [orcamentosComGastos]);

  const totalPercent = totalLimite > 0 ? Math.round((totalGasto / totalLimite) * 100) : 0;
  const totalDisponivel = totalLimite - totalGasto;

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
        <h2>Limites por categoria</h2>
        <p>Acompanhe seus gastos em tempo real.</p>
      </div>

      {/* LISTA DE CARDS POR CATEGORIA */}
      {loading ? (
        <p className={style.loadingText}>Carregando orçamentos...</p>
      ) : (
        <div className={style.cardsGrid || style.grid}>
          {orcamentosComGastos.map((item) => (
            <div key={item.id || item.categoriaFormatted} className={style.card || style.categoryCard}>
              <div className={style.cardHeader}>
                <div className={style.categoryMeta}>
                  <div className={style.iconCircle}>{item.icon}</div>
                  <h3>{item.categoriaFormatted}</h3>
                </div>
                <button type="button" className={style.optionsBtn}>•••</button>
              </div>

              <p className={style.cardSubtext}>
                {item.gasto === 0
                  ? 'Você ainda não gastou nada aqui. ✨'
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
    </div>
  );
}

export default Orcamento;