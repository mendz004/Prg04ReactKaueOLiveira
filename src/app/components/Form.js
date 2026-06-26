import style from './form.module.css'

function Form({ onClose, mode = 'login' }) {
    const isRegister = mode === 'register'

    function handleSubmit(e) {
        e.preventDefault()

        const nome = document.getElementById('nome')?.value.trim()
        const email = document.getElementById('email').value.trim()
        const senha = document.getElementById('senha').value.trim()
        const campoNome = document.getElementById('campoNome')
        const campoEmail = document.getElementById('campoEmail')
        const campoSenha = document.getElementById('campoSenha')

        let valido = true

        if (isRegister && !nome) {
            campoNome.classList.add(style.erro)
            setTimeout(() => campoNome.classList.remove(style.erro), 800)
            valido = false
        }

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            campoEmail.classList.add(style.erro)
            setTimeout(() => campoEmail.classList.remove(style.erro), 800)
            valido = false
        }

        if (!senha) {
            campoSenha.classList.add(style.erro)
            setTimeout(() => campoSenha.classList.remove(style.erro), 800)
            valido = false
        }

        if (!valido) return

        const btn = document.getElementById('btnEntrar')
        const progress = document.getElementById('mlProgress')
        btn.classList.add(style.loading)
        progress.style.width = '85%'

        setTimeout(() => {
            progress.style.width = '100%'
            setTimeout(() => e.target.submit(), 300)
        }, 1800)
    }

    return (
        <div className={style.ml_overlay} id="mlOverlay" role="dialog" aria-modal="true" aria-labelledby="mlTitulo">
            <div className={style.ml_card}>
                <button className={style.ml_fechar} onClick={onClose} aria-label="Fechar">✕</button>

                <div className={style.ml_inner}>
                    <div className={style.ml_icon_wrap}>💰</div>
                    <h2 className={style.ml_titulo} id="mlTitulo">
                        {isRegister ? 'Criar conta' : 'Entrar na conta'}
                    </h2>
                    <p className={style.ml_subtitulo}>
                        {isRegister ? 'Cadastre-se para começar a organizar suas finanças.' : 'Acesse o Gestor de Finanças Pessoais'}
                    </p>

                    <form id="mlForm" method="post" onSubmit={handleSubmit} noValidate>
                        {isRegister && (
                            <div className={style.ml_campo} id="campoNome">
                                <input type="text" id="nome" name="nome" placeholder="Seu nome completo" />
                                <label htmlFor="nome">Nome</label>
                            </div>
                        )}

                        <div className={style.ml_campo} id="campoEmail">
                            <input type="email" id="email" name="email" placeholder="kaue@exemple.com" />
                            <label htmlFor="email">Email</label>
                        </div>

                        <div className={style.ml_campo} id="campoSenha">
                            <input type="password" id="senha" name="senha" placeholder="*********" />
                            <label htmlFor="senha">Senha</label>
                        </div>

                        {!isRegister && (
                            <div className={style.ml_check_row}>
                                <input type="checkbox" id="lembrar" name="lembrar" />
                                <label htmlFor="lembrar">Lembrar-me</label>
                            </div>
                        )}

                        <button type="submit" className={style.ml_btn_entrar} id="btnEntrar">
                            <span className={style.ml_btn_txt}>{isRegister ? '✓ Cadastrar' : '✓ Entrar'}</span>
                            <div className={style.ml_progress} id="mlProgress"></div>
                        </button>

                        {!isRegister && (
                            <button type="reset" className={style.ml_btn_limpar}>⟲ Limpar campos</button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Form