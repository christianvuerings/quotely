import { json, LoaderFunction } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { getQuotes, Quote } from "~/models/quote.server";

type LoaderData = {
  quotes: Pick<Quote, "id" | "title" | "body">[];
  userId: string;
};

// export async function loader({ params }): LoaderFunction {
//   return json<LoaderData>(await getQuotes({ userId: params.userId }));
// }
export const loader: LoaderFunction = async ({ request, params }) => {
  const { userId } = params;
  if (!userId) {
    throw new Response("Not Found", { status: 404 });
  }

  invariant(userId, "userId not found");

  const quotes = await getQuotes({ userId: `email#${userId}` });

  return json<LoaderData>({ quotes, userId });
};
