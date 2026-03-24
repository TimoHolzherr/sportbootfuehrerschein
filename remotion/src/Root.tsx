import React from "react";
import { Composition } from "remotion";
import { EpisodeVideo } from "./compositions/EpisodeVideo";
import { EpisodeSchema, Episode } from "./lib/schema";
import { computeTotalFrames } from "./lib/storyUtils";

// Import episode YAML files — webpack yaml-loader converts them to JS objects
import sbfSee01 from "../stories/sbf-see-01-schiffsfuehrer.yaml";
import sbfSee02 from "../stories/sbf-see-02-ausweichregeln.yaml";

const RAW_EPISODES: unknown[] = [
  sbfSee01,
  sbfSee02,
];

const episodes: Episode[] = RAW_EPISODES.map((raw) => EpisodeSchema.parse(raw));

export const RemotionRoot: React.FC = () => (
  <>
    {episodes.map((episode) => (
      <Composition
        key={episode.id}
        id={episode.id}
        component={EpisodeVideo as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={computeTotalFrames(episode)}
        fps={episode.fps ?? 30}
        width={1920}
        height={1080}
        defaultProps={{ episode } as Record<string, unknown>}
      />
    ))}
  </>
);
