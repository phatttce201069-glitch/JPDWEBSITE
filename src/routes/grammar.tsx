import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Languages,
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
import { getOptionReading, getSentenceReading, hasKanji, isViToJpQuestion } from "@/lib/study/kana-reading";
import type { GrammarLesson, GrammarPoint, GrammarSearch } from "@/lib/study/types";
import { cn } from "@/lib/cn";
import { QuestionExplanationPanel } from "@/components/question-explanation";
import { VerbConjugationTable } from "@/components/verb-conjugation-table";

/**
 * Chuẩn hóa tham số query từ URL: loại bỏ các ký tự bọc ngoặc kép (%22 hoặc '"')
 * do URL encoding hoặc định dạng search serializer của TanStack Router.
 */
function cleanParam(value: unknown): string {
  if (typeof value !== "string") return "";
  let str = value.trim();
  if (str.includes("%22") || str.includes("%27")) {
    try {
      str = decodeURIComponent(str).trim();
    } catch {
      // bỏ qua nếu không decode được
    }
  }
  while (
    (str.startsWith('"') && str.endsWith('"')) ||
    (str.startsWith("'") && str.endsWith("'"))
  ) {
    str = str.slice(1, -1).trim();
  }
  return str;
}

function cleanGrammarSearch(search: Record<string, unknown>): GrammarSearch {
  const out: GrammarSearch = {};
  const lesson = cleanParam(search.lesson);
  const point = cleanParam(search.point);
  const drill = search.drill === true || search.drill === "true" || search.drill === "1";
  if (lesson) out.lesson = lesson;
  if (point) out.point = point;
  if (drill) out.drill = true;
  return out;
}

export const Route = createFileRoute("/grammar")({
  validateSearch: cleanGrammarSearch,
  component: GrammarPage,
});

