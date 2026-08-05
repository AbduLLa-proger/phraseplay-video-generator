import { Composition } from "remotion";
import { PhraseVideo } from "./PhraseVideo";

export const RemotionRoot = () => {
  return (
    <Composition
      id="PhraseVideo"
      component={PhraseVideo}
      durationInFrames={450}
      fps={30}
      width={720}
      height={1280}
    />
  );
};
