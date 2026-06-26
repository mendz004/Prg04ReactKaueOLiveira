import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from './app/view/Home';

test('opens the login form for Acessar and the register form for Comece agora', async () => {
  render(<Home />);

  userEvent.click(screen.getByRole('button', { name: /acessar/i }));
  expect(screen.getByRole('heading', { name: /entrar na conta/i })).toBeInTheDocument();

  userEvent.click(screen.getByRole('button', { name: /fechar/i }));
  userEvent.click(screen.getByRole('button', { name: /comece agora/i }));

  expect(screen.getByRole('heading', { name: /criar conta/i })).toBeInTheDocument();
});
