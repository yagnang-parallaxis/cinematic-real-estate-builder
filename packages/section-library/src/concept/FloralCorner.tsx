"use client";

import { useEffect, useRef } from "react";

import type { ConceptFloralAccent } from "./types";

function isVideoSrc(src: string) {
  return /\.(webm|mp4|mov)(\?|$)/i.test(src);
}

/**
 * One of the three floral seats. Corner sprays hang as shot; the seam
 * bush is the same footage stood on its head so it grows up from the join.
 */
export function FloralCorner({ place, corner, src }: ConceptFloralAccent) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const play = () => {
      const attempt = video.play();
      if (attempt) {
        attempt.catch(() => {});
      }
    };

    play();
    video.addEventListener("loadeddata", play);
    const onVis = () => {
      if (document.visibilityState === "visible") {
        play();
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      video.removeEventListener("loadeddata", play);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [src]);

  return (
    <div className="concept-floral" data-place={place} data-corner={corner} aria-hidden="true">
      {isVideoSrc(src) ? (
        <video
          ref={videoRef}
          className="concept-floral-media"
          src={src}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
        />
      ) : (
        <img className="concept-floral-media" src={src} alt="" />
      )}
    </div>
  );
}
