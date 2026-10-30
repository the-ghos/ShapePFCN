import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import {FontFaces, Finish} from './lib';
import {Deborah} from './Scenes';

const Main: React.FC = () => (
  <AbsoluteFill>
    <FontFaces />
    <Deborah />
    <Finish />
  </AbsoluteFill>
);

export const Root: React.FC = () => (
  <Composition id="Deborah" component={Main} durationInFrames={1620} fps={30} width={1080} height={1920} />
);
