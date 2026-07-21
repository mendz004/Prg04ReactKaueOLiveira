import { useMemo, useState, useEffect } from 'react';

import { Link } from 'react-router-dom';

import { api } from '../../api/Api';

import '../../styles/receita.css';

import '../../styles/buttons.css';

import navbarStyles from '../components/navBar.module.css';



const categorias = ['SALARIO', 'RENDIMENTOS', 'FREELANCE', 'PRESENTE', 'OUTROS'];

const dashboardNavItems = [

  { label: 'Dashboard', path: '/dashboard' },

  { label: 'Despesa', path: '/despesa' },

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

  }).format(value);

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

    if (partes.length === 3) {

      return `${partes[2]}/${partes[1]}/${partes[0]}`;

    }

    return "--/--/----";

  }



  return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

};



function Receita() {

  const [receitas, setReceitas] = useState([]);

  const [contasDisponiveis, setContasDisponiveis] = useState([]);



  const [search, setSearch] = useState('');

  const [mesSelecionado, setMesSelecionado] = useState('2026-07');

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({

    descricao: '',

    data: new Date().toISOString().slice(0, 10),

    categoria: 'SALÁRIO',

    conta: '',

    valor: ''

  });

  const [editingId, setEditingId] = useState(null);



  useEffect(() => {

    async function carregarDados() {

      try {

        const responseReceitas = await api.get('/receitas');

        setReceitas(responseReceitas.data);

      } catch (error) {

        console.error("Endpoint de Receitas ainda não existe ou deu erro (404):", error);

      }



      try {

        const responseContas = await api.get('/contas');

        setContasDisponiveis(responseContas.data);

      } catch (error) {

        console.error("Erro ao buscar contas:", error);

      }

    }

    carregarDados();

  }, []);



  const receitasFiltradas = useMemo(() => {

    return receitas.filter((item) => {

      // Usamos uma verificação de segurança (item.data ?) para evitar o erro de null

      const dataValida = item.data || "";

      const descricaoValida = item.descricao || "";



      const matchesMonth = dataValida.startsWith(mesSelecionado);

      const matchesSearch = descricaoValida.toLowerCase().includes(search.toLowerCase());



      return matchesMonth && matchesSearch;

    });

  }, [receitas, search, mesSelecionado]);



  const totalRecebido = useMemo(() => {

    return receitasFiltradas.reduce((sum, item) => sum + item.valor, 0);

  }, [receitasFiltradas]);



  const handleSubmit = async (event) => {

    event.preventDefault();



    if (!form.descricao.trim() || !form.valor || !form.conta) {

      alert("Por favor, preencha todos os campos obrigatórios.");

      return;

    }



    const payload = {

      descricao: form.descricao.trim(),

      data: form.data + "T00:00:00",

      origem: form.categoria,

      contaId: Number(form.conta), // Salva o ID da conta selecionada

      valor: Number(form.valor),

    };



    try {

      if (editingId) {

        const response = await api.put(`/receitas/${editingId}`, payload);

        setReceitas((prev) => prev.map((item) => (item.id === editingId ? response.data : item)));

      } else {

        const response = await api.post('/receitas', payload);

        setReceitas((prev) => [response.data, ...prev]);

      }



      setShowModal(false);

      setEditingId(null);

      setForm({

        descricao: '',

        data: new Date().toISOString().slice(0, 10),

        categoria: 'SALÁRIO',

        conta: '',

        valor: ''

      });

    } catch (error) {

      console.error("Erro ao salvar receita:", error);

      alert("Ocorreu um erro ao salvar a receita.");

    }

  };



  // Função para retornar um ícone/emoji baseado na categoria da receita

  const getCategoryIcon = (categoria) => {

    switch (categoria?.toUpperCase()) {

      case 'SALARIO':

      case 'SALÁRIO':

        return '💰';

      case 'FREELANCE':

        return '💻';

      case 'PRESENTE':

        return '🎁';

      case 'INVESTIMENTO':

        return '📈';

      default:

        return '💵'; // Ícone padrão para outras categorias

    }

  };



  const openCreate = () => {

    setEditingId(null);

    setForm({

      descricao: '',

      data: new Date().toISOString().slice(0, 10),

      categoria: 'SALÁRIO',

      conta: '',

      valor: ''

    });

    setShowModal(true);

  };



  const openEdit = (item) => {

    setEditingId(item.id);

    setForm({

      descricao: item.descricao,

      data: item.data,

      categoria: item.categoria,

      conta: item.conta,

      valor: String(item.valor)

    });

    setShowModal(true);

  };



  const handleDelete = async (id) => {

    if (!window.confirm("Tem certeza que deseja excluir esta receita?")) return;



    try {

      await api.delete(`/receitas/${id}`);

      setReceitas((prev) => prev.filter((item) => item.id !== id));

    } catch (error) {

      console.error("Erro ao deletar receita:", error);

      alert("Ocorreu um erro ao deletar a receita.");

    }

  };



  return (

    <div className="receita-page">

      <div className="receita-shell">

        <nav className={`${navbarStyles.navbar} navbar navbar-expand-lg navbar-dark sticky-top mb-4`}>

          <Link className={`navbar-brand ${navbarStyles.logo}`} to="/receita">

            💸 Receitas

          </Link>



          <button

            className="navbar-toggler"

            type="button"

            data-bs-toggle="collapse"

            data-bs-target="#receitaNav"

            aria-controls="receitaNav"

            aria-expanded="false"

            aria-label="Toggle navigation"

          >

            <span className="navbar-toggler-icon"></span>

          </button>



          <div className="collapse navbar-collapse" id="receitaNav">

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

            <p className="receita-kicker">Entradas de dinheiro</p>

            <h1>Minhas Receitas</h1>

          </div>



          <div className="receita-header-actions">

            <select className="receita-select" value={mesSelecionado} onChange={(event) => setMesSelecionado(event.target.value)}>

              <option value="2026-07">Julho 2026</option>

              <option value="2026-06">Junho 2026</option>

              <option value="2026-05">Maio 2026</option>

            </select>

            <button className="headerButton" onClick={openCreate}>+ Nova Receita</button>

          </div>

        </header>



        <section className="receita-summary-card">

          <p className="receita-summary-label">Total recebido</p>

          <p className="receita-summary-value">{formatCurrency(totalRecebido)}</p>

          <p className="receita-summary-foot">No período selecionado · {receitasFiltradas.length} entradas</p>

          <div className="summaryOrb" />

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

          {receitasFiltradas.length === 0 ? (

            <div className="receita-empty">Nenhuma receita encontrada para este mês.</div>

          ) : (

            receitasFiltradas.map((item) => (

              <article key={item.id} className="receita-item">

                <div className="receita-item-main">



                  {/* 1. ÍCONE ATUALIZADO: Agora chama a função com base na categoria */}

                  <div className="receita-badge" aria-hidden="true">

                    {getCategoryIcon(item.categoria)}

                  </div>



                  <div className="receita-info">

                    <div className="receita-title-row">

                      <h3>{item.descricao}</h3>

                      <span className="receita-value">{formatCurrency(item.valor)}</span>

                    </div>



                    {/* 2. METADADOS ATUALIZADOS: Apenas data e categoria (item.conta removido) */}

                    <div className="receita-meta">

                      {formatDate(item.data)} · {item.categoria}

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

              <h2>{editingId ? 'Editar Receita' : 'Nova Receita'}</h2>

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

                  placeholder="Ex: Venda da bicicleta"

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

                <label htmlFor="categoria">Categoria</label>

                <select id="categoria" value={form.categoria} onChange={(event) => setForm((prev) => ({ ...prev, categoria: event.target.value }))}>

                  {categorias.map((categoria) => (

                    <option key={categoria} value={categoria}>{categoria}</option>

                  ))}

                </select>

              </div>



              <div className="receita-field">

                <label htmlFor="conta">Conta de Destino</label>

                <select id="conta" value={form.conta} onChange={(event) => setForm((prev) => ({ ...prev, conta: event.target.value }))} required>

                  <option value="" disabled>Selecione uma conta...</option>

                  { }

                  {contasDisponiveis.map((conta) => (

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

        </div>

      )}

    </div>

  );

}



export default Receita; 

