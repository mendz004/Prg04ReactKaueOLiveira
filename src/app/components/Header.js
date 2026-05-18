import style from './Header.module.css'
function Header() {

    return (
        <div>
            <header>
                <section className={style.heroSection}>
                    <div className="container">
                        <div className="row">
                            <div className="col-12 col-md-10 col-lg-8">
                                <h1><span style={{ color: 'var(--cor-01)' }}>Bem-vindo</span> ao seu Gestor de Finanças Pessoais
                                </h1>
                                <p className={style.descricao}>Organize suas finanças de forma simples e prática. Registre receitas,
                                    acompanhe
                                    despesas e tenha uma visão clara de para onde seu dinheiro está indo.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </header>
        </div>
    )
}

export default Header