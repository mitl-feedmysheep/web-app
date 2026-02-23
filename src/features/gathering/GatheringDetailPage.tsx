import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Clock,
  FileText,
  Heart,
  MessageSquare,
  Target,
  Plus,
  Trash2,
  Loader2,
  Pencil,
  Check,
  Camera,
  X,
  BookOpen,
} from "lucide-react";
import { gatheringsApi, groupsApi, prayersApi, mediaApi, ApiError } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { convertKSTtoUTC, formatWeekFormat } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { GatheringDetail, GatheringMember, User } from "@/types";

function GatheringDetailPage() {
  const { groupId, gatheringId } = useParams<{
    groupId: string;
    gatheringId: string;
  }>();
  const navigate = useNavigate();

  const [gathering, setGathering] = useState<GatheringDetail | null>(null);
  const [myInfo, setMyInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingMeeting, setEditingMeeting] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    date: "",
    place: "",
    startTime: "",
    endTime: "",
    description: "",
    leaderComment: "",
  });
  const [savingMeeting, setSavingMeeting] = useState(false);

  const [viewMode, setViewMode] = useState<"full" | "prayer">("full");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const isLeader = myInfo?.role === "LEADER";
  const canEdit =
    myInfo?.role === "LEADER" || myInfo?.role === "SUB_LEADER";

  const toHM = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    } catch {
      return "00:00";
    }
  };

  const formatDateKR = (ds: string) => {
    try {
      const d = new Date(ds);
      const wd = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
      return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${wd})`;
    } catch {
      return ds;
    }
  };

  const formatTimeKR = (iso: string) => {
    try {
      const d = new Date(iso);
      const h = d.getHours();
      const m = String(d.getMinutes()).padStart(2, "0");
      const ampm = h >= 12 ? "오후" : "오전";
      return `${ampm} ${h >= 12 ? h - 12 || 12 : h || 12}:${m}`;
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (!gatheringId || !groupId) return;
    const load = async () => {
      try {
        const [detail, me] = await Promise.all([
          gatheringsApi.getDetail(gatheringId),
          groupsApi.getMyInfoInGroup(groupId),
        ]);
        setGathering(detail);
        setMyInfo(me);
        setMeetingForm({
          date: detail.date,
          place: detail.place || "",
          startTime: toHM(detail.startedAt),
          endTime: toHM(detail.endedAt),
          description: (detail.description || "").trim(),
          leaderComment: (detail.leaderComment || "").trim(),
        });
      } catch {
        toast.error("모임 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [gatheringId, groupId]);

  useEffect(() => {
    if (previewIndex !== null) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [previewIndex]);

  const handleMeetingChange = (field: string, value: string) => {
    setMeetingForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleStartEditing = () => {
    if (!gathering) return;
    setMeetingForm({
      date: gathering.date,
      place: gathering.place || "",
      startTime: toHM(gathering.startedAt),
      endTime: toHM(gathering.endedAt),
      description: (gathering.description || "").trim(),
      leaderComment: (gathering.leaderComment || "").trim(),
    });
    setEditingMeeting(true);
  };

  const handleSaveMeeting = async () => {
    if (!gathering || !canEdit) return;
    try {
      setSavingMeeting(true);
      const res = await gatheringsApi.update(gathering.id, {
        name: formatWeekFormat(meetingForm.date),
        date: meetingForm.date,
        place: meetingForm.place.trim(),
        startedAt: convertKSTtoUTC(meetingForm.date, meetingForm.startTime),
        endedAt: convertKSTtoUTC(meetingForm.date, meetingForm.endTime),
        description: meetingForm.description.trim(),
        leaderComment: meetingForm.leaderComment.trim(),
      });
      setGathering((prev) =>
        prev
          ? {
              ...prev,
              date: res.date,
              place: res.place,
              startedAt: res.startedAt,
              endedAt: res.endedAt,
              description: res.description,
              leaderComment: res.leaderComment,
            }
          : prev
      );
      setEditingMeeting(false);
      toast.success("모임 정보가 수정되었습니다");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "저장에 실패했습니다."
      );
    } finally {
      setSavingMeeting(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0 || !gathering) return;
    const files = Array.from(fileList);
    e.target.value = "";

    try {
      setUploadingPhoto(true);
      for (const file of files) {
        const { uploads } = await mediaApi.getPresignedUrls(
          "GATHERING",
          gathering.id,
          file.name,
          file.type,
          file.size
        );
        const mediumUpload = uploads.find((u) => u.mediaType === "MEDIUM");
        if (!mediumUpload) throw new Error("MEDIUM upload URL not found");

        await mediaApi.uploadFile(mediumUpload.uploadUrl, file);

        await mediaApi.completeUpload(
          "GATHERING",
          gathering.id,
          [{ mediaType: mediumUpload.mediaType, publicUrl: mediumUpload.publicUrl }]
        );

        const updated = await gatheringsApi.getDetail(gathering.id);
        setGathering(updated);
      }
      toast.success(`${files.length}장의 사진이 업로드되었습니다`);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "사진 업로드에 실패했습니다."
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (mediaId: string) => {
    if (!gathering) return;
    try {
      setDeletingMediaId(mediaId);
      await mediaApi.deleteMediaById(mediaId);
      setGathering((prev) =>
        prev
          ? { ...prev, medias: (prev.medias || []).filter((m) => m.id !== mediaId) }
          : prev
      );
      toast.success("사진이 삭제되었습니다");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "사진 삭제에 실패했습니다."
      );
    } finally {
      setDeletingMediaId(null);
      setDeleteTargetId(null);
    }
  };



  const mediumPhotos = (gathering?.medias || []).filter(
    (m) => m.mediaType === "MEDIUM"
  );

  if (loading || !gathering) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5 px-4 py-4 pb-8">
      <button
        onClick={() => navigate(`/groups/${groupId}`)}
        className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        모임 목록
      </button>

      {/* ── Meeting Info Card ── */}
      <Card className="border-0 shadow-md shadow-primary/5">
        <CardContent className="py-4">
          {editingMeeting ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 shrink-0 text-primary" />
                <Input
                  type="date"
                  value={meetingForm.date}
                  onChange={(e) => handleMeetingChange("date", e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <Input
                  value={meetingForm.place}
                  onChange={(e) => handleMeetingChange("place", e.target.value)}
                  placeholder="장소"
                  className="h-9"
                />
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-primary" />
                <div className="flex flex-1 items-center gap-1.5">
                  <Input
                    type="time"
                    value={meetingForm.startTime}
                    onChange={(e) =>
                      handleMeetingChange("startTime", e.target.value)
                    }
                    className="h-9"
                  />
                  <span className="text-xs text-muted-foreground">~</span>
                  <Input
                    type="time"
                    value={meetingForm.endTime}
                    onChange={(e) =>
                      handleMeetingChange("endTime", e.target.value)
                    }
                    className="h-9"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 shrink-0 text-primary" />
                <Input
                  value={meetingForm.description}
                  onChange={(e) =>
                    handleMeetingChange("description", e.target.value)
                  }
                  placeholder="특이사항"
                  className="h-9"
                />
              </div>
              {isLeader && (
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="h-4 w-4 shrink-0 text-primary" />
                  <Input
                    value={meetingForm.leaderComment}
                    onChange={(e) =>
                      handleMeetingChange("leaderComment", e.target.value)
                    }
                    placeholder="리더 코멘트"
                    className="h-9"
                  />
                </div>
              )}
              <Button
                onClick={handleSaveMeeting}
                disabled={savingMeeting}
                className="w-full"
                size="sm"
              >
                {savingMeeting ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-1.5 h-4 w-4" />
                )}
                완료
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm">
                <Calendar className="h-4 w-4 shrink-0 text-primary" />
                <span className="font-medium">
                  {formatDateKR(gathering.date)}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span>{gathering.place}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Clock className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  {formatTimeKR(gathering.startedAt)} ~{" "}
                  {formatTimeKR(gathering.endedAt)}
                </span>
              </div>
              {gathering.description && (
                <div className="flex items-center gap-2.5 text-sm">
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">
                    {gathering.description}
                  </span>
                </div>
              )}
              {isLeader && (
                <div className="flex items-center gap-2.5 text-sm">
                  <MessageSquare className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">
                    {(gathering.leaderComment || "").trim() || "리더 코멘트"}
                  </span>
                </div>
              )}
              {isLeader && (
                <div className="flex items-center gap-2.5 text-sm">
                  <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">
                    {(gathering.adminComment || "").trim() || "목회자 코멘트"}
                  </span>
                </div>
              )}
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1 w-full gap-1.5 text-xs text-muted-foreground"
                  onClick={handleStartEditing}
                >
                  <Pencil className="h-3 w-3" />
                  수정
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Photo Gallery ── */}
      <div className="space-y-2">

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {mediumPhotos.map((media, idx) => (
            <div
              key={media.id}
              className="relative shrink-0"
            >
              <img
                src={media.url}
                alt=""
                className="h-28 w-28 cursor-pointer rounded-xl object-cover"
                crossOrigin="anonymous"
                onClick={() => setPreviewIndex(idx)}
              />
              {canEdit && (
                <button
                  onClick={() => setDeleteTargetId(media.id)}
                  disabled={deletingMediaId === media.id}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/40 text-white"
                >
                  {deletingMediaId === media.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <X className="h-3 w-3" strokeWidth={2.5} />
                  )}
                </button>
              )}
            </div>
          ))}
          {canEdit && (
            <label className="flex h-28 w-28 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
              />
              {uploadingPhoto ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <Camera className="mb-1 h-6 w-6" />
                  <span className="text-xs">추가</span>
                </>
              )}
            </label>
          )}
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <Dialog open={deleteTargetId !== null} onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }}>
        <DialogContent showCloseButton={false} className="max-w-[280px]">
          <DialogHeader>
            <DialogTitle className="sr-only">삭제 확인</DialogTitle>
            <DialogDescription className="text-center text-base text-foreground">
              이 사진을 삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteTargetId(null)}
            >
              취소
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              disabled={deletingMediaId !== null}
              onClick={() => {
                if (deleteTargetId) handleDeletePhoto(deleteTargetId);
              }}
            >
              {deletingMediaId ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : null}
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Photo Preview ── */}
      {previewIndex !== null && mediumPhotos[previewIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setPreviewIndex(null); }}
        >
          <button
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white"
            onClick={() => setPreviewIndex(null)}
          >
            <X className="h-5 w-5" />
          </button>

          {previewIndex > 0 && (
            <button
              className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white"
              onClick={() => setPreviewIndex(previewIndex - 1)}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {previewIndex < mediumPhotos.length - 1 && (
            <button
              className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white"
              onClick={() => setPreviewIndex(previewIndex + 1)}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          <div className="absolute bottom-4 z-10 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white">
            <span>{previewIndex + 1}</span>
            <span className="text-white/50"> / {mediumPhotos.length}</span>
          </div>

          <img
            src={mediumPhotos[previewIndex].url}
            alt=""
            className="max-h-[80vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            crossOrigin="anonymous"
            style={{ WebkitTouchCallout: "default" } as React.CSSProperties}
          />
        </div>
      )}

      {/* ── View Toggle ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">오늘의 기록</h2>
        <div className="relative flex h-8 w-[140px] items-center rounded-full bg-muted p-0.5">
          <div
            className={cn(
              "absolute top-0.5 h-7 w-[calc(50%-2px)] rounded-full bg-primary shadow-sm transition-all duration-200",
              viewMode === "prayer" ? "left-[calc(50%+1px)]" : "left-0.5"
            )}
          />
          <button
            onClick={() => setViewMode("full")}
            className={cn(
              "relative z-10 flex-1 text-xs font-medium transition-colors",
              viewMode === "full"
                ? "text-primary-foreground"
                : "text-muted-foreground"
            )}
          >
            전체
          </button>
          <button
            onClick={() => setViewMode("prayer")}
            className={cn(
              "relative z-10 flex-1 text-xs font-medium transition-colors",
              viewMode === "prayer"
                ? "text-primary-foreground"
                : "text-muted-foreground"
            )}
          >
            기도제목
          </button>
        </div>
      </div>

      {/* ── Full View ── */}
      {viewMode === "full" && (
        <div className="space-y-3">
          {gathering.gatheringMembers.map((member) => (
            <MemberCard
              key={member.memberId}
              member={member}
              isExpanded={expandedId === member.memberId}
              onToggle={() =>
                setExpandedId(
                  expandedId === member.memberId ? null : member.memberId
                )
              }
              gatheringId={gatheringId!}
              canEdit={canEdit}
              globalDisabled={
                updatingMemberId !== null &&
                updatingMemberId !== member.memberId
              }
              onUpdateStart={() => setUpdatingMemberId(member.memberId)}
              onUpdateEnd={() => setUpdatingMemberId(null)}
              onUpdate={(updated) => {
                setGathering({
                  ...gathering,
                  gatheringMembers: gathering.gatheringMembers.map((m) =>
                    m.memberId === updated.memberId ? updated : m
                  ),
                });
              }}
            />
          ))}
        </div>
      )}

      {/* ── Prayer View ── */}
      {viewMode === "prayer" && (
        <div className="space-y-3">
          {gathering.gatheringMembers.map((member) => (
            <Card
              key={member.memberId}
              className="border-0 bg-accent/60 shadow-none"
            >
              <CardContent className="py-3">
                <p className="mb-2 font-semibold">{member.name}</p>
                {member.prayers.length > 0 ? (
                  <ul className="space-y-1.5">
                    {member.prayers.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-start gap-2 rounded-lg bg-background px-3 py-2 text-sm"
                      >
                        <Heart className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>{p.prayerRequest}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    기도제목이 없습니다
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Attendance chip (no border when unchecked) ── */

function AttendanceChip({
  label,
  checked,
  loading: isLoading,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  loading: boolean;
  disabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-all",
        checked ? "bg-muted text-foreground" : "text-muted-foreground",
        (disabled || isLoading) && "opacity-40 cursor-not-allowed"
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <div
          className={cn(
            "flex h-4.5 w-4.5 items-center justify-center rounded transition-colors",
            checked ? "bg-primary" : "bg-muted-foreground/20"
          )}
        >
          {checked && (
            <Check
              className="h-3 w-3 text-primary-foreground"
              strokeWidth={3}
            />
          )}
        </div>
      )}
      {label}
    </button>
  );
}

/* ── Member Card ── */

interface MemberCardProps {
  member: GatheringMember;
  isExpanded: boolean;
  onToggle: () => void;
  gatheringId: string;
  canEdit: boolean;
  globalDisabled: boolean;
  onUpdateStart: () => void;
  onUpdateEnd: () => void;
  onUpdate: (member: GatheringMember) => void;
}

function MemberCard({
  member,
  isExpanded,
  onToggle,
  gatheringId,
  canEdit,
  globalDisabled,
  onUpdateStart,
  onUpdateEnd,
  onUpdate,
}: MemberCardProps) {
  const [editingContent, setEditingContent] = useState(false);
  const [story, setStory] = useState(member.story ?? "");
  const [goal, setGoal] = useState(member.goal ?? "");
  const [prayerInputs, setPrayerInputs] = useState(
    member.prayers.length > 0
      ? member.prayers.map((p) => ({ id: p.id, value: p.prayerRequest }))
      : [{ id: "new", value: "" }]
  );
  const [saving, setSaving] = useState(false);
  const [worshipLoading, setWorshipLoading] = useState(false);
  const [gatheringLoading, setGatheringLoading] = useState(false);

  const buildPrayerPayload = useCallback(
    () =>
      prayerInputs
        .filter((i) => i.value.trim())
        .map((i) => ({
          prayerRequest: i.value,
          description: "",
          ...(i.id !== "new" && { id: i.id }),
        })),
    [prayerInputs]
  );

  const handleAttendance = useCallback(
    async (type: "worship" | "gathering", value: boolean) => {
      if (!canEdit || globalDisabled) return;
      const setLoadingFn =
        type === "worship" ? setWorshipLoading : setGatheringLoading;
      setLoadingFn(true);
      onUpdateStart();
      try {
        await gatheringsApi.updateMember(gatheringId, member.groupMemberId, {
          worshipAttendance:
            type === "worship" ? value : member.worshipAttendance,
          gatheringAttendance:
            type === "gathering" ? value : member.gatheringAttendance,
          story: story.trim() || null,
          goal: goal.trim() || null,
          prayers: buildPrayerPayload(),
        });
        onUpdate({
          ...member,
          [type === "worship"
            ? "worshipAttendance"
            : "gatheringAttendance"]: value,
        });
      } catch (err) {
        toast.error(
          err instanceof ApiError ? err.message : "업데이트에 실패했습니다."
        );
      } finally {
        setLoadingFn(false);
        onUpdateEnd();
      }
    },
    [
      canEdit,
      globalDisabled,
      gatheringId,
      member,
      story,
      goal,
      buildPrayerPayload,
      onUpdate,
      onUpdateStart,
      onUpdateEnd,
    ]
  );

  const handleStartEditing = () => {
    setStory(member.story ?? "");
    setGoal(member.goal ?? "");
    setPrayerInputs(
      member.prayers.length > 0
        ? member.prayers.map((p) => ({ id: p.id, value: p.prayerRequest }))
        : [{ id: "new", value: "" }]
    );
    setEditingContent(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      onUpdateStart();
      const res = await gatheringsApi.updateMember(
        gatheringId,
        member.groupMemberId,
        {
          worshipAttendance: member.worshipAttendance,
          gatheringAttendance: member.gatheringAttendance,
          story: story.trim() || null,
          goal: goal.trim() || null,
          prayers: buildPrayerPayload(),
        }
      );
      onUpdate({
        ...member,
        story: story.trim() || "",
        goal: res.goal ?? goal,
        prayers: res.prayers,
      });
      setPrayerInputs(
        res.prayers.length > 0
          ? res.prayers.map((p) => ({ id: p.id, value: p.prayerRequest }))
          : [{ id: "new", value: "" }]
      );
      setEditingContent(false);
      toast.success(`${member.name}님 정보가 저장되었어요`);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "저장에 실패했습니다."
      );
    } finally {
      setSaving(false);
      onUpdateEnd();
    }
  };

  const handleDeletePrayer = async (index: number) => {
    const input = prayerInputs[index];
    if (input.id !== "new") {
      try {
        await prayersApi.delete(input.id);
        const updated = member.prayers.filter((p) => p.id !== input.id);
        onUpdate({ ...member, prayers: updated });
      } catch (err) {
        toast.error(
          err instanceof ApiError ? err.message : "삭제에 실패했습니다."
        );
        return;
      }
    }
    setPrayerInputs((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length === 0 ? [{ id: "new", value: "" }] : next;
    });
  };

  return (
    <Card
      className={cn(
        "border-0 bg-accent/40 shadow-none transition-opacity",
        globalDisabled && "opacity-50 pointer-events-none"
      )}
    >
      <CardContent className="py-3">
        {/* ── Header ── */}
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={onToggle}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-medium text-primary">
              {member.name.slice(-2)}
            </div>
            <div>
              <p className="font-semibold">{member.name}</p>
              {member.birthday && (
                <p className="text-xs text-muted-foreground">
                  {member.birthday}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <div
              className="flex items-center gap-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <AttendanceChip
                label="예배"
                checked={member.worshipAttendance}
                loading={worshipLoading}
                disabled={!canEdit || globalDisabled}
                onChange={(v) => handleAttendance("worship", v)}
              />
              <AttendanceChip
                label="모임"
                checked={member.gatheringAttendance}
                loading={gatheringLoading}
                disabled={!canEdit || globalDisabled}
                onChange={(v) => handleAttendance("gathering", v)}
              />
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* ── Expanded ── */}
        {isExpanded && (
          <div
            className="mt-4 border-t border-border/50 pt-4"
            onClick={(e) => e.stopPropagation()}
          >
            {editingContent ? (
              /* ── EDIT MODE ── */
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
                    <FileText className="h-3 w-3" />
                    나눔
                  </p>
                  <Input
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    placeholder="나눔 내용을 적어주세요"
                    className="bg-background text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
                    <Target className="h-3 w-3" />
                    한주 목표
                  </p>
                  <Input
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="이번 주 목표를 적어주세요"
                    className="bg-background text-sm"
                  />
                </div>

                <div className="border-t border-dashed border-border/50 pt-4">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-primary">
                    <Heart className="h-3 w-3" />
                    기도제목
                  </p>
                  <div className="space-y-1.5">
                    {prayerInputs.map((input, idx) => (
                      <div
                        key={`${input.id}-${idx}`}
                        className="flex gap-1.5"
                      >
                        <Input
                          value={input.value}
                          onChange={(e) =>
                            setPrayerInputs((prev) =>
                              prev.map((p, i) =>
                                i === idx
                                  ? { ...p, value: e.target.value }
                                  : p
                              )
                            )
                          }
                          placeholder="기도제목을 적어주세요"
                          className="bg-background text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeletePrayer(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setPrayerInputs((prev) => [
                        ...prev,
                        { id: "new", value: "" },
                      ])
                    }
                    className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-primary/30 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    기도제목 추가
                  </button>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full"
                  size="sm"
                >
                  {saving ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-1.5 h-4 w-4" />
                  )}
                  완료
                </Button>
              </div>
            ) : (
              /* ── READ MODE ── */
              <div className="space-y-3">
                <div>
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-primary">
                    <FileText className="h-3 w-3" />
                    나눔
                  </p>
                  <p className="text-sm text-foreground">
                    {member.story || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </p>
                </div>

                <div>
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-primary">
                    <Target className="h-3 w-3" />
                    한주 목표
                  </p>
                  <p className="text-sm text-foreground">
                    {member.goal || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </p>
                </div>

                <div className="border-t border-dashed border-border/50 pt-3">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-primary">
                    <Heart className="h-3 w-3" />
                    기도제목
                  </p>
                  {member.prayers.length > 0 ? (
                    <ul className="space-y-1">
                      {member.prayers.map((p) => (
                        <li
                          key={p.id}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                          <span>{p.prayerRequest}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">-</p>
                  )}
                </div>

                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 text-xs text-muted-foreground"
                    onClick={handleStartEditing}
                  >
                    <Pencil className="h-3 w-3" />
                    수정
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default GatheringDetailPage;
