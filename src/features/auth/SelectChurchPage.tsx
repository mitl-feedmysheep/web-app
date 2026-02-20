import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Church as ChurchIcon, Loader2, ChevronRight } from "lucide-react";
import { churchesApi } from "@/lib/api";
import type { Church } from "@/types";

function SelectChurchPage() {
  const navigate = useNavigate();
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await churchesApi.getMyChurches();
        setChurches(data);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSelect = (church: Church) => {
    localStorage.setItem("churchId", church.id);
    navigate("/", { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="mb-8 text-center">
        <ChurchIcon className="mx-auto mb-3 h-10 w-10 text-primary" />
        <h1 className="text-xl font-bold">교회를 선택해주세요</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          여러 교회에 소속되어 있어요
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {churches.map((church) => (
          <Card
            key={church.id}
            className="cursor-pointer border-0 shadow-md shadow-primary/5 transition-all hover:shadow-lg active:scale-[0.98]"
            onClick={() => handleSelect(church)}
          >
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <ChurchIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{church.name}</h3>
                {church.location && (
                  <p className="text-xs text-muted-foreground">
                    {church.location}
                  </p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default SelectChurchPage;
