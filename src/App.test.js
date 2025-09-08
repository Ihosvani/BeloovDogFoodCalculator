import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders calculator title', () => {
  render(<App />);
  expect(screen.getByText(/Calculadora de Comida para Perros/i)).toBeInTheDocument();
});
