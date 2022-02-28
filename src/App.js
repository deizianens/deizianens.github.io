import React from "react";
import { FormattedMessage } from "react-intl";

import "./App.css";
import { Navbar } from "./components";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Navbar></Navbar>
      </header>

      <main>
        <h1>
          <FormattedMessage id="app.greetings" />
        </h1>
      </main>
    </div>
  );
}

export default App;
