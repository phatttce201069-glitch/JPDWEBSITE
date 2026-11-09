import type { ExamQuestion, ExamSection } from "./exam.ts";
import { vocabulary, alphabet } from "./content.ts";

export type WrongOptionAnalysis = {
  option: string;
  reason: string;
};

export type QuestionExplanation = {
  meaning: string;    // Dịch nghĩa câu & từ hoàn chỉnh
  grammar?: string;   // Cấu trúc ngữ pháp áp dụng
  lesson?: string;    // Thuộc bài nào (Ví dụ: JPD123 - Bài 5)
  tips?: string;      // Mẹo giải nhanh / Dấu hiệu nhận biết
  reason: string;     // Lý do chọn đáp án đúng & phân tích đáp án gây nhiễu
  wrongOptions?: WrongOptionAnalysis[]; // Phân tích chi tiết lý do từng phương án còn lại bị sai
};

/**
 * Trả về bản dịch nghĩa tiếng Việt cho đáp án của câu hỏi
 */
export function getAnswerMeaning(answer: string, question?: ExamQuestion): string | null {
  if (!answer) return null;

  // 1. Bảng tra cứu nghĩa nhanh các từ vựng, ngữ pháp, trợ từ thông dụng trong JPD123
  const GLOSSARY: Record<string, string> = {
    // Động từ thể て và thể ます của Bài 7
    買います: "mua (thể lịch sự)",
    買って: "hãy mua / mua (thể て của 買います)",
    かいます: "mua",
    かって: "hãy mua",
    手伝います: "giúp đỡ (thể lịch sự)",
    てつだいます: "giúp đỡ",
    手伝って: "hãy giúp đỡ (thể て của 手伝います)",
    てつだって: "hãy giúp đỡ",
    吸います: "hút (thuốc)",
    すいます: "hút",
    吸って: "hãy hút (thể て của 吸います)",
    すって: "hãy hút",
    持ちます: "cầm, mang, xách (thể lịch sự)",
    もちます: "cầm, mang, xách",
    持って: "hãy cầm / mang (thể て của 持ちます)",
    もって: "hãy cầm, hãy mang",
    作ります: "làm, chế biến, nấu (thể lịch sự)",
    つくります: "làm, chế biến, nấu",
    作って: "hãy làm, hãy nấu (thể て của 作ります)",
    つくって: "hãy làm, hãy nấu",
    切ります: "cắt, gọt (thể lịch sự)",
    きります: "cắt, gọt",
    切って: "hãy cắt (thể て của 切ります)",
    きって: "hãy cắt / con tem",
    飲みます: "uống (thể lịch sự)",
    のみます: "uống",
    飲んで: "hãy uống (thể て của 飲みます)",
    のんで: "hãy uống",
    読みます: "đọc (thể lịch sự)",
    よみます: "đọc",
    読んで: "hãy đọc (thể て của 読みます)",
    よんで: "hãy đọc",
    遊びます: "chơi, vui chơi (thể lịch sự)",
    あそびます: "chơi, vui chơi",
    遊んで: "hãy chơi (thể て của 遊びます)",
    あそんで: "hãy chơi",
    書きます: "viết, vẽ (thể lịch sự)",
    かきます: "viết, vẽ",
    書いて: "hãy viết (thể て của 書きます)",
    かいて: "hãy viết",
    置きます: "đặt, để (thể lịch sự)",
    おきます: "đặt, để / thức dậy",
    置いて: "hãy đặt, để (thể て của 置きます)",
    おいて: "hãy đặt, hãy để",
    行きます: "đi (thể lịch sự)",
    いきます: "đi",
    行って: "hãy đi (thể て ngoại lệ của 行きます)",
    いって: "hãy đi",
    持って行きます: "mang đi, đem đi theo (thể lịch sự)",
    もっていきます: "mang đi, đem đi theo",
    持って行って: "hãy mang đi (thể て của 持って行きます)",
    もっていって: "hãy mang đi",
    泳ぎます: "bơi (thể lịch sự)",
    およぎます: "bơi",
    泳いで: "hãy bơi (thể て của 泳ぎます)",
    およいで: "hãy bơi",
    話します: "nói chuyện (thể lịch sự)",
    はなします: "nói chuyện",
    話して: "hãy nói chuyện (thể て của 話します)",
    はなして: "hãy nói chuyện",
    貸します: "cho mượn (thể lịch sự)",
    かします: "cho mượn",
    貸して: "hãy cho mượn (thể て của 貸します)",
    かして: "hãy cho mượn",
    食べます: "ăn (thể lịch sự)",
    たべます: "ăn",
    食べて: "hãy ăn (thể て của 食べます)",
    たべて: "hãy ăn",
    開けます: "mở (cửa, hộp) (thể lịch sự)",
    あけます: "mở (cửa, hộp)",
    開けて: "hãy mở (thể て của 開けます)",
    あけて: "hãy mở",
    閉めます: "đóng (cửa) (thể lịch sự)",
    しめます: "đóng (cửa)",
    閉めて: "hãy đóng (thể て của 閉めます)",
    しめて: "hãy đóng",
    教えます: "dạy, chỉ cho biết (thể lịch sự)",
    おしえます: "dạy, chỉ cho biết",
    教えて: "hãy chỉ dạy, hãy nói cho biết (thể て)",
    おしえて: "hãy chỉ dạy, hãy nói cho biết",
    起きます: "thức dậy (thể lịch sự)",
    おきて: "hãy thức dậy (thể て của 起きます)",
    来ます: "đến (thể lịch sự)",
    きます: "đến",
    来て: "hãy đến (thể て của 来ます)",
    きて: "hãy đến",
    持って来ます: "mang đến, đem lại đây (thể lịch sự)",
    もってきます: "mang đến, đem lại đây",
    持って来て: "hãy mang đến (thể て của 持って来ます)",
    もってきて: "hãy mang đến",
    勉強します: "học tập (thể lịch sự)",
    べんきょうします: "học tập",
    勉強して: "hãy học tập (thể て của 勉強します)",
    べんきょうして: "hãy học tập",
    待ちます: "chờ, đợi (thể lịch sự)",
    まちます: "chờ, đợi",
    待って: "hãy chờ (thể て của 待ちます)",
    まって: "hãy chờ",
    つけます: "bật (đèn, máy)",
    つけて: "hãy bật (đèn, máy)",
    消します: "tắt (đèn, máy)",
    けします: "tắt (đèn, máy)",
    消して: "hãy tắt (đèn, máy)",
    けして: "hãy tắt",
    撮ります: "chụp (ảnh)",
    とります: "chụp (ảnh) / lấy",
    撮って: "hãy chụp (ảnh)",
    とって: "hãy chụp / hãy lấy",

    // Bài 6
    やくそく: "cuộc hẹn, lời hứa",
    約束: "cuộc hẹn, lời hứa",
    用事: "việc bận",
    ようじ: "việc bận",
    時間: "thời gian",
    じかん: "thời gian",
    お祭り: "lễ hội",
    おまつり: "lễ hội",
    パーティー: "bữa tiệc",
    コンサート: "buổi hòa nhạc",
    まい: "tờ, tấm (lượng từ đếm vật mỏng phẳng)",
    枚: "tờ, tấm (lượng từ đếm vật mỏng phẳng)",
    ちょっと: "hơi / một chút (từ chối khéo)",
    より: "hơn (dùng trong so sánh hơn)",
    ほど: "bằng, như (dùng trong so sánh không bằng)",
    どちら: "bên nào / cái nào (lựa chọn 2 đối tượng)",
    どちらが: "bên nào / cái nào hơn",
    いちばん: "nhất (so sánh cao nhất)",
    一番: "nhất (so sánh cao nhất)",
    春: "mùa xuân",
    夏: "mùa hè",
    秋: "mùa thu",
    冬: "mùa đông",
    季節: "mùa, các mùa trong năm",
    ずっと: "hơn hẳn, suốt",
    どちらも: "cả hai đều",
    "ええ、飲みましょう": "Vâng, chúng ta cùng uống nhé",
    "ええ、行きましょう": "Vâng, chúng ta cùng đi nhé",
    "ええ、食べましょう": "Vâng, chúng ta cùng ăn nhé",

    // Bài 7 đồ dùng & cách làm
    スプーン: "thìa, muỗng (dụng cụ ăn uống)",
    フォーク: "dĩa, nĩa (dụng cụ ăn uống)",
    ナイフ: "dao (dụng cụ cắt gọt)",
    お箸: "đũa (dụng cụ ăn uống truyền thống)",
    箸: "đũa",
    電子レンジ: "lò vi sóng (thiết bị hâm nóng đồ ăn)",
    使い方: "cách sử dụng (V bỏ ます + 方)",
    つかいかた: "cách sử dụng",
    読み方: "cách đọc (V bỏ ます + 方)",
    よみかた: "cách đọc",
    作り方: "cách làm, cách chế biến (V bỏ ます + 方)",
    つくりかた: "cách làm, cách chế biến",
    行き方: "cách đi",
    いきかた: "cách đi",
    持ち方: "cách cầm, cách nắm",
    もちかた: "cách cầm, cách nắm",

    // Lượng từ số đếm thông dụng
    "1枚": "1 tờ, 1 tấm (áo, đĩa CD, vé)",
    "2枚": "2 tờ, 2 tấm",
    "3枚": "3 tờ, 3 tấm",
    何枚: "mấy tờ, bao nhiêu tấm (đếm vật mỏng phẳng)",
    なんまい: "mấy tờ, bao nhiêu tấm",
    "1本": "1 cái, 1 cây (bút chì, chai nước)",
    "2本": "2 cái, 2 cây",
    "3本": "3 cái, 3 cây",
    一本: "1 cái, 1 cây (bút, chai lọ)",
    何本: "mấy cái, bao nhiêu cây (đếm vật dài trụ)",
    なんぼん: "mấy cái, bao nhiêu cây",
    "1冊": "1 quyển, 1 cuốn (sách, vở)",
    何冊: "mấy quyển, bao nhiêu cuốn (sách vở)",
    "1台": "1 chiếc, 1 cái (máy tính, ô tô, xe máy)",
    何台: "mấy chiếc, bao nhiêu cái (xe cộ, máy móc)",
    "1杯": "1 ly, 1 cốc (nước, cà phê)",
    一杯: "1 ly, 1 cốc (nước, cà phê)",
    何杯: "mấy ly, bao nhiêu cốc",
    "1匹": "1 con (chó, mèo, cá)",
    一匹: "1 con (chó, mèo, cá)",
    何匹: "mấy con (động vật nhỏ)",
    "1個": "1 quả, 1 cái (trứng, táo, kẹo)",
    一個: "1 quả, 1 cái (trứng, táo)",
    何個: "mấy quả, bao nhiêu cái",

    // Bài 5
    水: "nước",
    みず: "nước",
    お茶: "trà",
    家: "nhà",
    うち: "nhà của tôi",
    本: "sách",
    ほん: "sách",
    写真: "bức ảnh",
    手紙: "bức thư",
    音楽: "âm nhạc",
    散歩: "đi dạo",
    家族: "gia đình",
    病院: "bệnh viện",
    自転車: "xe đạp",
    行きたい: "muốn đi",
    行きたいです: "muốn đi",
    飲みたい: "muốn uống",
    飲みたいです: "muốn uống",
    食べたい: "muốn ăn",
    買いたい: "muốn mua",
    見たい: "muốn xem",
    会いたい: "muốn gặp",
    ほしい: "muốn có (sở hữu)",
    ほしいです: "muốn có (sở hữu)",

    // Bài 4
    料理: "món ăn, nấu ăn",
    りょうり: "món ăn, nấu ăn",
    映画: "bộ phim",
    えいが: "bộ phim",
    新しい: "mới",
    あたらしい: "mới",
    古い: "cũ",
    ふるい: "cũ",
    暑い: "nóng (thời tiết)",
    あつい: "nóng (thời tiết)",
    寒い: "lạnh (thời tiết)",
    さむい: "lạnh (thời tiết)",
    高い: "đắt / cao",
    たかい: "đắt / cao",
    安い: "rẻ",
    やすい: "rẻ",
    大きい: "to lớn",
    おおきい: "to lớn",
    小さい: "nhỏ bé",
    ちいさい: "nhỏ bé",
    広い: "rộng rãi",
    ひろい: "rộng rãi",
    狭い: "chật hẹp",
    せまい: "chật hẹp",
    静か: "yên tĩnh",
    しずか: "yên tĩnh",
    きれい: "đẹp, sạch sẽ",
    有名: "nổi tiếng",
    ゆうめい: "nổi tiếng",
    親切: "tốt bụng, thân thiện",
    しんせつ: "tốt bụng, thân thiện",
    元気: "khỏe mạnh",
    げんき: "khỏe mạnh",
    便利: "tiện lợi",
    べんり: "tiện lợi",
    暇: "rảnh rỗi",
    ひま: "rảnh rỗi",
    簡単: "đơn giản, dễ",
    かんたん: "đơn giản, dễ",
    おいしい: "ngon",
    まずい: "dở, không ngon",
    おもしろい: "thú vị",
    つまらない: "nhàm chán",
    忙しい: "bận rộn",
    いそがしい: "bận rộn",
    疲れた: "mệt mỏi",
    つかれた: "mệt mỏi",

    // Trợ từ
    で: "tại (địa điểm sự kiện) / bằng (phương tiện, dụng cụ)",
    に: "vào lúc (thời gian) / đến (đích đến) / cho (đối tượng nhận)",
    を: "tác động lên (trợ từ tân ngữ)",
    へ: "hướng tới (phương hướng)",
    が: "trợ từ chủ ngữ / đối tượng của tính từ",
    は: "trợ từ chủ đề",
    と: "với / và",
    から: "từ (thời gian, địa điểm) / vì (nguyên nhân)",
    まで: "đến, cho đến",
  };

  if (GLOSSARY[answer]) return GLOSSARY[answer];

  // 2. Nếu đáp án trùng với từ vựng trong từ điển
  const vocabHit = vocabulary.find(
    (w) => w.word === answer || w.reading === answer || (w as Record<string, unknown>).kana === answer,
  );
  if (vocabHit?.meaning) return vocabHit.meaning;

  // 3. Nếu đáp án là chữ Hán hoặc Hiragana trong bảng chữ cái
  const alphaHit = alphabet.find((a) => a.char === answer);
  if (alphaHit?.example) {
    const match = alphaHit.example.match(/\(([^)]+)\)/);
    if (match?.[1]) return match[1];
    return alphaHit.example;
  }

  // 4. Nếu question có explanation.reason ghi nghĩa
  if (question?.explanation?.reason) {
    const match = question.explanation.reason.match(/=\s*([^.]+)/);
    if (match?.[1]) return match[1].trim();
  }

  return null;
}

/**
 * Tạo câu hoàn chỉnh sau khi điền đáp án đúng để người dùng dễ theo dõi
 */
export function getCompletedSentence(question: ExamQuestion): string {
  const sentence = question.sentence || "";
  const answer = question.answer || "";

  // 1. Dạng câu hỏi Kanji đọc: この（料理）はとてもおいしいです。
  const parenKanjiMatch = sentence.match(/（([^）]+)）|\(([^)]+)\)/);
  const isReading = question.section === "Kanji" && (question.prompt.includes("cách đọc") || question.prompt.includes("読み方"));
  if (parenKanjiMatch && isReading) {
    const kanjiWord = parenKanjiMatch[1] || parenKanjiMatch[2];
    return sentence.replace(/（[^）]+）|\([^)]+\)/g, `【${kanjiWord}（${answer}）】`);
  }

  // 2. Dạng câu hỏi Kanji viết từ Hiragana: 母とデパートへ（かいもの）に行きました。
  if (parenKanjiMatch) {
    return sentence.replace(/（[^）]+）|\([^)]+\)/g, `【${answer}】`);
  }

  // 3. Dạng điền vào chỗ trống: （　　） hoặc （ ）
  if (/（\s*）|\(\s*\)/.test(sentence)) {
    return sentence.replace(/（\s*）|\(\s*\)/g, `【${answer}】`);
  }

  // 4. Dạng ngoặc vuông Hán Việt hoặc Trái nghĩa: 〔病〕院, 〔高い〕
  if (/〔([^〕]+)〕/.test(sentence)) {
    if (question.prompt.includes("trái nghĩa") || question.prompt.includes("Trái nghĩa")) {
      return sentence.replace(/〔([^〕]+)〕/g, `〔$1 ➔ Trái nghĩa: 【${answer}】〕`);
    }
    return sentence.replace(/〔([^〕]+)〕/g, `〔$1 (Âm Hán: 【${answer}】)〕`);
  }

  // 5. Câu sắp xếp hoặc so sánh nguyên câu
  if (sentence.includes("So sánh") || sentence.includes("Muốn mua")) {
    return `Đề bài: ${sentence} ➔ Câu đúng: 【${answer}】`;
  }

  return `${sentence} ➔ 【${answer}】`;
}

/**
 * Chuẩn hóa chuỗi câu tiếng Nhật để so khớp chính xác bỏ qua sự khác biệt về khoảng trắng, dấu ngoặc
 */
