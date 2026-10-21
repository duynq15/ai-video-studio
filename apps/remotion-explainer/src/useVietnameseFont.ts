import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

export const vietnameseFontFamily = '"Video Be Vietnam Pro", sans-serif';
let fontPromise: Promise<void> | undefined;

function loadFonts(): Promise<void> {
  if (!fontPromise) {
    fontPromise = Promise.all([
      new FontFace("Video Be Vietnam Pro", `url("${staticFile("fonts/BeVietnamPro-Regular.ttf")}")`, { weight: "400 600" }).load(),
      new FontFace("Video Be Vietnam Pro", `url("${staticFile("fonts/BeVietnamPro-Bold.ttf")}")`, { weight: "700 900" }).load(),
    ]).then((fonts) => {
      fonts.forEach((font) => document.fonts.add(font));
    });
  }
  return fontPromise;
}

export function useVietnameseFont(): void {
  const [handle] = useState(() => delayRender("Loading embedded Vietnamese fonts"));
  useEffect(() => {
    loadFonts().then(() => continueRender(handle)).catch(cancelRender);
  }, [handle]);
}
