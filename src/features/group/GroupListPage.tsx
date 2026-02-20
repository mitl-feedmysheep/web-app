import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Loader2 } from "lucide-react";
import { groupsApi } from "@/lib/api";
import type { Group } from "@/types";

function GroupListPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const churchId = localStorage.getItem("churchId");
        if (!churchId) return;
        const data = await groupsApi.getGroupsByChurch(churchId);
        setGroups(data);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-6">
      <p className="text-sm text-muted-foreground">
        내가 속한 소그룹 {groups.length}개
      </p>

      {groups.map((group) => (
        <Card
          key={group.id}
          className="cursor-pointer border-0 shadow-md shadow-primary/5 transition-all hover:shadow-lg active:scale-[0.98]"
          onClick={() => navigate(`/groups/${group.id}`)}
        >
          <CardContent className="flex items-center gap-4 py-4">
            {group.imageUrl ? (
              <img
                src={group.imageUrl}
                alt={group.name}
                className="h-14 w-14 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                🙏
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold">{group.name}</h3>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {group.groupMemberCount}명
                </span>
                {group.description && (
                  <span className="line-clamp-1">{group.description}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {groups.length === 0 && (
        <div className="py-20 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            소속된 소그룹이 없어요
          </p>
        </div>
      )}
    </div>
  );
}

export default GroupListPage;
