import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { prayersApi, ApiError } from "@/lib/api";

const MAX_LENGTH = 200;

interface MyPrayerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 수정 모드일 때 대상. 없으면 새로 작성 */
  editing?: { id: string; prayerRequest: string } | null;
  onSaved: () => void;
}

/** 나의 기도 작성/수정 바텀시트 */
export default function MyPrayerSheet({ open, onOpenChange, editing, onSaved }: MyPrayerSheetProps) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setValue(editing?.prayerRequest ?? "");
      setConfirmDelete(false);
    }
  }, [open, editing]);

  const trimmed = value.trim();
  const isEdit = !!editing;
  const busy = saving || deleting;

  const handleSave = async () => {
    if (!trimmed || busy) return;
    setSaving(true);
    try {
      if (isEdit) {
        await prayersApi.update(editing.id, trimmed);
        toast.success("기도제목을 수정했어요");
      } else {
        await prayersApi.create(trimmed);
        toast.success("기도제목을 적었어요 🙏");
      }
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "저장에 실패했어요");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || busy) return;
    // 실수 방지: 첫 탭은 확인 상태로만 바꾼다
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await prayersApi.delete(editing.id);
      toast.success("기도제목을 삭제했어요");
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "삭제에 실패했어요");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-2xl">
        <SheetHeader className="pr-8">
          <SheetTitle>{isEdit ? "나의 기도 수정" : "나의 기도 쓰기"}</SheetTitle>
          <SheetDescription>모임과 상관없이 나만 볼 수 있는 기도제목이에요</SheetDescription>
        </SheetHeader>
        <div className="space-y-2 px-4">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, MAX_LENGTH))}
            placeholder="마음에 있는 기도제목을 적어보세요"
            className="min-h-28 resize-none"
            maxLength={MAX_LENGTH}
            autoFocus
          />
          <p className="text-right text-[11px] text-muted-foreground">
            {value.length}/{MAX_LENGTH}
          </p>
        </div>
        <div className="flex gap-2 px-4 pb-6">
          {isEdit && (
            <Button
              variant={confirmDelete ? "destructive" : "outline"}
              size={confirmDelete ? "default" : "icon"}
              onClick={handleDelete}
              disabled={busy}
              aria-label="삭제"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : confirmDelete ? (
                "정말 삭제"
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button className="flex-1" onClick={handleSave} disabled={!trimmed || busy}>
            {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {isEdit ? "수정하기" : "기도제목 남기기"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
