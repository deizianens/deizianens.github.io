import { FormattedMessage } from "react-intl";

import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header"></header>

      <main>
        <h1>
          <FormattedMessage id="app.greetings" />
        </h1>
      </main>
    </div>
  );
}

export default App;
