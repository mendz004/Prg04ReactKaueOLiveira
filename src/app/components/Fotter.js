import style from './fotter.module.css'

function Fotter() {

    return (
        <footer className={style.fotter}>
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        <p>&copy; 2026 Gestor de Finanças Pessoais. Todos os direitos reservados.</p>
                        <p>Desenvolvido para ajudar você a controlar suas finanças.</p>
                    </div>
                </div>
            </div>
        </footer>

    )
}

export default Fotter
