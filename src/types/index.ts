export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  isProvisioned?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  sex: string;
  birthday: string;
  phone: string;
  profileUrl: string;
  address?: string;
  occupation?: string;
  baptismStatus?: "BAPTIZED" | "NOT_BAPTIZED" | "PAEDOBAPTISM" | null;
  mbti?: string;
  role?: string;
}

export interface Church {
  id: string;
  name: string;
  location: string;
  number: string;
  homepageUrl: string;
  description: string;
  createdAt: string;
}

export type GroupType = "NORMAL" | "NEWCOMER";

export interface Group {
  id: string;
  name: string;
  description: string;
  churchId: string;
  type: GroupType;
  startDate: string;
  endDate: string;
  groupMemberCount: number;
  imageUrl?: string;
}

export interface EducationProgram {
  id: string;
  groupId: string;
  name: string;
  description: string;
  totalWeeks: number;
  graduatedCount: number;
  memberProgress: EducationMemberProgress[];
}

export interface EducationMemberProgress {
  groupMemberId: string;
  completedWeeks: number[];
  completedCount: number;
}

export interface EducationProgress {
  id: string;
  groupMemberId: string;
  gatheringId: string;
  weekNumber: number;
  completedDate: string;
}

export interface Gathering {
  id: string;
  name: string;
  description?: string;
  date: string;
  place: string;
  totalWorshipAttendanceCount: number;
  totalGatheringAttendanceCount: number;
  totalPrayerRequestCount: number;
  leaderComment?: string;
  adminComment?: string;
}

export interface CreateGatheringRequest {
  groupId: string;
  name: string;
  description: string;
  date: string;
  startedAt: string;
  endedAt: string;
  place: string;
}

export interface GatheringResponse {
  id: string;
  name: string;
  description: string;
  date: string;
  startedAt: string;
  endedAt: string;
  place: string;
  leaderComment?: string;
  adminComment?: string;
}

export interface GatheringDetail {
  id: string;
  name: string;
  description: string;
  date: string;
  startedAt: string;
  endedAt: string;
  place: string;
  gatheringMembers: GatheringMember[];
  leaderComment?: string;
  adminComment?: string;
  medias?: Array<{
    id: string;
    mediaType: "THUMBNAIL" | "MEDIUM";
    entityType: string;
    entityId: string;
    url: string;
    createdAt: string;
  }>;
}

export interface GatheringMember {
  memberId: string;
  groupMemberId: string;
  name: string;
  birthday?: string;
  role?: string;
  worshipAttendance: boolean;
  gatheringAttendance: boolean;
  story: string;
  goal?: string;
  prayerTopics?: string;
  prayers: Prayer[];
}

export interface Prayer {
  id: string;
  prayerRequest: string;
  description: string;
  answered: boolean;
}

export interface MyPrayer {
  id: string;
  prayerRequest: string;
  description: string | null;
  isAnswered: boolean;
  groupName: string | null;
  gatheringDate: string | null;
}

export interface SignupRequest {
  password: string;
  name: string;
  email: string;
  birthdate: string;
  sex: "M" | "F";
  phone: string;
  address: string;
}

export interface SignupResponse {
  memberId: string;
  message: string;
}

export interface JoinRequest {
  id: string;
  churchId: string;
  churchName: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
}
