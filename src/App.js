import Home from './app/view/Home';
import NavBar from './app/components/NavBar';
import Fotter from './app/components/Fotter';
import Atividade04 from './app/view/Atividade04';
import Atividade05 from './app/view/Atividade05';
import TabelaUsuarios from './app/view/TabelaUsuarios';


import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

import Atividade03 from './app/view/Atividade03';

function App() {

  return (
    <BrowserRouter>

      <NavBar />
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
          path="/atividade03"
          element={<Atividade03 />}
        />

        <Route
          path="/atividade04"
          element={<Atividade04 />}
        />

        <Route
          path="/atividade05"
          element={<Atividade05 />}
        />

        <Route
          path="/usuarios"
          element={<TabelaUsuarios />}
        />

      </Routes>
      
      <Fotter />
    </BrowserRouter>
  );
}

export default App;