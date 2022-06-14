import React, { useState } from "react";

export type Quote = {
  bookTitle: string;
  id: string;
  quote?: string;
  words: number;
  dateAdded: Date | null;
  selected?: boolean;
};

export const QuotesContext = React.createContext<{
  quotes: Quote[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
}>({
  quotes: [],
  setQuotes: () => {},
});

const getLocalStorageQuotes: () => Quote[] = () => {
  try {
    const quotes = window.localStorage.getItem("quotes-v1");
    if (quotes) {
      return JSON.parse(quotes);
    } else {
      return [];
    }
  } catch (e) {
    return [];
  }
};

const saveLocalStorageQuotes = (quotes: Quote[]) => {
  try {
    window.localStorage.setItem("quotes-v1", JSON.stringify(quotes));
  } catch (e) {
    console.error(e);
  }
};

export const QuotesContextProvider: React.FC = ({ children }) => {
  const localStorageQuotes = getLocalStorageQuotes();
  const [quotes, setQuotes] = useState<Quote[]>(localStorageQuotes);

  React.useEffect(() => {
    saveLocalStorageQuotes(quotes);
  }, [quotes]);

  return (
    <QuotesContext.Provider
      value={{
        quotes,
        setQuotes,
      }}
    >
      {children}
    </QuotesContext.Provider>
  );
};
