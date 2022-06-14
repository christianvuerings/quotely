import arc from "@architect/functions";
import cuid from "cuid";

import type { User } from "./user.server";

export type Quote = {
	id: ReturnType<typeof cuid>;
	userId: User["id"];
	title: string;
	body: string;
};

type QuoteItem = {
	pk: User["id"];
	sk: `quote#${Quote["id"]}`;
};

const skToId = (sk: QuoteItem["sk"]): Quote["id"] => sk.replace(/^quote#/, "");
const idToSk = (id: Quote["id"]): QuoteItem["sk"] => `quote#${id}`;

export async function getQuote({
	id,
	userId,
}: Pick<Quote, "id" | "userId">): Promise<Quote | null> {
	const db = await arc.tables();

	const result = await await db.quote.get({ pk: userId, sk: idToSk(id) });

	if (result) {
		return {
			userId: result.pk,
			id: result.sk,
			title: result.title,
			body: result.body,
		};
	}
	return null;
}

export async function getQuoteListItems({
	userId,
}: Pick<Quote, "userId">): Promise<
	Array<Pick<Quote, "id" | "title" | "body">>
> {
	const db = await arc.tables();

	const result = await db.quote.query({
		KeyConditionExpression: "pk = :pk",
		ExpressionAttributeValues: { ":pk": userId },
	});

	return result.Items.map((n: any) => ({
		title: n.title,
		body: n.body,
		id: skToId(n.sk),
	}));
}

export async function getQuotes({
	userId,
}: Pick<Quote, "userId">): Promise<
	Array<Pick<Quote, "id" | "title" | "body">>
> {
	const db = await arc.tables();

	const result = await db.quote.query({
		KeyConditionExpression: "pk = :pk",
		ExpressionAttributeValues: { ":pk": userId },
	});

	return result.Items.map((n: any) => ({
		title: n.title,
		body: n.body,
		id: skToId(n.sk),
	}));
}

export type SubQuote = Pick<Quote, "body" | "title" | "userId">;

export async function createQuote({
	body,
	title,
	userId,
}: SubQuote): Promise<Quote> {
	const db = await arc.tables();

	const result = await db.quote.put({
		pk: userId,
		sk: idToSk(cuid()),
		title: title,
		body: body,
	});
	return {
		id: skToId(result.sk),
		userId: result.pk,
		title: result.title,
		body: result.body,
	};
}

export async function createQuotes({
	quotes,
}: {
	quotes: SubQuote[];
}): Promise<Quote[]> {
	const results = await Promise.all(quotes.map(createQuote));
	return results;
}

export async function deleteQuote({
	id,
	userId,
}: Pick<Quote, "id" | "userId">) {
	const db = await arc.tables();
	return db.quote.delete({ pk: userId, sk: idToSk(id) });
}
