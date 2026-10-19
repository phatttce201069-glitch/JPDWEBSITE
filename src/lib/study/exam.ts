import { alphabet, shuffle, vocabulary } from "@/lib/study/content";
import { kanaReading } from "@/lib/study/romaji";
import type { Glyph, Word } from "@/lib/study/types";

export const EXAM_SIZE = 30;
export const EXAM_SECONDS = 30 * 60;

export type ExamSection = "Kanji" | "Từ vựng" | "Ngữ pháp";

export type ExamQuestion = {
  id: string;
  section: ExamSection;
  promptJp: string;
  prompt: string;
  sentence: string;
  options: string[];
  answer: string;
  explanation?: {
    meaning: string;
    grammar?: string;
    lesson?: string;
    tips?: string;
    reason: string;
  };
};

export type ExamCourse = "JPD113" | "JPD123" | "starred";

const FILL = {
  promptJp: "下記の選択肢から（　　）に最も合う言葉を選びなさい。",
  prompt: "Chọn từ thích hợp điền vào（　　）.",
};

const REPLY = {
  promptJp: "下記の選択肢から（　　）に最も合う言葉を選びなさい。",
  prompt: "Hãy lựa chọn đáp án phù hợp nhất điền vào trong ngoặc（　　）trong câu sau đây.",
};

const YOMI = {
  promptJp: "（　　）の漢字の正しい読み方を選びなさい。",
  prompt: "Chọn cách đọc đúng của chữ Hán tự trong（　　）.",
};

const KAKI = {
  promptJp: "下線のひらがなの正しい漢字を選びなさい。",
  prompt: "Chọn chữ Hán tự đúng của chữ Hiragana trong（　　）.",
};

const COUNTER = {
  promptJp: "（　　）になにをいれますか。いちばんいいものをひとつえらんでください。",
  prompt: "Chọn đáp án thích hợp nhất điền vào chỗ trống.",
};

const IMI = {
  promptJp: "下線の言葉の意味として最も適当なものを選びなさい。",
  prompt: "Chọn nghĩa đúng của từ được gạch chân.",
};

const JPWORD = {
  promptJp: "下線の意味に合う日本語を選びなさい。",
  prompt: "Chọn từ tiếng Nhật đúng với nghĩa được gạch chân.",
};

const ANTI = {
  promptJp: "下線の言葉と反対の意味の言葉を選びなさい。",
  prompt: "Chọn từ trái nghĩa với từ được gạch chân.",
};

const USE = {
  promptJp: "下線の言葉の使い方として正しい文を選びなさい。",
  prompt: "Chọn câu dùng đúng từ được cho.",
};

const TALK = {
  promptJp: "会話を読んで、最もよい返事を選びなさい。",
  prompt: "Đọc hội thoại và chọn câu trả lời phù hợp.",
};

const GRAM_OK = {
  promptJp: "文法的に正しい文を一つ選びなさい。",
  prompt: "Chọn câu đúng ngữ pháp.",
};

const ORDER = {
  promptJp: "語順が正しい文を一つ選びなさい。",
  prompt: "Chọn câu có thứ tự từ đúng.",
};

const MATCH_Q = {
  promptJp: "答えに合う質問を選びなさい。",
  prompt: "Chọn câu hỏi phù hợp với câu trả lời.",
};

const SAME = {
  promptJp: "下の文と近い意味の文を選びなさい。",
  prompt: "Chọn câu gần nghĩa với câu cho sẵn.",
};

const ON = {
  promptJp: "漢字の音読みを選びなさい。",
  prompt: "Chọn âm Hán (onyomi) của chữ.",
};

const KUN = {
  promptJp: "漢字の訓読みを選びなさい。",
  prompt: "Chọn âm thuần Nhật (kunyomi) của chữ.",
};

const REVON = {
  promptJp: "この音読みの漢字を選びなさい。",
  prompt: "Chọn chữ Hán có âm Hán (onyomi) được cho.",
};

const HAN = {
  promptJp: "漢字の意味を選びなさい。",
  prompt: "Chọn nghĩa Hán Việt của chữ.",
};

const HAN_REV = {
  promptJp: "意味に合う漢字を選びなさい。",
  prompt: "Chọn chữ Hán đúng với nghĩa.",
};

const HOLD = {
  promptJp: "この漢字を含む言葉を選びなさい。",
  prompt: "Chọn từ có chứa chữ Hán được cho.",
};

const ODD = {
  promptJp: "グループが違う言葉を一つ選びなさい。",
  prompt: "Chọn từ không cùng nhóm với ba từ còn lại.",
};

const SENT = {
  promptJp: "文の意味として最もよいものを選びなさい。",
  prompt: "Chọn nghĩa đúng của câu.",
};

const VIJP = {
  promptJp: "意味に合う文を選びなさい。",
  prompt: "Chọn câu tiếng Nhật đúng với nghĩa sau.",
};

const GROUP = {
  promptJp: "言葉のグループを選びなさい。",
  prompt: "Từ được gạch chân thuộc nhóm nào?",
};

const FORM = {
  promptJp: "正しい形を選びなさい。",
  prompt: "Chọn dạng đúng của động từ.",
};

const TENSE = {
  promptJp: "時を表す言葉に合う形を選びなさい。",
  prompt: "Chọn dạng hợp với từ chỉ thời gian.",
};

const SIT = {
  promptJp: "場面に合う文を選びなさい。",
  prompt: "Đọc tình huống và chọn câu phù hợp.",
};

const WRONG = {
  promptJp: "文法的に正しくない文を一つ選びなさい。",
  prompt: "Chọn câu SAI ngữ pháp.",
};

const PART_TOPIC = {
  promptJp: "主題を表す助詞を選びなさい。",
  prompt: "Chọn trợ từ chỉ chủ đề của câu.",
};

const PART_PLACE = {
  promptJp: "動作の場所を表す助詞を選びなさい。",
  prompt: "Chọn trợ từ chỉ nơi diễn ra hành động.",
};

const PART_OBJ = {
  promptJp: "目的語を表す助詞を選びなさい。",
  prompt: "Chọn trợ từ chỉ đối tượng của động từ.",
};

const PART_TIME = {
  promptJp: "時間を表す助詞を選びなさい。",
  prompt: "Chọn trợ từ chỉ thời điểm.",
};

const PART_DIR = {
  promptJp: "方向を表す助詞を選びなさい。",
  prompt: "Chọn trợ từ chỉ hướng đi.",
};

