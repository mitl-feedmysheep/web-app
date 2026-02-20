import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BIBLE_VERSES = [
  "여호와는 나의 목자시니 내게 부족함이 없으리로다 — 시편 23:1",
  "항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라 — 데살로니가전서 5:16-18",
  "너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라 — 잠언 3:5",
  "두려워하지 말라 내가 너와 함께 함이라 — 이사야 41:10",
  "내가 주는 평안은 세상이 주는 것과 같지 아니하니라 — 요한복음 14:27",
  "여호와를 기뻐하라 그가 네 마음의 소원을 네게 이루어 주시리로다 — 시편 37:4",
  "강하고 담대하라 두려워하지 말며 놀라지 말라 — 여호수아 1:9",
  "새 힘을 얻으리니 독수리가 날개치며 올라감 같을 것이요 — 이사야 40:31",
];

function SplashScreen() {
  const navigate = useNavigate();
  const [showVerse, setShowVerse] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const verse = BIBLE_VERSES[Math.floor(Math.random() * BIBLE_VERSES.length)];

  useEffect(() => {
    const verseTimer = setTimeout(() => setShowVerse(true), 800);
    const fadeTimer = setTimeout(() => setFadeOut(true), 3500);
    const navTimer = setTimeout(() => {
      const token = localStorage.getItem("authToken");
      navigate(token ? "/" : "/login", { replace: true });
    }, 4200);

    return () => {
      clearTimeout(verseTimer);
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div
      className={`flex min-h-dvh flex-col items-center justify-center bg-primary/5 px-8 transition-opacity duration-700 ${fadeOut ? "opacity-0" : "opacity-100"}`}
    >
      <div className="mb-10 text-center">
        <div className="mb-2 text-4xl">🕊️</div>
        <h1 className="text-2xl font-bold text-primary">IntoTheHeaven</h1>
      </div>

      <p
        className={`max-w-xs text-center text-sm leading-relaxed text-muted-foreground transition-all duration-1000 ${showVerse ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
      >
        {verse}
      </p>
    </div>
  );
}

export default SplashScreen;
