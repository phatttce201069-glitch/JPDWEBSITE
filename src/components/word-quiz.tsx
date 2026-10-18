import { useEffect, useRef, useState } from "react";
import { Star, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressLine } from "@/components/progress-line";
import { shuffle } from "@/lib/study/content";
import { kanaReading, romajiOf, sameMeaning, sameReading, speakable } from "@/lib/study/romaji";
import { useStudy } from "@/lib/study/store";
import { speakJapanese } from "@/lib/study/speech";
import type { Word } from "@/lib/study/types";
import { cn } from "@/lib/cn";

type FormId = "meaning" | "word" | "listen" | "reading" | "write" | "match" | "mix";

const FORMS: { id: FormId; title: string; note: string }[] = [
  { id: "meaning", title: "Chọn nghĩa", note: "Nhìn từ, chọn nghĩa tiếng Việt." },
  { id: "word", title: "Chọn từ", note: "Nhìn nghĩa, chọn từ tiếng Nhật." },
  { id: "listen", title: "Nghe rồi chọn", note: "Nghe phát âm, chọn từ đúng." },
  { id: "reading", title: "Gõ cách đọc", note: "Gõ hiragana hoặc romaji." },
  { id: "write", title: "Gõ nghĩa", note: "Nhớ và gõ nghĩa tiếng Việt." },
  { id: "match", title: "Ghép cặp", note: "Nối từng từ với nghĩa của nó." },
  { id: "mix", title: "Hỗn hợp", note: "Xen kẽ các dạng trong một lượt." },
];

const DRILL = ["meaning", "word", "listen", "reading", "write"] as const;

type ChoiceOption = {
  text: string;
  reading?: string;
};

type ChoiceQ = {
  id: string;
  wordId: number;
  kind: "choice";
  label: string;
  prompt: string;
  promptJp: boolean;
  reading?: string;
  speak?: string;
  autoSpeak?: boolean;
  answer: string;
  options: ChoiceOption[];
  optionJp: boolean;
};

type TypeQ = {
  id: string;
  wordId: number;
  kind: "type";
  label: string;
  prompt: string;
  promptJp: boolean;
  reading?: string;
  speak?: string;
  placeholder: string;
  reveal: string;
  accept: (value: string) => boolean;
};

type Question = ChoiceQ | TypeQ;

