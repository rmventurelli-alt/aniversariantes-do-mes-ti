import { toPng } from "html-to-image";

export async function exportNodeAsPng(node: HTMLElement, fileName: string, pixelRatio = 1) {
  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio,
    backgroundColor: "#ffffff"
  });
  const link = document.createElement("a");
  link.download = fileName;
  link.href = dataUrl;
  link.click();
}
