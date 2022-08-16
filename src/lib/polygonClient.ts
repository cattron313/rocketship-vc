import { restClient } from "@polygon.io/client-js";
export const client = restClient(process.env.REACT_APP_POLYGON_API_KEY);