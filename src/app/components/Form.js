import style from './form.module.css';
import { useState } from 'react';
import { api } from '../../api/Api'; // Importando a conexão com o Back-end!

function Form({ onClose, mode = 'login' }) {
    const isRegister = mode === 'register';

    // 1. Estados para guardar os dados digitados
    const [nome, setNome] = useState('');
    const [rendaMensal, setRendaMensal] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [lembrar, setLembrar] = useState(false);

    // 2. Estados para controle de interface (erros e loading)
    const [erros, setErros] = useState({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState('0%'); // Controla a barrinha do botão

    // Função para limpar os campos
    const handleReset = () => {
        setEmail('');
        setSenha('');
        setLembrar(false);
        setErros({});
        setApiError('');
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setApiError('');

        let valido = true;
        let novosErros = {};

        // 3. Validação usando os Estados
        if (isRegister && !nome.trim()) {
            novosErros.nome = true;
            valido = false;
        }

        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
            novosErros.email = true;
            valido = false;
        }

        if (!senha.trim()) {
            novosErros.senha = true;
            valido = false;
        }

        if (!valido) {
            setErros(novosErros);
            // Remove as classes de erro após 800ms
            setTimeout(() => setErros({}), 800);
            return;
        }

        // 4. Inicia a animação de Loading
        setLoading(true);
        setProgress('85%');

        try {
            if (isRegister) {
                // CHAMA O BACK-END: Rota de Cadastro (Corrigido para '/usuarios')
                await api.post('/usuarios', {
                    nome: nome.trim(),
                    email: email.trim(),
                    senha: senha.trim(),
                    rendaMensal: parseFloat(rendaMensal) || 0 
                });

                setProgress('100%');
                setTimeout(() => {
                    alert('Conta criada com sucesso! Faça seu login.');
                    onClose?.();
                }, 500);

            } else {
                // CHAMA O BACK-END: Rota de Login (Corrigido para '/login' usando a instância 'api')
                const response = await api.post('/login', {
                    email: email.trim(),
                    senha: senha.trim()
                });

                // Salva o token (retornado pelo Spring) no navegador
                localStorage.setItem('usuarioAppFinanceiro', JSON.stringify(response.data));

                setProgress('100%');
                setTimeout(() => {
                    onClose?.();
                    window.location.assign('/dashboard');
                }, 500);
            }
        } catch (error) {
            console.error("Erro na API:", error);
            setProgress('0%'); // Reseta a barra
            setLoading(false);
            
            // Tratando erro 403 (Forbidden) ou 401 (Unauthorized) do Spring Security
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                setApiError('E-mail ou senha incorretos.');
            } else {
                setApiError('Erro no servidor. Tente novamente mais tarde.');
            }
        }
    }

    return (
        <div className={style.ml_overlay} id="mlOverlay" role="dialog" aria-modal="true" aria-labelledby="mlTitulo">
            <div className={style.ml_card}>
                <button className={style.ml_fechar} onClick={onClose} aria-label="Fechar" disabled={loading}>✕</button>

                <div className={style.ml_inner}>
                    <div className={style.ml_icon_wrap}>💰</div>
                    <h2 className={style.ml_titulo} id="mlTitulo">
                        {isRegister ? 'Criar conta' : 'Entrar na conta'}
                    </h2>
                    <p className={style.ml_subtitulo}>
                        {isRegister ? 'Cadastre-se para começar a organizar suas finanças.' : 'Acesse o Gestor de Finanças Pessoais'}
                    </p>

                    {/* Exibe erro da API se houver */}
                    {apiError && <div className="alert alert-danger" style={{ fontSize: '14px', padding: '8px', color: 'red' }}>{apiError}</div>}

                    <form id="mlForm" onSubmit={handleSubmit} onReset={handleReset} noValidate>
                        
                        {isRegister && (
                            <div className={`${style.ml_campo} ${erros.nome ? style.erro : ''}`}>
                                <input 
                                    type="text" 
                                    id="nome" 
                                    placeholder="Seu nome completo" 
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    disabled={loading}
                                />
                                <label htmlFor="nome">Nome</label>
                            </div>
                        )}

                        {isRegister && (
                            <div className={style.ml_campo}>
                                <input 
                                    type="number" 
                                    id="rendaMensal" 
                                    placeholder="2500.00" 
                                    min="0" 
                                    step="0.01" 
                                    value={rendaMensal}
                                    onChange={(e) => setRendaMensal(e.target.value)}
                                    disabled={loading}
                                />
                                <label htmlFor="rendaMensal">Renda mensal</label>
                            </div>
                        )}

                        <div className={`${style.ml_campo} ${erros.email ? style.erro : ''}`}>
                            <input 
                                type="email" 
                                id="email" 
                                placeholder="kaue@exemplo.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                            <label htmlFor="email">Email</label>
                        </div>

                        <div className={`${style.ml_campo} ${erros.senha ? style.erro : ''}`}>
                            <input 
                                type="password" 
                                id="senha" 
                                placeholder="*********" 
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                disabled={loading}
                            />
                            <label htmlFor="senha">Senha</label>
                        </div>

                        {!isRegister && (
                            <div className={style.ml_check_row}>
                                <input 
                                    type="checkbox" 
                                    id="lembrar" 
                                    checked={lembrar}
                                    onChange={(e) => setLembrar(e.target.checked)}
                                    disabled={loading}
                                />
                                <label htmlFor="lembrar">Lembrar-me</label>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className={`${style.ml_btn_entrar} ${loading ? style.loading : ''}`} 
                            disabled={loading}
                        >
                            <span className={style.ml_btn_txt}>
                                {loading ? 'Aguarde...' : (isRegister ? '✓ Cadastrar' : '✓ Entrar')}
                            </span>
                            <div className={style.ml_progress} style={{ width: progress }}></div>
                        </button>

                        {!isRegister && (
                            <button type="reset" className={style.ml_btn_limpar} disabled={loading}>
                                ⟲ Limpar campos
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Form;