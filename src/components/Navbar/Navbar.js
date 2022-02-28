import React, { useContext } from "react";
import { FormattedMessage } from "react-intl";

import { Context } from "../Wrapper";
import "./Navbar.css";

const Navbar = () => {
  const context = useContext(Context);

  return (
    <div class="navbar">
      <div class="navbar-left">
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
      </div>
      <div>
        <button value="en-US" onClick={context.selectLanguage}>
          EN
        </button>
        <button value="pt-BR" onClick={context.selectLanguage}>
          PT
        </button>
      </div>
    </div>
  );
};

export default Navbar;
