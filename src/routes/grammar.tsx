import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressLine } from "@/components/progress-line";
import { grammar, pointById } from "@/lib/study/content";
import { buildGrammarDrill, type ExamQuestion } from "@/lib/study/exam";
import { useStudy } from "@/lib/study/store";
import { speakJapanese } from "@/lib/study/speech";
import type { GrammarLesson, GrammarSearch } from "@/lib/study/types";
import { cn } from "@/lib/cn";

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
    const label = search.drill && lesson ? `Luyện · ${lesson.title}` : found?.point.structure_jp || lesson?.title || "Ngữ pháp";
    setLast({
      to: "/grammar",
      label,
      search,
    });
  }, [search.lesson, search.point, search.drill, found?.point.structure_jp, lesson?.title, setLast]);

  function setSearch(patch: Partial<GrammarSearch>) {
    void navigate({ search: (prev) => ({ ...prev, ...patch }) });
  }

  if (search.drill && lesson) {
    return <GrammarDrill key={lesson.id} lesson={lesson} onExit={() => setSearch({ drill: false })} />;
  }

  if (found) {
    const { point } = found;
    return (
      <div>
        <button type="button" className="text-sm text-stone hover:text-ink" onClick={() => setSearch({ point: "" })}>
          {found.lesson.title}
        </button>
        <h1 className="jp mt-3 text-4xl leading-snug font-medium">{point.structure_jp}</h1>
        <p className="mt-2 text-lg text-stone">{point.structure_vi}</p>

        <dl className="mt-8 space-y-5">
          <div>
            <dt className="text-xs tracking-wide text-stone uppercase">Công thức</dt>
            <dd className="mt-1">{point.formula}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-stone uppercase">Cách dùng</dt>
            <dd className="mt-1 text-stone">
              {point.explanation}. {point.usage}
            </dd>
          </div>
          {point.note ? (
            <div className="border-l-2 border-seal pl-4">
              <dt className="text-xs tracking-wide text-seal uppercase">Lưu ý</dt>
              <dd className="mt-1">{point.note}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-sm tracking-wide text-stone uppercase">Ví dụ</h2>
          <button type="button" className="min-h-11 text-sm text-ink underline-offset-2 hover:underline" onClick={() => setShowReading((value) => !value)}>
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
                  <button type="button" className="min-h-11 shrink-0 text-stone hover:text-ink" aria-label="Nghe" onClick={() => speakJapanese(example.jp)}>
                    <Volume2 className="size-4" />
                  </button>
                </div>
                {showReading ? (
                  <p className="mt-1 text-sm text-stone">
                    {example.reading}
                    <span className="mt-0.5 block">{example.romaji}</span>
                  </p>
                ) : null}
                <p className="mt-2">{example.vi}</p>
              </li>
            ))}
          </ul>
        )}
        <Button className="mt-6 w-full" tone="seal" onClick={() => setSearch({ drill: true })}>
          Luyện trắc nghiệm bài này
        </Button>
      </div>
    );
  }

  if (lesson) {
    return (
      <div>
        <button type="button" className="text-sm text-stone hover:text-ink" onClick={() => setSearch({ lesson: "", point: "", drill: false })}>
          Tất cả bài
        </button>
        <p className="jp mt-3 text-sm text-stone">{lesson.subtitle}</p>
        <h1 className="display mt-1 text-4xl">{lesson.title}</h1>
        <p className="mt-3 text-stone">{lesson.description}</p>
        <Button className="mt-6 w-full" tone="seal" onClick={() => setSearch({ drill: true })}>
          Luyện trắc nghiệm
        </Button>
        <p className="mt-2 text-sm text-stone">Câu A–D cùng dạng với phần kiểm tra, chỉ ngữ pháp bài này. Không tính giờ.</p>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {lesson.points.map((point, index) => (
            <li key={point.id}>
              <button type="button" className="w-full py-4 text-left" onClick={() => setSearch({ point: point.id })}>
                <span className="text-xs text-stone tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                <span className="jp mt-1 block text-2xl">{point.structure_jp}</span>
                <span className="mt-1 block text-sm text-stone">{point.structure_vi}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm tracking-[0.18em] text-stone uppercase">Ngữ pháp</p>
      <h1 className="display mt-2 text-4xl">Mẫu câu, rồi luyện ngay.</h1>
      <p className="mt-2 max-w-md text-stone">Mỗi bài có cấu trúc, ví dụ, và một lượt trắc nghiệm A–D cùng dạng với đề kiểm tra.</p>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {grammar.map((item) => (
          <li key={item.id} className="flex items-stretch gap-2">
            <button type="button" className="min-w-0 flex-1 py-5 text-left" onClick={() => setSearch({ lesson: item.id, drill: false })}>
              <span className="jp text-sm text-stone">{item.subtitle}</span>
              <span className="mt-1 block text-xl font-medium">{item.title}</span>
              <span className="mt-1 block text-sm text-stone">{item.points.length} mẫu</span>
            </button>
            <button
              type="button"
              className="min-h-11 shrink-0 self-center rounded-md px-3 text-sm text-seal hover:bg-seal/10"
              onClick={() => setSearch({ lesson: item.id, point: "", drill: true })}
            >
              Luyện
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GrammarDrill({ lesson, onExit }: { lesson: GrammarLesson; onExit: () => void }) {
  const [paper, setPaper] = useState<ExamQuestion[]>(() => buildGrammarDrill(lesson.id));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<(string | null)[]>(() => Array(paper.length).fill(null));
  const [closed, setClosed] = useState(false);
  const nextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!picked) return;
    nextRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [picked, index]);

  function restart() {
    const next = buildGrammarDrill(lesson.id);
    setPaper(next);
    setIndex(0);
    setPicked(null);
    setAnswers(Array(next.length).fill(null));
    setClosed(false);
  }

  if (paper.length === 0) {
    return (
      <div>
        <button type="button" className="text-sm text-stone hover:text-ink" onClick={onExit}>
          {lesson.title}
        </button>
        <p className="mt-4 text-stone">Bài này chưa có câu luyện.</p>
      </div>
    );
  }

  const done = closed || index >= paper.length;
  const correct = answers.filter((answer, answerIndex) => answer === paper[answerIndex]?.answer).length;

  if (done) {
    const missed = paper.filter((question, questionIndex) => answers[questionIndex] !== question.answer);
    return (
      <div>
        <p className="text-sm tracking-wide text-stone uppercase">Luyện ngữ pháp</p>
        <p className="display mt-2 text-5xl tabular-nums">
          {correct}
          <span className="text-2xl text-stone">/{paper.length}</span>
        </p>
        <p className="mt-2 text-stone">{lesson.title}</p>
        {missed.length ? (
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {missed.map((question) => (
              <li key={question.id} className="py-3">
                <p className="text-sm text-stone">Câu {question.id}</p>
                <p className="mt-1 text-sm">{question.prompt}</p>
                <div className="mt-2">
                  <Sentence text={question.sentence} compact />
                </div>
                <p className="mt-1 text-sm">
                  Đáp án: <span className="font-medium">{question.answer}</span>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-stone">Đúng hết.</p>
        )}
        <div className="mt-6 flex gap-2">
          <Button tone="ghost" onClick={onExit}>
            Về bài
          </Button>
          <Button tone="seal" onClick={restart}>
            Làm lại
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
    setAnswers((currentAnswers) => currentAnswers.map((answer, answerIndex) => (answerIndex === index ? option : answer)));
  }

  return (
    <div>
      <button type="button" className="text-sm text-stone hover:text-ink" onClick={onExit}>
        {lesson.title}
      </button>
      <div className="mt-4 mb-3 flex items-center justify-between text-sm text-stone">
        <span className="tabular-nums">
          Câu {index + 1} / {paper.length}
        </span>
        <span>Ngữ pháp</span>
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
          let tone = "border-line bg-sheet text-ink hover:border-stone";
          if (picked && isAnswer) tone = "border-ink bg-ink text-paper";
          else if (selectedOption) tone = "border-seal bg-seal/10 text-seal";
          return (
            <button
              key={`${option}-${optionIndex}`}
              type="button"
              disabled={picked !== null}
              onClick={() => choose(option)}
              className={cn("flex min-h-12 items-start gap-3 rounded-md border px-4 py-3 text-left text-base", tone)}
            >
              <span className="mt-0.5 w-6 shrink-0 font-medium">{letter}.</span>
              <span className={cn("break-words", /[ぁ-んァ-ヶ一-龯]/.test(option) && "jp text-lg")}>{option}</span>
            </button>
          );
        })}
      </div>
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
            {index + 1 === paper.length ? "Xong" : "Tiếp"}
          </Button>
        </div>
      ) : (
        <button type="button" className="mt-4 text-sm text-stone hover:text-ink" onClick={() => setClosed(true)}>
          Dừng
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