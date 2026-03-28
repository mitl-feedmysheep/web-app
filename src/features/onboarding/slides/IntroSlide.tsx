function IntroSlide() {
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex flex-1 flex-col justify-center px-5 py-6">
        {/* 앱 소개 */}
        <div className="mb-7 text-center">
          <h1 className="text-xl font-bold text-primary">IntoTheHeaven</h1>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            교회 안에서 부서별로 소그룹을 구성하고,<br />모든 활동과 기도제목을 함께 관리해요
          </p>
        </div>

        {/* 조직도 */}
        <div className="mb-2">
          {/* 루트: 교회 */}
          <div className="flex flex-col items-center">
            <div className="rounded-lg border-2 border-primary bg-primary/5 px-5 py-2">
              <span className="text-sm font-bold text-primary">우리교회</span>
            </div>

            <div className="my-1 h-4 w-px bg-border" />

            {/* 부서 행 */}
            <div className="relative flex w-full items-start justify-center gap-2">
              <div className="absolute top-0 left-[20%] right-[20%] h-px bg-border" />
              {[
                { name: "청년부", highlight: true },
                { name: "장년부", highlight: false },
                { name: "소년부", highlight: false },
              ].map(({ name, highlight }) => (
                <div key={name} className="flex flex-col items-center">
                  <div className="mb-1 h-3 w-px bg-border" />
                  <div className={`rounded-md border px-3 py-1.5 ${highlight ? "border-sky-300 bg-sky-50" : "border-border bg-muted/50"}`}>
                    <span className={`text-xs font-semibold ${highlight ? "text-sky-700" : "text-muted-foreground"}`}>{name}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 소그룹 행 (청년부 하위) */}
            <div className="mt-1 flex w-full flex-col items-center">
              <div className="h-3 w-px bg-border" />
              <div className="relative flex w-[70%] items-start justify-center gap-3">
                <div className="absolute top-0 left-[15%] right-[15%] h-px bg-border" />
                {[
                  { name: "1셀", members: ["홍길동", "이영희", "박서준"] },
                  { name: "2목장", members: ["김철수", "최지연"] },
                ].map(({ name, members }) => (
                  <div key={name} className="flex flex-col items-center">
                    <div className="mb-1 h-3 w-px bg-border" />
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5">
                      <span className="text-xs font-semibold text-emerald-700">{name}</span>
                    </div>
                    {/* 개인 */}
                    <div className="mt-1 h-3 w-px bg-border" />
                    <div className="flex flex-col items-center gap-0.5">
                      {members.map((m) => (
                        <div key={m} className="rounded-full bg-muted px-2 py-0.5">
                          <span className="text-[10px] text-muted-foreground">{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default IntroSlide;
