import style from './card.module.css'

function Card() {


    return (

        <section className={style.featureSection}>
            <div className="container">
                <div className="row mb-4">
                    <div className="col-12">
                        <h2 className={style.sectionTitle}>Funcionalidades Principais</h2>
                    </div>
                </div>

                <div className="row g-4">
            
                    <div className="col-12 col-md-6 col-lg-4">
                        <div className={style.featureCard}>
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
                        <div className={style.featureCard}>
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
                        <div className={style.featureCard}>
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
    )
}
export default Card