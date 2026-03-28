import { useContext } from "react";
import { OnboardingCloseCtx } from "../onboarding-context";

function OutroSlide() {
  const onClose = useContext(OnboardingCloseCtx);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-background px-8 text-center">
      <h2 className="text-2xl font-bold leading-snug text-foreground">
        이제 우리 교회에<br />들어가 볼까요?
      </h2>

      <div className="mt-10 flex flex-col items-center gap-2">
        <div className="h-1 w-12 rounded-full bg-primary/30" />
        <div className="h-1 w-8 rounded-full bg-primary/20" />
        <div className="h-1 w-4 rounded-full bg-primary/10" />
      </div>

      <button
        className="mt-10 rounded-2xl bg-primary px-10 py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-opacity hover:opacity-90"
        onClick={onClose}
      >
        시작하기
      </button>
    </div>
  );
}

export default OutroSlide;
