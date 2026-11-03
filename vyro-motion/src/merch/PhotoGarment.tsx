import React from "react";
import { Img, staticFile } from "remotion";

/**
 * A real garment photo (transparent PNG) with a print laid onto it.
 * The print is multiplied onto the fabric (keeps folds and shading),
 * displaced by the photo's own luminance and masked by its alpha.
 */
export const PhotoGarment: React.FC<{
  src: string;
  w: number; // source pixel size
  h: number;
  height: number; // displayed height
  print: React.ReactNode; // drawn in source pixel coordinates
  id: string;
  overlay?: React.ReactNode; // non-printed overlay (drops, ripples) in source pixel coords
}> = ({ src, w, h, height, print, id, overlay }) => {
  const width = (height * w) / h;
  const url = staticFile(src);
  return (
    <div style={{ position: "relative", width, height }}>
      <Img src={url} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          mixBlendMode: "multiply",
          WebkitMaskImage: `url(${url})`,
          WebkitMaskSize: "100% 100%",
          maskImage: `url(${url})`,
          maskSize: "100% 100%",
        }}
      >
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <filter id={`${id}-cloth`} x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse">
              <feImage href={url} x={0} y={0} width={w} height={h} preserveAspectRatio="none" result="photo" />
              <feColorMatrix
                in="photo"
                type="matrix"
                values="3 0 0 0 -1.6  0 3 0 0 -1.6  0 0 3 0 -1.6  0 0 0 1 0"
                result="mapRaw"
              />
              <feGaussianBlur in="mapRaw" stdDeviation="3" result="map" />
              <feDisplacementMap in="SourceGraphic" in2="map" scale={5} xChannelSelector="R" yChannelSelector="G" result="warped" />
              {/* slight fabric softness, like ink absorbed by cotton */}
              <feGaussianBlur in="warped" stdDeviation="0.25" />
            </filter>
          </defs>
          <g filter={`url(#${id}-cloth)`} opacity={0.96}>
            {print}
          </g>
        </svg>
      </div>
      {/* gentle sheen from the original photo on top of the print */}
      <Img
        src={url}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", mixBlendMode: "soft-light", opacity: 0.35 }}
      />
      {overlay ? (
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {overlay}
        </svg>
      ) : null}
    </div>
  );
};
