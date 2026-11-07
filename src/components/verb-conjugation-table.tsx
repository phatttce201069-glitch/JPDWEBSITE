import { useState, useMemo } from "react";
import {
  Volume2,
  Search,
  Filter,
  Sparkles,
  BookOpen,
  Target,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { speakJapanese } from "@/lib/study/speech";
import type {
  VerbConjugationEntry,
  VerbConjugationTableData,
} from "@/data/verb-conjugation";

interface VerbConjugationTableProps {
  table: VerbConjugationTableData;
  onDrill?: () => void;
  defaultShowReading?: boolean;
}

export function VerbConjugationTable({
  table,
  onDrill,
  defaultShowReading = true,
}: VerbConjugationTableProps) {
  const [activeGroup, setActiveGroup] = useState<0 | 1 | 2 | 3>(0);
  const [search, setSearch] = useState("");
  const [showReading, setShowReading] = useState(defaultShowReading);
  const [viewMode, setViewMode] = useState<"textbook" | "cards">("textbook");

  // Lọc động từ theo nhóm và từ khóa tìm kiếm
  const filteredVerbs = useMemo(() => {
    return table.allVerbs.filter((verb) => {
      const matchGroup = activeGroup === 0 || verb.group === activeGroup;
      if (!matchGroup) return false;

      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        verb.kanji.toLowerCase().includes(q) ||
        verb.masuReading.toLowerCase().includes(q) ||
        verb.masuRomaji.toLowerCase().includes(q) ||
        verb.te.toLowerCase().includes(q) ||
        verb.teReading.toLowerCase().includes(q) ||
        verb.teRomaji.toLowerCase().includes(q) ||
        verb.meaning.toLowerCase().includes(q) ||
        verb.rule.toLowerCase().includes(q)
      );
    });
  }, [table.allVerbs, activeGroup, search]);

  // Phân chia dữ liệu theo đúng bảng sách giáo khoa Bài 7
  const col1 = useMemo(
    () => table.allVerbs.filter((v) => v.group === 1 && v.textbookColumn === 1),
    [table.allVerbs]
  );
  const col2 = useMemo(
    () => table.allVerbs.filter((v) => v.group === 1 && v.textbookColumn === 2),
    [table.allVerbs]
  );
  const group2 = useMemo(
    () => table.allVerbs.filter((v) => v.group === 2),
    [table.allVerbs]
  );
  const group3 = useMemo(
    () => table.allVerbs.filter((v) => v.group === 3),
    [table.allVerbs]
  );

  return (
    <section className="mt-8 rounded-2xl border border-line bg-sheet/40 p-4 sm:p-6 shadow-xs">
      {/* Header của bảng */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-seal/10 px-2.5 py-1 text-xs font-semibold text-seal flex items-center gap-1.5">
              <BookOpen className="size-3.5" />
              Sách giáo khoa JPD123 · Bài 7
            </span>
            <span className="text-xs text-stone font-medium">Tổng hợp 23 động từ</span>
          </div>
          <h2 className="jp text-xl sm:text-2xl font-bold text-ink mt-1.5">
            {table.title}
          </h2>
          <p className="text-sm text-stone mt-1">{table.description}</p>
        </div>

        {/* Nút hành động */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            tone="ghost"
            className="min-h-10 text-xs px-3"
            onClick={() => setShowReading((v) => !v)}
          >
            {showReading ? "Ẩn cách đọc" : "Hiện cách đọc"}
          </Button>

          {onDrill ? (
            <Button
              type="button"
              tone="seal"
              className="min-h-10 text-xs px-3.5 shadow-xs inline-flex items-center gap-1.5"
              onClick={onDrill}
            >
              <Target className="size-4" />
              <span>Luyện 23 động từ này</span>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Thanh điều khiển: Tab lọc nhóm + Tìm kiếm + Chuyển chế độ xem */}
      <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tabs chọn nhóm */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setActiveGroup(0);
              setViewMode("textbook");
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeGroup === 0 && viewMode === "textbook"
                ? "bg-seal text-white shadow-xs"
                : "bg-paper text-stone hover:text-ink border border-line"
            }`}
          >
            Bảng chuẩn SGK (23)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveGroup(1);
              setViewMode("cards");
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeGroup === 1
                ? "bg-seal text-white shadow-xs"
                : "bg-paper text-stone hover:text-ink border border-line"
            }`}
          >
            1グループ (16)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveGroup(2);
              setViewMode("cards");
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeGroup === 2
                ? "bg-seal text-white shadow-xs"
                : "bg-paper text-stone hover:text-ink border border-line"
            }`}
          >
            2グループ (4)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveGroup(3);
              setViewMode("cards");
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeGroup === 3
                ? "bg-seal text-white shadow-xs"
                : "bg-paper text-stone hover:text-ink border border-line"
            }`}
          >
            3グループ (3)
          </button>
        </div>

        {/* Ô tìm kiếm */}
        <div className="relative min-w-[200px]">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm động từ, cách đọc, nghĩa..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value && viewMode === "textbook") {
                setViewMode("cards");
              }
            }}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-line bg-paper text-ink placeholder:text-stone/60 focus:outline-none focus:ring-1 focus:ring-seal"
          />
        </div>
      </div>

      {/* Tóm tắt quy tắc chia theo nhóm khi đang lọc */}
      {activeGroup > 0 ? (
        <div className="mt-3 p-3 rounded-xl bg-seal/5 border border-seal/20 text-xs">
          <div className="flex items-start gap-2">
            <Info className="size-4 text-seal shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-seal">
                {table.groups[activeGroup - 1]?.title}: {table.groups[activeGroup - 1]?.description}
              </p>
              <div className="text-stone whitespace-pre-line font-mono text-[11px] leading-relaxed">
                {table.groups[activeGroup - 1]?.rulesSummary}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ================= CHẾ ĐỘ 1: BẢNG CHUẨN SÁCH GIÁO KHOA ================= */}
      {viewMode === "textbook" && !search.trim() ? (
        <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-paper shadow-xs">
          <div className="min-w-[760px]">
            {/* Header phân nhóm */}
            <div className="grid grid-cols-12 border-b border-line bg-sheet font-semibold text-xs text-ink text-center">
              <div className="col-span-8 py-2.5 border-r border-line bg-amber-500/10 text-amber-900 dark:text-amber-200">
                1グループ (Nhóm 1 - 16 động từ)
              </div>
              <div className="col-span-4 py-2.5 bg-blue-500/10 text-blue-900 dark:text-blue-200">
                2グループ &amp; 3グループ
              </div>
            </div>

            {/* Sub-header từng cột */}
            <div className="grid grid-cols-12 border-b border-line bg-sheet/40 text-[11px] font-medium text-stone text-center">
              <div className="col-span-2 py-1.5 border-r border-line">Thể ます (~masu)</div>
              <div className="col-span-2 py-1.5 border-r border-line text-seal font-semibold">Thể て (~te)</div>
              <div className="col-span-2 py-1.5 border-r border-line">Thể ます (~masu)</div>
              <div className="col-span-2 py-1.5 border-r border-line text-seal font-semibold">Thể て (~te)</div>
              <div className="col-span-2 py-1.5 border-r border-line">Thể ます (~masu)</div>
              <div className="col-span-2 py-1.5 text-seal font-semibold">Thể て (~te)</div>
            </div>

            {/* Thân bảng: 8 dòng khớp 100% với ảnh sách giáo khoa của người dùng */}
            <div className="divide-y divide-line text-sm">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((rowIdx) => {
                const vLeft = col1[rowIdx];
                const vMid = col2[rowIdx];
                // Cột bên phải: 4 dòng đầu là Nhóm 2, dòng 4 là header Nhóm 3, 3 dòng tiếp theo là Nhóm 3
                const isGroup3Header = rowIdx === 4;
                const vRight =
                  rowIdx < 4
                    ? group2[rowIdx]
                    : rowIdx > 4
                    ? group3[rowIdx - 5]
                    : null;

                return (
                  <div key={rowIdx} className="grid grid-cols-12 items-stretch hover:bg-sheet/30 transition-colors">
                    {/* Cột 1 Nhóm 1 - Thể ます */}
                    <div className="col-span-2 p-2 border-r border-line flex flex-col justify-center">
                      {vLeft ? (
                        <VerbCellMasu verb={vLeft} showReading={showReading} />
                      ) : null}
                    </div>

                    {/* Cột 1 Nhóm 1 - Thể て */}
                    <div className="col-span-2 p-2 border-r border-line bg-seal/[0.02] flex flex-col justify-center">
                      {vLeft ? (
                        <VerbCellTe verb={vLeft} showReading={showReading} />
                      ) : null}
                    </div>

                    {/* Cột 2 Nhóm 1 - Thể ます */}
                    <div className="col-span-2 p-2 border-r border-line flex flex-col justify-center">
                      {vMid ? (
                        <VerbCellMasu verb={vMid} showReading={showReading} />
                      ) : null}
                    </div>

                    {/* Cột 2 Nhóm 1 - Thể て */}
                    <div className="col-span-2 p-2 border-r border-line bg-seal/[0.02] flex flex-col justify-center">
                      {vMid ? (
                        <VerbCellTe verb={vMid} showReading={showReading} />
                      ) : null}
                    </div>

                    {/* Cột Phải - Nhóm 2 hoặc Nhóm 3 */}
                    {isGroup3Header ? (
                      <div className="col-span-4 p-2 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 text-center font-semibold text-xs flex items-center justify-center">
                        3グループ (Nhóm 3 - 3 động từ)
                      </div>
                    ) : (
                      <>
                        <div className="col-span-2 p-2 border-r border-line flex flex-col justify-center">
                          {vRight ? (
                            <VerbCellMasu verb={vRight} showReading={showReading} />
                          ) : null}
                        </div>
                        <div className="col-span-2 p-2 bg-seal/[0.02] flex flex-col justify-center">
                          {vRight ? (
                            <VerbCellTe verb={vRight} showReading={showReading} />
                          ) : null}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ================= CHẾ ĐỘ 2: DANH SÁCH THẺ CHI TIẾT (CHO MOBILE HOẶC TÌM KIẾM) ================= */
        <div className="mt-4 space-y-2.5">
          {filteredVerbs.length === 0 ? (
            <p className="p-8 text-center text-sm text-stone">
              Không tìm thấy động từ nào phù hợp với "{search}".
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredVerbs.map((verb) => (
                <div
                  key={verb.id}
                  className="rounded-xl border border-line bg-paper p-3 hover:border-seal/40 transition-colors shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    {/* Tag nhóm & quy tắc */}
                    <div className="flex items-center justify-between gap-1 text-[11px]">
                      <span
                        className={`font-medium px-2 py-0.5 rounded-full ${
                          verb.group === 1
                            ? "bg-amber-500/10 text-amber-800 dark:text-amber-300"
                            : verb.group === 2
                            ? "bg-blue-500/10 text-blue-800 dark:text-blue-300"
                            : "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                        }`}
                      >
                        {verb.groupName}
                      </span>
                      <span className="text-stone font-mono text-[10px]">{verb.rule}</span>
                    </div>

                    {/* So sánh ます -> て */}
                    <div className="mt-2.5 flex items-center justify-between gap-2 p-2 rounded-lg bg-sheet/60">
                      {/* Thể ます */}
                      <div className="flex-1">
                        <span className="text-[10px] text-stone uppercase block font-semibold">
                          Thể ます
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="jp text-base font-semibold text-ink">
                            {verb.kanji}
                          </span>
                          <button
                            type="button"
                            onClick={() => speakJapanese(verb.masu)}
                            className="text-stone hover:text-ink cursor-pointer"
                            aria-label="Nghe ます"
                          >
                            <Volume2 className="size-3.5" />
                          </button>
                        </div>
                        {showReading ? (
                          <span className="text-xs text-stone block font-mono">
                            {verb.masuReading}
                          </span>
                        ) : null}
                      </div>

                      <ArrowRight className="size-4 text-seal shrink-0" />

                      {/* Thể て */}
                      <div className="flex-1 text-right">
                        <span className="text-[10px] text-seal uppercase block font-semibold">
                          Thể て
                        </span>
                        <div className="flex items-center justify-end gap-1.5 mt-0.5">
                          <span className="jp text-base font-bold text-seal">
                            {verb.te}
                          </span>
                          <button
                            type="button"
                            onClick={() => speakJapanese(verb.te)}
                            className="text-stone hover:text-seal cursor-pointer"
                            aria-label="Nghe て"
                          >
                            <Volume2 className="size-3.5" />
                          </button>
                        </div>
                        {showReading ? (
                          <span className="text-xs text-seal/80 block font-mono">
                            {verb.teReading}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Nghĩa tiếng Việt */}
                  <div className="mt-2 pt-2 border-t border-line/60 flex items-center justify-between text-xs">
                    <span className="text-stone">Ý nghĩa:</span>
                    <span className="font-medium text-ink">{verb.meaning}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ghi chú chân bảng */}
      <div className="mt-4 pt-3 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone">
        <p>
          💡 <strong>Mẹo nhớ:</strong> Động từ Nhóm 1 đuôi <code>[い・ち・り]</code> hóa âm ngắt <code>って</code>; đuôi <code>[み・び・ぬ]</code> hóa âm mũi <code>んで</code>; đuôi <code>[き]</code> hóa <code>いて</code> (riêng <code>行きます→行って</code>).
        </p>
        {onDrill ? (
          <button
            type="button"
            onClick={onDrill}
            className="text-seal font-medium hover:underline inline-flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Làm đề trắc nghiệm chia động từ</span>
            <ArrowRight className="size-3.5" />
          </button>
        ) : null}
      </div>
    </section>
  );
}

/** Component ô thể ます trong bảng chuẩn SGK */
function VerbCellMasu({
  verb,
  showReading,
}: {
  verb: VerbConjugationEntry;
  showReading: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-1 group">
      <div>
        {showReading ? (
          <span className="text-[10px] text-stone font-mono block leading-none mb-0.5">
            {verb.furigana ? `${verb.furigana} (${verb.masuReading})` : verb.masuReading}
          </span>
        ) : null}
        <span className="jp font-semibold text-ink text-sm sm:text-base">
          {verb.kanji}
        </span>
        <span className="text-[11px] text-stone block leading-tight mt-0.5">
          {verb.meaning}
        </span>
      </div>
      <button
        type="button"
        onClick={() => speakJapanese(verb.masu)}
        className="opacity-40 group-hover:opacity-100 transition-opacity text-stone hover:text-ink cursor-pointer p-1"
        aria-label={`Nghe ${verb.masu}`}
      >
        <Volume2 className="size-3.5" />
      </button>
    </div>
  );
}

/** Component ô thể て trong bảng chuẩn SGK */
function VerbCellTe({
  verb,
  showReading,
}: {
  verb: VerbConjugationEntry;
  showReading: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-1 group">
      <div>
        {showReading ? (
          <span className="text-[10px] text-seal/80 font-mono block leading-none mb-0.5">
            {verb.teReading} ({verb.teRomaji})
          </span>
        ) : null}
        <span className="jp font-bold text-seal text-sm sm:text-base">
          {verb.te}
        </span>
        {verb.isSpecial ? (
          <span className="text-[9px] bg-red-500/10 text-red-700 dark:text-red-300 px-1 py-0.2 rounded font-medium ml-1">
            Đặc biệt
          </span>
        ) : (
          <span className="text-[10px] text-stone block font-mono">
            {verb.rule}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => speakJapanese(verb.te)}
        className="opacity-40 group-hover:opacity-100 transition-opacity text-seal hover:text-seal-dark cursor-pointer p-1"
        aria-label={`Nghe ${verb.te}`}
      >
        <Volume2 className="size-3.5" />
      </button>
    </div>
  );
}