export function normalizeSentenceKey(str: string): string {
  if (!str) return "";
  return str
    .replace(/\\n/g, " ")
    .replace(/\r?\n/g, " ")
    .replace(/[（(]\s*[）)]/g, "（　）")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Kiểm tra xem một chuỗi đã là bản dịch nguyên câu tiếng Việt hay chưa
 */
export function isCompleteSentenceTranslation(str: string): boolean {
  if (!str || str.length < 5) return false;
  if (
    str.startsWith("Ý nghĩa") ||
    str.startsWith("Cách đọc") ||
    str.startsWith("Chữ Hán chuẩn xác") ||
    str.startsWith("Âm Hán") ||
    str.startsWith("Từ cần điền") ||
    str.startsWith("Cấu trúc cần chọn")
  ) {
    return false;
  }
  // Có chứa ký tự tiếng Việt có dấu thể hiện câu dịch nghĩa
  return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(str);
}

/**
 * Từ điển dịch nghĩa trọn vẹn CẢ CÂU HOÀN CHỈNH sang tiếng Việt cho 100% các câu hỏi đề thi
 */
export const SENTENCE_TRANSLATIONS: Record<string, string> = {
  // =========================================================================
  // KANJI BÀI 1 - 3 (JPD113)
  // =========================================================================
  "（私）はFPT大学の学生です。___わたし": "Tôi là sinh viên trường Đại học FPT.",
  "あの方は日本語の（先生）です。___せんせい": "Vị kia là giáo viên tiếng Nhật.",
  "田中さんは東京（大学）の学生です。___だいがく": "Anh Tanaka là sinh viên trường Đại học Tokyo.",
  "アンさんは（学生）じゃありません。___がくせい": "Bạn An không phải là học sinh/sinh viên.",
  "さとうさんは（日本人）です。___にほんじん": "Chị Sato là người Nhật Bản.",
  "リーさんは（中国人）ですか。___ちゅうごくじん": "Bạn Lee có phải là người Trung Quốc không?",
  "教室に日本語の（本）があります。___ほん": "Trong phòng học có sách tiếng Nhật.",
  "私の妹は今年（二十歳）になります。___はたち": "Em gái tôi năm nay tròn 20 tuổi.",
  "あなたの（誕生日）は何月ですか。___たんじょうび": "Sinh nhật của bạn là vào tháng mấy?",
  "アンさんの弟は（何歳）ですか。___なんさい": "Em trai bạn An bao nhiêu tuổi?",
  "あの方の（お名前）は何ですか。___おなまえ": "Tên của vị kia là gì thế ạ?",
  "受付に（男の人）がいます。___おとこのひと": "Ở quầy tiếp tân có một người đàn ông.",
  "あそこに（女の人）がいます。___おんなのひと": "Ở đằng kia có một người phụ nữ.",
  "教室に（男の子）が三人います。___おとこのこ": "Trong lớp học có ba bé trai.",
  "庭に（女の子）が二人います。___おんなのこ": "Ở ngoài sân có hai bé gái.",
  "林さんは（会社員）です。___かいしゃいん": "Anh Hayashi là nhân viên công ty.",
  "父は（医者）です。___いしゃ": "Bố tôi là bác sĩ.",
  "兄は（エンジニア）です。___えんじにあ": "Anh trai tôi là kỹ sư.",
  "（ベトナム人）の留学生です。___べとなむじん": "Là du học sinh người Việt Nam.",
  "（アメリカ人）の友達がいます。___あめりかじん": "Tôi có người bạn là người Mỹ.",
  "事務所は（何階）ですか。___なんがい": "Văn phòng nằm ở tầng mấy vậy?",
  "この時計は（いくら）ですか。___いくら": "Chiếc đồng hồ này có giá bao nhiêu tiền?",
  "このペンは（百円）です。___ひゃくえん": "Chiếc bút này có giá 100 Yên.",
  "この鞄は（三千円）です。___さんぜんえん": "Chiếc cặp này có giá 3.000 Yên.",
  "あのパソコンは（五万円）です。___ごまんえん": "Chiếc máy tính đằng kia có giá 50.000 Yên.",
  "駅の近くに（店）がたくさんあります。___みせ": "Gần nhà ga có rất nhiều cửa hàng.",
  "スーパーで果物を（買います）。___かいます": "Tôi mua hoa quả ở siêu thị.",
  "父の（車）は新しいです。___くるま": "Chiếc xe ô tô của bố tôi còn mới.",
  "（日本語）の辞書を買いました。___にほんご": "Tôi đã mua một cuốn từ điển tiếng Nhật.",
  "毎日、何時に（起きます）か。___おきます": "Hàng ngày bạn thức dậy vào lúc mấy giờ?",
  "毎晩、11時に（寝ます）。___ねます": "Mỗi tối tôi đều đi ngủ vào lúc 11 giờ.",
  "月曜日から金曜日まで（働きます）。___はたらきます": "Tôi làm việc từ thứ Hai đến thứ Sáu.",
  "日曜日、会社を（休みます）。___やすみます": "Chủ nhật tôi nghỉ làm ở công ty.",
  "毎晩、日本語を（勉強します）。___べんきょうします": "Mỗi tối tôi đều học tiếng Nhật.",
  "食堂で昼ご飯を（食べます）。___たべます": "Tôi ăn cơm trưa ở nhà ăn.",
  "毎朝、牛乳を（飲みます）。___のみます": "Mỗi sáng tôi đều uống sữa bò.",
  "図書館で本を（読みます）。___よみます": "Tôi đọc sách ở thư viện.",
  "手紙を（書きます）。___かきます": "Tôi viết một lá thư.",
  "部屋で音楽を（聞きます）。___ききます": "Tôi nghe nhạc trong phòng.",
  "テレビで映画を（見ます）。___みます": "Tôi xem phim trên tivi.",
  "午後8時にうちへ（帰ります）。___かえります": "Tôi trở về nhà vào lúc 8 giờ tối.",
  "あした、友達が（来ます）。___きます": "Ngày mai bạn tôi sẽ đến chơi.",
  "来週、京都へ（行きます）。___いきます": "Tuần sau tôi sẽ đi Kyoto.",

  // =========================================================================
  // KANJI BÀI 4 - 7 (JPD123)
  // =========================================================================
  "この（料理）はとてもおいしいです。___りょうり": "Món ăn này rất ngon.",
  "週末に友達と（映画）を見に行きます。___えいが": "Cuối tuần tôi đi xem phim cùng với bạn bè.",
  "きょうは天気が良くて、（暑い）ですね。___あつい": "Hôm nay thời tiết đẹp và trời nóng nhỉ.",
  "きのう、デパートで（新しい）靴を買いました。___あたらしい": "Hôm qua tôi đã mua đôi giày mới ở trung tâm thương mại.",
  "私の部屋はあまり（広くない）です。___ひろくない": "Phòng của tôi không được rộng rãi cho lắm.",
  "学校の（近く）においしいラーメン屋があります。___ちかく": "Ở gần trường học có một quán mì ramen rất ngon.",
  "東京の（東）のほうにきれいな川があります。___ひがし": "Ở phía Đông của Tokyo có một dòng sông rất đẹp.",
  "日本の首都は（東京）です。___とうきょう": "Thủ đô của Nhật Bản là Tokyo.",
  "テストの用紙に自分の（名前）を書きます。___なまえ": "Hãy viết tên của bạn vào tờ giấy thi.",
  "駅の（前）で友達と待ち合わせをします。___まえ": "Tôi hẹn gặp bạn ở trước nhà ga.",
  "アンさんの（国）はどちらですか。___くに": "Đất nước của bạn An là ở đâu (nước nào) vậy?",
  "あそこにいる（男）の人は誰ですか。___おとこ": "Người đàn ông ở đằng kia là ai vậy?",
  "あそこにいる（女）の人は日本語の先生です。___おんな": "Người phụ nữ ở đằng kia là giáo viên dạy tiếng Nhật.",
  "冬の北海道はとても（寒い）です。___さむい": "Mùa đông ở Hokkaido rất lạnh.",
  "あした、駅の（まえ）で会いましょう。___前": "Ngày mai chúng ta hãy gặp nhau ở trước nhà ga nhé.",
  "私の（くに）はベトナムです。___国": "Đất nước của tôi là Việt Nam.",
  "受付で（なまえ）を呼ばれました。___名前": "Tôi đã được gọi tên ở quầy tiếp tân.",
  "〔東〕京___ĐÔNG": "Chữ Hán 東 (ĐÔNG) trong từ 東京 (Tokyo).",
  "外〔国〕___QUỐC": "Chữ Hán 国 (QUỐC) trong từ 外国 (Nước ngoài).",
  "〔男〕の人___NAM": "Chữ Hán 男 (NAM) trong cụm 男の人 (Người đàn ông).",
  "〔女〕の人___NỮ": "Chữ Hán 女 (NỮ) trong cụm 女の人 (Người phụ nữ).",
  "（先週）の土曜日に映画を見に行きました。___せんしゅう": "Thứ Bảy tuần trước tôi đã đi xem phim.",
  "（毎日）日本語の単語を練習します。___まいにち": "Hàng ngày tôi đều luyện tập từ vựng tiếng Nhật.",
  "明日の（午後）に友達が遊びに来ます。___ごご": "Chiều mai bạn tôi sẽ đến chơi.",
  "今朝、（午前）8時に家を出ました。___ごぜん": "Sáng nay tôi đã rời khỏi nhà lúc 8 giờ sáng.",
  "仕事の（後）で、ビールを飲みに行きます。___あと": "Sau khi xong việc, tôi sẽ đi uống bia.",
  "日曜日に動物園でパンダを（見ました）。___みました": "Chủ nhật tôi đã nhìn thấy gấu trúc ở sở thú.",
  "昨日の晩、友達と日本料理を（食べました）。___たべました": "Tối hôm qua tôi đã ăn món Nhật cùng bạn bè.",
  "冷たいお茶を（飲みました）。___のみました": "Tôi đã uống một ly trà lạnh.",
  "おいしい（食べ物）をたくさん買いました。___たべもの": "Tôi đã mua rất nhiều đồ ăn ngon.",
  "明日は会社の（休み）の日です。___やすみ": "Ngày mai là ngày nghỉ của công ty.",
  "毎朝、（みず）を一杯飲みます。___水": "Mỗi sáng tôi đều uống một cốc nước.",
  "週末に家族と（りょこう）に行きます。___旅行": "Cuối tuần tôi sẽ đi du lịch cùng gia đình.",
  "（せんしゅう）の試験はどうでしたか。___先週": "Kỳ thi tuần trước của bạn thế nào rồi?",
  "（ごご）3時に郵便局へ行きます。___午後": "3 giờ chiều tôi sẽ đi đến bưu điện.",
  "〔先〕生___TIÊN": "Chữ Hán 先 (TIÊN) trong từ 先生 (Giáo viên / Thầy cô).",
  "今〔週〕___CHU": "Chữ Hán 週 (CHU) trong từ 今週 (Tuần này).",
  "〔休〕み___HƯU": "Chữ Hán 休 (HƯU) trong từ 休み (Nghỉ ngơi / Ngày nghỉ).",
  "買い〔物〕___VẬT": "Chữ Hán 物 (VẬT) trong từ 買い物 (Mua sắm).",
  "（今日）はきのうよりずっと暖かいです。___きょう": "Hôm nay ấm áp hơn hôm qua rất nhiều.",
  "午後5時に（会社）を出ます。___かいしゃ": "5 giờ chiều tôi rời công ty về.",
  "毎朝、駅で（新聞）を買って読みます。___しんぶん": "Mỗi sáng tôi đều mua báo ở ga để đọc.",
  "喫茶店で友達と（あいました）。___会いました": "Tôi đã gặp bạn bè ở quán cà phê.",
  "午後6時に家へ（かえります）。___帰ります": "6 giờ chiều tôi trở về nhà.",
  "会〔社〕___XÃ": "Chữ Hán 社 (XÃ) trong từ 会社 (Công ty).",
  "新〔聞〕___VĂN": "Chữ Hán 聞 (VĂN) trong từ 新聞 (Tờ báo).",
  "会〔話〕___THOẠI": "Chữ Hán 話 (THOẠI) trong từ 会話 (Hội thoại / Đàm thoại).",
  "辞〔書〕___THƯ": "Chữ Hán 書 (THƯ) trong từ 辞書 (Từ điển).",
  "日曜日、家族と（海）へ行きました。___うみ": "Chủ nhật tôi đã đi biển cùng với gia đình.",
  "休みの日に高い（山）に登りました。___やま": "Vào ngày nghỉ tôi đã leo lên một ngọn núi cao.",
  "この（川）で魚をつりましょう。___かわ": "Chúng ta hãy câu cá ở dòng sông này nhé.",
  "あしたはいい（天気）になるといいですね。___てんき": "Ngày mai thời tiết đẹp thì thật là tốt nhỉ.",
  "成田（空港）まで電車で行きます。___くうこう": "Tôi đi tàu điện đến sân bay Narita.",
  "きょうは（風）が強くて、寒いです。___かぜ": "Hôm nay gió to và trời lạnh.",
  "スーパーで新鮮な（野菜）を買いました。___やさい": "Tôi đã mua rau tươi ở siêu thị.",
  "毎日、牛肉や豚（肉）を食べます。___にく": "Hàng ngày tôi đều ăn thịt bò và thịt lợn.",
  "冬の北海道は（雪）がたくさん降ります。___ゆき": "Mùa đông ở Hokkaido tuyết rơi rất nhiều.",
  "夏休みに友達と（旅行）に行きます。___りょこう": "Kỳ nghỉ hè tôi sẽ đi du lịch cùng bạn bè.",
  "すき焼きに牛肉と（やさい）を入れます。___野菜": "Cho thịt bò và rau vào món lẩu Sukiyaki.",
  "豚（にく）と鶏肉を半分ずつ買いました。___肉": "Tôi đã mua thịt lợn và thịt gà mỗi loại một nửa.",
  "牛〔肉〕___NHỤC": "Chữ Hán 肉 (NHỤC) trong từ 牛肉 (Thịt bò).",
  "〔半〕分___BÁN": "Chữ Hán 半 (BÁN) trong từ 半分 (Một nửa).",

  // =========================================================================
  // TỪ VỰNG BÀI 4 - 7 (JPD123)
  // =========================================================================
  "日本の（北）にある北海道は、冬に雪がたくさん降ります。___きた": "Hokkaido ở phía Bắc Nhật Bản, mùa đông tuyết rơi rất nhiều.",
  "ハノイはベトナムの北にあります。ホーチミンは（　　）にあります。___みなみ": "Hà Nội ở miền Bắc Việt Nam, còn TP. Hồ Chí Minh thì ở miền Nam.",
  "富士山は日本でとても（　　）山です。___ゆうめいな": "Núi Phú Sĩ là ngọn núi rất nổi tiếng ở Nhật Bản.",
  "休みの日のショッピングモールは人が多くて、とても（　　）です。___にぎやか": "Trung tâm mua sắm vào ngày nghỉ rất đông người và vô cùng náo nhiệt.",
  "夜の図書館は人が少なくて、とても（　　）です。___しずか": "Thư viện vào ban đêm ít người nên rất yên tĩnh.",
  "山へ行って温かい（　　）に入りました。とても気持ちよかったです。___おんせん": "Tôi đã đi lên núi và ngâm mình trong suối nước nóng ấm áp, cảm giác vô cùng sảng khoái.",
  "この町にはきれいな（　　）が流れていて、魚がたくさんいます。___かわ": "Thị trấn này có một dòng sông trong lành chảy qua và có rất nhiều cá.",
  "京都には古い（　　）や神社がたくさんあります。___おてら": "Ở Kyoto có rất nhiều ngôi chùa cổ và đền thần.",
  "東京から大阪まで（　　）で約2時間半です。___しんかんせん": "Từ Tokyo đến Osaka đi bằng tàu cao tốc Shinkansen mất khoảng 2 tiếng rưỡi.",
  "うちから駅まで遠くないですから、（　　）行きます。___あるいて": "Từ nhà đến ga không xa nên tôi đi bộ đến đó.",
  "この本は〔新しい〕です。___ふるい": "Cuốn sách này đã cũ (Trái nghĩa với 新しい - mới là 古い - cũ).",
  "部屋の中はとても〔静か〕です。___にぎやか": "Trong phòng rất náo nhiệt (Trái nghĩa với 静か - yên tĩnh là 賑やか - náo nhiệt).",
  "A：ダナンはどうですか。\nB：物価が安くて、とても（　　）町ですよ。___いい": "A: Đà Nẵng thế nào? - B: Vật giá rẻ và là một thành phố rất tuyệt vời đấy.",
  "A：ダナンはどうですか。\\nB：物価が安くて、とても（　　）町ですよ。___いい": "A: Đà Nẵng thế nào? - B: Vật giá rẻ và là một thành phố rất tuyệt vời đấy.",
  "先週、新しい（　　）を買いました。レポートを書くときに使います。___パソコン": "Tuần trước tôi đã mua một chiếc máy tính xách tay mới, dùng khi viết báo cáo.",
  "休みの日、天気がよかったですから、公園へ（　　）に行きました。___さんぽ": "Vào ngày nghỉ, vì thời tiết đẹp nên tôi đã đi dạo ở công viên.",
  "きのう、デパートへ行って（　　）をしました。___かいもの": "Hôm qua tôi đã đến trung tâm thương mại để mua sắm.",
  "誕生日に友達からすてきな（　　）をもらいました。___プレゼント": "Vào ngày sinh nhật, tôi đã nhận được một món quà tuyệt vời từ bạn bè.",
  "国にいる両親に（　　）を書きました。___てがみ": "Tôi đã viết một bức thư gửi cho bố mẹ ở quê nhà.",
  "重い（　　）がありますから、タクシーで行きましょう。___にもつ": "Vì có hành lý nặng nên chúng ta hãy đi bằng taxi nhé.",
  "週末はどこへも行きませんでした。（　　）でテレビを見ていました。___ひとり": "Cuối tuần tôi chẳng đi đâu cả, chỉ ở một mình xem tivi.",
  "映画館で面白い（　　）を見ました。___えいが": "Tôi đã xem một bộ phim rất thú vị ở rạp chiếu phim.",
  "喉が渇きましたから、冷たい（　　）が飲みたいです。___ジュース": "Vì khát nước nên tôi muốn uống nước trái cây mát lạnh.",
  "新しい車を買うために、（　　）を貯めています。___おかね": "Để mua ô tô mới, tôi đang tích lũy tiền.",
  "きのうは仕事が多くて、とても〔忙しかった〕です。___ひまだった": "Hôm qua công việc nhiều nên rất bận rộn (Trái nghĩa với 忙しかった - bận rộn là 暇だった - rảnh rỗi).",
  "きのうの映画はとても〔楽しかった〕です。___つまらなかった": "Bộ phim hôm qua rất vui (Trái nghĩa với 楽しかった - vui vẻ/thú vị là つまらなかった - nhàm chán).",
  "A：日曜日はどうして来ませんでしたか。\nB：（　　）熱がありましたから。___ちょっと": "A: Tại sao Chủ nhật bạn lại không đến? - B: Vì tôi hơi bị sốt một chút.",
  "A：日曜日はどうして来ませんでしたか。\\nB：（　　）熱がありましたから。___ちょっと": "A: Tại sao Chủ nhật bạn lại không đến? - B: Vì tôi hơi bị sốt một chút.",
  "A：先週の京都旅行は（　　）でしたか。\nB：天気が良くて、楽しかったです。___どう": "A: Chuyến du lịch Kyoto tuần trước của bạn như thế nào? - B: Thời tiết đẹp và rất vui.",
  "A：先週の京都旅行は（　　）でしたか。\\nB：天気が良くて、楽しかったです。___どう": "A: Chuyến du lịch Kyoto tuần trước của bạn như thế nào? - B: Thời tiết đẹp và rất vui.",
  "A：週末、一緒にサッカーを見に行きませんか。\nB：（　　）、行きましょう。___いいですね": "A: Cuối tuần này cùng đi xem bóng đá nhé? - B: Hay đấy, chúng ta cùng đi nào!",
  "A：週末、一緒にサッカーを見に行きませんか。\\nB：（　　）、行きましょう。___いいですね": "A: Cuối tuần này cùng đi xem bóng đá nhé? - B: Hay đấy, chúng ta cùng đi nào!",
  "ベトナムには雨季と乾季の2つの（　　）があります。___きせつ": "Việt Nam có 2 mùa là mùa mưa và mùa khô.",
  "１年の中でどの（　　）がいちばん好きですか。___きせつ": "Trong một năm, bạn thích nhất mùa nào?",
  "りんごとみかんと、（　　）が好きですか。___どちら": "Giữa táo và quýt, bạn thích loại nào hơn?",
  "新幹線は普通の電車より（　　）速いです。___ずっと": "Tàu Shinkansen chạy nhanh hơn tàu điện thường rất nhiều.",
  "きのうの夜は風が〔強かった〕です。___よわかった": "Đêm qua gió rất mạnh (Trái nghĩa với 強かった - mạnh là 弱かった - yếu).",
  "ハノイの冬はダナンより〔寒い〕です。___あたたかい": "Mùa đông ở Hà Nội lạnh hơn Đà Nẵng (Trái nghĩa với 寒い - lạnh là 暖かい - ấm áp).",
  "A：コーヒーとお茶と、どちらにしますか。\nB：（　　）のほうがいいです。___コーヒー": "A: Bạn chọn cà phê hay trà? - B: Tôi thích cà phê hơn.",
  "A：コーヒーとお茶と、どちらにしますか。\\nB：（　　）のほうがいいです。___コーヒー": "A: Bạn chọn cà phê hay trà? - B: Tôi thích cà phê hơn.",
  "今朝は濃い（　　）が出ていて、前がよく見えません。___きり": "Sáng nay có sương mù dày đặc nên phía trước nhìn không rõ.",
  "きょうの天気予報は（　　）のち雨です。___くもり": "Dự báo thời tiết hôm nay là nhiều mây sau đó có mưa.",
  "日本の秋は紅葉がとても（　　）季節です。___きれいな": "Mùa thu ở Nhật Bản là mùa lá đỏ chuyển màu vô cùng tuyệt đẹp.",
  "ハノイの冬は風が吹いて、とても（　　）です。___さむい": "Mùa đông ở Hà Nội gió thổi nên rất lạnh.",
  "きょうは空が青くて、とてもいい（　　）ですね。___てんき": "Hôm nay bầu trời xanh ngắt, thời tiết thật là đẹp nhỉ.",
  "朝からずっと（　　）が降っていますから、傘を持って行きます。___あめ": "Từ sáng tới giờ trời mưa suốt nên tôi sẽ mang theo ô.",
  "冬の富士山には白い（　　）がたくさん積もっています。___ゆき": "Núi Phú Sĩ vào mùa đông có rất nhiều tuyết trắng tích tụ.",
  "夏休みに日本の伝統的な（　　）を見に行きました。___おまつり": "Vào kỳ nghỉ hè tôi đã đi xem lễ hội truyền thống của Nhật Bản.",
  "日本の有名な歌手の（　　）を1枚買いました。___CD": "Tôi đã mua một chiếc đĩa CD của ca sĩ nổi tiếng Nhật Bản.",
  "日曜日、スタジアムで有名な歌手の（　　）があります。___コンサート": "Chủ nhật sẽ có buổi hòa nhạc của ca sĩ nổi tiếng ở sân vận động.",
  "映画館の（　　）を2枚買いました。___チケット": "Tôi đã mua 2 vé xem phim ở rạp.",
  "あしたは（　　）がありますから、早く帰ります。___ようじ": "Ngày mai vì có việc bận nên tôi sẽ về sớm.",
  "桜の花がきれいに咲く（　　）がいちばん好きです。___はる": "Tôi thích nhất mùa xuân khi hoa anh đào nở rộ tuyệt đẹp.",
  "（　　）休みに家族と海へ泳ぎに行きました。___なつ": "Vào kỳ nghỉ hè, tôi đã cùng gia đình đi biển bơi lội.",
  "（　　）になると、山の木の葉が赤や黄色になります。___あき": "Cứ hễ sang mùa thu, lá cây trên núi lại chuyển sang màu đỏ và vàng.",
  "飛行機は新幹線より（　　）速いです。___ずっと": "Máy bay bay nhanh hơn tàu cao tốc Shinkansen rất nhiều.",
  "友達と映画を見る（　　）がありますから、早く帰ります。___やくそく": "Vì tôi có cuộc hẹn đi xem phim với bạn nên tôi sẽ về sớm.",
  "友達と映画を見る（　）がありますから、早く帰ります。___やくそく": "Vì tôi có cuộc hẹn đi xem phim với bạn nên tôi sẽ về sớm.",
  "友達と映画を見る（ ）がありますから、早く帰ります。___やくそく": "Vì tôi có cuộc hẹn đi xem phim với bạn nên tôi sẽ về sớm.",
  "今週の土曜日に友達の家で（　　）があります。___パーティー": "Thứ Bảy tuần này có bữa tiệc ở nhà bạn của tôi.",
  "今週の土曜日に友達の家で（　）があります。___パーティー": "Thứ Bảy tuần này có bữa tiệc ở nhà bạn của tôi.",
  "ハノイスタジアムでサッカーの（　　）があります。___しあい": "Có trận thi đấu bóng đá ở sân vận động Hà Nội.",
  "スーパーでシャツを2（　　）買いました。___まい": "Tôi đã mua 2 chiếc áo sơ mi ở siêu thị.",
  "郵便局で84円の切手を5（　　）買いました。___まい": "Tôi đã mua 5 con tem 84 Yên ở bưu điện.",
  "ステーキは（　　）とフォークで食べます。___ナイフ": "Món bít tết thì ăn bằng dao và dĩa (nĩa).",
  "冷たいスープは（　　）で飲みます。___スプーン": "Món súp nguội thì ăn (uống) bằng thìa.",
  "日本料理は（　　）で食べます。___はし": "Món ăn Nhật Bản thì ăn bằng đũa.",

  // =========================================================================
  // NGỮ PHÁP BÀI 4 - 7 (JPD123)
  // =========================================================================
  "お客さんが来ますから、部屋を（　　）そうじします。___きれいに": "Vì có khách đến nên tôi dọn dẹp phòng thật sạch sẽ.",
  "きのうのハノイはとても（　　）。___暑かったです": "Hôm qua Hà Nội đã rất nóng bức.",
  "きょうはあまり天気が（　　）。___よくないです": "Hôm nay thời tiết không tốt lắm.",
  "ホイアンはとても（　　）町です。___有名な": "Hội An là một thị trấn rất nổi tiếng.",
  "図書館ですから、（　　）話します。___静かに": "Vì ở thư viện nên chúng ta hãy nói chuyện thật khẽ (yên lặng).",
  "部屋は狭いです。（　　）、とてもきれいです。___しかし": "Căn phòng chật hẹp, tuy nhiên lại rất sạch sẽ và đẹp.",
  "朝ご飯を食べました。（　　）、学校へ行きました。___そして": "Tôi đã ăn bữa sáng, sau đó tôi đi đến trường.",
  "家から大学までバイクで（　　）かかりますか。___どのくらい": "Từ nhà đến trường đại học đi xe máy mất khoảng bao lâu?",
  "京都から大阪まで電車（　　）30分かかります。___で": "Từ Kyoto đến Osaka đi bằng tàu điện mất khoảng 30 phút.",
  "先週の日曜日は仕事がありましたから、（　　）。___暇じゃありませんでした": "Chủ nhật tuần trước vì có việc làm nên tôi đã không hề rảnh rỗi.",
  "先生は黒板の字を（　　）書きました。___大きく": "Thầy giáo đã viết chữ trên bảng thật to.",
  "日曜日、ハノイスタジアム（　　）サッカーの試合があります。___で": "Chủ nhật sẽ có trận đấu bóng đá diễn ra tại sân vận động Hà Nội.",
  "Miêu tả một món ăn ngon nhưng hơi đắt:___この料理はおいしいですが、すこし高いです。": "Món ăn này ngon nhưng hơi đắt một chút.",
  "デパートへ新しい靴を（　　）に行きました。___かい": "Tôi đã đến trung tâm thương mại để mua giày mới.",
  "きょうは疲労しましたから、どこへも（　　）。___行きたくないです": "Hôm nay mệt mỏi nên tôi không muốn đi bất cứ đâu cả.",
  "きのう、クラスの友達（　　）一緒に昼ご飯を食べました。___と": "Hôm qua tôi đã ăn trưa cùng với các bạn trong lớp.",
  "あしたテストがあります（　　）、今晩早く寝ます。___から": "Vì ngày mai có bài kiểm tra nên tối nay tôi sẽ đi ngủ sớm.",
  "きのうの晩、図書館で3時間（　　）。___勉強しました": "Tối hôm qua tôi đã học bài 3 tiếng đồng hồ ở thư viện.",
  "今朝、時間がありませんでしたから、朝ご飯を（　　）。___食べませんでした": "Sáng nay vì không có thời gian nên tôi đã không ăn sáng.",
  "日本の有名なアニメを（　　）。___見たいです": "Tôi muốn xem bộ phim hoạt hình anime nổi tiếng của Nhật Bản.",
  "日曜日、友達とデパートへ買い物（　　）行きます。___に": "Chủ nhật tôi đi đến trung tâm thương mại cùng bạn bè để mua sắm.",
  "きのうは一人（　　）映画館へ行きました。___で": "Hôm qua tôi đã đi rạp chiếu phim một mình.",
  "先週の旅行はとても（　　）。___楽しかったです": "Chuyến du lịch tuần trước đã rất vui vẻ.",
  "きのうのパーティーはどう（　　）。___でしたか": "Bữa tiệc tối qua như thế nào vậy?",
  "今はお金（　　）ほしくないです。時間がほしいです。___は": "Bây giờ tôi không cần tiền, tôi muốn có thời gian hơn.",
  "喫茶店へコーヒーを（　　）に行きましょう。___飲み": "Chúng ta hãy cùng đến quán cà phê để uống cà phê nhé.",
  "日本料理とベトナム料理と、（　　）がおいしいですか。___どちら": "Món Nhật và món Việt thì món nào ngon hơn?",
  "サッカーの（　　）がおもしろいです。___ほう": "Bóng đá thú vị hơn.",
  "スポーツの中でサッカーが（　　）好きです。___いちばん": "Trong các môn thể thao, tôi thích bóng đá nhất.",
  "私の部屋は田中さんの部屋（　　）広くないです。___ほど": "Phòng của tôi không rộng bằng phòng của anh Tanaka.",
  "家族（　　）中で父がいちばん背が高いです。___の": "Trong gia đình, bố tôi là người cao nhất.",
  "世界（　　）エベレストがいちばん高い山です。___で": "Trên thế giới, Everest là ngọn núi cao nhất.",
  "Hỏi lựa chọn giữa trà và cà phê:___お茶とコーヒーと、どちらが好きですか。": "Trà và cà phê thì bạn thích món nào hơn?",
  "ダナンはハノイより（　　）暖かいです。___ずっと": "Đà Nẵng ấm áp hơn Hà Nội rất nhiều.",
  "ハノイとホーチミンと、（　　）がにぎやかですか。___どちら": "Hà Nội và TP. Hồ Chí Minh thì nơi nào náo nhiệt hơn?",
  "果物の中でりんごが（　　）好きです。___いちばん": "Trong các loại hoa quả, tôi thích táo nhất.",
  "冬は秋（　　）寒いです。___より": "Mùa đông lạnh hơn mùa thu.",
  "日本語は英語（　　）難しくないです。___ほど": "Tiếng Nhật không khó bằng tiếng Anh.",
  "電車より飛行機の（　　）が速いです。___ほう": "Máy bay nhanh hơn tàu điện.",
  "富士山は日本で（　　）高い山です。___いちばん": "Núi Phú Sĩ là ngọn núi cao nhất ở Nhật Bản.",
  "北海道は沖縄（　　）寒いです。___より": "Hokkaido lạnh hơn Okinawa.",
  "ダナンはハノイ（　　）寒くないです。___ほど": "Đà Nẵng không lạnh bằng Hà Nội.",
  "バスと電車と（　　）が速いですか。___どちら": "Xe buýt và tàu điện thì phương tiện nào nhanh hơn?",
  "いっしょにお茶を（　　）。ええ、飲みましょう。___飲みませんか": "Cùng đi uống trà với tôi nhé? - Vâng, chúng ta cùng đi uống nào.",
  "日曜日に映画を見に行きませんか。すみません、日曜日は（　　）…___ちょっと": "Chủ nhật này cùng đi xem phim nhé? - Xin lỗi, Chủ nhật thì tôi hơi bận một chút...",
  "すみません、その窓を（　　）ください。___あけて": "Xin lỗi, xin hãy mở giùm tôi cánh cửa sổ đó với.",
  "ここに住所と名前を（　　）ください。___かいて": "Xin hãy viết địa chỉ và họ tên vào đây.",
  "食後、この薬を（　　）ください。___のんで": "Sau bữa ăn, xin hãy uống viên thuốc này.",
  "このケーキを（　　）みてください。おいしいですよ。___たべて": "Bạn hãy ăn thử chiếc bánh ngọt này xem, ngon lắm đấy.",
  "カレーライスはスプーン（　　）食べます。___で": "Món cơm cà ri thì ăn bằng thìa.",
  "この漢字の（　　）を教えてください。___読み方": "Xin hãy chỉ cho tôi cách đọc của chữ Hán này.",
  "少々ここで（　　）ください。___まって": "Xin hãy đợi ở đây một chút lát.",
  "この本を（　　）ください。___よんで": "Xin hãy đọc cuốn sách này.",
  "テレビを（　　）もいいですか。___見て": "Tôi xem tivi có được không ạ?",
  "すみません、ここで写真を（　　）ください。___とって": "Xin lỗi, xin hãy chụp một bức ảnh ở đây giúp tôi.",
  "田中さんは今、電話を（　　）います。___かけて": "Anh Tanaka hiện đang gọi điện thoại.",
  "このパソコンの（　　）を教えてください。___使い方": "Xin hãy chỉ cho tôi cách sử dụng chiếc máy tính này.",
  "教室でタバコを吸って（　　）いけません。___は": "Không được phép hút thuốc lá trong lớp học.",
  "ちょっと（　　）ください。___待って": "Xin vui lòng hãy đợi một chút.",
  "ちょっと（　　）ください。___まって": "Xin vui lòng hãy đợi một chút.",
  "スプーン（　）カレーを食べます。___で": "Tôi ăn món cà ri bằng thìa.",
  "スプーン（　）カレーをたべます。___で": "Tôi ăn món cà ri bằng thìa.",
  "フォーク（　）パスタを食べます。___で": "Tôi ăn mì Ý bằng dĩa/nĩa.",
  "お箸（　）ご飯を食べます。___で": "Tôi ăn cơm bằng đũa.",
  "ベトナムは日本（　）広いです。___より": "Việt Nam rộng hơn Nhật Bản.",
  "私は日本の（漫画）がすきです。___まんが": "Tôi thích truyện tranh Nhật Bản.",
  "部屋の窓を（　　）ください。___あけて": "Xin hãy mở cửa sổ phòng ra.",
  "部屋のドアを（　　）ください。___しめて": "Xin hãy đóng cửa phòng lại.",
  "エアコンを（　　）ください。___つけて": "Xin hãy bật điều hòa lên.",
  "電気を（　　）ください。___けして": "Xin hãy tắt đèn đi.",
  "荷物を（　　）ましょうか。___もち": "Tôi xách hành lý giúp bạn nhé?",
  "荷物を（　　）ましょうか。___持ち": "Tôi xách hành lý giúp bạn nhé?",
  "今、雨が（　　）います。___ふって": "Bây giờ trời đang mưa.",
  "ここでタバコを（　　）はいけません。___すって": "Không được phép hút thuốc lá ở đây.",
  "誕生日に新しいパソコンが（　　）です。___ほしい": "Vào dịp sinh nhật, tôi muốn có một chiếc máy tính xách tay mới.",
  "暑いから、冷たい水を（　　）たいです。___のみ": "Vì trời nóng nên tôi muốn uống nước lạnh.",
  "週末、京都へ（　　）に行きます。___あそび": "Cuối tuần tôi sẽ đi Kyoto để đi chơi."
};

/**
 * Trả về bản dịch nguyên câu tiếng Việt trọn vẹn của CẢ CÂU HOÀN CHỈNH sau khi điền đáp án
 */
export function getFullSentenceTranslation(question: ExamQuestion): string {
  if (!question) return "";
  const sentence = (question.sentence || "").trim();
  const answer = (question.answer || "").trim();
  const normSentence = normalizeSentenceKey(sentence);
  const normKey = `${normSentence}___${answer}`;
  const rawKey = `${sentence}___${answer}`;

  // 1. Kiểm tra trực tiếp trong từ điển câu dịch SENTENCE_TRANSLATIONS
  if (SENTENCE_TRANSLATIONS[normKey]) return SENTENCE_TRANSLATIONS[normKey];
  if (SENTENCE_TRANSLATIONS[rawKey]) return SENTENCE_TRANSLATIONS[rawKey];
  if (SENTENCE_TRANSLATIONS[normSentence]) return SENTENCE_TRANSLATIONS[normSentence];
  if (SENTENCE_TRANSLATIONS[sentence]) return SENTENCE_TRANSLATIONS[sentence];

  // 2. Kiểm tra trong EXACT_EXPLANATIONS nếu có bản dịch câu hoàn chỉnh
  const exact = EXACT_EXPLANATIONS[rawKey] || EXACT_EXPLANATIONS[normKey] || EXACT_EXPLANATIONS[sentence] || EXACT_EXPLANATIONS[normSentence];
  if (exact?.meaning && isCompleteSentenceTranslation(exact.meaning)) {
    return exact.meaning;
  }

  // 3. Nếu question.explanation?.meaning đã có và là câu hoàn chỉnh
  if (question.explanation?.meaning && isCompleteSentenceTranslation(question.explanation.meaning)) {
    return question.explanation.meaning;
  }

  // 4. Nếu câu hỏi dạng chữ Hán ngoặc vuông: 〔東〕京, 外〔国〕, 〔男〕の人, 〔女〕の人
  const bracketMatch = sentence.match(/〔([^〕]+)〕/);
  if (bracketMatch) {
    const char = bracketMatch[1];
    if (question.prompt.includes("trái nghĩa") || question.prompt.includes("Trái nghĩa")) {
      const oppMeaning = getAnswerMeaning(answer, question) || answer;
      return `Từ "${sentence}" có từ trái nghĩa là "${answer}" (${oppMeaning}).`;
    }
    return `Chữ Hán「${char}」có âm Hán Việt là ${answer} (trong từ ${sentence.replace(/〔|〕/g, "")}).`;
  }

  // 5. Fallback thông minh: dịch kết hợp câu hoàn chỉnh và ý nghĩa đáp án
  const ansMeaning = getAnswerMeaning(answer, question);
  const completed = getCompletedSentence(question);
  if (ansMeaning) {
    return `Câu hoàn chỉnh: "${completed}" (Ý nghĩa đáp án: ${ansMeaning})`;
  }
  return `Câu hoàn chỉnh: "${completed}"`;
}

/**
 * Ngân hàng lời giải chuẩn hóa 100% khớp từng câu hỏi của đề thi JPD123 Đại học FPT
 */
const EXACT_EXPLANATIONS: Record<string, QuestionExplanation> = {
  // =========================================================================
  // KANJI SEEDS
  // =========================================================================
  "この（料理）はとてもおいしいです。___りょうり": {
    meaning: "Món ăn này rất ngon.",
    grammar: "Chữ Hán Bài 4: 料理 (LIỆU LÝ) = Món ăn, nấu nướng. Phó từ とても + Tính từ đuôi い (おいしい).",
    lesson: "JPD123 - Bài 4 (Tính từ và Chữ Hán Sơ cấp)",
    tips: "Trường âm: Chữ「料」có trường âm「りょう」(ryou). Chú ý không chọn phương án thiếu âm「りょ」.",
    reason: "Đáp án đúng là「りょうり」. Chữ 料 (Liệu) đọc là りょう, chữ 理 (Lý) đọc là り. Các phương án 'りょり', 'りょうりん', 'りょおり' sai quy tắc trường âm.",
  },
  "週末に友達と（映画）を見に行きます。___えいが": {
    meaning: "Cuối tuần tôi đi xem phim cùng với bạn bè.",
    grammar: "Chữ Hán Bài 4: 映画 (ÁNH HỌA) = Bộ phim. Cấu trúc mục đích: V[bỏ ます] + に行きます (Đi để xem).",
    lesson: "JPD123 - Bài 4 (Mục đích di chuyển & Chữ Hán)",
    tips: "Chữ 映 (Ánh) đọc là えい, chữ 画 (Họa) đọc là が. Chú ý chữ 画 có âm đục「が」, không nhầm với「か」.",
    reason: "Đáp án đúng là「えいが」. 'えいか' sai âm đục, 'えが' thiếu trường âm え, 'えいご' là tiếng Anh (英語).",
  },
  "きょうは天気が良くて、（暑い）ですね。___あつい": {
    meaning: "Hôm nay thời tiết đẹp và trời nóng nhỉ.",
    grammar: "Tính từ đuôi い: 暑い (THỬ) = Nóng (thời tiết). Nối tính từ: 良くて (Tốt và...).",
    lesson: "JPD123 - Bài 4 (Tính từ miêu tả thời tiết)",
    tips: "Chữ 暑 (Thử) có bộ Nhật 日 ở trên chỉ mặt trời chiếu nóng bức, đọc là「あつい」.",
    reason: "Đáp án đúng là「あつい」. 'さむい' là Lạnh (寒い), 'あたたかい' là Ấm áp (暖かい), 'すずしい' là Mát mẻ (涼しい).",
  },
  "きのう、デパートで（新しい）靴を買いました。___あたらしい": {
    meaning: "Hôm qua tôi đã mua đôi giày mới ở trung tâm thương mại.",
    grammar: "Tính từ đuôi い: 新しい (TÂN) = Mới. Tính từ bổ nghĩa trực tiếp cho danh từ: 新しい靴.",
    lesson: "JPD123 - Bài 4 (Tính từ miêu tả đồ vật)",
    tips: "Nhìn đuôi hiragana「しい」bên ngoài ngoặc, chữ Tân đọc là「あたらしい」.",
    reason: "Đáp án đúng là「あたらしい」. Chữ 新 (Tân) âm Kun đọc là あたら (しい). 'ふるい' là Cũ (古い), 'あたらし' thiếu đuôi い.",
  },
  "私の部屋はあまり（広くない）です。___ひろくない": {
    meaning: "Căn phòng của tôi không rộng lắm.",
    grammar: "Phủ định tính từ đuôi い: 広い ➔ 広くない (Không rộng). Đi kèm phó từ あまり (Không... lắm).",
    lesson: "JPD123 - Bài 4 (Phủ định tính từ đuôi い)",
    tips: "Chữ Quảng 広 nghĩa là rộng rãi (ひろい). Dạng phủ định là ひろくない.",
    reason: "Đáp án đúng là「ひろくない」. 'せまくない' là phủ định của 狭い (Hẹp), 'おおくない' là Nhiều (多くない), 'ちいさくない' là Nhỏ (小さくない).",
  },
  "きのうは雨でしたから、（家）にいました。___うち": {
    meaning: "Hôm qua vì trời mưa nên tôi đã ở nhà.",
    grammar: "Chữ Hán Bài 5: 家 (GIA) = Nhà. Mệnh đề chỉ nguyên nhân [Vế 1] から、[Vế 2].",
    lesson: "JPD123 - Bài 5 (Nguyên nhân から & Chữ Hán)",
    tips: "Chữ 家 trong văn cảnh giao tiếp nói về nhà mình thường đọc là「うち」.",
    reason: "Đáp án đúng là「うち」. 'へや' là Căn phòng (部屋), 'まち' là Thị trấn/Khu phố (町).",
  },
  "図書館で日本の歴史の（本）を読みました。___ほん": {
    meaning: "Tôi đã đọc sách về lịch sử Nhật Bản ở thư viện.",
    grammar: "Chữ Hán Bài 5: 本 (BẢN/BỔN) = Sách. Tân ngữ + を + Động từ (本を読みました).",
    lesson: "JPD123 - Bài 5 (Chữ Hán Sơ cấp)",
    tips: "Chữ 本 khi đứng độc lập mang nghĩa quyển sách luôn đọc là「ほん」.",
    reason: "Đáp án đúng là「ほん」. Các âm 'ぼん' hay 'ぽん' chỉ xuất hiện khi đếm lượng từ vật thon dài (一本 いっぽん, 三本 さんぼん).",
  },
  "のどがかわきましたから、（水）を飲みたいです。___みず": {
    meaning: "Vì khát nước nên tôi muốn uống nước.",
    grammar: "Chữ Hán Bài 5: 水 (THỦY) = Nước. Mẫu câu mong muốn thực hiện hành động: V[bỏ ます] + たいです.",
    lesson: "JPD123 - Bài 5 (Mong muốn Vたい & Chữ Hán)",
    tips: "Đứng một mình chỉ nước uống thông thường dùng âm Kun đọc là「みず」.",
    reason: "Đáp án đúng là「みず」. 'すい' là âm On dùng khi ghép từ (水曜日 すいようび), 'おちゃ' là Trà (お茶), 'ゆ' là Nước nóng (お湯).",
  },
  "ハノイの夏はダナンより（雨）が多いです。___あめ": {
    meaning: "Mùa hè ở Hà Nội nhiều mưa hơn Đà Nẵng.",
    grammar: "Chữ Hán Bài 6: 雨 (VŨ) = Mưa. Cấu trúc so sánh hơn: A は B より Tính từ です.",
    lesson: "JPD123 - Bài 6 (So sánh và Thời tiết)",
    tips: "Chữ 雨 có 4 chấm hạt mưa rơi bên dưới mái hiên, đọc là「あめ」.",
    reason: "Đáp án đúng là「あめ」. 'ゆき' là Tuyết (雪), 'かぜ' là Gió (風), 'くも' là Mây (雲).",
  },
  "FPT大学のキャンパスは駅から（近い）です。___ちかい": {
    meaning: "Khuôn viên Đại học FPT gần nhà ga.",
    grammar: "Tính từ đuôi い: 近い (CẬN) = Gần. Địa điểm + から + 近い (Gần từ đâu).",
    lesson: "JPD123 - Bài 6 (Tính từ khoảng cách)",
    tips: "Chữ 近 (Cận) có bộ xước 辶 chỉ quãng đường gần, đọc là「ちかい」.",
    reason: "Đáp án đúng là「ちかい」. 'とおい' là Xa (遠い), 'はやい' là Nhanh/Sớm (早い/速い), 'たかい' là Cao/Đắt (高い).",
  },
  "私の（町）には古いお寺がたくさんあります。___まち": {
    meaning: "Ở thị trấn của tôi có rất nhiều ngôi chùa cổ kính.",
    grammar: "Chữ Hán Bài 6: 町 (ĐINH) = Thị trấn, phố xá. Địa điểm + に + Danh từ + があります (Tồn tại).",
    lesson: "JPD123 - Bài 6 (Tồn tại đồ vật & Địa điểm)",
    tips: "Chữ 町 gồm bộ Điền 田 (ruộng) và chữ Đinh 丁 (góc phố), đọc là「まち」.",
    reason: "Đáp án đúng là「まち」. 'むら' là Làng quê (村), 'みち' là Con đường (道), 'くに' là Đất nước (国).",
  },
  "１年の中で（春）がいちばん好きです。___はる": {
    meaning: "Trong một năm, tôi thích nhất là mùa xuân.",
    grammar: "Chữ Hán Bài 6: 春 (XUÂN) = Mùa xuân. So sánh nhất: [Phạm vi] の中で [Chủ ngữ] が いちばん [Tính từ] です.",
    lesson: "JPD123 - Bài 6 (4 Mùa & So sánh nhất)",
    tips: "Nhớ 4 mùa: 春 (はる - xuân), 夏 (なつ - hạ), 秋 (あき - thu), 冬 (ふゆ - đông).",
    reason: "Đáp án đúng là「はる」. 'なつ' là Mùa hè (夏), 'あき' là Mùa thu (秋), 'ふゆ' là Mùa đông (冬).",
  },
  "先生、この言葉の（意味）を教えてください。___いみ": {
    meaning: "Thưa thầy, xin vui lòng chỉ cho em ý nghĩa của từ này.",
    grammar: "Chữ Hán Bài 7: 意味 (Ý VỊ) = Ý nghĩa. Mẫu câu yêu cầu lịch sự: Vてください (教えてください).",
    lesson: "JPD123 - Bài 7 (Mẫu câu Vてください & Chữ Hán)",
    tips: "Chữ Ý (意) đọc là い, chữ Vị (味) đọc là み. Ghép lại là「いみ」, không có trường âm.",
    reason: "Đáp án đúng là「いみ」. Các phương án 'いめ', 'いき', 'ちみ' là bẫy phát âm sai.",
  },
  "紙に黒いペンで名前を（書いて）ください。___かいて": {
    meaning: "Xin hãy viết tên lên giấy bằng bút màu đen.",
    grammar: "Chữ Hán Bài 7: 書く (THƯ) = Viết. Động từ nhóm 1 đuôi「く」chia thể て thành「いて」: 書いて.",
    lesson: "JPD123 - Bài 7 (Chia động từ thể て)",
    tips: "Quy tắc chia thể て nhóm 1: đuôi「く」thành「いて」. かきます ➔ かいて.",
    reason: "Đáp án đúng là「かいて」. 'きいて' là Nghe (聞いて), 'おいて' là Đặt/Để (置いて), 'はなして' là Nói chuyện (話して).",
  },
  "田中さんは今、教室で宿題を（して）います。___して": {
    meaning: "Anh Tanaka bây giờ đang làm bài tập ở trong lớp học.",
    grammar: "Chữ Hán Bài 7: します ➔ して. Hành động đang tiếp diễn tại thời điểm nói: Vています.",
    lesson: "JPD123 - Bài 7 (Thì hiện tại tiếp diễn Vています)",
    tips: "Thấy có từ「今」(bây giờ) và đuôi「います」➔ điền động từ chia thể て.",
    reason: "Đáp án đúng là「して」. Cụm từ: 宿題をします ➔ 宿題をしています. 'みて' là Xem (見て), 'きて' là Đến (来て), 'いて' là Ở (居て).",
  },
  "熱がありますから、（病院）へ行かなければなりません。___びょういん": {
    meaning: "Vì bị sốt nên tôi phải đi đến bệnh viện.",
    grammar: "Chữ Hán Bài 7: 病院 (BỆNH VIỆN) = Bệnh viện. Mẫu câu nguyên nhân: [Lý do] から.",
    lesson: "JPD123 - Bài 7 (Chữ Hán Sơ cấp N5)",
    tips: "Chữ 病 đọc là「びょう」(có trường âm う), chữ 院 đọc là「いん」➔ びょういん.",
    reason: "Đáp án đúng là「びょういん」. 'びょうき' là Bệnh tật (病気), 'びょいん' thiếu trường âm う (dễ nhầm với びよういん - tiệm làm tóc).",
  },
  "朝ごはんのあとで、薬を（飲んで）ください。___のんで": {
    meaning: "Sau bữa ăn sáng, xin hãy uống thuốc.",
    grammar: "Chữ Hán Bài 7: 飲む (ẨM) = Uống. Động từ nhóm 1 đuôi「む」chia thể て thành「んで」: 飲んで.",
    lesson: "JPD123 - Bài 7 (Chia động từ thể て nhóm 1)",
    tips: "Động từ nhóm 1 tận cùng bằng「み, び, に」chuyển thành「んで」: のみます ➔ のんで.",
    reason: "Đáp án đúng là「のんで」. 'たべて' là Ăn (食べて), 'すんで' là Sống (住んで), 'よんで' là Đọc (読んで).",
  },
  "（電気）を消して、部屋を出ます。___でんき": {
    meaning: "Tắt điện rồi đi ra khỏi phòng.",
    grammar: "Chữ Hán Bài 7: 電気 (ĐIỆN KHÍ) = Điện, đèn điện. Cụm từ: 電気を消します (Tắt điện).",
    lesson: "JPD123 - Bài 7 (Đồ dùng gia đình & Thể て)",
    tips: "Chữ 電 (Điện) đọc là でん, chữ 気 (Khí) đọc là き ➔ でんき.",
    reason: "Đáp án đúng là「でんき」. 'でんしゃ' là Tàu điện (電車), 'てんき' là Thời tiết (天気), 'でんわ' là Điện thoại (電話).",
  },
  "きのう、スーパーでりんごを（かいました）。___買いました": {
    meaning: "Hôm qua tôi đã mua táo ở siêu thị.",
    grammar: "Chữ Hán Bài 4: 買 (MÃI) = Mua. Động từ thì quá khứ: 買いました.",
    lesson: "JPD123 - Bài 4 (Hành động quá khứ & Chữ Hán)",
    tips: "Chữ 買 (Mãi - mua) có bộ Võng 罒 ở trên và bộ Bối 貝 (tiền sò) ở dưới.",
    reason: "Đáp án đúng là「買いました」. '貝' là vỏ sò, '売' là Bán (bán hàng - 売り), '借' là Vay mượn (借り).",
  },
  "きょうのテストはあまり（むずかしくない）です。___難しくない": {
    meaning: "Bài kiểm tra hôm nay không khó lắm.",
    grammar: "Tính từ đuôi い: 難しい (NAN) = Khó. Phủ định: 難しくないです. Phó từ あまり.",
    lesson: "JPD123 - Bài 4 (Tính từ miêu tả độ khó)",
    tips: "Chữ 難 (Nan) có nghĩa là nan giải, khó khăn.",
    reason: "Đáp án đúng là「難しくない」. '易しくない' là Dễ (易しい), '悲しくない' là Buồn (悲しい), '忙しくない' là Bận rộn (忙しい).",
  },
  "来週、東京へ（いきたい）です。___行きたい": {
    meaning: "Tuần sau tôi muốn đi Tokyo.",
    grammar: "Chữ Hán Bài 5: 行 (HÀNH) = Đi. Mẫu câu mong muốn: 行きます ➔ 行きたいです.",
    lesson: "JPD123 - Bài 5 (Mong muốn Vたい & Chữ Hán)",
    tips: "Chữ 行 (Hành) gồm 2 nửa 彳 và 亍, diễn tả bước chân di chuyển.",
    reason: "Đáp án đúng là「行きたい」. '来' là Đến (来ます), '帰' là Về (帰ります), '待' là Chờ đợi (待ちます).",
  },
  "母とデパートへ（かいもの）に行きました。___買い物": {
    meaning: "Tôi đã cùng mẹ đi mua sắm ở trung tâm thương mại.",
    grammar: "Chữ Hán Bài 5: 買い物 (MÃI VẬT) = Mua sắm. Cấu trúc mục đích: N + に行きます (Đi mua sắm).",
    lesson: "JPD123 - Bài 5 (Mục đích di chuyển & Chữ Hán Sơ cấp)",
    tips: "Từ「かいもの」ghép giữa chữ 買 (Mua) và chữ 物 (Đồ vật) ➔ 買い物 (Mua sắm).",
    reason: "Đáp án đúng là「買い物」. '買い者' (người mua - từ sai), '買い方' (cách mua - sai nghĩa câu), '買い所' (nơi mua - không dùng).",
  },
  "このアパートは家賃が（やすい）です。___安い": {
    meaning: "Căn hộ này tiền thuê nhà rẻ.",
    grammar: "Tính từ đuôi い: 安い (AN) = Rẻ. Trái nghĩa với 高い (Đắt).",
    lesson: "JPD123 - Bài 6 (Tính từ giá cả & Thuê nhà)",
    tips: "Chữ 安 gồm bộ Miên 宀 (mái nhà) và chữ Nữ 女 (người phụ nữ trong nhà thì an tâm, giá rẻ).",
    reason: "Đáp án đúng là「安い」. '高い' là Đắt (trái nghĩa), '安心' là Danh từ an tâm, '安心い' là từ sai ngữ pháp.",
  },
  "この池には（さかな）がたくさん泳いでいます。___魚": {
    meaning: "Trong cái ao này có rất nhiều cá đang bơi.",
    grammar: "Chữ Hán Bài 6: 魚 (NGƯ) = Con cá. Danh từ chỉ loài vật.",
    lesson: "JPD123 - Bài 6 (Chữ Hán Sơ cấp & Động vật)",
    tips: "Chữ 魚 (Ngư) có 4 chấm hỏa ở đuôi tượng trưng cho đuôi cá quẫy nước.",
    reason: "Đáp án đúng là「魚」. '角' là Cái sừng/Góc phố, '鳥' là Con chim, '肉' là Thịt.",
  },
  "すみません、その窓を（あけて）ください。___開けて": {
    meaning: "Xin lỗi, hãy mở giúp tôi cánh cửa sổ đó.",
    grammar: "Chữ Hán Bài 7: 開ける (KHAI) = Mở. Thể て: 開けてください. Trái nghĩa với 閉める (Đóng).",
    lesson: "JPD123 - Bài 7 (Mở đóng cửa & Mẫu câu Vてください)",
    tips: "Chữ 開 (Khai) có bộ Môn 門 bên ngoài, ở giữa là 2 tay mở then cổng.",
    reason: "Đáp án đúng là「開けて」. '閉けて' là bẫy ghép sai (chữ 閉 là Đóng), '門' là Cổng, '問' là Hỏi.",
  },
  "漢字の（よみかた）がまだ分かりません。___読み方": {
    meaning: "Tôi vẫn chưa biết cách đọc chữ Hán.",
    grammar: "Chữ Hán Bài 7: 読み方 (ĐỘC PHƯƠNG) = Cách đọc. V[bỏ ます] + 方 (かた) = Cách làm V.",
    lesson: "JPD123 - Bài 7 (Mẫu câu chỉ cách thức 〜方 & Chữ Hán)",
    tips: "Động từ 読みます (Đọc) ghép với 方 (Phương - cách) ➔ 読み方 (Cách đọc).",
    reason: "Đáp án đúng là「読み方」. '書き方' là Cách viết (chữ Thư), '話し方' là Cách nói chuyện (chữ Thoại), '見み方' là chữ viết sai.",
  },
  "暑いですから、ドアを（しめて）クーラーをつけてください。___閉めて": {
    meaning: "Vì trời nóng nên hãy đóng cửa lại rồi bật điều hòa lên nhé.",
    grammar: "Chữ Hán Bài 7: 閉める (BẾ) = Đóng. Thể て: 閉めてください. Trái nghĩa với 開ける (Mở).",
    lesson: "JPD123 - Bài 7 (Đóng mở cửa & Điều hòa)",
    tips: "Chữ 閉 (Bế) có bộ Môn 門 ở ngoài và cài then kín ở trong.",
    reason: "Đáp án đúng là「閉めて」. '開めて' là chữ Khai ghép sai, '止めて' là Dừng lại (止める), '間めて' là chữ Gian sai nghĩa.",
  },
  "〔病〕院___BỆNH": {
    meaning: "Chữ Hán「病」trong từ「病院 (びょういん - Bệnh viện)」có âm Hán Việt là BỆNH.",
    grammar: "Âm Hán Việt: 病 (BỆNH - ốm đau, bệnh tật). Ghép với 院 (VIỆN) = Bệnh viện.",
    lesson: "JPD123 - Bài 7 (Âm Hán Việt N5)",
    tips: "Bệnh viện = 病院 (BỆNH + VIỆN). Chữ trong ngoặc 〔病〕 là chữ BỆNH.",
    reason: "Đáp án đúng là BỆNH. Chữ 院 là VIỆN, 痛 là THỐNG (đau đớn), 傷 là THƯƠNG (vết thương).",
  },
  "〔料〕理___LIỆU": {
    meaning: "Chữ Hán「料」trong từ「料理 (りょうり - Nấu ăn / Món ăn)」có âm Hán Việt là LIỆU.",
    grammar: "Âm Hán Việt: 料 (LIỆU) + 理 (LÝ) = LIỆU LÝ (Nấu nướng, món ăn).",
    lesson: "JPD123 - Bài 4 (Âm Hán Việt N5)",
    tips: "Món ăn trong tiếng Nhật là Liệu Lý (料理). Chữ thứ nhất 〔料〕 là chữ LIỆU.",
    reason: "Đáp án đúng là LIỆU. Chữ 理 là LÝ, 科 là KHOA, 店 là TIỆM.",
  },
  "〔映〕画___ÁNH": {
    meaning: "Chữ Hán「映」trong từ「映画 (えいが - Phim ảnh)」có âm Hán Việt là ÁNH.",
    grammar: "Âm Hán Việt: 映 (ÁNH - phản chiếu) + 画 (HỌA/HOẠCH - bức tranh) = ÁNH HỌA (Bộ phim).",
    lesson: "JPD123 - Bài 5 (Âm Hán Việt N5)",
    tips: "Bộ phim là Ánh Họa (映画). Chữ trong ngoặc 〔映〕 là chữ ÁNH.",
    reason: "Đáp án đúng là ÁNH. Chữ 画 là HỌA, 影 là ẢNH (cái bóng), 幻 là ẢO.",
  },
  "〔新〕しい___Tân (Mới)": {
    meaning: "Chữ Hán「新」trong「新しい (あたらしい)」có âm Hán Việt là TÂN, mang ý nghĩa là 'Mới'.",
    grammar: "Âm Hán Việt & Ngữ nghĩa: 新 = TÂN (Mới mẻ, tươi mới). Trái nghĩa với Cổ 古 (Cũ).",
    lesson: "JPD123 - Bài 4 (Âm Hán Việt & Ý nghĩa)",
    tips: "Liên hệ từ Hán Việt quen thuộc: Tân sinh viên, tân niên, tân hôn.",
    reason: "Đáp án đúng là Tân (Mới). 'Cổ' là Cũ (古), 'Bạch' là Trắng (白), 'Thân' là Bố mẹ/Thân thiết (親).",
  },
  "〔電〕気___ĐIỆN": {
    meaning: "Chữ Hán「電」trong「電気 (Điện)」「電車 (Tàu điện)」có âm Hán Việt là ĐIỆN.",
    grammar: "Âm Hán Việt: 電 = ĐIỆN. Ghép với Khí = 電気 (Đèn điện), ghép với Xa = 電車 (Tàu điện).",
    lesson: "JPD123 - Bài 7 (Âm Hán Việt đồ điện gia dụng)",
    tips: "Chữ 電 có bộ Vũ 雨 (mưa) ở trên và đuôi sấm sét ở dưới, âm Hán Việt là ĐIỆN.",
    reason: "Đáp án đúng là ĐIỆN. Chữ 気 là KHÍ, 車 là XA, 雲 là VÂN (mây).",
  },

  // =========================================================================
  // VOCABULARY SEEDS
  // =========================================================================
  "スープを飲むときは、（　　）を使います。___スプーン": {
    meaning: "Khi ăn súp thì tôi dùng thìa.",
    grammar: "Danh từ chỉ dụng cụ + を使います (Sử dụng dụng cụ gì). Cụm từ: スープを飲みます (Ăn/húp súp).",
    lesson: "JPD123 - Bài 7 (Đồ dùng ăn uống)",
    tips: "Ăn súp (スープ) thì dùng thìa (スプーン - Spoon). Không thể dùng nĩa hay dao.",
    reason: "Đáp án đúng là「スプーン」(Thìa/Muỗng). 'フォーク' là Nĩa (Fork), 'ナイフ' là Dao (Knife), 'はし' là Đũa.",
  },
  "ステーキを食べますから、（　　）とフォークを並べます。___ナイフ": {
    meaning: "Vì ăn món bít tết nên tôi xếp dao và nĩa.",
    grammar: "Cặp dụng cụ ăn món Tây: ナイフ (Dao) と フォーク (Nĩa).",
    lesson: "JPD123 - Bài 7 (Đồ dùng bàn ăn)",
    tips: "Ăn bít tết (ステーキ) thì đi thành cặp: Dao và Nĩa (ナイフとフォーク).",
    reason: "Đáp án đúng là「ナイフ」(Dao). 'スプーン' là Thìa, 'コップ' là Cốc/Ly, 'はし' là Đũa.",
  },
  "友達と映画を見る（　　）がありますから、早く帰ります。___やくそく": {
    meaning: "Vì tôi có cuộc hẹn đi xem phim với bạn nên tôi sẽ về sớm.",
    grammar: "Cấu trúc Bài 6: [Động từ thể từ điển / Danh từ の] + 約束があります (Có hẹn làm gì) & Liên từ chỉ nguyên nhân 〜から (Bởi vì... nên...)",
    lesson: "JPD123 - Bài 6 (So sánh, Rủ rê & Cuộc hẹn)",
    tips: "Từ khóa:「映画を見る」(xem phim) kết hợp với「早く帰ります」(về sớm) ➔ chọn 約束 / やくそく (cuộc hẹn, lời hứa).",
    reason: "Đáp án đúng là「やくそく」(約束 = Cuộc hẹn, lời hứa). 'にもつ' là Hành lý, 'しゅくだい' là Bài tập, 'きっぷ' là Vé.",
  },
  "友達と映画を見る（　）がありますから、早く帰ります。___やくそく": {
    meaning: "Vì tôi có cuộc hẹn đi xem phim với bạn nên tôi sẽ về sớm.",
    grammar: "Cấu trúc Bài 6: [Động từ thể từ điển / Danh từ の] + 約束があります (Có hẹn làm gì) & Liên từ chỉ nguyên nhân 〜から (Bởi vì... nên...)",
    lesson: "JPD123 - Bài 6 (So sánh, Rủ rê & Cuộc hẹn)",
    tips: "Từ khóa:「映画を見る」(xem phim) kết hợp với「早く帰ります」(về sớm) ➔ chọn 約束 / やくそく (cuộc hẹn, lời hứa).",
    reason: "Đáp án đúng là「やくそく」(約束 = Cuộc hẹn, lời hứa). 'にもつ' là Hành lý, 'しゅくだい' là Bài tập, 'きっぷ' là Vé.",
  },
  "今週の土曜日に友達の家で（　　）があります。___パーティー": {
    meaning: "Thứ Bảy tuần này có bữa tiệc ở nhà bạn của tôi.",
    grammar: "Địa điểm + で + N(sự kiện) + があります (Có sự kiện diễn ra tại địa điểm).",
    lesson: "JPD123 - Bài 6 (Nơi diễn ra sự kiện で)",
    tips: "Tổ chức tại nhà bạn (友達の家で) diễn ra sự kiện ➔ điền「パーティー」(bữa tiệc).",
    reason: "Đáp án đúng là「パーティー」(Bữa tiệc). Các phương án 'つくえ' (cái bàn), 'くるま' (xe hơi), 'じてんしゃ' (xe đạp) là đồ vật tĩnh, đi với trợ từ にあります chứ không đi với であります.",
  },
  "今週の土曜日に友達の家で（　）があります。___パーティー": {
    meaning: "Thứ Bảy tuần này có bữa tiệc ở nhà bạn của tôi.",
    grammar: "Địa điểm + で + N(sự kiện) + があります (Có sự kiện diễn ra tại địa điểm).",
    lesson: "JPD123 - Bài 6 (Nơi diễn ra sự kiện で)",
    tips: "Tổ chức tại nhà bạn (友達の家で) diễn ra sự kiện ➔ điền「パーティー」(bữa tiệc).",
    reason: "Đáp án đúng là「パーティー」(Bữa tiệc). Các phương án 'つくえ' (cái bàn), 'くるま' (xe hơi), 'じてんしゃ' (xe đạp) là đồ vật tĩnh, đi với trợ từ にあります chứ không đi với であります.",
  },
  "日曜日、浅草で（　　）がありますから、見に行きます。___お祭り": {
    meaning: "Chủ nhật vì có lễ hội ở Asakusa nên tôi sẽ đi xem.",
    grammar: "Sự kiện diễn ra: お祭りがあります (Có lễ hội). Mục đích di chuyển: V[bỏ ます] + に行きます (Đi để xem).",
    lesson: "JPD123 - Bài 6 (Sự kiện văn hóa & Mục đích)",
    tips: "Sự kiện văn hóa truyền thống nổi tiếng ở Asakusa (浅草) là「お祭り」(lễ hội).",
    reason: "Đáp án đúng là「お祭り」(Lễ hội). 'かいしゃ' là Công ty, 'ぎんこう' là Ngân hàng, 'びょういん' là Bệnh viện.",
  },
  "日曜日、浅草で（　）がありますから、見に行きます。___お祭り": {
    meaning: "Chủ nhật vì có lễ hội ở Asakusa nên tôi sẽ đi xem.",
    grammar: "Sự kiện diễn ra: お祭りがあります (Có lễ hội). Mục đích di chuyển: V[bỏ ます] + に行きます (Đi để xem).",
    lesson: "JPD123 - Bài 6 (Sự kiện văn hóa & Mục đích)",
    tips: "Sự kiện văn hóa truyền thống nổi tiếng ở Asakusa (浅草) là「お祭り」(lễ hội).",
    reason: "Đáp án đúng là「お祭り」(Lễ hội). 'かいしゃ' là Công ty, 'ぎんこう' là Ngân hàng, 'びょういん' là Bệnh viện.",
  },
  "冷たいジュースを（　　）に入れて、みんなで乾杯しました。___コップ": {
    meaning: "Rót nước trái cây lạnh vào cốc rồi mọi người cùng nhau cụng ly chúc mừng.",
    grammar: "Vật chứa đồ uống: コップ (Cốc, ly). Cụm từ: 乾杯します (Cụng ly, chúc rượu).",
    lesson: "JPD123 - Bài 7 (Đồ dùng ăn uống & Giao tiếp)",
    tips: "Nước ép (ジュース) để cụng ly (乾杯) thì phải rót vào cốc (コップ - Cup).",
    reason: "Đáp án đúng là「コップ」(Cốc/Ly). 'おさら' là Đĩa, 'れいぞうこ' là Tủ lạnh, '電子レンジ' là Lò vi sóng.",
  },
  "肉や野菜を腐らせないために、（　　）に入れます。___れいぞうこ": {
    meaning: "Để thịt và rau không bị ôi thiu thì bảo quản trong tủ lạnh.",
    grammar: "Thiết bị bảo quản thực phẩm: 冷蔵庫 (れいぞうこ - Tủ lạnh).",
    lesson: "JPD123 - Bài 7 (Thiết bị gia đình)",
    tips: "Bảo quản rau thịt giữ tươi ngon thì cho vào tủ lạnh (れいぞうこ).",
    reason: "Đáp án đúng là「れいぞうこ」(Tủ lạnh). '電子レンジ' là Lò vi sóng, 'テーブル' là Cái bàn, 'ベッド' là Cái giường.",
  },
  "冷たいお弁当を（　　）で温めました。___電子レンジ": {
    meaning: "Tôi đã làm nóng hộp cơm bento nguội bằng lò vi sóng.",
    grammar: "Phương tiện hâm nóng thức ăn: 電子レンジ (でんしレンジ - Lò vi sóng).",
    lesson: "JPD123 - Bài 7 (Thiết bị gia đình)",
    tips: "Hâm nóng (温めました - あたためました) đồ ăn thì dùng lò vi sóng (電子レンジ).",
    reason: "Đáp án đúng là「電子レンジ」(Lò vi sóng). 'れいぞうこ' là Tủ lạnh, 'エアコン' là Điều hòa, 'せんたくき' là Máy giặt.",
  },
  "コーヒーに（　　）を入れて甘くします。___さとう": {
    meaning: "Cho đường vào cà phê để làm cho ngọt.",
    grammar: "Gia vị tạo vị ngọt: 砂糖 (さとう - Đường). Đổi tính từ sang phó từ: 甘い ➔ 甘くします.",
    lesson: "JPD123 - Bài 7 (Gia vị & Mùi vị)",
    tips: "Làm ngọt (甘くします) cà phê thì chỉ có thể cho đường (さとう).",
    reason: "Đáp án đúng là「さとう」(Đường). 'しお' là Muối, 'しょうゆ' là Nước tương xì dầu, 'こしょう' là Tiêu.",
  },
  "すしを食べるときは、（　　）をつけて食べます。___しょうゆ": {
    meaning: "Khi ăn sushi thì chấm nước tương xì dầu rồi ăn.",
    grammar: "Nước chấm ăn sushi: 醤油 (しょうゆ - Nước tương). Cụm từ: しょうゆをつけます (Chấm nước tương).",
    lesson: "JPD123 - Bài 7 (Ẩm thực Nhật Bản)",
    tips: "Ăn sushi (すし) thì luôn chấm nước tương (しょうゆ).",
    reason: "Đáp án đúng là「しょうゆ」(Nước tương). 'さとう' là Đường, 'ミルク' là Sữa tươi, 'ジャム' là Mứt.",
  },
  "部屋がとても暑いですから、（　　）をつけてください。___エアコン": {
    meaning: "Vì trong phòng rất nóng nên hãy bật máy điều hòa lên nhé.",
    grammar: "Thiết bị làm mát: エアコン (Air conditioner). Cụm từ: エアコンをつけます (Bật điều hòa).",
    lesson: "JPD123 - Bài 7 (Thiết bị phòng ốc & Thể て)",
    tips: "Phòng nóng (暑い) ➔ bật điều hòa (エアコンをつけてください).",
    reason: "Đáp án đúng là「エアコン」(Máy điều hòa). 'テレビ' là Tivi, 'れいぞうこ' là Tủ lạnh, 'アイロン' là Bàn là.",
  },
  "このパソコンは性能がとてもいいですが、値段が（　　）です。___たかい": {
    meaning: "Chiếc máy tính này tính năng rất tốt nhưng giá lại đắt.",
    grammar: "Tính từ miêu tả giá tiền: 高い (Đắt). Liên từ đối lập が (nhưng).",
    lesson: "JPD123 - Bài 4 (Tính từ giá cả & Liên từ が)",
    tips: "Hai vế đối lập: Tính năng tốt (いい) nhưng (が) giá tiền thì đắt (たかい).",
    reason: "Đáp án đúng là「たかい」(Đắt). 'やすい' là Rẻ (không hợp logic đối lập với が), 'ひくい' là Thấp (chiều cao), 'かるい' là Nhẹ (trọng lượng).",
  },
  "ダナンは海が青くて、空気が（　　）町です。___きれいな": {
    meaning: "Đà Nẵng là một thành phố biển xanh và không khí trong lành.",
    grammar: "Tính từ đuôi な bổ nghĩa cho danh từ: きれいな + 町 (Thành phố trong lành, sạch đẹp).",
    lesson: "JPD123 - Bài 4 (Tính từ đuôi な bổ nghĩa danh từ)",
    tips: "きれい là tính từ đuôi な đặc biệt! Khi đứng trước danh từ (町) bắt buộc phải có「な」: きれいな町.",
    reason: "Đáp án đúng là「きれいな」. Bẫy kinh điển N5: きれい có tận cùng bằng い nhưng là tính từ đuôi な. 'きれいく' sai vì coi như đuôi い, 'きれい' thiếu な khi bổ nghĩa danh từ.",
  },
  "おなかがすきましたから、何か（　　）を食べたいです。___おいしいもの": {
    meaning: "Vì đói bụng nên tôi muốn ăn thứ gì đó ngon.",
    grammar: "Tính từ đuôi い bổ nghĩa cho danh từ: おいしい + もの (Thứ gì ngon).",
    lesson: "JPD123 - Bài 5 (Tính từ bổ nghĩa & Mong muốn Vたい)",
    tips: "Tính từ đuôi い ghép trực tiếp với danh từ もの (đồ vật/thứ gì): おいしいもの.",
    reason: "Đáp án đúng là「おいしいもの」(Thứ ngon). 'おいしくもの' sai ngữ pháp ghép, 'おいしさ' là danh từ độ ngon, 'おいしいこと' là việc ngon (sai nghĩa).",
  },
  "ハノイからホーチミンまで飛行機で（　　）かかりますか。___どのくらい": {
    meaning: "Từ Hà Nội đến TP. Hồ Chí Minh đi bằng máy bay mất khoảng bao lâu?",
    grammar: "Từ để hỏi về khoảng thời gian/chi phí: どのくらい (Khoảng bao lâu/mất bao nhiêu).",
    lesson: "JPD123 - Bài 4 (Hỏi thời gian di chuyển)",
    tips: "Hỏi đi mất bao lâu (かかりますか) dùng「どのくらい」hoặc「どのぐらい」.",
    reason: "Đáp án đúng là「どのくらい」(Mất bao lâu). 'いくら' hỏi giá tiền, 'なんじ' hỏi mấy giờ điểm, 'どこ' hỏi địa điểm ở đâu.",
  },
  "家族に手紙を書きましたから、郵便局へ（　　）を買いに行きます。___きって": {
    meaning: "Vì đã viết thư cho gia đình nên tôi đi đến bưu điện để mua tem.",
    grammar: "Từ vựng bưu điện: 切手 (きって - Con tem). Mẫu câu mục đích: N を 買いに行きます.",
    lesson: "JPD123 - Bài 5 (Từ vựng bưu điện & Mục đích di chuyển)",
    tips: "Gửi thư (手紙) ở bưu điện (郵便局) thì phải mua tem dán (きって).",
    reason: "Đáp án đúng là「きって」(Con tem). 'きっぷ' là Vé tàu xe (切符), 'はがき' là Bưu thiếp, 'ふうとう' là Phong bì.",
  },
  "きのうの夜は（　　）勉強しませんでした。___ぜんぜん": {
    meaning: "Tối hôm qua tôi hoàn toàn không học bài tí nào.",
    grammar: "Phó từ mức độ: ぜんぜん + Động từ phủ định (Hoàn toàn không...).",
    lesson: "JPD123 - Bài 4 (Phó từ đi với câu phủ định)",
    tips: "Nhìn đuôi câu「勉強しませんでした」(phủ định) + nghĩa 'hoàn toàn không' ➔ Chọn「ぜんぜん」.",
    reason: "Đáp án đúng là「ぜんぜん」(Hoàn toàn không). 'とても' (rất) và 'たくさん' (nhiều) chỉ đi với câu khẳng định, 'すこし' (một chút) không phù hợp ngữ cảnh phủ định tuyệt đối.",
  },
  "この店のラーメンは（　　）おいしくないです。___あまり": {
    meaning: "Mì ramen của quán này không ngon lắm.",
    grammar: "Phó từ mức độ: あまり + Tính từ phủ định (Không... lắm).",
    lesson: "JPD123 - Bài 4 (Phó từ mức độ あまり)",
    tips: "Đuôi tính từ chia phủ định「おいしくないです」+ nghĩa 'không... lắm' ➔ Điền「あまり」.",
    reason: "Đáp án đúng là「あまり」(Không... lắm). 'とても' (rất) chỉ đi với khẳng định (おいしいです), 'ずいぶん' (khá là) và 'ちょうど' (vừa vặn) không đi với câu phủ định này.",
  },
  "ベトナムのフォーはおいしいですよ。（　　）食べてみてください。___ぜひ": {
    meaning: "Phở Việt Nam ngon lắm đấy. Bạn nhất định hãy ăn thử nhé!",
    grammar: "Phó từ thúc giục, mời mọc nhiệt tình: ぜひ + Vてください (Nhất định xin hãy...).",
    lesson: "JPD123 - Bài 7 (Phó từ ぜひ & Lời mời mọc)",
    tips: "Đi cùng câu khuyên nhủ, mời mọc tha thiết「〜てください」luôn là phó từ「ぜひ」(nhất định).",
    reason: "Đáp án đúng là「ぜひ」(Nhất định). 'たぶん' (có lẽ), 'きっと' (chắc chắn), 'あまり' (không... lắm) không dùng để mời mọc nồng nhiệt.",
  },
  "A：もう宿題をしましたか。\nB：いいえ、（　　）していません。___まだ": {
    meaning: "A: Bạn đã làm bài tập về nhà chưa?\nB: Chưa, tôi vẫn chưa làm.",
    grammar: "Cặp trạng thái hoàn thành: Trả lời 'chưa làm' cho câu hỏi「もう〜ましたか」luôn là「まだ Vていません」.",
    lesson: "JPD123 - Bài 7 (Cặp từ もう và まだ)",
    tips: "Hỏi もう (đã... chưa) ➔ Trả lời phủ định いいえ luôn đi với「まだ」(vẫn chưa).",
    reason: "Đáp án đúng là「まだ」(Vẫn chưa). Quy tắc chuẩn Minna Bài 7: いいえ、まだしていません. 'もう' (đã rồi) chỉ dùng cho câu khẳng định.",
  },
  "A：もう昼ごはんを食べましたか。\nB：はい、（　　）食べました。___もう": {
    meaning: "A: Bạn đã ăn cơm trưa chưa?\nB: Vâng, tôi đã ăn rồi.",
    grammar: "Cặp trạng thái hoàn thành: Trả lời khẳng định cho「もう〜ましたか」là「はい、もう Vました」.",
    lesson: "JPD123 - Bài 7 (Cặp từ もう và まだ)",
    tips: "Hỏi もう (đã... chưa) ➔ Khẳng định はい luôn đi với「もう」(đã làm rồi).",
    reason: "Đáp án đúng là「もう」(Đã... rồi). 'まだ' (vẫn chưa) chỉ đi với câu phủ định, 'ぜひ' (nhất định) và 'あまり' (không lắm) sai nghĩa.",
  },
  "このアパートの家賃はとても〔高い〕です。___やすい": {
    meaning: "Tiền thuê căn hộ này rất đắt ➔ Từ trái nghĩa: やすい (Rẻ).",
    grammar: "Cặp từ trái nghĩa: 高い (たかい - Đắt) >< 安い (やすい - Rẻ).",
    lesson: "JPD123 - Bài 4 (Cặp tính từ trái nghĩa)",
    tips: "Trái nghĩa với đắt (たかい) về giá cả là rẻ (やすい).",
    reason: "Đáp án đúng là「やすい」(Rẻ). 'ひくい' là Thấp (độ cao), 'ふるい' là Cũ, 'ちいさい' là Nhỏ bé.",
  },
  "私の大学の図書館は〔広い〕です。___せまい": {
    meaning: "Thư viện trường đại học của tôi rộng ➔ Từ trái nghĩa: せまい (Chật hẹp).",
    grammar: "Cặp từ trái nghĩa: 広い (ひろい - Rộng) >< 狭い (せまい - Hẹp).",
    lesson: "JPD123 - Bài 4 (Cặp tính từ trái nghĩa)",
    tips: "Trái nghĩa với rộng rãi (ひろい) là chật hẹp (せまい).",
    reason: "Đáp án đúng là「せまい」(Chật hẹp). 'ちいさい' là Nhỏ, 'とおい' là Xa, 'みじかい' là Ngắn.",
  },
  "学校から駅まで〔近い〕ですから、歩いて行きます。___とおい": {
    meaning: "Từ trường đến ga gần nên tôi đi bộ ➔ Từ trái nghĩa: とおい (Xa xôi).",
    grammar: "Cặp từ trái nghĩa về khoảng cách: 近い (ちかい - Gần) >< 遠い (とおい - Xa).",
    lesson: "JPD123 - Bài 6 (Cặp tính từ khoảng cách)",
    tips: "Trái nghĩa với gần (ちかい) là xa (とおい).",
    reason: "Đáp án đúng là「とおい」(Xa). 'おそい' là Chậm/Muộn, 'ひろい' là Rộng, 'たかい' là Cao/Đắt.",
  },
  "きょうの教室は〔暑い〕ですね。___さむい": {
    meaning: "Hôm nay phòng học nóng nhỉ ➔ Từ trái nghĩa: さむい (Lạnh giá).",
    grammar: "Cặp từ trái nghĩa về thời tiết: 暑い (あつい - Nóng) >< 寒い (さむい - Lạnh).",
    lesson: "JPD123 - Bài 4 (Cặp tính từ thời tiết)",
    tips: "Trái nghĩa với nóng nực (あつい) về thời tiết là lạnh (さむい).",
    reason: "Đáp án đúng là「さむい」(Lạnh). 'つめたい' dùng cho cảm giác sờ vào vật thể lạnh (nước lạnh), 'すずしい' là Mát mẻ, 'ぬるい' là Nguội.",
  },
  "A：お茶をどうぞ。\nB：（　　）。___いただきます": {
    meaning: "A: Xin mời bạn dùng trà.\nB: Vâng, xin phép được nhận / Tôi xin.",
    grammar: "Câu chào lịch sự khi được mời đồ ăn thức uống: いただきます.",
    lesson: "JPD123 - Bài 7 (Giao tiếp mời ăn uống)",
    tips: "Khi người khác mời dùng bữa/uống trà (どうぞ) thì đáp lại bằng「いただきます」.",
    reason: "Đáp án đúng là「いただきます」(Tôi xin nhận). 'ごちそうさまでした' dùng khi ăn xong bữa, 'おねがいします' là làm ơn, 'いってきます' là tôi đi rồi về.",
  },
  "A：すみません、塩を取ってください。\nB：（　　）。___はい、どうぞ": {
    meaning: "A: Xin lỗi, bạn lấy giùm tôi lọ muối với.\nB: Vâng, xin mời bạn / Của bạn đây.",
    grammar: "Hội thoại nhờ lấy đồ vật: Đưa đồ cho người khác dùng câu「はい、どうぞ」.",
    lesson: "JPD123 - Bài 7 (Nhờ vả và hồi đáp)",
    tips: "Khi đưa đồ cho ai đó, luôn nói「はい、どうぞ」(Vâng, xin mời).",
    reason: "Đáp án đúng là「はい、どうぞ」. 'いいえ、どういたしまして' là Không có chi (đáp lại lời cảm ơn), 'はい、そうです' là Đúng vậy, 'いいえ、けっこうです' là Không cần đâu.",
  },
  "A：昨日の試験はどうでしたか。\nB：（　　）。___とても難しかったです": {
    meaning: "A: Bài thi hôm qua thế nào?\nB: Rất là khó.",
    grammar: "Hỏi và trả lời về tính chất trong quá khứ: 試験はどうでしたか ➔ Tính từ quá khứ (難しかったです).",
    lesson: "JPD123 - Bài 5 (Hỏi quá khứ どうでしたか)",
    tips: "Tính từ đuôi い「難しい」chuyển sang quá khứ là「難しかったです」(bỏ い thêm かったです).",
    reason: "Đáp án đúng là「とても難しかったです」. Các phương án '難しくないでした', '難しかったですない', '難しかったじゃありません' đều là ngữ pháp chia sai hoàn toàn.",
  },
  "A：おいしいカレーの（　　）を教えてください。\nB：はい、まず野菜を切ります。___つくりかた": {
    meaning: "A: Hãy chỉ cho tôi cách nấu món cà ri ngon với.\nB: Vâng, trước hết bạn cắt rau củ nhé.",
    grammar: "Cách làm món ăn: 作り方 (つくりかた). Cấu trúc: V[bỏ ます] + 方 (かた).",
    lesson: "JPD123 - Bài 7 (Mẫu câu cách thức 〜方)",
    tips: "Nấu ăn/chế biến món cà ri dùng động từ 作ります ➔ 作り方 (つくりかた - cách nấu/cách làm).",
    reason: "Đáp án đúng là「つくりかた」(Cách nấu/làm). 'よみかた' là Cách đọc, 'つかいかた' là Cách sử dụng, 'いきかた' là Cách đi (đường đi).",
  },
  "A：駅までの（　　）を教えてください。\nB：この道をまっすぐ行きます。___いきかた": {
    meaning: "A: Hãy chỉ cho tôi đường đi đến nhà ga với.\nB: Bạn cứ đi thẳng con đường này nhé.",
    grammar: "Cách đi đến một địa điểm: 行き方 (いきかた). Động từ 行きます + 方.",
    lesson: "JPD123 - Bài 7 (Hỏi đường & Mẫu câu 〜方)",
    tips: "Đến ga (駅まで) và trả lời bằng đi thẳng con đường này (まっすぐ行きます) ➔ hỏi cách đi (いきかた).",
    reason: "Đáp án đúng là「いきかた」(Cách đi/đường đi). 'つくりかた' là Cách làm, 'よみかた' là Cách đọc, 'のみかた' là Cách uống.",
  },

  // =========================================================================
  // GRAMMAR SEEDS
  // =========================================================================
  "おとといはあまり（　　）。___さむくなかったです": {
    meaning: "Hôm kia trời không lạnh lắm.",
    grammar: "Phủ định quá khứ tính từ đuôi い: 寒い ➔ さむくなかったです. Đi kèm phó từ あまり.",
    lesson: "JPD123 - Bài 4 (Chia thì quá khứ tính từ đuôi い)",
    tips: "Từ chỉ thời gian là「おととい」(hôm kia) ➔ thì Quá khứ. Kết hợp với「あまり」➔ Phủ định. Công thức: bỏ い thêm「くなかったです」.",
    reason: "Đáp án đúng là「さむくなかったです」. Tính từ đuôi い tuyệt đối KHÔNG đi với じゃありません. 'さむいじゃありませんでした' sai vì chia như tính từ đuôi な.",
  },
  "きのう見た日本映画はとても（　　）。___よかったです": {
    meaning: "Bộ phim Nhật Bản tôi xem hôm qua rất là hay.",
    grammar: "Quá khứ của tính từ đặc biệt「いい」: いい ➔ よかったです.",
    lesson: "JPD123 - Bài 4 (Tính từ đặc biệt いい/よい)",
    tips: "Ghi nhớ quy tắc vàng N5: Tính từ いい khi chia quá khứ hay phủ định đều mượn gốc よい: Quá khứ là「よかったです」, phủ định là「よくないです」.",
    reason: "Đáp án đúng là「よかったです」. Tuyệt đối không có 'いいかったです' hay 'いいでした'.",
  },
  "昔、この公園はとても（　　）。___しずかでした": {
    meaning: "Ngày xưa công viên này rất là yên tĩnh.",
    grammar: "Quá khứ khẳng định của tính từ đuôi な: 静か (しずか) + でした.",
    lesson: "JPD123 - Bài 4 (Chia tính từ đuôi な)",
    tips: "Từ chỉ thời gian「昔」(ngày xưa) ➔ Quá khứ.「しずか」là tính từ đuôi な ➔ Khẳng định quá khứ là「しずかでした」.",
    reason: "Đáp án đúng là「しずかでした」. 'しずかかったです' sai vì chia nhầm thành đuôi い.",
  },
  "お客さんが来ますから、部屋を（　　）そうじしてください。___きれいに": {
    meaning: "Vì khách sắp đến nên hãy dọn dẹp phòng cho sạch sẽ nhé.",
    grammar: "Phó từ hóa bổ nghĩa cho động từ: Tính từ đuôi な + に + Động từ (きれいに + そうじします).",
    lesson: "JPD123 - Bài 4 (Phó từ hóa tính từ)",
    tips: "Bổ nghĩa cho động từ そうじしてください: Tính từ đuôi な thay な bằng「に」.",
    reason: "Đáp án đúng là「きれいに」. 'きれいな' chỉ đứng trước danh từ, 'きれいく' sai vì きれい không phải tính từ đuôi い.",
  },
  "あした試験がありますから、（　　）起きます。___はやく": {
    meaning: "Vì ngày mai có bài thi nên tôi sẽ dậy sớm.",
    grammar: "Phó từ hóa bổ nghĩa cho động từ: Tính từ đuôi い (早い) đổi「い」thành「く」➔ はやく + 起きます.",
    lesson: "JPD123 - Bài 4 (Phó từ hóa tính từ đuôi い)",
    tips: "Bổ nghĩa cho động từ 起きます: 早い đổi い thành「く」➔「はやく」.",
    reason: "Đáp án đúng là「はやく」. 'はやいに' sai vì 早い là tính từ đuôi い, không dùng trợ từ に.",
  },
  "このアパートは狭いです（　　）、家賃が安いです。___が": {
    meaning: "Căn hộ này nhỏ hẹp nhưng giá thuê lại rẻ.",
    grammar: "Liên từ nối 2 vế tương phản trong cùng một câu: [Vế 1] が、[Vế 2] (nhưng...).",
    lesson: "JPD123 - Bài 4 (Liên từ nối が)",
    tips: "Hai vế có ý nghĩa trái ngược nhau (hẹp >< rẻ) nối trong một câu dùng「が」.「でも」chỉ đứng đầu câu mới sau dấu chấm.",
    reason: "Đáp án đúng là「が」. 'そして' dùng nối thuận (và), 'から' chỉ nguyên nhân (vì), 'でも' không đứng giữa câu sau dấu phẩy.",
  },
  "今晩、FPT大学のホール（　　）音楽会があります。___で": {
    meaning: "Tối nay tại hội trường Đại học FPT sẽ diễn ra buổi hòa nhạc.",
    grammar: "Trợ từ chỉ nơi chốn diễn ra sự kiện/hoạt động: Nơi chốn + で + Sự kiện + があります.",
    lesson: "JPD123 - Bài 4 (Trợ từ で chỉ nơi tổ chức sự kiện)",
    tips: "Bẫy trợ từ kinh điển: Nếu là sự kiện, tiệc tùng, lễ hội (音楽会, パーティー) thì nơi chốn đi với「で」, KHÔNG dùng「に」.",
    reason: "Đáp án đúng là「で」. 'に' chỉ dùng khi đồ vật hoặc người tồn tại tĩnh (ở đó có cái bàn, có người). Ở đây 音楽会 là sự kiện nên dùng で.",
  },
  "私の机の上（　　）ノートと辞書があります。___に": {
    meaning: "Ở trên bàn của tôi có vở và từ điển.",
    grammar: "Trợ từ chỉ vị trí tồn tại đồ vật: Vị trí + に + Vật + があります.",
    lesson: "JPD123 - Bài 4 (Sự tồn tại của đồ vật)",
    tips: "Chỉ vị trí tồn tại của đồ vật cố định (ノート, 辞書) đi với trợ từ「に」.",
    reason: "Đáp án đúng là「に」. 'で' dùng cho nơi diễn ra hành động, 'へ' chỉ phương hướng di chuyển.",
  },
  "誕生日にお父さんから新しいパソコン（　　）ほしいです。___が": {
    meaning: "Vào ngày sinh nhật, tôi muốn có một chiếc máy tính mới từ bố.",
    grammar: "Mẫu câu mong muốn sở hữu danh từ: Danh từ + が + ほしいです.",
    lesson: "JPD123 - Bài 5 (Mong muốn sở hữu N が ほしい)",
    tips: "Bẫy số 1 đề thi FPT: Đối tượng của「ほしいです」luôn đi kèm trợ từ「が」, tuyệt đối không dùng trợ từ を.",
    reason: "Đáp án đúng là「が」. 'ほしい' là tính từ đuôi い diễn tả mong muốn, đối tượng mong muốn phải là [Danh từ + が].",
  },
  "夏休みに日本へ（　　）。___いきたいです": {
    meaning: "Vào kỳ nghỉ hè tôi muốn đi Nhật Bản.",
    grammar: "Mẫu câu muốn thực hiện hành động: V[bỏ ます] + たいです. 行きます ➔ 行きたいです.",
    lesson: "JPD123 - Bài 5 (Mẫu câu Vたい)",
    tips: "Muốn làm gì: Động từ bỏ ます ghép với「たいです」. 行きます ➔ いきたいです.",
    reason: "Đáp án đúng là「いきたいです」. 'いきますたいです' thừa ます, 'いきほしいです' sai vì ほしい chỉ đi với danh từ.",
  },
  "スーパーへ晩ごはんの材料を買い（　　）行きます。___に": {
    meaning: "Tôi đi đến siêu thị để mua nguyên liệu cho bữa tối.",
    grammar: "Cấu trúc chỉ mục đích di chuyển: Địa điểm + へ + V[bỏ ます] / N + に + 行きます (Đi để làm gì).",
    lesson: "JPD123 - Bài 5 (Mục đích di chuyển Vに 行きます)",
    tips: "Trước động từ di chuyển 行きます: Động từ bỏ ます (買い) đi với trợ từ「に」.",
    reason: "Đáp án đúng là「に」. Cấu trúc chuẩn: 買いに行きます (Đi để mua).",
  },
  "A：どうして学校を休みましたか。\nB：頭が痛かった（　　）です。___から": {
    meaning: "A: Tại sao bạn lại nghỉ học vậy?\nB: Vì tôi bị đau đầu.",
    grammar: "Mệnh đề giải thích nguyên nhân trả lời cho câu hỏi「どうして」: [Lý do] からです.",
    lesson: "JPD123 - Bài 5 (Hỏi lý do どうして & から)",
    tips: "Câu hỏi bắt đầu bằng「どうして」(Tại sao) thì câu trả lời luôn kết thúc bằng「〜からです」(Vì...).",
    reason: "Đáp án đúng là「から」(Vì/Bởi vì). 'まで' là Đến tận, 'けれど' là Mặc dù.",
  },
  "日曜日、ハノイで友達（　　）テニスをしました。___と": {
    meaning: "Chủ nhật, tôi đã chơi tennis cùng với bạn ở Hà Nội.",
    grammar: "Trợ từ chỉ đối tác cùng thực hiện hành động: Danh từ (người) + と + Động từ (Làm gì cùng ai).",
    lesson: "JPD123 - Bài 5 (Trợ từ と chỉ bạn đồng hành)",
    tips: "Cùng làm gì với ai đó dùng trợ từ「と」(Cùng với).",
    reason: "Đáp án đúng là「と」. 友達と = Cùng với bạn. 'で' chỉ nơi chốn/phương tiện, 'に' chỉ thời điểm/đích đến.",
  },
  "飛行機は新幹線（　　）速いです。___より": {
    meaning: "Máy bay nhanh hơn tàu shinkansen.",
    grammar: "Cấu trúc so sánh hơn: A は B より Tính từ です (A ... hơn B).",
    lesson: "JPD123 - Bài 6 (So sánh hơn より)",
    tips: "So sánh hơn: Từ đứng sau đối tượng so sánh chuẩn (新幹線) luôn là「より」(So với). Đuôi câu là tính từ khẳng định.",
    reason: "Đáp án đúng là「より」. 新幹線より = So với shinkansen. 'ほど' chỉ đi với câu phủ định.",
  },
  "バスは電車（　　）速くないです。___ほど": {
    meaning: "Xe buýt không nhanh bằng tàu điện.",
    grammar: "Cấu trúc so sánh kém (không bằng): A は B ほど Tính từ [phủ định] (A không ... bằng B).",
    lesson: "JPD123 - Bài 6 (So sánh kém ほど)",
    tips: "Dấu hiệu nhận biết: Đuôi tính từ chia PHỦ ĐỊNH「速くないです」(không nhanh) ➔ Bắt buộc dùng「ほど」, không dùng より.",
    reason: "Đáp án đúng là「ほど」. 'より' chỉ dùng trong câu so sánh khẳng định hơn.",
  },
  "日本料理とベトナム料理と（　　）が好きですか。___どちら": {
    meaning: "Món ăn Nhật và món ăn Việt, bạn thích món nào hơn?",
    grammar: "So sánh lựa chọn giữa 2 đối tượng: A と B と どちらが Tính từ ですか.",
    lesson: "JPD123 - Bài 6 (So sánh lựa chọn giữa 2 đối tượng)",
    tips: "So sánh giữa HAI đối tượng (A と B と) thì từ để hỏi bắt buộc là「どちら」(Bên nào/cái nào trong hai).",
    reason: "Đáp án đúng là「どちら」. 'どれ' chỉ dùng khi so sánh từ 3 đối tượng trở lên. 'どこ' hỏi nơi chốn, 'だれ' hỏi người.",
  },
  "夏と冬では、夏（　　）暑いです。___のほうが": {
    meaning: "Giữa mùa hè và mùa đông thì mùa hè nóng hơn.",
    grammar: "Trả lời cho câu so sánh lựa chọn: A のほうが Tính từ です (Phía A ... hơn).",
    lesson: "JPD123 - Bài 6 (Mẫu câu のほうが)",
    tips: "Chỉ định đối tượng vượt trội hơn trong câu so sánh: Danh từ +「のほうが」.",
    reason: "Đáp án đúng là「のほうが」. 夏のほうが暑いです = Phía mùa hè thì nóng hơn.",
  },
  "スポーツの中でサッカーが（　　）おもしろいです。___いちばん": {
    meaning: "Trong các môn thể thao, bóng đá là môn thú vị nhất.",
    grammar: "Cấu trúc so sánh nhất: [Phạm vi] の中で [Chủ ngữ] が いちばん [Tính từ] です.",
    lesson: "JPD123 - Bài 6 (So sánh nhất いちばん)",
    tips: "Trong phạm vi một tập thể「〜の中で」, tính từ đứng sau「いちばん」(nhất) và đi kèm trợ từ が.",
    reason: "Đáp án đúng là「いちばん」(Nhất). 'とても' chỉ là rất, 'あまり' là không lắm, 'すこし' là một chút.",
  },
  "郵便局で80円の切手を5（　　）買いました。___まい": {
    meaning: "Tôi đã mua 5 con tem 80 yên ở bưu điện.",
    grammar: "Lượng từ đếm vật mỏng phẳng dẹt (tem, giấy, áo sơ mi, đĩa CD): Số từ + 枚 (まい).",
    lesson: "JPD123 - Bài 6 (Lượng từ số đếm)",
    tips: "Tem thư (切手) là vật mỏng dẹt ➔ Đếm bằng「まい (枚)」.",
    reason: "Đáp án đúng là「まい」. 'ほん' dùng đếm vật thon dài (bút, chai), 'だい' dùng đếm máy móc xe cộ, 'つ' là đếm đồ vật chung.",
  },
  "A：「いっしょにお茶を飲みませんか。」\nB：「すみません。きょうは（　　）… 約束がありますから。」___ちょっと": {
    meaning: "A: Cùng đi uống trà với tôi nhé?\nB: Xin lỗi. Hôm nay thì hơi... vì tôi có hẹn rồi.",
    grammar: "Mở rộng rủ rê và từ chối khéo: すみません、〜はちょっと… + N がありますから (nêu lý do).",
    lesson: "JPD123 - Bài 6 (Rủ rê & Từ chối khéo léo)",
    tips: "Từ chối khéo lời mời: người Nhật dùng「ちょっと…」(hơi kẹt/hơi khó) thay vì nói thẳng 'không'.",
    reason: "Đáp án đúng là「ちょっと」. Cụm từ「〜はちょっと…」dùng để từ chối tế nhị. 'だめ' hay 'いいえ' quá thẳng thừng và thiếu lịch sự trong văn hóa Nhật.",
  },
  "A：「あした、いっしょに映画を見に行きませんか。」\nB：「すみません。あしたはちょっと… （　　）がありますから。」___やくそく": {
    meaning: "A: Ngày mai cùng đi xem phim với tôi không?\nB: Xin lỗi. Ngày mai thì hơi... vì tôi có hẹn rồi.",
    grammar: "Đưa ra lý do từ chối lời mời: N (lý do) + がありますから.",
    lesson: "JPD123 - Bài 6 (Rủ rê & Lý do từ chối)",
    tips: "Có hẹn / có cuộc hẹn dùng cụm cố định「約束 (やくそく) があります」.",
    reason: "Đáp án đúng là「やくそく」(Cuộc hẹn). 'きっぷ' là vé, 'カメラ' là máy ảnh, 'てがみ' là thư từ không phù hợp ngữ cảnh.",
  },
  "A：「日曜日、いっしょに買い物に行きませんか。」\nB：「すみません。アルバイトがあります（　　）。」___から": {
    meaning: "A: Chủ nhật cùng đi mua sắm với tôi không?\nB: Xin lỗi. Bởi vì tôi có lịch làm thêm rồi.",
    grammar: "Trợ từ から đứng cuối câu giải thích nguyên nhân/lý do: 〜から (bởi vì...).",
    lesson: "JPD123 - Bài 6 (Nguyên nhân từ chối から)",
    tips: "Đứng sau câu giải thích lý do cho lời từ chối luôn là trợ từ「から」.",
    reason: "Đáp án đúng là「から」. Dùng giải thích lý do (vì có làm thêm). 'まで' là đến, 'より' là so với, 'ほど' là bằng.",
  },
  "A：「いっしょに昼ごはんを食べませんか。」\nB：「ええ、（　　）。」___食べましょう": {
    meaning: "A: Cùng ăn trưa với tôi không?\nB: Vâng, chúng ta cùng ăn nhé.",
    grammar: "Đồng ý nhiệt tình với lời mời「〜ませんか」bằng mẫu「〜ましょう」(cùng làm nhé).",
    lesson: "JPD123 - Bài 6 (Rủ rê & Đồng ý Vましょう)",
    tips: "Hỏi rủ rê「〜ませんか」➔ Đồng ý đáp lại là「ええ、〜ましょう」.",
    reason: "Đáp án đúng là「食べましょう」. '食べますか' là câu hỏi, '食べませんでした' là quá khứ phủ định, '食べたいです' là mong muốn cá nhân.",
  },
  "A：「土曜日、いっしょにテニスをしませんか。」\nB：「すみません。土曜日は（　　）… 用事がありますから。」___ちょっと": {
    meaning: "A: Thứ bảy cùng chơi tennis với tôi không?\nB: Xin lỗi. Thứ bảy thì hơi... vì tôi có việc bận rồi.",
    grammar: "Từ chối khéo léo kèm lý do: 〜はちょっと… 用事がありますから.",
    lesson: "JPD123 - Bài 6 (Rủ rê & Từ chối khéo léo)",
    tips: "Khi từ chối lịch sự, dùng「〜はちょっと…」(nghĩa là 'thì hơi khó...').",
    reason: "Đáp án đúng là「ちょっと」. Các phó từ 'ぜんぜん', 'たくさん', 'ゆっくり' không có nghĩa từ chối.",
  },
  "来週、FPT大学（　　）お祭りがあります。___で": {
    meaning: "Tuần sau, ở trường Đại học FPT sẽ có lễ hội.",
    grammar: "Nơi diễn ra sự kiện/hoạt động: Địa điểm + で + N(sự kiện: お祭り, パーティー, 試験) + があります.",
    lesson: "JPD123 - Bài 6 (Nơi diễn ra sự kiện で)",
    tips: "Sự kiện, lễ hội (お祭り) là hoạt động diễn ra ➔ Dùng trợ từ「で」, KHÔNG dùng「に」.",
    reason: "Đáp án đúng là「で」. 'に' chỉ nơi tồn tại vật tĩnh, 'へ' chỉ hướng đi. Với sự kiện/hoạt động 'お祭り' phải đi với trợ từ で.",
  },
  "あした、教室（　　）日本語の試験があります。___で": {
    meaning: "Ngày mai sẽ có kỳ thi tiếng Nhật diễn ra ở phòng học.",
    grammar: "Địa điểm diễn ra sự kiện: [Địa điểm] で [Sự kiện: 試験] があります.",
    lesson: "JPD123 - Bài 6 (Nơi diễn ra sự kiện で)",
    tips: "Kỳ thi (試験 - しけん) là một sự kiện tổ chức ➔ Dùng trợ từ「で」.",
    reason: "Đáp án đúng là「đáp án đúng là で」. Địa điểm tổ chức kỳ thi, hội họp luôn đi với で.",
  },
  "日曜日、公園で楽しい（　　）があります。___パーティー": {
    meaning: "Chủ nhật sẽ có một bữa tiệc vui vẻ diễn ra ở công viên.",
    grammar: "Cấu trúc「Địa điểm で Sự kiện があります」: Nơi chốn + で + Danh từ sự kiện + があります.",
    lesson: "JPD123 - Bài 6 (Sự kiện diễn ra ở địa điểm)",
    tips: "Đi với trợ từ「で... があります」phải là danh từ chỉ sự kiện, hoạt động (パーティー, お祭り).",
    reason: "Đáp án đúng là「パーティー」. 'いぬ', 'つくえ', 'じてんしゃ' là đồ vật/động vật cụ thể, nếu tồn tại ở công viên thì phải đi với trợ từ に (公園に犬がいます). Ở đây dùng trợ từ で nên bắt buộc phải là sự kiện.",
  },
  "今晩、スタジアム（　　）サッカーの試合があります。___で": {
    meaning: "Tối nay tại sân vận động sẽ diễn ra trận thi đấu bóng đá.",
    grammar: "Địa điểm tổ chức trận đấu/sự kiện: [Địa điểm] で [試合] があります.",
    lesson: "JPD123 - Bài 6 (Nơi diễn ra sự kiện で)",
    tips: "Trận đấu thể thao (試合 - しあい) là sự kiện ➔ Nơi chốn đi với「で」.",
    reason: "Đáp án đúng là「で」. Trận đấu bóng đá là sự kiện tổ chức nên dùng trợ từ で.",
  },
  "私の部屋に日本の音楽のCDが1（　　）あります。___まい": {
    meaning: "Trong phòng của tôi có 1 chiếc đĩa CD âm nhạc Nhật Bản.",
    grammar: "Lượng từ đếm vật mỏng, phẳng dẹt (đĩa CD, áo sơ mi, tờ giấy, tem thư, vé): Số từ + 枚 (まい).",
    lesson: "JPD123 - Bài 6 (Đếm vật mỏng dẹt 枚 - まい)",
    tips: "Đĩa CD là vật mỏng dẹt ➔ Luôn đếm bằng「まい (枚)」.",
    reason: "Đáp án đúng là「まい」. 'だい' dùng đếm máy móc xe cộ, 'ほん' đếm vật dài, 'さつ' đếm sách vở.",
  },
  "きのう、デパートで白いシャツを2（　　）買いました。___まい": {
    meaning: "Hôm qua tôi đã mua 2 chiếc áo sơ mi trắng ở trung tâm thương mại.",
    grammar: "Lượng từ đếm áo quần mỏng (áo sơ mi, áo phông): Số từ + 枚 (まい).",
    lesson: "JPD123 - Bài 6 (Đếm vật mỏng dẹt 枚 - まい)",
    tips: "Áo sơ mi (シャツ) là vật mỏng dẹt ➔ Đếm bằng「まい (枚)」.",
    reason: "Đáp án đúng là「まい」. 'だい' dùng cho thiết bị máy móc, 'こ' đếm đồ vật nhỏ tròn, 'ほん' đếm vật thon dài.",
  },
  "映画のチケットが2（　　）ありますから、いっしょに見に行きませんか。___まい": {
    meaning: "Tôi có 2 vé xem phim rồi, cùng đi xem với tôi nhé?",
    grammar: "Lượng từ đếm vé xem phim (vật mỏng dẹt): Số từ + 枚 (まい).",
    lesson: "JPD123 - Bài 6 (Đếm vật mỏng dẹt 枚 - まい)",
    tips: "Vé xem phim, vé tàu (チケット, 切符) là vật mỏng phẳng ➔ Đếm bằng「まい (枚)」.",
    reason: "Đáp án đúng là「まい」. 'だい' đếm xe cộ/máy móc, 'かい' đếm số lần, 'ばん' chỉ số thứ tự.",
  },
  "研究室にパソコンが10（　　）あります。___だい": {
    meaning: "Trong phòng nghiên cứu có 10 chiếc máy tính.",
    grammar: "Lượng từ đếm máy móc, xe cộ, thiết bị cơ giới: Số từ + 台 (だい).",
    lesson: "JPD123 - Bài 6 (Lượng từ số đếm)",
    tips: "Máy tính (パソコン), ô tô, tivi, tủ lạnh ➔ Đếm bằng「だい (台)」.",
    reason: "Đáp án đúng là「だい」. 'まい' đếm vật mỏng dẹt, 'ほん' đếm vật thon dài, 'こ' đếm vật nhỏ tròn.",
  },
  "ここに名前と住所を（　　）ください。___かいて": {
    meaning: "Xin vui lòng viết tên và địa chỉ vào đây.",
    grammar: "Mẫu câu nhờ vả, yêu cầu lịch sự: Vてください. 書きます (nhóm 1) ➔ 書いてください.",
    lesson: "JPD123 - Bài 7 (Mẫu câu yêu cầu Vてください)",
    tips: "Động từ nhóm 1 đuôi「き」đổi thành「いて」: かきます ➔ かいて.",
    reason: "Đáp án đúng là「かいて」. 'かきて' sai quy tắc chia thể て, 'かいた' là thể quá khứ ngắn, 'かきって' sai biến âm.",
  },
  "駅へ（　　）、切符を買いました。___いって": {
    meaning: "Tôi đi đến nhà ga rồi mua vé.",
    grammar: "Nối chuỗi hành động theo trình tự thời gian: V1て、V2 (Làm V1 rồi làm V2). 行きます ➔ 行って.",
    lesson: "JPD123 - Bài 7 (Nối chuỗi hành động bằng thể て)",
    tips: "Động từ 行きます (Đi) là trường hợp BẤT QUY TẮC đặc biệt của nhóm 1: chia thể て là「いって」(xúc âm っ), không chia thành いいて.",
    reason: "Đáp án đúng là「いって」. Quy tắc đặc biệt: 行きます ➔ 行って. Các phương án 'いきて', 'いいた', 'いで' đều sai.",
  },
  "薬を（　　）、早く寝てください。___のんで": {
    meaning: "Uống thuốc xong rồi hãy đi ngủ sớm nhé.",
    grammar: "Nối hành động bằng thể て: 飲みます ➔ 飲んで. Động từ nhóm 1 tận cùng「み」thành「んで」.",
    lesson: "JPD123 - Bài 7 (Động từ chia thể て nhóm 1)",
    tips: "Động từ đuôi み, び, に chia thể て chuyển thành「んで」: のみます ➔ のんで.",
    reason: "Đáp án đúng là「のんで」. 'のみて' sai vì không biến âm, 'のんだ' là thể quá khứ ngắn.",
  },
  "朝ごはんを（　　）から学校へ行きます。___たべて": {
    meaning: "Sau khi ăn bữa sáng xong thì tôi đi đến trường.",
    grammar: "Mẫu câu làm V1 xong rồi mới làm V2: V1 てから、V2. 食べます (nhóm 2) ➔ 食べて.",
    lesson: "JPD123 - Bài 7 (Cấu trúc Vてから)",
    tips: "Động từ nhóm 2 bỏ ます thêm て: たべます ➔ たべて. Đi với「から」nghĩa là 'sau khi làm xong'.",
    reason: "Đáp án đúng là「たべて」. 'たべって', 'たべして', 'たべた' đều sai quy tắc chia thể て của nhóm 2.",
  },
  "父は今、庭で車を（　　）。___あらっています": {
    meaning: "Bố tôi bây giờ đang rửa xe ô tô ở ngoài sân.",
    grammar: "Thì hiện tại tiếp diễn: Vています. 洗います (nhóm 1, đuôi い) ➔ 洗って + います.",
    lesson: "JPD123 - Bài 7 (Thì tiếp diễn Vています)",
    tips: "Thấy có từ「今」(bây giờ) chỉ hành động đang diễn ra ➔ Dùng thể tiếp diễn「Vています」.",
    reason: "Đáp án đúng là「あらっています」. Động từ 洗います (rửa) tận cùng bằng「い」chuyển thành xúc âm って: あらって + います. 'あらいます' là hiện tại đơn, 'あらいました' là quá khứ.",
  },
  "私は日本の漫画（　　）大好きです。___が": {
    meaning: "Tôi rất thích truyện tranh Nhật Bản.",
    grammar: "Trợ từ chỉ đối tượng của sở thích: Danh từ + が + すきです / だいすきです.",
    lesson: "JPD123 - Bài 7 (Sở thích cá nhân & Trợ từ が)",
    tips: "Bẫy trợ từ: Thích (すき), Ghét (きらい), Giỏi (じょうず), Kém (へた) luôn đi kèm trợ từ「が」, không dùng trợ từ を.",
    reason: "Đáp án đúng là「が」. 'だいすき' là tính từ đuôi な thể hiện cảm xúc, đối tượng được yêu thích bắt buộc dùng trợ từ「が」.",
  },
  "So sánh giữa mùa hè và mùa đông___夏は冬より暑いです。": {
    meaning: "Mùa hè nóng hơn mùa đông.",
    grammar: "Cấu trúc so sánh hơn: A は B より Tính từ です (A hơn B).",
    lesson: "JPD123 - Bài 6 (So sánh hơn)",
    tips: "Muốn nói mùa hè nóng hơn mùa đông: Đặt mùa hè làm chủ ngữ「夏は」, mùa đông làm đối tượng so sánh「冬より」, tính từ nóng khẳng định「暑いです」.",
    reason: "Đáp án đúng là「夏は冬より暑いです。」. Các phương án '夏は冬ほど暑いです' sai ngữ pháp vì ほど chỉ đi với phủ định; '冬は夏より暑いです' sai thực tế logic; '夏は冬より暑くないです' sai phủ định.",
  },
  "Muốn mua một chiếc xe máy mới___新しいバイクを買いたいです。": {
    meaning: "Tôi muốn mua một chiếc xe máy mới.",
    grammar: "Mẫu câu mong muốn làm hành động: Tân ngữ を + V[bỏ ます] + たいです.",
    lesson: "JPD123 - Bài 5 (Mong muốn Vたい)",
    tips: "Động từ 買います bỏ ます thêm たい ➔ 買いたいです. Tân ngữ đi với を (hoặc が).",
    reason: "Đáp án đúng là「新しいバイクを買いたいです。」. '買いたいです' kết hợp đúng; các phương án '買うたいです', '買いほしいです', '買いますたいです' đều sai dạng thức chia.",
  },
};

/**
 * Tự động tạo hoặc tra cứu lời giải chi tiết thông minh và chuẩn xác 100% cho từng câu hỏi
 */
export function getQuestionExplanation(question: ExamQuestion): QuestionExplanation {
  const baseExp = resolveBaseExplanation(question);
  const fullSentenceTranslation = getFullSentenceTranslation(question);

  let meaning = baseExp.meaning;
  if (fullSentenceTranslation && (!meaning || !isCompleteSentenceTranslation(meaning))) {
    meaning = fullSentenceTranslation;
  }

  const wrongOptions =
    baseExp.wrongOptions && baseExp.wrongOptions.length > 0
      ? baseExp.wrongOptions
      : analyzeDistractors(question);

  return {
    ...baseExp,
    meaning,
    wrongOptions,
  };
}

function resolveBaseExplanation(question: ExamQuestion): QuestionExplanation {
  // 1. Nếu câu hỏi đã có sẵn explanation chuẩn (từ AI hoặc nguồn sinh đề), ưu tiên dùng nếu nghĩa là câu hoàn chỉnh
  if (
    question.explanation &&
    question.explanation.meaning &&
    question.explanation.reason &&
    question.explanation.meaning.length > 5 &&
    isCompleteSentenceTranslation(question.explanation.meaning) &&
    // Đảm bảo không bị lọt template cũ của "Căn phòng này nhỏ"
    !question.explanation.meaning.includes("Căn phòng này nhỏ, nhưng sạch sẽ.")
  ) {
    // Nếu lesson chứa dải bài chung chung như "Bài 4 đến 7" hoặc "Bài 4 đến Bài 7", làm sạch về bài cụ thể
    if (
      question.explanation.lesson &&
      (question.explanation.lesson.includes("đến") ||
        question.explanation.lesson.includes("4 đến 7") ||
        question.explanation.lesson.includes("4-7"))
    ) {
      return {
        ...question.explanation,
        lesson: determineLesson(question),
      };
    }
    return question.explanation;
  }

  // 2. Tra cứu chuẩn xác theo bảng từ điển câu hỏi đề thi FPT JPD123
  const sentence = (question.sentence || "").trim();
  const answer = (question.answer || "").trim();
  const normSentence = normalizeSentenceKey(sentence);
  const directKey = `${sentence}___${answer}`;
  const normKey = `${normSentence}___${answer}`;

  if (EXACT_EXPLANATIONS[directKey]) {
    return EXACT_EXPLANATIONS[directKey];
  }
  if (EXACT_EXPLANATIONS[normKey]) {
    return EXACT_EXPLANATIONS[normKey];
  }
  if (EXACT_EXPLANATIONS[sentence]) {
    return EXACT_EXPLANATIONS[sentence];
  }
  if (EXACT_EXPLANATIONS[normSentence]) {
    return EXACT_EXPLANATIONS[normSentence];
  }

  // 3. Tra cứu theo câu văn hoàn chỉnh
  for (const [key, explanation] of Object.entries(EXACT_EXPLANATIONS)) {
    const [sentencePart, answerPart] = key.split("___");
    if (
      normalizeSentenceKey(sentencePart) === normSentence &&
      (!answerPart || answerPart === answer)
    ) {
      return explanation;
    }
  }

  // 4. Nếu là câu hỏi mới hoặc câu hỏi sinh từ AI chưa có trong bảng từ điển:
  // Xây dựng lời giải theo từng Module chuyên biệt, KHÔNG dùng romaji regex mơ hồ.
  if (question.section === "Kanji") {
    return buildKanjiExplanation(question);
  }
  if (question.section === "Ngữ pháp") {
    return buildGrammarExplanation(question);
  }
  return buildVocabExplanation(question);
}

/**
 * Lời giải cho câu hỏi Chữ Hán (Kanji) với phân tích Hán Việt, bộ thủ và bẫy phát âm
 */
function buildKanjiExplanation(q: ExamQuestion): QuestionExplanation {
  const isReading =
    q.prompt.includes("cách đọc") ||
    q.prompt.includes("読み方") ||
    q.prompt.includes("Hiragana");
  const isWriting =
    q.prompt.includes("chữ Hán") ||
    q.prompt.includes("漢字") ||
    q.prompt.includes("Kanji");

  const lesson = determineLesson(q);
  const fullMeaning = getFullSentenceTranslation(q);
  const answer = (q.answer || "").trim();

  // Trích xuất từ hoặc chữ Hán trong ngoặc
  const parenMatch = q.sentence?.match(/（([^）]+)）|\(([^)]+)\)|〔([^〕]+)〕/);
  const targetChar = parenMatch ? parenMatch[1] || parenMatch[2] || parenMatch[3] : answer;

  if (isReading) {
    // Phân tích cách đọc Hiragana
    const hasLongVowel = /[ういおえ]/.test(answer) && answer.length >= 3;
    const hasDakuten = /[がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ]/.test(answer);
    const hasSokuon = answer.includes("っ");

    let specialPhonetic = "";
    if (hasLongVowel) {
      specialPhonetic += " Chú ý trường âm (âm kéo dài): cần phát âm dài 2 phách, không được nuốt âm dài.";
    }
    if (hasDakuten) {
      specialPhonetic += " Chú ý âm đục (tenten / maru): phụ âm bị biến âm khi ghép từ.";
    }
    if (hasSokuon) {
      specialPhonetic += " Chú ý âm ngắt (xúc âm っ): ngừng nửa phách trước phụ âm tiếp theo.";
    }

    return {
      meaning: fullMeaning,
      grammar: `Chữ Hán sơ cấp N5 - Cách đọc Hiragana theo âm On/Kun của từ「${targetChar}」`,
      lesson,
      tips: `Quy tắc phòng thi FPT: Quan sát kỹ trường âm (おう, えい, ゆう) và âm đục (tenten). Các phương án sai thường cố tình bớt 1 âm dài hoặc bỏ dấu đục.`,
      reason: `Đáp án đúng là「${answer}」. Từ chữ Hán「${targetChar}」khi điền vào ngữ cảnh câu này có cách đọc chuẩn xác là「${answer}」.${specialPhonetic} Các phương án còn lại là bẫy sai trường âm hoặc cố ý đổi phụ âm/thiếu âm đục nhằm đánh lừa thị giác.`,
    };
  }

  if (isWriting) {
    const alphaHit = alphabet.find((a) => a.char === answer || (a as Record<string, unknown>).kanji === answer);
    const hanviet = alphaHit ? (alphaHit as Record<string, unknown>).hanviet || "" : "";
    const mnemonic = alphaHit ? (alphaHit as Record<string, unknown>).mnemonic || "" : "";

    return {
      meaning: fullMeaning,
      grammar: `Chữ Hán sơ cấp N5 - Nhận diện mặt chữ Hán chuẩn xác cho âm「${targetChar}」`,
      lesson,
      tips: `Mẹo nhận biết mặt chữ: Quan sát kỹ các bộ thủ then chốt (như bộ Mộc 木, Thủy 水, Kim 金, Môn 門, Nhật 日, Nguyệt 月) để phân biệt các chữ có nét tương tự.`,
      reason: `Đáp án đúng là chữ Hán「${answer}」${hanviet ? ` (Âm Hán Việt: ${hanviet})` : ""}. Đây là chữ Hán chuẩn xác biểu thị ý nghĩa tương ứng với âm đọc「${targetChar}」trong câu.${mnemonic ? ` Mẹo ghi nhớ: ${mnemonic}.` : ""} Các phương án còn lại là những chữ Hán khác nét hoặc có ý nghĩa khác không phù hợp với câu.`,
    };
  }

  // Câu hỏi âm Hán Việt hoặc bộ thủ
  return {
    meaning: fullMeaning,
    grammar: `Chữ Hán sơ cấp N5 - Âm Hán Việt và cấu tạo chữ Hán「${targetChar}」`,
    lesson,
    tips: "Âm Hán Việt là cầu nối tuyệt vời giúp sinh viên Việt Nam hiểu ngay 80% ý nghĩa của chữ Hán trong tiếng Nhật.",
    reason: `Đáp án đúng là「${answer}」. Đây là âm Hán Việt chuẩn xác của chữ Hán「${targetChar}」. Hiểu rõ âm Hán Việt giúp người học dễ dàng liên tưởng đến nghĩa của từ trong tiếng Việt và mở rộng vốn từ vựng chuyên ngành.`,
  };
}

