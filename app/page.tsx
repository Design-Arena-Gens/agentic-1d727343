"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Clip = {
  id: string;
  title: string;
  start: number;
  end: number;
};

function parseYouTubeId(input: string): string | null {
  try {
    // Accept plain ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
    const url = new URL(input);
    // Short forms: youtu.be/ID
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id?.length === 11 ? id : null;
    }
    // Standard: youtube.com/watch?v=ID
    const v = url.searchParams.get("v");
    if (v && v.length === 11) return v;
    // Embed: youtube.com/embed/ID
    const parts = url.pathname.split("/");
    const embedIdx = parts.findIndex((p) => p === "embed");
    if (embedIdx >= 0 && parts[embedIdx + 1]?.length === 11) {
      return parts[embedIdx + 1];
    }
    return null;
  } catch {
    return null;
  }
}

function secondsFromHms(input: string): number {
  // Accepts: 90, 1:30, 00:01:30
  if (!input) return 0;
  if (/^\d+$/.test(input)) return parseInt(input, 10);
  const parts = input.split(":").map((p) => parseInt(p, 10));
  if (parts.some(Number.isNaN)) return 0;
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

function hmsFromSeconds(total: number): string {
  const s = Math.max(0, Math.floor(total));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return h > 0
    ? `${h}:${m.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`
    : `${m}:${ss.toString().padStart(2, "0")}`;
}

function HomeInner() {
  const params = useSearchParams();
  const defaultUrl =
    params.get("url") ?? "https://www.youtube.com/watch?v=BYizgB2FcAQ";
  const [videoUrl, setVideoUrl] = useState<string>(defaultUrl);
  const [videoId, setVideoId] = useState<string | null>(() =>
    parseYouTubeId(defaultUrl)
  );
  const [title, setTitle] = useState<string>("Clip 1");
  const [startText, setStartText] = useState<string>("0:00");
  const [endText, setEndText] = useState<string>("0:30");
  const [clips, setClips] = useState<Clip[]>([]);
  const [error, setError] = useState<string>("");
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = parseYouTubeId(videoUrl);
    setVideoId(id);
    setError(id ? "" : "Enter a valid YouTube URL or ID");
  }, [videoUrl]);

  const startSec = useMemo(() => secondsFromHms(startText), [startText]);
  const endSec = useMemo(() => secondsFromHms(endText), [endText]);
  const validRange = endSec > startSec && startSec >= 0;

  function addClip() {
    if (!videoId || !validRange) return;
    const c: Clip = {
      id: crypto.randomUUID(),
      title: title.trim() || `Clip ${clips.length + 1}`,
      start: startSec,
      end: endSec,
    };
    setClips((prev) => [...prev, c]);
    setTitle(`Clip ${clips.length + 2}`);
    setActiveIdx(clips.length);
    setTimeout(() => titleRef.current?.focus(), 0);
  }

  function removeClip(id: string) {
    setClips((prev) => prev.filter((c) => c.id !== id));
    setActiveIdx(-1);
  }

  return (
    <main className="space-y-8">
      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="label">YouTube URL or ID</label>
            <input
              className="input"
              placeholder="Paste a YouTube URL"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start (h:mm:ss or seconds)</label>
              <input
                className="input"
                value={startText}
                onChange={(e) => setStartText(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                {hmsFromSeconds(startSec)} ({startSec}s)
              </p>
            </div>
            <div>
              <label className="label">End (h:mm:ss or seconds)</label>
              <input
                className="input"
                value={endText}
                onChange={(e) => setEndText(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                {hmsFromSeconds(endSec)} ({endSec}s)
              </p>
            </div>
          </div>
          <div>
            <label className="label">Clip title</label>
            <input
              ref={titleRef}
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="btn btn-primary disabled:opacity-50"
              onClick={addClip}
              disabled={!videoId || !validRange}
            >
              Add Clip
            </button>
            {videoId && validRange && (
              <a
                className="btn"
                href={`https://www.youtube.com/embed/${videoId}?start=${startSec}&end=${endSec}&autoplay=1`}
                target="_blank"
              >
                Preview range
              </a>
            )}
          </div>
        </div>
        <div className="aspect-video overflow-hidden rounded-lg border bg-black">
          {videoId ? (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              Enter a valid YouTube URL
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Clips</h2>
        {clips.length === 0 ? (
          <p className="text-sm text-gray-500">
            No clips added yet. Define a start/end and click Add Clip.
          </p>
        ) : (
          <ul className="space-y-4">
            {clips.map((clip, idx) => (
              <li
                key={clip.id}
                className={`rounded-lg border bg-white p-4 shadow-sm ${activeIdx === idx ? "ring-2 ring-[var(--brand)]" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {clip.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {hmsFromSeconds(clip.start)}{" -> "}{hmsFromSeconds(clip.end)} ({clip.end - clip.start}s)
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {videoId && (
                      <a
                        className="btn"
                        href={`https://www.youtube.com/embed/${videoId}?start=${clip.start}&end=${clip.end}&autoplay=1`}
                        target="_blank"
                      >
                        Preview
                      </a>
                    )}
                    {videoId && (
                      <Link
                        className="btn btn-primary"
                        href={`/clip?v=${videoId}&start=${clip.start}&end=${clip.end}&t=${encodeURIComponent(clip.title)}`}
                        prefetch={false}
                      >
                        Open clip page
                      </Link>
                    )}
                    <button className="btn" onClick={() => removeClip(clip.id)}>
                      Remove
                    </button>
                  </div>
                </div>
                {videoId && (
                  <div className="mt-3 aspect-video overflow-hidden rounded-md border bg-black">
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/${videoId}?start=${clip.start}&end=${clip.end}`}
                      title={`Preview ${clip.title}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading?</div>}>
      <HomeInner />
    </Suspense>
  );
}
