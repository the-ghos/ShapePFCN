import { Composition } from "remotion";
import { Main, TOTAL } from "./Main";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MbappeRoi"
      component={Main}
      durationInFrames={TOTAL}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
