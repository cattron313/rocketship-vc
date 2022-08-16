interface Props {
	status: number;
}

export const ErrorPage = ({status}: Props) => {
	let errorMsg: string;
	switch(status) {
		case 404:
			errorMsg = "The page you are looking for does not exist.";
			break;
		default:
			errorMsg = "There's been an unexpected error.";
			break;
	}
	return (
		<main className="error">
			<h1>Error {status}</h1>
			<p>{errorMsg}</p>
		</main>
	);
};