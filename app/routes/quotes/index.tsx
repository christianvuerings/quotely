import { Form, Link, useActionData } from "@remix-run/react";
import { ActionFunction, json, redirect } from "@remix-run/server-runtime";
import { useContext, useRef, useState } from "react";
import { Quote, QuotesContext } from "~/context/QuotesContext";
import { createQuotes } from "~/models/quote.server";
import { requireUserId } from "~/session.server";

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const selectedElements = formData.getAll("selected");
  const titles = formData.getAll("title");
  const bodies = formData.getAll("body");

  const quotes = selectedElements
    .filter((item) => item === "true")
    .map((_, index) => {
      return {
        title: titles[index],
        body: bodies[index],
        userId,
      };
    })
    .filter(Boolean);

  // @ts-ignore
  await createQuotes({ quotes });

  return null;
};

function Quote({
  quote,
  updateQuote,
}: {
  quote: Quote;
  updateQuote: (quote: Pick<Quote, "id" | "quote" | "selected">) => void;
}) {
  const [localQuote, setLocalQuote] = useState(quote.quote);
  const quoteRef = useRef<HTMLDivElement>(null);

  const onChange = () => {
    if (quoteRef.current) {
      setLocalQuote(quoteRef.current.innerText);
      updateQuote({ id: quote.id, quote: quoteRef.current.innerText });
    }
  };

  return (
    <div className="mb-4 flex items-center gap-x-2">
      <input
        type="checkbox"
        className="rounded border border-gray-400 p-2"
        checked={!!quote.selected}
        onChange={(event) => {
          updateQuote({ id: quote.id, selected: !!event.target.checked });
        }}
      ></input>
      <div
        className="w-full rounded border border-gray-200 px-2 py-1 text-lg"
        contentEditable={true}
        onBlur={onChange}
        suppressContentEditableWarning={true}
        ref={quoteRef}
      >
        {localQuote}
      </div>
      <input type="hidden" name="id" value={quote.id} />
      <input type="hidden" name="selected" value={String(!!quote.selected)} />
      <input type="hidden" name="body" value={localQuote} />
      <input type="hidden" name="title" value={quote.bookTitle} />
    </div>
  );
}

function Quotes({
  quotes,
  updateQuote,
}: {
  quotes: Quote[];
  updateQuote: (quote: Pick<Quote, "id" | "quote" | "selected">) => void;
}) {
  return (
    <ul>
      {quotes.map((quote) => (
        <li key={quote.id}>
          <Quote quote={quote} updateQuote={updateQuote} />
        </li>
      ))}
    </ul>
  );
}

export default function QuoteIndexPage() {
  const { quotes, setQuotes } = useContext(QuotesContext);

  const updateQuote = (
    quoteToUpdate: Pick<Quote, "id" | "quote" | "selected">
  ) => {
    const updatedQuotes = [...quotes].map((quote) => {
      if (quote.id === quoteToUpdate.id) {
        if (quoteToUpdate.quote) {
          quote.quote = quoteToUpdate.quote;
        }
        if (quoteToUpdate.selected != null) {
          quote.selected = quoteToUpdate.selected;
        }
      }
      return quote;
    });
    setQuotes(updatedQuotes);
  };

  return quotes.length ? (
    <div className="relative">
      <Form method="post">
        <Quotes quotes={quotes} updateQuote={updateQuote}></Quotes>
        <div className="sticky bottom-0 flex justify-end bg-white py-4">
          <button
            className="rounded bg-slate-100 py-2 px-4 text-gray-800 hover:bg-blue-100 active:bg-blue-200 disabled:bg-slate-50 disabled:text-gray-500"
            disabled={quotes.filter(({ selected }) => !!selected).length === 0}
            type="submit"
          >
            Save selected quotes
          </button>
        </div>
      </Form>
    </div>
  ) : (
    <div>No quotes yet. Please upload your kindle `MyClippings.txt` file.</div>
  );
}
