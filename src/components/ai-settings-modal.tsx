import { useState } from "react";
import { Bot, X } from "lucide-react";
import type { AiProvider, AiSettings } from "@/lib/study/ai-service";

export interface AiSettingsModalProps {
  settings: AiSettings;
  onClose: () => void;
  onSave: (settings: AiSettings) => void;
  title?: string;
  description?: string;
}

/**
 * Modal cấu hình nhà cung cấp AI (Google Gemini, xAI Grok, OpenAI, Groq, hoặc AI Engine Tích Hợp)
 */
export function AiSettingsModal({
  settings,
  onClose,
  onSave,
  title = "Cấu hình Trợ lý AI (Exam & Reading Generator)",
  description,
}: AiSettingsModalProps) {
  const [provider, setProvider] = useState<AiProvider>(settings.provider);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model || "");

  function handleSave() {
    onSave({
      provider,
      apiKey: apiKey.trim(),
      model: model.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-xl border border-line bg-sheet p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Bot className="size-5 text-amber-600" />
            <h2 className="font-semibold text-ink text-lg">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone hover:text-ink p-1 rounded-md cursor-pointer transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {description && (
          <p className="text-xs text-stone">{description}</p>
        )}

        <div className="space-y-4 text-sm">
          <div>
            <label className="block font-medium text-ink mb-1.5">Mô hình AI / Nhà cung cấp</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as AiProvider)}
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink text-sm focus:outline-hidden focus:ring-1 focus:ring-ink"
            >
              <option value="built-in">🧠 Sumi AI Engine (Tích hợp - Miễn phí 100%, không cần API Key)</option>
              <option value="gemini">⚡ Google Gemini (Khuyên dùng - Key miễn phí tại Google AI Studio)</option>
              <option value="xai">🚀 xAI Grok (Grok-4.5 / Grok Beta)</option>
              <option value="openai">🌐 OpenAI (GPT-4o Mini / GPT-4o)</option>
              <option value="groq">⚡ Groq (Llama 3.3 70B Siêu tốc)</option>
            </select>
          </div>

          {provider === "built-in" ? (
            <div className="rounded-md bg-paper border border-line p-3 text-xs text-stone space-y-1.5">
              <p className="font-medium text-ink">Chế độ AI Tích hợp sẵn (Sumi FPT Engine):</p>
              <p>• Hoàn toàn miễn phí, chạy trực tiếp mà không cần thẻ visa hay tài khoản bên thứ 3.</p>
              <p>• Tự động tạo bộ đề đọc hiểu và bài thi chuẩn 100% giáo trình JPD113 / JPD123 Đại học FPT.</p>
              <p>• Đảm bảo phủ đủ 100% toàn bộ chữ Hán Bài 4–7, ngữ pháp so sánh, thể て, trợ từ và từ vựng Katakana.</p>
              <p>• Thuật toán sinh đề động (Dynamic Procedural Generator) liên tục tạo đề mới, không bị trùng lặp.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block font-medium text-ink mb-1">
                  API Key của bạn ({provider.toUpperCase()})
                </label>
                <input
                  type="password"
                  placeholder="Dán API Key vào đây..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink text-sm font-mono placeholder:text-stone/50 focus:outline-hidden focus:ring-1 focus:ring-ink"
                />
                <p className="mt-1 text-xs text-stone">
                  {provider === "gemini" && (
                    <>
                      Lấy API key Google Gemini miễn phí tại{" "}
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-ink font-medium"
                      >
                        Google AI Studio
                      </a>
                    </>
                  )}
                  {provider === "xai" && "Lấy API key tại console.x.ai."}
                  {provider === "openai" && "Lấy API key tại platform.openai.com."}
                  {provider === "groq" && "Lấy API key tại console.groq.com."}
                </p>
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">
                  Model (Tuỳ chọn - để trống sẽ dùng model mặc định)
                </label>
                <input
                  type="text"
                  placeholder={
                    provider === "gemini"
                      ? "gemini-2.0-flash (hoặc gemini-1.5-flash)"
                      : provider === "xai"
                        ? "grok-4.5"
                        : provider === "openai"
                          ? "gpt-4o-mini"
                          : "llama-3.3-70b-versatile"
                  }
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink text-sm placeholder:text-stone/50 focus:outline-hidden focus:ring-1 focus:ring-ink"
                />
              </div>

              <div className="rounded-md bg-paper border border-line p-3 text-xs text-stone">
                🔒 API Key được lưu an toàn trực tiếp trên trình duyệt máy bạn (localStorage), không gửi về máy chủ thứ ba nào khác.
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-line px-4 py-2 text-sm text-stone hover:bg-paper hover:text-ink cursor-pointer transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90 cursor-pointer shadow-xs transition-colors"
          >
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
}
