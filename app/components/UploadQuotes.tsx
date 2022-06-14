import cuid from "cuid";
import { useContext, useRef } from "react";
import { QuotesContext } from "~/context/QuotesContext";

export default function UploadQuotesButton() {
  const inputFile = useRef(null);
  const { setQuotes } = useContext(QuotesContext);

  const fixQuote = (quote: string) => {
    console.log("fixQuote");
    if (quote.match(/^‘/) && quote.match(/’$/)) {
      quote = quote.substring(1, quote.length - 1);
    }
    if (quote.match(/^“/) && quote.match(/”$/)) {
      quote = quote.substring(1, quote.length - 1);
    }
    if (quote.match(/^"/) && quote.match(/"$/)) {
      quote = quote.substring(1, quote.length - 1);
    }
    if (quote.match(/^"(?!.*")/)) {
      quote = quote.substring(1, quote.length);
    }
    if (quote.match(/^\(.*\)$/)) {
      quote = quote.substring(1, quote.length - 1);
    }
    if (quote.match(/^\((?!.*\))/)) {
      quote = quote.substring(1, quote.length);
    }
    if (quote.match(/^[A-Za-z]/)) {
      quote = quote.charAt(0).toUpperCase() + quote.slice(1);
    }

    quote = quote.replace(/,$/, ".");
    return quote;
  };

  const shuffleArray = (arr: Array<any>) => {
    const newArr = arr.slice();
    for (let i = newArr.length - 1; i > 0; i--) {
      const rand = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
    }
    return newArr;
  };

  const parseText: (text: string) => Array<{
    bookTitle: string;
    quote: string;
    words: number;
    dateAdded: Date | null;
  }> = (text) =>
    text
      .split("==========")
      .map((items) => {
        const lines = items.trim().split("\n");
        const quote = fixQuote(lines[3] || "");
        const words = quote.split(" ").length;
        const fullDate = lines[1]?.match("Added on (.*)")?.[1];
        return {
          bookTitle: lines[0],
          dateAdded: fullDate ? new Date(fullDate) : null,
          quote,
          id: cuid(),
          words,
        };
      })
      .filter(({ quote, words }) => quote && words > 2)
      .reduce((acc, current) => {
        // @ts-ignore
        const x = acc.find((item) => item.quote === current.quote);
        if (!x) {
          // @ts-ignore
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.stopPropagation();
    event.preventDefault();
    const file = event?.target?.files?.[0];

    const text = await new Response(file).text();
    setQuotes(shuffleArray(parseText(text)));
  };

  return (
    <button>
      <input
        className="button-upload-input"
        type="file"
        ref={inputFile}
        accept=".txt"
        onChange={handleFileChange}
        tabIndex={-1}
      />
    </button>
  );
}
