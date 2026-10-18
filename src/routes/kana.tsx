import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Volume2 } from "lucide-react";
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

  const glyphs = glyphsOf(search.script);
  const rows = search.script === "kanji" ? [...new Set(glyphs.map((item) => item.row))] : [...KANA_ROWS];
  const pool = search.row ? glyphs.filter((item) => item.row === search.row) : glyphs;
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
          <div className="mt-5 flex flex-wrap gap-2">
            <RowChip active={search.row === ""} onClick={() => setSearch({ row: "", at: 0 })}>
              Tất cả
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
    <ul className="mt-6 divide-y divide-line border-y border-line">
      {glyphs.map((glyph) => (
        <li key={`${glyph.row}-${glyph.char}`}>
          <button type="button" onClick={() => onOpen(glyph)} className="flex w-full items-center gap-4 py-3 text-left">
            <span className="jp w-12 text-center text-3xl">{glyph.char}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm text-stone">
                {glyph.onyomi} · {glyph.kunyomi}
              </span>
              <span className="block text-sm">{glyph.example}</span>
            </span>
            {known.includes(kanaKey(glyph.type, glyph.char)) ? <span className="size-1.5 rounded-full bg-seal" /> : null}
          </button>
        </li>
      ))}
    </ul>
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
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [glyph.char, glyph.type]);

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between text-sm text-stone">
        <button type="button" className="min-h-11" onClick={onBack}>
          Bảng chữ
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
          className="mx-auto mt-6 flex min-h-11 items-center gap-2 text-sm text-stone hover:text-ink"
          onClick={() => speakJapanese(glyph.char)}
        >
          <Volume2 className="size-4" />
          Nghe
        </button>
        <div className="mt-6 border-t border-line pt-5">
          <button type="button" className="min-h-11 w-full" onClick={() => setOpen((value) => !value)}>
            {open ? (
              glyph.type === "kanji" ? (
                <>
                  <p className="text-lg">
                    Âm On {glyph.onyomi} · Âm Kun {glyph.kunyomi}
                  </p>
                  <p className="mt-1 text-stone">{glyph.example}</p>
                </>
              ) : (
                <>
                  <p className="display text-3xl tracking-wide">{glyph.romaji}</p>
                  <p className="mt-1 text-stone">{glyph.example}</p>
                </>
              )
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
        {known ? "Bỏ đánh dấu đã nhớ" : "Đã nhớ"}
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
