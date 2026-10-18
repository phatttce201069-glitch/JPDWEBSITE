import type { Word } from "@/lib/study/types";

const BASIC: Record<string, string> = {
  あ: "a",
  い: "i",
  う: "u",
  え: "e",
  お: "o",
  か: "ka",
  き: "ki",
  く: "ku",
  け: "ke",
  こ: "ko",
  が: "ga",
  ぎ: "gi",
  ぐ: "gu",
  げ: "ge",
  ご: "go",
  さ: "sa",
  し: "shi",
  す: "su",
  せ: "se",
  そ: "so",
  ざ: "za",
  じ: "ji",
  ず: "zu",
  ぜ: "ze",
  ぞ: "zo",
  た: "ta",
  ち: "chi",
  つ: "tsu",
  て: "te",
  と: "to",
  だ: "da",
  ぢ: "ji",
  づ: "zu",
  で: "de",
  ど: "do",
  な: "na",
  に: "ni",
  ぬ: "nu",
  ね: "ne",
  の: "no",
  は: "ha",
  ひ: "hi",
  ふ: "fu",
  へ: "he",
  ほ: "ho",
  ば: "ba",
  び: "bi",
  ぶ: "bu",
  べ: "be",
  ぼ: "bo",
  ぱ: "pa",
  ぴ: "pi",
  ぷ: "pu",
  ぺ: "pe",
  ぽ: "po",
  ま: "ma",
  み: "mi",
  む: "mu",
  め: "me",
  も: "mo",
  や: "ya",
  ゆ: "yu",
  よ: "yo",
  ら: "ra",
  り: "ri",
  る: "ru",
  れ: "re",
  ろ: "ro",
  わ: "wa",
  ゐ: "wi",
  ゑ: "we",
  を: "o",
  ん: "n",
  ぁ: "a",
  ぃ: "i",
  ぅ: "u",
  ぇ: "e",
  ぉ: "o",
  ゃ: "ya",
  ゅ: "yu",
  ょ: "yo",
  ゎ: "wa",
  ゔ: "vu",
};

const YOUON: Record<string, string> = {
  きゃ: "kya",
  きゅ: "kyu",
  きょ: "kyo",
  ぎゃ: "gya",
  ぎゅ: "gyu",
  ぎょ: "gyo",
  しゃ: "sha",
  しゅ: "shu",
  しょ: "sho",
  じゃ: "ja",
  じゅ: "ju",
  じょ: "jo",
  ちゃ: "cha",
  ちゅ: "chu",
  ちょ: "cho",
  にゃ: "nya",
  にゅ: "nyu",
  にょ: "nyo",
  ひゃ: "hya",
  ひゅ: "hyu",
  ひょ: "hyo",
  びゃ: "bya",
  びゅ: "byu",
  びょ: "byo",
  ぴゃ: "pya",
  ぴゅ: "pyu",
  ぴょ: "pyo",
  みゃ: "mya",
  みゅ: "myu",
  みょ: "myo",
  りゃ: "rya",
  りゅ: "ryu",
  りょ: "ryo",
  ぢゃ: "ja",
  ぢゅ: "ju",
  ぢょ: "jo",
  うぁ: "wa",
  うぃ: "wi",
  うぇ: "we",
  うぉ: "wo",
  てぃ: "ti",
  でぃ: "di",
  ふぁ: "fa",
  ふぃ: "fi",
  ふぇ: "fe",
  ふぉ: "fo",
  ゔぁ: "va",
  ゔぃ: "vi",
  ゔぇ: "ve",
  ゔぉ: "vo",
};

function hasKana(value: string) {
  return /[ぁ-んァ-ヶ]/.test(value);
}

function hasKanji(value: string) {
  return /[一-龯々]/.test(value);
}

function kataToHira(value: string) {
  return [...value].map((char) => {
    const code = char.codePointAt(0) ?? 0;
    if (code >= 0x30a1 && code <= 0x30f6) return String.fromCodePoint(code - 0x60);
    return char;
  }).join("");
}

function moraAt(text: string, index: number) {
  const pair = text.slice(index, index + 2);
  const youon = YOUON[pair];
  if (youon) return { romaji: youon, length: 2 };
  const basic = BASIC[text[index] ?? ""];
  if (basic) return { romaji: basic, length: 1 };
  return null;
}

