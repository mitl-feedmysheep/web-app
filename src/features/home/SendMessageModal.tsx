import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { messagesApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SendMessageModalProps {
  open: boolean;
  onClose: () => void;
  receiverId: string;
  receiverName: string;
  type?: "BIRTHDAY" | "NORMAL";
}

function SendMessageModal({
  open,
  onClose,
  receiverId,
  receiverName,
  type = "BIRTHDAY",
}: SendMessageModalProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const handleClose = () => {
    setContent("");
    onClose();
  };

  const handleSend = async () => {
    if (!content.trim()) return;
    setSending(true);
    try {
      await messagesApi.send(receiverId, content.trim(), type);
      toast.success(`${receiverName}님에게 메시지를 보냈습니다!`);
      handleClose();
    } catch {
      toast.error("메시지 전송에 실패했습니다.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{type === "BIRTHDAY" ? `🎂 ${receiverName}님에게 축하 메시지` : `${receiverName}님에게 쪽지`}</DialogTitle>
        </DialogHeader>
        <Textarea
          placeholder={type === "BIRTHDAY" ? "축하 메시지를 작성하세요..." : "메시지를 작성하세요..."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="resize-none"
          maxLength={500}
        />
        <p className="text-right text-xs text-muted-foreground">
          {content.length}/500
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={sending}>
            취소
          </Button>
          <Button
            onClick={handleSend}
            disabled={!content.trim() || sending}
          >
            {sending ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : null}
            보내기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SendMessageModal;
