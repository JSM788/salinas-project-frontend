import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiRequest } from "../client";
import { resentInvitationSchema } from "../invitations";
import { pageSchema, queryPath } from "../pagination";
import { teamMembersSchema, teamMemberSchema, type TeamMember } from "../platform";

export interface TeamQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  active?: boolean;
}

export interface EditTeamProfileInput {
  displayName: string;
  email: string;
  phone?: string | null;
}

export const teamApi = {
  members(params: TeamQueryParams = {}) {
    return apiRequest(
      queryPath(API_ENDPOINTS.TEAM.MEMBERS, {
        ...params,
        active: params.active !== undefined ? String(params.active) : undefined,
      }),
      teamMembersSchema,
    );
  },

  editProfile(
    membershipId: string,
    payload: EditTeamProfileInput,
    idempotencyKey: string,
  ) {
    return apiRequest(
      API_ENDPOINTS.TEAM.MEMBER_PROFILE(membershipId),
      teamMemberSchema,
      {
        body: payload,
        key: idempotencyKey,
      },
    );
  },

  resendInvitation(membershipId: string, idempotencyKey: string) {
    return apiRequest(
      API_ENDPOINTS.TEAM.RESEND_INVITATION(membershipId),
      resentInvitationSchema,
      {
        body: {},
        key: idempotencyKey,
      },
    );
  },
};
