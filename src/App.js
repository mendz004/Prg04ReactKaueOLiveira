import Home from './app/view/Home';
import Dashboard from './app/view/Dashboard';
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
          path="/dashboard"
          element={<Dashboard />}
        />
      </Routes>

      <Fotter />
    </BrowserRouter>
  );
}

export default App;