/**
 * Lời giải cho câu hỏi Ngữ pháp (Grammar) với giải thích cặn kẽ bản chất công thức và quy tắc chia
 */
function buildGrammarExplanation(q: ExamQuestion): QuestionExplanation {
  const lesson = determineLesson(q);
  const grammarPoint = determineGrammarPoint(q);
  const fullMeaning = getFullSentenceTranslation(q);
  const answer = (q.answer || "").trim();
  const ansMeaning = getAnswerMeaning(answer, q);

  let detailedReason = "";
  let fastTip = "";

  // 1. Phân tích cụ thể cho Động từ thể て (Bài 7: Vてください, Vています, Vましょうか, Vかた)
  if (
    grammarPoint.includes("Vてください") ||
    (grammarPoint.includes("thể て") && answer !== "で") ||
    answer.endsWith("て") ||
    (answer.endsWith("で") && answer.length >= 2) ||
    q.sentence.includes("ください") ||
    q.sentence.includes("ています") ||
    q.sentence.includes("ましょうか")
  ) {
    if (q.sentence.includes("ください")) {
      fastTip = "💡 Thấy đuôi「ください」ở sau chỗ trống ➔ Chọn ngay động từ chia ở THỂ て (Vてください) để tạo câu nhờ vả, yêu cầu lịch sự!";
      detailedReason = `Trong câu xuất hiện đuôi「ください」(xin hãy, vui lòng). Cấu trúc chuẩn yêu cầu động từ đứng trước phải chia ở THỂ て (Vてください) để tạo thành câu yêu cầu, nhờ vả lịch sự.
- Đáp án chính xác là「${answer}」${ansMeaning ? ` (${ansMeaning})` : ""}.
- Phân tích quy tắc chia thể て: Động từ được chia theo đúng nhóm động từ (Nhóm 1 biến âm đuôi い/ち/り ➔ って, み/び/に ➔ んで, き ➔ いて, ぎ ➔ いで; Nhóm 2 bỏ ます thêm て; Nhóm 3 biến đổi thành 来て/して). Các phương án còn lại bị sai quy tắc biến âm hoặc sai nhóm động từ.`;
    } else if (q.sentence.includes("ています") || q.sentence.includes("ている")) {
      fastTip = "💡 Thấy đuôi「ています」➔ Động từ đứng trước bắt buộc phải ở THỂ て (Vています) để diễn tả hành động đang tiếp diễn tại thời điểm nói!";
      detailedReason = `Câu diễn tả hành động đang xảy ra tại thời điểm nói. Cấu trúc chuẩn là: [Chủ ngữ は] + Vています (Đang làm V...). Động từ trước います bắt buộc phải chia ở thể て. Đáp án đúng là「${answer}」, được chia chính xác theo quy tắc thể て.`;
    } else if (q.sentence.includes("ましょうか")) {
      fastTip = "💡 Mẫu câu đề nghị giúp đỡ lịch sự: V(bỏ ます) + ましょうか (Tôi làm giúp bạn nhé?).";
      detailedReason = `Đây là mẫu câu lịch sự dùng để đề nghị làm giúp người khác một việc gì đó (Vましょうか). Động từ trước ましょうか phải ở dạng V(bỏ ます). Đáp án đúng là「${answer}」.`;
    } else if (q.sentence.includes("かた") || q.sentence.includes("方")) {
      fastTip = "💡 Mẫu câu cách thức thực hiện hành động: V(bỏ ます) + 方 (かた) (Ví dụ: 読み方 - cách đọc, 使い方 - cách dùng, 作り方 - cách làm).";
      detailedReason = `Mẫu câu biểu thị cách thức thực hiện một hành động: Động từ bỏ ます ghép với danh từ「方 (かた)」tạo thành danh từ mang nghĩa 'cách làm...'. Đáp án đúng là「${answer}」.`;
    } else {
      fastTip = "💡 Chú ý quy tắc chia thể て của 3 nhóm động từ: Nhóm 1 (いちり➔って, みびに➔んで, き➔いて, ぎ➔いで); Nhóm 2 (bỏ ます+て); Nhóm 3 (来ます➔来て, します➔して).";
      detailedReason = `Đáp án đúng là「${answer}」${ansMeaning ? ` (${ansMeaning})` : ""}. Động từ được chia chuẩn xác theo quy tắc chuyển đổi sang thể て của tiếng Nhật sơ cấp, tạo thành câu tự nhiên và đúng ngữ pháp.`;
    }
  }

  // 2. Phân tích cho Trợ từ công cụ, phương tiện (Bài 7: スプーンで, バスで, 日本語で)
  else if (
    grammarPoint.includes("công cụ") ||
    grammarPoint.includes("phương tiện") ||
    (answer === "で" && (q.sentence.includes("スプーン") || q.sentence.includes("フォーク") || q.sentence.includes("ナイフ") || q.sentence.includes("箸") || q.sentence.includes("お箸") || q.sentence.includes("バス") || q.sentence.includes("電車") || q.sentence.includes("車") || q.sentence.includes("日本語") || q.sentence.includes("英語")))
  ) {
    fastTip = "💡 Danh từ chỉ dụng cụ ăn uống (thìa, dĩa, dao, đũa), phương tiện (xe buýt, tàu điện) hoặc ngôn ngữ ➔ BẮT BUỘC dùng trợ từ「で」!";
    detailedReason = `Trong câu, danh từ trước chỗ trống đóng vai trò là CÔNG CỤ / PHƯƠNG TIỆN để thực hiện hành động.
- Theo quy tắc ngữ pháp tiếng Nhật sơ cấp: [Công cụ / Phương tiện] + で + [Hành động] mang ý nghĩa là 'bằng / dùng [công cụ] để làm gì'.
- Đáp án đúng là trợ từ「で」.
- Không dùng「に」(chỉ thời gian hoặc đích đến), không dùng「を」(chỉ tân ngữ bị tác động), không dùng「へ」(chỉ phương hướng di chuyển).`;
  }

  // 3. Phân tích cho Cấu trúc So sánh (Bài 6: より, ほど, どちら, いちばん)
  else if (grammarPoint.includes("so sánh") || grammarPoint.includes("So sánh") || ["より", "ほど", "どちら", "どちらが", "いちばん", "一番"].includes(answer)) {
    if (answer === "より") {
      fastTip = "💡 Cấu trúc so sánh hơn: A は B より [Tính từ] です (A thì hơn B). Nhìn thấy vị ngữ khẳng định ➔ Chọn ngay「より」!";
      detailedReason = `Câu so sánh hơn giữa 2 đối tượng theo công thức:『A は B より [Tính từ] です』(A thì [Tính từ] hơn B).
- Danh từ đứng trước chỗ trống đóng vai trò là mốc chuẩn để so sánh.
- Vị ngữ trong câu ở dạng KHẲNG ĐỊNH, do đó bắt buộc phải dùng trợ từ so sánh「より」.
- Phân biệt với ほど: Trợ từ「ほど」chỉ dùng trong so sánh không bằng và vị ngữ bắt buộc phải ở dạng PHỦ ĐỊNH.`;
    } else if (answer === "ほど") {
      fastTip = "💡 Cấu trúc so sánh không bằng: A は B ほど [Tính từ phủ định] (A không bằng B). Nhìn thấy vị ngữ phủ định (〜くない / 〜じゃありません) ➔ Chọn ngay「ほど」!";
      detailedReason = `Câu so sánh không bằng (so sánh kém) theo công thức:『A は B ほど [Tính từ PHỦ ĐỊNH]』(A không bằng B).
- Vị ngữ trong câu kết thúc ở dạng PHỦ ĐỊNH (〜くないです hoặc 〜じゃありません).
- Theo quy tắc ngữ pháp tiếng Nhật, khi vị ngữ phủ định thì mốc so sánh B bắt buộc phải đi với trợ từ「ほど」, tuyệt đối không dùng「より」.`;
    } else if (answer.includes("どちら")) {
      fastTip = "💡 Câu hỏi lựa chọn giữa 2 đối tượng: A と B と どちらが [Tính từ] ですか (Giữa A và B thì bên nào... hơn?).";
      detailedReason = `Đây là câu hỏi lựa chọn giữa đúng 2 đối tượng A và B. Cấu trúc chuẩn:『A と B と どちらが [Tính từ] ですか』.
-「どちら」là đại từ để hỏi mang nghĩa 'bên nào / cái nào' trong phạm vi 2 đối tượng.
- Khi trả lời câu hỏi này sẽ dùng:『[Đối tượng] のほうが [Tính từ] です』.`;
    } else if (answer === "いちばん" || answer === "一番") {
      fastTip = "💡 So sánh nhất trong một tập hợp: [Phạm vi] の中で [Chủ ngữ] が一番 [Tính từ] です (Trong tất cả... thì... là nhất).";
      detailedReason = `Cấu trúc so sánh cao nhất:『[Phạm vi / Tập hợp] の中で [Chủ ngữ] が 一番 [Tính từ] です』(Trong số các..., thì... là tính từ nhất).
- Phó từ「一番 (いちばん)」đứng ngay trước tính từ để biểu thị mức độ cao nhất trong toàn bộ phạm vi được so sánh.`;
    }
  }

  // 4. Phân tích cho Nơi tổ chức sự kiện / lễ hội (Bài 6: Địa điểm で Sự kiện があります)
  else if (
    grammarPoint.includes("sự kiện") ||
    grammarPoint.includes("Sự kiện") ||
    (answer === "で" && (q.sentence.includes("お祭り") || q.sentence.includes("おまつり") || q.sentence.includes("パーティー") || q.sentence.includes("コンサート") || q.sentence.includes("試合") || q.sentence.includes("試験")))
  ) {
    fastTip = "💡 Bẫy đề thi kinh điển FPT: Nơi diễn ra sự kiện, lễ hội, bữa tiệc (お祭り, パーティー, コンサート...) BẮT BUỘC dùng trợ từ「で」, TUYỆT ĐỐI KHÔNG dùng「に」!";
    detailedReason = `Đây là câu hỏi kiểm tra điểm ngữ pháp then chốt của Bài 6 về nơi diễn ra sự kiện.
- Công thức:『[Địa điểm] で + [Sự kiện/Lễ hội/Bữa tiệc] + があります』(Tại [Địa điểm] có tổ chức sự kiện...).
- Nhiều học sinh nhầm thấy「あります」nghĩ là chỉ vị trí tồn tại của đồ vật nên chọn「に」. Tuy nhiên, khi danh từ đi kèm là một SỰ KIỆN / HOẠT ĐỘNG (lễ hội お祭り, bữa tiệc パーティー, cuộc họp 会議, trận đấu 試合), nơi tổ chức sự kiện BẮT BUỘC phải dùng trợ từ『で』!`;
  }

  // 5. Phân tích cho Rủ rê & Từ chối khéo (Bài 6: 〜はちょっと… / 〜がありますから)
  else if (grammarPoint.includes("Rủ rê") || grammarPoint.includes("rủ rê") || grammarPoint.includes("Từ chối") || answer.includes("ちょっと") || answer.includes("約束") || answer.includes("用事") || answer.includes("ましょう")) {
    if (answer.includes("ちょっと")) {
      fastTip = "💡 Văn hóa từ chối khéo của người Nhật: Khi được rủ rê mà không thể tham gia, người Nhật nói khéo「〜はちょっと…」(thì hơi bất tiện/khó cho tôi) để giữ phép lịch sự!";
      detailedReason = `Trong giao tiếp tiếng Nhật, khi muốn từ chối một lời mời rủ rê (〜ませんか) một cách tế nhị, người Nhật không nói thẳng 'いいえ' (không) mà nói lấp lửng『〜はちょっと…』(Thời gian đó thì có chút bất tiện cho tôi...).
- Sau đó thường đưa ra lý do khách quan bằng cấu trúc:『[Lý do] がありますから』(Vì tôi có hẹn / có việc bận rồi).
- Đáp án đúng là「${answer}」.`;
    } else if (answer.includes("ましょう")) {
      fastTip = "💡 Đáp lại lời rủ rê (〜ませんか) khi đồng ý:「ええ、〜ましょう」(Vâng, chúng ta cùng làm thôi!).";
      detailedReason = `Khi người khác rủ rê bằng cấu trúc「〜ませんか」, nếu đồng ý tham gia thì người Nhật sẽ hưởng ứng nồng nhiệt bằng cấu trúc『ええ、〜ましょう』(Được đấy, chúng ta cùng làm nhé). Đáp án đúng là「${answer}」.`;
    }
  }

  // 6. Phân tích cho Lượng từ số đếm (Bài 6: 枚 - まい)
  else if (grammarPoint.includes("Lượng từ") || grammarPoint.includes("vật mỏng") || answer.includes("まい") || answer.includes("枚")) {
    fastTip = "💡 Đếm các vật mỏng phẳng (áo sơ mi, đĩa CD, vé xem phim, tờ giấy, tem, bánh pizza) ➔ BẮT BUỘC dùng lượng từ「枚 (まい)」!";
    detailedReason = `Đây là câu hỏi kiểm tra lượng từ chỉ số đếm của Bài 6.
- Trong tiếng Nhật, mỗi loại đồ vật có một lượng từ đếm riêng biệt.
- Đối với các vật có đặc điểm MỎNG, PHẲNG (như áo sơ mi シャツ, đĩa CD, vé チケット, tờ giấy 紙, con tem 切手) thì dùng lượng từ『枚 (まい)』.
- Đáp án đúng là「${answer}」. Các phương án đếm khác (như 本 đếm vật dài, 台 đếm máy móc, 冊 đếm sách) đều sai loại đồ vật.`;
  }

  // 7. Phân tích cho Mẫu câu mong muốn (Bài 5: ほしい vs たい)
  else if (grammarPoint.includes("mong muốn") || answer.includes("ほしい") || answer.includes("たい") || (answer === "が" && q.sentence.includes("ほしい"))) {
    if (answer === "が" && q.sentence.includes("ほしい")) {
      fastTip = "💡 Bẫy đề thi kinh điển: Trong tiếng Nhật,「ほしい」là TÍNH TỪ đuôi い (không phải động từ). Đối tượng mong muốn BẮT BUỘC dùng trợ từ「が」(Danh từ + が + ほしいです), KHÔNG dùng「を」!";
      detailedReason = `Người học tiếng Việt thường có thói quen dịch xuôi 'Tôi muốn [đồ vật]' nên liên tưởng đến ngoại động từ và chọn nhầm trợ từ「を」.
- Bản chất ngữ pháp:『ほしい (hoshii)』là một TÍNH TỪ đuôi い biểu thị cảm xúc mong muốn sở hữu, KHÔNG PHẢI là động từ.
- Do đó, đối tượng của tính từ「ほしい」bắt buộc phải đi kèm với trợ từ『が』.
- Công thức chuẩn: [Chủ ngữ は] + [Danh từ] + が + ほしいです. Đáp án chính xác là trợ từ『が』.`;
    } else if (answer.includes("ほしい")) {
      fastTip = "💡 Phân biệt: Muốn sở hữu ĐỒ VẬT ➔ Dùng「Danh từ + が + ほしいです」; Muốn làm HÀNH ĐỘNG ➔ Dùng「V(bỏ ます) + たいです」.";
      detailedReason = `Mẫu câu mong muốn sở hữu một đồ vật hoặc vật nuôi:『Danh từ + が + ほしいです』. Ở đây từ đứng trước là danh từ đồ vật nên dùng「ほしい」, không dùng「たい」(vì たい chỉ ghép sau động từ).`;
    } else if (answer.includes("たい")) {
      fastTip = "💡 Muốn làm hành động động từ: V(bỏ ます) + たいです (Ví dụ: 食べます ➔ 食べたいです, 行きます ➔ 行きたいです).";
      detailedReason = `Mẫu câu diễn tả mong muốn thực hiện một hành động của bản thân: Động từ bỏ ます ghép với đuôi『〜たいです』. Đáp án đúng là「${answer}」.`;
    }
  }

  // 8. Phân tích cho Chia tính từ đuôi い và đuôi な (Bài 4)
  else if (grammarPoint.includes("tính từ") || grammarPoint.includes("Tính từ") || answer.includes("かった") || answer.includes("くない") || answer.includes("でした") || answer.includes("じゃありません")) {
    if (answer.includes("かった")) {
      fastTip = "💡 Quy tắc chia tính từ đuôi い ở quá khứ: Bỏ い đổi thành「〜かったです」(Ví dụ: おいしい ➔ おいしかったです). Tuyệt đối KHÔNG dùng '〜いでした'!";
      detailedReason = `Câu diễn tả đặc điểm, trạng thái trong quá khứ với tính từ đuôi い.
- Quy tắc chia: Tính từ đuôi い khi chuyển sang quá khứ khẳng định thì BỎ đuôi い và thay bằng đuôi『〜かったです』.
- Bẫy thi thường gặp: Nhiều bạn nhầm sang tính từ đuôi な nên chọn 'おいしいでした' (đây là lỗi sai ngữ pháp nghiêm trọng trong tiếng Nhật). Đáp án đúng là「${answer}」.`;
    } else if (answer.includes("くない")) {
      fastTip = "💡 Quy tắc phủ định tính từ đuôi い: Bỏ い đổi thành「〜くないです」(Ví dụ: おいしい ➔ おいしくないです).";
      detailedReason = `Tính từ đuôi い khi phủ định sẽ bỏ い thêm『〜くないです』. Đáp án đúng là「${answer}」.`;
    } else {
      fastTip = "💡 Tính từ đuôi な: Khẳng định hiện tại です, Phủ định hiện tại じゃありません, Quá khứ khẳng định でした, Quá khứ phủ định じゃありませんでした.";
      detailedReason = `Tính từ đuôi な khi chia ở thì này tuân theo đúng quy tắc kết hợp ngữ pháp. Đáp án đúng là「${answer}」.`;
    }
  }

  // 9. Fallback thông minh: Tạo phân tích sư phạm mạch lạc cho các trường hợp khác
  else {
    fastTip = "💡 Đọc kỹ từ đứng ngay trước và ngay sau chỗ trống để xác định từ loại và cấu trúc kết hợp chuẩn xác.";
    detailedReason = `Đáp án chính xác là「${answer}」${ansMeaning ? ` (${ansMeaning})` : ""}.
- Xét theo cấu trúc ngữ pháp của ${lesson}: Cấu trúc『${grammarPoint}』yêu cầu điền dạng thức「${answer}」để câu văn hoàn chỉnh, chính xác về mặt ngữ nghĩa và chuẩn ngữ pháp tiếng Nhật sơ cấp.
- Các phương án còn lại bị sai dạng thức kết hợp trợ từ hoặc sai quy tắc chia thì/thể của câu.`;
  }

  return {
    meaning: fullMeaning,
    grammar: grammarPoint,
    lesson,
    tips: fastTip,
    reason: detailedReason,
  };
}

