import {useState} from "react";
import { useParams } from "react-router-dom";

import "./StockDetails.css";
import { usePolygonAggregatesFetcher, usePolygonTickerDetailsFetcher } from "../../hooks/usePolygonFetchers";

import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);


interface Props {

}

export type GraphRangeOptions = "1D" | "1W" | "1M" | "1Y";
const GRAPH_RANGES: GraphRangeOptions[] = ["1D", "1W", "1M", "1Y"];

export const StockDetails = (props: Props) => {
	const [selectedRange, setSelectedRange] = useState<GraphRangeOptions>("1D");
	let {tickerSymbol} = useParams();
	if (tickerSymbol === undefined) {
		console.warn("Invalid URL");
		tickerSymbol = "";
	}

	const [tickerDetails] = usePolygonTickerDetailsFetcher(tickerSymbol);
	const [chartData] = usePolygonAggregatesFetcher(
		tickerSymbol,
		selectedRange,
	);

	let lineChart;
	if (chartData) {
		const data = {
			labels: chartData.labels,
			datasets: [
				{
					label: 'Volume Weighted Average Price',
					borderColor: 'rgb(53, 162, 235)',
					backgroundColor: 'rgba(53, 162, 235, 0.5)',
					data: chartData.data.map(({vw}) => vw),
				}
			]
		};
		lineChart = <Line data={data} />;
	}

	return (
		<>
			<img className="Logo" src={`${tickerDetails?.branding?.logo_url}?apiKey=${encodeURIComponent(process.env.REACT_APP_POLYGON_API_KEY ?? "")}`} alt="Company logo" />
			<h2>{tickerSymbol?.toUpperCase()}</h2>
			<p>{tickerDetails?.name}</p>
			{GRAPH_RANGES.map(
				(tab) => <button key={tab} onClick={() => {setSelectedRange(tab)}}>{tab}</button>
			)}
			{lineChart}
		</>
	);
};