function GrammarPage() {
  const rawSearch = Route.useSearch();
  const search = {
    lesson: cleanParam(rawSearch.lesson),
    point: cleanParam(rawSearch.point),
    drill: rawSearch.drill === true,
  };
  const navigate = useNavigate({ from: "/grammar" });
  const setLast = useStudy((state) => state.setLast);
  const [showReading, setShowReading] = useState(false);
  const [courseFilter, setCourseFilter] = useState<"all" | "JPD113" | "JPD123">("all");

  const found = search.point ? pointById(search.point) : null;
  const lesson = (search.lesson ? grammar.find((item) => item.id === search.lesson) : null) ?? found?.lesson ?? null;

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
      search: cleanGrammarSearch(search),
    });
  }, [search.lesson, search.point, search.drill, found?.point.structure_jp, found?.point.structure_vi, lesson?.title, setLast]);

  function setSearch(patch: Partial<GrammarSearch>) {
    void navigate({
      search: (prev) => cleanGrammarSearch({ ...prev, ...patch }),
    });
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

  // 2. Chế độ xem chi tiết 1 điểm ngữ pháp cụ thể (học nội dung lý thuyết)
  if (found) {
    const { point } = found;
    const pointIdx = found.lesson.points.findIndex((p) => p.id === point.id);
    const prevPoint = pointIdx > 0 ? found.lesson.points[pointIdx - 1] : null;
    const nextPoint = pointIdx < found.lesson.points.length - 1 ? found.lesson.points[pointIdx + 1] : null;

    return (
      <div>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm text-stone hover:text-ink cursor-pointer"
          onClick={() => setSearch({ point: "", drill: false })}
        >
          ← {found.lesson.title}
        </button>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-seal/10 px-2 py-0.5 text-xs font-semibold text-seal">
              Phần {pointIdx + 1} / {found.lesson.points.length}
            </span>
            <span className="text-xs text-stone">{found.lesson.subtitle}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-xs text-stone hover:text-ink underline-offset-2 hover:underline cursor-pointer"
              onClick={() => setShowReading((value) => !value)}
            >
              {showReading ? "Ẩn cách đọc" : "Hiện cách đọc ví dụ"}
            </button>
            <Button
              tone="ghost"
              className="text-xs px-2.5 py-1 min-h-8 inline-flex items-center gap-1"
              onClick={() => setSearch({ point: point.id, drill: true })}
            >
              <Target className="size-3 text-seal" />
              <span>Luyện phần này</span>
            </Button>
          </div>
        </div>

        <h1 className="jp mt-2 text-4xl leading-snug font-medium text-ink">{point.structure_jp}</h1>
        <p className="mt-2 text-lg text-stone font-medium">{point.structure_vi}</p>

        <dl className="mt-8 space-y-5">
          <div>
            <dt className="text-xs tracking-wide text-stone uppercase font-medium">Công thức mẫu câu</dt>
            <dd className="mt-1 font-mono text-sm bg-sheet px-4 py-3 rounded-lg border border-line text-ink">
              {point.formula}
            </dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-stone uppercase font-medium">Ý nghĩa & Cách dùng</dt>
            <dd className="mt-1 text-ink/90 leading-relaxed bg-sheet/40 p-4 rounded-lg border border-line/60">
              <p className="font-medium text-ink">{point.explanation}</p>
              {point.usage ? <p className="mt-2 text-sm text-stone">{point.usage}</p> : null}
            </dd>
          </div>
          {point.note ? (
            <div className="border-l-4 border-seal bg-seal/5 p-4 rounded-r-lg">
              <dt className="text-xs tracking-wide text-seal uppercase font-semibold">Lưu ý quan trọng</dt>
              <dd className="mt-1 text-sm text-ink leading-relaxed">{point.note}</dd>
            </div>
          ) : null}
        </dl>

        {point.conjugation_table ? (
          <VerbConjugationTable
            table={point.conjugation_table}
            onDrill={() => setSearch({ point: point.id, drill: true })}
            defaultShowReading={showReading}
          />
        ) : null}

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-sm tracking-wide text-stone uppercase font-semibold inline-flex items-center gap-2">
            <BookOpen className="size-4 text-seal" />
            Ví dụ minh họa
          </h2>
          <button
            type="button"
            className="text-xs text-stone hover:text-ink underline-offset-2 hover:underline cursor-pointer"
            onClick={() => setShowReading((value) => !value)}
          >
            {showReading ? "Ẩn Hiragana / Romaji" : "Hiện Hiragana / Romaji"}
          </button>
        </div>

        {point.examples.length === 0 ? (
          <p className="mt-3 text-stone">Mẫu này chưa có ví dụ.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {point.examples.map((example) => (
              <li key={example.jp} className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="jp text-xl font-medium text-ink">{example.jp}</p>
                  <button
                    type="button"
                    className="size-8 rounded-full border border-line bg-paper flex items-center justify-center text-stone hover:text-seal hover:border-seal shrink-0 cursor-pointer transition-colors"
                    aria-label="Nghe phát âm"
                    onClick={() => speakJapanese(example.jp)}
                  >
                    <Volume2 className="size-4" />
                  </button>
                </div>
                {showReading ? (
                  <p className="mt-1 text-sm text-stone">
                    <span className="font-mono text-ink/80">{example.reading}</span>
                    <span className="mt-0.5 block text-xs text-stone/80">{example.romaji}</span>
                  </p>
                ) : null}
                <p className="mt-2 text-ink font-medium">{example.vi}</p>
              </li>
            ))}
          </ul>
        )}

        {/* Khu vực Luyện tập bên trong trang nội dung ngữ pháp */}
        <div className="mt-10 rounded-2xl border border-seal/30 bg-seal/5 p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-seal uppercase tracking-wider inline-flex items-center gap-1.5">
                <Target className="size-4" />
                Luyện tập kiến thức vừa học
              </span>
              <h3 className="mt-1 text-base font-semibold text-ink">
                Đã nắm vững cấu trúc 「{point.structure_jp}」?
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-stone max-w-xl">
                Bắt đầu làm bài trắc nghiệm để củng cố công thức, cách chia và ý nghĩa của riêng phần này hoặc luyện tập toàn bộ Bài {found.lesson.id}.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
              <Button
                className="shadow-xs inline-flex items-center justify-center gap-2"
                tone="seal"
                onClick={() => setSearch({ point: point.id, drill: true })}
              >
                <Target className="size-4" />
                <span>Luyện tập phần này</span>
              </Button>
              <Button
                tone="ghost"
                onClick={() => setSearch({ point: "", drill: true })}
              >
                Luyện cả bài {found.lesson.id}
              </Button>
            </div>
          </div>
        </div>

        {/* Chuyển tiếp các phần học trong bài */}
        <div className="mt-6 pt-6 border-t border-line flex items-center justify-between gap-3 text-xs">
          {prevPoint ? (
            <button
              type="button"
              className="inline-flex items-center gap-1 text-stone hover:text-ink font-medium p-2 rounded-lg hover:bg-sheet cursor-pointer transition-colors"
              onClick={() => setSearch({ point: prevPoint.id, drill: false })}
            >
              ← Phần {pointIdx}: {prevPoint.structure_vi}
            </button>
          ) : <div />}
          {nextPoint ? (
            <button
              type="button"
              className="inline-flex items-center gap-1 text-seal hover:opacity-80 font-medium p-2 rounded-lg hover:bg-seal/10 cursor-pointer transition-colors"
              onClick={() => setSearch({ point: nextPoint.id, drill: false })}
            >
              Học tiếp: Phần {pointIdx + 2} ({nextPoint.structure_vi}) →
            </button>
          ) : (
            <button
              type="button"
              className="inline-flex items-center gap-1 text-stone hover:text-ink font-medium p-2 rounded-lg hover:bg-sheet cursor-pointer transition-colors"
              onClick={() => setSearch({ point: "", drill: false })}
            >
              Về danh sách bài học →
            </button>
          )}
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
          ← Tất cả bài ngữ pháp
        </button>
        <div className="mt-3 flex items-center gap-2">
          <span
            className={cn(
              "rounded px-2 py-0.5 text-xs font-mono font-medium border",
              Number(lesson.id) <= 3
                ? "bg-sky-500/10 text-sky-800 border-sky-500/30"
                : "bg-amber-500/10 text-amber-800 border-amber-500/30",
            )}
          >
            {Number(lesson.id) <= 3 ? "JPD113 · Tiếng Nhật 1" : "JPD123 · Tiếng Nhật 2"}
          </span>
          <p className="jp text-sm text-stone">{lesson.subtitle}</p>
        </div>
        <h1 className="display mt-1 text-4xl">{lesson.title}</h1>
        <p className="mt-3 text-stone leading-relaxed">{lesson.description}</p>

        {/* Banner bảng chia động từ nếu là Bài 7 */}
        {lesson.id === "7" ? (
          <div className="mt-6 rounded-xl border border-seal/30 bg-seal/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <BookOpen className="size-5 text-seal shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-seal">Bảng chia động từ thể て (23 động từ SGK)</p>
                <p className="text-xs text-stone mt-0.5">
                  Tổng hợp đầy đủ 3 nhóm động từ (1グループ, 2グループ, 3グループ) theo đúng bảng giáo trình Bài 7.
                </p>
              </div>
            </div>
            <Button
              tone="seal"
              className="shrink-0 text-xs shadow-xs"
              onClick={() => setSearch({ point: "7_1", drill: false })}
            >
              Xem bảng chia động từ →
            </Button>
          </div>
        ) : null}

        {/* Danh sách từng phần ngữ pháp để vào học */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-xs tracking-wider text-stone uppercase font-semibold inline-flex items-center gap-1.5">
            <BookOpen className="size-3.5 text-seal" />
            Nội dung ngữ pháp trong bài ({lesson.points.length} phần)
          </h2>
          <span className="text-xs text-stone">Bấm vào từng phần để học lý thuyết & ví dụ</span>
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
                  tone="seal"
                  className="shadow-xs min-h-9 px-3.5 py-1 text-xs inline-flex items-center gap-1.5"
                  onClick={() => setSearch({ point: point.id, drill: false })}
                >
                  <BookOpen className="size-3.5" />
                  <span>Vào học →</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>

        {/* Luyện tập tổng hợp sau khi học xong các phần */}
        <div className="mt-10 rounded-xl border border-line bg-sheet/60 p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-ink">Luyện tập tổng hợp cả bài</p>
              <p className="text-xs text-stone mt-0.5">
                Sau khi học xong toàn bộ lý thuyết các phần, hãy làm bài trắc nghiệm kết hợp cả {lesson.points.length} phần của Bài {lesson.id}.
              </p>
            </div>
            <Button
              tone="ghost"
              className="shrink-0 inline-flex items-center gap-1.5"
              onClick={() => setSearch({ point: "", drill: true })}
            >
              <Target className="size-3.5 text-seal" />
              <span>Bắt đầu luyện cả bài</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Màn hình mặc định: Danh sách tất cả bài ngữ pháp
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm tracking-[0.18em] text-stone uppercase font-medium">Ngữ pháp</p>
          <h1 className="display mt-2 text-4xl">Học mẫu câu & Ngữ pháp</h1>
          <p className="mt-2 max-w-lg text-stone">
            Bấm vào bất kỳ phần ngữ pháp nào bên dưới để học lý thuyết, công thức và ví dụ chi tiết. Sau khi học xong, bạn có thể tự chọn luyện tập ngay bên trong bài học.
          </p>
        </div>
      </div>

      {/* Course Filter Tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-line pb-3">
        <button
          type="button"
          onClick={() => setCourseFilter("all")}
          className={cn(
            "px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer",
            courseFilter === "all"
              ? "bg-ink text-paper"
              : "bg-sheet text-stone hover:text-ink border border-line",
          )}
        >
          Tất cả (Bài 1–7)
        </button>
        <button
          type="button"
          onClick={() => setCourseFilter("JPD113")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer",
            courseFilter === "JPD113"
              ? "bg-ink text-paper"
              : "bg-sheet text-stone hover:text-ink border border-line",
          )}
        >
          <span>JPD113 (Bài 1–3)</span>
          <span className="text-[11px] opacity-80">· Tiếng Nhật 1</span>
        </button>
        <button
          type="button"
          onClick={() => setCourseFilter("JPD123")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer",
            courseFilter === "JPD123"
              ? "bg-ink text-paper"
              : "bg-sheet text-stone hover:text-ink border border-line",
          )}
        >
          <span>JPD123 (Bài 4–7)</span>
          <span className="text-[11px] opacity-80">· Tiếng Nhật 2</span>
        </button>
      </div>

      {/* Thông báo hướng dẫn nhanh */}
      <div className="mt-4 rounded-xl border border-line bg-sheet/60 p-4 flex items-start gap-3">
        <BookOpen className="size-5 text-seal shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-ink">Nội dung ngữ pháp chuẩn giáo trình JPD113 & JPD123 FPT</p>
          <p className="text-stone mt-0.5">
            Bấm vào các ô phần ngữ pháp trong từng bài bên dưới để vào học lý thuyết, công thức cấu trúc câu và ví dụ thực tế. Nút luyện tập được tích hợp ngay bên trong mỗi bài học.
          </p>
        </div>
      </div>

      <ul className="mt-8 space-y-5">
        {grammar
          .filter((item) => {
            const num = Number(item.id);
            if (courseFilter === "JPD113") return num <= 3;
            if (courseFilter === "JPD123") return num >= 4;
            return true;
          })
          .map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-line bg-sheet/40 p-5 sm:p-6 transition-all hover:border-stone/40 shadow-2xs"
          >
            {/* Header bài học */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded px-2 py-0.5 text-xs font-mono font-medium border",
                      Number(item.id) <= 3
                        ? "bg-sky-500/10 text-sky-800 border-sky-500/30"
                        : "bg-amber-500/10 text-amber-800 border-amber-500/30",
                    )}
                  >
                    {Number(item.id) <= 3 ? "JPD113 · Tiếng Nhật 1" : "JPD123 · Tiếng Nhật 2"}
                  </span>
                  <span className="rounded bg-paper px-2 py-0.5 text-xs font-mono font-medium text-stone border border-line">
                    {item.subtitle}
                  </span>
                  <span className="text-xs text-stone">
                    {item.points.length} phần ngữ pháp
                  </span>
                </div>
                <button
                  type="button"
                  className="mt-2 text-left cursor-pointer group"
                  onClick={() => setSearch({ lesson: item.id, point: "", drill: false })}
                >
                  <h2 className="text-2xl font-medium text-ink group-hover:text-seal transition-colors">
                    {item.title}
                  </h2>
                </button>
                <p className="mt-1 text-sm text-stone leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Nút hành động chính của bài */}
              <div className="flex items-center gap-2 shrink-0 sm:self-start">
                <Button
                  tone="seal"
                  className="text-xs px-3.5 py-1.5 min-h-9 shadow-xs inline-flex items-center gap-1.5"
                  onClick={() => setSearch({ lesson: item.id, point: "", drill: false })}
                >
                  <BookOpen className="size-3.5" />
                  <span>Vào học bài này →</span>
                </Button>
              </div>
            </div>

            {/* Danh sách nội dung ngữ pháp các phần để bấm vào học */}
            <div className="mt-5 pt-4 border-t border-line/60">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-semibold text-stone uppercase tracking-wider inline-flex items-center gap-1.5">
                  <BookOpen className="size-3.5 text-seal" />
                  Nội dung ngữ pháp trong bài ({item.points.length} phần):
                </span>
                <span className="text-[11px] text-stone hidden sm:inline">
                  Bấm vào phần bạn muốn học
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {item.points.map((p, pIdx) => (
                  <button
                    key={p.id}
                    type="button"
                    title={`Học ngữ pháp phần ${pIdx + 1}: ${p.structure_vi} - ${p.structure_jp}`}
                    className="flex flex-col items-start gap-1.5 rounded-lg border border-line bg-paper p-3 text-left text-xs transition-all hover:border-seal hover:bg-seal/5 hover:shadow-xs cursor-pointer group"
                    onClick={() => setSearch({ lesson: item.id, point: p.id, drill: false })}
                  >
                    <div className="flex items-center justify-between w-full gap-1">
                      <span className="font-semibold text-ink group-hover:text-seal transition-colors line-clamp-1">
                        Phần {pIdx + 1}: {p.structure_vi}
                      </span>
                      <span className="shrink-0 inline-flex items-center gap-0.5 rounded bg-stone/10 px-1.5 py-0.5 text-[10px] font-medium text-stone group-hover:bg-seal group-hover:text-paper transition-colors">
                        <span>Học</span>
                        <ChevronRight className="size-2.5" />
                      </span>
                    </div>
                    <span className="jp text-xs font-medium text-stone group-hover:text-ink transition-colors truncate max-w-full">
                      {p.structure_jp}
                    </span>
                  </button>
                ))}
              </div>
            </div>
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
  const [showKana, setShowKana] = useState(true);
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
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-semibold tracking-wider text-stone uppercase">
                Các câu cần lưu ý ({missed.length} câu)
              </h3>
              <button
                type="button"
                onClick={() => setShowKana((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-sheet px-2.5 py-1 text-xs font-medium text-stone hover:text-ink hover:border-stone cursor-pointer transition-colors"
                title="Bật/tắt hiển thị chữ Hiragana / Katakana bên dưới câu hỏi"
              >
                <Languages className="size-3 text-seal" />
                <span>{showKana ? "Ẩn Hiragana" : "Hiện Hiragana"}</span>
              </button>
            </div>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {missed.map((question) => {
                const isMissedViToJp = isViToJpQuestion(question.sentence, question);
                return (
                  <li key={question.id} className="py-4">
                    <p className="text-xs font-mono text-stone">Câu {question.id}</p>
                    <p className="mt-1 text-sm font-medium">{question.prompt}</p>
                    <div className="mt-2">
                      <Sentence
                        text={question.sentence}
                        reading={!isMissedViToJp && showKana ? getSentenceReading(question.sentence, question) : null}
                        compact
                      />
                    </div>
                    <p className="mt-2 text-sm text-emerald-700">
                      Đáp án đúng: <span className="font-semibold">{question.answer}</span>
                    </p>
                    <QuestionExplanationPanel question={question} defaultOpen={true} compact />
                  </li>
                );
              })}
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

      {/* Cờ kiểm tra câu hỏi dạng dịch tiếng Việt -> tiếng Nhật */}
      {(() => {
        const isViToJp = isViToJpQuestion(current.sentence, current);
        return (
          <>
            <div className="mt-4 mb-3 flex items-center justify-between text-sm text-stone">
              <span className="tabular-nums font-medium">
                Câu {index + 1} / {paper.length}
              </span>
              <div className="flex items-center gap-2.5">
                {!isViToJp ? (
                  <button
                    type="button"
                    onClick={() => setShowKana((v) => !v)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-sheet px-2.5 py-1 text-xs font-medium text-stone hover:text-ink hover:border-stone cursor-pointer transition-colors"
                    title="Bật/tắt hiển thị chữ Hiragana / Katakana bên dưới câu hỏi"
                  >
                    <Languages className="size-3.5 text-seal" />
                    <span>{showKana ? "Ẩn Hiragana" : "Hiện Hiragana"}</span>
                  </button>
                ) : (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border border-line/60 bg-sheet/60 px-2.5 py-1 text-[11px] font-medium text-stone"
                    title="Câu hỏi từ tiếng Việt sang tiếng Nhật không hiển thị Hiragana để tránh làm lộ đáp án"
                  >
                    <Languages className="size-3 text-stone/70" />
                    <span>Ẩn Hiragana (tránh lộ đáp án)</span>
                  </span>
                )}
                <span className="text-xs">
                  {point ? point.structure_jp : "Toàn bộ bài"}
                </span>
              </div>
            </div>

            <ProgressLine value={index} max={paper.length} />

            {current.promptJp ? (
              <div className="mt-5">
                <p className="jp text-base leading-relaxed text-ink">{current.promptJp}</p>
                {!isViToJp && showKana && hasKanji(current.promptJp) ? (
                  <p className="jp text-xs text-stone mt-0.5">{getSentenceReading(current.promptJp)}</p>
                ) : null}
              </div>
            ) : null}
            <h1 className="mt-2 text-lg font-medium leading-snug">{current.prompt}</h1>

            <div className="mt-4 rounded-md border border-line bg-sheet px-5 py-6">
              <Sentence
                text={current.sentence}
                reading={!isViToJp && showKana ? getSentenceReading(current.sentence, current) : null}
              />
            </div>

            <div className="mt-3 grid gap-2">
              {current.options.map((option, optionIndex) => {
                const letter = String.fromCharCode(65 + optionIndex);
                const isAnswer = option === current.answer;
                const selectedOption = picked === option;
                // Tuyệt đối không hiển thị reading của đáp án cho câu hỏi dịch tiếng Việt sang tiếng Nhật
                const optReading = !isViToJp && showKana ? getOptionReading(option) : null;
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
                    <div className="min-w-0 flex-1">
                      <span className={cn("block break-words", /[ぁ-んァ-ヶ一-龯]/.test(option) && "jp text-lg")}>
                        {option}
                      </span>
                      {optReading && optReading !== option ? (
                        <span className={cn("jp block text-xs mt-0.5 font-normal", picked && isAnswer ? "text-white/90" : "text-stone")}>
                          {optReading}
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        );
      })()}

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

function Sentence({
  text,
  reading,
  compact = false,
}: {
  text: string;
  reading?: string | null;
  compact?: boolean;
}) {
  return (
    <div>
      <div className={cn("jp leading-loose text-ink", compact ? "text-base leading-relaxed" : "text-xl")}>
        {text.split("\n").map((line, lineIndex) => (
          <p key={lineIndex}>{renderLine(line)}</p>
        ))}
      </div>

      {reading && reading !== text ? (
        <div className="mt-3 pt-3 border-t border-line/60">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-seal uppercase tracking-wider mb-1">
            <Languages className="size-3" />
            <span>Cách đọc (Hiragana / Katakana):</span>
          </div>
          <div className={cn("jp leading-loose text-stone font-normal", compact ? "text-sm leading-relaxed" : "text-base")}>
            {reading.split("\n").map((line, lineIndex) => (
              <p key={lineIndex}>{renderLine(line)}</p>
            ))}
          </div>
        </div>
      ) : null}
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
