import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Volume2, Lightbulb, BookOpen, Layers, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressLine } from "@/components/progress-line";
import { QuizPanel, type QuizItem } from "@/components/quiz-panel";
import {
  KANA_ROWS,
  KANA_VOWELS,
  SCRIPTS,
  glyphsOf,
  kanaCell,
  kanaN,
  shuffle,
} from "@/lib/study/content";
import { kanaKey, useStudy } from "@/lib/study/store";
import { speakJapanese } from "@/lib/study/speech";
import { explainKanjiWithAi, type KanjiAiExplanation } from "@/lib/study/ai-service";
import type { Glyph, KanaSearch, Script } from "@/lib/study/types";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/kana")({
  validateSearch: (search: Record<string, unknown>): KanaSearch => ({
    script: search.script === "katakana" || search.script === "kanji" ? search.script : "hiragana",
    row: typeof search.row === "string" ? search.row : "",
    mode: search.mode === "study" || search.mode === "quiz" ? search.mode : "chart",
    at: Number(search.at) > 0 ? Math.floor(Number(search.at)) : 0,
  }),
  component: KanaPage,
});

function KanaPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/kana" });
  const known = useStudy((state) => state.knownKana);
  const setKnown = useStudy((state) => state.setKanaKnown);
  const setLast = useStudy((state) => state.setLast);

  const [kanjiCourse, setKanjiCourse] = useState<"all" | "jpd113" | "jpd123">("all");

  const glyphs = glyphsOf(search.script);

  const courseFilteredGlyphs = useMemo(() => {
    if (search.script !== "kanji" || kanjiCourse === "all") return glyphs;
    if (kanjiCourse === "jpd113") {
      return glyphs.filter((g) => g.row === "Bài 1" || g.row === "Bài 2" || g.row === "Bài 3");
    }
    return glyphs.filter((g) => g.row === "Bài 4" || g.row === "Bài 5" || g.row === "Bài 6" || g.row === "Bài 7");
  }, [glyphs, search.script, kanjiCourse]);

  const rows = search.script === "kanji"
    ? [...new Set(courseFilteredGlyphs.map((item) => item.row))]
    : [...KANA_ROWS];

  const pool = search.row ? courseFilteredGlyphs.filter((item) => item.row === search.row) : courseFilteredGlyphs;
  const index = Math.min(search.at, Math.max(pool.length - 1, 0));
  const current = pool[index];

  useEffect(() => {
    const label =
      search.mode === "study"
        ? `${labelOf(search.script)} · luyện`
        : search.mode === "quiz"
          ? `${labelOf(search.script)} · kiểm tra`
          : labelOf(search.script);
    setLast({
      to: "/kana",
      label,
      search,
    });
  }, [search.script, search.row, search.mode, search.at, setLast]);

  function setSearch(patch: Partial<KanaSearch>) {
    void navigate({ search: (prev) => ({ ...prev, ...patch }) });
  }

  const quiz = useMemo(() => (search.mode === "quiz" ? buildKanaQuiz(pool) : []), [search.mode, search.script, search.row]);

  return (
    <div>
      <p className="text-sm tracking-[0.18em] text-stone uppercase">Bảng chữ cái</p>
      <h1 className="display mt-2 text-4xl text-ink">{labelOf(search.script)}</h1>
      <p className="mt-2 text-stone">{SCRIPTS.find((item) => item.id === search.script)?.note}</p>

      <div className="mt-6 flex gap-2" role="tablist" aria-label="Loại chữ">
        {SCRIPTS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={search.script === item.id}
            className={cn(
              "min-h-11 rounded-md px-3 text-sm font-medium",
              search.script === item.id ? "bg-ink text-paper" : "text-stone hover:text-ink",
            )}
            onClick={() => setSearch({ script: item.id, row: "", mode: "chart", at: 0 })}
          >
            {item.label}
          </button>
        ))}
      </div>

      {search.mode === "chart" ? (
        <>
          {search.script === "kanji" ? (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-stone uppercase tracking-wider mr-1">Giáo trình:</span>
              <button
                type="button"
                onClick={() => {
                  setKanjiCourse("all");
                  setSearch({ row: "", at: 0 });
                }}
                className={cn(
                  "min-h-9 px-3 rounded-full text-xs font-medium transition cursor-pointer",
                  kanjiCourse === "all" ? "bg-ink text-paper" : "bg-sheet border border-line text-stone hover:text-ink"
                )}
              >
                Tất cả ({glyphs.length} chữ)
              </button>
              <button
                type="button"
                onClick={() => {
                  setKanjiCourse("jpd113");
                  setSearch({ row: "", at: 0 });
                }}
                className={cn(
                  "min-h-9 px-3 rounded-full text-xs font-medium transition cursor-pointer",
                  kanjiCourse === "jpd113" ? "bg-amber-600 text-white" : "bg-sheet border border-line text-stone hover:text-ink"
                )}
              >
                JPD113 (Bài 1–3)
              </button>
              <button
                type="button"
                onClick={() => {
                  setKanjiCourse("jpd123");
                  setSearch({ row: "", at: 0 });
                }}
                className={cn(
                  "min-h-9 px-3 rounded-full text-xs font-medium transition cursor-pointer",
                  kanjiCourse === "jpd123" ? "bg-seal text-paper" : "bg-sheet border border-line text-stone hover:text-ink"
                )}
              >
                JPD123 (Bài 4–7)
              </button>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <RowChip active={search.row === ""} onClick={() => setSearch({ row: "", at: 0 })}>
              {search.script === "kanji" ? "Tất cả bài trong mục" : "Tất cả"}
            </RowChip>
            {rows.map((row) => (
              <RowChip key={row} active={search.row === row} onClick={() => setSearch({ row, at: 0 })}>
                {row}
              </RowChip>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button tone="seal" onClick={() => setSearch({ mode: "study", at: 0 })}>
              Luyện {pool.length} chữ
            </Button>
            <Button onClick={() => setSearch({ mode: "quiz", at: 0 })}>Kiểm tra</Button>
          </div>

          {search.script === "kanji" ? (
            <KanjiList
              glyphs={pool}
              known={known}
              onOpen={(glyph) => {
                const at = pool.findIndex((item) => item.char === glyph.char);
                setSearch({ mode: "study", at: Math.max(at, 0) });
              }}
            />
          ) : (
            <KanaChart
              glyphs={glyphs}
              known={known}
              onlyRow={search.row}
              onOpen={(glyph) => {
                const source = search.row ? pool : glyphs;
                const at = source.findIndex((item) => item.char === glyph.char && item.row === glyph.row);
                setSearch({ mode: "study", at: Math.max(at, 0) });
              }}
            />
          )}

        </>
      ) : null}

      {search.mode === "study" && current ? (
        <StudyGlyph
          glyph={current}
          index={index}
          total={pool.length}
          known={known.includes(kanaKey(current.type, current.char))}
          onBack={() => setSearch({ mode: "chart" })}
          onPrev={() => setSearch({ at: Math.max(0, index - 1) })}
          onNext={() => setSearch({ at: Math.min(pool.length - 1, index + 1) })}
          onKnown={(value) => {
            setKnown(kanaKey(current.type, current.char), value);
            if (value && index < pool.length - 1) setSearch({ at: index + 1 });
          }}
        />
      ) : null}

      {search.mode === "quiz" ? <div className="mt-6"><QuizPanel items={quiz} onExit={() => setSearch({ mode: "chart" })} /></div> : null}
    </div>
  );
}

function labelOf(script: Script) {
  if (script === "katakana") return "Katakana";
  if (script === "kanji") return "Kanji";
  return "Hiragana";
}

function RowChip({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-10 rounded-full border px-3 text-sm",
        active ? "border-ink bg-ink text-paper" : "border-line bg-sheet text-stone hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function KanaChart({
  glyphs,
  known,
  onlyRow,
  onOpen,
}: {
  glyphs: Glyph[];
  known: string[];
  onlyRow: string;
  onOpen: (glyph: Glyph) => void;
}) {
  const rows = onlyRow ? KANA_ROWS.filter((row) => row === onlyRow) : KANA_ROWS;
  const n = kanaN(glyphs);

  return (
    <div className="mt-6">
      <div className="grid grid-cols-6 gap-1.5 text-center text-xs tracking-wide text-stone uppercase">
        <span />
        {KANA_VOWELS.map((vowel) => (
          <span key={vowel}>{vowel}</span>
        ))}
      </div>
      <div className="mt-1 grid gap-1.5">
        {rows.map((row) => (
          <div key={row} className="grid grid-cols-6 gap-1.5">
            <div className="flex items-center justify-center text-xs font-medium text-stone">{row}</div>
            {KANA_VOWELS.map((vowel) => {
              const glyph = kanaCell(glyphs, row, vowel);
              if (!glyph) return <div key={vowel} className="aspect-square rounded-md bg-mist" />;
              return (
                <GlyphButton key={vowel} glyph={glyph} known={known.includes(kanaKey(glyph.type, glyph.char))} onOpen={onOpen} />
              );
            })}
          </div>
        ))}
      </div>
      {n && (!onlyRow || onlyRow === "N") ? (
        <div className="mt-3 grid max-w-24 grid-cols-1">
          <GlyphButton glyph={n} known={known.includes(kanaKey(n.type, n.char))} onOpen={onOpen} />
        </div>
      ) : null}
    </div>
  );
}

function GlyphButton({ glyph, known, onOpen }: { glyph: Glyph; known: boolean; onOpen: (glyph: Glyph) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(glyph)}
      className={cn(
        "relative flex aspect-square items-center justify-center rounded-md border bg-sheet jp text-3xl transition-colors hover:border-ink sm:text-4xl",
        known ? "border-seal/50" : "border-line",
      )}
    >
      {glyph.char}
      {known ? <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-seal" /> : null}
    </button>
  );
}

function KanjiList({ glyphs, known, onOpen }: { glyphs: Glyph[]; known: string[]; onOpen: (glyph: Glyph) => void }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {glyphs.map((glyph) => {
        const isLearned = known.includes(kanaKey(glyph.type, glyph.char));
        return (
          <div
            key={`${glyph.row}-${glyph.char}`}
            className="group relative flex flex-col justify-between rounded-xl border border-line bg-sheet p-4 shadow-xs transition hover:border-ink hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="jp text-4xl font-semibold text-ink group-hover:text-seal transition-colors">
                    {glyph.char}
                  </span>
                  <div>
                    <span className="inline-block rounded bg-seal/10 px-2 py-0.5 text-xs font-bold tracking-wide text-seal uppercase">
                      {glyph.hanviet || glyph.row}
                    </span>
                    <p className="mt-1 text-sm font-medium text-ink line-clamp-1">
                      {glyph.meaning || glyph.example}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {glyph.strokes ? (
                    <span className="rounded bg-mist px-1.5 py-0.5 font-mono text-[11px] text-stone">
                      {glyph.strokes} nét
                    </span>
                  ) : null}
                  {isLearned ? (
                    <span className="flex size-5 items-center justify-center rounded-full bg-seal text-paper text-xs" title="Đã thuộc">
                      ✓
                    </span>
                  ) : null}
                </div>
              </div>

              {glyph.radicals ? (
                <p className="mt-2 text-xs text-stone line-clamp-1">
                  <span className="font-semibold text-ink/75">Bộ:</span> {glyph.radicals}
                </p>
              ) : null}

              {glyph.mnemonic ? (
                <div className="mt-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs text-amber-950 dark:text-amber-200">
                  <p className="line-clamp-2">
                    <span className="font-bold">💡 Mẹo nhớ:</span> {glyph.mnemonic}
                  </p>
                </div>
              ) : null}

              {glyph.compounds && glyph.compounds.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {glyph.compounds.slice(0, 2).map((c, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded bg-mist px-2 py-0.5 text-[11px]">
                      <span className="jp font-medium">{c.word}</span>
                      <span className="text-seal font-mono">({c.reading})</span>
                    </span>
                  ))}
                  {glyph.compounds.length > 2 ? (
                    <span className="self-center text-[11px] text-stone">+{glyph.compounds.length - 2} từ nữa</span>
                  ) : null}
                </div>
              ) : (
                <p className="mt-2 text-xs text-stone">
                  On: {glyph.onyomi || "-"} · Kun: {glyph.kunyomi || "-"}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => onOpen(glyph)}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-paper py-2 text-xs font-medium text-ink transition hover:border-ink hover:bg-mist cursor-pointer"
            >
              <span>Học chi tiết chữ này</span>
              <span>→</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

function StudyGlyph({
  glyph,
  index,
  total,
  known,
  onBack,
  onPrev,
  onNext,
  onKnown,
}: {
  glyph: Glyph;
  index: number;
  total: number;
  known: boolean;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  onKnown: (known: boolean) => void;
}) {
  if (glyph.type === "kanji") {
    return (
      <StudyKanjiGlyph
        glyph={glyph}
        index={index}
        total={total}
        known={known}
        onBack={onBack}
        onPrev={onPrev}
        onNext={onNext}
        onKnown={onKnown}
      />
    );
  }

  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [glyph.char, glyph.type]);

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between text-sm text-stone">
        <button type="button" className="min-h-11 cursor-pointer" onClick={onBack}>
          ← Bảng chữ cái
        </button>
        <span className="tabular-nums">
          {index + 1} / {total}
        </span>
      </div>
      <ProgressLine value={index + 1} max={total} />
      <div className="mt-5 rounded-md border border-line bg-sheet px-6 py-10 text-center">
        <p className="jp text-8xl leading-none font-medium">{glyph.char}</p>
        <button
          type="button"
          className="mx-auto mt-6 flex min-h-11 items-center gap-2 text-sm text-stone hover:text-ink cursor-pointer"
          onClick={() => speakJapanese(glyph.char)}
        >
          <Volume2 className="size-4" />
          Nghe phát âm
        </button>
        <div className="mt-6 border-t border-line pt-5">
          <button type="button" className="min-h-11 w-full cursor-pointer" onClick={() => setOpen((value) => !value)}>
            {open ? (
              <>
                <p className="display text-3xl tracking-wide">{glyph.romaji}</p>
                <p className="mt-1 text-stone">{glyph.example}</p>
              </>
            ) : (
              <p className="text-stone">Chạm để xem cách đọc</p>
            )}
          </button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button onClick={onPrev} disabled={index === 0}>
          Trước
        </Button>
        <Button onClick={onNext} disabled={index >= total - 1}>
          Sau
        </Button>
      </div>
      <Button className="mt-2 w-full" tone={known ? "line" : "seal"} onClick={() => onKnown(!known)}>
        {known ? "Bỏ đánh dấu đã nhớ" : "Đã nhớ chữ này"}
      </Button>
    </section>
  );
}

function StudyKanjiGlyph({
  glyph,
  index,
  total,
  known,
  onBack,
  onPrev,
  onNext,
  onKnown,
}: {
  glyph: Glyph;
  index: number;
  total: number;
  known: boolean;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  onKnown: (known: boolean) => void;
}) {
  const [aiData, setAiData] = useState<KanjiAiExplanation | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);

  useEffect(() => {
    setAiData(null);
    setShowAi(false);
    setAiLoading(false);
  }, [glyph.char]);

  async function handleAiExplain() {
    if (aiData) {
      setShowAi((prev) => !prev);
      return;
    }
    setShowAi(true);
    setAiLoading(true);
    try {
      const result = await explainKanjiWithAi(glyph);
      setAiData(result);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <section className="mt-6 max-w-2xl mx-auto">
      <div className="mb-3 flex items-center justify-between text-sm text-stone">
        <button type="button" className="min-h-11 font-medium hover:text-ink cursor-pointer" onClick={onBack}>
          ← Danh sách Kanji ({glyph.row})
        </button>
        <span className="tabular-nums font-mono">
          {index + 1} / {total}
        </span>
      </div>
      <ProgressLine value={index + 1} max={total} />

      {/* Main Kanji Hero Card */}
      <div className="mt-5 rounded-2xl border border-line bg-sheet p-6 text-center shadow-xs">
        <div className="flex justify-between items-start">
          <span className="rounded-md bg-mist px-2.5 py-1 text-xs font-semibold text-stone font-mono">
            {glyph.row} · {glyph.strokes || 0} nét
          </span>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1 text-xs text-stone hover:text-ink cursor-pointer transition"
            onClick={() => speakJapanese(glyph.char)}
          >
            <Volume2 className="size-3.5" />
            <span>Phát âm</span>
          </button>
        </div>

        <p className="jp text-8xl md:text-9xl my-4 font-semibold text-ink tracking-tight">
          {glyph.char}
        </p>

        <div className="mt-2 inline-flex flex-col items-center">
          <span className="rounded-full bg-seal/10 px-4 py-1 text-base font-bold text-seal tracking-wider uppercase">
            Âm Hán Việt: {glyph.hanviet || "---"}
          </span>
          <p className="mt-2 text-lg font-medium text-ink">
            {glyph.meaning || glyph.example}
          </p>
        </div>

        {glyph.radicals ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-mist/80 px-3.5 py-1.5 text-xs text-stone">
            <span className="font-semibold text-ink">🧩 Cấu tạo bộ thủ:</span>
            <span>{glyph.radicals}</span>
          </div>
        ) : null}
      </div>

      {/* Mnemonic Memory Hook */}
      {glyph.mnemonic ? (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-5">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-sm">
            <Lightbulb className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Mẹo liên tưởng hình ảnh & Ghi nhớ siêu tốc</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-amber-950 dark:text-amber-100 font-medium">
            {glyph.mnemonic}
          </p>
        </div>
      ) : null}

      {/* AI Assistant Button */}
      <div className="mt-4">
        <button
          type="button"
          onClick={handleAiExplain}
          disabled={aiLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-seal/30 bg-seal/5 py-3 text-sm font-semibold text-seal transition hover:bg-seal/10 cursor-pointer"
        >
          {aiLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>AI Giảng viên đang phân tích chữ {glyph.char}...</span>
            </>
          ) : (
            <>
              <Sparkles className="size-4 text-seal" />
              <span>{showAi && aiData ? "Ẩn phân tích AI" : `✨ AI Gia sư: Phân tích chuyên sâu chữ ${glyph.char}`}</span>
            </>
          )}
        </button>
      </div>

      {/* AI Tutor Analysis Card */}
      {showAi && (
        <div className="mt-4 rounded-2xl border-2 border-seal/30 bg-sheet p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-seal text-paper font-bold text-xs">
                AI
              </span>
              <div>
                <h4 className="text-sm font-bold text-ink">AI Gia sư Kanji FPT</h4>
                <p className="text-[11px] text-stone">Phân tích tượng hình, bộ thủ và mẹo thi độc quyền</p>
              </div>
            </div>
            {aiData?.isAiGenerated ? (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                Live AI
              </span>
            ) : (
              <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-medium text-stone">
                FPT Sensei Knowledge
              </span>
            )}
          </div>

          {aiLoading ? (
            <div className="py-8 text-center">
              <Loader2 className="mx-auto size-8 animate-spin text-seal" />
              <p className="mt-3 text-sm text-stone font-medium">Đang kết nối kho dữ liệu Hán tự FPT...</p>
            </div>
          ) : aiData ? (
            <div className="space-y-3.5 text-left text-sm">
              <div className="rounded-xl bg-mist/60 p-3.5">
                <span className="text-xs font-bold text-ink uppercase tracking-wide block mb-1">
                  🏛️ Nguồn gốc tượng hình & Ý nghĩa sâu xa
                </span>
                <p className="text-stone leading-relaxed">{aiData.story}</p>
              </div>

              <div className="rounded-xl bg-mist/60 p-3.5">
                <span className="text-xs font-bold text-ink uppercase tracking-wide block mb-1">
                  🧩 Phân tích bộ thủ & Cấu tạo nét
                </span>
                <p className="text-stone leading-relaxed">{aiData.radicalBreakdown}</p>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-amber-950 dark:text-amber-100">
                <span className="text-xs font-bold uppercase tracking-wide block mb-1 text-amber-800 dark:text-amber-300">
                  💡 Bí quyết ghi nhớ siêu tốc
                </span>
                <p className="leading-relaxed font-medium">{aiData.mnemonicSecret}</p>
              </div>

              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-rose-950 dark:text-rose-100">
                <span className="text-xs font-bold uppercase tracking-wide block mb-1 text-rose-800 dark:text-rose-300">
                  ⚠️ Phân biệt chữ dễ nhầm lẫn trong bài thi
                </span>
                <p className="leading-relaxed">{aiData.confusingPairs}</p>
              </div>

              <div className="rounded-xl bg-seal/10 p-3.5 text-ink">
                <span className="text-xs font-bold uppercase tracking-wide block mb-1 text-seal">
                  🎯 Lời khuyên thực chiến cho đề thi FPT
                </span>
                <p className="leading-relaxed">{aiData.usageAdvice}</p>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Onyomi & Kunyomi */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-line bg-sheet p-4">
          <span className="text-xs font-bold text-stone uppercase tracking-wide">
            Âm On (Onyomi - Ghép từ)
          </span>
          <p className="mt-1.5 text-base font-semibold jp text-ink">
            {glyph.onyomi || "—"}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-sheet p-4">
          <span className="text-xs font-bold text-stone uppercase tracking-wide">
            Âm Kun (Kunyomi - Đứng một mình)
          </span>
          <p className="mt-1.5 text-base font-semibold jp text-ink">
            {glyph.kunyomi || "—"}
          </p>
        </div>
      </div>

      {/* Compounds List */}
      {glyph.compounds && glyph.compounds.length > 0 ? (
        <div className="mt-4 rounded-xl border border-line bg-sheet p-5">
          <div className="flex items-center gap-2 text-ink font-semibold text-sm mb-3">
            <BookOpen className="size-4 text-seal" />
            <span>Từ vựng thực tế trong giáo trình FPT:</span>
          </div>
          <div className="divide-y divide-line/60">
            {glyph.compounds.map((compound, idx) => (
              <div key={idx} className="flex items-center justify-between py-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <div className="flex items-baseline gap-2">
                    <span className="jp text-lg font-bold text-ink">{compound.word}</span>
                    <span className="text-xs text-seal font-mono font-medium">[{compound.reading}]</span>
                  </div>
                  <span className="text-xs text-stone sm:border-l sm:border-line sm:pl-3">
                    {compound.meaning}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => speakJapanese(compound.word)}
                  className="rounded-full p-1.5 text-stone hover:bg-mist hover:text-ink cursor-pointer transition"
                  title={`Nghe phát âm ${compound.word}`}
                >
                  <Volume2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Navigation & Known Toggle */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button onClick={onPrev} disabled={index === 0}>
          ← Chữ trước
        </Button>
        <Button onClick={onNext} disabled={index >= total - 1}>
          Chữ sau →
        </Button>
      </div>

      <Button
        className="mt-3 w-full"
        tone={known ? "line" : "seal"}
        onClick={() => onKnown(!known)}
      >
        {known ? "✓ Bỏ đánh dấu đã thuộc" : "Đánh dấu: Đã thuộc chữ này"}
      </Button>
    </section>
  );
}

function buildKanaQuiz(pool: Glyph[]): QuizItem[] {
  const source = shuffle(pool).slice(0, 8);
  return source.map((glyph) => {
    const answer = glyph.type === "kanji" ? glyph.example || glyph.kunyomi || glyph.onyomi || glyph.char : glyph.romaji || glyph.char;
    const distractors = shuffle(
      pool
        .filter((item) => item.char !== glyph.char)
        .map((item) =>
          item.type === "kanji" ? item.example || item.kunyomi || item.char : item.romaji || item.char,
        )
        .filter((value) => value !== answer),
    ).slice(0, 3);
    return {
      id: `${glyph.type}-${glyph.char}`,
      prompt: glyph.char,
      promptIsJapanese: true,
      speak: glyph.char,
      answer,
      options: shuffle([answer, ...distractors]),
    };
  });
}
