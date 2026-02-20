import { authApi } from "./api";

type ShowToastFunction = (message: string) => void;
type NavigateFunction = (path: string, replace?: boolean) => void;

const globalHandlers: {
  showToast?: ShowToastFunction;
  navigate?: NavigateFunction;
} = {};

export const setGlobalToast = (showToast: ShowToastFunction) => {
  globalHandlers.showToast = showToast;
};

export const setGlobalNavigate = (navigate: NavigateFunction) => {
  globalHandlers.navigate = navigate;
};

export const isJwtExpiredError = (error: unknown): boolean => {
  const err = error as Record<string, unknown>;
  const resp = err?.response as Record<string, unknown> | undefined;

  if (resp?.error === "JWT_EXPIRED") return true;
  if ((err as Record<string, unknown>)?.error === "JWT_EXPIRED") return true;

  const msg = (err?.message as string) ?? "";
  if (msg.includes("JWT token has expired")) return true;
  if (err?.status === 401 && msg.toLowerCase().includes("jwt")) return true;

  return false;
};

export const handleJwtExpired = () => {
  authApi.logout();

  globalHandlers.showToast?.("로그인이 만료되었어요. 다시 로그인해주세요!");

  if (globalHandlers.navigate) {
    globalHandlers.navigate("/login", true);
  } else {
    window.location.href = "/login";
  }
};

export const checkAndHandleJwtExpired = (error: unknown): boolean => {
  if (isJwtExpiredError(error)) {
    handleJwtExpired();
    return true;
  }
  return false;
};
