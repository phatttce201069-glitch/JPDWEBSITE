import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Languages,
  RotateCcw,
  Sparkles,
  Star,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressLine } from "@/components/progress-line";
import { shuffle, vocabulary } from "@/lib/study/content";
import { kanaReading, speakable } from "@/lib/study/romaji";
import { useStudy } from "@/lib/study/store";
import { speakJapanese } from "@/lib/study/speech";
import {
  buildMatchRounds,
  buildWordQuizQuestions,
  shownReading,
  WORD_QUIZ_FORMS,
  type WordQuizFormId,
  type WordQuizQuestion,
} from "@/lib/study/word-drill";
import type { Word } from "@/lib/study/types";
import { cn } from "@/lib/cn";

export function WordQuiz({
  words,
  onExit,
  pool = "lesson",
}: {
  words: Word[];
  onExit: () => void;
  pool?: "lesson" | "starred";
}) {
  const [form, setForm] = useState<WordQuizFormId | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(() => Math.min(10, Math.max(words.length, 5)));
  const [sessionUsedIds, setSessionUsedIds] = useState<number[]>([]);
  const starred = pool === "starred";

  // Cập nhật questionCount nếu số lượng từ thay đổi
  useEffect(() => {
    if (words.length > 0) {
      setQuestionCount((prev) => Math.min(prev, words.length) || Math.min(10, words.length));
    }
  }, [words.length]);

  if (!form) {
    const unpracticedCount = words.filter((w) => !sessionUsedIds.includes(w.id)).length;

    return (
      <section>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Chọn dạng đề luyện từ vựng</h2>
            <p className="text-sm text-stone mt-0.5">
              {starred
                ? `Đang chọn ${words.length} từ đã đánh dấu để luyện đề.`
                : `Bài học có ${words.length} từ vựng. Đề thi sẽ tự động xáo trộn và tạo mới liên tục.`}
            </p>
          </div>
          {sessionUsedIds.length > 0 ? (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700">
                Đã luyện {words.length - unpracticedCount}/{words.length} từ
              </span>
              <button
                type="button"
                onClick={() => setSessionUsedIds([])}
                className="text-xs text-stone hover:text-ink underline cursor-pointer"
                title="Làm mới lại tiến trình xoay vòng từ vựng"
              >
                Đặt lại vòng
              </button>
            </div>
          ) : null}
        </div>

        {/* Tùy chọn số lượng câu hỏi mỗi lượt */}
        {words.length > 5 ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-sheet p-3">
            <span className="text-xs font-semibold text-stone uppercase tracking-wider shrink-0">
              Số câu mỗi đề:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                Math.min(8, words.length),
                Math.min(15, words.length),
                words.length,
              ]
                .filter((cnt, idx, arr) => arr.indexOf(cnt) === idx && cnt > 0)
                .map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                      questionCount === cnt
                        ? "bg-ink text-paper"
                        : "border border-line bg-paper text-stone hover:text-ink hover:border-stone",
                    )}
                  >
                    {cnt === words.length ? `Tất cả (${cnt} câu)` : `${cnt} câu`}
                  </button>
                ))}
            </div>
          </div>
        ) : null}

        <ul className="mt-4 divide-y divide-line border-y border-line">
          {WORD_QUIZ_FORMS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="flex min-h-16 w-full flex-col items-start justify-center py-3 text-left hover:bg-sheet/50 px-2 rounded-md transition-colors cursor-pointer"
                onClick={() => setForm(item.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-ink">{item.title}</span>
                  <span className="text-xs text-seal font-medium flex items-center gap-1">
                    Bắt đầu <ArrowRight className="size-3" />
                  </span>
                </div>
                <span className="text-xs text-stone mt-0.5">{item.note}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center justify-between">
          <Button tone="ghost" onClick={onExit}>
            ← Quay lại danh sách
          </Button>
          <span className="text-xs text-stone">Mỗi lượt làm là một đề hoàn toàn mới</span>
        </div>
      </section>
    );
  }

  if (words.length < 2) {
    return (
      <section className="rounded-md border border-line bg-sheet p-6">
        <p className="text-stone">
          {starred
            ? "Cần ít nhất hai từ để tạo các dạng bài kiểm tra. Hãy quay lại danh sách để chọn thêm từ."
            : "Bài này chưa đủ từ để kiểm tra."}
        </p>
        <div className="mt-4 flex gap-2">
          <Button tone="line" onClick={onExit}>
            {starred ? "Chọn thêm từ" : "Quay lại"}
          </Button>
          <Button tone="ghost" onClick={() => setForm(null)}>
            Chọn cách khác
          </Button>
        </div>
      </section>
    );
  }

  if (form === "match") {
    return (
      <MatchQuiz
        words={words}
        usedIds={sessionUsedIds}
        onUpdateUsedIds={(ids) => setSessionUsedIds(ids)}
        onBack={() => setForm(null)}
      />
    );
  }

  return (
    <DrillQuiz
      key={`${form}-${questionCount}`}
      form={form}
      words={words}
      count={questionCount}
      usedIds={sessionUsedIds}
      onUpdateUsedIds={(ids) => setSessionUsedIds(ids)}
      onBack={() => setForm(null)}
    />
  );
}

