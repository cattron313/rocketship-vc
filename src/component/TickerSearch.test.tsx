import React from 'react';

import { render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {TickerSearch} from './TickerSearch';

let selectMock: () => {}, inputMock: () => {};
beforeEach(() => {
	selectMock = jest.fn();
	inputMock = jest.fn();

	global.fetch = jest.fn(() => Promise.resolve({
		json: () => Promise.resolve({
			count: 1,
			next_url: "https://api.fake.io/",
			request_id: "db65d855db9297b581bff8ebccd2f299",
			results: [{
				active: true,
				cik: "0000320193",
				composite_figi: "BBG000B9XRY4",
				currency_name: "usd",
				last_updated_utc: "2022-08-15T00:00:00Z",
				locale: "us",
				market: "stocks",
				name: "Apple Inc.",
				primary_exchange: "XNAS",
				share_class_figi: "BBG001S5N8V8",
				ticker: "AAPL",
				type: "CS",
			}],
			status: "OK",
		}),
	})
	) as unknown as (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>;
});

afterEach(() => {
	jest.restoreAllMocks();
	(fetch as jest.MockedFunction<any>).mockClear();
});

test('renders input', () => {
  render(<TickerSearch onSelect={selectMock} value="" onInput={inputMock} />);
  expect(screen.getByPlaceholderText("Enter stock ticker")).toBeInTheDocument();
});

test('calls callback when user enters input', () => {
  render(<TickerSearch onSelect={selectMock} value="" onInput={inputMock} />);

	const inputEl = screen.getByPlaceholderText("Enter stock ticker");
	userEvent.type(inputEl, "AAPL");

	expect(inputMock).toHaveBeenCalledTimes(4);
	expect(inputMock).toHaveBeenLastCalledWith("L");
});

test('renders list of stock tickers', async () => {
	render(<TickerSearch onSelect={selectMock} value="AAPL" onInput={inputMock} />);
	expect(screen.getByDisplayValue("AAPL")).toBeInTheDocument();

	await waitFor(() => {
		expect(global.fetch).toHaveBeenCalledTimes(1);
	});

	await waitFor(() => {
		expect(screen.getByText("Apple Inc.")).toBeInTheDocument();
	});

	await waitFor(() => {
		expect(screen.getAllByText("AAPL").length).toEqual(1);
	});
});

test('calls callback when user selects item from dropdown', async () => {
	render(<TickerSearch onSelect={selectMock} value="AAPL" onInput={inputMock} />);

	await waitFor(() => {
		expect(global.fetch).toHaveBeenCalledTimes(1);
	});

	const optionEl = await screen.findByText("Apple Inc.");
	userEvent.click(optionEl);

	expect(selectMock).toHaveBeenCalledTimes(1);
	expect(selectMock).toHaveBeenLastCalledWith("AAPL");
});

