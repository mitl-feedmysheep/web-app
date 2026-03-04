import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { churchesApi } from "@/lib/api";
import type { MemberSearchResult } from "@/types";
import { Search, Loader2, Phone, MapPin, Briefcase, Brain, Droplets, Mail } from "lucide-react";
import SendMessageModal from "./SendMessageModal";

interface MemberSearchModalProps {
  open: boolean;
  onClose: () => void;
}

function MemberSearchModal({ open, onClose }: MemberSearchModalProps) {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<MemberSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [messageTarget, setMessageTarget] = useState<{ id: string; name: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const doSearch = useCallback(async (text: string) => {
    const churchId = localStorage.getItem("churchId");
    if (!churchId || !text.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const data = await churchesApi.searchMembers(churchId, text.trim());
      setResults(data);
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setSearchText("");
      setResults([]);
      setSearched(false);
      return;
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const handleInputChange = (value: string) => {
    setSearchText(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  const formatBirthday = (bd: string | null) => {
    if (!bd) return "";
    const [y, m, d] = bd.split("-");
    return `${y}.${m}.${d}`;
  };

  return (
    <>
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="flex max-h-[80vh] flex-col gap-0 p-0"
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
          <DialogTitle className="text-base">교적부</DialogTitle>
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            닫기
          </button>
        </DialogHeader>

        <div className="px-4 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={searchText}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="이름으로 검색하세요"
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              검색 결과가 없습니다
            </p>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2">
              {results.map((member) => (
                <div
                  key={member.memberId}
                  className="rounded-lg bg-accent/50 p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      {member.sex && (
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            member.sex === "M"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-pink-100 text-pink-600"
                          }`}
                        >
                          {member.sex === "M" ? "남" : "여"}
                        </span>
                      )}
                      <span className="text-sm font-semibold">{member.name}</span>
                      {member.birthday && (
                        <span className="text-xs text-muted-foreground">
                          {formatBirthday(member.birthday)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        className="rounded-full p-1.5 text-primary/70 transition-colors hover:bg-primary/10 hover:text-primary"
                        onClick={() => setMessageTarget({ id: member.memberId, name: member.name })}
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      {member.phone && (
                        <a
                          href={`tel:${member.phone}`}
                          className="rounded-full p-1.5 text-primary/70 transition-colors hover:bg-primary/10 hover:text-primary"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {member.groups.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {member.groups.map((g) => {
                        const roleLabel = g.role === "LEADER" ? " 리더" : g.role === "SUB_LEADER" ? " 부리더" : " 일반";
                        return (
                          <span
                            key={g.groupId}
                            className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] text-primary"
                          >
                            {g.groupName}<span className="font-semibold">{roleLabel}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <div className="pt-2 border-t border-border/50 space-y-1.5">
                    {member.address && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>{member.address}</span>
                      </div>
                    )}
                    {(member.occupation || member.mbti || member.baptismStatus) && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {member.occupation && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3 shrink-0" />
                            {member.occupation}
                          </span>
                        )}
                        {member.mbti && (
                          <span className="flex items-center gap-1">
                            <Brain className="h-3 w-3 shrink-0" />
                            {member.mbti}
                          </span>
                        )}
                        {member.baptismStatus && (
                          <span className="flex items-center gap-1">
                            <Droplets className="h-3 w-3 shrink-0" />
                            {member.baptismStatus === "BAPTIZED" ? "세례" : member.baptismStatus === "PAEDOBAPTISM" ? "유아세례" : "미세례"}
                          </span>
                        )}
                      </div>
                    )}
                    {member.description && (
                      <p className="text-xs text-muted-foreground pt-0.5">{member.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !searched && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              성도의 이름을 입력하여 검색하세요
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>

    <SendMessageModal
      open={!!messageTarget}
      onClose={() => setMessageTarget(null)}
      receiverId={messageTarget?.id ?? ""}
      receiverName={messageTarget?.name ?? ""}
      type="NORMAL"
    />
    </>
  );
}

export default MemberSearchModal;
