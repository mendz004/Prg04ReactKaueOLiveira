import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import Home from './app/view/Home';

test('opens the login form for Acessar and the register form for Comece agora', async () => {
  render(<Home />);

  await userEvent.click(screen.getByRole('button', { name: /acessar/i }));
  expect(screen.getByRole('heading', { name: /entrar na conta/i })).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /fechar/i }));
  await userEvent.click(screen.getByRole('button', { name: /comece agora/i }));

  expect(screen.getByRole('heading', { name: /criar conta/i })).toBeInTheDocument();
});

test('navbar actions open the same modal as the home buttons', async () => {
  render(<Home />);

  const nav = screen.getByRole('navigation');

  await userEvent.click(within(nav).getByRole('button', { name: /abrir formulário de acesso/i }));
  expect(screen.getByRole('heading', { name: /entrar na conta/i })).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /fechar/i }));
  await userEvent.click(within(nav).getByRole('button', { name: /abrir formulário de cadastro/i }));

  expect(screen.getByRole('heading', { name: /criar conta/i })).toBeInTheDocument();
});

test('shows monthly income field in the register form', async () => {
  render(<Home />);

  await userEvent.click(screen.getByRole('button', { name: /comece agora/i }));

  expect(screen.getByPlaceholderText('2500.00')).toBeInTheDocument();
});

test('does not show monthly income field in the login form', async () => {
  render(<Home />);

  await userEvent.click(screen.getByRole('button', { name: /acessar/i }));

  expect(screen.queryByPlaceholderText('2500.00')).not.toBeInTheDocument();
});

test('renders the credit card view at the /cartao route', () => {
  window.history.pushState({}, '', '/cartao');
  render(<App />);

  expect(screen.getByRole('heading', { name: /cartões de crédito/i })).toBeInTheDocument();
});
