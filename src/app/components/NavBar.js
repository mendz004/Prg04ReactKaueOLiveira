
import style from './navBar.module.css';

function NavBar({ onOpenLogin, onOpenRegister }) {

    return (

        <nav
            className={`${style.navbar} navbar navbar-expand-lg navbar-dark sticky-top`}
        >

            <a
                className={`navbar-brand ${style.logo}`}
                href="/"
            >
                💰 Gestor de Finanças
            </a>

            <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <span className="navbar-toggler-icon"></span>
            </button>

            <div
                className="collapse navbar-collapse"
                id="navbarNav"
            >

                <ul
                    className={`navbar-nav ms-auto gap-1 py-2 py-lg-0 ${style.list}`}
                >
                    <li className="nav-item">
                        <button
                            type="button"
                            className="nav-link border-0 bg-transparent"
                            aria-label="Abrir formulário de cadastro"
                            onClick={onOpenRegister}
                        >
                            Comece agora
                        </button>
                    </li>

                    <li className="nav-item">
                        <button
                            type="button"
                            className="nav-link border-0 bg-transparent"
                            aria-label="Abrir formulário de acesso"
                            onClick={onOpenLogin}
                        >
                            Acessar
                        </button>
                    </li>
                </ul>

            </div>

        </nav>
    );
}

export default NavBar;