export function examUnits(course: ExamCourse, starredIds: number[] = []) {
  if (course === "starred") {
    const counts = new Map<string, number>();
    for (const word of vocabulary) {
      if (!starredIds.includes(word.id)) continue;
      const bai = baiOf(word.lesson) ?? "khac";
      counts.set(bai, (counts.get(bai) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((left, right) => {
        const nLeft = Number(left[0]);
        const nRight = Number(right[0]);
        if (isNaN(nLeft) || isNaN(nRight)) return left[0].localeCompare(right[0]);
        return nLeft - nRight;
      })
      .map(([bai, count]) => ({
        bai,
        label: bai === "khac" ? "Từ vựng khác" : `Bài ${bai}`,
        count,
      }));
  }

  const counts = new Map<string, number>();
  for (const word of vocabulary) {
    if (word.course !== course) continue;
    const bai = baiOf(word.lesson);
    if (!bai) continue;
    counts.set(bai, (counts.get(bai) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((left, right) => Number(left[0]) - Number(right[0]))
    .map(([bai, count]) => ({ bai, label: `Bài ${bai}`, count }));
}

export function buildStarredExam(words: Word[], limit?: number): ExamQuestion[] {
  const glyphs = alphabet.filter((glyph) => glyph.type === "kanji");
  const questions: ExamQuestion[] = [];
  const pool = vocabulary.filter(examWord);

  for (const word of shuffle(words)) {
    if (!examWord(word)) continue;
    // 1. Reading question if has kanji
    if (hasKanji(surfaceOf(word))) {
      const qRead = wordReading(word, pool, glyphs);
      if (qRead) questions.push(qRead);
      const qKanaToKanji = kanaToKanji(word, pool);
      if (qKanaToKanji) questions.push(qKanaToKanji);
    }
    // 2. Meaning question (Kanji / Vocabulary)
    const qMeaning = meaningOf(word, pool, hasKanji(surfaceOf(word)) ? "Kanji" : "Từ vựng");
    if (qMeaning) questions.push(qMeaning);

    // 3. Word from Vietnamese meaning
    const qWord = wordForMeaning(word, words, pool);
    if (qWord) questions.push(qWord);

    // 4. Usage or reply if available
    const qUsage = usageOf(word);
    if (qUsage) questions.push(qUsage);

    const qSentence = sentenceMeaning(word);
    if (qSentence) questions.push(qSentence);
  }

  // Deduplicate
  const unique: ExamQuestion[] = [];
  const seen = new Set<string>();
  for (const q of shuffle(questions)) {
    const key = `${q.prompt}::${q.sentence}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(q);
  }

  const targetCount = limit && limit > 0 ? Math.min(unique.length, limit) : Math.min(unique.length, 30);
  const selected = unique.slice(0, targetCount);

  return selected.map((q, idx) => ({
    ...q,
    id: String(idx + 1),
  }));
}

export function buildExam(course: ExamCourse, baiList: string[]): ExamQuestion[] {
  const selected = new Set(baiList.filter(Boolean));
  const courseWords = vocabulary.filter((word) => word.course === course && examWord(word));
  const words = courseWords.filter((word) => selected.has(baiOf(word.lesson) ?? ""));
  const glyphs = alphabet.filter((glyph) => glyph.type === "kanji");
  const kanji: ExamQuestion[] = [];
  const vocab: ExamQuestion[] = [];
  const grammarBank: ExamQuestion[] = [];

  for (const word of shuffle(words)) {
    add(kanji, wordReading(word, courseWords, glyphs));
    add(kanji, kanaToKanji(word, courseWords));
    if (hasKanji(surfaceOf(word))) add(kanji, meaningOf(word, courseWords, "Kanji"));
    else add(vocab, meaningOf(word, courseWords, "Từ vựng"));
    add(vocab, wordForMeaning(word, words, courseWords));
    add(vocab, oppositeOf(word, words));
    add(vocab, usageOf(word));
    add(vocab, replyOf(word));
    add(vocab, sentenceMeaning(word));
    add(vocab, viToJp(word));
    add(vocab, categoryOf(word));
  }
  for (const question of oddQuestions(words)) add(vocab, question);
  const lesson = shuffle(glyphsForExam(glyphs, words, selected));
  for (const glyph of lesson) {
    add(kanji, onyomiOf(glyph, lesson));
    add(kanji, kunyomiOf(glyph, lesson));
    add(kanji, kanjiForOn(glyph, lesson));
    add(kanji, hanvietOf(glyph, lesson));
    add(kanji, kanjiForHan(glyph, lesson));
    add(kanji, wordHolding(glyph, words));
  }
  addVocab(vocab, words, courseWords);
  for (const question of formQuestions(words)) add(grammarBank, question);
  for (const question of tenseQuestions(words)) add(grammarBank, question);
  for (const question of extraGrammar(words)) add(grammarBank, question);

  for (const bai of [...selected].sort((left, right) => Number(left) - Number(right))) {
    for (const question of patternQuestions(course, bai, words)) add(grammarBank, question);
  }

  return balance(kanji, vocab, grammarBank);
}

export function buildGrammarDrill(bai: string): ExamQuestion[] {
  const number = Number(bai);
  if (!Number.isInteger(number) || number < 1 || number > 7) return [];
  const course: ExamCourse = number <= 3 ? "JPD113" : "JPD123";
  const courseWords = vocabulary.filter((word) => word.course === course && examWord(word));
  const words = courseWords.filter((word) => baiOf(word.lesson) === String(number));
  const bank: ExamQuestion[] = [];
  for (const question of patternQuestions(course, String(number), words)) add(bank, question);
  const picked = takeDiverse(bank, Math.min(10, bank.length));
  return shuffle(picked).map((question, index) => ({ ...question, id: String(index + 1) }));
}

function balance(kanji: ExamQuestion[], vocab: ExamQuestion[], grammarBank: ExamQuestion[]) {
  const picked = [...takeDiverse(kanji, 10), ...takeDiverse(vocab, 10), ...takeDiverse(grammarBank, 10)];
  const used = new Set(picked.map((item) => item.id));
  if (picked.length < EXAM_SIZE) {
    const rest = [...kanji, ...vocab, ...grammarBank].filter((item) => !used.has(item.id));
    for (const item of takeDiverse(rest, EXAM_SIZE - picked.length)) {
      if (used.has(item.id)) continue;
      used.add(item.id);
      picked.push(item);
    }
  }
  return shuffle(picked)
    .slice(0, EXAM_SIZE)
    .map((question, index) => ({ ...question, id: String(index + 1) }));
}

function takeDiverse(items: ExamQuestion[], count: number) {
  const groups = new Map<string, ExamQuestion[]>();
  for (const item of shuffle(items)) {
    const list = groups.get(item.prompt) ?? [];
    list.push(item);
    groups.set(item.prompt, list);
  }
  const picked: ExamQuestion[] = [];
  const keys = [...groups.keys()];
  let guard = 0;
  while (picked.length < count && guard < 40) {
    guard += 1;
    let progressed = false;
    for (const key of keys) {
      const next = groups.get(key)?.shift();
      if (!next) continue;
      picked.push(next);
      progressed = true;
      if (picked.length >= count) break;
    }
    if (!progressed) break;
  }
  return picked;
}

function add(list: ExamQuestion[], question: ExamQuestion | null) {
  if (!question) return;
  if (!question.sentence.trim() || !question.prompt.trim() || !question.answer.trim()) return;
  if (question.options.length !== 4 || new Set(question.options).size !== 4) return;
  if (!question.options.includes(question.answer)) return;
  if (question.options.some((option) => !option.trim() || option.length > 64)) return;
  if (list.some((item) => item.prompt === question.prompt && item.sentence === question.sentence)) return;
  if (list.some((item) => item.id === question.id)) return;
  list.push(question);
}

function choices(answer: string, pool: string[]) {
  const unique = [...new Set(pool.map((item) => item.trim()).filter((item) => item && item !== answer))];
  if (unique.length < 3) return null;
  return shuffle([answer, ...shuffle(unique).slice(0, 3)]);
}

function make(
  id: string,
  section: ExamSection,
  head: { promptJp: string; prompt: string },
  sentence: string,
  answer: string,
  wrongs: string[],
): ExamQuestion | null {
  const options = choices(answer, wrongs);
  if (!options) return null;
  return { id, section, promptJp: head.promptJp, prompt: head.prompt, sentence, options, answer };
}

function patternQuestions(course: ExamCourse, bai: string, words: Word[]) {
  const questions: ExamQuestion[] = [];
  const taught = course === "JPD113" ? Number(bai) <= 3 : Number(bai) >= 4 && Number(bai) <= 7;
  if (!taught) return questions;
  const push = (
    key: string,
    head: { promptJp: string; prompt: string },
    sentence: string,
    answer: string,
    wrongs: string[],
  ) => {
    const question = make(`g-${bai}-${key}`, "Ngữ pháp", head, sentence, answer, wrongs);
    if (question) questions.push(question);
  };

  if (bai === "1") {
    push("wa", FILL, "わたし（　　）がくせいです。", "は", ["の", "を", "が"]);
    push("no", FILL, "わたし（　　）がっこう（　　）せんせいです。", "は / の", ["の / は", "は / を", "も / の"]);
    push("mo", FILL, "たなかさんはいしゃです。\nミラーさん（　　）いしゃです。", "も", ["は", "の", "を"]);
    push("janai", FILL, "わたしはせんせい（　　）。", "じゃありません", ["です", "ました", "ます"]);
    push("to", FILL, "パン（　　）みずをかいます。", "と", ["は", "を", "も"]);
    push("ok-wa", GRAM_OK, "わたし　／　は　／　がくせい　／　です", "わたしはがくせいです。", [
      "はわたしがくせいです。",
      "わたしがくせいはです。",
      "がくせいですはわたし。",
    ]);
    push("order-mo", ORDER, "ミラーさん　／　も　／　いしゃ　／　です", "ミラーさんもいしゃです。", [
      "もミラーさんいしゃです。",
      "ミラーさんいしゃですも。",
      "いしゃですミラーさんも。",
    ]);
    push("ask-job", MATCH_Q, "B：いしゃです。", "おしごとはなんですか。", ["どこですか。", "いくらですか。", "なんさいですか。"]);
    push("sit-student", SIT, "Bạn muốn nói mình là sinh viên.", "わたしはがくせいです。", [
      "わたしがくせいはです。",
      "はわたしがくせいです。",
      "わたしのがくせいです。",
    ]);
    push("sit-also", SIT, "Tanaka là bác sĩ. Bạn muốn nói mình cũng vậy.", "わたしもいしゃです。", [
      "わたしいしゃですも。",
      "はわたしいしゃです。",
      "わたしいしゃもです。",
    ]);
    push("bad-wa", WRONG, "Câu danh từ", "はわたしがくせいです。", [
      "わたしはがくせいです。",
      "ミラーさんもいしゃです。",
      "わたしはせんせいじゃありません。",
    ]);
    push("part-topic", PART_TOPIC, "たなかさん（　　）せんせいです。", "は", ["の", "を", "が"]);
  }
  if (bai === "2") {
    push("doko", FILL, "A：トイレは（　　）ですか。\nB：あそこです。", "どこ", ["だれ", "なに", "いつ"]);
    push("nan", FILL, "A：これは（　　）ですか。\nB：ほんです。", "なん", ["どこ", "だれ", "いつ"]);
    push("ikura", FILL, "A：このほんは（　　）ですか。\nB：500えんです。", "いくら", ["どこ", "なんがい", "だれ"]);
    push("kai", FILL, "A：レストランは（　　）ですか。\nB：3がいです。", "なんがい", ["いくら", "だれ", "なに"]);
    push("ask-price", MATCH_Q, "B：500えんです。", "いくらですか。", ["どこですか。", "だれですか。", "なんさいですか。"]);
    push("ask-where", MATCH_Q, "B：あそこです。", "トイレはどこですか。", ["トイレはだれですか。", "トイレはいくらですか。", "トイレはなんさいですか。"]);
    push("ok-kai", GRAM_OK, "階を聞く文", "レストランはなんがいですか。", ["レストランはなんがいますか。", "なんがいはレストランです。", "レストランをなんがいですか。"]);
    push("sit-where", SIT, "Bạn muốn hỏi nhà vệ sinh ở đâu.", "トイレはどこですか。", [
      "トイレはだれですか。",
      "トイレはいくらですか。",
      "トイレはなんさいですか。",
    ]);
    push("sit-price", SIT, "Bạn muốn hỏi giá cuốn sách này.", "このほんはいくらですか。", [
      "このほんはどこですか。",
      "このほんはだれですか。",
      "このほんはなんさいですか。",
    ]);
    push("sit-what", SIT, "Bạn muốn hỏi đây là cái gì.", "これはなんですか。", [
      "これはどこですか。",
      "これはだれですか。",
      "これはいくらですか。",
    ]);
    push("bad-price", WRONG, "値段の聞き方", "これはいくらです。", [
      "これはいくらですか。",
      "トイレはどこですか。",
      "これはほんです。",
    ]);
  }
  if (bai === "3") {
    push("e", FILL, "がっこう（　　）いきます。", "へ", ["を", "が", "で"]);
    push("o", FILL, "ほん（　　）よみます。", "を", ["へ", "が", "に"]);
    push("de", FILL, "レストラン（　　）たべます。", "で", ["へ", "を", "が"]);
    push("ni", FILL, "7時（　　）おきます。", "に", ["で", "へ", "を"]);
    push("kara", FILL, "9時（　　）5時まではたらきます。", "から", ["まで", "に", "で"]);
    push("nanimo", FILL, "あさ、（　　）たべません。", "何も", ["なにか", "いつも", "どこか"]);
    push("pen", FILL, "ペン（　　）なまえ（　　）かいてください。", "で / を", ["は / を", "で / に", "が / を"]);
    push(
      "reply",
      REPLY,
      "A：しゅうまつ、どこかへいきますか。\nB：（　　）。",
      "はい、ホーチミンへいきます",
      ["ホーチミンへいきませんか", "ホーチミンはどうですか", "えきはどこですか"],
    );
    push("ok-e", GRAM_OK, "「行く」の文", "がっこうへいきます。", ["がっこうをいきます。", "がっこうがいきます。", "がっこうでいきます。"]);
    push("ok-o", GRAM_OK, "「読む」の文", "ほんをよみます。", ["ほんへよみます。", "ほんがよみます。", "ほんによみます。"]);
    push("order-de", ORDER, "うち　／　で　／　たべます", "うちでたべます。", ["でうちたべます。", "うちたべますで。", "たべますうちで。"]);
    push("ask-go", MATCH_Q, "B：はい、いきます。", "あした、がっこうへいきますか。", ["がっこうはいくらですか。", "なんさいですか。", "しゅみはなんですか。"]);
    push("part-place", PART_PLACE, "きっさてん（　　）コーヒーをのみます。", "で", ["へ", "を", "が"]);
    push("part-obj", PART_OBJ, "パン（　　）かいます。", "を", ["へ", "で", "が"]);
    push("part-time", PART_TIME, "10時（　　）ねます。", "に", ["で", "へ", "を"]);
    push("part-dir", PART_DIR, "スーパー（　　）いきます。", "へ", ["を", "が", "で"]);
    push("sit-go", SIT, "Bạn muốn nói ngày mai mình đi siêu thị.", "あした、スーパーへいきます。", [
      "あした、スーパーをいきます。",
      "あした、スーパーをたべます。",
      "あした、スーパーでのみます。",
    ]);
    push("bad-e", WRONG, "「行く」の文", "がっこうをいきます。", [
      "がっこうへいきます。",
      "ほんをよみます。",
      "7時におきます。",
    ]);
  }
  if (bai === "4") {
    push("totemo", FILL, "このラーメンは（　　）おいしいです。", "とても", ["あまり", "ぜんぜん", "じゃ"]);
    push("amari", FILL, "きょうは（　　）さむくないです。", "あまり", ["とても", "すこし", "いちばん"]);
    push("ga", FILL, "へやはちいさいです（　　）、きれいです。", "が", ["を", "で", "しか"]);
    push("soshite", FILL, "あさごはんをたべます。\n（　　）、がっこうへいきます。", "そして", ["でも", "から", "より"]);
    push("niaru", FILL, "へや（　　）ほんがあります。", "に", ["で", "へ", "を"]);
    push("dearu", FILL, "だいがく（　　）パーティーがあります。", "で", ["に", "へ", "を"]);
    push("event", FILL, "こんばん（　　）、さくらこうえん（　　）おまつり（　　）あります。", "X / で / が", [
      "に / は / が",
      "X / に / が",
      "は / に / が",
    ]);
    const frames = ["このりょうりはあまり（　　）。", "きょうのてんきはあまり（　　）。", "このえいがはあまり（　　）。"];
    const pasts = ["きのうは（　　）。", "きのうのてんきは（　　）。"];
    const local = words.filter((word) => baiOf(word.lesson) === bai);
    local.filter(isIAdj).slice(0, frames.length).forEach((word, index) => {
      const reading = readingOf(word);
      const stem = reading === "いい" ? "よ" : reading.slice(0, -1);
      const frame = frames[index];
      if (!frame) return;
      push(`nai-${word.id}`, FILL, frame, `${stem}くないです`, [
        `${reading}です`,
        `${stem}かったです`,
        `${reading}じゃありません`,
      ]);
    });
    local.filter(isIAdj).slice(0, pasts.length).forEach((word, index) => {
      const reading = readingOf(word);
      const stem = reading === "いい" ? "よ" : reading.slice(0, -1);
      const frame = pasts[index];
      if (!frame) return;
      push(`past-${word.id}`, FILL, frame, `${stem}かったです`, [
        `${reading}です`,
        `${stem}くないです`,
        reading === "いい" ? "いいかったです" : `${stem}いかったです`,
      ]);
    });
    local
      .filter(isNaAdj)
      .filter((word) => !readingOf(word).includes("いろいろ"))
      .slice(0, 2)
      .forEach((word, index) => {
        const stem = readingOf(word).replace(/な$/, "");
        if (!stem) return;
        const frame = index === 0 ? "ここはあまり（　　）。" : "このまちはあまり（　　）。";
        push(`na-${word.id}`, FILL, frame, `${stem}じゃありません`, [`${stem}です`, `${stem}でした`, `${stem}くないです`]);
      });
    push("ok-i", GRAM_OK, "い形容詞の過去", "きのうはさむかったです。", ["きのうはさむいでした。", "きのうはさむいかったです。", "きのうはさむくないでした。"]);
    push("ok-na", GRAM_OK, "な形容詞の否定", "このへやはきれいじゃありません。", ["このへやはきれいくないです。", "このへやはきれいじゃないます。", "このへやはきれいかったじゃありません。"]);
    push("ok-degree", GRAM_OK, "程度の言い方", "このラーメンはとてもおいしいです。", [
      "このラーメンはあまりおいしいです。",
      "このラーメンはぜんぜんおいしいです。",
      "このラーメンはおいしいじゃありませんです。",
    ]);
    push("order-ga", ORDER, "へや　／　は　／　ちいさいです　／　が　／　きれいです", "へやはちいさいですが、きれいです。", [
      "へやがへやはちいさいです、きれいです。",
      "ちいさいですへやはがきれいです。",
      "きれいですがちいさいですへやは。",
    ]);
    push("sit-totemo", SIT, "Bạn muốn khen ramen này rất ngon.", "このラーメンはとてもおいしいです。", [
      "このラーメンはあまりおいしいです。",
      "このラーメンはぜんぜんおいしいです。",
      "このラーメンはおいしいじゃありませんです。",
    ]);
    push("sit-ga", SIT, "Phòng nhỏ, nhưng bạn vẫn muốn nói nó đẹp.", "へやはちいさいですが、きれいです。", [
      "へやはちいさいですを、きれいです。",
      "へやはちいさいですで、きれいです。",
      "へやはちいさいですしか、きれいです。",
    ]);
    push("bad-amari", WRONG, "程度の言い方", "このラーメンはあまりおいしいです。", [
      "このラーメンはとてもおいしいです。",
      "きょうはあまりさむくないです。",
      "へやはちいさいですが、きれいです。",
    ]);
  }
  if (bai === "5") {
    push("hoshii", FILL, "パソコン（　　）ほしいです。", "が", ["を", "に", "で"]);
    push("tai", FILL, "にほん（　　）いきたいです。", "へ", ["を", "で", "も"]);
    push("purpose", FILL, "えいがをみ（　　）いきます。", "に", ["を", "で", "へ"]);
    push(
      "mashita",
      REPLY,
      "A：きのう、がっこうへいきましたか。\nB：（　　）。",
      "はい、いきました",
      ["はい、いきます", "いいえ、いきません", "いきませんか"],
    );
    push("kara", FILL, "あめです（　　）、うちにいます。", "から", ["まで", "ごろ", "しか"]);
    push("to", FILL, "ともだち（　　）サッカーをします。", "と", ["へ", "で", "を"]);
    push(
      "ne",
      FILL,
      "A：このしゃしん、きれいです（　　）。だれ（　　）とりましたか。\nB：ナタポンさん（　　）とりました。",
      "ね / が / が",
      ["よ / は / が", "X / が / が", "か / は / は"],
    );
    push("ok-hoshii", GRAM_OK, "「ほしい」の文", "パソコンがほしいです。", ["パソコンをほしいです。", "パソコンがほしいます。", "パソコンはほしいます。"]);
    push("ok-tai", GRAM_OK, "「たい」の文", "にほんへいきたいです。", ["にほんへいきますたいです。", "にほんがいきたいです。", "にほんへいきほしいです。"]);
    push("ok-past", GRAM_OK, "過去の文", "きのう、えいがをみました。", ["きのう、えいがをみますでした。", "きのう、えいがをみったです。", "きのう、えいがをみませんでしたます。"]);
    push("ask-why", MATCH_Q, "B：あめですから。", "どうしてうちにいますか。", ["どこへいきますか。", "いくらですか。", "なんさいですか。"]);
    push("order-to", ORDER, "ともだち　／　と　／　いきます", "ともだちといきます。", ["とともだちいきます。", "ともだちいきますと。", "いきますともだちと。"]);
    push("sit-hoshii", SIT, "Bạn muốn nói mình muốn có máy tính.", "パソコンがほしいです。", [
      "パソコンをほしいです。",
      "パソコンがほしいます。",
      "パソコンはほしいます。",
    ]);
    push("sit-past", SIT, "Bạn muốn nói hôm qua mình đã xem phim.", "きのう、えいがをみました。", [
      "きのう、えいがをみます。",
      "きのう、えいがをみてです。",
      "えいがをみませんでしたます。",
    ]);
    push("bad-hoshii", WRONG, "「ほしい」の文", "パソコンをほしいです。", [
      "パソコンがほしいです。",
      "にほんへいきたいです。",
      "きのう、えいがをみました。",
    ]);
  }
  if (bai === "6") {
    push("chikai", FILL, "このとしょかんはえきから（　　）です。", "ちかい", ["たかい", "ひろい", "はやい"]);
    push("yori", FILL, "にほんごはえいご（　　）むずかしいです。", "より", ["ほど", "から", "しか"]);
    push("hodo", FILL, "えいごはにほんご（　　）むずかしくないです。", "ほど", ["より", "だけ", "ご"]);
    push("ichiban", FILL, "このなかで8がつが（　　）あついです。", "いちばん", ["とても", "あまり", "すこし"]);
    push("dochira", FILL, "A：なつとふゆと（　　）があついですか。\nB：なつのほうがあついです。", "どちら", ["どこ", "だれ", "なに"]);
    push("hou", FILL, "ふゆとなつでは、なつ（　　）あついです。", "のほうが", ["より", "ほど", "がいちばん"]);
    push("naka", FILL, "クラスの（　　）たなかさんがいちばんわかいです。", "なかで", ["まえに", "うえで", "そとで"]);
    push("nan", FILL, "A：Bさんのくには1年で（　　）がいちばんさむいですか。\nB：2月がいちばんさむいです。", "なん", ["なに", "いつ", "どちら"]);
    push("mai", COUNTER, "CDを3（　　）とってください。", "まい", ["だい", "ほん", "かい"]);
    push("same-yori", SAME, "なつはふゆよりあついです。", "ふゆはなつほどあつくないです。", [
      "ふゆはなつよりあついです。",
      "なつはふゆほどあつくないです。",
      "ふゆがいちばんあついです。",
    ]);
    push("ok-yori", GRAM_OK, "比較の文", "でんしゃはバスよりはやいです。", ["でんしゃはバスほどはやいです。", "でんしゃはバスからはやいです。", "でんしゃはバスはやいよりです。"]);
    push("ok-ban", GRAM_OK, "いちばんの文", "クラスのなかでたなかさんがいちばんわかいです。", [
      "クラスのなかでたなかさんはいちばんわかいです。",
      "クラスのなかでたなかさんをいちばんわかいです。",
      "クラスのなかでたなかさんがいちばんわかくないです。",
    ]);
    push("ask-hot", MATCH_Q, "B：なつのほうがあついです。", "なつとふゆとどちらがあついですか。", [
      "なつはどこですか。",
      "ふゆはいくらですか。",
      "だれがあついですか。",
    ]);
    push("order-yori", ORDER, "なつ　／　は　／　ふゆ　／　より　／　あついです", "なつはふゆよりあついです。", [
      "なつふゆはよりあついです。",
      "よりなつはふゆあついです。",
      "あついですなつはふゆより。",
    ]);
    push("sit-yori", SIT, "Bạn muốn nói tàu điện nhanh hơn xe buýt.", "でんしゃはバスよりはやいです。", [
      "でんしゃはバスほどはやいです。",
      "でんしゃはバスからはやいです。",
      "バスはでんしゃよりはやいです。",
    ]);
    push("sit-dochira", SIT, "Bạn muốn hỏi hè và đông, bên nào nóng hơn.", "なつとふゆとどちらがあついですか。", [
      "なつはどこですか。",
      "ふゆはいくらですか。",
      "だれがあついですか。",
    ]);
    push("bad-hodo", WRONG, "比較の文", "でんしゃはバスほどはやいです。", [
      "でんしゃはバスよりはやいです。",
      "なつはふゆよりあついです。",
      "クラスのなかでたなかさんがいちばんわかいです。",
    ]);
  }
  if (bai === "7") {
    push("suki", FILL, "いぬ（　　）すきです。", "が", ["を", "に", "で"]);
    push("te", FILL, "ここになまえを（　　）ください。", "かいて", ["のんで", "かけて", "かって"]);
    push("kata1", FILL, "A：カレーの（　　）をおしえてください。\nB：いいですよ。", "つくりかた", ["しかた", "つかいかた", "とりかた"]);
    push("kata2", FILL, "えきまでの（　　）をおしえてください。", "いきかた", ["よみかた", "つくりかた", "もちかた"]);
    push("kata3", FILL, "このかんじの（　　）をおしえてください。", "よみかた", ["いきかた", "つくりかた", "つかいかた"]);
    push(
      "dono",
      FILL,
      "A：すずきさん、おさらをとってください。\nB：（　　）おさらですか。\nA：（　　）です。",
      "どの / それ",
      ["どれ / その", "どの / その", "どれ / それ"],
    );
    push("teiru", FILL, "山口さんは今あそこで本を（　　）。", "よんでいます", ["かけています", "すっています", "おしえています"]);
    push("zehi", FILL, "このカレーはおいしいですよ。ぜひ（　　）。", "たべてください", ["たべましょうか", "たべませんか", "たべます"]);
    push("mou", FILL, "もうごはんを（　　）。", "たべました", ["たべます", "たべて", "たべませんか"]);
    push("mada", FILL, "まだごはんを（　　）。", "たべていません", ["たべました", "たべます", "たべて"]);
    push("iru", FILL, "きむらさん（　　）こうえん（　　）います。", "は / に", ["に / は", "と / に", "は / が"]);
    push("ask-suki", MATCH_Q, "B：いぬがすきです。", "なにがすきですか。", ["どこがすきますか。", "いくらがすきですか。", "だれをすきますか。"]);
    push("ok-suki", GRAM_OK, "「すき」の文", "いぬがすきです。", ["いぬをすきです。", "いぬがすきます。", "いぬはすきます。"]);
    push("ok-te", GRAM_OK, "て形の頼み方", "なまえをかいてください。", ["なまえをかきますください。", "なまえをかいてますください。", "なまえをかいたください。"]);
    push("ok-mou", GRAM_OK, "「もう」の文", "もうたべました。", ["もうたべますた。", "まだたべました。", "もうたべてです。"]);
    push("order-te", ORDER, "あさごはん　／　を　／　たべて　／　いきます", "あさごはんをたべていきます。", [
      "たべてあさごはんをいきます。",
      "あさごはんたべてをいきます。",
      "いきますあさごはんをたべて。",
    ]);
    push("sit-suki", SIT, "Bạn muốn nói mình thích chó.", "いぬがすきです。", [
      "いぬをすきです。",
      "いぬがすきます。",
      "いぬはすきます。",
    ]);
    push("sit-te", SIT, "Bạn muốn nhờ người kia viết tên vào đây.", "ここになまえをかいてください。", [
      "ここになまえをかきますください。",
      "ここになまえをかいてますください。",
      "ここになまえをかいたください。",
    ]);
    push("sit-mou", SIT, "Bạn muốn nói mình ăn cơm rồi.", "もうごはんをたべました。", [
      "まだごはんをたべました。",
      "もうごはんをたべますた。",
      "もうごはんをたべてです。",
    ]);
    push("bad-suki", WRONG, "「すき」の文", "いぬをすきです。", [
      "いぬがすきです。",
      "なまえをかいてください。",
      "もうたべました。",
    ]);
  }
  return questions;
}

function lessonGlyphs(glyphs: Glyph[], selected: Set<string>) {
  return glyphs.filter((glyph) => {
    const bai = baiOf(glyph.row);
    return Boolean(bai && selected.has(bai));
  });
}

function glyphsForExam(glyphs: Glyph[], words: Word[], selected: Set<string>) {
  const chars = new Set(words.flatMap((word) => [...surfaceOf(word)].filter((char) => hasKanji(char))));
  const seen = new Set<string>();
  const merged: Glyph[] = [];
  for (const glyph of [...lessonGlyphs(glyphs, selected), ...glyphs.filter((glyph) => chars.has(glyph.char))]) {
    if (seen.has(glyph.char)) continue;
    seen.add(glyph.char);
    merged.push(glyph);
  }
  return merged;
}

function readingList(value: string) {
  return value
    .split(/[、,・\s]/)
    .map((item) => kataToHira(item.replace(/\./g, "").trim()))
    .filter((item) => /^[ぁ-ん]+$/.test(item));
}

function onyomiOf(glyph: Glyph, glyphs: Glyph[]): ExamQuestion | null {
  return readingPick(glyph, glyphs, "on");
}

function kunyomiOf(glyph: Glyph, glyphs: Glyph[]): ExamQuestion | null {
  return readingPick(glyph, glyphs, "kun");
}

function readingPick(glyph: Glyph, glyphs: Glyph[], side: "on" | "kun"): ExamQuestion | null {
  const ons = readingList(glyph.onyomi ?? "");
  const kuns = readingList(glyph.kunyomi ?? "");
  const answer = (side === "on" ? ons : kuns)[0] ?? "";
  if (!answer) return null;
  const banned = new Set(side === "on" ? ons : kuns);
  const traps = side === "on" ? kuns : ons;
  const rest = glyphs.flatMap((item) => [...readingList(item.onyomi ?? ""), ...readingList(item.kunyomi ?? "")]);
  return make(`yo-${side}-${glyph.char}`, "Kanji", side === "on" ? ON : KUN, `〔${glyph.char}〕`, answer, [...traps, ...rest].filter((item) => !banned.has(item)));
}

function kanjiForOn(glyph: Glyph, glyphs: Glyph[]): ExamQuestion | null {
  const reading = readingList(glyph.onyomi ?? "")[0] ?? "";
  if (!reading) return null;
  const owners = glyphs.filter((item) => readingList(item.onyomi ?? "").includes(reading));
  if (owners.length !== 1) return null;
  return make(`revon-${glyph.char}`, "Kanji", REVON, `〔${reading}〕`, glyph.char, glyphs.map((item) => item.char));
}

function hanLabel(glyph: Glyph) {
  const raw = (glyph.example ?? "").split("·")[0]?.trim() ?? "";
  if (!raw || raw.length > 28) return "";
  return raw;
}

function hanvietOf(glyph: Glyph, glyphs: Glyph[]): ExamQuestion | null {
  const answer = hanLabel(glyph);
  if (!answer) return null;
  if (glyphs.filter((item) => hanLabel(item) === answer).length !== 1) return null;
  return make(`han-${glyph.char}`, "Kanji", HAN, `〔${glyph.char}〕`, answer, glyphs.map(hanLabel));
}

function kanjiForHan(glyph: Glyph, glyphs: Glyph[]): ExamQuestion | null {
  const label = hanLabel(glyph);
  if (!label) return null;
  if (glyphs.filter((item) => hanLabel(item) === label).length !== 1) return null;
  return make(`hanrev-${glyph.char}`, "Kanji", HAN_REV, label, glyph.char, glyphs.map((item) => item.char));
}

function wordHolding(glyph: Glyph, words: Word[]): ExamQuestion | null {
  const holders = [...new Set(words.map(surfaceOf).filter((item) => item.includes(glyph.char) && item.length <= 16))];
  const answer = shuffle(holders)[0];
  if (!answer) return null;
  const wrongs = words.map(surfaceOf).filter((item) => item && item.length <= 16 && !item.includes(glyph.char));
  return make(`hold-${glyph.char}`, "Kanji", HOLD, `〔${glyph.char}〕`, answer, wrongs);
}

const GROUPS: { id: string; label: string; test: (word: Word) => boolean }[] = [
  { id: "food", label: "Đồ ăn", test: (word) => isFood(word) },
  { id: "drink", label: "Đồ uống", test: (word) => isDrink(word) },
  { id: "place", label: "Nơi chốn", test: (word) => isPlace(word) },
  { id: "country", label: "Đất nước", test: (word) => isCountry(word) },
  { id: "job", label: "Nghề nghiệp", test: (word) => isJob(word) },
  { id: "hobby", label: "Sở thích", test: (word) => isHobby(word) },
  { id: "month", label: "Tháng", test: (word) => isMonth(word) },
  { id: "age", label: "Tuổi", test: (word) => isAge(word) },
  { id: "day", label: "Ngày", test: (word) => isDay(word) },
];

function oddQuestions(words: Word[]) {
  const questions: ExamQuestion[] = [];
  const buckets = GROUPS.map((group) => ({
    ...group,
    items: words.filter((word) => group.test(word) && !isPromptWord(word) && surfaceOf(word) && surfaceOf(word).length <= 12),
  })).filter((bucket) => bucket.items.length >= 3);
  for (const bucket of buckets) {
    for (const other of buckets) {
      if (other.id === bucket.id) continue;
      const trio = shuffle(bucket.items).slice(0, 3);
      const odd = shuffle(other.items).find((item) => !bucket.test(item));
      if (!odd) continue;
      const surfaces = [...trio.map(surfaceOf), surfaceOf(odd)];
      if (new Set(surfaces).size !== 4) continue;
      const question = make(`odd-${bucket.id}-${other.id}-${odd.id}`, "Từ vựng", ODD, shuffle(surfaces).join("　／　"), surfaceOf(odd), trio.map(surfaceOf));
      if (question) questions.push(question);
    }
  }
  return questions;
}

function sentenceMeaning(word: Word): ExamQuestion | null {
  const token = surfaceOf(word);
  const meaning = shortGloss(word);
  if (!token || !meaning) return null;
  if (isFood(word)) {
    return make(`sent-${word.id}`, "Từ vựng", SENT, `あさ、${token}をたべます。`, `Buổi sáng ăn ${meaning}.`, [
      `Buổi sáng uống ${meaning}.`,
      `Ngày mai đi ${meaning}.`,
      `${meaning} là nơi chốn.`,
    ]);
  }
  if (isDrink(word)) {
    return make(`sent-${word.id}`, "Từ vựng", SENT, `あさ、${token}をのみます。`, `Buổi sáng uống ${meaning}.`, [
      `Buổi sáng ăn ${meaning}.`,
      `Ngày mai đi ${meaning}.`,
      `${meaning} là nghề nghiệp.`,
    ]);
  }
  if (isPlace(word)) {
    const where = placeGloss(meaning);
    if (!where) return null;
    return make(`sent-${word.id}`, "Từ vựng", SENT, `あした、${token}へいきます。`, `Ngày mai đi ${where}.`, [
      `Ngày mai ăn ${where}.`,
      `Buổi sáng uống ${where}.`,
      `${where} là đồ ăn.`,
    ]);
  }
  if (isCountry(word)) {
    return make(`sent-${word.id}`, "Từ vựng", SENT, `${token}からきました。`, `Đến từ ${meaning}.`, [
      `Ăn ${meaning}.`,
      `Uống ${meaning}.`,
      `Sở thích là ${meaning}.`,
    ]);
  }
  if (isJob(word)) {
    return make(`sent-${word.id}`, "Từ vựng", SENT, `わたしは${token}です。`, `Tôi là ${meaning}.`, [
      `Tôi ăn ${meaning}.`,
      `Tôi đi ${meaning}.`,
      `Sở thích là ${meaning}.`,
    ]);
  }
  if (isHobby(word)) {
    return make(`sent-${word.id}`, "Từ vựng", SENT, `しゅみは${token}です。`, `Sở thích là ${meaning}.`, [
      `Tôi ăn ${meaning}.`,
      `Ngày mai đi ${meaning}.`,
      `Tôi là người ${meaning}.`,
    ]);
  }
  return null;
}

function viToJp(word: Word): ExamQuestion | null {
  const token = surfaceOf(word);
  const meaning = shortGloss(word);
  if (!token || !meaning || token.length > 12) return null;
  if (isFood(word)) {
    return make(`vijp-${word.id}`, "Từ vựng", VIJP, `Buổi sáng ăn ${meaning}.`, `あさ、${token}をたべます。`, [
      `あさ、${token}をのみます。`,
      `あした、${token}へいきます。`,
      `しゅみは${token}です。`,
    ]);
  }
  if (isDrink(word)) {
    return make(`vijp-${word.id}`, "Từ vựng", VIJP, `Buổi sáng uống ${meaning}.`, `あさ、${token}をのみます。`, [
      `あさ、${token}をたべます。`,
      `${token}へいきます。`,
      `しゅみは${token}です。`,
    ]);
  }
  if (isPlace(word)) {
    const where = placeGloss(meaning);
    if (!where) return null;
    return make(`vijp-${word.id}`, "Từ vựng", VIJP, `Ngày mai đi ${where}.`, `あした、${token}へいきます。`, [
      `あした、${token}をたべます。`,
      `${token}をのみます。`,
      `わたしは${token}です。`,
    ]);
  }
  if (isCountry(word)) {
    return make(`vijp-${word.id}`, "Từ vựng", VIJP, `Đến từ ${meaning}.`, `${token}からきました。`, [
      `${token}をたべます。`,
      `${token}をのみます。`,
      `しゅみは${token}です。`,
    ]);
  }
  if (isJob(word)) {
    return make(`vijp-${word.id}`, "Từ vựng", VIJP, `Tôi là ${meaning}.`, `わたしは${token}です。`, [
      `${token}をたべます。`,
      `${token}へいきます。`,
      `あさ、${token}をのみます。`,
    ]);
  }
  if (isHobby(word)) {
    return make(`vijp-${word.id}`, "Từ vựng", VIJP, `Sở thích là ${meaning}.`, `しゅみは${token}です。`, [
      `${token}をたべます。`,
      `${token}へいきます。`,
      `わたしは${token}のひとです。`,
    ]);
  }
  return null;
}

function categoryOf(word: Word): ExamQuestion | null {
  const token = surfaceOf(word);
  if (!token || isPromptWord(word) || token.length > 16) return null;
  const hits = GROUPS.filter((group) => group.test(word));
  if (hits.length !== 1) return null;
  const answer = hits[0]?.label ?? "";
  if (!answer) return null;
  return make(`grp-${word.id}`, "Từ vựng", GROUP, `〔${token}〕`, answer, GROUPS.map((group) => group.label));
}

function shortGloss(word: Word) {
  if (isPromptWord(word)) return "";
  const text = gloss(word.meaning);
  if (!text || text.length > 22) return "";
  return text;
}

function placeGloss(meaning: string) {
  if (/^(phòng|nhà|chỗ)$/i.test(meaning)) return "";
  return meaning;
}

type Verb = {
  keys: string[];
  dict: string;
  masu: string;
  mashita: string;
  masen: string;
  te: string;
};

const VERBS: Verb[] = [
  { keys: ["たべる", "たべます", "食べる", "食べます"], dict: "たべる", masu: "たべます", mashita: "たべました", masen: "たべません", te: "たべて" },
  { keys: ["のむ", "のみます", "飲む", "飲みます"], dict: "のむ", masu: "のみます", mashita: "のみました", masen: "のみません", te: "のんで" },
  { keys: ["いく", "いきます", "行く", "行きます"], dict: "いく", masu: "いきます", mashita: "いきました", masen: "いきません", te: "いって" },
  { keys: ["くる", "きます", "来る", "来ます"], dict: "くる", masu: "きます", mashita: "きました", masen: "きません", te: "きて" },
  { keys: ["みる", "みます", "見る", "見ます"], dict: "みる", masu: "みます", mashita: "みました", masen: "みません", te: "みて" },
  { keys: ["かう", "かいます", "買う", "買います"], dict: "かう", masu: "かいます", mashita: "かいました", masen: "かいません", te: "かって" },
  { keys: ["かく", "かきます", "書く", "書きます"], dict: "かく", masu: "かきます", mashita: "かきました", masen: "かきません", te: "かいて" },
  { keys: ["よむ", "よみます", "読む", "読みます"], dict: "よむ", masu: "よみます", mashita: "よみました", masen: "よみません", te: "よんで" },
  { keys: ["きく", "ききます", "聞く", "聞きます"], dict: "きく", masu: "ききます", mashita: "ききました", masen: "ききません", te: "きいて" },
  { keys: ["はなす", "はなします", "話す", "話します"], dict: "はなす", masu: "はなします", mashita: "はなしました", masen: "はなしません", te: "はなして" },
  { keys: ["する", "します"], dict: "する", masu: "します", mashita: "しました", masen: "しません", te: "して" },
  { keys: ["おきる", "起きる", "起きます"], dict: "おきる", masu: "おきます", mashita: "おきました", masen: "おきません", te: "おきて" },
  { keys: ["ねる", "ねます", "寝る", "寝ます"], dict: "ねる", masu: "ねます", mashita: "ねました", masen: "ねません", te: "ねて" },
];

function knownForm(words: Word[], keys: string[]) {
  const set = new Set(keys);
  return words.some((word) => set.has(surfaceOf(word)) || set.has(readingOf(word)) || set.has(plainReading(word)));
}

function plainReading(word: Word) {
  return kataToHira(word.reading.replace(/\s+/g, ""));
}

function formQuestions(words: Word[]) {
  const questions: ExamQuestion[] = [];
  for (const verb of VERBS) {
    if (!knownForm(words, verb.keys)) continue;
    const shown = knownForm(words, [verb.dict]) ? verb.dict : verb.masu;
    const asks: [string, string, string[]][] = [
      [`「${verb.masu}」の過去`, verb.mashita, [verb.masu, verb.masen, verb.te]],
      [`「${verb.masu}」の否定`, verb.masen, [verb.masu, verb.mashita, verb.te]],
      [`「${verb.masu}」のて形`, verb.te, [verb.masu, verb.mashita, verb.masen]],
    ];
    if (shown === verb.dict) asks.unshift([`「${verb.dict}」のます形`, verb.masu, [verb.mashita, verb.masen, verb.te]]);
    for (const [sentence, answer, wrongs] of asks) {
      const question = make(`form-${verb.dict}-${answer}`, "Ngữ pháp", FORM, sentence, answer, wrongs);
      if (question) questions.push(question);
    }
  }
  return questions;
}

function extraGrammar(words: Word[]) {
  const questions: ExamQuestion[] = [];
  const push = (
    key: string,
    head: { promptJp: string; prompt: string },
    sentence: string,
    answer: string,
    wrongs: string[],
  ) => {
    const question = make(`x-${key}`, "Ngữ pháp", head, sentence, answer, wrongs);
    if (question) questions.push(question);
  };
  const place = words.find((word) => isPlace(word) && !isPromptWord(word) && surfaceOf(word).length <= 10);
  const linger = words.find((word) => lingerPlace(word) && surfaceOf(word).length <= 10);
  const food = words.find((word) => isFood(word) && !isPromptWord(word) && surfaceOf(word).length <= 8);
  const drink = words.find((word) => isDrink(word) && !isPromptWord(word) && surfaceOf(word).length <= 8);
  if (place) {
    const name = surfaceOf(place);
    push(`dir-${place.id}`, PART_DIR, `あした、${name}（　　）いきます。`, "へ", ["を", "が", "で"]);
    if (linger && linger.id === place.id) {
      push(`at-${place.id}`, PART_PLACE, `${name}（　　）たべます。`, "で", ["へ", "を", "が"]);
    } else if (linger) {
      const spot = surfaceOf(linger);
      push(`at-${linger.id}`, PART_PLACE, `${spot}（　　）たべます。`, "で", ["へ", "を", "が"]);
    }
    push(`bad-${place.id}`, WRONG, "Hướng đi", `${name}をいきます。`, [
      `${name}へいきます。`,
      `あした、${name}へいきます。`,
      `まいにち、${name}へいきます。`,
    ]);
    push(`ask-${place.id}`, MATCH_Q, `B：${name}へいきます。`, "どこへいきますか。", [
      `${name}はいくらですか。`,
      "なんさいですか。",
      "なにをのみますか。",
    ]);
    const where = placeGloss(shortGloss(place));
    if (where) {
      push(`sit-${place.id}`, SIT, `Bạn muốn nói ngày mai mình đi ${where}.`, `あした、${name}へいきます。`, [
        `あした、${name}をたべます。`,
        `あした、${name}をいきます。`,
        `${name}はなんさいですか。`,
      ]);
    }
  }
  if (food) {
    const name = surfaceOf(food);
    push(`obj-${food.id}`, PART_OBJ, `ひる、${name}（　　）たべます。`, "を", ["へ", "で", "が"]);
    push(`ord-${food.id}`, ORDER, `あさ　／　${name}　／　を　／　たべます`, `あさ、${name}をたべます。`, [
      `${name}あさをたべます。`,
      `を${name}あさたべます。`,
      `たべますあさ${name}を。`,
    ]);
    const meaning = shortGloss(food);
    if (meaning) {
      push(`sit-food-${food.id}`, SIT, `Bạn muốn nói trưa nay mình ăn ${meaning}.`, `ひる、${name}をたべます。`, [
        `ひる、${name}をのみます。`,
        `ひる、${name}へいきます。`,
        `${name}はどこですか。`,
      ]);
    }
  } else if (drink) {
    const name = surfaceOf(drink);
    push(`obj-${drink.id}`, PART_OBJ, `あさ、${name}（　　）のみます。`, "を", ["へ", "で", "が"]);
  }
  if (knownForm(words, ["ねる", "ねます", "寝る", "寝ます"]) || knownForm(words, ["おきる", "起きる", "起きます"])) {
    push("time", PART_TIME, "11時（　　）ねます。", "に", ["で", "へ", "を"]);
  }
  return questions;
}

function tenseQuestions(words: Word[]) {
  const rows: { id: string; keys: string[]; sentence: string; answer: string; wrongs: string[] }[] = [
    { id: "kinou-nomu", keys: ["のむ", "のみます", "飲む", "飲みます"], sentence: "きのう、みずを（　　）。", answer: "のみました", wrongs: ["のみます", "のみません", "のんで"] },
    { id: "ashita-iku", keys: ["いく", "いきます", "行く", "行きます"], sentence: "あした、がっこうへ（　　）。", answer: "いきます", wrongs: ["いきました", "いきません", "いって"] },
    { id: "mainichi-yomu", keys: ["よむ", "よみます", "読む", "読みます"], sentence: "まいにち、ほんを（　　）。", answer: "よみます", wrongs: ["よみました", "よみません", "よんで"] },
    { id: "senshuu-taberu", keys: ["たべる", "たべます", "食べる", "食べます"], sentence: "せんしゅう、パンを（　　）。", answer: "たべました", wrongs: ["たべます", "たべません", "たべて"] },
    { id: "kesa-miru", keys: ["みる", "みます", "見る", "見ます"], sentence: "けさ、テレビを（　　）。", answer: "みました", wrongs: ["みます", "みません", "みて"] },
  ];
  return rows.flatMap((row) => {
    if (!knownForm(words, row.keys)) return [];
    const question = make(`tense-${row.id}`, "Ngữ pháp", TENSE, row.sentence, row.answer, row.wrongs);
    return question ? [question] : [];
  });
}

function meaningOf(word: Word, pool: Word[], section: ExamSection): ExamQuestion | null {
  const surface = surfaceOf(word);
  const answer = gloss(word.meaning);
  if (!surface || !answer || isPromptWord(word)) return null;
  const wrongs = shuffle(pool.map((item) => gloss(item.meaning)).filter((item) => item && item !== answer));
  return make(`imi-${section}-${word.id}`, section, IMI, `〔${surface}〕`, answer, wrongs);
}

function wordForMeaning(word: Word, lessonWords: Word[], courseWords: Word[]): ExamQuestion | null {
  const answer = surfaceOf(word);
  const meaning = gloss(word.meaning);
  if (!answer || !meaning || answer.includes("～") || isPromptWord(word)) return null;
  const pool = lessonWords.filter((item) => gloss(item.meaning) === meaning);
  if (pool.length !== 1) return null;
  const source = lessonWords.length >= 4 ? lessonWords : courseWords;
  const wrongs = shuffle(source.map(surfaceOf).filter((item) => item && item !== answer));
  return make(`rev-${word.id}`, "Từ vựng", JPWORD, `〔${meaning}〕`, answer, wrongs);
}

function oppositeOf(word: Word, words: Word[]): ExamQuestion | null {
  const reading = readingOf(word);
  const pair = OPPOSITES.find((item) => item.from === reading && item.fromOk(word.meaning));
  if (!pair) return null;
  const other = words.find((item) => item.id !== word.id && readingOf(item) === pair.to && pair.toOk(item.meaning));
  if (!other) return null;
  const answer = surfaceOf(other);
  const surface = surfaceOf(word);
  if (!answer || !surface || answer === surface || sameKana(answer, surface)) return null;
  const adjectiveLike = words.filter((item) => isIAdj(item) || isNaAdj(item) || OPPOSITES.some((pair) => pair.from === readingOf(item)));
  const wrongs = shuffle(
    [
      ...adjectiveLike.map(surfaceOf),
      "おおきい",
      "ちいさい",
      "たかい",
      "やすい",
      "あたらしい",
      "ふるい",
      "むずかしい",
      "ひろい",
      "ちかい",
      "とおい",
      "すき",
      "きらい",
      "あつい",
      "さむい",
      "おいしい",
    ].filter((item) => item && item !== answer && item !== surface && item !== reading && !sameKana(item, answer) && !sameKana(item, surface)),
  );
  return make(`anti-${word.id}`, "Từ vựng", ANTI, `〔${surface}〕`, answer, wrongs);
}

function usageOf(word: Word): ExamQuestion | null {
  const token = surfaceOf(word);
  if (!token || isPromptWord(word)) return null;
  const built = usageLines(word, token);
  if (!built) return null;
  if ([built.answer, ...built.wrongs].some((item) => item.length > 64)) return null;
  return make(`use-${word.id}`, "Từ vựng", USE, `〔${token}〕`, built.answer, built.wrongs);
}

function usageLines(word: Word, token: string) {
  if (isFood(word)) {
    return {
      answer: `あさ、${token}をたべます。`,
      wrongs: [`あさ、${token}をのみます。`, `あした、${token}へいきます。`, `${token}でべんきょうします。`],
    };
  }
  if (isDrink(word)) {
    return {
      answer: `あさ、${token}をのみます。`,
      wrongs: [`あさ、${token}をたべます。`, `${token}へいきます。`, `${token}をよみます。`],
    };
  }
  if (isPlace(word)) {
    return {
      answer: `あした、${token}へいきます。`,
      wrongs: [`あした、${token}をたべます。`, `${token}をのみます。`, `${token}がほしいです。`],
    };
  }
  if (isCountry(word)) {
    return {
      answer: `わたしは${token}のひとです。`,
      wrongs: [`わたしは${token}をたべます。`, `${token}へのみます。`, `${token}をよみます。`],
    };
  }
  if (isHobby(word)) {
    return {
      answer: `しゅみは${token}です。`,
      wrongs: [`しゅみは${token}へいきます。`, `${token}をのみます。`, `${token}はいくらですか。`],
    };
  }
  return null;
}

function replyOf(word: Word): ExamQuestion | null {
  const token = surfaceOf(word);
  if (!token || isPromptWord(word) || token.length > 12) return null;
  const built = replyLines(word, token);
  if (!built) return null;
  if ([built.answer, ...built.wrongs].some((item) => item.length > 64)) return null;
  return make(`talk-${word.id}`, "Từ vựng", TALK, built.sentence, built.answer, built.wrongs);
}

function replyLines(word: Word, token: string) {
  if (isPlace(word)) {
    return {
      sentence: "A：しゅうまつ、どこへいきますか。\nB：（　　）。",
      answer: `${token}へいきます`,
      wrongs: [`${token}をたべます`, `${token}はいくらですか`, "なんさいですか"],
    };
  }
  if (isFood(word)) {
    return {
      sentence: "A：あさ、なにをたべますか。\nB：（　　）。",
      answer: `${token}をたべます`,
      wrongs: [`${token}へいきます`, `${token}をのみます`, "どこですか"],
    };
  }
  if (isDrink(word)) {
    return {
      sentence: "A：なにをのみますか。\nB：（　　）。",
      answer: `${token}をのみます`,
      wrongs: [`${token}をたべます`, `${token}へいきます`, "いくらですか"],
    };
  }
  if (isCountry(word)) {
    return {
      sentence: "A：おくにはどちらですか。\nB：（　　）。",
      answer: `${token}です`,
      wrongs: [`${token}をたべます`, `${token}へのみます`, "なんさいですか"],
    };
  }
  if (isJob(word)) {
    return {
      sentence: "A：おしごとはなんですか。\nB：（　　）。",
      answer: `${token}です`,
      wrongs: [`${token}へいきます`, `${token}をのみます`, "どこですか"],
    };
  }
  if (isHobby(word)) {
    return {
      sentence: "A：しゅみはなんですか。\nB：（　　）。",
      answer: `${token}です`,
      wrongs: [`${token}をたべます`, `${token}へいきます`, "いくらですか"],
    };
  }
  if (isAge(word)) {
    return {
      sentence: "A：なんさいですか。\nB：（　　）。",
      answer: `${token}です`,
      wrongs: [`${token}へいきます`, "どこですか", "いくらですか"],
    };
  }
  if (isMonth(word)) {
    return {
      sentence: "A：たんじょうびはなんがつですか。\nB：（　　）。",
      answer: `${token}です`,
      wrongs: [`${token}へいきます`, "だれですか", "いくらですか"],
    };
  }
  return null;
}

function gloss(meaning: string) {
  const cut = meaning.split(/[→/（(]/)[0]?.trim() ?? "";
  if (cut.length < 1 || cut.length > 40) return "";
  return cut;
}

function sameKana(left: string, right: string) {
  return kataToHira(left) === kataToHira(right);
}

const yes = () => true;

const OPPOSITES: { from: string; to: string; fromOk: (meaning: string) => boolean; toOk: (meaning: string) => boolean }[] = [
  { from: "おおきい", to: "ちいさい", fromOk: yes, toOk: yes },
  { from: "ちいさい", to: "おおきい", fromOk: yes, toOk: yes },
  { from: "あたらしい", to: "ふるい", fromOk: yes, toOk: yes },
  { from: "ふるい", to: "あたらしい", fromOk: yes, toOk: yes },
  { from: "おおい", to: "すくない", fromOk: yes, toOk: yes },
  { from: "すくない", to: "おおい", fromOk: yes, toOk: yes },
  { from: "ちかい", to: "とおい", fromOk: yes, toOk: yes },
  { from: "とおい", to: "ちかい", fromOk: yes, toOk: yes },
  { from: "はやい", to: "おそい", fromOk: yes, toOk: yes },
  { from: "ひろい", to: "せまい", fromOk: yes, toOk: yes },
  { from: "すき", to: "きらい", fromOk: yes, toOk: yes },
  { from: "きらい", to: "すき", fromOk: yes, toOk: yes },
  { from: "いそがしい", to: "ひま", fromOk: yes, toOk: yes },
  { from: "ひま", to: "いそがしい", fromOk: yes, toOk: yes },
  { from: "あまい", to: "からい", fromOk: yes, toOk: yes },
  { from: "からい", to: "あまい", fromOk: yes, toOk: yes },
  { from: "たかい", to: "ひくい", fromOk: (meaning) => /cao/.test(meaning), toOk: (meaning) => /thấp/.test(meaning) },
  { from: "ひくい", to: "たかい", fromOk: (meaning) => /thấp/.test(meaning), toOk: (meaning) => /cao/.test(meaning) },
  { from: "たかい", to: "やすい", fromOk: (meaning) => /đắt/.test(meaning), toOk: (meaning) => /rẻ/.test(meaning) },
  { from: "やすい", to: "たかい", fromOk: (meaning) => /rẻ/.test(meaning), toOk: (meaning) => /đắt/.test(meaning) },
  { from: "あつい", to: "さむい", fromOk: (meaning) => /thời tiết/.test(meaning), toOk: (meaning) => /thời tiết/.test(meaning) },
  { from: "さむい", to: "あつい", fromOk: (meaning) => /thời tiết/.test(meaning), toOk: (meaning) => /thời tiết/.test(meaning) },
  { from: "あつい", to: "つめたい", fromOk: (meaning) => /đồ vật/.test(meaning), toOk: (meaning) => /đồ vật/.test(meaning) },
  { from: "つめたい", to: "あたたかい", fromOk: (meaning) => /đồ vật/.test(meaning), toOk: (meaning) => /đồ vật/.test(meaning) },
  { from: "あたたかい", to: "すずしい", fromOk: (meaning) => /thời tiết/.test(meaning), toOk: yes },
  { from: "すずしい", to: "あたたかい", fromOk: yes, toOk: (meaning) => /thời tiết/.test(meaning) },
  { from: "あたたかい", to: "つめたい", fromOk: (meaning) => /đồ vật/.test(meaning), toOk: (meaning) => /đồ vật/.test(meaning) },
];

function wordReading(word: Word, words: Word[], glyphs: Glyph[]): ExamQuestion | null {
  const surface = surfaceOf(word);
  const reading = readingOf(word);
  if (!surface || !hasKanji(surface) || reading.length < 2 || phraseLike(surface)) return null;
  const sentence = cloak(exampleJp(word), surface, "kanji") || fallbackSentence(surface, surface, reading, word.meaning);
  const composed = misreadings(surface, reading, glyphs);
  const others = words.map(readingOf).filter((item) => item && item !== reading);
  const same = shuffle(others.filter((item) => endingOf(item) && endingOf(item) === endingOf(reading)));
  const rest = shuffle(others.filter((item) => !same.includes(item)));
  const jukuji = composed.length >= 3 && !composed.includes(reading);
  const traps = jukuji ? composed : [...same, ...rest, ...composed];
  return make(`yomi-${word.id}`, "Kanji", YOMI, sentence, reading, traps);
}

function kanaToKanji(word: Word, words: Word[]): ExamQuestion | null {
  const surface = surfaceOf(word);
  const reading = readingOf(word);
  if (!surface || !hasKanji(surface) || surface.includes("～") || reading.length < 2 || phraseLike(surface)) return null;
  if (words.some((item) => item.id !== word.id && readingOf(item) === reading && hasKanji(surfaceOf(item)))) return null;
  const sentence = cloak(exampleJp(word), surface, "kana", reading) || fallbackSentence(reading, surface, reading, word.meaning);
  const sameEnding = shuffle(
    words.map(surfaceOf).filter((item) => hasKanji(item) && item !== surface && endingOf(item) === endingOf(surface)),
  );
  const rest = shuffle(words.map(surfaceOf).filter((item) => hasKanji(item) && item !== surface));
  return make(`kaki-${word.id}`, "Kanji", KAKI, sentence, surface, [...sameEnding, ...rest]);
}

function addVocab(list: ExamQuestion[], words: Word[], pool: Word[]) {
  const people = ["わたし", "たなかさん", "ミラーさん", "やまださん", "アンさん", "マリアさん", "さとうさん", "キムさん", "いもうと", "おとうと", "ともだち", "せんせい", "おとうさん", "おかあさん", "がくせい", "せんぱい", "かれ", "かのじょ", "おじいさん", "おばあさん"];
  const ask = (line: (name: string) => string) => people.map(line);
  fillSet(list, words.filter(isFood), eatFrames("をたべます。"), (word) => isFood(word), pool, "food");
  fillSet(list, words.filter(isFood), eatFrames("をたべました。"), (word) => isFood(word), pool, "food2");
  fillSet(list, words.filter(isDrink), drinkFrames("をのみます。"), (word) => isDrink(word) || isFood(word), pool, "drink");
  fillSet(list, words.filter(isDrink), drinkFrames("をのみました。"), (word) => isDrink(word) || isFood(word), pool, "drink2");
  fillSet(list, words.filter(isPlace), placeFrames("へいきます。"), (word) => isPlace(word) || isCountry(word), pool, "place");
  fillSet(list, words.filter(isPlace), placeFrames("へいきました。"), (word) => isPlace(word) || isCountry(word), pool, "place2");
  fillSet(list, words.filter(isAge), ask((name) => `A：${name}はおいくつですか。\nB：（　　）です。`), isAge, pool, "age");
  fillSet(list, words.filter(isAge), ask((name) => `A：${name}はなんさいですか。\nB：（　　）です。`), isAge, pool, "age2");
  fillSet(list, words.filter(isMonth), ask((name) => `A：${name}のたんじょうびはなんがつですか。\nB：（　　）です。`), isMonth, pool, "month");
  fillSet(list, words.filter(isDay), ask((name) => `A：${name}のたんじょうびはなんにちですか。\nB：（　　）です。`), isDay, pool, "day");
  fillSet(list, words.filter(isDay), ask((name) => `A：${name}、きょうはなんにちですか。\nB：（　　）です。`), isDay, pool, "day2");
  fillSet(list, words.filter(isCountry), ask((name) => `A：${name}のおくにはどちらですか。\nB：（　　）です。`), isCountry, pool, "country");
  fillSet(list, words.filter(isCountry), ask((name) => `A：${name}はどこのくにのひとですか。\nB：（　　）のひとです。`), isCountry, pool, "country2");
  fillSet(list, words.filter(isJob), ask((name) => `A：${name}のおしごとはなんですか。\nB：（　　）です。`), isJob, pool, "job");
  fillSet(list, words.filter(isHobby), ask((name) => `A：${name}のしゅみはなんですか。\nB：（　　）です。`), isHobby, pool, "hobby");
  fillSet(list, words.filter(isHobby), ask((name) => `A：${name}はなにがすきですか。\nB：（　　）がすきです。`), isHobby, pool, "hobby2");
  addCollocations(list, words);
}

function addCollocations(list: ExamQuestion[], words: Word[]) {
  const surfaces = new Set(words.map(surfaceOf));
  const push = (key: string, sentence: string, answer: string, wrongs: string[]) => {
    if (!surfaces.has(answer)) return;
    add(list, make(`c-${key}`, "Từ vựng", FILL, sentence, answer, wrongs));
  };
  push("nomu", "あさ、みずを（　　）。", "飲みます", ["食べます", "見ます", "行きます"]);
  push("taberu", "ひるごはんを（　　）。", "食べます", ["飲みます", "見ます", "行きます"]);
  push("miru", "テレビを（　　）。", "見ます", ["飲みます", "食べます", "行きます"]);
  push("iku", "あした、としょかんへ（　　）。", "行きます", ["飲みます", "食べます", "見ます"]);
  push("suru", "まいにち、サッカーを（　　）。", "します", ["飲みます", "食べます", "見ます"]);
  push("asa", "A：いつぎゅうにゅうをのみますか。\nB：（　　）のみます。", "朝", ["テスト", "スキー", "冬"]);
  push("yoru", "A：いつテレビをみますか。\nB：（　　）みます。", "夜", ["テスト", "スキー", "パーティー"]);
  push("fuyu", "（　　）にスキーをします。", "冬", ["テスト", "スケジュール", "アルバイト"]);
  push("party", "しゅうまつ、（　　）へいきます。", "パーティー", ["テスト", "朝", "時間"]);
  push("arbeit", "しゅうまつ、（　　）をします。", "アルバイト", ["朝", "冬", "夜"]);
  push("test", "ごご、（　　）をします。", "テスト", ["朝", "冬", "夜"]);
  push("ii", "A：しゅうまつ、うみへいきます。\nB：（　　）。", "いいですね", ["朝", "テスト", "冬"]);
}

function fillSet(
  list: ExamQuestion[],
  answers: Word[],
  sentences: string[],
  reject: (word: Word) => boolean,
  pool: Word[],
  key: string,
) {
  const distractors = [...new Set(pool.filter((word) => !reject(word) && !isPromptWord(word)).map(surfaceOf).filter(Boolean))];
  shuffle(answers.filter((word) => surfaceOf(word) && !isPromptWord(word)))
    .slice(0, sentences.length)
    .forEach((word, index) => {
      const sentence = sentences[index];
      if (!sentence) return;
      add(list, make(`v-${key}-${word.id}`, "Từ vựng", FILL, sentence, surfaceOf(word), shuffle(distractors)));
    });
}

function eatFrames(tail: string) {
  const when = tail.includes("ました")
    ? ["きのう", "けさ", "ゆうべ", "おととい", "せんしゅう", "せんげつ", "さっき", "このあいだ", "きのう、うちで", "ゆうべ、レストランで", "けさ、うちで", "せんしゅう、しょくどうで", "おととい、うちで", "このあいだ、レストランで", "せんげつ、うちで", "きのう、しょくどうで"]
    : ["あさ", "ひる", "よる", "まいにち", "よく", "きょう", "あした", "いつも", "ときどき", "あさごはんに", "ひるごはんに", "よるごはんに", "しょくどうで", "うちで", "レストランで", "ともだちと"];
  return when.map((item) => `${item}（　　）${tail}`);
}

function drinkFrames(tail: string) {
  const when = tail.includes("ました")
    ? ["きのう", "けさ", "ゆうべ", "おととい", "せんしゅう", "さっき", "このあいだ", "きのう、うちで"]
    : ["あさ", "ひる", "よる", "まいにち", "よく", "きょう", "いま", "うちで"];
  return when.map((item) => `${item}（　　）${tail}`);
}

function placeFrames(tail: string) {
  const when = tail.includes("ました")
    ? ["きのう", "せんしゅう", "おととい", "けさ", "ゆうべ", "このあいだ", "せんげつ", "さっき"]
    : ["あした", "しゅうまつ", "まいにち", "きょう", "あさ", "午後", "ともだちと", "バスで"];
  return when.map((item) => `${item}、（　　）${tail}`);
}

function isFood(word: Word) {
  if (isDrink(word)) return false;
  const meaning = word.meaning.toLowerCase();
  if (/câu cá/.test(meaning)) return false;
  return ["thịt", "bánh", "gạo", "trứng", "cá", "rau", "cơm", "mì", "táo", "dâu", "salad", "sushi", "phô mai", "sô-cô-la", "chocolate", "cà ri", "dầu"].some((key) =>
    hasWord(meaning, key),
  );
}

function isDrink(word: Word) {
  const meaning = word.meaning.toLowerCase();
  if (/nước pháp|nước ấn|nước đức|nước mỹ|nước nhật|nước sốt/.test(meaning)) return false;
  return /cà phê|bia|hồng trà|trà xanh|trà đen|sữa|rượu|nước ép|nước lọc|nước ngọt|đồ uống|súp|soup/.test(meaning) || hasWord(meaning, "trà");
}

function lingerPlace(word: Word) {
  return isPlace(word) && !isPromptWord(word) && /trường|công viên|phòng|thư viện|nhà hàng|quán|siêu thị|công ty|bảo tàng|cửa hàng|biển/.test(word.meaning.toLowerCase());
}

function isPlace(word: Word) {
  const meaning = word.meaning.toLowerCase();
  if (/bạn cùng|một mình|bệnh cúm|làm thêm|việc làm|hòm thư|giấy|khu vực|quầy/.test(meaning)) return false;
  if (/^phòng(?:\s|$)/.test(meaning)) return true;
  return ["trường", "đại học", "bệnh viện", "công viên", "siêu thị", "nhà hàng", "thư viện", "ngân hàng", "bưu điện", "công ty", "bảo tàng", "cửa hàng", "nhà ga", "nhà thờ", "nhà vệ sinh", "quán", "thang máy", "thang cuốn", "suối nước", "rạp"].some(
    (key) => meaning.includes(key),
  );
}

function isCountry(word: Word) {
  const meaning = word.meaning.toLowerCase();
  if (/nước lọc|nước ép|nước ngọt|nước sốt|tiếng |người |mỹ thuật/.test(meaning)) return false;
  if (["nhật bản", "hàn quốc", "trung quốc", "thái lan", "việt nam", "nước pháp", "ấn độ", "nước đức", "brazil"].some((key) => meaning.includes(key))) return true;
  return ["mỹ", "ý", "úc", "nga", "pháp", "đức"].some((key) => hasWord(meaning, key));
}

function isAge(word: Word) {
  return /tuổi/i.test(word.meaning) && !/～|~/.test(word.word);
}

function isMonth(word: Word) {
  return /^tháng\s+\d+/i.test(word.meaning.trim());
}

function isDay(word: Word) {
  return /^ngày\s+(mồng\s+)?\d+/i.test(word.meaning.trim());
}

function isJob(word: Word) {
  const meaning = word.meaning.toLowerCase();
  if (/^công việc/.test(meaning)) return false;
  return /giáo viên|nhân viên|bác sĩ|kỹ sư|nội trợ|công chức/.test(meaning);
}

function isHobby(word: Word) {
  return /thể thao|bóng đá|quần vợt|bơi|phim|âm nhạc|đọc sách|du lịch|nấu ăn|câu cá|trượt tuyết/i.test(word.meaning);
}

function isPromptWord(word: Word) {
  if (/～|~/.test(word.word)) return true;
  const meaning = word.meaning.toLowerCase().trim();
  return /bao nhiêu|^mấy|cái gì|khi nào|ở đâu|cái nào|phía nào|^vậy|^xin lỗi|^vâng$|^không$|giống nhau|rất vui|mong được|^à/.test(meaning);
}

function hasWord(meaning: string, word: string) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}([^\\p{L}\\p{N}]|$)`, "iu").test(meaning);
}

function misreadings(surface: string, correct: string, glyphs: Glyph[]) {
  const parts = [...surface].filter((char) => hasKanji(char));
  if (parts.length < 2) return [];
  const sets = parts.map((char) => {
    const glyph = glyphs.find((item) => item.char === char);
    if (!glyph) return [];
    return [onOf(glyph), kunOf(glyph)].filter(Boolean);
  });
  if (sets.some((set) => set.length === 0)) return [];
  const combos: string[] = [];
  const walk = (index: number, acc: string) => {
    if (combos.length > 12) return;
    if (index === sets.length) {
      combos.push(acc);
      return;
    }
    for (const piece of sets[index] ?? []) walk(index + 1, acc + piece);
  };
  walk(0, "");
  return combos.filter((item) => item && item !== correct);
}

function endingOf(value: string) {
  if (value.endsWith("ます")) return "ます";
  if (value.endsWith("い")) return "い";
  return "";
}

function onOf(glyph: Glyph) {
  const on = (glyph.onyomi ?? "").split(/[、,\s]/)[0] ?? "";
  if (!on || on === "-" || on === "—") return "";
  return kataToHira(on);
}

function kunOf(glyph: Glyph) {
  const kun = (glyph.kunyomi ?? "").replace(/\./g, "");
  if (!kun || kun === "-" || kun === "—") return "";
  return kataToHira(kun);
}

export function baiOf(value: string) {
  return value.match(/Bài\s*(\d+)/)?.[1] ?? null;
}

function examWord(word: Word) {
  const surface = surfaceOf(word);
  if (!surface || surface.length > 12) return false;
  if (/[。？?！!、,～~]/.test(surface)) return false;
  if (!word.meaning.trim()) return false;
  return true;
}

function surfaceOf(word: Word) {
  return clean(word.word).replace(/\s+/g, "");
}

function readingOf(word: Word) {
  const kana = kanaReading(word);
  if (!kana) return "";
  const hira = kataToHira(kana).replace(/\s+/g, "");
  return /^[ぁ-んー]+$/.test(hira) ? hira : "";
}

function exampleJp(word: Word) {
  if (!word.example) return "";
  return word.example.split("→")[0]?.split("/")[0]?.trim() ?? "";
}

function fallbackSentence(token: string, surface: string, reading: string, meaning: string) {
  const gloss = meaning.toLowerCase();
  if (/năm nay/.test(gloss)) return `〔${token}〕、わたしは国へ帰ります。`;
  if (/書/.test(surface) && /かき|かく/.test(reading)) return `ここになまえを〔${token}〕。`;
  if (/帰/.test(surface) && /かえ/.test(reading)) return `８月に国へ〔${token}〕。`;
  if (/ます|ません|ました/.test(`${surface}${reading}`) || /^(ăn|uống|đi|đến|về|đọc|viết|mua|xem|nghe|học|làm|nói|gặp|ngủ)$/.test(gloss.trim())) {
    return `毎日〔${token}〕。`;
  }
  if (isFood({ meaning } as Word)) return `毎日〔${token}〕を食べます。`;
  if (isDrink({ meaning } as Word)) return `毎日〔${token}〕を飲みます。`;
  if (isPlace({ meaning } as Word)) return `明日〔${token}〕へ行きます。`;
  return `これは〔${token}〕です。`;
}

function cloak(sentence: string, surface: string, mode: "kanji" | "kana", reading = "") {
  const index = blankAt(sentence, surface);
  if (!sentence || index < 0) return "";
  const token = mode === "kanji" ? surface : reading;
  if (!token) return "";
  return `${sentence.slice(0, index)}〔${token}〕${sentence.slice(index + surface.length)}`;
}

function blankAt(sentence: string, token: string) {
  let from = 0;
  while (from < sentence.length) {
    const index = sentence.indexOf(token, from);
    if (index < 0) return -1;
    const before = sentence[index - 1] ?? "";
    const after = sentence[index + token.length] ?? "";
    if (!/[一-龯々]/.test(before) && !/[一-龯々]/.test(after)) return index;
    from = index + token.length;
  }
  return -1;
}

function hasKanji(value: string) {
  return /[一-龯々]/.test(value);
}

function phraseLike(value: string) {
  return /[がはをにでとへ]/.test(value);
}

function isNaAdj(word: Word) {
  return /（な）|\(な\)/.test(word.word);
}

function isIAdj(word: Word) {
  if (isNaAdj(word)) return false;
  const surface = clean(word.word);
  const reading = readingOf(word);
  if (!surface.endsWith("い") || !reading.endsWith("い")) return false;
  if (reading.length < 2 || reading.length > 7) return false;
  if (/[がはをにでとへもの]/.test(reading)) return false;
  if (/^(どの|なん|なに|だれ|どこ)/.test(reading)) return false;
  if (/ください|ます|ません|だった|かった/.test(`${surface}${reading}`)) return false;
  return true;
}

function clean(value: string) {
  return value.replace(/［.*?］/g, "").replace(/[（(].*?[）)]/g, "").trim();
}

function kataToHira(value: string) {
  return [...value]
    .map((char) => {
      const code = char.codePointAt(0) ?? 0;
      if (code >= 0x30a1 && code <= 0x30f6) return String.fromCodePoint(code - 0x60);
      return char;
    })
    .join("");
}
