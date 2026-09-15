"use client";

import { useEffect, useRef } from "react";

import { decorativeMediaShouldPlay } from "./logic";
import type { ConceptFloralAccent } from "./types";

function isVideoSrc(src: string) {
  return /\.(webm|mp4|mov)(\?|$)/i.test(src);
}

/**
 * One floral seat. Corner sprays hang as shot; the seam bushes are the
 * same footage stood on its head so they grow up from the join.
 *
 * Playback is visibility-gated: off-screen clips stay paused with nothing
 * in flight, so two seats cannot tear down the same request on load.
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

    const sync = (isIntersecting: boolean, ratio: number) => {
      if (decorativeMediaShouldPlay(isIntersecting, ratio)) {
        play();
        return;
      }
      video.pause();
    };

    if (typeof IntersectionObserver === "undefined") {
      play();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }
        sync(entry.isIntersecting, entry.intersectionRatio);
      },
      { threshold: 0.01 },
    );
    observer.observe(video);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [src]);

  return (
    <div className="concept-floral decor-safe" data-place={place} data-corner={corner} aria-hidden="true">
      {isVideoSrc(src) ? (
        <video
          ref={videoRef}
          className="concept-floral-media"
          src={src}
          loop
          muted
          playsInline
          preload="none"
          disablePictureInPicture
          disableRemotePlayback
        />
      ) : (
        <img className="concept-floral-media" src={src} alt="" />
      )}
    </div>
  );
}
