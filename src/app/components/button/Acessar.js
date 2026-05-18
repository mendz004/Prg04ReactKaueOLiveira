import { useState } from "react"
import Form from "../Form"
import style from "./acessar.module.css"

function Acessar() {
    const [showForm, setShowForm] = useState(false)

    return (

        <>
        <div className="container text-center my-4">
                {!showForm && (
                    <button type="button" className={style.btn_acessar} onClick={() => setShowForm(true)}>
                        Acessar
                    </button>
                )}
            </div>

            {showForm && <Form onClose={() => setShowForm(false)} />}
        </>
    )
}

export default Acessar