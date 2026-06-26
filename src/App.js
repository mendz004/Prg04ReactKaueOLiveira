import Home from './app/view/Home';
import NavBar from './app/components/NavBar';
import Fotter from './app/components/Fotter';

import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

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

      </Routes>
      
      <Fotter />
    </BrowserRouter>
  );
}

export default App;