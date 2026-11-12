import { z } from "zod";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiRequest } from "../client";
import { loginInput, sessionSchema, type Session } from "../contracts";

const loginResponseSchema = z.object({ authenticated: z.literal(true) });
const logoutResponseSchema = z.object({ loggedOut: z.boolean() });

export const authApi = {
  me(): Promise<Session> {
    return apiRequest(API_ENDPOINTS.AUTH.ME, sessionSchema);
  },

  async login(email: string, password: string): Promise<Session> {
    const body = loginInput.parse({ email, password });
    await apiRequest(API_ENDPOINTS.AUTH.LOGIN, loginResponseSchema, { body });
    return apiRequest(API_ENDPOINTS.AUTH.ME, sessionSchema);
  },

  logout() {
    return apiRequest(API_ENDPOINTS.AUTH.LOGOUT, logoutResponseSchema, { body: {} });
  },
};
