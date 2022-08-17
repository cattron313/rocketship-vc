import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import {BrowserRouter, MemoryRouter} from 'react-router-dom'

jest.mock('chart.js', () => {
  const mockChart = function myMock() {};
  mockChart.register = () => {};
  return {
    Chart: mockChart,
    registerables: [],
    chartRef: {current: { destroy: () => {}}},
  };
});

jest.mock('react-chartjs-2', () => ({
  Line: () => null
}));

test('renders main layout initially', () => {
  render(<App />, {wrapper: BrowserRouter});
  const element = screen.getByText("Stonks");
  expect(element).toBeInTheDocument();
});

test('landing on a bad page', () => {
  const badRoute = '/some/bad/route';
  render(
    <MemoryRouter initialEntries={[badRoute]}>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByText("Error 404")).toBeInTheDocument();
});

test('render stock ticker page', () => {
  const tickerDetailsPath = '/stock/AAPL';
  render(
    <MemoryRouter initialEntries={[tickerDetailsPath]}>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByText("AAPL")).toBeInTheDocument();
});
