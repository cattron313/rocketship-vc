import { ITickerDetails } from '@polygon.io/client-js/lib/rest/reference/tickerDetails';
import { ITickersResults } from '@polygon.io/client-js/lib/rest/reference/tickers';
import { IAggsResults, IAggs} from '@polygon.io/client-js/lib/rest/stocks/aggregates';
import { GraphRangeOptions } from '../component/pages/StockDetails';
import {useEffect, useState} from 'react';

const BASE_API = "https://api.polygon.io/";
const TICKERS_LIST_PATH = "v3/reference/tickers";
const TICKER_DETAILS_PATH = "v3/reference/tickers"
const AGGREGATE_BARS_PATH = "v2/aggs/ticker/$ticker/range/$multiplier/$timespan/$start/$end";

const tickerListSearchParams = new URLSearchParams({
	market: "stocks",
	active: "true",
	sort: "ticker",
	order: "asc",
	limit: "20",
});

export const usePolygonTickerListFetcher = (searchInput: string) => {
	const [tickers, setTickers] = useState<ITickersResults[]>([]);
	useEffect(() => {
		const controller = new AbortController();
		if (searchInput.length > 0) {
			const signal = controller.signal;

			tickerListSearchParams.set("ticker.gte", searchInput);
			fetch(
				BASE_API + TICKERS_LIST_PATH + `?${tickerListSearchParams.toString()}`,
				{
					signal,
					headers: {
						Authorization: `Bearer ${process.env.REACT_APP_POLYGON_API_KEY}`,
					}
				}).then((response) => {
					return response.json();
				}).then((data) => {
					if (data.error) {
						alert(data.error);
					} else {
						setTickers(data.results);
					}
				})
		} else {
			setTickers([]);
		}
		return () => {
			controller.abort();
		};
	}, [searchInput]);
	return [tickers] as const;
};

interface PolygonFetcherOptions<U> {
	initialState?: U | (() => U);
	dependencyArray?: unknown[],
}

const useAbortableAsyncAwaitFetch = <U, T>(
	fetchFn: (signal: AbortSignal, setData: (data: U) => void, args: T) => Promise<unknown>,
	args: T,
	options: PolygonFetcherOptions<U> = {},
) => {
	const {initialState, dependencyArray = []} = options;
	const [data, setData] = useState<U | undefined>(initialState);

	useEffect(() => {
		const controller = new AbortController();
		const signal = controller.signal;

		fetchFn(signal, setData, args);

		return () => {
			controller.abort();
		};
	}, dependencyArray);
	return [data] as const;
};

const fetchTickerDetails = async (
	signal: AbortSignal,
	callback: (data: ITickerDetails["results"]) => void,
	args: [string],
) => {
	const [ticker] = args;
	if (ticker.length > 0) {
		const response = await fetch(
			BASE_API + TICKER_DETAILS_PATH + `/${ticker}`,
			{
				signal,
				headers: {
					Authorization: `Bearer ${process.env.REACT_APP_POLYGON_API_KEY}`,
				}
			}
		);
		const data = await response.json();
		if (data.error) {
			alert(data.error);
		} else {
			callback(data.results);
		}
	}
};

export const usePolygonTickerDetailsFetcher = (ticker: string) => {
	return useAbortableAsyncAwaitFetch<ITickerDetails["results"], [string]>(
		fetchTickerDetails,
		[ticker] as [string],
		{dependencyArray: [ticker]},
	);
};

const aggregatesSearchParams = new URLSearchParams({
	sort: "asc",
});

const fetchAggregates = async (
	signal: AbortSignal,
	callback: (data: ChartData) => void,
	args: [string, GraphRangeOptions],
) => {
	const [ticker, selectedRange] = args;
	if (ticker.length > 0) {
		const now = new Date();
		let start = new Date(now);
		let multiplier: number;
		let timespan: string;
		let labelMaker;

		switch (selectedRange) {
			case "1D":
				start.setDate(now.getDate() - 1)
				multiplier = 1;
				timespan = "minute";
				labelMaker = (aggs: IAggsResults, index: number): string => new Date(start.setMinutes(start.getMinutes() + multiplier)).toTimeString();
				break;
			case "1W":
				start.setDate(now.getDate() - 7)
				multiplier = 20;
				timespan = "minute";
				labelMaker = (aggs: IAggsResults, index: number): string => new Date(start.setMinutes(start.getMinutes() + multiplier)).toISOString();
				break;
			case "1M":
				start.setMonth(now.getMonth() - 1)
				multiplier = 2;
				timespan = "hour";
				labelMaker = (aggs: IAggsResults, index: number): string => new Date(start.setHours(start.getHours() + multiplier)).toDateString();
				break;
			case "1Y":
				start.setFullYear(now.getFullYear() - 1)
				multiplier = 1;
				timespan = "day";
				labelMaker = (aggs: IAggsResults, index: number): string => new Date(start.setDate(start.getDate() + multiplier)).toDateString();
				break;
			default:
				start.setFullYear(now.getFullYear() - 1)
				multiplier = 1;
				timespan = "day";
				labelMaker = (aggs: IAggsResults, index: number): string => new Date(start.setDate(start.getDate() + multiplier)).toDateString();
				break;
		}

		let pathCopy = AGGREGATE_BARS_PATH
			.replace("$ticker", ticker)
			.replace("$multiplier", multiplier.toString())
			.replace("$timespan", timespan)
			.replace("$start", start.toISOString().split("T")[0])
			.replace("$end", now.toISOString().split("T")[0]);
		const response = await fetch(BASE_API + pathCopy + `?${aggregatesSearchParams.toString()}`, {
			signal,
			headers: {
				Authorization: `Bearer ${process.env.REACT_APP_POLYGON_API_KEY}`,
			}
		});
		const data = await response.json();
		if (data.error) {
			alert(data.error);
		} else {
			const results = data.results ?? [];
			callback({
				data: results,
				labels: results.map(labelMaker),
			});
		}
	}
};

interface ChartData {
	data: IAggsResults[];
	labels: string[];
}

export const usePolygonAggregatesFetcher = (
	ticker: string,
	selectedRange: GraphRangeOptions,
) => {
	return useAbortableAsyncAwaitFetch<ChartData, [string, GraphRangeOptions]>(
		fetchAggregates,
		[
			ticker,
			selectedRange,
		] as [string, GraphRangeOptions],
		{
			initialState: {
				data: [],
				labels: [],
			},
			dependencyArray: [ticker, selectedRange],
		}
	);
};