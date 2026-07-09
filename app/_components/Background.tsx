"use client";

import type { Engine } from "@tsparticles/engine";
import { loadAmbientPreset } from "@tsparticles/preset-ambient";
import { loadFirePreset } from "@tsparticles/preset-fire";
import { loadLinksPreset } from "@tsparticles/preset-links";
import { loadStarsPreset } from "@tsparticles/preset-stars";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { useCallback, useMemo } from "react";

async function initPreset(engine: Engine, random: number) {
  switch (random) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
      await loadStarsPreset(engine);
      break;
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
      await loadAmbientPreset(engine);
      break;
    case 13:
    case 14:
    case 15:
      await loadFirePreset(engine);
      break;
    case 16:
    case 17:
    case 18:
      await loadLinksPreset(engine);
      break;
    default:
      await loadStarsPreset(engine);
      break;
  }
}

function getPreset(random: number) {
  switch (random) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
      return "stars";
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
      return "ambient";
    case 13:
    case 14:
    case 15:
      return "fire";
    case 16:
    case 17:
    case 18:
      return "links";
    default:
      return "stars";
  }
}

export function Background() {
  const random = Math.floor(Math.random() * 20); // Random number between 0 and 19

  const init = useCallback(
    async (engine: Engine) => {
      await initPreset(engine, random);
    },
    [random],
  );

  const options = useMemo(
    () => ({
      preset: getPreset(random),
      fullScreen: {
        enable: false,
      },
      background: {
        color: "transparent",
      },
    }),
    [random],
  );

  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 h-full w-full">
      <ParticlesProvider init={init}>
        <Particles className="h-full w-full" id="stars-bg" options={options} />
      </ParticlesProvider>
    </div>
  );
}
