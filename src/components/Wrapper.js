import React, { useState } from "react";
import { IntlProvider } from "react-intl";

import English from "../lang/en-US.json";
import Portuguese from "../lang/pt-BR.json";

export const Context = React.createContext();

const local = navigator.language;
let lang;

if (local === "pt-BR") {
  lang = Portuguese;
} else {
  lang = English;
}

const Wrapper = (props) => {
  const [locale, setLocale] = useState(local);
  const [messages, setMessages] = useState(lang);

  const selectLanguage = (e) => {
    const newLocale = e.target.value;
    setLocale(newLocale);

    if (newLocale === "pt-BR") {
      setMessages(Portuguese);
    } else {
      setMessages(English);
    }
  };

  return (
    <Context.Provider value={{ locale, selectLanguage }}>
      <IntlProvider messages={messages} locale={locale}>
        {props.children}
      </IntlProvider>
    </Context.Provider>
  );
};

export default Wrapper;
