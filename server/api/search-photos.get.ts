import { z } from "zod";
import type { UnsplashSearchResponse } from "../utils/types";

const UNSPLASH_API_URL = "https://api.unsplash.com/search/photos";
const UNSPLASH_API_VERSION = "v1";

const querySchema = z.object({
  query: z.string().min(1, "query arg is required"),
  page: z.coerce.number().min(1).default(1),
  per_page: z.coerce.number().min(1).max(30).default(5),
  order_by: z.enum(["relevant", "latest"]).default("relevant"),
  color: z.string().optional(),
  orientation: z.enum(["landscape", "portrait", "squarish"]).optional(),
});

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const accessKey = config.unsplashAccessKey;
  if (!accessKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Unsplash API key is not configured.",
    });
  }
  const query = getQuery(event);
  const params = querySchema.parse(query);

  try {
    const response = await $fetch<UnsplashSearchResponse>(UNSPLASH_API_URL, {
      method: "GET",
      query: params,
      headers: {
        "Accept-Version": UNSPLASH_API_VERSION,
        Authorization: `Client-ID ${accessKey}`,
      },
    });
    return response;
  } catch (error: any) {
    console.error("Unsplash API request failed:", error);
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: "Failed to search photos from Unsplash",
    });
  }
});
