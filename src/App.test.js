import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Smoke test: confirm the calculator renders its main title.
test('renders calculator title', () => {
  render(<App />);
  expect(screen.getByText(/Feeding Calculator/i)).toBeInTheDocument();
});
