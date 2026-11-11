import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, BookOpen, Layers, CheckCircle2 } from "lucide-react";
import { generateReadingPassage } from "@/lib/study/reading-engine";
import { generateAiReadingPassage } from "@/lib/study/reading-ai";
import { ReadingViewer } from "@/components/reading-viewer";
import { ReadingQuiz } from "@/components/reading-quiz";
import type { ReadingCourse, ReadingPassage } from "@/lib/study/reading-types";

interface ReadingSearch {
  course?: ReadingCourse;
}

export const Route = createFileRoute("/reading")({
  validateSearch: (search: Record<string, unknown>): ReadingSearch => {
    const course = search.course === "JPD113" || search.course === "JPD123" ? search.course : "JPD113";
    return { course };
  },
  component: ReadingPage,
});

function ReadingPage() {
  const search = Route.useSearch();
  const [course, setCourse] = useState<ReadingCourse>(search.course || "JPD113");
  const [passage, setPassage] = useState<ReadingPassage>(() => generateReadingPassage(search.course || "JPD113"));
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Cập nhật bài đọc khi đổi môn học
  useEffect(() => {
    const newPassage = generateReadingPassage(course);
    setPassage(newPassage);
    setNotification(null);
  }, [course]);

  // Sinh bài đọc ngẫu nhiên mới từ kho đề chống trùng lặp
  function handleGenerateNew() {
    const next = generateReadingPassage(course, { excludeId: passage.id });
    setPassage(next);
    setNotification("Đã tải bài đọc mới chống trùng lặp!");
    setTimeout(() => setNotification(null), 2500);
  }

  // Gọi AI sinh bài đọc
  async function handleGenerateAi() {
    setIsGenerating(true);
    setNotification(null);
    try {
      const result = await generateAiReadingPassage(course);
      setPassage(result.passage);
      if (result.error) {
        setNotification(result.error);
      } else {
        setNotification(`Đã tạo bài đọc thành công qua ${result.provider}!`);
      }
    } catch {
      const fallback = generateReadingPassage(course, { excludeId: passage.id });
      setPassage(fallback);
      setNotification("Đã kích hoạt bài đọc thay thế chuẩn FPT.");
    } finally {
      setIsGenerating(false);
      setTimeout(() => setNotification(null), 3000);
    }
  }

  return (
    <div className="space-y-8">
      {/* Phần tiêu đề trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-[0.16em] text-stone uppercase">
              Luyện thi đọc hiểu
            </span>
            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              Đọc hiểu FPT
            </span>
          </div>
          <h1 className="display mt-1 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Luyện thi đọc (読解)
          </h1>
          <p className="mt-1 text-sm text-stone max-w-xl">
            Bài đọc chỉ sử dụng từ vựng và chữ Hán trong chương trình học. Tích hợp đọc phát âm,
            hiển thị Romaji và ấn đúp vào chữ để tra cách đọc tức thì.
          </p>
        </div>

        {/* Nút chọn môn học JPD113 / JPD123 */}
        <div className="flex items-center gap-1.5 rounded-xl border border-line bg-paper p-1 self-start sm:self-center shadow-xs">
          <button
            type="button"
            onClick={() => setCourse("JPD113")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
              course === "JPD113"
                ? "bg-ink text-paper shadow-xs"
                : "text-stone hover:text-ink"
            }`}
          >
            <span>JPD113 (Bài 1–3)</span>
          </button>
          <button
            type="button"
            onClick={() => setCourse("JPD123")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
              course === "JPD123"
                ? "bg-ink text-paper shadow-xs"
                : "text-stone hover:text-ink"
            }`}
          >
            <span>JPD123 (Bài 4–7)</span>
          </button>
        </div>
      </div>

      {/* Thông tin chuẩn đầu ra môn học */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
        <div className="flex items-start gap-2.5 rounded-xl border border-line/70 bg-surface p-3.5">
          <Layers className="size-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="font-semibold text-ink block">Độ dài chuẩn đề thi</span>
            <span className="text-stone">
              {course === "JPD113"
                ? "Bài ngắn (80–130 chữ, 3–5 câu) phù hợp sơ cấp"
                : "Dài hơn một chút (150–240 chữ, 5–8 câu) chuẩn JPD123 FPT"}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-line/70 bg-surface p-3.5">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
          <div>
            <span className="font-semibold text-ink block">Từ vựng & Kanji trong bài</span>
            <span className="text-stone">
              100% bám sát giáo trình, tuyệt đối không dùng từ ngoài bài.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-line/70 bg-surface p-3.5">
          <BookOpen className="size-4 shrink-0 text-indigo-600 mt-0.5" />
          <div>
            <span className="font-semibold text-ink block">Hỗ trợ phát âm & Romaji</span>
            <span className="text-stone">
              Nghe phát âm chuẩn, bật/tắt Romaji hoặc nhấp đúp chữ để tra.
            </span>
          </div>
        </div>
      </div>

      {/* Thông báo cập nhật */}
      {notification && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-medium text-emerald-800 animate-in fade-in">
          {notification}
        </div>
      )}

      {/* Khung chức năng bài đọc và câu hỏi */}
      <div className="space-y-6">
        {/* Component Hiển thị bài đọc tương tác */}
        <ReadingViewer passage={passage} />

        {/* Thanh công cụ sinh bài đọc mới */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line/80 bg-paper/60 p-4">
          <div className="text-xs text-stone">
            Đang hiển thị đề đọc: <strong>{passage.title}</strong> ({passage.theme})
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateNew}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3.5 py-1.5 text-xs font-medium text-stone hover:text-ink hover:border-ink/40 transition-all shadow-xs"
            >
              <RefreshCw className="size-3.5" />
              <span>Đổi bài đọc khác</span>
            </button>

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateAi}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold text-paper shadow-xs transition-all ${
                isGenerating ? "bg-ink/70 animate-pulse" : "bg-ink hover:bg-ink/90"
              }`}
            >
              <Sparkles className="size-3.5 text-amber-400" />
              <span>{isGenerating ? "AI đang soạn bài..." : "AI tạo bài đọc mới"}</span>
            </button>
          </div>
        </div>

        {/* Component Câu hỏi trắc nghiệm đọc hiểu A-D */}
        <ReadingQuiz passage={passage} onNextPassage={handleGenerateNew} />
      </div>
    </div>
  );
}
