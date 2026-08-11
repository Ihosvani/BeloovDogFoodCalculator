import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders feeding calculator title', () => {
  render(<App />);
  expect(screen.getByText(/Feeding Calculator/i)).toBeInTheDocument();
});
