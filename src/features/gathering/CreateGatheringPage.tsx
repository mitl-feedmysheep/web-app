import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  Calendar,
  MapPin,
  Clock,
  FileText,
  Loader2,
  Check,
} from "lucide-react";
import { gatheringsApi, ApiError } from "@/lib/api";
import { convertKSTtoUTC, formatWeekFormat } from "@/lib/utils";
import { toast } from "sonner";

function CreateGatheringPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    date: today,
    place: "",
    startTime: "14:00",
    endTime: "16:00",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canSubmit =
    form.date && form.place.trim() && form.startTime && form.endTime;

  const handleSubmit = async () => {
    if (!groupId || !canSubmit) return;

    try {
      setSaving(true);
      await gatheringsApi.create({
        groupId,
        name: formatWeekFormat(form.date),
        description: form.description.trim(),
        date: form.date,
        startedAt: convertKSTtoUTC(form.date, form.startTime),
        endedAt: convertKSTtoUTC(form.date, form.endTime),
        place: form.place.trim(),
      });
      toast.success("새 모임이 생성되었어요");
      navigate(`/groups/${groupId}`, { replace: true });
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "모임 생성에 실패했습니다."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 px-4 py-4 pb-8">
      <button
        onClick={() => navigate(`/groups/${groupId}`)}
        className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        모임 목록
      </button>

      <h1 className="text-xl font-bold">새 모임 만들기</h1>

      <Card className="border-0 shadow-md shadow-primary/5">
        <CardContent className="space-y-4 py-5">
          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <Calendar className="h-3.5 w-3.5" />
              날짜
            </p>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <MapPin className="h-3.5 w-3.5" />
              장소
            </p>
            <Input
              value={form.place}
              onChange={(e) => handleChange("place", e.target.value)}
              placeholder="모임 장소를 입력해주세요"
            />
          </div>

          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <Clock className="h-3.5 w-3.5" />
              시간
            </p>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
              />
              <span className="shrink-0 text-xs text-muted-foreground">~</span>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <FileText className="h-3.5 w-3.5" />
              특이사항 (선택)
            </p>
            <Input
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="이번 모임 특이사항"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || saving}
            className="mt-2 w-full"
          >
            {saving ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-1.5 h-4 w-4" />
            )}
            모임 생성
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateGatheringPage;
