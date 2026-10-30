import React from 'react';
import {Composition} from 'remotion';
import {Oryx} from './Oryx';

export const Root: React.FC = () => (
  <Composition id="Oryx" component={Oryx} durationInFrames={600} fps={30} width={1080} height={1920} />
);