export function WordQuiz({
  words,
  onExit,
  pool = "lesson",
}: {
  words: Word[];
  onExit: () => void;
  pool?: "lesson" | "starred";
}) {
  const [form, setForm] = useState<FormId | null>(null);
  const starred = pool === "starred";

  if (!form) {
    return (
      <section>
        <p className="text-sm text-stone">
          {starred ? "Chọn một cách làm. Mỗi lượt chỉ lấy từ đã đánh dấu." : "Chọn một cách làm. Mỗi lượt lấy từ trong bài này."}
        </p>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {FORMS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="flex min-h-14 w-full flex-col items-start justify-center py-3 text-left"
                onClick={() => setForm(item.id)}
              >
                <span className="font-medium">{item.title}</span>
                <span className="text-sm text-stone">{item.note}</span>
              </button>
            </li>
          ))}
        </ul>
        <Button className="mt-4" tone="ghost" onClick={onExit}>
          Quay lại luyện
        </Button>
      </section>
    );
  }

  if (words.length < 2) {
    return (
      <section className="rounded-md border border-line bg-sheet p-6">
        <p className="text-stone">
          {starred
            ? "Cần ít nhất hai từ để tạo các dạng bài kiểm tra (trắc nghiệm, ghép cặp). Hãy quay lại danh sách để chọn thêm từ."
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
    return <MatchQuiz words={words} onBack={() => setForm(null)} />;
  }

  return <DrillQuiz key={form} form={form} words={words} onBack={() => setForm(null)} />;
}

function DrillQuiz({ form, words, onBack }: { form: Exclude<FormId, "match">; words: Word[]; onBack: () => void }) {
  const [questions] = useState(() => buildQuestions(words, form));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [correct, setCorrect] = useState(0);
  const starred = useStudy((state) => state.starred);
  const toggleStar = useStudy((state) => state.toggleStar);

  const current = questions[index];
  const done = index >= questions.length;
  const answered = !!current && (current.kind === "choice" ? picked !== null : verdict !== null);
  const nextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (current?.kind === "choice" && current.autoSpeak && current.speak) speakJapanese(current.speak);
  }, [current]);

  useEffect(() => {
    if (!answered) return;
    nextRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [answered, index]);

  if (questions.length === 0 || done || !current) {
    return (
      <section className="rounded-md border border-line bg-sheet px-6 py-10 text-center">
        <p className="text-sm tracking-wide text-stone uppercase">Kết quả</p>
        <p className="display mt-2 text-5xl text-ink tabular-nums">
          {correct}
          <span className="text-2xl text-stone">/{questions.length}</span>
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button tone="ghost" onClick={onBack}>
            Cách khác
          </Button>
          <Button
            tone="seal"
            onClick={() => {
              setIndex(0);
              setPicked(null);
              setTyped("");
              setVerdict(null);
              setCorrect(0);
            }}
          >
            Làm lại
          </Button>
        </div>
      </section>
    );
  }

  function grade(value: string) {
    if (current?.kind !== "type" || verdict !== null) return;
    const ok = current.accept(value);
    setVerdict(ok);
    if (ok) setCorrect((count) => count + 1);
  }

  const marked = starred.includes(current.wordId);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between text-sm text-stone">
        <span className="tabular-nums">
          {index + 1} / {questions.length}
        </span>
        <span className="flex items-center gap-1">
          <button
            type="button"
            className="flex size-11 items-center justify-center"
            aria-label={marked ? "Bỏ đánh dấu" : "Đánh dấu"}
            aria-pressed={marked}
            onClick={() => toggleStar(current.wordId)}
          >
            <Star className={cn("size-5 transition-transform active:scale-125", marked ? "fill-amber-500 text-amber-500" : "text-stone hover:text-ink")} />
          </button>
          <button type="button" className="min-h-11 underline-offset-2 hover:underline" onClick={onBack}>
            Cách khác
          </button>
        </span>
      </div>
      <ProgressLine value={index} max={questions.length} />
      <p className="mt-5 text-sm tracking-wide text-stone uppercase">{current.label}</p>
      <div className="mt-2 rounded-md border border-line bg-sheet px-5 py-8 text-center">
        <p className={cn("text-balance break-words text-ink", promptClass(current.prompt, current.promptJp))}>{current.prompt}</p>
        {current.reading ? <p className={cn("mt-3 text-stone", current.prompt.length > 8 ? "text-base" : "text-xl")}>{current.reading}</p> : null}
        {current.speak ? (
          <button
            type="button"
            className="mx-auto mt-4 flex min-h-11 items-center gap-2 text-sm text-stone hover:text-ink"
            onClick={() => speakJapanese(current.speak || "")}
          >
            <Volume2 className="size-4" />
            Nghe
          </button>
        ) : null}
      </div>

      {current.kind === "choice" ? (
        <div className="mt-3 grid gap-2">
          {current.options.map((option, optionIndex) => {
            const isAnswer = option.text === current.answer;
            const selected = picked === option.text;
            let tone = "border-line bg-sheet text-ink hover:border-stone";
            if (picked && isAnswer) tone = "border-ink bg-ink text-paper";
            else if (selected && !isAnswer) tone = "border-seal bg-seal/10 text-seal";
            const readingTone = picked && isAnswer ? "text-paper/80" : selected && !isAnswer ? "text-seal" : "text-stone";
            return (
              <button
                key={`${option.text}-${optionIndex}`}
                type="button"
                disabled={picked !== null}
                onClick={() => {
                  if (picked) return;
                  setPicked(option.text);
                  if (option.text === current.answer) setCorrect((count) => count + 1);
                }}
                className={cn("min-h-12 break-words rounded-md border px-4 py-3 text-left text-base transition-colors", tone)}
              >
                <span className={cn("block", current.optionJp && "jp text-xl leading-tight")}>{option.text}</span>
                {option.reading ? <span className={cn("mt-0.5 block text-sm", readingTone)}>{option.reading}</span> : null}
              </button>
            );
          })}
        </div>
      ) : (
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
            placeholder={current.placeholder}
            className="min-h-12 w-full rounded-md border border-line bg-sheet px-4 text-base text-ink outline-none focus-visible:border-ink"
            aria-label={current.placeholder}
          />
          {verdict === null ? (
            <Button className="mt-2 w-full" tone="seal" disabled={!typed.trim()} onClick={() => grade(typed)}>
              Kiểm tra
            </Button>
          ) : null}
        </form>
      )}

      {answered ? (
        <div className="mt-4">
          <p className="text-sm text-stone" role="status">
            {current.kind === "choice"
              ? picked === current.answer
                ? "Đúng."
                : "Đáp án hiện ở ô đậm."
              : verdict
                ? `Đúng. ${current.reveal}`
                : `Đáp án: ${current.reveal}`}
          </p>
          <div ref={nextRef} className="mt-3 scroll-mb-36">
            <Button
              className="w-full"
              tone="seal"
              onClick={() => {
                setPicked(null);
                setTyped("");
                setVerdict(null);
                setIndex((value) => value + 1);
              }}
            >
              Tiếp
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function MatchQuiz({ words, onBack }: { words: Word[]; onBack: () => void }) {
  const [rounds] = useState(() => matchRounds(words));
  const [round, setRound] = useState(0);
  const [solved, setSolved] = useState<number[]>([]);
  const [selected, setSelected] = useState<{ side: "word" | "mean"; id: number } | null>(null);
  const [misses, setMisses] = useState(0);
  const [flash, setFlash] = useState(false);
  const [order] = useState(() => rounds.map((group) => shuffle(group.map((word) => word.id))));
  const advanceTimer = useRef<number | null>(null);

  const group = rounds[round];
  const finished = round >= rounds.length;

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

  if (rounds.length === 0 || !group || finished) {
    const pairs = rounds.reduce((sum, item) => sum + item.length, 0);
    return (
      <section className="rounded-md border border-line bg-sheet px-6 py-10 text-center">
        <p className="text-sm tracking-wide text-stone uppercase">Kết quả</p>
        <p className="display mt-2 text-4xl text-ink">{pairs} cặp</p>
        <p className="mt-2 text-stone">{misses === 0 ? "Không ghép nhầm lần nào." : `${misses} lần ghép nhầm.`}</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button tone="ghost" onClick={onBack}>
            Cách khác
          </Button>
          <Button
            tone="seal"
            onClick={() => {
              setRound(0);
              setSolved([]);
              setSelected(null);
              setMisses(0);
            }}
          >
            Làm lại
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
        <span className="tabular-nums">
          Lượt {round + 1} / {rounds.length}
        </span>
        <button type="button" className="underline-offset-2 hover:underline" onClick={onBack}>
          Cách khác
        </button>
      </div>
      <ProgressLine value={solved.length} max={group.length} />
      <p className="mt-5 text-sm text-stone">Chọn một từ, rồi chọn nghĩa của nó.</p>
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
                "inline-flex min-h-11 flex-col items-center justify-center rounded-md border px-3 py-1.5",
                donePair && "border-line text-stone",
                active && "border-ink bg-ink text-paper",
                !donePair && !active && "border-line bg-sheet text-ink",
              )}
            >
              <span className="jp text-xl leading-tight">{word.word}</span>
              {reading ? <span className={cn("text-xs leading-tight", active ? "text-paper/80" : "text-stone")}>{reading}</span> : null}
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
                "min-h-12 break-words rounded-md border px-4 py-3 text-left",
                donePair && "border-line text-stone",
                active && "border-ink bg-ink text-paper",
                !donePair && !active && "border-line bg-sheet text-ink",
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
  if (!japanese) return text.length > 32 ? "text-2xl" : "display text-3xl";
  if (text.length > 14) return "jp text-2xl font-medium leading-snug";
  if (text.length > 8) return "jp text-4xl font-medium";
  return "jp text-5xl font-medium";
}

function shownReading(word: Word) {
  const kana = kanaReading(word);
  if (!kana) return undefined;
  const surface = word.word.replace(/\s+/g, "");
  if (kana.replace(/\s+/g, "") === surface) return undefined;
  return kana;
}

function buildQuestions(words: Word[], form: Exclude<FormId, "match">): Question[] {
  const sample = shuffle(words).slice(0, Math.min(8, words.length));
  return sample.map((word, index) => {
    const kind = form === "mix" ? DRILL[index % DRILL.length]! : form;
    return questionFor(word, words, kind);
  });
}

function questionFor(word: Word, words: Word[], kind: Exclude<FormId, "match" | "mix">): Question {
  const label = FORMS.find((item) => item.id === kind)?.title ?? "Kiểm tra";
  const surface = word.word;
  const voice = speakable(word);
  const reading = kind === "reading" ? undefined : shownReading(word);
  if (kind === "reading") {
    const kana = kanaReading(word);
    const romaji = romajiOf(word);
    return {
      id: `${word.id}-reading`,
      wordId: word.id,
      kind: "type",
      label,
      prompt: surface,
      promptJp: true,
      speak: voice,
      placeholder: "Hiragana hoặc romaji",
      reveal: [kana, romaji].filter(Boolean).join(" · "),
      accept: (value) => sameReading(value, word.reading, surface, kana, romaji),
    };
  }
  if (kind === "write") {
    return {
      id: `${word.id}-write`,
      wordId: word.id,
      kind: "type",
      label,
      prompt: surface,
      promptJp: true,
      reading,
      speak: voice,
      placeholder: "Nghĩa tiếng Việt",
      reveal: word.meaning,
      accept: (value) => sameMeaning(value, word.meaning),
    };
  }
  if (kind === "word" || kind === "listen") {
    const options = optionsFor(
      { text: surface, reading: shownReading(word) },
      words.filter((item) => item.id !== word.id).map((item) => ({ text: item.word, reading: shownReading(item) })),
    );
    return {
      id: `${word.id}-${kind}`,
      wordId: word.id,
      kind: "choice",
      label,
      prompt: kind === "listen" ? "Nghe và chọn từ" : word.meaning,
      promptJp: false,
      speak: voice,
      autoSpeak: kind === "listen",
      answer: surface,
      options,
      optionJp: true,
    };
  }
  const options = optionsFor(
    { text: word.meaning },
    words.filter((item) => item.id !== word.id && item.meaning !== word.meaning).map((item) => ({ text: item.meaning })),
  );
  return {
    id: `${word.id}-meaning`,
    wordId: word.id,
    kind: "choice",
    label,
    prompt: surface,
    promptJp: true,
    reading,
    speak: voice,
    answer: word.meaning,
    options,
    optionJp: false,
  };
}

function optionsFor(answer: ChoiceOption, pool: ChoiceOption[]) {
  const unique: ChoiceOption[] = [];
  const seen = new Set<string>([answer.text]);
  for (const item of shuffle(pool)) {
    if (!item.text || seen.has(item.text)) continue;
    seen.add(item.text);
    unique.push(item);
    if (unique.length === 3) break;
  }
  return shuffle([answer, ...unique]);
}

function matchRounds(words: Word[]) {
  const shuffled = shuffle(words);
  const rounds: Word[][] = [];
  const used = new Set<number>();
  while (rounds.length < 2) {
    const group: Word[] = [];
    const meanings = new Set<string>();
    for (const word of shuffled) {
      if (used.has(word.id) || meanings.has(word.meaning)) continue;
      meanings.add(word.meaning);
      group.push(word);
      if (group.length === 5) break;
    }
    if (group.length < 2) break;
    group.forEach((word) => used.add(word.id));
    rounds.push(group);
  }
  return rounds;
}
