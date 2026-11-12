import { z } from "zod";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { localHttpClient, requestWithSchema } from "../http";
import { queryPath } from "../pagination";

export const placeSuggestionSchema = z.object({
  placeId: z.string(),
  text: z.string(),
  mainText: z.string().default(""),
  secondaryText: z.string().default(""),
});

export const placesAutocompleteResponseSchema = z.object({
  suggestions: z.array(placeSuggestionSchema).default([]),
});

export const placeDetailsResponseSchema = z.object({
  address: z.string().optional(),
  district: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const placesApi = {
  autocomplete(input: string) {
    return requestWithSchema(
      localHttpClient,
      queryPath(API_ENDPOINTS.LOCAL_API.PLACES_AUTOCOMPLETE, { input }),
      placesAutocompleteResponseSchema,
    );
  },

  details(placeId: string) {
    return requestWithSchema(
      localHttpClient,
      queryPath(API_ENDPOINTS.LOCAL_API.PLACES_DETAILS, { placeId }),
      placeDetailsResponseSchema,
    );
  },
};
