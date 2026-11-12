import { useState, useRef, useEffect } from "react";
import { Volume2, Languages, Eye, EyeOff, Sparkles, BookOpen, X, VolumeX } from "lucide-react";
import { speakJapanese } from "@/lib/study/speech";
import { inspectJapaneseCharOrWord } from "@/lib/study/reading-inspector";
import type { ReadingPassage, ReadingSentence, WordInspection } from "@/lib/study/reading-types";

interface ReadingViewerProps {
  passage: ReadingPassage;
  onSentenceClick?: (sentence: ReadingSentence, index: number) => void;
}

export function ReadingViewer({ passage, onSentenceClick }: ReadingViewerProps) {
  const [showRomaji, setShowRomaji] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number | null>(null);
  const [isPlayingFull, setIsPlayingFull] = useState(false);
  const [inspectedWord, setInspectedWord] = useState<WordInspection | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Đóng popover khi nhấp ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (inspectedWord && !(e.target as HTMLElement).closest(".inspection-popover")) {
        setInspectedWord(null);
        setPopoverPos(null);
      }
    }
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [inspectedWord]);

  // Xử lý phát âm toàn bài đọc
  function handlePlayFull() {
    if (isPlayingFull) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingFull(false);
      setActiveSentenceIndex(null);
      return;
    }

    setIsPlayingFull(true);
    speakJapanese(passage.content);

    // Tự động tắt trạng thái phát sau một khoảng thời gian ước lượng
    const estimatedMs = Math.max(passage.content.length * 280, 3000);
    setTimeout(() => {
      setIsPlayingFull(false);
    }, estimatedMs);
  }

  // Phát âm từng câu khi bấm nút loa nhỏ
  function handlePlaySentence(sentence: ReadingSentence, index: number, e: React.MouseEvent) {
    e.stopPropagation();
    setActiveSentenceIndex(index);
    speakJapanese(sentence.jp);
  }

  // Xử lý sự kiện ấn đúp (double-click) vào bất kỳ chữ/từ nào
  function handleDoubleClick(e: React.MouseEvent) {
    const selection = window.getSelection();
    let text = selection ? selection.toString().trim() : "";

    // Nếu không có selection dạng bôi đen, tìm ký tự hoặc từ tại vị trí chuột
    if (!text) {
      const target = e.target as HTMLElement;
      text = target.innerText?.trim() || "";
    }

    if (text) {
      // Giới hạn độ dài để tra cứu từ/ký tự hợp lý
      const query = text.slice(0, 10);
      const inspection = inspectJapaneseCharOrWord(query);
      if (inspection.text) {
        // Tọa độ hiển thị popover
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const clientX = Math.min(Math.max(e.clientX, 20), window.innerWidth - 280);
        const clientY = Math.max(e.clientY - 90, 80);

        setPopoverPos({ x: clientX, y: clientY });
        setInspectedWord(inspection);
        speakJapanese(inspection.text);
      }
    }
  }

  return (
    <div ref={containerRef} className="relative rounded-2xl border border-line bg-sheet p-5 sm:p-7 shadow-sm">
      {/* Thanh tiêu đề và công cụ đọc */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-0.5 text-xs font-semibold text-paper">
              {passage.course}
            </span>
            <span className="text-xs font-medium text-stone">{passage.theme}</span>
          </div>
          <h2 className="display mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {passage.title}
          </h2>
          <p className="text-sm text-stone italic">{passage.titleVi}</p>
        </div>

        {/* Nút điều khiển âm thanh và Romaji */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePlayFull}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              isPlayingFull
                ? "bg-rose-500 text-white shadow-sm animate-pulse"
                : "bg-ink text-paper hover:bg-ink/90"
            }`}
            title="Đọc toàn bộ bài đọc tiếng Nhật"
          >
            {isPlayingFull ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            <span>{isPlayingFull ? "Dừng đọc" : "Nghe đọc toàn bài"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRomaji(!showRomaji)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              showRomaji
                ? "border-amber-500/40 bg-amber-500/10 text-amber-700"
                : "border-line bg-paper text-stone hover:text-ink hover:border-ink/30"
            }`}
            title="Bật/Tắt hiển thị cách đọc Romaji"
          >
            <Languages className="size-3.5" />
            <span>{showRomaji ? "Ẩn Romaji" : "Hiện Romaji"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTranslation(!showTranslation)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              showTranslation
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
                : "border-line bg-paper text-stone hover:text-ink hover:border-ink/30"
            }`}
            title="Bật/Tắt dịch nghĩa toàn bài tiếng Việt"
          >
            {showTranslation ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            <span>{showTranslation ? "Ẩn bản dịch" : "Dịch nghĩa"}</span>
          </button>
        </div>
      </div>

      {/* Hướng dẫn tương tác nhanh */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-stone">
        <span className="flex items-center gap-1">
          <Sparkles className="size-3 text-amber-500" />
          <span>Mẹo: <strong>Ấn đúp vào bất kỳ chữ/từ nào</strong> để xem ngay Romaji, Hán Việt và nghĩa</span>
        </span>
        <span className="hidden sm:inline">Bấm vào câu để nghe phát âm</span>
      </div>

      {/* Nội dung bài đọc (Hiển thị từng câu tương tác) */}
      <div
        className="mt-5 space-y-3 jp text-lg sm:text-xl leading-relaxed text-ink select-text"
        onDoubleClick={handleDoubleClick}
      >
        {passage.sentences.map((s, idx) => {
          const isActive = activeSentenceIndex === idx;
          return (
            <div
              key={idx}
              onClick={() => {
                setActiveSentenceIndex(idx);
                onSentenceClick?.(s, idx);
              }}
              className={`group relative rounded-xl p-3 transition-all cursor-pointer border ${
                isActive
                  ? "border-amber-500/40 bg-amber-500/5 shadow-xs"
                  : "border-transparent hover:border-line hover:bg-paper/60"
              }`}
            >
              {/* Câu tiếng Nhật */}
              <div className="flex items-start justify-between gap-3">
                <p className="flex-1 font-normal tracking-wide leading-relaxed">{s.jp}</p>
                <button
                  type="button"
                  onClick={(e) => handlePlaySentence(s, idx, e)}
                  className="mt-0.5 shrink-0 rounded-md p-1.5 text-stone transition-colors hover:bg-paper hover:text-ink"
                  title="Nghe câu này"
                >
                  <Volume2 className="size-4" />
                </button>
              </div>

              {/* Romaji của câu (nếu bật chế độ Romaji) */}
              {showRomaji && s.romaji && (
                <p className="mt-1 font-sans text-xs sm:text-sm font-medium tracking-normal text-amber-700/90 dark:text-amber-400">
                  {s.romaji}
                </p>
              )}

              {/* Bản dịch nghĩa tiếng Việt của câu (nếu bật chế độ Dịch) */}
              {showTranslation && s.vi && (
                <p className="mt-1 font-sans text-xs sm:text-sm font-normal text-stone">
                  {s.vi}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Bản dịch nghĩa hoàn chỉnh toàn bài (nếu bật toggle) */}
      {showTranslation && (
        <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm leading-relaxed text-emerald-950 dark:text-emerald-200">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300 mb-1.5">
            <BookOpen className="size-4" />
            <span>Bản dịch toàn bài tiếng Việt:</span>
          </div>
          <p>{passage.translation}</p>
        </div>
      )}

      {/* Floating Popover hiển thị khi người dùng ấn đúp (Double-Click) vào một chữ hoặc từ */}
      {inspectedWord && popoverPos && (
        <div
          className="inspection-popover fixed z-50 w-72 rounded-xl border border-line bg-paper p-4 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
          style={{ top: `${popoverPos.y}px`, left: `${popoverPos.x}px` }}
        >
          <div className="flex items-start justify-between gap-2 border-b border-line pb-2">
            <div>
              <span className="jp text-2xl font-bold text-ink">{inspectedWord.text}</span>
              {inspectedWord.hanviet && (
                <span className="ml-2 rounded bg-amber-500/10 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
                  {inspectedWord.hanviet}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setInspectedWord(null)}
              className="rounded p-1 text-stone hover:bg-stone/10 hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-2.5 space-y-1.5 text-xs">
            <div className="flex items-baseline justify-between">
              <span className="text-stone">Romaji:</span>
              <span className="font-mono text-sm font-bold text-amber-700 dark:text-amber-400">
                {inspectedWord.romaji}
              </span>
            </div>

            {inspectedWord.hiragana && inspectedWord.hiragana !== inspectedWord.text && (
              <div className="flex items-baseline justify-between">
                <span className="text-stone">Hiragana:</span>
                <span className="jp text-sm font-medium text-ink">
                  {inspectedWord.hiragana}
                </span>
              </div>
            )}

            <div className="pt-1 border-t border-line/60">
              <span className="text-stone block mb-0.5">Ý nghĩa:</span>
              <span className="font-medium text-ink text-sm">{inspectedWord.meaning}</span>
            </div>

            {inspectedWord.lesson && (
              <div className="text-[11px] text-stone italic">
                {inspectedWord.lesson}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-line/80 pt-2.5">
            <button
              type="button"
              onClick={() => speakJapanese(inspectedWord.text)}
              className="flex items-center gap-1.5 rounded-md bg-ink px-2.5 py-1 text-xs font-medium text-paper hover:bg-ink/90"
            >
              <Volume2 className="size-3.5" />
              <span>Phát âm</span>
            </button>
            <span className="text-[10px] text-stone">Nhấp đúp để tra</span>
          </div>
        </div>
      )}
    </div>
  );
}
