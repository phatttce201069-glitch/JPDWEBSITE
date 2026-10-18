import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressLine } from "@/components/progress-line";
import { speakJapanese } from "@/lib/study/speech";
import { cn } from "@/lib/cn";

export type QuizItem = {
  id: string;
  prompt: string;
  hint?: string;
  speak?: string;
  answer: string;
  options: string[];
  promptIsJapanese?: boolean;
};

export function QuizPanel({ items, onExit }: { items: QuizItem[]; onExit: () => void }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const nextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!picked) return;
    nextRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [picked, index]);

  if (items.length === 0) {
    return (
      <section className="rounded-md border border-line bg-sheet p-6">
        <p className="text-stone">Chưa đủ nội dung để kiểm tra.</p>
        <Button className="mt-4" tone="ghost" onClick={onExit}>
          Quay lại
        </Button>
      </section>
    );
  }

  const done = index >= items.length;
  const current = items[index];

  if (done || !current) {
    return (
      <section className="rounded-md border border-line bg-sheet px-6 py-10 text-center">
        <p className="text-sm tracking-wide text-stone uppercase">Kết quả</p>
        <p className="display mt-2 text-5xl text-ink tabular-nums">
          {correct}
          <span className="text-2xl text-stone">/{items.length}</span>
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button tone="ghost" onClick={onExit}>
            Xong
          </Button>
          <Button
            tone="seal"
            onClick={() => {
              setIndex(0);
              setPicked(null);
              setCorrect(0);
            }}
          >
            Làm lại
          </Button>
        </div>
      </section>
    );
  }

  function choose(option: string) {
    if (picked || !current) return;
    setPicked(option);
    if (option === current.answer) setCorrect((value) => value + 1);
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between text-sm text-stone">
        <span className="tabular-nums">
          {index + 1} / {items.length}
        </span>
        <button type="button" className="underline-offset-2 hover:underline" onClick={onExit}>
          Thoát
        </button>
      </div>
      <ProgressLine value={index} max={items.length} />
      <div className="mt-6 rounded-md border border-line bg-sheet px-5 py-8 text-center">
        <p className={cn("text-ink", current.promptIsJapanese ? "jp text-6xl font-medium" : "display text-4xl")}>
          {current.prompt}
        </p>
        {current.hint ? <p className="mt-3 text-sm text-stone">{current.hint}</p> : null}
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
      <div className="mt-3 grid gap-2">
        {current.options.map((option) => {
          const isAnswer = option === current.answer;
          const selected = picked === option;
          let tone = "border-line bg-sheet text-ink hover:border-stone";
          if (picked && isAnswer) tone = "border-ink bg-ink text-paper";
          else if (selected && !isAnswer) tone = "border-seal bg-seal/10 text-seal";
          return (
            <button
              key={option}
              type="button"
              disabled={picked !== null}
              onClick={() => choose(option)}
              className={cn("min-h-12 rounded-md border px-4 py-3 text-left text-base transition-colors", tone)}
            >
              {option}
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
            Tiếp
          </Button>
        </div>
      ) : null}
    </section>
  );
}
