import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { getQuoteListItems } from "~/models/quote.server";
import { QuotesContextProvider } from "~/context/QuotesContext";
import UploadQuotesButton from "~/components/UploadQuotes";

type LoaderData = {
  quoteListItems: Awaited<ReturnType<typeof getQuoteListItems>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const quoteListItems = await getQuoteListItems({ userId });
  return json<LoaderData>({ quoteListItems });
};

export default function QuotesPage() {
  const data = useLoaderData() as LoaderData;
  const user = useUser();

  return (
    <QuotesContextProvider>
      <div className="flex h-full min-h-screen flex-col">
        <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
          <h1 className="text-3xl font-bold">
            <Link to=".">Quotes</Link>
          </h1>
          <p>{user.email}</p>
          <Form action="/logout" method="post">
            <button
              type="submit"
              className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
            >
              Logout
            </button>
          </Form>
        </header>

        <main className="flex h-full bg-white">
          <div className="h-full w-80 border-r bg-gray-50">
            {/* <Link to="new" className="block p-4 text-xl text-blue-500">
            + New Quote
          </Link> */}

            <UploadQuotesButton />

            <hr />

            {data.quoteListItems.length === 0 ? (
              <p className="p-4">No quotes yet</p>
            ) : (
              <ol>
                {data.quoteListItems.map((quote) => (
                  <li key={quote.id}>
                    <NavLink
                      className={({ isActive }) =>
                        `block flex gap-1 border-b p-4 text-xl ${
                          isActive ? "bg-white" : ""
                        }`
                      }
                      to={quote.id}
                    >
                      📝{" "}
                      <div
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {quote.body}
                      </div>
                    </NavLink>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </QuotesContextProvider>
  );
}