/**
 * Lời giải cho câu hỏi Từ vựng (Vocabulary) với phân tích nghĩa, từ loại và ngữ cảnh thực tế
 */
function buildVocabExplanation(q: ExamQuestion): QuestionExplanation {
  const lesson = determineLesson(q);
  const ansMeaning = getAnswerMeaning(q.answer, q);
  const fullMeaning = getFullSentenceTranslation(q);
  const answer = (q.answer || "").trim();

  let contextAnalysis = "";
  if (q.sentence.includes("スプーン") || q.sentence.includes("フォーク") || q.sentence.includes("カレー") || q.sentence.includes("食べます")) {
    contextAnalysis = "Ngữ cảnh câu nói về việc dùng dụng cụ để thưởng thức món ăn. Từ vựng được chọn phù hợp hoàn hảo với thói quen sinh hoạt và ngữ pháp tiếng Nhật.";
  } else if (q.sentence.includes("お祭り") || q.sentence.includes("パーティー") || q.sentence.includes("コンサート")) {
    contextAnalysis = "Ngữ cảnh câu nói về sự kiện văn hóa, giải trí đời sống trong giáo trình tiếng Nhật.";
  } else if (q.sentence.includes("約束") || q.sentence.includes("用事") || q.sentence.includes("時間")) {
    contextAnalysis = "Ngữ cảnh câu nói về thời gian biểu và các cuộc hẹn trong sinh hoạt hàng ngày.";
  } else {
    contextAnalysis = "Từ vựng này kết hợp tự nhiên với các thành phần trong câu, tạo thành câu giao tiếp chuẩn văn phong Nhật Bản.";
  }

  return {
    meaning: fullMeaning,
    grammar: "Từ vựng chuyên đề & Ngữ cảnh giao tiếp thực tế",
    lesson,
    tips: "Liên hệ ngữ cảnh sinh hoạt đời sống hàng ngày (đồ dùng ăn uống, đồ đạc trong phòng, thời gian, phương tiện, hoạt động) để chọn từ tự nhiên nhất.",
    reason: `Đáp án đúng là「${answer}」${ansMeaning ? ` (${ansMeaning})` : ""}.
- Ý nghĩa: Từ「${answer}」mang nghĩa là "${ansMeaning || "từ vựng chuẩn của bài"}", đóng vai trò then chốt trong việc hoàn thiện ý nghĩa câu văn.
- Phân tích ngữ cảnh: ${contextAnalysis}
- Các phương án còn lại là những từ vựng khác nghĩa hoặc không phù hợp với tình huống thực tế của câu văn.`,
  };
}

