import "./App.css";

import { Routes, Route } from "react-router-dom";

import {StockDetails} from "./component/pages/StockDetails";
import {ErrorPage} from './component/pages/ErrorPage';
import MainLayout from "./component/pages/MainLayout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={null} />
        <Route path="/stock/:tickerSymbol" element ={<StockDetails />} />
      </Route>
      <Route
          path="*"
          element={
            <ErrorPage status={404} />
          }
        />
      </Routes>
  );
}

export default App;
