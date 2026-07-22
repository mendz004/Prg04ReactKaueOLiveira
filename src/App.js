import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './app/view/Home';
import Dashboard from './app/view/Dashboard';
import Receita from './app/view/Receita';
import Despesa from './app/view/Despesa';
import Conta from './app/view/Conta';
import Cartao from './app/view/Cartao';
import Objetivo from './app/view/Objetivo';
import Orcamento from './app/view/Orcamento';
import Relatorio from './app/view/Relatorio';
import Fotter from './app/components/Fotter';

import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

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
          path="/login"
          element={<Home initialFormMode="login" />}
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
          element={<Cartao />}
        />

        <Route
          path="/objetivo"
          element={<Objetivo />}
        />

        <Route
          path="/orcamento"
          element={<Orcamento />}
        />

        <Route
          path="/relatorio"
          element={<Relatorio />}
        />
      </Routes>

      <Fotter />
    </BrowserRouter>
  );
}

export default App;
