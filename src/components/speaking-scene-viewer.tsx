import { useState } from "react";
import { Eye, EyeOff, MapPin, ZoomIn, ZoomOut, Sparkles, HelpCircle } from "lucide-react";
import type { SpeakingScene } from "@/lib/study/speaking-types";

export interface SpeakingSceneViewerProps {
  scene: SpeakingScene;
}

export function SpeakingSceneViewer({ scene }: SpeakingSceneViewerProps) {
  const [showHotspots, setShowHotspots] = useState(true);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

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

      {/* Bức tranh Vector SVG Minh Họa */}
      <div
        className={`relative overflow-hidden rounded-xl border border-line/90 bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-900/40 dark:to-stone-900/60 shadow-inner transition-all duration-300 ${
          isZoomed ? "aspect-16/11 max-h-[520px]" : "aspect-16/9 max-h-[360px]"
        }`}
      >
        <SceneVectorIllustration type={scene.type} />

        {/* Các điểm chú thích Hotspots trên tranh */}
        {showHotspots &&
          scene.hotspots.map((hs) => {
            const isActive = activeHotspotId === hs.id;
            return (
              <div
                key={hs.id}
                style={{ left: `${hs.xPercent}%`, top: `${hs.yPercent}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
              >
                <button
                  type="button"
                  onClick={() => setActiveHotspotId(isActive ? null : hs.id)}
                  onMouseEnter={() => setActiveHotspotId(hs.id)}
                  className={`group relative flex size-7 items-center justify-center rounded-full border-2 shadow-lg transition-transform hover:scale-115 cursor-pointer ${
                    isActive
                      ? "border-amber-600 bg-amber-500 text-white ring-4 ring-amber-400/30"
                      : "border-white bg-red-600 text-white hover:bg-amber-500"
                  }`}
                  aria-label={hs.labelVi}
                >
                  <span className="size-2 rounded-full bg-white animate-ping opacity-75 absolute" />
                  <span className="text-[11px] font-black leading-none">•</span>
                </button>

                {/* Tooltip khi click hoặc hover */}
                {isActive && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-56 rounded-lg border border-line/90 bg-paper/95 p-2.5 text-xs shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 z-20">
                    <p className="font-bold text-ink">{hs.labelJp}</p>
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
 * Trình vẽ tranh Vector SVG sinh động theo từng loại chủ đề
 */
function SceneVectorIllustration({ type }: { type: string }) {
  if (type === "restaurant") {
    return (
      <svg viewBox="0 0 800 450" className="w-full h-full object-cover select-none">
        {/* Nền nhà hàng ấm áp */}
        <rect width="800" height="450" fill="#fcf8f2" />
        <rect x="0" y="280" width="800" height="170" fill="#e8dfd1" />
        {/* Đèn lồng Nhật Bản */}
        <path d="M 120 0 L 120 70" stroke="#8a4b38" strokeWidth="3" />
        <rect x="90" y="70" width="60" height="80" rx="20" fill="#d9534f" stroke="#8a4b38" strokeWidth="3" />
        <text x="120" y="118" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="bold">和</text>

        <path d="M 680 0 L 680 70" stroke="#8a4b38" strokeWidth="3" />
        <rect x="650" y="70" width="60" height="80" rx="20" fill="#d9534f" stroke="#8a4b38" strokeWidth="3" />
        <text x="680" y="118" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="bold">食</text>

        {/* Khung menu treo tường */}
        <rect x="300" y="30" width="200" height="100" rx="8" fill="#fff" stroke="#d5c8b5" strokeWidth="2" />
        <text x="400" y="65" textAnchor="middle" fill="#2b2621" fontSize="16" fontWeight="bold">本日のお品書き</text>
        <text x="400" y="95" textAnchor="middle" fill="#6c645c" fontSize="13">ラーメン 800円 / カレー 900円</text>

        {/* Bàn ăn lớn ở giữa */}
        <ellipse cx="400" cy="330" rx="280" ry="90" fill="#c49a6c" stroke="#8a6138" strokeWidth="4" />
        <ellipse cx="400" cy="326" rx="265" ry="80" fill="#dfbe96" />

        {/* Nhân vật Nam bên trái */}
        <circle cx="220" cy="190" r="38" fill="#fcd7b6" />
        <path d="M 190 180 Q 220 145 250 180" fill="#2b2621" />
        <path d="M 180 230 C 180 220, 260 220, 260 230 L 255 310 L 185 310 Z" fill="#3b6978" />
        {/* Đũa gắp mì */}
        <line x1="240" y1="260" x2="290" y2="290" stroke="#5a3d28" strokeWidth="4" strokeLinecap="round" />
        <line x1="242" y1="265" x2="292" y2="295" stroke="#5a3d28" strokeWidth="4" strokeLinecap="round" />

        {/* Nhân vật Nữ bên phải */}
        <circle cx="580" cy="190" r="38" fill="#fcd7b6" />
        <path d="M 545 185 Q 580 135 615 185 Q 610 240 595 240 Q 565 240 545 185" fill="#5c3826" />
        <path d="M 540 230 C 540 220, 620 220, 620 230 L 615 310 L 545 310 Z" fill="#b85973" />

        {/* Bát Mì Ramen (800 yên) */}
        <g transform="translate(320, 280)">
          <path d="M 0 30 Q 45 90 90 30 Z" fill="#d9534f" stroke="#8a4b38" strokeWidth="3" />
          <ellipse cx="45" cy="30" rx="45" ry="16" fill="#f3dfb2" stroke="#8a4b38" strokeWidth="2" />
          <path d="M 15 30 Q 30 15 45 30 Q 60 15 75 30" stroke="#e0a030" strokeWidth="4" fill="none" />
          <circle cx="55" cy="28" r="8" fill="#fff" />
          <circle cx="55" cy="28" r="5" fill="#f0ad4e" />
          {/* Hơi nóng bốc lên */}
          <path d="M 30 15 Q 35 0 30 -15" stroke="#fff" strokeWidth="2" fill="none" opacity="0.6" />
          <path d="M 55 15 Q 60 0 55 -15" stroke="#fff" strokeWidth="2" fill="none" opacity="0.6" />
        </g>

        {/* Đĩa Cơm Cà Ri (900 yên) */}
        <g transform="translate(430, 290)">
          <ellipse cx="45" cy="25" rx="55" ry="25" fill="#fff" stroke="#cfc5b8" strokeWidth="3" />
          {/* Cơm trắng một nửa */}
          <ellipse cx="25" cy="25" rx="28" ry="18" fill="#f8f9fa" />
          {/* Cà ri nâu một nửa */}
          <path d="M 25 10 Q 75 10 75 35 Q 50 45 25 35 Z" fill="#805b38" />
          {/* Thìa dĩa bên cạnh */}
          <rect x="88" y="10" width="4" height="35" rx="2" fill="#adb5bd" />
          <circle cx="90" cy="8" r="7" fill="#adb5bd" />
        </g>

        {/* Ly nước cam mát lạnh */}
        <g transform="translate(540, 260)">
          <path d="M 0 0 L 6 35 L 24 35 L 30 0 Z" fill="#ffa500" stroke="#adb5bd" strokeWidth="2" opacity="0.85" />
          <line x1="20" y1="-8" x2="10" y2="28" stroke="#d9534f" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  if (type === "park") {
    return (
      <svg viewBox="0 0 800 450" className="w-full h-full object-cover select-none">
        {/* Trời xanh mùa xuân */}
        <rect width="800" height="450" fill="#e8f4f8" />
        {/* Mặt trời & Mây */}
        <circle cx="120" cy="80" r="38" fill="#ffd166" opacity="0.85" />
        <ellipse cx="280" cy="90" rx="60" ry="22" fill="#fff" opacity="0.9" />
        <ellipse cx="620" cy="70" rx="75" ry="25" fill="#fff" opacity="0.9" />

        {/* Đồi cỏ xanh */}
        <path d="M 0 320 Q 250 240 500 290 T 800 260 L 800 450 L 0 450 Z" fill="#95d5b2" />
        <path d="M 0 350 Q 300 280 600 340 T 800 320 L 800 450 L 0 450 Z" fill="#74c69d" />

        {/* Cây hoa anh đào to lớn */}
        <path d="M 460 380 L 475 230 L 460 210 L 485 230 L 480 380 Z" fill="#774936" stroke="#523225" strokeWidth="3" />
        {/* Tán hoa anh đào màu hồng */}
        <ellipse cx="460" cy="180" rx="100" ry="65" fill="#ffb7b2" opacity="0.95" />
        <ellipse cx="400" cy="160" rx="75" ry="55" fill="#ffccd5" opacity="0.9" />
        <ellipse cx="520" cy="165" rx="80" ry="58" fill="#ffccd5" opacity="0.9" />
        <ellipse cx="470" cy="130" rx="65" ry="45" fill="#fff0f3" opacity="0.9" />

        {/* Người đàn ông chạy bộ */}
        <g transform="translate(180, 260)">
          <circle cx="30" cy="20" r="14" fill="#fcd7b6" />
          <path d="M 18 35 L 42 35 L 36 75 L 24 75 Z" fill="#ffffff" stroke="#ced4da" strokeWidth="1" />
          <line x1="24" y1="75" x2="10" y2="105" stroke="#2b2621" strokeWidth="6" strokeLinecap="round" />
          <line x1="36" y1="75" x2="52" y2="100" stroke="#2b2621" strokeWidth="6" strokeLinecap="round" />
          <line x1="18" y1="42" x2="6" y2="60" stroke="#fcd7b6" strokeWidth="5" strokeLinecap="round" />
          <line x1="42" y1="42" x2="56" y2="55" stroke="#fcd7b6" strokeWidth="5" strokeLinecap="round" />
        </g>

        {/* Hai người nữ chụp ảnh dưới tán cây */}
        <g transform="translate(560, 250)">
          <circle cx="20" cy="25" r="14" fill="#fcd7b6" />
          <path d="M 10 40 Q 20 20 30 40 L 26 85 L 14 85 Z" fill="#e76f51" />
          <circle cx="50" cy="26" r="14" fill="#fcd7b6" />
          <path d="M 40 40 Q 50 20 60 40 L 56 85 L 44 85 Z" fill="#2a9d8f" />
          {/* Giơ smartphone chụp ảnh */}
          <rect x="25" y="42" width="16" height="10" rx="2" fill="#2b2621" />
          <line x1="18" y1="50" x2="26" y2="46" stroke="#fcd7b6" strokeWidth="4" />
        </g>

        {/* Hai chiếc xe đạp */}
        <g transform="translate(670, 320)">
          <circle cx="20" cy="30" r="18" fill="none" stroke="#495057" strokeWidth="3" />
          <circle cx="65" cy="30" r="18" fill="none" stroke="#495057" strokeWidth="3" />
          <line x1="20" y1="30" x2="42" y2="15" stroke="#e63946" strokeWidth="3" />
          <line x1="42" y1="15" x2="65" y2="30" stroke="#e63946" strokeWidth="3" />
          <line x1="42" y1="15" x2="40" y2="8" stroke="#495057" strokeWidth="3" />
        </g>
      </svg>
    );
  }

  if (type === "supermarket" || type === "convenience_store") {
    return (
      <svg viewBox="0 0 800 450" className="w-full h-full object-cover select-none">
        {/* Sàn siêu thị sáng sủa */}
        <rect width="800" height="450" fill="#f8f9fa" />
        <rect x="0" y="240" width="800" height="210" fill="#e9ecef" />
        {/* Kệ hàng phía sau */}
        <rect x="50" y="80" width="300" height="160" fill="#dee2e6" stroke="#ced4da" strokeWidth="3" />
        {/* Hàng rau quả tươi trên kệ */}
        <circle cx="90" cy="115" r="12" fill="#e63946" />
        <circle cx="120" cy="115" r="12" fill="#e63946" />
        <circle cx="150" cy="115" r="12" fill="#e63946" />
        <circle cx="90" cy="155" r="14" fill="#2a9d8f" />
        <circle cx="125" cy="155" r="14" fill="#2a9d8f" />
        <circle cx="160" cy="155" r="14" fill="#2a9d8f" />
        <rect x="65" y="195" width="40" height="30" rx="4" fill="#f4a261" />
        <rect x="115" y="195" width="40" height="30" rx="4" fill="#f4a261" />

        {/* Quầy thịt bên phải */}
        <rect x="420" y="80" width="330" height="160" fill="#dee2e6" stroke="#ced4da" strokeWidth="3" />
        <rect x="450" y="110" width="120" height="50" rx="6" fill="#fff" stroke="#adb5bd" strokeWidth="2" />
        <text x="510" y="138" textAnchor="middle" fill="#d90429" fontSize="13" fontWeight="bold">とり肉 600円</text>
        <rect x="600" y="110" width="120" height="50" rx="6" fill="#fff" stroke="#adb5bd" strokeWidth="2" />
        <text x="660" y="138" textAnchor="middle" fill="#7f1d1d" fontSize="13" fontWeight="bold">牛肉 1200円</text>

        {/* Người mẹ đẩy giỏ hàng */}
        <g transform="translate(240, 210)">
          <circle cx="30" cy="30" r="18" fill="#fcd7b6" />
          <path d="M 12 50 Q 30 35 48 50 L 44 140 L 16 140 Z" fill="#6d597a" />
          {/* Giỏ mua sắm */}
          <rect x="45" y="80" width="55" height="38" rx="4" fill="none" stroke="#e76f51" strokeWidth="3" />
          <circle cx="55" cy="122" r="6" fill="#343a40" />
          <circle cx="90" cy="122" r="6" fill="#343a40" />
        </g>

        {/* Quầy thu ngân & Hàng đợi 3 người */}
        <g transform="translate(600, 240)">
          <rect x="80" y="30" width="70" height="85" fill="#495057" rx="6" />
          <rect x="90" y="10" width="45" height="25" rx="3" fill="#212529" />
          {/* 3 người xếp hàng */}
          <circle cx="0" cy="35" r="14" fill="#fcd7b6" />
          <rect x="-10" y="50" width="20" height="60" rx="4" fill="#457b9d" />

          <circle cx="30" cy="35" r="14" fill="#fcd7b6" />
          <rect x="20" y="50" width="20" height="60" rx="4" fill="#e9c46a" />

          <circle cx="60" cy="35" r="14" fill="#fcd7b6" />
          <rect x="50" y="50" width="20" height="60" rx="4" fill="#2a9d8f" />
        </g>
      </svg>
    );
  }

  // Mặc định: Phòng học FPT / Giảng đường đại học
  return (
    <svg viewBox="0 0 800 450" className="w-full h-full object-cover select-none">
      {/* Tường phòng học */}
      <rect width="800" height="450" fill="#fcf9f2" />
      <rect x="0" y="270" width="800" height="180" fill="#e5dfd3" />

      {/* Bảng đen lớn ở trung tâm */}
      <rect x="150" y="40" width="500" height="180" rx="8" fill="#2d4a3e" stroke="#8a7356" strokeWidth="8" />
      <text x="400" y="90" textAnchor="middle" fill="#f1faee" fontSize="24" fontWeight="bold">
        日本語の授業 · 第4課〜第7課
      </text>
      <text x="400" y="130" textAnchor="middle" fill="#a8dadc" fontSize="18">
        あ い う え お · 漢字 · 文法
      </text>
      <text x="400" y="170" textAnchor="middle" fill="#ffd166" fontSize="16">
        FPT大学 · 口頭試験（スピーキング）
      </text>

      {/* Đồng hồ treo tường góc phải (9:15) */}
      <circle cx="720" cy="80" r="32" fill="#fff" stroke="#495057" strokeWidth="4" />
      <line x1="720" y1="80" x2="720" y2="60" stroke="#212529" strokeWidth="3" strokeLinecap="round" />
      <line x1="720" y1="80" x2="738" y2="80" stroke="#e63946" strokeWidth="2" strokeLinecap="round" />

      {/* Thầy giáo Yamada đứng trước bảng */}
      <g transform="translate(180, 150)">
        <circle cx="40" cy="30" r="22" fill="#fcd7b6" />
        <path d="M 22 20 Q 40 5 58 20" fill="#2b2621" stroke="#2b2621" strokeWidth="4" />
        {/* Kính mắt */}
        <circle cx="33" cy="30" r="5" fill="none" stroke="#2b2621" strokeWidth="2" />
        <circle cx="47" cy="30" r="5" fill="none" stroke="#2b2621" strokeWidth="2" />
        <line x1="38" y1="30" x2="42" y2="30" stroke="#2b2621" strokeWidth="2" />
        {/* Áo vest thầy giáo */}
        <path d="M 15 54 L 65 54 L 60 160 L 20 160 Z" fill="#1d3557" />
        <path d="M 32 54 L 40 85 L 48 54 Z" fill="#fff" />
        <line x1="40" y1="65" x2="40" y2="105" stroke="#e63946" strokeWidth="3" />
      </g>

      {/* Bàn học sinh viên ở hàng trước */}
      <g transform="translate(260, 240)">
        <rect x="0" y="30" width="380" height="90" rx="8" fill="#bc8a5f" stroke="#8c5836" strokeWidth="4" />
        {/* Sách tiếng Nhật */}
        <rect x="40" y="45" width="45" height="30" rx="3" fill="#e63946" stroke="#fff" strokeWidth="2" />
        <text x="62" y="65" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">日本語</text>
        {/* Bút chì */}
        <line x1="95" y1="50" x2="115" y2="70" stroke="#ffd166" strokeWidth="4" strokeLinecap="round" />
        {/* Laptop đang mở */}
        <polygon points="170,40 240,40 250,70 160,70" fill="#ced4da" stroke="#adb5bd" strokeWidth="2" />
        <polygon points="175,15 235,15 240,40 170,40" fill="#343a40" stroke="#212529" strokeWidth="2" />
        <circle cx="205" cy="28" r="4" fill="#a8dadc" />
      </g>

      {/* Chiếc cặp đen để cạnh ghế */}
      <g transform="translate(180, 310)">
        <rect x="0" y="0" width="55" height="42" rx="6" fill="#212529" stroke="#495057" strokeWidth="2" />
        <path d="M 18 0 Q 27 -12 37 0" fill="none" stroke="#212529" strokeWidth="3" />
      </g>
    </svg>
  );
}
