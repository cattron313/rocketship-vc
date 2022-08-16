import { usePolygonTickerListFetcher } from "../hooks/usePolygonFetchers";

import "./TickerSearch.css";


interface Props {
	onSelect: (value: string | undefined) => void;
	value: string;
	onInput: (value: string) => void;
}

export const TickerSearch = ({onSelect, value, onInput}: Props) => {
  const [tickers = []] = usePolygonTickerListFetcher(value);

	const handleClick: React.MouseEventHandler<HTMLUListElement> = (e) => {
		let element: HTMLElement | null = e.target as HTMLElement;

		if (element.tagName === "SPAN") {
			element = element.parentElement;
		}

		if (element?.tagName === "LI") {
			const {ticker} = element.dataset;
			onSelect(ticker);
		}
	}

	return (
		<div className="TickerSearch">
			<div className="TickerSearch-controls">
				<input
					value={value}
					placeholder="APPL"
					onChange={(e) => onInput(e.target.value.toUpperCase())}
				/>
			</div>
			{tickers.length > 0 && (
				<ul className="TickerSearch-dropdown" onClick={handleClick}>
					{tickers.map(({name, ticker}) => {
						return (
						<li className="Ticker" key={ticker} data-ticker={ticker}>
							<span className="Ticker-name">{name}</span>
							<span className="Ticker-ticker">{ticker}</span>
						</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};
