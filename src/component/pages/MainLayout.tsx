import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Outlet } from "react-router-dom";

import { TickerSearch } from "../TickerSearch";

import './MainLayout.css';

function MainLayout() {
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();
  const handleSelect = (ticker: string | undefined) => {
    setSearchInput("");
    navigate(`/stock/${ticker ?? ""}`);
  };

  const handleInput = (value: string) => {
    setSearchInput(value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Stonks</h1>
        <TickerSearch onSelect={handleSelect} value={searchInput} onInput={handleInput} />
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;