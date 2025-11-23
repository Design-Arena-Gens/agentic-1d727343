import { Suspense } from "react";

function ClipContent() {
  const search = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const v = search.get("v") ?? "";
  const start = Number(search.get("start") ?? "0");
  const end = Number(search.get("end") ?? "0");
  const title = search.get("t") ?? "Clip";

  const valid = v && !Number.isNaN(start) && !Number.isNaN(end) && end > start;

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-gray-600">
          {valid ? `Playing ${start}s ? ${end}s` : "Invalid clip parameters"}
        </p>
      </div>
      <div className="aspect-video overflow-hidden rounded-lg border bg-black">
        {valid ? (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${v}?start=${start}&end=${end}&autoplay=1`}
            title="YouTube clip"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Invalid clip. Return to home to create one.
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <a className="btn" href={`/?url=https://www.youtube.com/watch?v=${v}`}>
          Create more clips
        </a>
        {valid && (
          <button
            className="btn btn-primary"
            onClick={async () => {
              const url = `${location.origin}/clip?v=${v}&start=${start}&end=${end}&t=${encodeURIComponent(title)}`;
              await navigator.clipboard.writeText(url);
              alert("Clip link copied!");
            }}
          >
            Copy link
          </button>
        )}
      </div>
    </main>
  );
}

export default function ClipPage() {
  return (
    <Suspense fallback={<div>Loading?</div>}>
      <ClipContent />
    </Suspense>
  );
}
