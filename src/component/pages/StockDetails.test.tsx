import React from 'react';
import {render, screen, waitFor, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {StockDetails} from './StockDetails';

jest.mock("react-router-dom", () => ({
  useParams: () => ({ tickerSymbol: "AAPL"}),
}));


jest.mock('react-chartjs-2', () => {
	return {
  	Line: () => <span data-testid="LineChart" />,
	};
});

jest.mock('chart.js', () => {
  const mockChart = function myMock() {};
  mockChart.register = () => {};
  return {
    Chart: mockChart,
    registerables: [],
    chartRef: {current: { destroy: () => {}}},
  };
});

let aggsPromise: Promise<unknown>, tickerDetailsPromise: Promise<unknown>;
beforeEach(() => {
	global.fetch = jest.fn((url) => Promise.resolve({
		json: () => {
			if (url.includes("v2/aggs/ticker")) {
				aggsPromise = Promise.resolve({
					count: 2,
					results: [
						{vw: 100},
						{vw: 200},
					],
				});
				return aggsPromise;
			} else {
				tickerDetailsPromise = Promise.resolve({
					request_id: "f3cdd02ab40a22c71c24f57997009fc1",
					results: {
						ticker: "AAPL",
						name: "Apple Inc.",
						branding: {
							logo_url: "https://api.fake.io/logo"
						},
					},
				});
				return tickerDetailsPromise;
			}
		}
	})) as unknown as (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>;
});

afterEach(() => {
	jest.restoreAllMocks();
	(fetch as jest.MockedFunction<any>).mockClear();
});

test('renders stock details correctly', async () => {
  render(<StockDetails />);

	await act(() => aggsPromise as Promise<void>);
	await	act(() => tickerDetailsPromise as Promise<void>);

	const name = await screen.findByText("Apple Inc.");
	expect(name).toBeInTheDocument();

	const img = await screen.findByAltText("Company logo");
	expect(img).toBeInTheDocument();
});

test('renders chart correctly', async () => {
  render(<StockDetails />);

	await act(() => aggsPromise as Promise<void>);
	await	act(() => tickerDetailsPromise as Promise<void>);

	const chart = await screen.findByTestId("LineChart");
	expect(chart).toBeInTheDocument();
});

test('fetches again after clicking button', async () => {
  render(<StockDetails />);

	await act(() => aggsPromise as Promise<void>);
	await	act(() => tickerDetailsPromise as Promise<void>);

	await waitFor(() => {
		expect(global.fetch).toHaveBeenCalledTimes(2);
	});

	const button = await screen.findByText("1W");
	userEvent.click(button);

	await act(() => aggsPromise as Promise<void>);

	await waitFor(() => {
		expect(global.fetch).toHaveBeenCalledTimes(3);
	});
});

test('renders all buttons', async () => {
  render(<StockDetails />);

	await act(() => aggsPromise as Promise<void>);
	await	act(() => tickerDetailsPromise as Promise<void>);

	const buttons = screen.getAllByRole("button");
	expect(buttons.map((el) => el.textContent)).toEqual(["1D", "1W", "1M", "1Y"]);
});
