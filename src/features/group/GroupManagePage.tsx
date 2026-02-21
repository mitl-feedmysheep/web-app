import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Camera, Loader2 } from "lucide-react";
import { groupsApi, mediaApi, ApiError } from "@/lib/api";
import type { Group, User } from "@/types";
import { toast } from "sonner";

function GroupManagePage() {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();

  const [members, setMembers] = useState<User[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [groupLoading, setGroupLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!groupId) return;

    let mounted = true;

    const fetchAll = async () => {
      try {
        const churchId = localStorage.getItem("churchId");
        const [memberData, groups] = await Promise.all([
          groupsApi.getGroupMembers(groupId),
          churchId ? groupsApi.getGroupsByChurch(churchId) : Promise.resolve([]),
        ]);

        if (!mounted) return;
        setMembers(memberData);
        setGroup(groups.find((g) => g.id === groupId) ?? null);
      } catch {
        // silently handle
      } finally {
        if (mounted) {
          setLoading(false);
          setGroupLoading(false);
        }
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
  }, [groupId]);

  const handleSetRole = async (member: User, targetRole: "MEMBER" | "SUB_LEADER") => {
    if (!groupId || member.role === targetRole) return;
    const memberId = member.id;
    try {
      setSavingIds((prev) => ({ ...prev, [memberId]: true }));
      await groupsApi.changeMemberRole(groupId, memberId, targetRole);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: targetRole } : m))
      );
      toast.success(targetRole === "SUB_LEADER" ? "서브리더로 변경되었어요" : "멤버로 변경되었어요");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "역할 변경에 실패했습니다.");
    } finally {
      setSavingIds((prev) => {
        const { [memberId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!groupId || !group) return;

      if (file.size > 20 * 1024 * 1024) {
        toast.error("파일 크기는 20MB 이하로 선택해주세요.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("이미지 파일만 업로드 가능합니다.");
        return;
      }

      try {
        setImageUploading(true);
        setUploadProgress(20);

        if (group.imageUrl) {
          try {
            await mediaApi.deleteMediaByEntityId(group.id);
          } catch {
            // ignore delete failure
          }
        }

        setUploadProgress(30);

        const { uploads } = await mediaApi.getPresignedUrls(
          "GROUP",
          groupId,
          file.name,
          file.type,
          file.size
        );

        setUploadProgress(50);

        await Promise.all(
          uploads.map((u) => mediaApi.uploadFile(u.uploadUrl, file))
        );

        setUploadProgress(80);

        const completeResult = await mediaApi.completeUpload(
          "GROUP",
          groupId,
          uploads.map((u) => ({ mediaType: u.mediaType, publicUrl: u.publicUrl }))
        );

        setUploadProgress(100);

        const updatedImageUrl = completeResult.medias.find(
          (m) => m.mediaType === "MEDIUM"
        )?.publicUrl;

        setGroup({ ...group, imageUrl: updatedImageUrl });
        toast.success("이미지가 성공적으로 변경되었습니다!");
      } catch (e) {
        toast.error(e instanceof ApiError ? e.message : "이미지 업로드에 실패했습니다.");
      } finally {
        setImageUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [groupId, group]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) handleImageUpload(files[0]);
    },
    [handleImageUpload]
  );

  const sortedMembers = useMemo(
    () =>
      members
        .filter((m) => m.role !== "LEADER")
        .sort((a, b) => {
          const toTs = (v: string | undefined) => {
            if (!v) return Infinity;
            const t = new Date(v).getTime();
            return Number.isNaN(t) ? Infinity : t;
          };
          return toTs(a.birthday) - toTs(b.birthday);
        }),
    [members]
  );

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        뒤로
      </button>

      <h1 className="text-xl font-bold">소그룹 관리</h1>

      {/* Group Image Section */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">소그룹 이미지 설정</h2>

        {groupLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border bg-muted/30">
              <div className="relative h-40 w-full">
                {group?.imageUrl ? (
                  <img
                    src={group.imageUrl}
                    alt="소그룹 대표사진"
                    className="h-full w-full object-cover"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Camera className="h-6 w-6" />
                    <span className="text-sm">이미지가 없습니다</span>
                  </div>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={imageUploading}
            />

            <Button
              className="w-full"
              disabled={imageUploading}
              onClick={() => !imageUploading && fileInputRef.current?.click()}
            >
              {imageUploading
                ? "업로드 중..."
                : group?.imageUrl
                  ? "이미지 변경하기"
                  : "이미지 선택하기"}
            </Button>

            {imageUploading && (
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground">
              JPG, PNG 등 이미지 파일 (최대 20MB)
            </p>
          </>
        )}
      </section>

      {/* Sub Leader Section */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">서브리더 지정</h2>

        <div className="space-y-2">
          {sortedMembers.map((m) => (
            <Card key={m.id} className="border shadow-sm">
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 bg-primary/10">
                    <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                      {m.name.slice(-2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(() => {
                        if (!m.birthday) return "-";
                        try {
                          const d = new Date(m.birthday);
                          return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
                        } catch {
                          return m.birthday;
                        }
                      })()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={m.role === "MEMBER" ? "default" : "outline"}
                    disabled={!!savingIds[m.id] || m.role === "MEMBER"}
                    onClick={() => handleSetRole(m, "MEMBER")}
                    className="h-7 min-w-[70px] rounded-full text-xs"
                  >
                    멤버
                  </Button>
                  <Button
                    size="sm"
                    variant={m.role === "SUB_LEADER" ? "default" : "outline"}
                    disabled={!!savingIds[m.id] || m.role === "SUB_LEADER"}
                    onClick={() => handleSetRole(m, "SUB_LEADER")}
                    className="h-7 min-w-[70px] rounded-full text-xs"
                  >
                    서브리더
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {sortedMembers.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              리더를 제외한 멤버가 없어요
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default GroupManagePage;
