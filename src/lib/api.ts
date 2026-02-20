import type {
  Church,
  CreateGatheringRequest,
  Gathering,
  GatheringDetail,
  GatheringResponse,
  Group,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  User,
} from "@/types";
import { checkAndHandleJwtExpired } from "./auth-handler";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export class ApiError extends Error {
  status: number;
  response?: unknown;

  constructor(message: string, status: number, response?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.response = response;
  }
}

async function authedFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("authToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = token;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const apiError = new ApiError(
      (errorData as Record<string, string>).message ||
        `HTTP ${response.status}`,
      response.status,
      errorData
    );
    checkAndHandleJwtExpired(apiError);
    throw apiError;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : undefined;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        (errorData as Record<string, string>).message ||
          `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    const data: LoginResponse = await response.json();

    if (data.accessToken) {
      const provisioned = (data as LoginResponse & { isProvisioned?: boolean })
        .isProvisioned;
      if (provisioned === false) {
        localStorage.setItem("authToken", data.accessToken);
      } else if (provisioned === true) {
        localStorage.setItem("provisionToken", data.accessToken);
        localStorage.setItem("provisionPending", "true");
      }
    }

    return data;
  },

  sendEmailVerification: (email: string) =>
    authedFetch<void>("/auth/verification/email", {
      method: "POST",
      body: JSON.stringify({ email, type: "SIGNUP" }),
    }),

  confirmEmailVerification: (email: string, code: string) =>
    authedFetch<void>("/auth/verification/email/confirm", {
      method: "POST",
      body: JSON.stringify({ email, code, type: "SIGNUP" }),
    }),

  sendPasswordResetCode: (email: string) =>
    authedFetch<void>("/auth/verification/email", {
      method: "POST",
      body: JSON.stringify({ email, type: "PASSWORD_RESET" }),
    }),

  confirmPasswordResetCode: (email: string, code: string) =>
    authedFetch<void>("/auth/verification/email/confirm", {
      method: "POST",
      body: JSON.stringify({ email, code, type: "PASSWORD_RESET" }),
    }),

  resetPassword: (email: string, newPassword: string) =>
    authedFetch<void>("/auth/password/reset", {
      method: "POST",
      body: JSON.stringify({ email, newPassword }),
    }),

  signup: (payload: SignupRequest) =>
    authedFetch<SignupResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("churchId");
    localStorage.removeItem("provisionToken");
    localStorage.removeItem("provisionPending");
  },

  isAuthenticated: (): boolean => !!localStorage.getItem("authToken"),

  getToken: (): string | null => localStorage.getItem("authToken"),
};

export const membersApi = {
  getMyInfo: () => authedFetch<User>("/members/me"),

  verifyMember: async (email: string, name: string): Promise<boolean> => {
    await authedFetch<void>(
      `/auth/member/verify?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`
    );
    return true;
  },

  changePassword: (currentPassword: string, newPassword: string) =>
    authedFetch<void>("/members/password/change", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  changeEmail: (newEmail: string, tokenOverride?: string) =>
    authedFetch<void>("/members/email/change", {
      method: "POST",
      headers: tokenOverride
        ? { Authorization: tokenOverride }
        : undefined,
      body: JSON.stringify({ newEmail }),
    }),

  updateMyInfo: (payload: {
    id: string;
    name: string;
    sex: "M" | "F";
    birthday: string;
    phone: string;
  }) =>
    authedFetch<User>("/members/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};

export const churchesApi = {
  getMyChurches: () => authedFetch<Church[]>("/churches"),

  getPrayerRequestCount: (churchId: string) =>
    authedFetch<{ count: number }>(
      `/churches/${churchId}/prayer-request-count`
    ),
};

export const groupsApi = {
  getGroupsByChurch: (churchId: string) =>
    authedFetch<Group[]>(`/churches/${churchId}/groups`),

  getGroupMembers: (groupId: string) =>
    authedFetch<User[]>(`/groups/${groupId}/members`),

  getGroupGatherings: (groupId: string) =>
    authedFetch<Gathering[]>(`/groups/${groupId}/gatherings`),

  getMyInfoInGroup: (groupId: string) =>
    authedFetch<User>(`/groups/${groupId}/me`),

  changeMemberRole: (groupId: string, groupMemberId: string, newRole: string) =>
    authedFetch<User>(`/groups/${groupId}/groupMembers/${groupMemberId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ newRole }),
    }),
};

export const gatheringsApi = {
  create: (data: CreateGatheringRequest) =>
    authedFetch<GatheringResponse>("/gatherings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getDetail: (gatheringId: string) =>
    authedFetch<GatheringDetail>(`/gatherings/${gatheringId}`),

  update: (
    gatheringId: string,
    payload: {
      name: string;
      date: string;
      place: string;
      startedAt: string;
      endedAt: string;
      description: string;
      leaderComment?: string;
    }
  ) =>
    authedFetch<GatheringResponse>(`/gatherings/${gatheringId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  updateMember: (
    gatheringId: string,
    groupMemberId: string,
    updateData: {
      worshipAttendance: boolean;
      gatheringAttendance: boolean;
      story: string | null;
      goal?: string | null;
      prayers: Array<{ prayerRequest: string; description: string }>;
    }
  ) =>
    authedFetch<{
      id: string;
      worshipAttendance: boolean;
      gatheringAttendance: boolean;
      story: string | null;
      goal?: string | null;
      prayers: Array<{
        id: string;
        prayerRequest: string;
        description: string;
        answered: boolean;
      }>;
    }>(`/gatherings/${gatheringId}/groupMember/${groupMemberId}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    }),
};

export const prayersApi = {
  delete: (prayerId: string) =>
    authedFetch<void>(`/prayers/${prayerId}`, { method: "DELETE" }),
};

export const mediaApi = {
  getPresignedUrls: (
    entityType: string,
    entityId: string,
    fileName: string,
    contentType: string,
    fileSize: number
  ) =>
    authedFetch<{
      uploads: Array<{
        mediaType: "THUMBNAIL" | "MEDIUM";
        uploadUrl: string;
        publicUrl: string;
      }>;
    }>("/media/presigned-urls", {
      method: "POST",
      body: JSON.stringify({ entityType, entityId, fileName, contentType, fileSize }),
    }),

  uploadFile: (uploadUrl: string, file: File): Promise<void> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl, true);
      xhr.withCredentials = false;
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new ApiError(`Upload failed: ${xhr.status}`, xhr.status));
      xhr.onerror = () => reject(new ApiError("Network error during upload", 0));
      xhr.send(file);
    }),

  completeUpload: (
    entityType: string,
    entityId: string,
    uploads: Array<{ mediaType: string; publicUrl: string }>
  ) =>
    authedFetch<{
      medias: Array<{
        mediaId: string;
        mediaType: string;
        publicUrl: string;
        createdAt: string;
      }>;
      totalCount: number;
      completedAt: string;
    }>("/media/complete", {
      method: "POST",
      body: JSON.stringify({ entityType, entityId, uploads }),
    }),

  deleteMediaById: (mediaId: string) =>
    authedFetch<void>(`/media/${mediaId}`, { method: "DELETE" }),

  deleteMediaByEntityId: (entityId: string) =>
    authedFetch<void>(`/media/entity/${entityId}`, { method: "DELETE" }),
};