/**
 * Tự động phân loại câu hỏi thuộc Bài học nào (Bài 1 - 7) một cách chính xác
 */
function determineLesson(q: ExamQuestion): string {
  if (
    q.explanation?.lesson &&
    q.explanation.lesson.includes("Bài") &&
    !q.explanation.lesson.includes("đến") &&
    !q.explanation.lesson.includes("4 đến 7") &&
    !q.explanation.lesson.includes("4-7")
  ) {
    return q.explanation.lesson;
  }

  const fullText = `${q.sentence || ""} ${q.prompt || ""} ${q.answer || ""}`;

  // 1. Phân loại câu hỏi Kanji theo đúng 77 chữ Hán chuẩn giáo trình trên website (alphabet.ts)
  if (q.section === "Kanji") {
    if (/[肉料理野半大小]/.test(fullText)) {
      return "JPD123 - Bài 7 (Chữ Hán N5 FPT)";
    }
    if (/[今来帰会社聞読話書寺言具田力門]/.test(fullText)) {
      return "JPD123 - Bài 6 (Chữ Hán N5 FPT)";
    }
    if (/[先週毎午後見食飲買物行休]/.test(fullText)) {
      return "JPD123 - Bài 5 (Chữ Hán N5 FPT)";
    }
    if (/[東京名前国男女区市]/.test(fullText)) {
      return "JPD123 - Bài 4 (Chữ Hán N5 FPT)";
    }
    if (/[月火水木土曜何年時間分]/.test(fullText)) {
      return "JPD113 - Bài 3 (Chữ Hán N5 FPT)";
    }
    if (/[一二三四五六七八九十百千万円]/.test(fullText)) {
      return "JPD113 - Bài 2 (Chữ Hán N5 FPT)";
    }
    if (/[私人才学生校日本語]/.test(fullText)) {
      return "JPD113 - Bài 1 (Chữ Hán N5 FPT)";
    }
  }

  // 2. Bài 7: Thể て, yêu cầu ください, tiếp diễn ています, đề nghị ましょうか, cách làm かた, dụng cụ ăn uống
  if (
    q.sentence.includes("ください") ||
    q.sentence.includes("てください") ||
    q.sentence.includes("ています") ||
    q.sentence.includes("ましょうか") ||
    q.sentence.includes("かた") ||
    q.sentence.includes("方") ||
    q.sentence.includes("スプーン") ||
    q.sentence.includes("フォーク") ||
    q.sentence.includes("ナイフ") ||
    q.sentence.includes("お箸") ||
    q.sentence.includes("箸") ||
    q.sentence.includes("電子レンジ") ||
    q.prompt.includes("thể て") ||
    q.prompt.includes("Thể て") ||
    q.prompt.includes("cách làm") ||
    q.prompt.includes("dụng cụ") ||
    (q.answer && q.answer.length >= 2 && (q.answer.endsWith("て") || q.answer.endsWith("で")))
  ) {
    return "JPD123 - Bài 7 (Động từ thể て và Mẫu câu giao tiếp)";
  }

  // 3. Bài 6: So sánh (より, ほど, どちら, いちばん), Rủ rê & Từ chối khéo (はちょっと, 約束, 用事), Nơi sự kiện (Địa điểm で Sự kiện あります), Lượng từ (まい, 枚)
  if (
    fullText.includes("より") ||
    fullText.includes("ほど") ||
    fullText.includes("どちらが") ||
    fullText.includes("どちら") ||
    fullText.includes("いちばん") ||
    fullText.includes("一番") ||
    fullText.includes("はちょっと") ||
    fullText.includes("ちょっと…") ||
    fullText.includes("約束") ||
    fullText.includes("やくそく") ||
    fullText.includes("用事") ||
    fullText.includes("ようじ") ||
    fullText.includes("お祭り") ||
    fullText.includes("おまつり") ||
    fullText.includes("パーティー") ||
    fullText.includes("まい") ||
    fullText.includes("枚") ||
    fullText.includes("CD") ||
    fullText.includes("シャツ") ||
    fullText.includes("チケット") ||
    fullText.includes("ましょう") ||
    fullText.includes("So sánh") ||
    fullText.includes("so sánh") ||
    fullText.includes("rủ rê") ||
    fullText.includes("Rủ rê") ||
    fullText.includes("từ chối")
  ) {
    return "JPD123 - Bài 6 (So sánh, Rủ rê & Lượng từ)";
  }

  // 4. Bài 5: Quá khứ động từ (ました), mong muốn (たい / ほしい), nguyên nhân (から / どうして), mục đích di chuyển (〜に行きます)
  if (
    q.sentence.includes("ほしい") ||
    q.sentence.includes("たい") ||
    q.sentence.includes("から") ||
    q.sentence.includes("どうして") ||
    q.sentence.includes("ました") ||
    q.sentence.includes("先週") ||
    q.sentence.includes("おととい") ||
    q.sentence.includes("散歩") ||
    q.sentence.includes("手紙") ||
    q.sentence.includes("家族") ||
    q.sentence.includes("病院") ||
    q.sentence.includes("自転車")
  ) {
    return "JPD123 - Bài 5 (Quá khứ, Mong muốn và Mục đích)";
  }

  // 5. Bài 4: Tính từ đuôi い / な, thời tiết, vị trí, khoảng cách
  if (
    q.sentence.includes("おいしい") ||
    q.sentence.includes("さむい") ||
    q.sentence.includes("あつい") ||
    q.sentence.includes("とても") ||
    q.sentence.includes("あまり") ||
    q.sentence.includes("静か") ||
    q.sentence.includes("きれい") ||
    q.sentence.includes("新しい") ||
    q.sentence.includes("古い") ||
    q.sentence.includes("広い") ||
    q.sentence.includes("狭い") ||
    q.sentence.includes("しかし") ||
    q.sentence.includes("そして") ||
    q.sentence.includes("どのくらい") ||
    q.sentence.includes("東") ||
    q.sentence.includes("前") ||
    q.sentence.includes("国") ||
    q.sentence.includes("料理") ||
    q.sentence.includes("映画")
  ) {
    return "JPD123 - Bài 4 (Tính từ và Liên từ)";
  }

  // 6. Bài 1-3 của JPD113
  if (/[月火水木土曜何年時間分]/.test(fullText)) {
    return "JPD113 - Bài 3 (Thời gian, Di chuyển & Nơi làm việc)";
  }
  if (/[一二三四五六七八九十百千万円]/.test(fullText)) {
    return "JPD113 - Bài 2 (Chỉ định từ, Địa điểm & Mua sắm)";
  }
  if (/[私人才学生校日本語]/.test(fullText)) {
    return "JPD113 - Bài 1 (Câu danh từ & Chào hỏi cơ bản)";
  }

  return "JPD123 - Giáo trình Sơ cấp 2 (FPT University)";
}

