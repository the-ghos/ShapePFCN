import { Composition } from "remotion";
import { Main, TOTAL } from "./Main";
import { Bellingham, JB_TOTAL } from "./bellingham/Bellingham";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="MbappeRoi" component={Main} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
      <Composition id="BellinghamAvantMatch" component={Bellingham} durationInFrames={JB_TOTAL} fps={30} width={1080} height={1920} />
    </>
  );
};
