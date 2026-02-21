import { useEffect, useState } from "react";

const BIBLE_VERSES = [
  {
    text: "여호와는 나의 목자시니 내게 부족함이 없으리로다",
    ref: "시편 23:1",
  },
  {
    text: "항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라",
    ref: "데살로니가전서 5:16-18",
  },
  {
    text: "너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라",
    ref: "잠언 3:5",
  },
  {
    text: "두려워하지 말라 내가 너와 함께 함이라",
    ref: "이사야 41:10",
  },
  {
    text: "내가 주는 평안은 세상이 주는 것과 같지 아니하니라",
    ref: "요한복음 14:27",
  },
  {
    text: "여호와를 기뻐하라 그가 네 마음의 소원을 네게 이루어 주시리로다",
    ref: "시편 37:4",
  },
  {
    text: "강하고 담대하라 두려워하지 말며 놀라지 말라",
    ref: "여호수아 1:9",
  },
  {
    text: "새 힘을 얻으리니 독수리가 날개치며 올라감 같을 것이요",
    ref: "이사야 40:31",
  },
  {
    text: "그의 안에서 건물마다 서로 연결하여 주 안에서 성전이 되어 가고",
    ref: "에베소서 2:21",
  },
  {
    text: "우리는 그가 지으신 바라 그리스도 예수 안에서 선한 일을 위하여 지으심을 받은 자니",
    ref: "에베소서 2:10",
  },
];

interface SplashScreenProps {
  onComplete: () => void;
}

function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showVerse, setShowVerse] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const [verse] = useState(
    () => BIBLE_VERSES[Math.floor(Math.random() * BIBLE_VERSES.length)]
  );

  useEffect(() => {
    const verseTimer = setTimeout(() => setShowVerse(true), 500);
    const fadeTimer = setTimeout(() => setFadeOut(true), 2300);
    const completeTimer = setTimeout(() => onComplete(), 3000);

    return () => {
      clearTimeout(verseTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`flex min-h-dvh flex-col items-center justify-center px-10 transition-opacity duration-700 ${fadeOut ? "opacity-0" : "opacity-100"}`}
    >
      <div className="mb-12 text-center">
        <div className="mb-4 text-7xl">🕊️</div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          IntoTheHeaven
        </h1>
      </div>

      <div
        className={`max-w-[280px] text-center transition-all duration-1000 ${showVerse ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
      >
        <p className="text-[15px] leading-7 text-gray-600">
          {verse.text}
        </p>
        <p className="mt-4 text-[11px] text-gray-400">
          {verse.ref}
        </p>
      </div>
    </div>
  );
}

export default SplashScreen;
