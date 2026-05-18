import '../../index.css'

function Atividade04() {

    return (

        <>
            <header className="heroSection">
                <h1>Atividade 04</h1>

                <p className="descricao">Nessa atividade, aprenderemos como inserir um áudio e um video em uma pagina HTML.</p>
            </header>

            <main>
                
                <h2>Inserindo Áudio</h2>

                <audio preload="metadata" controls autoplay>
                    <source src="../../infraestructure/assets/midia/audio-html.mp3" type="audio/mpeg"></source>
                        <p>Seu navegador não suporta o elemento de áudio. <a
                            href="../../infraestructure/assets/midia/audio-html.mp3" download="audio-html.mp3"
                            type="audio/mpeg"></a></p>
                </audio>

                <h2>Inserindo Vídeo</h2>

                <div className="video">

                    <iframe width="560" height="315" src="https://www.youtube.com/embed/39IXFjD291U?si=9HvMdxXxIjANXkr7"
                        title="YouTube video player" frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

                </div>

            </main>

        </>
    )
}

export default Atividade04