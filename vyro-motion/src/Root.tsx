import { Composition } from "remotion";
import { VyroMotion, TOTAL_DURATION } from "./VyroMotion";
import { Intro } from "./scenes/Intro";
import { LogoReveal } from "./scenes/LogoReveal";
import { Logo3D } from "./scenes/Logo3D";
import { Merch, MERCH_DURATION } from "./scenes/Merch";
import { Outro, OUTRO_DURATION } from "./scenes/Outro";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="VyroMotion" component={VyroMotion} durationInFrames={TOTAL_DURATION} fps={30} width={1920} height={1080} />
      <Composition id="Intro" component={Intro} durationInFrames={110} fps={30} width={1920} height={1080} />
      <Composition id="LogoReveal" component={LogoReveal} durationInFrames={210} fps={30} width={1920} height={1080} />
      <Composition id="Logo3D" component={Logo3D} durationInFrames={140} fps={30} width={1920} height={1080} />
      <Composition id="Merch" component={Merch} durationInFrames={MERCH_DURATION} fps={30} width={1920} height={1080} />
      <Composition id="Outro" component={Outro} durationInFrames={OUTRO_DURATION} fps={30} width={1920} height={1080} />
    </>
  );
};
