import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("global styles", () => {
  it("keeps the bundled Moneygraphy Pixel font scoped to toast text", () => {
    const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
    const toaster = readFileSync(
      join(process.cwd(), "components/ui/sonner.tsx"),
      "utf8",
    );

    expect(css).toContain('src: url("/fonts/Moneygraphy-Pixel.woff2")');
    expect(css).toContain("--font-sans: Arial, Helvetica, sans-serif;");
    expect(css).toContain("font-family: Arial, Helvetica, sans-serif;");
    expect(css).toContain(
      ".toast-pixel-text {\n  font-family: \"Moneygraphy Pixel\", Arial, Helvetica, sans-serif;",
    );
    expect(toaster).toContain("toast-pixel-text");
    expect(toaster).toContain("!w-fit");
    expect(toaster).toContain("mx-auto");
    expect(toaster).toContain("text-center");
    expect(toaster).toContain('position="top-center"');
    expect(toaster).not.toContain('offset={{ top: "40vh" }}');
    expect(toaster).not.toContain('"--width": "fit-content"');
    expect(toaster).not.toContain('transform: "translate(-50%, -50%)"');
  });

  it("keeps the original page dot background unchanged", () => {
    const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

    expect(css).toContain("radial-gradient(#ff8cc6 1px, transparent 1px)");
    expect(css).toContain("radial-gradient(#72eadc 1px, transparent 1px)");
    expect(css).toContain("background-size: 24px 24px;");
    expect(css).not.toContain("linear-gradient(135deg");
  });
});
