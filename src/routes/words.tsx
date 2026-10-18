import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, CheckSquare, Filter, Play, Square, Star, Trash2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressLine } from "@/components/progress-line";
import { WordQuiz } from "@/components/word-quiz";
import { courses, lessonTitle, vocabulary, wordsIn } from "@/lib/study/content";
import { kanaReading, romajiOf, speakable } from "@/lib/study/romaji";
import { useStudy } from "@/lib/study/store";
import { speakJapanese } from "@/lib/study/speech";
import { cn } from "@/lib/cn";
import type { Word, WordsSearch } from "@/lib/study/types";

const STARRED_LESSON = "starred";

export const Route = createFileRoute("/words")({
  validateSearch: (search: Record<string, unknown>): WordsSearch => ({
    lesson: typeof search.lesson === "string" ? search.lesson : "",
    mode: search.mode === "study" || search.mode === "sheet" ? search.mode : "list",
    at: Number(search.at) > 0 ? Math.floor(Number(search.at)) : 0,
  }),
  component: WordsPage,
});

function WordsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/words" });
  const knownWords = useStudy((state) => state.knownWords);
  const starred = useStudy((state) => state.starred);
  const setWordKnown = useStudy((state) => state.setWordKnown);
  const toggleStar = useStudy((state) => state.toggleStar);
  const unstarMany = useStudy((state) => state.unstarMany);
  const setLast = useStudy((state) => state.setLast);

  const [showMeaning, setShowMeaning] = useState(true);
  const [showRomaji, setShowRomaji] = useState(false);
  const [cardMeaning, setCardMeaning] = useState(false);

  // Dedicated selection & filter state for starred words
  const [selectedIds, setSelectedIds] = useState<number[]>(() => starred);
  const [lessonFilter, setLessonFilter] = useState<string>("all");
  const [onlyStarredInLesson, setOnlyStarredInLesson] = useState(false);

  // Keep selectedIds in sync whenever starred items change
  useEffect(() => {
    setSelectedIds((prev) => {
      const valid = prev.filter((id) => starred.includes(id));
      if (valid.length === 0 && starred.length > 0) {
        return starred;
      }
      return valid;
    });
  }, [starred]);

  const groups = courses();
  const isStarredView = search.lesson === STARRED_LESSON;
  const starredWords = useMemo(() => vocabulary.filter((word) => starred.includes(word.id)), [starred]);

  // Lessons that contain at least one starred word
  const starredLessons = useMemo(() => {
    const set = new Set(starredWords.map((w) => w.lesson));
    return Array.from(set).sort();
  }, [starredWords]);

  // Filter starred words by lesson dropdown if active
  const displayedStarredWords = useMemo(() => {
    if (lessonFilter === "all") return starredWords;
    return starredWords.filter((w) => w.lesson === lessonFilter);
  }, [starredWords, lessonFilter]);

  // Words selected by user for custom practice/quiz
  const activeSelectedStarredWords = useMemo(() => {
    return starredWords.filter((w) => selectedIds.includes(w.id));
  }, [starredWords, selectedIds]);

  // Words for the current view
  const baseLessonWords = !search.lesson ? [] : isStarredView ? displayedStarredWords : wordsIn(search.lesson);
  const words = !search.lesson
    ? []
    : isStarredView
      ? displayedStarredWords
      : onlyStarredInLesson
        ? baseLessonWords.filter((w) => starred.includes(w.id))
        : baseLessonWords;

  // Words specifically fed into study / quiz
  const practiceWords = isStarredView
    ? activeSelectedStarredWords.length > 0
      ? activeSelectedStarredWords
      : starredWords
    : words;

  const title = isStarredView ? "Từ vựng đã đánh dấu" : search.lesson ? lessonTitle(search.lesson) : "Từ vựng";
  const index = Math.min(search.at, Math.max(practiceWords.length - 1, 0));
  const current = practiceWords[index];

  useEffect(() => {
    setCardMeaning(false);
  }, [current?.id]);

  useEffect(() => {
    setLast({
      to: "/words",
      label: title,
      search,
    });
  }, [search.lesson, search.mode, search.at, setLast, title]);

  function setSearch(patch: Partial<WordsSearch>) {
    void navigate({ search: (prev) => ({ ...prev, ...patch }) });
  }

  function toggleSelectWord(id: number) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function toggleSelectAll(targetWords: Word[]) {
    const allSelected = targetWords.every((w) => selectedIds.includes(w.id));
    if (allSelected) {
      const toRemove = new Set(targetWords.map((w) => w.id));
      setSelectedIds((prev) => prev.filter((id) => !toRemove.has(id)));
    } else {
      const toAdd = targetWords.map((w) => w.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...toAdd])));
    }
  }

  function handleUnstarSelected() {
    if (activeSelectedStarredWords.length === 0) return;
    unstarMany(activeSelectedStarredWords.map((w) => w.id));
  }

  // --- VIEW 1: Main Vocabulary Lesson Catalog ---
  if (!search.lesson) {
    return (
      <div>
        <p className="text-sm tracking-[0.18em] text-stone uppercase">Từ vựng</p>
        <h1 className="display mt-2 text-4xl">Chọn một bài.</h1>
        <p className="mt-2 text-stone">
          Mỗi bài có thẻ luyện, danh sách để tra, và các dạng kiểm tra. Đánh dấu từ để tạo bộ đề kiểm tra riêng.
        </p>

        <div className="mt-8 space-y-8">
          {/* Enhanced Starred Words Hub */}
          <section className="rounded-xl border border-line bg-sheet p-5 shadow-xs">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="flex items-center gap-2 text-base font-semibold text-ink">
                  <Star className={cn("size-5", starredWords.length ? "fill-amber-500 text-amber-500" : "text-stone")} />
                  Từ vựng đã đánh dấu
                </span>
                <p className="mt-1 text-sm text-stone">
                  {starredWords.length > 0
                    ? `Bạn có ${starredWords.length} từ vựng đã lưu để ôn luyện và làm kiểm tra riêng.`
                    : "Chưa có từ nào. Trong danh sách bài học, hãy chạm vào biểu tượng ngôi sao ⭐ để lưu các từ cần ôn luyện riêng."}
                </p>
              </div>
              <span className="self-start rounded-full border border-line bg-paper px-3 py-1 text-sm font-medium tabular-nums text-ink sm:self-center">
                {starredWords.length} từ
              </span>
            </div>

            {starredWords.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-line/60">
                <Button
                  tone="seal"
                  onClick={() => setSearch({ lesson: STARRED_LESSON, mode: "list", at: 0 })}
                  className="flex items-center gap-1.5"
                >
                  <Play className="size-4" />
                  Kiểm tra riêng ngay
                </Button>
                <Button
                  tone="line"
                  onClick={() => setSearch({ lesson: STARRED_LESSON, mode: "sheet", at: 0 })}
                  className="flex items-center gap-1.5"
                >
                  <CheckSquare className="size-4 text-stone" />
                  Chọn từ để kiểm tra
                </Button>
                <Button
                  tone="ghost"
                  onClick={() => setSearch({ lesson: STARRED_LESSON, mode: "study", at: 0 })}
                >
                  Luyện thẻ ghi nhớ
                </Button>
              </div>
            ) : null}
          </section>

          {groups.map((group) => (
            <section key={group.course}>
              <h2 className="text-sm tracking-wide text-stone uppercase">{group.course}</h2>
              <ul className="mt-2 divide-y divide-line border-y border-line">
                {group.lessons.map((lesson) => {
                  const count = wordsIn(lesson).length;
                  const remembered = wordsIn(lesson).filter((word) => knownWords.includes(word.id)).length;
                  const lessonStarredCount = wordsIn(lesson).filter((word) => starred.includes(word.id)).length;
                  return (
                    <li key={lesson}>
                      <button
                        type="button"
                        className="flex min-h-14 w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:text-ink"
                        onClick={() => setSearch({ lesson, mode: "study", at: 0 })}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{lessonTitle(lesson)}</span>
                          {lessonStarredCount > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                              <Star className="size-3 fill-amber-500 text-amber-500" />
                              {lessonStarredCount}
                            </span>
                          ) : null}
                        </div>
                        <span className="text-sm text-stone tabular-nums">
                          {remembered}/{count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    );
  }

  // --- VIEW 2: Inside a Lesson or Starred Words Hub ---
  const starredInCurrentLesson = isStarredView ? [] : baseLessonWords.filter((w) => starred.includes(w.id));

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="text-sm text-stone hover:text-ink"
          onClick={() => {
            setOnlyStarredInLesson(false);
            setSearch({ lesson: "", mode: "list", at: 0 });
          }}
        >
          ← Tất cả bài
        </button>
        {isStarredView && starredWords.length > 0 ? (
          <span className="text-xs text-stone tracking-wide uppercase">
            Đã chọn {activeSelectedStarredWords.length}/{starredWords.length} từ
          </span>
        ) : null}
      </div>

      <h1 className="display mt-2 text-4xl">{title}</h1>

      {words.length === 0 ? (
        <div className="mt-6 rounded-lg border border-line bg-sheet p-6 text-center">
          <p className="text-stone">
            {isStarredView
              ? "Bạn chưa đánh dấu từ nào. Hãy mở một bài học bất kỳ, rồi bấm biểu tượng ngôi sao ⭐ trên từ vựng để lưu vào danh sách luyện riêng."
              : onlyStarredInLesson
                ? "Bài này chưa có từ nào được đánh dấu."
                : "Bài này chưa có từ."}
          </p>
          {onlyStarredInLesson ? (
            <Button className="mt-4" tone="line" onClick={() => setOnlyStarredInLesson(false)}>
              Xem tất cả từ trong bài
            </Button>
          ) : isStarredView ? (
            <Button
              className="mt-4"
              tone="seal"
              onClick={() => setSearch({ lesson: "", mode: "list", at: 0 })}
            >
              Xem danh sách bài học
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          {/* Navigation modes */}
          <div className="mt-5 flex items-center justify-between gap-2 border-b border-line pb-3">
            <div className="flex gap-2">
              {(
                [
                  ["sheet", isStarredView ? "Chọn từ & Danh sách" : "Danh sách"],
                  ["study", "Luyện thẻ"],
                  ["list", isStarredView ? "Kiểm tra riêng" : "Kiểm tra"],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  className={cn(
                    "min-h-11 rounded-md px-3 text-sm font-medium transition-colors",
                    search.mode === mode ? "bg-ink text-paper" : "text-stone hover:text-ink",
                  )}
                  onClick={() => setSearch({ mode, at: 0 })}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* In regular lesson: quick toggle for starred words */}
            {!isStarredView && (
              <Toggle
                on={onlyStarredInLesson}
                onClick={() => {
                  setOnlyStarredInLesson((prev) => !prev);
                  setSearch({ at: 0 });
                }}
              >
                {`⭐ Chỉ từ đã lưu (${starredInCurrentLesson.length})`}
              </Toggle>
            )}
          </div>

          {/* MODE: STUDY (FLASHCARDS) */}
          {search.mode === "study" && current ? (
            <section className="mt-6">
              {isStarredView && (
                <div className="mb-4 flex items-center justify-between rounded-md bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-900 border border-amber-500/20">
                  <span>Đang luyện {practiceWords.length} từ đã chọn</span>
                  <button
                    type="button"
                    className="underline text-amber-900 hover:text-ink"
                    onClick={() => setSearch({ mode: "sheet", at: 0 })}
                  >
                    Thay đổi lựa chọn
                  </button>
                </div>
              )}
              <div className="mb-3 flex justify-between text-sm text-stone">
                <span className="tabular-nums">
                  {index + 1} / {practiceWords.length}
                </span>
                <button
                  type="button"
                  className="flex size-11 items-center justify-center transition-transform active:scale-125"
                  aria-label={starred.includes(current.id) ? "Bỏ đánh dấu" : "Đánh dấu"}
                  aria-pressed={starred.includes(current.id)}
                  onClick={() => toggleStar(current.id)}
                  title={starred.includes(current.id) ? "Bỏ đánh dấu" : "Đánh dấu từ này để luyện riêng"}
                >
                  <Star
                    className={cn(
                      "size-5",
                      starred.includes(current.id) ? "fill-amber-500 text-amber-500" : "text-stone hover:text-ink",
                    )}
                  />
                </button>
              </div>
              <ProgressLine value={index + 1} max={practiceWords.length} />
              <button
                type="button"
                className="mt-5 w-full rounded-md border border-line bg-sheet px-6 py-10 text-center transition-shadow hover:shadow-xs"
                onClick={() => setCardMeaning((value) => !value)}
              >
                <span className="jp block text-6xl font-medium">{current.word}</span>
                <span className="mt-3 block text-stone">{current.reading}</span>
                <span className="mt-6 block min-h-8 text-xl font-medium">{cardMeaning ? current.meaning : "Chạm để xem nghĩa"}</span>
                {cardMeaning && current.example ? <span className="mt-3 block text-sm text-stone">{current.example}</span> : null}
              </button>
              <button
                type="button"
                className="mx-auto mt-3 flex min-h-11 items-center gap-2 text-sm text-stone hover:text-ink"
                onClick={() => speakJapanese(speakable(current))}
              >
                <Volume2 className="size-4" />
                Nghe phát âm
              </button>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button disabled={index === 0} onClick={() => setSearch({ at: index - 1 })}>
                  Trước
                </Button>
                <Button disabled={index >= practiceWords.length - 1} onClick={() => setSearch({ at: index + 1 })}>
                  Sau
                </Button>
              </div>
              <Button
                className="mt-2 w-full"
                tone={knownWords.includes(current.id) ? "line" : "seal"}
                onClick={() => {
                  const nextKnown = !knownWords.includes(current.id);
                  setWordKnown(current.id, nextKnown);
                  if (nextKnown && index < practiceWords.length - 1) setSearch({ at: index + 1 });
                }}
              >
                {knownWords.includes(current.id) ? "Bỏ đánh dấu đã nhớ" : "Đã nhớ"}
              </Button>
            </section>
          ) : null}

          {/* MODE: SHEET (LIST & SELECTION FOR CUSTOM EXAM) */}
          {search.mode === "sheet" ? (
            <section className="mt-6">
              {/* Starred words custom exam selection bar */}
              {isStarredView && (
                <div className="mb-6 rounded-xl border border-line bg-sheet p-4 shadow-xs">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleSelectAll(displayedStarredWords)}
                        className="flex items-center gap-2 text-sm font-medium text-ink hover:text-seal"
                      >
                        {displayedStarredWords.length > 0 &&
                        displayedStarredWords.every((w) => selectedIds.includes(w.id)) ? (
                          <CheckSquare className="size-5 text-seal" />
                        ) : (
                          <Square className="size-5 text-stone" />
                        )}
                        <span>Chọn tất cả ({displayedStarredWords.length})</span>
                      </button>

                      {starredLessons.length > 1 && (
                        <div className="flex items-center gap-1.5 text-xs text-stone">
                          <Filter className="size-3.5" />
                          <select
                            value={lessonFilter}
                            onChange={(e) => setLessonFilter(e.target.value)}
                            className="rounded border border-line bg-paper px-2 py-1 text-xs text-ink"
                          >
                            <option value="all">Tất cả bài ({starredWords.length})</option>
                            {starredLessons.map((l) => (
                              <option key={l} value={l}>
                                {lessonTitle(l)} ({starredWords.filter((w) => w.lesson === l).length})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <span className="text-sm font-medium text-stone tabular-nums">
                      Đã chọn: <strong className="text-ink">{activeSelectedStarredWords.length}</strong> / {starredWords.length} từ
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-line/60">
                    <Button
                      tone="seal"
                      disabled={activeSelectedStarredWords.length === 0}
                      onClick={() => setSearch({ mode: "list", at: 0 })}
                      className="flex items-center gap-1.5"
                    >
                      <Play className="size-4" />
                      Làm kiểm tra ({activeSelectedStarredWords.length} từ)
                    </Button>
                    <Button
                      tone="line"
                      disabled={activeSelectedStarredWords.length === 0}
                      onClick={() => setSearch({ mode: "study", at: 0 })}
                    >
                      Luyện thẻ ({activeSelectedStarredWords.length} từ)
                    </Button>
                    <Button
                      tone="ghost"
                      disabled={activeSelectedStarredWords.length === 0}
                      onClick={handleUnstarSelected}
                      className="flex items-center gap-1.5 text-stone hover:text-seal"
                      title="Bỏ đánh dấu các từ đã chọn"
                    >
                      <Trash2 className="size-4" />
                      Bỏ đánh dấu
                    </Button>
                  </div>
                </div>
              )}

              {/* View options: Nghĩa, Romaji */}
              <div className="flex gap-2" role="group" aria-label="Hiện trên danh sách">
                <Toggle on={showMeaning} onClick={() => setShowMeaning((value) => !value)}>
                  Nghĩa
                </Toggle>
                <Toggle on={showRomaji} onClick={() => setShowRomaji((value) => !value)}>
                  Romaji
                </Toggle>
              </div>

              {/* Word Rows */}
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {words.map((word, wordIndex) => {
                  const kana = kanaReading(word);
                  const romaji = romajiOf(word);
                  const surface = word.word.replace(/\s+/g, "");
                  const showKana = kana && kana.replace(/\s+/g, "") !== surface;
                  const isChecked = selectedIds.includes(word.id);
                  const isMarked = starred.includes(word.id);

                  return (
                    <li
                      key={word.id}
                      className={cn(
                        "flex items-start gap-2 py-2.5 px-1 rounded-md transition-colors",
                        isStarredView && isChecked ? "bg-amber-500/5" : "hover:bg-sheet/50",
                      )}
                    >
                      {/* Checkbox when in Starred View to pick words for exam */}
                      {isStarredView && (
                        <button
                          type="button"
                          className="flex size-10 shrink-0 items-center justify-center text-stone hover:text-ink mt-0.5"
                          aria-label={isChecked ? `Bỏ chọn từ ${word.word}` : `Chọn từ ${word.word}`}
                          aria-checked={isChecked}
                          role="checkbox"
                          onClick={() => toggleSelectWord(word.id)}
                        >
                          {isChecked ? (
                            <CheckSquare className="size-5 text-seal" />
                          ) : (
                            <Square className="size-5 text-stone/70" />
                          )}
                        </button>
                      )}

                      {/* Listen button */}
                      <button
                        type="button"
                        className="flex size-10 shrink-0 items-center justify-center text-stone hover:text-ink mt-0.5"
                        aria-label={`Nghe ${word.word}`}
                        onClick={() => speakJapanese(speakable(word))}
                      >
                        <Volume2 className="size-5" />
                      </button>

                      {/* Word info */}
                      <button
                        type="button"
                        className="flex min-h-11 min-w-0 flex-1 items-center gap-4 py-1 text-left"
                        onClick={() => setSearch({ mode: "study", at: wordIndex })}
                      >
                        <span className="min-w-0">
                          <span className="jp block text-2xl leading-tight break-words font-medium">{word.word}</span>
                          {showKana ? <span className="mt-0.5 block text-sm text-stone">{kana}</span> : null}
                          {showRomaji && romaji ? (
                            <span className="mt-0.5 block text-sm tracking-wide text-stone">{romaji}</span>
                          ) : null}
                          {isStarredView && (
                            <span className="mt-1 inline-block text-xs text-stone/80 font-normal">
                              {lessonTitle(word.lesson)}
                            </span>
                          )}
                        </span>
                        {showMeaning ? (
                          <span className="ml-auto max-w-1/2 text-right text-sm leading-snug break-words text-ink">
                            {word.meaning}
                          </span>
                        ) : null}
                      </button>

                      {/* Star bookmark button */}
                      <button
                        type="button"
                        className="flex size-10 shrink-0 items-center justify-center transition-transform active:scale-125 mt-0.5"
                        aria-label={isMarked ? "Bỏ đánh dấu" : "Đánh dấu"}
                        aria-pressed={isMarked}
                        onClick={() => toggleStar(word.id)}
                        title={isMarked ? "Bỏ đánh dấu" : "Đánh dấu từ này để luyện riêng"}
                      >
                        <Star
                          className={cn(
                            "size-5",
                            isMarked ? "fill-amber-500 text-amber-500" : "text-stone hover:text-ink",
                          )}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {/* MODE: LIST (QUIZ / EXAM) */}
          {search.mode === "list" ? (
            <div className="mt-6">
              {isStarredView && (
                <div className="mb-4 flex items-center justify-between rounded-lg bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-950 border border-amber-500/20">
                  <span>
                    Đang làm bài kiểm tra cho <strong>{practiceWords.length}</strong> từ vựng đã chọn.
                  </span>
                  <Button
                    tone="line"
                    onClick={() => setSearch({ mode: "sheet", at: 0 })}
                    className="text-xs h-8 px-2.5"
                  >
                    Chọn lại từ
                  </Button>
                </div>
              )}
              <WordQuiz
                words={practiceWords}
                pool={isStarredView ? "starred" : "lesson"}
                onExit={() => setSearch({ mode: "sheet", at: 0 })}
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-md px-3 text-sm font-medium transition-colors",
        on ? "bg-ink text-paper" : "text-stone hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
