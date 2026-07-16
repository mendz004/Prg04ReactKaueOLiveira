import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './app/view/Home';
import Dashboard from './app/view/Dashboard';
import Receita from './app/view/Receita';
import Despesa from './app/view/Despesa';
import Conta from './app/view/Conta';
import Fotter from './app/components/Fotter';

import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

function PlaceholderView({ title }) {
  return (
    <div className="container py-5">
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h2 className="mb-3">{title}</h2>
          <p className="text-muted mb-0">
            A view de {title.toLowerCase()} ainda está sendo organizada.
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/home"
          element={<Home />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/receita"
          element={<Receita />}
        />

        <Route
          path="/despesa"
          element={<Despesa />}
        />

        <Route
          path="/conta"
          element={<Conta />}
        />

        <Route
          path="/cartao"
          element={<PlaceholderView title="Cartão" />}
        />

        <Route
          path="/objetivo"
          element={<PlaceholderView title="Objetivo" />}
        />

        <Route
          path="/orcamento"
          element={<PlaceholderView title="Orçamento" />}
        />

        <Route
          path="/relatorio"
          element={<PlaceholderView title="Relatório" />}
        />
      </Routes>

      <Fotter />
    </BrowserRouter>
  );
}

export default App;