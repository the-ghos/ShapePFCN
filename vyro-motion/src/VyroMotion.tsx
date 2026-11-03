import React from "react";
import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { crossZoom } from "@remotion/transitions/cross-zoom";
import { ripple } from "@remotion/transitions/ripple";
import { zoomBlur } from "@remotion/transitions/zoom-blur";
import { dreamyZoom } from "@remotion/transitions/dreamy-zoom";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Intro } from "./scenes/Intro";
import { Logo3D } from "./scenes/Logo3D";
import { LogoReveal } from "./scenes/LogoReveal";
import { Merch, MERCH_DURATION, ITEM_STEP } from "./scenes/Merch";
import { Outro, OUTRO_DURATION } from "./scenes/Outro";

const SCENES = [
  { id: "intro", dur: 110 },
  { id: "reveal", dur: 210 },
  { id: "3d", dur: 140 },
  { id: "merch", dur: MERCH_DURATION },
  { id: "outro", dur: OUTRO_DURATION },
];
const TRANS = [18, 20, 24, 20];

const starts: number[] = [];
SCENES.reduce((acc, s, i) => {
  starts.push(acc);
  return acc + s.dur - (TRANS[i] ?? 0);
}, 0);
export const TOTAL_DURATION = SCENES.reduce((a, s) => a + s.dur, 0) - TRANS.reduce((a, b) => a + b, 0);
const [S_INTRO, S_REVEAL, S_3D, S_MERCH, S_OUTRO] = starts;

const Sfx: React.FC<{ at: number; src: string; volume?: number; dur?: number }> = ({ at, src, volume = 1, dur = 90 }) => (
  <Sequence from={Math.max(0, Math.round(at))} durationInFrames={dur} layout="none">
    <Audio src={staticFile(`sfx/${src}.wav`)} volume={volume} />
  </Sequence>
);

export const VyroMotion: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENES[0].dur}>
          <Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={zoomBlur({})} timing={linearTiming({ durationInFrames: TRANS[0] })} />
        <TransitionSeries.Sequence durationInFrames={SCENES[1].dur}>
          <LogoReveal />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={crossZoom({ strength: 0.5 })} timing={linearTiming({ durationInFrames: TRANS[1] })} />
        <TransitionSeries.Sequence durationInFrames={SCENES[2].dur}>
          <Logo3D />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={ripple({ amplitude: 40, speed: 12 })} timing={linearTiming({ durationInFrames: TRANS[2] })} />
        <TransitionSeries.Sequence durationInFrames={SCENES[3].dur}>
          <Merch />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={dreamyZoom({})} timing={linearTiming({ durationInFrames: TRANS[3] })} />
        <TransitionSeries.Sequence durationInFrames={SCENES[4].dur}>
          <Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* ---------- sound design ---------- */}
      <Sequence durationInFrames={TOTAL_DURATION} layout="none">
        <Audio src={staticFile("sfx/pad.wav")} volume={0.9} />
      </Sequence>
      {/* intro */}
      <Sfx at={S_INTRO + 20} src="whoosh" volume={0.25} />
      <Sfx at={S_INTRO + 46} src="drip" volume={0.9} />
      <Sfx at={S_INTRO + 46} src="impact" volume={0.35} />
      <Sfx at={S_INTRO + 74} src="drip" volume={0.55} />
      <Sfx at={S_INTRO + 78} src="riser" volume={0.6} />
      {/* logo reveal */}
      <Sfx at={S_REVEAL + 6} src="whoosh" volume={0.7} />
      <Sfx at={S_REVEAL + 12} src="whoosh" volume={0.5} />
      <Sfx at={S_REVEAL + 34} src="impact" volume={1} />
      <Sfx at={S_REVEAL + 38} src="whoosh" volume={0.45} />
      <Sfx at={S_REVEAL + 70} src="shimmer" volume={0.6} />
      <Sfx at={S_REVEAL + 104} src="whoosh" volume={0.35} />
      <Sfx at={S_REVEAL + 168} src="shimmer" volume={0.4} />
      {/* 3D */}
      <Sfx at={S_3D - 8} src="whoosh" volume={0.6} />
      <Sfx at={S_3D + 20} src="whoosh" volume={0.45} />
      <Sfx at={S_3D + 62} src="impact" volume={0.45} />
      <Sfx at={S_3D + 72} src="shimmer" volume={0.45} />
      {/* merch */}
      <Sequence from={S_MERCH} durationInFrames={MERCH_DURATION} layout="none">
        <Audio src={staticFile("sfx/pulse.wav")} volume={0.7} />
      </Sequence>
      {[0, 1, 2, 3].map((i) => (
        <React.Fragment key={i}>
          <Sfx at={S_MERCH + i * ITEM_STEP} src="whoosh" volume={0.55} />
          <Sfx at={S_MERCH + i * ITEM_STEP + 24} src="drip" volume={0.8} />
        </React.Fragment>
      ))}
      <Sfx at={S_MERCH + ITEM_STEP * 4 + 5} src="whoosh" volume={0.6} />
      <Sfx at={S_MERCH + ITEM_STEP * 4 + 12} src="impact" volume={0.5} />
      {/* outro */}
      <Sfx at={S_OUTRO - 10} src="riser" volume={0.5} />
      <Sfx at={S_OUTRO + 20} src="drip" volume={1} />
      <Sfx at={S_OUTRO + 20} src="impact" volume={1} />
      <Sfx at={S_OUTRO + 62} src="shimmer" volume={0.6} />
    </AbsoluteFill>
  );
};
