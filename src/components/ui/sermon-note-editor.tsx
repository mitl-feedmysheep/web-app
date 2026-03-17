import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect } from "react";
import { Indent, Outdent } from "lucide-react";
import { getSermonNoteExtensions } from "@/lib/tiptap-utils";
import type { JSONContent, Editor } from "@tiptap/react";

const MAX_INDENT_DEPTH = 3;

interface SermonNoteEditorProps {
  initialContent?: JSONContent;
  onChange?: (isEmpty: boolean) => void;
  editorRef?: (editor: Editor | null) => void;
}

export function SermonNoteEditor({
  initialContent,
  onChange,
  editorRef,
}: SermonNoteEditorProps) {
  const editor = useEditor({
    extensions: getSermonNoteExtensions(),
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange?.(editor.isEmpty);
    },
    // 리치 텍스트 붙여넣기 시 plain text로 strip
    editorProps: {
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData("text/plain");
        if (text) {
          event.preventDefault();
          view.dispatch(view.state.tr.insertText(text));
          return true;
        }
        return false;
      },
    },
  });

  // 수정 모드: 비동기로 로드된 데이터를 에디터에 주입
  useEffect(() => {
    if (editor && initialContent) {
      const currentJSON = JSON.stringify(editor.getJSON());
      const newJSON = JSON.stringify(initialContent);
      if (currentJSON !== newJSON) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [editor, initialContent]);

  // 부모에 editor 인스턴스 전달 (getJSON 등)
  useEffect(() => {
    editorRef?.(editor);
  }, [editor, editorRef]);

  // Tab 키로 들여쓰기 (최대 깊이 제한)
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
        if (event.shiftKey) {
          editor.chain().focus().liftListItem("listItem").run();
        } else {
          const { $from } = editor.state.selection;
          let depth = 0;
          for (let d = $from.depth; d > 0; d--) {
            if ($from.node(d).type.name === "bulletList") {
              depth++;
            }
          }
          if (depth < MAX_INDENT_DEPTH) {
            editor.chain().focus().sinkListItem("listItem").run();
          }
        }
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener("keydown", handleKeyDown);
    return () => editorElement.removeEventListener("keydown", handleKeyDown);
  }, [editor]);

  if (!editor) return null;

  const getCurrentDepth = () => {
    const { $from } = editor.state.selection;
    let depth = 0;
    for (let d = $from.depth; d > 0; d--) {
      if ($from.node(d).type.name === "bulletList") {
        depth++;
      }
    }
    return depth;
  };

  const canIndent =
    editor.can().sinkListItem("listItem") &&
    getCurrentDepth() < MAX_INDENT_DEPTH;
  const canOutdent = editor.can().liftListItem("listItem");

  const handleIndent = () => {
    if (getCurrentDepth() < MAX_INDENT_DEPTH) {
      editor.chain().focus().sinkListItem("listItem").run();
    }
  };

  return (
    <div>
      {/* 에디터 영역 — 툴바를 상단 테두리 안에 통합 */}
      <div className="sermon-note-editor rounded-md border border-input shadow-xs">
        <div className="flex items-center gap-1 border-b border-border/40 bg-muted/30 px-2 py-1 rounded-t-md">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleIndent}
            disabled={!canIndent}
            className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:bg-accent disabled:opacity-30"
            title="들여쓰기"
          >
            <Indent className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              editor.chain().focus().liftListItem("listItem").run()
            }
            disabled={!canOutdent}
            className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:bg-accent disabled:opacity-30"
            title="내어쓰기"
          >
            <Outdent className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto bg-transparent px-3 py-2 text-[15px]" style={{ maxHeight: "calc(100dvh - 22rem)" }}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
