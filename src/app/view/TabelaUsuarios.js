import '../../index.css';

function TabelaUsuarios() {

    return (

        <>
            <header className="heroSection">
                <div className="container">
                    <div className="row">
                        <div className="col-12 col-md-6 col-lg-4">
                            <h1>Painel Administrativo</h1>

                        </div>
                    </div>
                </div>
            </header>

            <main>

                <table className="tg">

                    <thead>

                        <tr>

                            <th className="tg-0pky" colSpan="6">

                                <input
                                    type="text"
                                    placeholder="🔍 Buscar..."
                                    style={{
                                        width: '120px',
                                        padding: '5px',
                                        marginLeft: '20px',
                                        borderRadius: '10px'
                                    }}
                                />

                                <button className="cadastrar">
                                    ➕
                                </button>

                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        <tr>
                            <td className="tg-0pky">ID</td>
                            <td className="tg-0pky">Nome</td>
                            <td className="tg-0pky">Email</td>
                            <td className="tg-0pky">Remover</td>
                            <td className="tg-0pky">Editar</td>
                        </tr>

                        <tr>
                            <td className="tg-0pky">0001</td>
                            <td className="tg-0pky">João Silva</td>
                            <td className="tg-0pky">
                                joao.silva@example.com
                            </td>
                            <td className="tg-0pky">
                                <button>🗑️</button>
                            </td>
                            <td className="tg-0pky">
                                <button>✏️</button>
                            </td>
                        </tr>

                        <tr>
                            <td className="tg-0pky">0002</td>
                            <td className="tg-0pky">Maria Oliveira</td>
                            <td className="tg-0pky">
                                maria.oliveira@example.com
                            </td>
                            <td className="tg-0pky">
                                <button>🗑️</button>
                            </td>
                            <td className="tg-0pky">
                                <button>✏️</button>
                            </td>
                        </tr>

                        <tr>
                            <td className="tg-0pky">0003</td>
                            <td className="tg-0pky">Carlos Souza</td>
                            <td className="tg-0pky">
                                carlos.souza@example.com
                            </td>
                            <td className="tg-0pky">
                                <button>🗑️</button>
                            </td>
                            <td className="tg-0pky">
                                <button>✏️</button>
                            </td>
                        </tr>
                    </tbody>

                </table>

            </main>
        </>
    );
}

export default TabelaUsuarios;