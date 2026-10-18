import { useStudy } from "@/lib/study/store";
import type { LastPlace } from "@/lib/study/types";

const DEVICE_KEY = "sumi-device";

type RemoteProgress = {
  knownKana: string[];
  knownWords: number[];
  starred: number[];
  last: LastPlace | null;
};

function deviceId() {
  const existing = localStorage.getItem(DEVICE_KEY);
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem(DEVICE_KEY, created);
  return created;
}

function headers() {
  return {
    "Content-Type": "application/json",
    "X-Device-Id": deviceId(),
  };
}

async function pullProgress(): Promise<RemoteProgress | null> {
  const response = await fetch("/api/progress", { headers: headers() });
  if (!response.ok) return null;
  return (await response.json()) as RemoteProgress;
}

async function pushProgress() {
  const state = useStudy.getState();
  await fetch("/api/progress", {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      knownKana: state.knownKana,
      knownWords: state.knownWords,
      starred: state.starred,
      last: state.last,
    }),
  });
}

function uniq(values: string[]) {
  return [...new Set(values)];
}

function uniqNum(values: number[]) {
  return [...new Set(values)];
}

export function bindStudySync() {
  let ready = false;
  let timer = 0;

  void (async () => {
    await Promise.resolve(useStudy.persist.rehydrate());
    try {
      const remote = await pullProgress();
      const local = useStudy.getState();
      if (remote) {
        useStudy.setState({
          knownKana: uniq([...(local.knownKana ?? []), ...(remote.knownKana ?? [])]),
          knownWords: uniqNum([...(local.knownWords ?? []), ...(remote.knownWords ?? [])]),
          starred: uniqNum([...(local.starred ?? []), ...(remote.starred ?? [])]),
          last: local.last ?? remote.last ?? null,
          hydrated: true,
        });
      } else {
        useStudy.getState().setHydrated(true);
      }
    } catch {
      useStudy.getState().setHydrated(true);
    }
    ready = true;
  })();

  const unsubscribe = useStudy.subscribe((state, previous) => {
    if (!ready) return;
    if (
      state.knownKana === previous.knownKana &&
      state.knownWords === previous.knownWords &&
      state.starred === previous.starred &&
      state.last === previous.last
    ) {
      return;
    }
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      void pushProgress();
    }, 400);
  });

  return () => {
    ready = false;
    window.clearTimeout(timer);
    unsubscribe();
  };
}
