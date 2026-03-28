import { createContext } from "react";

export const OnboardingCloseCtx = createContext<() => void>(() => {});