/**
 * Tự động phân tích điểm ngữ pháp then chốt của câu hỏi
 */
function determineGrammarPoint(q: ExamQuestion): string {
  const fullText = `${q.sentence || ""} ${q.prompt || ""} ${q.answer || ""}`;

  // 1. Bài 7: Mẫu câu thể て
  if (fullText.includes("ください") || fullText.includes("てください")) {
    return "Mẫu câu yêu cầu, nhờ vả lịch sự: Vてください (Xin vui lòng hãy làm V...)";
  }
  if (fullText.includes("ています") || fullText.includes("ている")) {
    return "Mẫu câu hành động đang tiếp diễn: Vています (Đang làm V...)";
  }
  if (fullText.includes("ましょうか")) {
    return "Mẫu câu đề nghị giúp đỡ lịch sự: V[bỏ ます] + ましょうか (Tôi làm ... giúp bạn nhé?)";
  }
  if (fullText.includes("かた") || fullText.includes("方")) {
    return "Mẫu câu cách thức thực hiện hành động: V[bỏ ます] + 方 (かた) (Cách làm...)";
  }

  // 2. Bài 7: Trợ từ công cụ dụng cụ
  if (
    (fullText.includes("で") && (fullText.includes("スプーン") || fullText.includes("フォーク") || fullText.includes("ナイフ") || fullText.includes("お箸") || fullText.includes("箸"))) ||
    fullText.includes("dụng cụ") ||
    fullText.includes("công cụ")
  ) {
    return "Trợ từ chỉ công cụ, phương tiện: [Công cụ / Phương tiện] + で + Hành động";
  }

  // 3. Bài 6: So sánh
  if (fullText.includes("より")) {
    return "Cấu trúc so sánh hơn: A は B より [Tính từ] です (A thì hơn B)";
  }
  if (fullText.includes("ほど")) {
    return "Cấu trúc so sánh kém (không bằng): A は B ほど [Tính từ phủ định] (A không bằng B)";
  }
  if (fullText.includes("どちら")) {
    return "So sánh lựa chọn: A と B と どちらが [Tính từ] ですか (Giữa A và B cái nào hơn?)";
  }
  if (fullText.includes("いちばん") || fullText.includes("一番")) {
    return "So sánh cao nhất: [Phạm vi] の中で [Chủ ngữ] が一番 [Tính từ] です";
  }

  // 4. Bài 6: Lượng từ
  if (fullText.includes("まい") || fullText.includes("枚") || fullText.includes("vật mỏng")) {
    return "Lượng từ đếm vật mỏng, phẳng: [Danh từ] が/を 〜枚 (まい)";
  }

  // 5. Bài 6: Nơi diễn ra sự kiện
  if (
    (fullText.includes("で") && (fullText.includes("あります") || fullText.includes("ある"))) ||
    fullText.includes("sự kiện") ||
    fullText.includes("Sự kiện") ||
    fullText.includes("お祭り") ||
    fullText.includes("おまつり") ||
    fullText.includes("パーティー") ||
    fullText.includes("試合")
  ) {
    return "Nơi diễn ra sự kiện, hoạt động: Địa điểm + で + N(sự kiện) + があります";
  }

  // 6. Bài 6: Rủ rê & Từ chối khéo
  if (
    (fullText.includes("ちょっと") && !fullText.includes("ください") && !fullText.includes("待")) ||
    fullText.includes("はちょっと") ||
    fullText.includes("ちょっと…") ||
    fullText.includes("約束") ||
    fullText.includes("やくそく") ||
    fullText.includes("用事") ||
    fullText.includes("ようじ") ||
    fullText.includes("từ chối") ||
    fullText.includes("Từ chối")
  ) {
    return "Rủ rê, Đồng ý và Từ chối khéo: 〜はちょっと… / 〜がありますから";
  }
  if (fullText.includes("ましょう") || fullText.includes("ませんか") || fullText.includes("rủ rê") || fullText.includes("Rủ rê")) {
    return "Mẫu câu rủ rê và đề nghị cùng làm: 〜ませんか / 〜ましょう";
  }

  // 7. Bài 5: Mong muốn & Quá khứ
  if (fullText.includes("ほしい")) return "Mẫu câu mong muốn sở hữu: Danh từ + が + ほしいです";
  if (fullText.includes("たい")) return "Mẫu câu muốn thực hiện hành động: V[bỏ ます] + たいです";
  if (fullText.includes("ました") || fullText.includes("ませんでした")) return "Thì quá khứ của động từ: Vました / Vませんでした";
  if (fullText.includes("から") || fullText.includes("どうして")) return "Mẫu câu hỏi và giải thích nguyên nhân: どうして〜か / 〜から";

  // 8. Bài 4: Tính từ
  if (fullText.includes("かった") || fullText.includes("くない")) return "Chia tính từ đuôi い: Quá khứ かったです, Phủ định くないです";
  if (fullText.includes("でした") || fullText.includes("じゃありません")) return "Chia tính từ đuôi な: Quá khứ でした, Phủ định じゃありません";
  if (fullText.includes("あまり") || fullText.includes("ぜんぜん")) return "Phó từ mức độ đi với phủ định: あまり / ぜんぜん + [Phủ định]";

  return "Cấu trúc câu ngữ pháp tiếng Nhật sơ cấp chuẩn FPT";
}

