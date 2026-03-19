import type { backendInterface } from "./backend";
import { createActorWithConfig } from "./config";

// Start creating the anonymous actor immediately when the module loads,
// before React even renders. This hides the network latency behind JS parsing.
let prewarmedActorPromise: Promise<backendInterface> | null = null;

export function getPrewarmedActor(): Promise<backendInterface> {
  if (!prewarmedActorPromise) {
    prewarmedActorPromise = createActorWithConfig();
  }
  return prewarmedActorPromise;
}

// Kick off immediately
getPrewarmedActor();
