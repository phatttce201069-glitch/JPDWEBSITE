import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Target,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressLine } from "@/components/progress-line";
import { grammar, pointById } from "@/lib/study/content";
import { buildGrammarDrill, type ExamQuestion } from "@/lib/study/exam";
import { useStudy } from "@/lib/study/store";
import { speakJapanese } from "@/lib/study/speech";
import type { GrammarLesson, GrammarPoint, GrammarSearch } from "@/lib/study/types";
import { cn } from "@/lib/cn";
import { QuestionExplanationPanel } from "@/components/question-explanation";

export const Route = createFileRoute("/grammar")({
  validateSearch: (search: Record<string, unknown>): GrammarSearch => ({
    lesson: typeof search.lesson === "string" ? search.lesson : "",
    point: typeof search.point === "string" ? search.point : "",
    drill: search.drill === true || search.drill === "true" || search.drill === "1",
  }),
  component: GrammarPage,
});

function GrammarPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/grammar" });
  const setLast = useStudy((state) => state.setLast);
  const [showReading, setShowReading] = useState(false);

  const lesson = grammar.find((item) => item.id === search.lesson) ?? null;
  const found = search.point ? pointById(search.point) : null;

  useEffect(() => {
    let label = "Ngữ pháp";
    if (search.drill && lesson) {
      if (found) {
        label = `Luyện riêng · ${found.point.structure_vi}`;
      } else {
        label = `Luyện · ${lesson.title}`;
      }
    } else if (found) {
      label = found.point.structure_jp;
    } else if (lesson) {
      label = lesson.title;
    }

    setLast({
      to: "/grammar",
      label,
      search,
    });
  }, [search.lesson, search.point, search.drill, found?.point.structure_jp, found?.point.structure_vi, lesson?.title, setLast]);

  function setSearch(patch: Partial<GrammarSearch>) {
    void navigate({ search: (prev) => ({ ...prev, ...patch }) });
  }

  // 1. Chế độ luyện trắc nghiệm (toàn bài hoặc riêng 1 phần)
  if (search.drill && lesson) {
    return (
      <GrammarDrill
        key={`${lesson.id}-${search.point || "all"}`}
        lesson={lesson}
        point={found?.point ?? null}
        onExit={() => setSearch({ drill: false })}
        onSelectPoint={(pointId) => setSearch({ point: pointId, drill: true })}
        onDrillAll={() => setSearch({ point: "", drill: true })}
      />
    );
  }

  // 2. Chế độ xem chi tiết 1 điểm ngữ pháp cụ thể
  if (found) {
    const { point } = found;
    const pointIdx = found.lesson.points.findIndex((p) => p.id === point.id);

    return (
      <div>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm text-stone hover:text-ink cursor-pointer"
          onClick={() => setSearch({ point: "", drill: false })}
        >
          ← {found.lesson.title}
        </button>

        <div className="mt-3 flex items-center gap-2">
          <span className="rounded bg-seal/10 px-2 py-0.5 text-xs font-semibold text-seal">
            Phần {pointIdx + 1} / {found.lesson.points.length}
          </span>
          <span className="text-xs text-stone">{found.lesson.subtitle}</span>
        </div>

        <h1 className="jp mt-2 text-4xl leading-snug font-medium">{point.structure_jp}</h1>
        <p className="mt-2 text-lg text-stone">{point.structure_vi}</p>

        {/* Nút hành động nhanh: Luyện riêng phần này hoặc luyện cả bài */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <Button
            className="flex-1 shadow-xs inline-flex items-center justify-center gap-2"
            tone="seal"
            onClick={() => setSearch({ point: point.id, drill: true })}
          >
            <Target className="size-4" />
            <span>Luyện riêng phần này ({point.structure_vi})</span>
          </Button>
          <Button
            className="sm:w-auto"
            tone="ghost"
            onClick={() => setSearch({ point: "", drill: true })}
          >
            Luyện cả bài {found.lesson.id}
          </Button>
        </div>

        <dl className="mt-8 space-y-5">
          <div>
            <dt className="text-xs tracking-wide text-stone uppercase font-medium">Công thức</dt>
            <dd className="mt-1 font-mono text-sm bg-sheet px-3.5 py-2.5 rounded-lg border border-line">
              {point.formula}
            </dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-stone uppercase font-medium">Cách dùng</dt>
            <dd className="mt-1 text-stone leading-relaxed">
              {point.explanation}. {point.usage}
            </dd>
          </div>
          {point.note ? (
            <div className="border-l-2 border-seal pl-4">
              <dt className="text-xs tracking-wide text-seal uppercase font-medium">Lưu ý</dt>
              <dd className="mt-1 text-sm leading-relaxed">{point.note}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-sm tracking-wide text-stone uppercase font-medium">Ví dụ minh họa</h2>
          <button
            type="button"
            className="min-h-11 text-sm text-ink underline-offset-2 hover:underline cursor-pointer"
            onClick={() => setShowReading((value) => !value)}
          >
            {showReading ? "Ẩn cách đọc" : "Hiện cách đọc"}
          </button>
        </div>

        {point.examples.length === 0 ? (
          <p className="mt-3 text-stone">Mẫu này chưa có ví dụ.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line border-y border-line">
            {point.examples.map((example) => (
              <li key={example.jp} className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="jp text-xl">{example.jp}</p>
                  <button
                    type="button"
                    className="min-h-11 shrink-0 text-stone hover:text-ink cursor-pointer"
                    aria-label="Nghe phát âm"
                    onClick={() => speakJapanese(example.jp)}
                  >
                    <Volume2 className="size-4" />
                  </button>
                </div>
                {showReading ? (
                  <p className="mt-1 text-sm text-stone">
                    {example.reading}
                    <span className="mt-0.5 block">{example.romaji}</span>
                  </p>
                ) : null}
                <p className="mt-2 text-ink">{example.vi}</p>
              </li>
            ))}
          </ul>
        )}

        {/* Nút hành động cuối trang */}
        <div className="mt-8 pt-6 border-t border-line flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 shadow-xs inline-flex items-center justify-center gap-2"
            tone="seal"
            onClick={() => setSearch({ point: point.id, drill: true })}
          >
            <Target className="size-4" />
            <span>Luyện riêng phần này ({point.structure_vi})</span>
          </Button>
          <Button
            className="sm:w-auto"
            tone="ghost"
            onClick={() => setSearch({ point: "", drill: true })}
          >
            Luyện toàn bộ bài {found.lesson.id}
          </Button>
        </div>
      </div>
    );
  }

  // 3. Chế độ xem danh sách các phần trong 1 bài học (ví dụ Bài 6)
  if (lesson) {
    return (
      <div>
        <button
          type="button"
          className="text-sm text-stone hover:text-ink cursor-pointer"
          onClick={() => setSearch({ lesson: "", point: "", drill: false })}
        >
          ← Tất cả bài
        </button>
        <p className="jp mt-3 text-sm text-stone">{lesson.subtitle}</p>
        <h1 className="display mt-1 text-4xl">{lesson.title}</h1>
        <p className="mt-3 text-stone leading-relaxed">{lesson.description}</p>

        {/* Action card: Luyện toàn bộ bài */}
        <div className="mt-6 rounded-xl border border-line bg-sheet/60 p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-ink">Luyện tập tổng hợp cả bài</p>
              <p className="text-xs text-stone mt-0.5">
                Luyện trắc nghiệm kết hợp tất cả {lesson.points.length} phần ngữ pháp của bài này
              </p>
            </div>
            <Button
              tone="seal"
              className="shrink-0"
              onClick={() => setSearch({ point: "", drill: true })}
            >
              Luyện tất cả các phần
            </Button>
          </div>
        </div>

        {/* Danh sách từng phần ngữ pháp với nút Luyện riêng */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-xs tracking-wider text-stone uppercase font-semibold">
            Danh sách các phần ({lesson.points.length} phần)
          </h2>
          <span className="text-xs text-stone">Chọn 「🎯 Luyện riêng」để luyện tập từng phần</span>
        </div>

        <ul className="mt-3 divide-y divide-line border-y border-line">
          {lesson.points.map((point, index) => (
            <li key={point.id} className="flex items-center justify-between gap-3 py-4 group">
              <button
                type="button"
                className="min-w-0 flex-1 text-left cursor-pointer"
                onClick={() => setSearch({ point: point.id, drill: false })}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-stone tabular-nums">
                    Phần {String(index + 1).padStart(2, "0")}
                  </span>
                  {point.chips?.length ? (
                    <div className="hidden sm:flex items-center gap-1">
                      {point.chips.slice(0, 3).map((chip, cIdx) => (
                        <span key={cIdx} className="rounded bg-paper px-1.5 py-0.5 text-[10px] text-stone border border-line">
                          {chip}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <span className="jp mt-1 block text-xl font-medium group-hover:text-seal transition-colors">
                  {point.structure_jp}
                </span>
                <span className="mt-0.5 block text-sm text-stone">{point.structure_vi}</span>
              </button>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  tone="ghost"
                  className="hidden md:inline-flex min-h-9 px-3 py-1 text-xs"
                  onClick={() => setSearch({ point: point.id, drill: false })}
                >
                  Lý thuyết
                </Button>
                <Button
                  tone="seal"
                  className="min-h-9 px-3 py-1 text-xs shadow-xs inline-flex items-center gap-1.5"
                  onClick={() => setSearch({ point: point.id, drill: true })}
                >
                  <Target className="size-3.5" />
                  <span>Luyện riêng</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // 4. Màn hình mặc định: Danh sách tất cả bài ngữ pháp
  return (
    <div>
      <p className="text-sm tracking-[0.18em] text-stone uppercase font-medium">Ngữ pháp</p>
      <h1 className="display mt-2 text-4xl">Học mẫu câu, luyện riêng từng phần.</h1>
      <p className="mt-2 max-w-md text-stone">
        Mỗi bài học bao gồm cấu trúc, ví dụ minh họa và tính năng luyện trắc nghiệm riêng từng phần hoặc cả bài.
      </p>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {grammar.map((item) => (
          <li key={item.id} className="flex items-stretch gap-2">
            <button
              type="button"
              className="min-w-0 flex-1 py-5 text-left cursor-pointer"
              onClick={() => setSearch({ lesson: item.id, point: "", drill: false })}
            >
              <span className="jp text-sm text-stone">{item.subtitle}</span>
              <span className="mt-1 block text-xl font-medium">{item.title}</span>
              <span className="mt-1 block text-sm text-stone">{item.points.length} phần ngữ pháp</span>
            </button>
            <button
              type="button"
              className="min-h-11 shrink-0 self-center rounded-md px-3 text-sm text-seal hover:bg-seal/10 cursor-pointer"
              onClick={() => setSearch({ lesson: item.id, point: "", drill: true })}
            >
              Luyện cả bài
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Component luyện trắc nghiệm ngữ pháp:
 * Hỗ trợ cả 2 chế độ:
 * 1. Luyện riêng 1 phần ngữ pháp (khi có `point`)
 * 2. Luyện tổng hợp cả bài (khi `point` là null)
 */
function GrammarDrill({
  lesson,
  point,
  onExit,
  onSelectPoint,
  onDrillAll,
}: {
  lesson: GrammarLesson;
  point: GrammarPoint | null;
  onExit: () => void;
  onSelectPoint?: (pointId: string) => void;
  onDrillAll?: () => void;
}) {
  const [paper, setPaper] = useState<ExamQuestion[]>(() => buildGrammarDrill(lesson.id, point?.id));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<(string | null)[]>(() => Array(paper.length).fill(null));
  const [closed, setClosed] = useState(false);
  const nextRef = useRef<HTMLDivElement>(null);

  const pointIdx = point ? lesson.points.findIndex((p) => p.id === point.id) : -1;
  const nextPoint = point && pointIdx >= 0 && pointIdx < lesson.points.length - 1 ? lesson.points[pointIdx + 1] : null;

  useEffect(() => {
    if (!picked) return;
    nextRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [picked, index]);

  function restart() {
    const next = buildGrammarDrill(lesson.id, point?.id);
    setPaper(next);
    setIndex(0);
    setPicked(null);
    setAnswers(Array(next.length).fill(null));
    setClosed(false);
  }

  if (paper.length === 0) {
    return (
      <div>
        <button type="button" className="text-sm text-stone hover:text-ink cursor-pointer" onClick={onExit}>
          ← {point ? point.structure_vi : lesson.title}
        </button>
        <div className="mt-6 rounded-xl border border-line bg-sheet p-6 text-center">
          <p className="text-base font-medium text-ink">Phần này hiện chưa có câu hỏi luyện tập.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Button tone="ghost" onClick={onExit}>
              Về bài học
            </Button>
            {point && onDrillAll && (
              <Button tone="seal" onClick={onDrillAll}>
                Luyện toàn bộ bài {lesson.id}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const done = closed || index >= paper.length;
  const correct = answers.filter((answer, answerIndex) => answer === paper[answerIndex]?.answer).length;

  // Màn hình kết quả làm bài
  if (done) {
    const missed = paper.filter((question, questionIndex) => answers[questionIndex] !== question.answer);
    const percentage = Math.round((correct / paper.length) * 100);

    return (
      <div>
        <div className="flex items-center gap-2">
          {point ? (
            <span className="rounded bg-seal/10 px-2 py-0.5 text-xs font-semibold text-seal inline-flex items-center gap-1">
              <Target className="size-3" />
              Luyện riêng phần {pointIdx + 1}
            </span>
          ) : (
            <span className="rounded bg-stone/10 px-2 py-0.5 text-xs font-semibold text-stone">
              Luyện tổng hợp cả bài
            </span>
          )}
          <span className="text-xs text-stone">{lesson.title}</span>
        </div>

        <p className="display mt-3 text-5xl tabular-nums font-semibold">
          {correct}
          <span className="text-2xl text-stone font-normal">/{paper.length}</span>
          <span className="ml-3 text-lg font-normal text-stone">({percentage}%)</span>
        </p>

        <p className="mt-2 text-base font-medium text-ink">
          {point ? `${point.structure_jp} (${point.structure_vi})` : lesson.title}
        </p>

        {percentage >= 80 ? (
          <p className="mt-1 text-sm text-emerald-600 font-medium">
            Xuất sắc! Bạn đã nắm vững cấu trúc này.
          </p>
        ) : (
          <p className="mt-1 text-sm text-stone">
            Hãy xem lại các câu chưa đúng và giải thích chi tiết bên dưới nhé.
          </p>
        )}

        {/* Danh sách câu làm sai kèm lời giải chi tiết */}
        {missed.length > 0 ? (
          <div className="mt-8">
            <h3 className="text-xs font-semibold tracking-wider text-stone uppercase">
              Các câu cần lưu ý ({missed.length} câu)
            </h3>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {missed.map((question) => (
                <li key={question.id} className="py-4">
                  <p className="text-xs font-mono text-stone">Câu {question.id}</p>
                  <p className="mt-1 text-sm font-medium">{question.prompt}</p>
                  <div className="mt-2">
                    <Sentence text={question.sentence} compact />
                  </div>
                  <p className="mt-2 text-sm text-emerald-700">
                    Đáp án đúng: <span className="font-semibold">{question.answer}</span>
                  </p>
                  <QuestionExplanationPanel question={question} defaultOpen={true} compact />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-6 flex items-center gap-2 text-emerald-600 font-medium text-sm">
            <CheckCircle2 className="size-4" />
            <span>Chính xác tuyệt đối! Tất cả các câu đều đúng.</span>
          </div>
        )}

        {/* Các nút điều hướng sau khi xong bài */}
        <div className="mt-8 flex flex-wrap gap-2.5">
          <Button tone="seal" onClick={restart} className="inline-flex items-center gap-1.5">
            <RotateCcw className="size-4" />
            <span>Làm lại phần này</span>
          </Button>

          {point && nextPoint && onSelectPoint && (
            <Button
              tone="seal"
              onClick={() => onSelectPoint(nextPoint.id)}
              className="inline-flex items-center gap-1.5"
            >
              <span>Luyện tiếp phần {pointIdx + 2}: {nextPoint.structure_vi}</span>
              <ArrowRight className="size-4" />
            </Button>
          )}

          {point && onDrillAll && (
            <Button tone="ghost" onClick={onDrillAll}>
              Luyện toàn bộ bài {lesson.id}
            </Button>
          )}

          <Button tone="ghost" onClick={onExit}>
            Về lý thuyết bài học
          </Button>
        </div>
      </div>
    );
  }

  const current = paper[index];
  if (!current) return null;

  function choose(option: string) {
    if (picked) return;
    setPicked(option);
    setAnswers((currentAnswers) =>
      currentAnswers.map((answer, answerIndex) => (answerIndex === index ? option : answer)),
    );
  }

  return (
    <div>
      {/* Drill Header */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          className="text-sm text-stone hover:text-ink cursor-pointer"
          onClick={onExit}
        >
          ← {point ? `Lý thuyết ${point.structure_vi}` : lesson.title}
        </button>

        {point && onDrillAll && (
          <button
            type="button"
            className="text-xs text-seal hover:underline cursor-pointer"
            onClick={onDrillAll}
          >
            Luyện cả bài →
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        {point ? (
          <>
            <span className="rounded bg-seal/10 px-2 py-0.5 text-xs font-semibold text-seal inline-flex items-center gap-1">
              <Target className="size-3" />
              Luyện riêng phần {pointIdx + 1}
            </span>
            <span className="text-xs text-stone">{point.structure_vi}</span>
          </>
        ) : (
          <span className="rounded bg-stone/10 px-2 py-0.5 text-xs font-semibold text-stone">
            Luyện tổng hợp · {lesson.title}
          </span>
        )}
      </div>

      <div className="mt-4 mb-3 flex items-center justify-between text-sm text-stone">
        <span className="tabular-nums font-medium">
          Câu {index + 1} / {paper.length}
        </span>
        <span className="text-xs">
          {point ? point.structure_jp : "Toàn bộ bài"}
        </span>
      </div>

      <ProgressLine value={index} max={paper.length} />

      {current.promptJp ? <p className="jp mt-5 text-base leading-relaxed">{current.promptJp}</p> : null}
      <h1 className="mt-2 text-lg font-medium leading-snug">{current.prompt}</h1>

      <div className="mt-4 rounded-md border border-line bg-sheet px-5 py-6">
        <Sentence text={current.sentence} />
      </div>

      <div className="mt-3 grid gap-2">
        {current.options.map((option, optionIndex) => {
          const letter = String.fromCharCode(65 + optionIndex);
          const isAnswer = option === current.answer;
          const selectedOption = picked === option;
          let tone = "border-line bg-sheet text-ink hover:border-stone cursor-pointer";
          if (picked && isAnswer) tone = "border-emerald-600 bg-emerald-600 text-white font-medium";
          else if (selectedOption) tone = "border-seal bg-seal/10 text-seal";
          return (
            <button
              key={`${option}-${optionIndex}`}
              type="button"
              disabled={picked !== null}
              onClick={() => choose(option)}
              className={cn("flex min-h-12 items-start gap-3 rounded-md border px-4 py-3 text-left text-base transition-colors", tone)}
            >
              <span className="mt-0.5 w-6 shrink-0 font-medium">{letter}.</span>
              <span className={cn("break-words", /[ぁ-んァ-ヶ一-龯]/.test(option) && "jp text-lg")}>{option}</span>
            </button>
          );
        })}
      </div>

      {/* Hiển thị phân tích lời giải chi tiết ngay sau khi chọn đáp án */}
      {picked && (
        <div className="mt-4">
          <QuestionExplanationPanel question={current} defaultOpen={false} />
        </div>
      )}

      {picked ? (
        <div ref={nextRef} className="mt-4 scroll-mb-36">
          <Button
            className="w-full"
            tone="seal"
            onClick={() => {
              setPicked(null);
              setIndex((value) => value + 1);
            }}
          >
            {index + 1 === paper.length ? "Xem kết quả" : "Câu tiếp theo →"}
          </Button>
        </div>
      ) : (
        <button
          type="button"
          className="mt-4 text-sm text-stone hover:text-ink cursor-pointer"
          onClick={() => setClosed(true)}
        >
          Dừng bài luyện
        </button>
      )}
    </div>
  );
}

function Sentence({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <div className={cn("jp leading-loose text-ink", compact ? "text-base leading-relaxed" : "text-xl")}>
      {text.split("\n").map((line, lineIndex) => (
        <p key={lineIndex}>{renderLine(line)}</p>
      ))}
    </div>
  );
}

function renderLine(line: string) {
  const chunks = line.split(/(〔[^〕]*〕)/);
  return chunks.map((chunk, index) => {
    if (!chunk.startsWith("〔")) return <span key={index}>{chunk}</span>;
    return (
      <span key={index}>
        （　<span className="underline decoration-seal underline-offset-4">{chunk.slice(1, -1)}</span>　）
      </span>
    );
  });
}
