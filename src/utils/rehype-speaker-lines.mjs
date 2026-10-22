/*
  识别「说话人段落」：段落第一个元素是 <strong> 且内容形如 "Lex:" / "Sam：" 时，
  给段落加 data-speaker="Lex"，给 strong 加 .speaker-name。
  样式层再据此做剧本式排版（左栏姓名 / 行内小标签 / 问答区分）。

  约束：名字不含冒号且不超过 24 字，避免把普通 "注意：……" 之类的强调误判成说话人。
  误判的代价只是多一个 data 属性；样式只作用于对话页容器内部。
*/

const SPEAKER = /^([^\s:：][^:：]{0,23})[:：]$/;

function textOf(node) {
  if (node.type === "text") return node.value;
  if (Array.isArray(node.children)) return node.children.map(textOf).join("");
  return "";
}

const isBlank = (node) => node.type === "text" && node.value.trim() === "";

export default function rehypeSpeakerLines() {
  return (tree) => {
    const visit = (node) => {
      if (!Array.isArray(node.children)) return;

      for (const child of node.children) visit(child);

      if (node.type !== "element" || node.tagName !== "p") return;

      const first = node.children.find((child) => !isBlank(child));
      if (!first || first.type !== "element" || first.tagName !== "strong") {
        return;
      }

      const matched = SPEAKER.exec(textOf(first).trim());
      if (!matched) return;

      node.properties = node.properties ?? {};
      node.properties.dataSpeaker = matched[1];

      first.properties = first.properties ?? {};
      const className = first.properties.className;
      first.properties.className = Array.isArray(className)
        ? [...className, "speaker-name"]
        : ["speaker-name"];
    };

    visit(tree);
  };
}
