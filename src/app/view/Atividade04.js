import '../../index.css'

function Atividade04() {

    return (

        <>
            <header className="heroSection">
                <div className="container">
                    <div className="row">
                        <div className="col-12 col-md-10 col-lg-8">
                        <h1>Atividade 04</h1>

                        <p className="descricao">Nessa atividade, aprenderemos como inserir um áudio e um video em uma pagina HTML.</p>
                    </div>
                </div>
                </div>
        </header >

            <main>

                <h2>Inserindo Áudio</h2>

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