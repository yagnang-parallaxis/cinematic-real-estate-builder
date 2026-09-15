/**
 * The theme is authored in `oklch()`, which `<input type="color">` cannot take.
 * Painting one pixel is the shortest way to ask the browser for the sRGB bytes
 * of any CSS colour, whatever space it was written in.
 */
export function cssColorToHex(value: string): string {
  if (/^#[0-9a-f]{6}$/i.test(value)) {
    return value.toLowerCase();
  }

  if (typeof document === "undefined") {
    return "#000000";
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d");
  if (!context) {
    return "#000000";
  }

  /* An unparseable colour leaves fillStyle alone, so the swatch reads black. */
  context.fillStyle = "#000000";
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);

  const [red = 0, green = 0, blue = 0] = context.getImageData(0, 0, 1, 1).data;
  return `#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}
