import { useState, useEffect } from "react";
import { Eye, EyeOff, MapPin, ZoomIn, ZoomOut, Sparkles, HelpCircle, Volume2, RotateCcw } from "lucide-react";
import type { SpeakingScene } from "@/lib/study/speaking-types";
import { speakJapanese } from "@/lib/study/speech";

export interface SpeakingSceneViewerProps {
  scene: SpeakingScene;
}

const VALID_SCENE_TYPES = [
  "classroom",
  "station",
  "cafeteria",
  "convenience_store",
  "fpt_campus",
  "restaurant",
  "dormitory",
  "park",
  "asakusa",
  "supermarket",
  "cafe",
];

function resolveSceneUrl(scene: SpeakingScene): string {
  if (
    scene.imageUrl &&
    (scene.imageUrl.startsWith("/images/scenes/") ||
      (scene.imageUrl.startsWith("http") && !scene.imageUrl.includes("example.com")))
  ) {
    return scene.imageUrl;
  }
  const typeKey = (scene.type || "").toLowerCase().trim();
  if (VALID_SCENE_TYPES.includes(typeKey)) {
    return `/images/scenes/${typeKey}.jpg`;
  }
  return "/images/scenes/classroom.jpg";
}

export function SpeakingSceneViewer({ scene }: SpeakingSceneViewerProps) {
  const [showHotspots, setShowHotspots] = useState(true);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(() => resolveSceneUrl(scene));
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setCurrentSrc(resolveSceneUrl(scene));
    setImageError(false);
    setImageLoaded(false);
    setActiveHotspotId(null);
  }, [scene.id, scene.type, scene.imageUrl]);

  function handleImageError() {
    const defaultLocal = `/images/scenes/${scene.type}.jpg`;
    if (currentSrc !== defaultLocal && VALID_SCENE_TYPES.includes(scene.type)) {
      setCurrentSrc(defaultLocal);
      return;
    }
    if (currentSrc !== "/images/scenes/classroom.jpg") {
      setCurrentSrc("/images/scenes/classroom.jpg");
      return;
    }
    setImageError(true);
  }

  function handleRetry() {
    setImageError(false);
    setImageLoaded(false);
    setCurrentSrc(`${resolveSceneUrl(scene)}?t=${Date.now()}`);
  }

  return (
    <div className="rounded-2xl border border-line/80 bg-sheet p-4 sm:p-5 shadow-xs space-y-4">
      {/* Tiêu đề & Công cụ điều khiển tranh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-700">
              <MapPin className="size-3" />
              <span>{scene.location}</span>
            </span>
            <span className="text-xs text-stone font-medium">Bức tranh chủ đề</span>
          </div>
          <h3 className="display mt-1 text-lg font-bold text-ink sm:text-xl">
            {scene.title}
            <span className="ml-2 text-sm font-normal text-stone">({scene.titleVi})</span>
          </h3>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setShowHotspots(!showHotspots)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              showHotspots
                ? "border-amber-500/40 bg-amber-500/10 text-amber-800"
                : "border-line bg-paper text-stone hover:text-ink"
            }`}
            title="Bật/Tắt điểm chú thích trên tranh"
          >
            {showHotspots ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            <span>{showHotspots ? "Ẩn chú thích" : "Hiện chú thích"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-medium text-stone hover:text-ink transition-all shadow-xs cursor-pointer"
            title="Thu phóng tranh"
          >
            {isZoomed ? <ZoomOut className="size-3.5" /> : <ZoomIn className="size-3.5" />}
            <span className="hidden sm:inline">{isZoomed ? "Thu nhỏ" : "Phóng to"}</span>
          </button>
        </div>
      </div>

      {/* Bức tranh nghệ thuật phong cách Anime */}
      <div
        className={`relative overflow-hidden rounded-xl border border-line/90 bg-stone-900 shadow-inner transition-all duration-300 ${
          isZoomed ? "aspect-16/11 max-h-[540px]" : "aspect-16/9 max-h-[420px]"
        }`}
      >
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-900/60 animate-pulse z-0">
            <span className="text-xs text-stone-300 font-medium">Đang tải tranh minh họa phong cách Anime...</span>
          </div>
        )}
        {!imageError ? (
          <img
            src={currentSrc}
            alt={scene.titleVi}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
            className={`w-full h-full object-cover select-none transition-all duration-500 ${
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-102"
            }`}
          />
        ) : (
          <AestheticSceneFallback scene={scene} onRetry={handleRetry} />
        )}

        {/* Các điểm chú thích Hotspots trên tranh */}
        {showHotspots &&
          scene.hotspots.map((hs) => {
            const isActive = activeHotspotId === hs.id;
            const isNearTop = hs.yPercent < 35;
            const isNearLeft = hs.xPercent < 22;
            const isNearRight = hs.xPercent > 78;

            // Vị trí tooltip tránh bị tràn viền tranh
            const verticalClass = isNearTop ? "top-full mt-2.5" : "bottom-full mb-2.5";
            const horizontalClass = isNearLeft
              ? "left-0 translate-x-0"
              : isNearRight
              ? "right-0 translate-x-0"
              : "left-1/2 -translate-x-1/2";

            return (
              <div
                key={hs.id}
                style={{ left: `${hs.xPercent}%`, top: `${hs.yPercent}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
              >
                <button
                  type="button"
                  onClick={() => {
                    const next = isActive ? null : hs.id;
                    setActiveHotspotId(next);
                    if (next) speakJapanese(hs.labelJp);
                  }}
                  onMouseEnter={() => setActiveHotspotId(hs.id)}
                  className={`group relative flex size-7 items-center justify-center rounded-full border-2 shadow-lg transition-transform hover:scale-115 cursor-pointer ${
                    isActive
                      ? "border-amber-600 bg-amber-500 text-white ring-4 ring-amber-400/30"
                      : "border-white bg-red-600 text-white hover:bg-amber-500"
                  }`}
                  aria-label={hs.labelVi}
                  title={`${hs.labelJp} (${hs.labelVi})`}
                >
                  <span className="size-2 rounded-full bg-white animate-ping opacity-75 absolute" />
                  <span className="text-[11px] font-black leading-none">•</span>
                </button>

                {/* Tooltip khi click hoặc hover */}
                {isActive && (
                  <div
                    className={`absolute ${verticalClass} ${horizontalClass} w-max max-w-64 rounded-xl border border-line/90 bg-paper/95 p-2.5 text-xs shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 z-20`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-ink text-xs sm:text-sm">{hs.labelJp}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakJapanese(hs.labelJp);
                        }}
                        className="rounded-md p-1 text-stone hover:text-amber-700 hover:bg-amber-500/10 cursor-pointer"
                        title="Nghe phát âm từ vựng này"
                      >
                        <Volume2 className="size-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-stone mt-0.5">{hs.labelVi}</p>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Mô tả ngữ cảnh bức tranh */}
      <div className="rounded-xl border border-line/70 bg-paper/60 p-3.5 text-xs text-stone space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-ink">
          <HelpCircle className="size-3.5 text-amber-600" />
          <span>Gợi ý quan sát tranh:</span>
        </div>
        <p className="leading-relaxed">{scene.description}</p>
      </div>
    </div>
  );
}

/**
 * Giao diện Fallback thẩm mỹ phong cách Anime khi mạng chậm hoặc ảnh chưa tải kịp
 */
function AestheticSceneFallback({
  scene,
  onRetry,
}: {
  scene: SpeakingScene;
  onRetry: () => void;
}) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-stone-900 via-amber-950/40 to-stone-950 text-white text-center overflow-hidden select-none">
      {/* Nền hoa văn Nhật Bản */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative mb-3 flex size-14 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-300 shadow-lg backdrop-blur-xs">
        <Sparkles className="size-7" />
      </div>

      <div className="relative z-10 max-w-md space-y-2">
        <span className="inline-block rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-300 border border-amber-400/20">
          {scene.location}
        </span>
        <h4 className="text-base sm:text-lg font-bold text-white tracking-wide">
          {scene.title}
        </h4>
        <p className="text-xs text-stone-300 line-clamp-2">
          {scene.description}
        </p>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="relative z-10 mt-4 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-stone-950 hover:bg-amber-400 transition-all shadow-md cursor-pointer"
      >
        <RotateCcw className="size-3.5" />
        <span>Tải lại ảnh minh họa</span>
      </button>
    </div>
  );
}
