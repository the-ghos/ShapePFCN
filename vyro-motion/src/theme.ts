import { loadFont as loadArchivo } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as loadBarlow } from "@remotion/google-fonts/BarlowSemiCondensed";

export const { fontFamily: displayFont } = loadArchivo();
export const { fontFamily: labelFont } = loadBarlow("normal", {
  weights: ["500", "600", "700"],
  subsets: ["latin"],
});

export const C = {
  bg0: "#07070d",
  bg1: "#141126",
  orangeLight: "#FFB03A",
  orange: "#FF5A1F",
  red: "#F0304A",
  blue: "#45C8FF",
  violet: "#7B5CFF",
  violetDeep: "#5B3FC4",
  speed1: "#F2B33D",
  speed2: "#D9512A",
  speed3: "#B0174A",
  motion: "#FF7A2F",
  white: "#FFFFFF",
};

export const FPS = 30;
