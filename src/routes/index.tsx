import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { alphabet, grammar, vocabulary } from "@/lib/study/content";
import { useStudy } from "@/lib/study/store";
import type { LastPlace } from "@/lib/study/types";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const hydrated = useStudy((state) => state.hydrated);
  const knownKana = useStudy((state) => state.knownKana);
  const knownWords = useStudy((state) => state.knownWords);
  const last = useStudy((state) => state.last);
  const grammarCount = grammar.reduce((sum, lesson) => sum + lesson.points.length, 0);
  const [serverLine, setServerLine] = useState<string | null>(null);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    void fetch("/api/catalog")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { glyphs?: number; words?: number; stack?: string } | null) => {
        if (!data?.stack) return;
        setServerLine(`${data.stack} · ${data.glyphs} chữ · ${data.words} từ`);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div>
      <p className="text-sm tracking-[0.18em] text-stone uppercase">Bàn học tiếng Nhật</p>
      <h1 className="display mt-3 text-5xl leading-none text-ink">Một việc mỗi lúc.</h1>
      <p className="mt-4 max-w-md text-lg text-stone">
        Chọn một phần. Học đến khi nhớ, rồi kiểm tra. Không có gì thừa trên màn hình.
      </p>
      {serverLine ? <p className="mt-3 text-sm text-stone">{serverLine}</p> : null}

      {hydrated && last ? <Continue last={last} /> : null}

      <ul className="mt-8 divide-y divide-line border-y border-line">
        <li>
          <Link
            to="/kana"
            search={{ script: "hiragana", row: "", mode: "chart", at: 0 }}
            className="group flex items-center gap-4 py-5"
          >
            <Door
              kicker="01"
              title="Bảng chữ cái"
              detail="Hiragana, katakana, kanji — học theo hàng."
              meta={hydrated ? `${knownKana.length}/${alphabet.length} đã nhớ` : `${alphabet.length} chữ`}
            />
          </Link>
        </li>
        <li>
          <Link
            to="/words"
            search={{ lesson: "", mode: "list", at: 0 }}
            className="group flex items-center gap-4 py-5"
          >
            <Door
              kicker="02"
              title="Từ vựng"
              detail="JPD113 và JPD123, từng bài một."
              meta={hydrated ? `${knownWords.length}/${vocabulary.length} đã nhớ` : `${vocabulary.length} từ`}
            />
          </Link>
        </li>
        <li>
          <Link to="/grammar" search={{ lesson: "", point: "", drill: false }} className="group flex items-center gap-4 py-5">
            <Door kicker="03" title="Ngữ pháp" detail="Mẫu câu, ví dụ, luyện riêng từng phần hoặc cả bài." meta={`${grammarCount} mẫu`} />
          </Link>
        </li>
        <li>
          <Link to="/exam" search={{ course: "", bai: "" }} className="group flex items-center gap-4 py-5">
            <Door kicker="04" title="Kiểm tra" detail="30 câu A–D. Kanji, từ vựng, ngữ pháp — nhiều cách hỏi trong một đề." meta="30 câu" />
          </Link>
        </li>
      </ul>
    </div>
  );
}

function Door({ kicker, title, detail, meta }: { kicker: string; title: string; detail: string; meta: string }) {
  return (
    <>
      <span className="display w-10 text-stone">{kicker}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-xl font-medium">{title}</span>
        <span className="mt-1 block text-sm text-stone">{detail}</span>
      </span>
      <span className="hidden text-sm text-stone sm:block">{meta}</span>
      <ChevronRight className="size-5 shrink-0 text-stone transition-transform duration-150 group-hover:translate-x-0.5" />
    </>
  );
}

function Continue({ last }: { last: LastPlace }) {
  const body = (
    <>
      <span>
        <span className="block text-xs tracking-wide text-stone uppercase">Tiếp tục</span>
        <span className="mt-1 block font-medium">{last.label}</span>
      </span>
      <ChevronRight className="size-5 text-stone" />
    </>
  );
  const className = "mt-8 flex items-center justify-between rounded-md border border-line bg-sheet px-4 py-4";
  if (last.to === "/kana") {
    return (
      <Link to="/kana" search={last.search} className={className}>
        {body}
      </Link>
    );
  }
  if (last.to === "/words") {
    return (
      <Link to="/words" search={last.search} className={className}>
        {body}
      </Link>
    );
  }
  if (last.to === "/grammar") {
    return (
      <Link to="/grammar" search={last.search} className={className}>
        {body}
      </Link>
    );
  }
  return (
    <Link to="/exam" search={last.search} className={className}>
      {body}
    </Link>
  );
}
