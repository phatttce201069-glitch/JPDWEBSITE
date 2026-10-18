import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressLine } from "@/components/progress-line";
import { EXAM_SECONDS, EXAM_SIZE, buildExam, examUnits, type ExamQuestion } from "@/lib/study/exam";
import { useStudy } from "@/lib/study/store";
import type { ExamSearch } from "@/lib/study/types";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/exam")({
  validateSearch: (search: Record<string, unknown>): ExamSearch => ({
    course: search.course === "JPD113" || search.course === "JPD123" ? search.course : "",
    bai: typeof search.bai === "string" ? search.bai.split(",").filter((part) => /^\d+$/.test(part)).join(",") : "",
  }),
  component: ExamPage,
});

function ExamPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/exam" });
  const starred = useStudy((state) => state.starred);
  const setLast = useStudy((state) => state.setLast);
  const [paper, setPaper] = useState<ExamQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [left, setLeft] = useState(EXAM_SECONDS);
  const [closed, setClosed] = useState(false);
  const [note, setNote] = useState("");
  const nextRef = useRef<HTMLDivElement>(null);

  const selected = search.bai ? search.bai.split(",") : [];

  useEffect(() => {
    const label = search.course
      ? selected.length
        ? `${search.course} · Bài ${selected.join(", ")}`
        : search.course
      : "Kiểm tra";
    setLast({ to: "/exam", label, search });
  }, [search.course, search.bai, setLast]);

  useEffect(() => {
    if (!paper || closed) return;
    const timer = window.setInterval(() => {
      setLeft((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [paper, closed]);

  useEffect(() => {
    if (paper && left === 0) setClosed(true);
  }, [paper, left]);

  useEffect(() => {
    if (!picked) return;
    nextRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [picked, index]);

  function setSearch(patch: Partial<ExamSearch>) {
    void navigate({ search: (prev) => ({ ...prev, ...patch }) });
  }

  function toggleBai(bai: string) {
    const next = selected.includes(bai) ? selected.filter((item) => item !== bai) : [...selected, bai];
    next.sort((leftBai, rightBai) => Number(leftBai) - Number(rightBai));
    setNote("");
    setSearch({ bai: next.join(",") });
  }

  function start() {
    if (!search.course || selected.length === 0) return;
    const next = buildExam(search.course, selected);
    if (next.length < EXAM_SIZE) {
      setNote("Bài này chưa đủ dữ liệu để lập đề 30 câu. Hãy gộp thêm bài.");
      return;
    }
    setNote("");
    setPaper(next);
    setIndex(0);
    setPicked(null);
    setAnswers(Array(next.length).fill(null));
    setLeft(EXAM_SECONDS);
    setClosed(false);
  }

  if (!search.course) {
    return (
      <div>
        <p className="text-sm tracking-[0.18em] text-stone uppercase">Kiểm tra</p>
        <h1 className="display mt-2 text-4xl">Chọn môn.</h1>
        <p className="mt-2 text-stone">30 câu A–D, 30 phút. Vẫn là kanji, từ vựng và ngữ pháp — cách hỏi đổi mỗi đề: âm on/kun, nghĩa chữ, nhóm từ, nghĩa cả câu, dịch câu, chia động từ, tình huống và câu sai.</p>
        <div className="mt-8">
          <h2 className="text-sm tracking-wide text-stone uppercase">Theo môn học</h2>
          <ul className="mt-2 divide-y divide-line border-y border-line">
            {(["JPD113", "JPD123"] as const).map((course) => (
              <li key={course}>
                <button
                  type="button"
                  className="flex min-h-14 w-full flex-col items-start justify-center py-3 text-left transition-colors hover:text-ink"
                  onClick={() => setSearch({ course, bai: "" })}
                >
                  <span className="font-medium">{course}</span>
                  <span className="text-sm text-stone">{course === "JPD113" ? "Sơ cấp 1" : "Sơ cấp 2 · bài 4–7"}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <h2 className="text-sm tracking-wide text-stone uppercase">Luyện tập tập trung</h2>
          <div className="mt-2 rounded-xl border border-line bg-sheet p-5 shadow-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Star
                  className={cn(
                    "size-5 mt-0.5 shrink-0",
                    starred.length ? "fill-amber-500 text-amber-500" : "text-stone",
                  )}
                />
                <div>
                  <h3 className="font-semibold text-ink">Kiểm tra từ vựng đã đánh dấu</h3>
                  <p className="mt-0.5 text-sm text-stone">
                    {starred.length
                      ? `Làm bài kiểm tra trắc nghiệm, ghép cặp hoặc gõ từ với ${starred.length} từ bạn đã lưu.`
                      : "Bạn chưa đánh dấu từ nào. Vào phần Từ vựng để đánh dấu ⭐ các từ cần kiểm tra riêng."}
                  </p>
                </div>
              </div>
              <Button
                tone="seal"
                disabled={starred.length === 0}
                onClick={() => navigate({ to: "/words", search: { lesson: "starred", mode: "list", at: 0 } })}
                className="self-start sm:self-center shrink-0"
              >
                Làm kiểm tra ({starred.length})
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!paper) {
    const units = examUnits(search.course);
    return (
      <div>
        <button type="button" className="text-sm text-stone hover:text-ink" onClick={() => setSearch({ course: "", bai: "" })}>
          Đổi môn
        </button>
        <h1 className="display mt-2 text-4xl">{search.course}</h1>
        <p className="mt-2 text-stone">Chọn một bài hoặc gộp nhiều bài. Câu vẫn về từ vựng, kanji và ngữ pháp của các bài đó, nhưng cách hỏi sẽ khác nhau.</p>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {units.map((unit) => {
            const on = selected.includes(unit.bai);
            return (
              <li key={unit.bai}>
                <button
                  type="button"
                  aria-pressed={on}
                  className="flex min-h-14 w-full items-center justify-between gap-3 py-3 text-left"
                  onClick={() => toggleBai(unit.bai)}
                >
                  <span className={cn("font-medium", on ? "text-ink" : "text-stone")}>{unit.label}</span>
                  <span className="text-sm text-stone tabular-nums">{on ? "Đã chọn" : `${unit.count} từ`}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <Button className="mt-4 w-full" tone="seal" disabled={selected.length === 0} onClick={start}>
          Làm {EXAM_SIZE} câu
          {selected.length ? ` · Bài ${selected.join(" + ")}` : ""}
        </Button>
        {note ? <p className="mt-3 text-sm text-seal">{note}</p> : null}
      </div>
    );
  }

  const done = closed || index >= paper.length;
  const correct = answers.filter((answer, answerIndex) => answer === paper[answerIndex]?.answer).length;

  if (done) {
    const missed = paper.filter((question, questionIndex) => answers[questionIndex] !== question.answer);
    return (
      <div>
        <p className="text-sm tracking-wide text-stone uppercase">Kết quả</p>
        <p className="display mt-2 text-5xl tabular-nums">
          {correct}
          <span className="text-2xl text-stone">/{paper.length}</span>
        </p>
        <p className="mt-2 text-stone">
          {search.course} · Bài {selected.join(", ")}
          {left === 0 ? " · Hết giờ" : ""}
        </p>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {(["Kanji", "Từ vựng", "Ngữ pháp"] as const).map((section) => {
            const rows = paper.map((question, questionIndex) => ({ question, questionIndex })).filter(({ question }) => question.section === section);
            if (!rows.length) return null;
            const hit = rows.filter(({ question, questionIndex }) => answers[questionIndex] === question.answer).length;
            return (
              <li key={section} className="flex items-center justify-between py-3 text-sm">
                <span>{section}</span>
                <span className="tabular-nums text-stone">
                  {hit}/{rows.length}
                </span>
              </li>
            );
          })}
        </ul>
        {missed.length ? (
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {missed.map((question) => (
              <li key={question.id} className="py-3">
                <p className="text-sm text-stone">
                  Câu {question.id} · {question.section}
                </p>
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
          <Button tone="ghost" onClick={() => setPaper(null)}>
            Đổi bài
          </Button>
          <Button tone="seal" onClick={start}>
            Làm đề khác
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
      <div className="mb-3 flex items-center justify-between text-sm text-stone">
        <span className="tabular-nums">
          Câu {index + 1} / {paper.length}
        </span>
        <span className={cn("tabular-nums", left < 300 && "text-seal")}>{formatTime(left)}</span>
      </div>
      <ProgressLine value={index} max={paper.length} />
      <p className="mt-5 text-sm text-stone">{current.section}</p>
      {current.promptJp ? <p className="jp mt-3 text-base leading-relaxed">{current.promptJp}</p> : null}
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
            {index + 1 === paper.length ? "Nộp bài" : "Tiếp"}
          </Button>
        </div>
      ) : (
        <button type="button" className="mt-4 text-sm text-stone hover:text-ink" onClick={() => setClosed(true)}>
          Nộp bài
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

function formatTime(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
