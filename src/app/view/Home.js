
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../index.css'
import '../../styles/buttons.css'
import Form from "../components/Form";
import '../../styles/elements.css'
import { useState } from "react"

function Home() {

    const [showForm, setShowForm] = useState(false)
    const [formMode, setFormMode] = useState('login')

    const openLoginForm = () => {
        setFormMode('login')
        setShowForm(true)
    }

    const openRegisterForm = () => {
        setFormMode('register')
        setShowForm(true)
    }

    return (
        <div>
            <header>
                <section className="heroSection">
                    <div className="container">
                        <div className="row">
                            <div className="col-12 col-md-10 col-lg-8">
                                <h1><span className="span">Bem-vindo</span> ao seu Gestor de Finanças Pessoais
                                </h1>
                                <p className="descricao">Organize suas finanças de forma simples e prática. Registre receitas,
                                    acompanhe
                                    despesas e tenha uma visão clara de para onde seu dinheiro está indo.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </header>

            <section>
                <div className="container text-center my-4">
                    {!showForm && (
                        <div className="d-flex justify-content-center gap-3 flex-wrap">
                            <button type="button" className="btn_acessar" onClick={openLoginForm}>
                                Acessar
                            </button>
                            <button type="button" className="btn_comecar" onClick={openRegisterForm}>
                                Comece agora
                            </button>
                        </div>
                    )}
                </div>

                {showForm && <Form mode={formMode} onClose={() => setShowForm(false)} />}

            </section>

            <section className="featureSection">
                <div className="container">
                    <div className="row mb-4">
                        <div className="col-12">
                            <h2 className="sectionTitle">Funcionalidades Principais</h2>
                        </div>
                    </div>

                    <div className="row g-4">

                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="featureCard">
                                <h3>📊 Gestão de Transações</h3>
                                <ul>
                                    <li><strong>Cadastro de Transações:</strong> Adicione receitas e despesas facilmente.
                                    </li>
                                    <li><strong>Listagem Dinâmica:</strong> Visualize todas as transações em tempo real.
                                    </li>
                                    <li><strong>Exclusão de Itens:</strong> Remova transações indesejadas com um clique.
                                    </li>
                                </ul>
                            </div>
                        </div>


                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="featureCard">
                                <h3>🧮 Painel de Cálculos</h3>
                                <ul>
                                    <li><strong>Cálculo de Totais:</strong> Soma automática de receitas e despesas.</li>
                                    <li><strong>Saldo Atualizado:</strong> Veja seu saldo atual instantaneamente.</li>
                                    <li><strong>Destaque Visual:</strong> Indicadores visuais para entradas e saídas.</li>
                                    <li><strong>Relatórios Simples:</strong> Visão geral mensal dos seus gastos.</li>
                                </ul>
                            </div>
                        </div>


                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="featureCard">
                                <h3>💾 Persistência de Dados</h3>
                                <ul>
                                    <li><strong>Armazenamento Local:</strong> Dados salvos no dispositivo do usuário.</li>
                                    <li><strong>Sincronização:</strong> Atualização automática dos dados em todos os
                                        dispositivos.</li>
                                    <li><strong>Segurança:</strong> Seus dados permanecem privados e protegidos.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home