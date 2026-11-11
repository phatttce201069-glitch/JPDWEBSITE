import { alphabet } from "../../data/alphabet.ts";
import { vocabulary } from "../../data/vocabulary.ts";
import { toKana, hasKanji, KANJI_SINGLE_CHAR_MAP } from "./kana-reading.ts";
import { toRomaji } from "./romaji.ts";
import type { WordInspection } from "./reading-types.ts";

/**
 * Tra cứu thông tin chi tiết (Romaji, Hiragana, Hán Việt, Ý nghĩa) khi người dùng
 * ấn đúp (double-click) vào bất kỳ một chữ hoặc một từ trong bài đọc.
 */
export function inspectJapaneseCharOrWord(target: string): WordInspection {
  const clean = target.trim();
  if (!clean) {
    return {
      text: "",
      hiragana: "",
      romaji: "",
      meaning: "",
      isKanji: false,
    };
  }

  // 1. Kiểm tra nếu là một từ vựng trong từ điển giáo trình (vocabulary.ts)
  const matchedWord = vocabulary.find(
    (w) =>
      w.word === clean ||
      w.word.replace(/（.*?）/g, "").trim() === clean ||
      w.reading === clean ||
      (clean.length >= 2 && (w.word.includes(clean) || clean.includes(w.word))),
  );

  if (matchedWord) {
    const wordHiragana = matchedWord.reading || toKana(matchedWord.word);
    const wordRomaji = toRomaji(wordHiragana);
    const matchedKanjiChars = (matchedWord.word.match(/[一-龯]/g) || []);
    const hanvietList = matchedKanjiChars
      .map((c) => alphabet.find((g) => g.char === c && g.type === "kanji")?.hanviet)
      .filter(Boolean);

    return {
      text: matchedWord.word,
      hiragana: wordHiragana,
      romaji: wordRomaji,
      meaning: matchedWord.meaning,
      hanviet: hanvietList.length > 0 ? hanvietList.join(" ") : undefined,
      isKanji: hasKanji(matchedWord.word),
      lesson: matchedWord.lesson,
    };
  }

  // 2. Kiểm tra nếu là chữ Hán (Kanji) đơn lẻ trong alphabet.ts
  if (clean.length === 1 && hasKanji(clean)) {
    const kanjiItem = alphabet.find((g) => g.char === clean && g.type === "kanji");
    const fallbackReading = KANJI_SINGLE_CHAR_MAP[clean] || "";
    const reading = kanjiItem?.romaji || fallbackReading || clean;
    const hiraganaReading = fallbackReading || (kanjiItem ? kanjiItem.char : "");
    const romajiReading = toRomaji(fallbackReading) || kanjiItem?.romaji || "";

    return {
      text: clean,
      hiragana: fallbackReading ? `${fallbackReading} (onyomi/kunyomi)` : "",
      romaji: romajiReading,
      meaning: kanjiItem?.meaning || "Chữ Hán trong bài học",
      hanviet: kanjiItem?.hanviet,
      isKanji: true,
      lesson: kanjiItem?.row,
    };
  }

  // 3. Nếu là chuỗi có chứa chữ Hán ghép (vd: 料理, 図書館, 新幹線, 牛肉)
  if (hasKanji(clean)) {
    const hiragana = toKana(clean);
    const romaji = toRomaji(hiragana);
    const kanjiChars = (clean.match(/[一-龯]/g) || []);
    const hanvietList = kanjiChars
      .map((c) => alphabet.find((g) => g.char === c && g.type === "kanji")?.hanviet)
      .filter(Boolean);

    return {
      text: clean,
      hiragana,
      romaji,
      meaning: `Từ chữ Hán ghép (${hanvietList.join(" ")})`,
      hanviet: hanvietList.length > 0 ? hanvietList.join(" ") : undefined,
      isKanji: true,
    };
  }

  // 4. Nếu là Kana đơn hoặc từ Kana
  const kanaRomaji = toRomaji(clean);
  return {
    text: clean,
    hiragana: clean,
    romaji: kanaRomaji,
    meaning: "Ký tự Kana",
    isKanji: false,
  };
}

/**
 * Phân tích và chuyển đổi toàn bộ văn bản bài đọc sang Romaji hoàn chỉnh
 */
export function passageToRomaji(text: string): string {
  const kanaText = toKana(text);
  return toRomaji(kanaText);
}