/**
 * Phân tích lý do tại sao từng đáp án gây nhiễu (distractor) bị loại bỏ
 */
export function analyzeDistractors(question: ExamQuestion): WrongOptionAnalysis[] {
  if (!question.options || question.options.length <= 1) return [];

  const answer = (question.answer || "").trim();
  const distractors = question.options.filter((opt) => opt && opt.trim() !== answer);

  return distractors.map((opt) => {
    const trimmed = opt.trim();
    return {
      option: trimmed,
      reason: getSingleDistractorReason(trimmed, question),
    };
  });
}

/**
 * Phân tích chuyên sâu và chi tiết lý do sai của từng đáp án gây nhiễu, tuyệt đối không dùng câu rập khuôn
 */
function getSingleDistractorReason(option: string, question: ExamQuestion): string {
  const ans = (question.answer || "").trim();
  const ansMeaning = getAnswerMeaning(ans, question);
  const optMeaning =
    getAnswerMeaning(option, question) ||
    vocabulary.find((v) => v.word === option || v.reading === option)?.meaning;

  // =========================================================================
  // 1. PHÂN TÍCH CHO CÂU HỎI KANJI
  // =========================================================================
  if (question.section === "Kanji") {
    const isReadingPrompt =
      question.prompt.includes("cách đọc") ||
      question.prompt.includes("読み方") ||
      /[ぁ-ん]/.test(option);

    if (isReadingPrompt) {
      if (optMeaning) {
        return `Sai ý nghĩa:「${option}」là cách đọc của từ mang nghĩa "${optMeaning}", không phải cách đọc của chữ Hán trong câu này.`;
      }
      // Sai trường âm (độ dài chênh lệch có nguyên âm trường âm)
      if (Math.abs(option.length - ans.length) === 1 && /[ういおえ]/.test(option + ans)) {
        return `Sai quy tắc trường âm: Thừa hoặc thiếu âm kéo dài (trường âm) so với âm chuẩn「${ans}」. Khi đọc cần phát âm đúng độ dài phách.`;
      }
      // Sai âm đục/âm ngắt
      if (
        /[がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽっ]/.test(option) !==
        /[がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽっ]/.test(ans)
      ) {
        return `Sai biến âm: Sai về âm đục (dakuten) hoặc âm ngắt so với cách đọc chính xác「${ans}」.`;
      }
      return `Phát âm không đúng:「${option}」không phải là cách đọc On hay Kun hợp lệ của chữ Hán này trong tiếng Nhật chuẩn.`;
    }

    // Trường hợp chọn chữ Hán từ Hiragana
    const alphaOpt = alphabet.find((a) => a.char === option || (a as Record<string, unknown>).kanji === option);
    if (alphaOpt) {
      const hv = (alphaOpt as Record<string, unknown>).hanviet || "";
      return `Sai chữ Hán: Chữ「${option}」${hv ? `(Âm Hán: ${hv})` : ""} mang ý nghĩa khác, không khớp với nghĩa của từ trong câu.`;
    }
    if (optMeaning) {
      return `Sai chữ Hán: Chữ「${option}」mang nghĩa là "${optMeaning}", không tương ứng với từ vựng cần điền.`;
    }
    return `Chữ Hán「${option}」có cấu tạo bộ thủ và ý nghĩa khác hoàn toàn so với đáp án đúng「${ans}」.`;
  }

  // =========================================================================
  // 2. PHÂN TÍCH CHO CÂU HỎI NGỮ PHÁP
  // =========================================================================
  if (question.section === "Ngữ pháp") {
    // 2.1. Phân tích chia động từ thể て (Bài 7)
    if (ans.endsWith("て") || ans.endsWith("で") || question.sentence.includes("ください") || question.sentence.includes("ています")) {
      // Nhóm 1 đuôi ち (như 待って)
      if (ans.includes("待って") || ans === "まって") {
        if (option.includes("待ちて") || option === "まちて") {
          return "Sai quy tắc chia thể て: Động từ「待ちます」thuộc Nhóm 1 (âm ち trước ます), quy tắc phải đổi thành âm ngắt『〜って』thành「待って」. Chỉ động từ Nhóm 2 mới bỏ ます thêm て trực tiếp.";
        }
        if (option.includes("待いて") || option === "まいて") {
          return "Sai biến âm: Đuôi『〜いて』chỉ dùng cho động từ kết thúc bằng き (như 書きます ➔ 書いて), không dùng cho động từ đuôi ち.";
        }
        if (option.includes("待んで") || option === "まんで") {
          return "Sai biến âm: Đuôi『〜んで』chỉ dùng cho động từ đuôi み, び, に (như 飲みます ➔ 飲んで, 遊びます ➔ 遊んで), không dùng cho đuôi ち.";
        }
      }

      // Nhóm 1 đuôi い (như 買って)
      if (ans.includes("買って") || ans === "かって") {
        if (option.includes("買いして") || option === "かいして") {
          return "Sai quy tắc chia:「買います」có đuôi い ➔ biến thành âm ngắt『買って』, không thêm して.";
        }
        if (option.includes("買いて") || option === "かいて") {
          return "Sai biến âm: Đuôi『〜いて』chỉ dùng cho động từ đuôi き; động từ 買います đuôi い phải biến thành âm ngắt『買って』.";
        }
        if (option.includes("買んで") || option === "かんで") {
          return "Sai biến âm: Đuôi『〜んで』chỉ dùng cho động từ đuôi み, び, に; không dùng cho 買います.";
        }
      }

      // Nhóm 1 đuôi み (như 飲んで, 読んで)
      if (ans.includes("飲んで") || ans.includes("読んで") || ans === "のんで" || ans === "よんで") {
        if (option.includes("飲みて") || option.includes("読みて")) {
          return "Sai quy tắc chia: Động từ Nhóm 1 đuôi み phải biến đổi thành『〜んで』, không được giữ nguyên âm み rồi thêm て.";
        }
        if (option.includes("飲んて") || option.includes("読んて")) {
          return "Sai biến âm (thiếu âm đục): Động từ đuôi み, び, に khi chia thể て bắt buộc phải có âm đục là『〜んで』, không phải 〜んて.";
        }
      }

      // Nhóm 1 đuôi き (như 書いて)
      if (ans.includes("書いて") || ans === "かいて") {
        if (option.includes("書って") || option === "かって") {
          return "Sai quy tắc chia: Động từ Nhóm 1 đuôi き (書きます) phải đổi thành『〜いて』(書いて), không đổi thành âm ngắt って.";
        }
      }

      // Nhóm 1 ngoại lệ (行きます ➔ 行って)
      if (ans.includes("行って") || ans === "いって") {
        if (option.includes("行いて") || option === "いいて") {
          return "Sai ngoại lệ:「行きます」mặc dù có đuôi き nhưng là trường hợp ngoại lệ duy nhất đổi thành âm ngắt『行って (いって)』, tuyệt đối không chia thành 行いて.";
        }
      }

      // Nhóm 2 (như 食べて, 開けて, 教えて)
      if (ans.includes("食べて") || ans.includes("開けて") || ans.includes("教えて")) {
        if (option.includes("って")) {
          return "Sai quy tắc chia: Đây là động từ Nhóm 2 (trước ます là nguyên âm e/i đặc biệt), chỉ cần bỏ ます thêm て, không biến đổi thành âm ngắt『って』(lỗi hay gặp do nhầm sang Nhóm 1).";
        }
        if (option.includes("いで")) {
          return "Sai biến âm: Đuôi『〜いで』chỉ dùng cho động từ Nhóm 1 có đuôi ぎ (như 泳ぎます ➔ 泳いで), không áp dụng cho động từ Nhóm 2.";
        }
      }

      // Nhóm 3 (như 来て, 持って来て, 勉強して)
      if (ans.includes("来て") || ans === "きて") {
        if (option === "きって" || option.includes("切って")) {
          return "Sai từ vựng:「きって」là thể て của động từ 切ります (cắt) hoặc danh từ 切手 (con tem); thể て của 来ます (đến) phải là『来て (きて)』.";
        }
      }
    }

    // 2.2. Phân tích trợ từ trong ngữ cảnh cụ thể
    // Ngữ cảnh dụng cụ / phương tiện ăn uống (スプーン, フォーク, ナイフ, 箸)
    if (question.sentence.includes("スプーン") || question.sentence.includes("フォーク") || question.sentence.includes("ナイフ") || question.sentence.includes("箸") || question.sentence.includes("お箸")) {
      if (option === "に") {
        return "Sai chức năng trợ từ:「に」dùng chỉ thời điểm xác định (7時に) hoặc đích đến (学校に行きます); không dùng sau dụng cụ ăn uống.";
      }
      if (option === "を") {
        return "Sai chức năng trợ từ:「を」dùng để đánh dấu tân ngữ trực tiếp (đồ ăn bị ăn, ví dụ: カレーを食べます); không dùng cho công cụ ăn uống.";
      }
      if (option === "へ") {
        return "Sai chức năng trợ từ:「へ」chỉ phương hướng di chuyển; không dùng sau dụng cụ hay đồ vật.";
      }
      if (option === "が") {
        return "Sai chức năng trợ từ:「が」chỉ chủ ngữ thực hiện hành động hoặc đối tượng mong muốn; không dùng sau công cụ.";
      }
    }

    // Ngữ cảnh nơi diễn ra sự kiện / lễ hội (お祭り, パーティー, コンサート, 試合)
    if (question.sentence.includes("お祭り") || question.sentence.includes("おまつり") || question.sentence.includes("パーティー") || question.sentence.includes("コンサート")) {
      if (option === "に") {
        return "Bẫy đề thi FPT: Đối với sự kiện, lễ hội, bữa tiệc (お祭り, パーティー), nơi tổ chức sự kiện BẮT BUỘC dùng trợ từ「で」, không dùng trợ từ「に」.";
      }
      if (option === "を") {
        return "Sai trợ từ: Động từ tồn tại「あります」là tự động từ, không nhận tân ngữ trực tiếp với「を」.";
      }
      if (option === "へ") {
        return "Sai trợ từ:「へ」chỉ phương hướng di chuyển tới đâu; ở đây là diễn ra sự kiện tại địa điểm.";
      }
    }

    // Ngữ cảnh tính từ mong muốn ほしい
    if (question.sentence.includes("ほしい")) {
      if (option === "を") {
        return "Bẫy đề thi kinh điển: Trong tiếng Nhật,「ほしい」là TÍNH TỪ đuôi い (không phải động từ). Đối tượng mong muốn bắt buộc đi với trợ từ「が」(パソコンがほしいです), tuyệt đối không dùng trợ từ「を」.";
      }
      if (option === "に") {
        return "Sai trợ từ:「に」chỉ thời gian hoặc vị trí, không đi trước tính từ mong muốn「ほしい」.";
      }
      if (option === "で") {
        return "Sai trợ từ:「で」chỉ nơi diễn ra hành động hoặc công cụ, không đi trước tính từ「ほしい」.";
      }
    }

    // Ngữ cảnh so sánh (より vs ほど vs どちら vs いちばん)
    if (ans === "より") {
      if (option === "ほど") {
        return "Sai cấu trúc so sánh:「ほど」chỉ dùng trong so sánh không bằng (A không bằng B) và vị ngữ bắt buộc phải ở dạng PHỦ ĐỊNH. Ở đây vị ngữ là khẳng định nên phải dùng「より」.";
      }
      if (option.includes("どちら")) {
        return "Sai từ loại:「どちら」là từ để hỏi (bên nào/cái nào) dùng trong câu hỏi lựa chọn giữa 2 đối tượng, không dùng làm liên từ so sánh trong câu khẳng định.";
      }
      if (option === "いちばん" || option === "一番") {
        return "Sai cấu trúc:「いちばん」dùng trong so sánh nhất và cần có cụm phạm vi (〜の中で), không dùng sau danh từ so sánh 2 đối tượng.";
      }
    }
    if (ans === "ほど") {
      if (option === "より") {
        return "Sai cấu trúc:「より」dùng trong so sánh hơn với vị ngữ khẳng định (A hơn B). Khi vị ngữ là phủ định (không bằng) thì bắt buộc phải dùng「ほど」.";
      }
      if (option.includes("どちら") || option === "いちばん") {
        return "Sai mẫu câu: Không dùng trong câu so sánh không bằng với vị ngữ phủ định.";
      }
    }

    // Phân tích trợ từ đơn tổng quát
    if (option === "で") {
      return "Sai chức năng:「で」dùng chỉ nơi chốn hành động, phương tiện hoặc nơi tổ chức sự kiện; không phù hợp với chức năng ngữ pháp yêu cầu ở câu này.";
    }
    if (option === "に") {
      return "Sai chức năng:「に」chỉ thời điểm xác định, đích đến chuyển động hoặc vị trí tồn tại; không phù hợp với ngữ cảnh câu.";
    }
    if (option === "を") {
      return "Sai chức năng:「を」dùng đánh dấu tân ngữ trực tiếp của ngoại động từ; không đi với tính từ hoặc tự động từ này.";
    }
    if (option === "へ") {
      return "Sai chức năng:「へ」chỉ phương hướng di chuyển; không dùng chỉ thời gian, công cụ hay đối tượng.";
    }
    if (option === "が") {
      return "Sai chức năng:「が」chỉ chủ ngữ ngữ pháp hoặc đối tượng của tính từ/sở thích; câu này đòi hỏi trợ từ khác theo mẫu câu.";
    }

    // Phân tích dạng chia tính từ / động từ sai
    if (option.includes("いでした")) {
      return "Sai quy tắc chia tính từ: Tính từ đuôi い ở quá khứ phải đổi thành「〜かったです」(ví dụ: おいしかったです), tuyệt đối không bao giờ dùng '〜いでした' (lỗi hay gặp do nhầm sang tính từ đuôi な).";
    }
    if (option.includes("くないでした")) {
      return "Sai quy tắc chia: Phủ định quá khứ của tính từ đuôi い phải là「〜くなかったです」.";
    }
    if (option.includes("ますたい")) {
      return "Sai quy tắc kết hợp: Muốn diễn tả mong muốn phải bỏ ます rồi mới thêm たい (V[bỏ ます] + たいです), không ghép nguyên cả 'ますたい'.";
    }
    if (option.includes("るたい")) {
      return "Sai quy tắc kết hợp: Thể từ điển không ghép trực tiếp với たい.";
    }
    if (option.includes("たい") && ans.includes("ほしい")) {
      return "Sai mẫu câu: Vたい dùng cho mong muốn 'hành động động từ', còn Nがほしい dùng cho mong muốn 'sở hữu danh từ đồ vật'.";
    }
    if (option.includes("ほしい") && ans.includes("たい")) {
      return "Sai mẫu câu: Nがほしい dùng cho danh từ đồ vật, còn ở đây có động từ nên phải dùng Vたい.";
    }

    // Phân tích lượng từ sai
    if (option.includes("台") || option.includes("だい")) {
      return "Sai lượng từ:「台 (だい)」dùng đếm máy móc, xe cộ, thiết bị điện tử (ô tô, máy tính); không dùng đếm cho loại đồ vật này.";
    }
    if (option.includes("本") || option.includes("ほん") || option.includes("ぼん") || option.includes("ぽん")) {
      return "Sai lượng từ:「本」dùng đếm vật dài hình trụ (bút chì, chai nước, ô dù); không dùng cho loại đồ vật này.";
    }
    if (option.includes("冊") || option.includes("さつ")) {
      return "Sai lượng từ:「冊」dùng đếm sách vở, từ điển, tạp chí có gáy đóng; không dùng cho loại đồ vật này.";
    }
    if (option.includes("杯") || option.includes("はい") || option.includes("ばい")) {
      return "Sai lượng từ:「杯」dùng đếm cốc, chén, ly đồ uống (cà phê, trà, bia).";
    }

    if (optMeaning) {
      return `Sai mẫu câu: Cấu trúc「${option}」có nghĩa là "${optMeaning}", không phù hợp với quy tắc ngữ pháp của câu này.`;
    }
    return `Dạng thức ngữ pháp của「${option}」không đúng quy tắc kết hợp trong tiếng Nhật sơ cấp.`;
  }

  // =========================================================================
  // 3. PHÂN TÍCH CHO CÂU HỎI TỪ VỰNG
  // =========================================================================
  // Phân tích từ vựng đồ dùng ăn uống Bài 7
  if (ans === "スプーン" || ans === "フォーク" || ans === "ナイフ" || ans === "お箸") {
    if (option === "フォーク") {
      return "Sai dụng cụ:「フォーク」nghĩa là nĩa/dĩa, dùng để ăn mì, salad hoặc xiên thức ăn; không dùng để xúc món ăn dạng lỏng hoặc cơm cà ri.";
    }
    if (option === "ナイフ") {
      return "Sai dụng cụ:「ナイフ」nghĩa là dao, dùng để cắt thái thịt hoặc gọt hoa quả; không dùng làm công cụ xúc thức ăn.";
    }
    if (option === "お箸" || option === "箸") {
      return "Sai dụng cụ:「お箸 (đũa)」dùng để gắp đồ ăn châu Á/Nhật Bản; đối với món cà ri hoặc súp phương Tây theo bài học chuẩn phải dùng thìa (スプーン).";
    }
    if (option === "スプーン") {
      return "Sai dụng cụ:「スプーン」nghĩa là thìa/muỗng, dùng để múc đồ ăn dạng lỏng hoặc cơm cà ri.";
    }
  }

  // Phân tích mùa Bài 6
  if (ans === "春" || ans === "夏" || ans === "秋" || ans === "冬") {
    if (option === "冬") return "Sai mùa:「冬 (ふゆ)」là mùa đông (lạnh giá, có tuyết rơi), không khớp với ngữ cảnh mùa trong câu.";
    if (option === "夏") return "Sai mùa:「夏 (なつ)」là mùa hè (nóng bức, đi biển, lễ hội pháo hoa).";
    if (option === "春") return "Sai mùa:「春 (はる)」là mùa xuân (ấm áp, ngắm hoa anh đào nở).";
    if (option === "秋") return "Sai mùa:「秋 (あき)」là mùa thu (mát mẻ, ngắm lá đỏ momiji).";
  }

  if (optMeaning) {
    return `Sai ý nghĩa: Từ「${option}」có nghĩa là "${optMeaning}", không hợp lý với ngữ cảnh và tình huống thực tế của câu văn.`;
  }
  return `Từ vựng「${option}」không phù hợp với ý nghĩa và ngữ cảnh logic của câu.`;
}
