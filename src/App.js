import { useContext } from "react";
import { FormattedMessage } from "react-intl";
import { Context } from "./components/Wrapper";

import "./App.css";

function App() {
  const context = useContext(Context);

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <a href="https://deizianens.github.io/">Deiziane Silva</a>
        </div>
        <nav>
          <ul id="primary-navigation">
            <li class="active">
              <a href="#about">
                <FormattedMessage id="app.nav.about" />
              </a>
            </li>
            <li>
              <a href="#work">
                <FormattedMessage id="app.nav.work" />
              </a>
            </li>
            <li>
              <a href="#contact">
                <FormattedMessage id="app.nav.contact" />
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <button value="en-US" onClick={context.selectLanguage}>
            EN
          </button>
          <button value="pt-BR" onClick={context.selectLanguage}>
            PT
          </button>
        </div>
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
