import { Composition } from "remotion";
import { Main, TOTAL } from "./Main";
import { Bellingham, JB_TOTAL } from "./bellingham/Bellingham";
import { AtletiBarca, AB_TOTAL } from "./clasico/AtletiBarca";
import { RealPreview, RM_TOTAL } from "./realmadrid/RealPreview";
import { PsgSerie, PSG_TOTAL } from "./psg/PsgSerie";
import { BarcaParcours, FCB_TOTAL } from "./fcb/BarcaParcours";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="MbappeRoi" component={Main} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
      <Composition id="BellinghamAvantMatch" component={Bellingham} durationInFrames={JB_TOTAL} fps={30} width={1080} height={1920} />
      <Composition id="AtleticoBarcaAvantMatch" component={AtletiBarca} durationInFrames={AB_TOTAL} fps={30} width={1080} height={1920} />
      <Composition id="RealMadridPreview" component={RealPreview} durationInFrames={RM_TOTAL} fps={30} width={1080} height={1920} />
      <Composition id="PsgSerie" component={PsgSerie} durationInFrames={PSG_TOTAL} fps={30} width={1080} height={1920} />
      <Composition id="BarcaParcours" component={BarcaParcours} durationInFrames={FCB_TOTAL} fps={30} width={1080} height={1920} />
    </>
  );
};
