import * as Sentry from "@sentry/astro";
import { sequence } from "astro:middleware";

export const onRequest = sequence(Sentry.handleRequest());
