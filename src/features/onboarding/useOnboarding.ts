import { useState } from "react";

export function useOnboarding() {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);

  const close = () => {
    setIsOpen(false);
    try {
      localStorage.setItem("onboarding.seen", "true");
    } catch {}
  };

  const shouldAutoShow = () =>
    localStorage.getItem("onboarding.seen") !== "true";

  return { isOpen, open, close, shouldAutoShow };
}