function DrillQuiz({
  form,
  words,
  count,
  usedIds,
  onUpdateUsedIds,
  onBack,
}: {
  form: Exclude<WordQuizFormId, "match">;
  words: Word[];
  count: number;
  usedIds: number[];
  onUpdateUsedIds: (ids: number[]) => void;
  onBack: () => void;
}) {
  const [drillData, setDrillData] = useState(() => {
    return buildWordQuizQuestions(words, form, { count, usedIds, broadPool: vocabulary });
  });

  const [questions, setQuestions] = useState<WordQuizQuestion[]>(drillData.questions);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [correct, setCorrect] = useState(0);
  const [missedQuestions, setMissedQuestions] = useState<WordQuizQuestion[]>([]);
  const [showKana, setShowKana] = useState(true);

  const starred = useStudy((state) => state.starred);
  const toggleStar = useStudy((state) => state.toggleStar);

  const current = questions[index];
  const done = index >= questions.length;
  const answered = !!current && (current.kind === "choice" ? picked !== null : verdict !== null);
  const nextRef = useRef<HTMLDivElement>(null);

  // Cập nhật usedIds lên component cha khi hoàn thành vòng
  useEffect(() => {
    if (drillData.updatedUsedIds) {
      onUpdateUsedIds(drillData.updatedUsedIds);
    }
  }, [drillData.updatedUsedIds, onUpdateUsedIds]);

  // Tự động phát âm thanh nếu là dạng bài nghe
  useEffect(() => {
    if (current?.kind === "choice" && current.autoSpeak && current.speak) {
      speakJapanese(current.speak);
    }
  }, [current]);

  useEffect(() => {
    if (!answered) return;
    nextRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [answered, index]);

  // Tạo một bộ đề hoàn toàn mới (Đề ngẫu nhiên mới, lấy các từ tiếp theo)
  function handleGenerateNewQuestions() {
    const nextData = buildWordQuizQuestions(words, form, {
      count,
      usedIds: drillData.updatedUsedIds,
      broadPool: vocabulary,
    });
    setDrillData(nextData);
    setQuestions(nextData.questions);
    setIndex(0);
    setPicked(null);
    setTyped("");
    setVerdict(null);
    setCorrect(0);
    setMissedQuestions([]);
  }

  // Làm lại chính các câu hỏi của đề này
  function handleRetrySameQuestions() {
    setIndex(0);
    setPicked(null);
    setTyped("");
    setVerdict(null);
    setCorrect(0);
    setMissedQuestions([]);
  }

  // Luyện riêng các câu làm sai
  function handleDrillMissedOnly() {
    if (missedQuestions.length === 0) return;
    setQuestions([...missedQuestions]);
    setIndex(0);
    setPicked(null);
    setTyped("");
    setVerdict(null);
    setCorrect(0);
    setMissedQuestions([]);
  }

  // Xử lý chấm điểm câu tự luận
  function grade(value: string) {
    if (current?.kind !== "type" || verdict !== null) return;
    const ok = current.accept ? current.accept(value) : false;
    setVerdict(ok);
    if (ok) {
      setCorrect((count) => count + 1);
    } else {
      setMissedQuestions((prev) => [...prev, current]);
    }
  }

  // Xử lý chọn đáp án trắc nghiệm
  function handlePick(optionText: string) {
    if (picked !== null || current?.kind !== "choice") return;
    setPicked(optionText);
    const ok = optionText === current.answer;
    if (ok) {
      setCorrect((count) => count + 1);
    } else {
      setMissedQuestions((prev) => [...prev, current]);
    }
  }

  // MÀN HÌNH TỔNG KẾT KẾT QUẢ
  if (questions.length === 0 || done || !current) {
    const percent = Math.round((correct / (questions.length || 1)) * 100);

    return (
      <section className="rounded-xl border border-line bg-sheet px-6 py-8 text-center shadow-xs">
        <p className="text-xs font-semibold tracking-wider text-stone uppercase">Kết quả kiểm tra</p>
        <p className="display mt-2 text-5xl text-ink tabular-nums">
          {correct}
          <span className="text-2xl text-stone font-normal">/{questions.length}</span>
        </p>
        <p className="mt-2 text-sm text-stone">
          Đạt <strong className="text-ink">{percent}%</strong> ·{" "}
          {percent >= 80 ? "Xuất sắc! Bạn đã nắm rất vững." : "Hãy tiếp tục luyện tập để ghi nhớ lâu hơn!"}
        </p>

        {/* Nút hành động */}
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <Button
            tone="seal"
            onClick={handleGenerateNewQuestions}
            className="flex items-center gap-1.5 cursor-pointer"
            title="Tự động tạo bộ câu hỏi hoàn toàn mới từ các từ vựng tiếp theo trong bài"
          >
            <Sparkles className="size-4" />
            Luyện tiếp (Đề mới)
          </Button>

          {missedQuestions.length > 0 ? (
            <Button
              tone="line"
              onClick={handleDrillMissedOnly}
              className="flex items-center gap-1.5 text-seal border-seal/30 hover:border-seal cursor-pointer"
            >
              <RotateCcw className="size-4" />
              Luyện lại câu sai ({missedQuestions.length} câu)
            </Button>
          ) : null}

          <Button tone="ghost" onClick={handleRetrySameQuestions} className="cursor-pointer">
            Làm lại đề này
          </Button>

          <Button tone="ghost" onClick={onBack} className="cursor-pointer">
            Đổi dạng đề khác
          </Button>
        </div>

        {/* Danh sách câu làm sai để người học xem lại */}
        {missedQuestions.length > 0 ? (
          <div className="mt-8 text-left border-t border-line/70 pt-6">
            <h3 className="text-xs font-semibold text-stone uppercase tracking-wider mb-3">
              Các từ cần ôn lại ({missedQuestions.length} từ):
            </h3>
            <ul className="divide-y divide-line border-y border-line text-sm">
              {missedQuestions.map((q) => (
                <li key={q.id} className="py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-ink">{q.prompt}</p>
                      {q.reading ? <p className="text-xs text-stone mt-0.5">{q.reading}</p> : null}
                      <p className="text-xs text-emerald-700 mt-1">
                        Đáp án đúng: <strong>{q.kind === "choice" ? q.answer : q.reveal}</strong>
                      </p>
                      {q.explanation ? (
                        <p className="text-xs text-stone/80 mt-0.5 italic">{q.explanation}</p>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    );
  }

  const marked = starred.includes(current.wordId);

  return (
    <section>
      {/* Header điều khiển và tiến trình */}
      <div className="mb-3 flex items-center justify-between text-sm text-stone">
        <span className="tabular-nums font-medium">
          Câu {index + 1} / {questions.length}
        </span>
        <div className="flex items-center gap-2">
          {/* Nút bật tắt Hiragana */}
          <button
            type="button"
            onClick={() => setShowKana((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-sheet px-2.5 py-1 text-xs font-medium text-stone hover:text-ink hover:border-stone cursor-pointer transition-colors"
            title="Bật/tắt hiển thị cách đọc Hiragana bên dưới câu hỏi và đáp án"
          >
            <Languages className="size-3.5 text-seal" />
            <span>{showKana ? "Ẩn Hiragana" : "Hiện Hiragana"}</span>
          </button>

          {/* Đánh dấu sao */}
          <button
            type="button"
            className="flex size-9 items-center justify-center cursor-pointer transition-transform active:scale-125"
            aria-label={marked ? "Bỏ đánh dấu" : "Đánh dấu"}
            aria-pressed={marked}
            onClick={() => toggleStar(current.wordId)}
            title={marked ? "Bỏ đánh dấu từ này" : "Đánh dấu từ này để ôn riêng"}
          >
            <Star
              className={cn(
                "size-5",
                marked ? "fill-amber-500 text-amber-500" : "text-stone hover:text-ink",
              )}
            />
          </button>

          <button
            type="button"
            className="text-xs text-stone hover:text-ink cursor-pointer underline-offset-2 hover:underline ml-1"
            onClick={onBack}
          >
            Đổi dạng đề
          </button>
        </div>
      </div>

      <ProgressLine value={index} max={questions.length} />

      {/* Tên dạng bài & chú thích nhỏ */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wider text-stone uppercase">{current.label}</p>
        {current.subLabel ? (
          <p className="text-xs text-seal font-medium">{current.subLabel}</p>
        ) : null}
      </div>

      {/* Khung nội dung câu hỏi */}
      <div className="mt-2 rounded-xl border border-line bg-sheet px-5 py-6 text-center">
        <p className={cn("text-balance break-words text-ink", promptClass(current.prompt, current.promptJp))}>
          {current.prompt}
        </p>

        {/* Hiển thị cách đọc Hiragana / Katakana nếu được bật */}
        {showKana && current.reading ? (
          <div className="mt-2.5 pt-2 border-t border-line/50">
            <span className="text-[11px] font-semibold text-seal uppercase tracking-wider block mb-0.5">
              Cách đọc:
            </span>
            <p className="jp text-base text-stone">{current.reading}</p>
          </div>
        ) : null}

        {/* Nút nghe phát âm */}
        {current.speak ? (
          <button
            type="button"
            className="mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium text-stone hover:text-ink hover:border-stone cursor-pointer transition-colors"
            onClick={() => speakJapanese(current.speak || "")}
          >
            <Volume2 className="size-3.5 text-seal" />
            Nghe phát âm
          </button>
        ) : null}
      </div>

      {/* CÂU HỎI TRẮC NGHIỆM */}
      {current.kind === "choice" ? (
        <div className="mt-3 grid gap-2">
          {current.options.map((option, optionIndex) => {
            const letter = String.fromCharCode(65 + optionIndex);
            const isAnswer = option.text === current.answer;
            const selected = picked === option.text;

            let tone = "border-line bg-sheet text-ink hover:border-stone cursor-pointer";
            if (picked && isAnswer) tone = "border-emerald-600 bg-emerald-600 text-white font-medium";
            else if (selected && !isAnswer) tone = "border-seal bg-seal/10 text-seal";

            return (
              <button
                key={`${option.text}-${optionIndex}`}
                type="button"
                disabled={picked !== null}
                onClick={() => handlePick(option.text)}
                className={cn(
                  "flex min-h-12 items-start gap-3 rounded-md border px-4 py-3 text-left text-base transition-colors",
                  tone,
                )}
              >
                <span className="mt-0.5 w-6 shrink-0 font-medium">{letter}.</span>
                <div className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block break-words",
                      current.optionJp && "jp text-lg leading-tight",
                    )}
                  >
                    {option.text}
                  </span>
                  {showKana && option.reading && option.reading !== option.text ? (
                    <span
                      className={cn(
                        "jp block text-xs mt-0.5 font-normal",
                        picked && isAnswer ? "text-white/90" : "text-stone",
                      )}
                    >
                      {option.reading}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* CÂU HỎI TỰ LUẬN / GÕ TỪ */
        <form
          className="mt-3"
          onSubmit={(event) => {
            event.preventDefault();
            grade(typed);
          }}
        >
          <input
            value={typed}
            autoFocus
            disabled={verdict !== null}
            onChange={(event) => setTyped(event.target.value)}
            placeholder={current.placeholder || "Nhập câu trả lời..."}
            className="min-h-12 w-full rounded-md border border-line bg-sheet px-4 text-base text-ink outline-none focus-visible:border-ink"
            aria-label={current.placeholder}
          />
          {verdict === null ? (
            <Button
              className="mt-2 w-full"
              tone="seal"
              disabled={!typed.trim()}
              onClick={() => grade(typed)}
            >
              Kiểm tra
            </Button>
          ) : null}
        </form>
      )}

      {/* PHẦN GIẢI THÍCH VÀ NÚT TIẾP TỤC */}
      {answered ? (
        <div className="mt-4 rounded-lg border border-line bg-sheet p-4">
          <div className="flex items-center gap-2 text-sm">
            {current.kind === "choice" ? (
              picked === current.answer ? (
                <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="size-4" /> Đúng rồi!
                </span>
              ) : (
                <span className="text-seal font-medium flex items-center gap-1.5">
                  <AlertCircle className="size-4" /> Chưa chính xác. Đáp án đúng là ô màu xanh đậm.
                </span>
              )
            ) : verdict ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="size-4" /> Chính xác!
              </span>
            ) : (
              <span className="text-seal font-medium flex items-center gap-1.5">
                <AlertCircle className="size-4" /> Đáp án: {current.reveal}
              </span>
            )}
          </div>

          {current.explanation ? (
            <p className="text-xs text-stone mt-1.5 border-t border-line/60 pt-1.5">
              💡 {current.explanation}
            </p>
          ) : null}

          <div ref={nextRef} className="mt-3 scroll-mb-36">
            <Button
              className="w-full flex items-center justify-center gap-1.5 cursor-pointer"
              tone="seal"
              onClick={() => {
                setPicked(null);
                setTyped("");
                setVerdict(null);
                setIndex((value) => value + 1);
              }}
            >
              <span>{index + 1 >= questions.length ? "Xem kết quả" : "Câu tiếp theo"}</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function MatchQuiz({
  words,
  usedIds,
  onUpdateUsedIds,
  onBack,
}: {
  words: Word[];
  usedIds: number[];
  onUpdateUsedIds: (ids: number[]) => void;
  onBack: () => void;
}) {
  const [matchData, setMatchData] = useState(() => buildMatchRounds(words, usedIds));
  const [rounds, setRounds] = useState<Word[][]>(matchData.rounds);
  const [round, setRound] = useState(0);
  const [solved, setSolved] = useState<number[]>([]);
  const [selected, setSelected] = useState<{ side: "word" | "mean"; id: number } | null>(null);
  const [misses, setMisses] = useState(0);
  const [flash, setFlash] = useState(false);
  const [order, setOrder] = useState<number[][]>(() =>
    matchData.rounds.map((group) => shuffle(group.map((word) => word.id))),
  );
  const advanceTimer = useRef<number | null>(null);

  const group = rounds[round];
  const finished = round >= rounds.length;

  useEffect(() => {
    if (matchData.updatedUsedIds) {
      onUpdateUsedIds(matchData.updatedUsedIds);
    }
  }, [matchData.updatedUsedIds, onUpdateUsedIds]);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(false), 420);
    return () => window.clearTimeout(timer);
  }, [flash]);

  // Tạo lượt ghép cặp mới từ các từ khác trong bài
  function handleGenerateNewRounds() {
    const nextData = buildMatchRounds(words, matchData.updatedUsedIds);
    setMatchData(nextData);
    setRounds(nextData.rounds);
    setRound(0);
    setSolved([]);
    setSelected(null);
    setMisses(0);
    setOrder(nextData.rounds.map((grp) => shuffle(grp.map((w) => w.id))));
  }

  function handleRetrySameRounds() {
    setRound(0);
    setSolved([]);
    setSelected(null);
    setMisses(0);
    setOrder(rounds.map((grp) => shuffle(grp.map((w) => w.id))));
  }

  if (rounds.length === 0 || !group || finished) {
    const pairs = rounds.reduce((sum, item) => sum + item.length, 0);
    return (
      <section className="rounded-xl border border-line bg-sheet px-6 py-8 text-center shadow-xs">
        <p className="text-xs font-semibold tracking-wider text-stone uppercase">Kết quả ghép cặp</p>
        <p className="display mt-2 text-4xl text-ink">{pairs} cặp từ hoàn thành</p>
        <p className="mt-2 text-sm text-stone">
          {misses === 0 ? "Tuyệt vời! Không ghép nhầm lần nào." : `${misses} lần ghép nhầm.`}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <Button tone="seal" onClick={handleGenerateNewRounds} className="flex items-center gap-1.5 cursor-pointer">
            <Sparkles className="size-4" />
            Lượt ghép mới (Bộ từ mới)
          </Button>
          <Button tone="line" onClick={handleRetrySameRounds} className="cursor-pointer">
            Làm lại lượt này
          </Button>
          <Button tone="ghost" onClick={onBack} className="cursor-pointer">
            Đổi dạng đề khác
          </Button>
        </div>
      </section>
    );
  }

  const meanings = order[round] ?? [];

  function tap(side: "word" | "mean", id: number) {
    if (solved.includes(id)) return;
    if (!selected || selected.side === side) {
      setSelected({ side, id });
      return;
    }
    const wordId = side === "word" ? id : selected.id;
    const meanId = side === "mean" ? id : selected.id;
    setSelected(null);
    if (wordId === meanId) {
      const next = [...solved, wordId];
      setSolved(next);
      if (next.length === group.length) {
        advanceTimer.current = window.setTimeout(() => {
          setRound((value) => value + 1);
          setSolved([]);
          setSelected(null);
        }, 450);
      }
      return;
    }
    setMisses((value) => value + 1);
    setFlash(true);
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between text-sm text-stone">
        <span className="tabular-nums font-medium">
          Lượt ghép {round + 1} / {rounds.length}
        </span>
        <button
          type="button"
          className="text-xs text-stone hover:text-ink cursor-pointer underline-offset-2 hover:underline"
          onClick={onBack}
        >
          Đổi dạng đề
        </button>
      </div>
      <ProgressLine value={solved.length} max={group.length} />
      <p className="mt-5 text-sm text-stone">Chọn một từ tiếng Nhật, sau đó chọn nghĩa tiếng Việt tương ứng:</p>
      <div className={cn("mt-3 flex flex-wrap gap-2 rounded-md p-1", flash && "bg-seal/10")}>
        {group.map((word) => {
          const donePair = solved.includes(word.id);
          const active = selected?.side === "word" && selected.id === word.id;
          const reading = shownReading(word);
          return (
            <button
              key={word.id}
              type="button"
              disabled={donePair}
              onClick={() => tap("word", word.id)}
              className={cn(
                "inline-flex min-h-12 flex-col items-center justify-center rounded-md border px-3.5 py-2 cursor-pointer transition-colors",
                donePair && "border-line text-stone opacity-40 cursor-default",
                active && "border-ink bg-ink text-paper",
                !donePair && !active && "border-line bg-sheet text-ink hover:border-stone",
              )}
            >
              <span className="jp text-xl leading-tight font-medium">{word.word}</span>
              {reading ? (
                <span className={cn("text-xs leading-tight mt-0.5", active ? "text-paper/80" : "text-stone")}>
                  {reading}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="mt-3 grid gap-2">
        {meanings.map((id) => {
          const word = group.find((item) => item.id === id);
          if (!word) return null;
          const donePair = solved.includes(id);
          const active = selected?.side === "mean" && selected.id === id;
          return (
            <button
              key={id}
              type="button"
              disabled={donePair}
              onClick={() => tap("mean", id)}
              className={cn(
                "min-h-12 break-words rounded-md border px-4 py-3 text-left transition-colors cursor-pointer",
                donePair && "border-line text-stone opacity-40 cursor-default",
                active && "border-ink bg-ink text-paper",
                !donePair && !active && "border-line bg-sheet text-ink hover:border-stone",
              )}
            >
              {word.meaning}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function promptClass(text: string, japanese: boolean) {
  if (!japanese) return text.length > 32 ? "text-xl sm:text-2xl" : "display text-2xl sm:text-3xl";
  if (text.length > 20) return "jp text-lg sm:text-xl font-medium leading-relaxed";
  if (text.length > 10) return "jp text-2xl sm:text-3xl font-medium";
  return "jp text-4xl sm:text-5xl font-medium";
}
