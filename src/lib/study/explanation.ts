import type { ExamQuestion, ExamSection } from "./exam.ts";

export type QuestionExplanation = {
  meaning: string;    // Dịch nghĩa câu & từ hoàn chỉnh
  grammar?: string;   // Cấu trúc ngữ pháp áp dụng
  lesson?: string;    // Thuộc bài nào (Ví dụ: JPD123 - Bài 5)
  tips?: string;      // Mẹo giải nhanh / Dấu hiệu nhận biết
  reason: string;     // Lý do chọn đáp án đúng & phân tích đáp án gây nhiễu
};

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
  // 1. Nếu câu hỏi đã có sẵn explanation chuẩn (từ AI hoặc nguồn sinh đề), ưu tiên dùng
  if (
    question.explanation &&
    question.explanation.meaning &&
    question.explanation.reason &&
    question.explanation.meaning.length > 5 &&
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
  const directKey = `${question.sentence}___${question.answer}`;
  if (EXACT_EXPLANATIONS[directKey]) {
    return EXACT_EXPLANATIONS[directKey];
  }

  // 3. Tra cứu theo câu văn hoàn chỉnh
  for (const [key, explanation] of Object.entries(EXACT_EXPLANATIONS)) {
    const [sentencePart, answerPart] = key.split("___");
    if (sentencePart === question.sentence && answerPart === question.answer) {
      return explanation;
    }
  }

  // Tra cứu theo câu văn (trường hợp answer có khoảng trắng hoặc biến thể nhỏ)
  for (const [key, explanation] of Object.entries(EXACT_EXPLANATIONS)) {
    const [sentencePart] = key.split("___");
    if (sentencePart === question.sentence) {
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
 * Lời giải cho câu hỏi Chữ Hán (Kanji)
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
  const isHanViet =
    q.prompt.includes("Hán Việt") ||
    q.prompt.includes("ý nghĩa");

  const lesson = determineLesson(q);

  if (isReading) {
    return {
      meaning: `Cách đọc Hiragana đúng trong câu: ${getCompletedSentence(q)}`,
      grammar: "Chữ Hán sơ cấp N5 - Cách đọc Hiragana theo âm On/Kun",
      lesson,
      tips: `Chú ý nhận diện trường âm (âm dài おう, えい), âm đục (tenten) và âm ngắt (xúc âm) của chữ.`,
      reason: `Đáp án đúng là "${q.answer}". Chữ Hán trong ngoặc có cách đọc chuẩn xác trong ngữ cảnh này là "${q.answer}". Các phương án còn lại là bẫy sai trường âm hoặc cố ý đổi phụ âm gây nhầm lẫn.`,
    };
  }

  if (isWriting) {
    return {
      meaning: `Chữ Hán chuẩn xác tương ứng: ${getCompletedSentence(q)}`,
      grammar: "Chữ Hán sơ cấp N5 - Nhận diện mặt chữ Hán tương ứng với Hiragana",
      lesson,
      tips: "Quan sát kỹ các bộ thủ đặc trưng (bộ Mộc 木, Thủy 水, Kim 金, Môn 門, Nhật 日) để tránh chọn nhầm chữ gần giống.",
      reason: `Đáp án đúng là "${q.answer}". Đây là chữ Hán tương ứng chính xác với âm Hiragana được cho. Các lựa chọn khác là những chữ Hán có nét tương tự hoặc mang ý nghĩa khác hoàn toàn.`,
    };
  }

  return {
    meaning: `Âm Hán Việt / Ý nghĩa chữ Hán: ${getCompletedSentence(q)}`,
    grammar: "Âm Hán Việt và cấu tạo chữ Hán N5",
    lesson,
    tips: "Âm Hán Việt là cầu nối tuyệt vời giúp sinh viên Việt Nam nhớ nhanh nghĩa của chữ Hán.",
    reason: `Đáp án đúng là "${q.answer}". Đây là âm Hán Việt chuẩn xác của chữ Hán được cho, giúp người học dễ dàng liên tưởng đến nghĩa của từ trong tiếng Việt.`,
  };
}

/**
 * Lời giải cho câu hỏi Ngữ pháp (Grammar)
 */
function buildGrammarExplanation(q: ExamQuestion): QuestionExplanation {
  const lesson = determineLesson(q);
  const grammarPoint = determineGrammarPoint(q);

  let tips = "Đọc kỹ các từ xung quanh chỗ trống: nếu là động từ thì chú ý trợ từ đi kèm; nếu là tính từ chú ý thời quá khứ hay hiện tại.";
  if (q.sentence.includes("ほしい")) {
    tips = "Ghi nhớ: Danh từ + が + ほしいです (Muốn sở hữu danh từ luôn đi với trợ từ が).";
  } else if (q.sentence.includes("より") || q.sentence.includes("ほど")) {
    tips = "So sánh hơn: A は B より (A hơn B). So sánh kém: A は B ほど [Phủ định] (A không bằng B).";
  } else if (q.sentence.includes("ください")) {
    tips = "Động từ đi trước ください luôn chia ở THỂ て (Vてください).";
  } else if (q.sentence.includes("あまり") || q.sentence.includes("ぜんぜん")) {
    tips = "Phó từ あまり / ぜんぜん bắt buộc phải đi với thể phủ định (〜くない / 〜じゃありません).";
  }

  return {
    meaning: `Câu đúng: ${getCompletedSentence(q)}`,
    grammar: grammarPoint,
    lesson,
    tips,
    reason: `Đáp án đúng là "${q.answer}". Theo quy tắc ngữ pháp của ${lesson}, cấu trúc "${grammarPoint}" yêu cầu dạng thức "${q.answer}" để tạo thành câu hoàn chỉnh, đúng ngữ pháp. Các phương án còn lại bị sai dạng chia hoặc sai quy tắc kết hợp trợ từ.`,
  };
}

/**
 * Lời giải cho câu hỏi Từ vựng (Vocabulary)
 */
function buildVocabExplanation(q: ExamQuestion): QuestionExplanation {
  const lesson = determineLesson(q);

  return {
    meaning: `Câu hoàn chỉnh: ${getCompletedSentence(q)} (Từ cần điền:「${q.answer}」)`,
    grammar: "Từ vựng chuyên đề & Ngữ cảnh giao tiếp thực tế",
    lesson,
    tips: "Liên hệ ngữ cảnh sinh hoạt hàng ngày (đồ dùng ăn uống, đồ đạc trong nhà, thời tiết, giao tiếp hỏi đáp) để loại trừ phương án sai.",
    reason: `Đáp án đúng là "${q.answer}". Từ vựng này phù hợp nhất với ngữ cảnh và ngữ nghĩa của câu văn. Các phương án còn lại không hợp lý về mặt logic hoặc ngữ cảnh tình huống.`,
  };
}

function determineLesson(q: ExamQuestion): string {
  // If lesson is already provided on question and is a specific single lesson (not a generic range like "Bài 4 đến 7")
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

  // 1. Phân loại câu hỏi Kanji theo bộ chữ Hán đặc trưng của từng bài JPD123 FPT
  if (q.section === "Kanji") {
    if (/[意味書言話読見聞食飲待立座使]/.test(fullText)) {
      return "JPD123 - Bài 7 (Chữ Hán N5 FPT)";
    }
    if (/[雨町春夏秋冬雪風海山川天気旅空港魚肉菜]/.test(fullText)) {
      return "JPD123 - Bài 6 (Chữ Hán N5 FPT)";
    }
    if (/[家本水友会私休時間散歩写真手紙音楽族病院車転自]/.test(fullText)) {
      return "JPD123 - Bài 5 (Chữ Hán N5 FPT)";
    }
    if (/[東京名前国男女区市料理映画暑新広狭近遠古買難]/.test(fullText)) {
      return "JPD123 - Bài 4 (Chữ Hán N5 FPT)";
    }
  }

  // 2. Phân loại theo cấu trúc ngữ pháp và từ vựng đặc trưng
  // Bài 7: Thể て, cách làm かた, dụng cụ ăn uống
  if (
    q.sentence.includes("てください") ||
    q.sentence.includes("ています") ||
    q.sentence.includes("かた") ||
    q.sentence.includes("スプーン") ||
    q.sentence.includes("フォーク") ||
    q.sentence.includes("ナイフ") ||
    q.sentence.includes("電子レンジ") ||
    q.prompt.includes("thể て") ||
    q.prompt.includes("Thể て")
  ) {
    return "JPD123 - Bài 7 (Động từ thể て và Mẫu câu giao tiếp)";
  }

  // Bài 6: So sánh hơn (より), so sánh kém (ほど), so sánh lựa chọn (どちらが), so sánh nhất (いちばん)
  if (
    q.sentence.includes("より") ||
    q.sentence.includes("ほど") ||
    q.sentence.includes("どちらが") ||
    q.sentence.includes("いちばん") ||
    q.prompt.includes("So sánh") ||
    q.prompt.includes("so sánh")
  ) {
    return "JPD123 - Bài 6 (So sánh và Lượng từ)";
  }

  // Bài 5: Quá khứ động từ (ました), mong muốn (たい / ほしい), nguyên nhân (から / どうして)
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

  // Bài 4: Tính từ đuôi い / な, thời tiết, vị trí, phương hướng, hỏi khoảng cách (どのくらい)
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
    q.sentence.includes("映画") ||
    q.sentence.includes("どちら")
  ) {
    return "JPD123 - Bài 4 (Tính từ và Liên từ)";
  }

  // 3. Fallback theo chữ Hán nếu câu hỏi không đánh dấu section
  if (/[意味書言話読見聞食飲待立座使]/.test(fullText)) {
    return "JPD123 - Bài 7 (Chữ Hán & Từ vựng N5)";
  }
  if (/[雨町春夏秋冬雪風海山川天気旅空港魚肉菜]/.test(fullText)) {
    return "JPD123 - Bài 6 (Chữ Hán & Từ vựng N5)";
  }
  if (/[家本水友会私休時間散歩写真手紙音楽族病院車転自]/.test(fullText)) {
    return "JPD123 - Bài 5 (Chữ Hán & Từ vựng N5)";
  }
  if (/[東京名前国男女区市料理映画暑新広狭近遠古買難]/.test(fullText)) {
    return "JPD123 - Bài 4 (Chữ Hán & Từ vựng N5)";
  }

  return "JPD123 - Giáo trình Sơ cấp 2 (FPT University)";
}

function determineGrammarPoint(q: ExamQuestion): string {
  if (q.sentence.includes("ほしい")) return "Mẫu câu mong muốn sở hữu: Danh từ + が + ほしいです";
  if (q.sentence.includes("たい")) return "Mẫu câu muốn thực hiện hành động: V[bỏ ます] + たいです";
  if (q.sentence.includes("より")) return "Cấu trúc so sánh hơn: A は B より Tính từ です";
  if (q.sentence.includes("ほど")) return "Cấu trúc so sánh kém (không bằng): A は B ほど Tính từ [phủ định]";
  if (q.sentence.includes("どちら")) return "So sánh lựa chọn: A と B と どちらが Tính từ ですか";
  if (q.sentence.includes("いちばん")) return "So sánh nhất: [Phạm vi] の中で [Chủ ngữ] が いちばん [Tính từ] です";
  if (q.sentence.includes("ください")) return "Mẫu câu yêu cầu, nhờ vả lịch sự: Vてください";
  if (q.sentence.includes("かた")) return "Mẫu câu cách thức làm: V[bỏ ます] + 方 (かた)";
  if (q.sentence.includes("すき")) return "Mẫu câu nói về sở thích: Danh từ + が + すきです";
  if (q.sentence.includes("ました")) return "Thì quá khứ của động từ: Vました / Vませんでした";
  if (q.sentence.includes("かった") || q.sentence.includes("くない")) return "Chia tính từ đuôi い: Quá khứ かったです, Phủ định くないです";
  if (q.sentence.includes("でした") || q.sentence.includes("じゃありません")) return "Chia tính từ đuôi な: Quá khứ でした, Phủ định じゃありません";
  return "Cấu trúc câu ngữ pháp tiếng Nhật sơ cấp";
}