export function toRomaji(input: string) {
  const text = kataToHira(input.normalize("NFKC"));
  let out = "";
  for (let index = 0; index < text.length; ) {
    const char = text[index] ?? "";
    if (char === "っ") {
      const next = moraAt(text, index + 1);
      if (next?.romaji.startsWith("ch")) out += "t";
      else if (next && /^[bcdfghjklmnpqrstvwxyz]/.test(next.romaji)) out += next.romaji[0];
      index += 1;
      continue;
    }
    if (char === "ー") {
      const vowel = out.match(/[aeiou]$/)?.[0];
      if (vowel) out += vowel;
      index += 1;
      continue;
    }
    const mora = moraAt(text, index);
    if (!mora) {
      out += char;
      index += 1;
      continue;
    }
    out += mora.romaji;
    index += mora.length;
  }
  return out.replace(/[ \t]+/g, " ").trim();
}

export function kanaReading(word: Pick<Word, "word" | "reading">) {
  const reading = word.reading.trim();
  if (hasKana(reading)) return reading;
  const surface = word.word.replace(/[（(][^）)]*[）)]/g, "").trim();
  if (hasKana(surface) && !hasKanji(surface)) return surface;
  return "";
}

export function romajiOf(word: Pick<Word, "word" | "reading">) {
  const reading = word.reading.trim();
  if (reading && !hasKana(reading) && !hasKanji(reading)) return reading;
  const kana = kanaReading(word);
  if (!kana) return "";
  return toRomaji(kana).replace(/[^A-Za-z0-9' -]/g, "").replace(/\s+/g, " ").trim();
}

export function speakable(word: Pick<Word, "word" | "reading">) {
  const surface = word.word.replace(/[（(][^）)]*[）)]/g, "").replace(/[～~]/g, "").trim();
  if (/[ぁ-んァ-ヶー一-龯々]/.test(surface)) return surface;
  return kanaReading(word) || surface;
}

function loose(input: string) {
  let text = input.normalize("NFKC").trim().toLowerCase();
  if (!text) return "";
  if (hasKana(text)) text = toRomaji(text);
  text = text
    .replace(/[āâ]/g, "aa")
    .replace(/[īî]/g, "ii")
    .replace(/[ūû]/g, "uu")
    .replace(/[ēê]/g, "ee")
    .replace(/[ōô]/g, "ou")
    .replace(/[^a-z]/g, "")
    .replace(/tch/g, "ch")
    .replace(/cch/g, "ch")
    .replace(/shi/g, "si")
    .replace(/chi/g, "ti")
    .replace(/tsu/g, "tu")
    .replace(/fu/g, "hu")
    .replace(/sha/g, "sya")
    .replace(/shu/g, "syu")
    .replace(/sho/g, "syo")
    .replace(/cha/g, "tya")
    .replace(/chu/g, "tyu")
    .replace(/cho/g, "tyo")
    .replace(/(?<!z)ja/g, "zya")
    .replace(/(?<!z)ju/g, "zyu")
    .replace(/(?<!z)jo/g, "zyo")
    .replace(/ji/g, "zi")
    .replace(/wo/g, "o")
    .replace(/m([bmp])/g, "n$1")
    .replace(/ou/g, "o")
    .replace(/oo/g, "o")
    .replace(/uu/g, "u")
    .replace(/ee/g, "e")
    .replace(/aa/g, "a")
    .replace(/ii/g, "i");
  return text;
}

export function sameReading(input: string, ...expected: string[]) {
  const key = loose(input);
  if (!key) return false;
  return expected.some((item) => item && loose(item) === key);
}

export function foldVi(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d");
}

export function sameMeaning(input: string, meaning: string) {
  const norm = (value: string) =>
    foldVi(value)
      .toLowerCase()
      .replace(/[.…,;:!?()[\]"'“”„~～→>/\\|-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const typed = norm(input);
  if (!typed) return false;
  const target = norm(meaning);
  if (typed === target) return true;
  const parts = meaning
    .split(/[,/]| hoặc | hay /i)
    .map((part) => norm(part))
    .filter((part) => part.length > 0);
  if (parts.some((part) => part === typed)) return true;
  return typed.length >= 3 && (target.includes(typed) || parts.some((part) => part.includes(typed) || typed.includes(part)));
}
