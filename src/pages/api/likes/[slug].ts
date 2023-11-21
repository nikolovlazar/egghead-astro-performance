import type { APIContext } from "astro";
import * as Sentry from "@sentry/astro";
import { eq } from "drizzle-orm";

import { db, likes } from "../../../db";

export const prerender = false;

export async function GET(context: APIContext) {
  const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
  const { slug } = context.params;

  if (!slug) {
    return new Response("Bad Request", { status: 400 });
  }

  const dbSpan = transaction?.startChild({
    op: "db.query",
    name: "Query post from DB",
  });

  const entry = db.select().from(likes).where(eq(likes.slug, slug)).get();

  dbSpan?.finish();

  if (!entry) {
    return new Response(
      JSON.stringify({
        slug,
        likes: 0,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  return new Response(JSON.stringify(entry), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST(context: APIContext) {
  const { slug } = context.params;

  if (!slug) {
    return new Response("Bad Request", { status: 400 });
  }

  const entryQuery = db.select().from(likes).where(eq(likes.slug, slug));

  const entry = Sentry.startSpan(
    {
      op: "db.query",
      name: entryQuery.toSQL().sql,
      data: { "db.system": "sqlite" },
    },
    () => entryQuery.get(),
  );

  if (!entry) {
    return new Response("Bad Request", { status: 400 });
    const insertedQuery = db
      .insert(likes)
      .values({ slug, likes: 1 })
      .returning();

    const inserted = Sentry.startSpan(
      {
        op: "db.query",
        name: insertedQuery.toSQL().sql,
        data: { "db.system": "sqlite" },
      },
      () => insertedQuery.get(),
    );

    return new Response(JSON.stringify(inserted), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const updateQuery = db
    .update(likes)
    .set({ likes: (entry.likes ?? 0) + 1 })
    .where(eq(likes.slug, slug))
    .returning();

  const updated = Sentry.startSpan(
    {
      op: "db.query",
      name: updateQuery.toSQL().sql,
      data: { "db.system": "sqlite" },
    },
    () => updateQuery.get(),
  );

  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
