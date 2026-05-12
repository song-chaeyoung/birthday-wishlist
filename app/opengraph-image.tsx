import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { wishlistTitle } from "@/src/lib/profile";

export const moneygraphyPixelFontName = "Moneygraphy Pixel";
export const moneygraphyPixelFontPath = join(
  process.cwd(),
  "public",
  "fonts",
  "Moneygraphy-Pixel.otf",
);
export const alt = wishlistTitle;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

async function getCloudyBackgroundSrc() {
  const imageData = await readFile(
    join(process.cwd(), "public", "cloudy-bg.jpg"),
    "base64",
  );

  return `data:image/jpeg;base64,${imageData}`;
}

async function loadMoneygraphyPixelFont() {
  const fontData = await readFile(moneygraphyPixelFontPath);

  return fontData.buffer.slice(
    fontData.byteOffset,
    fontData.byteOffset + fontData.byteLength,
  ) as ArrayBuffer;
}

export default async function OpenGraphImage() {
  const [backgroundSrc, moneygraphyPixelFont] = await Promise.all([
    getCloudyBackgroundSrc(),
    loadMoneygraphyPixelFont(),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "#8f7bd7",
          color: "#381a55",
          fontFamily: moneygraphyPixelFontName,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders data URL assets with plain img. */}
        <img
          src={backgroundSrc}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(255,247,252,0.92), rgba(255,247,252,0.58) 48%, rgba(255,247,252,0.14))",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: 780,
            height: "100%",
            padding: "72px 84px",
          }}
        >
          <div
            style={{
              display: "flex",
              border: "4px solid #381a55",
              borderRadius: 999,
              background: "#ffef62",
              padding: "12px 20px",
              color: "#381a55",
              fontSize: 26,
              fontWeight: 400,
              boxShadow: "6px 6px 0 #381a55",
            }}
          >
            Y2K BIRTHDAY BOARD
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 36,
              border: "6px solid #381a55",
              borderRadius: 12,
              background: "rgba(255, 253, 244, 0.9)",
              padding: "40px 44px",
              boxShadow: "12px 12px 0 #381a55",
            }}
          >
            <div
              style={{
                color: "#ff4fa3",
                fontSize: 28,
                fontWeight: 400,
              }}
            >
              Birthday Wish Board
            </div>
            <div
              style={{
                marginTop: 14,
                color: "#381a55",
                fontSize: 78,
                fontWeight: 400,
                lineHeight: 1.08,
                letterSpacing: 0,
              }}
            >
              {wishlistTitle}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 30,
                color: "#5a3a6f",
                fontSize: 28,
                fontWeight: 400,
              }}
            >
              귀여운 생일 위시를 함께 채워주세요.
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: moneygraphyPixelFontName,
          data: moneygraphyPixelFont,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
