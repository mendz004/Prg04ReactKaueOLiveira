import 'bootstrap/dist/css/bootstrap.min.css';
import style from './navBar.module.css';

import { Link } from 'react-router-dom';

function NavBar() {

    return (

        <nav
            className={`${style.navbar} navbar navbar-expand-lg navbar-dark sticky-top`}
        >

            <Link
                className={`navbar-brand ${style.logo}`}
                to="/"
            >
                💰 Gestor de Finanças
            </Link>

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
                        <Link
                            className="nav-link"
                            to="/atividade03"
                        >
                            Atividade 03
                        </Link>
                    </li>

                    <li className="nav-item">
                        <Link
                            className="nav-link"
                            to="/atividade04"
                        >
                            Atividade 04
                        </Link>
                    </li>

                    <li className="nav-item">
                        <Link
                            className="nav-link"
                            to="/atividade05"
                        >
                            Atividade 05
                        </Link>
                    </li>

                    <li className="nav-item">
                        <Link
                            className="nav-link"
                            to="/usuarios"
                        >
                            Tabela Usuários
                        </Link>
                    </li>

                </ul>

            </div>

        </nav>
    );
}

export default NavBar;