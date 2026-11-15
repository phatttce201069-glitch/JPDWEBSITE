import { useState, useRef, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Lightbulb,
  Mic,
  Square,
  Play,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  MessageSquare,
  Image as ImageIcon,
} from "lucide-react";
import type { SpeakingQuestion } from "@/lib/study/speaking-types";
import { speakJapanese, stopJapaneseSpeech } from "@/lib/study/speech";

export interface SpeakingQuestionCardProps {
  question: SpeakingQuestion;
  index: number;
  isCompleted?: boolean;
  onToggleComplete?: () => void;
}

export function SpeakingQuestionCard({
  question,
  index,
  isCompleted = false,
  onToggleComplete,
}: SpeakingQuestionCardProps) {
  const [showQuestionText, setShowQuestionText] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false);
  const [isPlayingAnswer, setIsPlayingAnswer] = useState(false);

  // Trạng thái ghi âm
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      stopJapaneseSpeech();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  function handlePlayQuestion() {
    stopJapaneseSpeech();
    setIsPlayingAnswer(false);
    setIsPlayingQuestion(true);
    speakJapanese(question.questionJp, {
      rate: 0.9,
      onEnd: () => setIsPlayingQuestion(false),
      onError: () => setIsPlayingQuestion(false),
    });
  }

  function handlePlayAnswer() {
    stopJapaneseSpeech();
    setIsPlayingQuestion(false);
    setIsPlayingAnswer(true);
    speakJapanese(question.sampleAnswerJp, {
      rate: 0.88,
      onEnd: () => setIsPlayingAnswer(false),
      onError: () => setIsPlayingAnswer(false),
    });
  }

  // Bắt đầu / Dừng ghi âm giọng nói người dùng
  async function handleToggleRecording() {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Trình duyệt của bạn chưa hỗ trợ ghi âm micro.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        const newUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(newUrl);
        // Tắt tất cả micro tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn("Không thể truy cập Microphone:", err);
      alert("Vui lòng cho phép quyền truy cập Micro trên trình duyệt để ghi âm luyện nói.");
    }
  }

  const isPicture = question.type === "in_picture";

  return (
    <div
      className={`rounded-2xl border transition-all p-5 shadow-xs space-y-4 ${
        isCompleted
          ? "border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/20"
          : "border-line/80 bg-sheet"
      }`}
    >
      {/* Header câu hỏi */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/50 pb-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
              isPicture
                ? "bg-amber-500/10 text-amber-800 border border-amber-500/20"
                : "bg-indigo-500/10 text-indigo-800 border border-indigo-500/20"
            }`}
          >
            {isPicture ? <ImageIcon className="size-3" /> : <MessageSquare className="size-3" />}
            <span>{isPicture ? `Câu hỏi trong tranh #${index + 1}` : `Câu hỏi mở rộng #${index + 1}`}</span>
          </span>

          {question.grammarPoint && (
            <span className="hidden sm:inline-block rounded-md bg-stone/10 px-2 py-0.5 text-[11px] font-medium text-stone">
              {question.grammarPoint}
            </span>
          )}
        </div>

        {/* Nút đánh dấu đã luyện xong */}
        {onToggleComplete && (
          <button
            type="button"
            onClick={onToggleComplete}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              isCompleted
                ? "bg-emerald-600 text-white shadow-xs"
                : "border border-line bg-paper text-stone hover:text-ink"
            }`}
          >
            <CheckCircle2 className="size-3.5" />
            <span>{isCompleted ? "Đã luyện xong" : "Đánh dấu xong"}</span>
          </button>
        )}
      </div>

      {/* Thanh phát âm câu hỏi & nút bấm hành động */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-paper/70 rounded-xl p-3 border border-line/60">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePlayQuestion}
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-all shadow-sm cursor-pointer ${
              isPlayingQuestion
                ? "bg-amber-500 text-white animate-pulse ring-4 ring-amber-400/30"
                : "bg-ink text-paper hover:bg-ink/90 hover:scale-105"
            }`}
            title="Bấm để nghe đọc câu hỏi tiếng Nhật"
          >
            <Volume2 className="size-5" />
          </button>
          <div>
            <span className="text-xs font-bold text-ink block">
              {isPlayingQuestion ? "Đang đọc câu hỏi..." : "Nghe câu hỏi (Audio)"}
            </span>
            <span className="text-[11px] text-stone">
              Bấm nút loa để luyện nghe và phản xạ câu trả lời
            </span>
          </div>
        </div>

        {/* Các nút toggle Hiện câu hỏi & Hiện câu trả lời mẫu */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowQuestionText(!showQuestionText)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              showQuestionText
                ? "border-ink bg-paper text-ink shadow-xs"
                : "border-line bg-paper text-stone hover:text-ink"
            }`}
          >
            {showQuestionText ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            <span>{showQuestionText ? "Ẩn câu hỏi" : "Hiện câu hỏi"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAnswer(!showAnswer)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              showAnswer
                ? "border-amber-500/40 bg-amber-500/10 text-amber-800"
                : "border-line bg-paper text-stone hover:text-ink"
            }`}
          >
            <Lightbulb className="size-3.5 text-amber-500" />
            <span>{showAnswer ? "Ẩn gợi ý trả lời" : "Gợi ý trả lời"}</span>
          </button>
        </div>
      </div>

      {/* Khung hiển thị câu hỏi chi tiết (khi người dùng bấm Hiện câu hỏi) */}
      {showQuestionText && (
        <div className="rounded-xl border border-line/70 bg-paper p-4 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs text-stone">
            <span className="font-semibold uppercase tracking-wider text-ink">Nội dung câu hỏi:</span>
            {question.grammarPoint && <span className="text-amber-700">{question.grammarPoint}</span>}
          </div>
          <p className="text-base sm:text-lg font-bold text-ink leading-relaxed">
            {question.questionJp}
          </p>
          <p className="text-xs font-mono text-stone">
            {question.questionRomaji}
          </p>
          <p className="text-xs text-stone-700 dark:text-stone-300 border-t border-line/40 pt-1.5">
            Dịch nghĩa: <strong className="text-ink">{question.questionVi}</strong>
          </p>
        </div>
      )}

      {/* Khung hiển thị câu trả lời mẫu (khi người dùng bấm Gợi ý trả lời) */}
      {showAnswer && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <Lightbulb className="size-4 text-amber-600" />
              <span>Câu trả lời mẫu chuẩn (Model Answer):</span>
            </div>

            <button
              type="button"
              onClick={handlePlayAnswer}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                isPlayingAnswer
                  ? "bg-amber-600 text-white animate-pulse"
                  : "bg-paper border border-amber-500/30 text-amber-900 hover:bg-amber-100"
              }`}
            >
              <Volume2 className="size-3.5" />
              <span>{isPlayingAnswer ? "Đang đọc..." : "Nghe câu trả lời"}</span>
            </button>
          </div>

          <p className="text-base sm:text-lg font-bold text-ink leading-relaxed">
            {question.sampleAnswerJp}
          </p>
          <p className="text-xs font-mono text-stone">
            {question.sampleAnswerRomaji}
          </p>
          <p className="text-xs text-stone-800 dark:text-stone-200 border-t border-amber-500/20 pt-1.5">
            Ý nghĩa: <strong className="text-ink">{question.sampleAnswerVi}</strong>
          </p>

          {question.answerGuide && (
            <div className="rounded-lg bg-paper/80 p-2.5 text-xs text-stone space-y-1 border border-line/40">
              <span className="font-semibold text-ink block">Mẹo phản xạ & biến thể:</span>
              <p>{question.answerGuide}</p>
            </div>
          )}
        </div>
      )}

      {/* Khung ghi âm luyện nói của người dùng */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/40 pt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleRecording}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all shadow-xs cursor-pointer ${
              isRecording
                ? "bg-red-600 text-white animate-pulse ring-4 ring-red-400/30"
                : "border border-line bg-paper text-ink hover:border-ink/40"
            }`}
          >
            {isRecording ? <Square className="size-3.5 fill-current" /> : <Mic className="size-3.5 text-red-500" />}
            <span>{isRecording ? "Dừng ghi âm" : "Ghi âm câu trả lời"}</span>
          </button>

          {isRecording && (
            <span className="text-xs font-medium text-red-600 animate-pulse">
              ● Đang thu âm giọng nói của bạn...
            </span>
          )}
        </div>

        {/* Trình phát lại bản ghi âm */}
        {audioUrl && !isRecording && (
          <div className="flex items-center gap-2 animate-in fade-in">
            <span className="text-xs text-stone font-medium">Bản ghi của bạn:</span>
            <audio src={audioUrl} controls className="h-8 max-w-[200px] sm:max-w-[240px]" />
            <button
              type="button"
              onClick={() => {
                if (audioUrl) URL.revokeObjectURL(audioUrl);
                setAudioUrl(null);
              }}
              className="p-1 text-stone hover:text-red-600 cursor-pointer"
              title="Xóa bản ghi âm này"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
