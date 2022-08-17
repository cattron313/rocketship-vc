import React from 'react';
import { render, screen } from '@testing-library/react';
import {ErrorPage} from './ErrorPage';

test('renders correct text for 404 status', () => {
  render(<ErrorPage status={404} />);
  expect(screen.getByText("The page you are looking for does not exist.")).toBeInTheDocument();
});

test('renders correct default error', () => {
  render(<ErrorPage status={500} />);
  expect(screen.getByText("There's been an unexpected error.")).toBeInTheDocument();
});
