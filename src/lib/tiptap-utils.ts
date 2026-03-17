import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

/**
 * 설교 노트 에디터용 tiptap extensions.
 * BulletList, ListItem은 StarterKit에 포함.
 * 불필요한 서식(heading, bold, italic, orderedList 등)은 비활성화.
 */
export function getSermonNoteExtensions(placeholder?: string) {
  return [
    StarterKit.configure({
      heading: false,
      bold: false,
      italic: false,
      strike: false,
      code: false,
      codeBlock: false,
      blockquote: false,
      horizontalRule: false,
      orderedList: false,
    }),
    Placeholder.configure({
      placeholder:
        placeholder ??
        "설교를 들으며 느낀 점, 깨달은 점을 자유롭게 적어보세요...",
    }),
  ];
}

/**
 * 에디터 없이 extensions 목록만 필요할 때 (generateHTML용).
 * Placeholder는 렌더링에 불필요하므로 제외.
 */
export function getSermonNoteRenderExtensions() {
  return [
    StarterKit.configure({
      heading: false,
      bold: false,
      italic: false,
      strike: false,
      code: false,
      codeBlock: false,
      blockquote: false,
      horizontalRule: false,
      orderedList: false,
    }),
  ];
}

interface TiptapNode {
  type: string;
  content?: TiptapNode[];
  text?: string;
}

/**
 * tiptap JSON에서 plain text만 추출 (목록 미리보기용).
 * 재귀적으로 text 노드를 수집. listItem 사이는 ' / '로 구분.
 */
export function extractTextFromTiptapJson(jsonString: string): string {
  try {
    const doc: TiptapNode = JSON.parse(jsonString);
    return collectText(doc).trim();
  } catch {
    return jsonString;
  }
}

function collectText(node: TiptapNode): string {
  if (node.text) return node.text;
  if (!node.content) return "";

  if (node.type === "bulletList") {
    return node.content.map((child) => collectText(child)).join(" / ");
  }

  return node.content.map((child) => collectText(child)).join(" ");
}
