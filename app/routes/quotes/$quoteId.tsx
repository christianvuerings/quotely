import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import type { Quote } from "~/models/quote.server";
import { deleteQuote } from "~/models/quote.server";
import { getQuote } from "~/models/quote.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  quote: Quote;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.quoteId, "quoteId not found");

  const quote = await getQuote({ userId, id: params.quoteId });
  if (!quote) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ quote });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.quoteId, "quoteId not found");

  await deleteQuote({ userId, id: params.quoteId });

  return redirect("/quotes");
};

export default function QuoteDetailsPage() {
  const data = useLoaderData() as LoaderData;

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.quote.title}</h3>
      <p className="py-6">{data.quote.body}</p>
      <hr className="my-4" />
      <Form method="post">
        <button
          type="submit"
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Delete
        </button>
      </Form>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Quote not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
