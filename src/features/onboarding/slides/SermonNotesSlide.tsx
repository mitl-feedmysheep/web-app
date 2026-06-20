import { Plus, Calendar, User as UserIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import MockBottomNav from "../MockBottomNav";

const MOCK_NOTES = [
  {
    id: "1",
    title: "하나님의 은혜",
    serviceType: "주일 예배",
    preacher: "이목사",
    date: "3월 23일",
    scripture: "요한복음 3:16",
    preview: "오늘 설교에서 하나님의 무조건적인 사랑과 은혜에 대해 배웠습니다.",
  },
  {
    id: "2",
    title: "믿음으로 나아가라",
    serviceType: "수요 예배",
    preacher: "김목사",
    date: "3월 19일",
    scripture: "히브리서 11:1",
    preview: "히브리서 11장을 통해 믿음의 선진들이 어떻게 살았는지 배웠습니다.",
  },
];

function SermonNotesSlide() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <div className="flex-1 overflow-hidden">
        <div className="space-y-5 px-4 py-6 pb-8">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">나의 설교 노트</h1>
              <p className="mt-1 text-[9.5px] leading-relaxed text-muted-foreground/70">
                네 말씀은 내 발에 등이요 내 길에 빛이니이다 (시편 119:105)
              </p>
            </div>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* 노트 목록 */}
          <div className="space-y-6" data-highlight="">
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-muted-foreground">2025년 3월</p>
              <div className="space-y-2">
                {MOCK_NOTES.map((note) => (
                  <Card key={note.id} className="border border-transparent bg-accent/60 shadow-none">
                    <CardContent className="py-3">
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-snug line-clamp-1">{note.title}</p>
                          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            {note.serviceType}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/70 line-clamp-1">📖 {note.scripture}</p>
                        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground/70">
                          {note.preview}
                        </p>
                        <div className="flex items-center gap-3 pt-0.5">
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                            <Calendar className="h-3 w-3" />
                            {note.date}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                            <UserIcon className="h-3 w-3" />
                            {note.preacher}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MockBottomNav activeTab="/sermon-notes" />
    </div>
  );
}

export default SermonNotesSlide;
