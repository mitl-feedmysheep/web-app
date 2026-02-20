import { Heart } from "lucide-react";

function PrayerPage() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center px-4">
      <Heart className="mb-4 h-12 w-12 text-muted-foreground/30" />
      <p className="text-lg font-semibold text-foreground">기도제목</p>
      <p className="mt-1 text-sm text-muted-foreground">
        준비 중이에요. 조금만 기다려주세요!
      </p>
    </div>
  );
}

export default PrayerPage;
