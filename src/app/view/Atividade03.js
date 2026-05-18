import '../../index.css';
import imagemFinanceira from '../../images/img_Gestao_Financeira.jpg'

function Atividade03() {

    return (

        <>
            <header className="heroSection">

                <h1>Atividade 03</h1>

                <p className="descricao">
                    Nessa atividade, aprendemos como conectar páginas HTML usando links,
                    criar uma lista e adicionar uma imagem dinâmica.
                </p>

            </header>

            <main>

                <div className="container-listas">

                    <div className="lista-box">
                        <h2>Números</h2>

                        <ol type="1">
                            <li>Um</li>
                            <li>Dois</li>
                            <li>Três</li>
                            <li>Quatro</li>
                            <li>Cinco</li>
                        </ol>
                    </div>

                    <div className="lista-box">
                        <h2>Cores</h2>

                        <ol type="I">
                            <li>Vermelho</li>
                            <li>Azul</li>
                            <li>Verde</li>
                            <li>Amarelo</li>
                            <li>Roxo</li>
                        </ol>
                    </div>

                    <div className="lista-box">
                        <h2>Frutas</h2>

                        <ul type="circle">
                            <li>Maçã</li>
                            <li>Banana</li>
                            <li>Morango</li>
                            <li>Laranja</li>
                            <li>Uva</li>
                        </ul>
                    </div>

                </div>

                <img
                    src={imagemFinanceira}
                    alt="Imagem Dinamica"
                />

            </main>
        </>
    );
}

export default Atividade03;