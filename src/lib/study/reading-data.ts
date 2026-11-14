import type { ReadingCourse, ReadingPassage, ReadingPassageSet } from "./reading-types.ts";
import { getAllowedKanjiChars, replaceUntaughtKanjiWithKana } from "./kana-reading.ts";

export const TARGET_KANJI_JPD123 = [
  "東", "京", "名", "前", "国", "男", "女", "区", "市",
  "先", "週", "毎", "午", "後", "見", "食", "飲", "買", "物", "行", "休",
  "今", "来", "帰", "会", "社", "聞", "読", "書", "話", "寺", "言", "具", "田", "力", "門",
  "肉", "料", "理", "野", "半", "大", "小"
];

export const TARGET_KANJI_JPD113 = [
  "私", "人", "才", "学", "生", "校", "日", "本", "語",
  "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "百", "千", "万", "円",
  "月", "火", "水", "木", "土", "曜", "何", "年", "時", "間", "分"
];

export function computePassageSetKanjiCoverage(
  passages: ReadingPassage[],
  course: ReadingCourse,
): {
  coveredKanji: string[];
  targetKanjiCount: number;
  coveragePercentage: number;
  isCompleteCoverage: boolean;
  missingKanji: string[];
} {
  const targetChars = course === "JPD123" ? TARGET_KANJI_JPD123 : TARGET_KANJI_JPD113;
  const targetSet = new Set(targetChars);
  const foundSet = new Set<string>();

  for (const p of passages) {
    const chars = p.content.match(/[一-龯]/g) || [];
    for (const c of chars) {
      if (targetSet.has(c)) {
        foundSet.add(c);
      }
    }
  }

  const coveredKanji = targetChars.filter((c) => foundSet.has(c));
  const missingKanji = targetChars.filter((c) => !foundSet.has(c));
  const targetKanjiCount = targetChars.length;
  const coveragePercentage = Math.round((coveredKanji.length / targetKanjiCount) * 100);

  return {
    coveredKanji,
    targetKanjiCount,
    coveragePercentage,
    isCompleteCoverage: coveredKanji.length === targetKanjiCount,
    missingKanji,
  };
}

function sanitizePassage(p: ReadingPassage, allowedBai: number[]): ReadingPassage {
  const allowed = getAllowedKanjiChars(allowedBai);
  return {
    ...p,
    content: replaceUntaughtKanjiWithKana(p.content, allowed),
    sentences: p.sentences.map((s) => ({
      ...s,
      jp: replaceUntaughtKanjiWithKana(s.jp, allowed),
    })),
    questions: p.questions.map((q) => ({
      ...q,
      prompt: replaceUntaughtKanjiWithKana(q.prompt, allowed),
      options: q.options.map((opt) => replaceUntaughtKanjiWithKana(opt, allowed)),
      answer: replaceUntaughtKanjiWithKana(q.answer, allowed),
    })),
  };
}

const RAW_PASSAGES_JPD113: ReadingPassage[] = [
  {
    id: "jpd113-read-1",
    course: "JPD113",
    title: "わたしと大学",
    titleVi: "Tôi và trường đại học",
    theme: "Giới thiệu bản thân và trường học",
    content: "はじめまして。わたしはナムです。ベトナム人です。十九才です。FPT大学の学生です。毎日、日本語を勉強します。大学は午前八時から午後四時までです。日本語の勉強はとてもおもしろいです。どうぞよろしくお願いします。",
    sentences: [
      { jp: "はじめまして。", vi: "Rất vui được làm quen với bạn.", romaji: "Hajimemashite." },
      { jp: "わたしはナムです。", vi: "Tôi là Nam.", romaji: "Watashi wa Namu desu." },
      { jp: "ベトナム人です。", vi: "Tôi là người Việt Nam.", romaji: "Betonamujin desu." },
      { jp: "十九才です。", vi: "Tôi 19 tuổi.", romaji: "Juuku-sai desu." },
      { jp: "FPT大学の学生です。", vi: "Tôi là sinh viên trường Đại học FPT.", romaji: "Efu-pii-tii daigaku no gakusei desu." },
      { jp: "毎日、日本語を勉強します。", vi: "Hàng ngày tôi học tiếng Nhật.", romaji: "Mainichi, nihongo o benkyou shimasu." },
      { jp: "大学は午前八時から午後四時までです。", vi: "Trường đại học mở cửa/học từ 8 giờ sáng đến 4 giờ chiều.", romaji: "Daigaku wa gozen hachi-ji kara gogo yo-ji made desu." },
      { jp: "日本語の勉強はとてもおもしろいです。", vi: "Việc học tiếng Nhật rất thú vị.", romaji: "Nihongo no benkyou wa totemo omoshiroi desu." },
      { jp: "どうぞよろしくお願いします。", vi: "Rất mong nhận được sự giúp đỡ.", romaji: "Douzo yoroshiku onegai shimasu." }
    ],
    translation: "Rất vui được làm quen với bạn. Tôi là Nam, người Việt Nam, năm nay 19 tuổi. Tôi là sinh viên trường Đại học FPT. Hàng ngày tôi đều học tiếng Nhật. Trường học từ 8 giờ sáng đến 4 giờ chiều. Việc học tiếng Nhật rất thú vị. Rất mong nhận được sự giúp đỡ từ bạn.",
    romaji: "Hajimemashite. Watashi wa Namu desu. Betonamujin desu. Juuku-sai desu. Efu-pii-tii daigaku no gakusei desu. Mainichi, nihongo o benkyou shimasu. Daigaku wa gozen hachi-ji kara gogo yo-ji made desu. Nihongo no benkyou wa totemo omoshiroi desu. Douzo yoroshiku onegai shimasu.",
    vocabularyUsed: ["わたし", "学生", "大学", "勉強", "毎日", "午前", "午後", "時", "面白い", "日本語"],
    kanjiUsed: ["私", "人", "才", "学", "生", "校", "日", "本", "語", "十", "九", "時", "分"],
    questions: [
      {
        id: "jpd113-q1-1",
        prompt: "ナムさんは何才ですか。",
        options: ["十九才です", "十八才です", "二十才です", "二十一才です"],
        answer: "十九才です",
        explanation: {
          meaning: "Nam bao nhiêu tuổi? Đáp án là 19 tuổi.",
          reason: "Trong bài đọc có câu trực tiếp:「十九才です。」(Tôi 19 tuổi).",
          wrongOptions: [
            { option: "十八才です", reason: "18 tuổi - sai thông tin trong bài đọc." },
            { option: "二十才です", reason: "20 tuổi - không đúng với bài đọc." },
            { option: "二十一才です", reason: "21 tuổi - sai thông tin." }
          ]
        }
      },
      {
        id: "jpd113-q1-2",
        prompt: "ナムさんの大学は何時から何時までですか。",
        options: ["午前八時から午後四時までです", "午前九時から午後五時までです", "午前八時から午後五時までです", "午前七時から午後四時までです"],
        answer: "午前八時から午後四時までです",
        explanation: {
          meaning: "Trường đại học của Nam từ mấy giờ đến mấy giờ? Đáp án: Từ 8 giờ sáng đến 4 giờ chiều.",
          reason: "Trong bài đọc nêu rõ:「大学は午前八時から午後四時までです。」",
          wrongOptions: [
            { option: "午前九時から午後五時までです", reason: "9h đến 17h là sai giờ." },
            { option: "午前八時から午後五時までです", reason: "8h đến 17h là sai giờ kết thúc." },
            { option: "午前七時から午後四時までです", reason: "7h là sai giờ bắt đầu." }
          ]
        }
      },
      {
        id: "jpd113-q1-3",
        prompt: "ナムさんはどこの学生ですか。",
        options: ["FPT大学の学生です", "ハノイ大学の学生です", "東京大学の学生です", "高校生です"],
        answer: "FPT大学の学生です",
        explanation: {
          meaning: "Nam là sinh viên trường nào? Đáp án: Sinh viên trường Đại học FPT.",
          reason: "Câu văn trong bài:「FPT大学の学生です。」xác nhận Nam là sinh viên FPT.",
          wrongOptions: [
            { option: "ハノイ大学の学生です", reason: "Bài đọc không nhắc đến Đại học Hà Nội." },
            { option: "東京大学の学生です", reason: "Bài đọc không nhắc đến Đại học Tokyo." },
            { option: "高校生です", reason: "Nam là sinh viên đại học (大学生), không phải học sinh cấp 3." }
          ]
        }
      }
    ]
  },
  {
    id: "jpd113-read-2",
    course: "JPD113",
    title: "わたしのへやとつくえ",
    titleVi: "Phòng và bàn học của tôi",
    theme: "Miêu tả đồ vật và vị trí",
    content: "ここはわたしのへやです。へやはひろくないですが、しずかです。つくえのうえに本とじしょがあります。じしょは日本のじしょです。つくえのとなりに時計があります。時計は二千五百円です。毎日、このつくえで勉強します。",
    sentences: [
      { jp: "ここはわたしのへやです。", vi: "Đây là phòng của tôi.", romaji: "Koko wa watashi no heya desu." },
      { jp: "へやはひろくないですが、しずかです。", vi: "Phòng không rộng nhưng yên tĩnh.", romaji: "Heya wa hirokunai desu ga, shizuka desu." },
      { jp: "つくえのうえに本とじしょがあります。", vi: "Trên bàn có sách và từ điển.", romaji: "Tsukue no ue ni hon to jisho ga arimasu." },
      { jp: "じしょは日本のじしょです。", vi: "Từ điển là từ điển của Nhật Bản.", romaji: "Jisho wa nihon no jisho desu." },
      { jp: "つくえのとなりに時計があります。", vi: "Bên cạnh bàn có một chiếc đồng hồ.", romaji: "Tsukue no tonari ni tokei ga arimasu." },
      { jp: "時計は二千五百円です。", vi: "Chiếc đồng hồ có giá 2.500 yên.", romaji: "Tokei wa nisen gohyaku-en desu." },
      { jp: "毎日、このつくえで勉強します。", vi: "Hàng ngày, tôi học bài ở chiếc bàn này.", romaji: "Mainichi, kono tsukue de benkyou shimasu." }
    ],
    translation: "Đây là phòng của tôi. Căn phòng không rộng nhưng rất yên tĩnh. Ở trên bàn có sách và từ điển. Từ điển là từ điển tiếng Nhật. Bên cạnh bàn có một chiếc đồng hồ. Chiếc đồng hồ có giá 2.500 yên. Mỗi ngày tôi đều học bài ở chiếc bàn này.",
    romaji: "Koko wa watashi no heya desu. Heya wa hirokunai desu ga, shizuka desu. Tsukue no ue ni hon to jisho ga arimasu. Jisho wa nihon no jisho desu. Tsukue no tonari ni tokei ga arimasu. Tokei wa nisen gohyaku-en desu. Mainichi, kono tsukue de benkyou shimasu.",
    vocabularyUsed: ["部屋", "机", "本", "辞書", "時計", "円", "勉強", "静か", "毎日", "ここ"],
    kanjiUsed: ["私", "日", "本", "二", "千", "五", "百", "円", "時", "間"],
    questions: [
      {
        id: "jpd113-q2-1",
        prompt: "つくえのうえに何がありますか。",
        options: ["本とじしょがあります", "時計とでんわがあります", "かさとカバンがあります", "パソコンがあります"],
        answer: "本とじしょがあります",
        explanation: {
          meaning: "Trên bàn có cái gì? Đáp án: Có sách và từ điển.",
          reason: "Trong bài đọc nêu rõ:「つくえのうえに本とじしょがあります。」",
          wrongOptions: [
            { option: "時計とでんわがあります", reason: "Đồng hồ ở bên cạnh bàn, không phải trên bàn và bài không có điện thoại." },
            { option: "かさとカバンがあります", reason: "Bài đọc không nhắc đến ô hay cặp sách." },
            { option: "パソコンがあります", reason: "Bài đọc không nhắc đến máy tính." }
          ]
        }
      },
      {
        id: "jpd113-q2-2",
        prompt: "時計はいくらですか。",
        options: ["二千五百円です", "二千円です", "三千五百円です", "五千円です"],
        answer: "二千五百円です",
        explanation: {
          meaning: "Chiếc đồng hồ giá bao nhiêu tiền? Đáp án: 2.500 yên.",
          reason: "Câu văn:「時計は二千五百円です。」(2.500 yên).",
          wrongOptions: [
            { option: "二千円です", reason: "Thiếu 500 yên." },
            { option: "三千五百円です", reason: "Sai số tiền (3.500 yên)." },
            { option: "五千円です", reason: "Sai số tiền (5.000 yên)." }
          ]
        }
      },
      {
        id: "jpd113-q2-3",
        prompt: "へやはどうですか。",
        options: ["ひろくないですが、しずかです", "ひろくて、にぎやかです", "せまくて、うるさいです", "とてもひろいです"],
        answer: "ひろくないですが、しずかです",
        explanation: {
          meaning: "Căn phòng như thế nào? Đáp án: Không rộng nhưng yên tĩnh.",
          reason: "Dẫn chứng câu 2:「へやはひろくないですが、しずかです。」",
          wrongOptions: [
            { option: "ひろくて、にぎやかです", reason: "Ngược với thông tin phòng không rộng và yên tĩnh." },
            { option: "せまくて、うるさいです", reason: "Phòng yên tĩnh chứ không ồn ào." },
            { option: "とてもひろいです", reason: "Phòng không rộng." }
          ]
        }
      }
    ]
  },
  {
    id: "jpd113-read-3",
    course: "JPD113",
    title: "としょかんと毎日のスケジュール",
    titleVi: "Thư viện và lịch trình mỗi ngày",
    theme: "Thời gian, các thứ trong tuần và địa điểm",
    content: "大学のとしょかんは午前九時から午後七時までです。月曜日から金曜日まであいています。土曜日と日曜日は休みです。としょかんには本がたくさんあります。日本の本もあります。わたしは水曜日の午後にとしょかんへ行きます。二時間、日本語の本を読みます。としょかんはとてもきれいで、しずかです。",
    sentences: [
      { jp: "大学のとしょかんは午前九時から午後七時までです。", vi: "Thư viện của trường đại học mở từ 9 giờ sáng đến 7 giờ tối.", romaji: "Daigaku no toshokan wa gozen kyuu-ji kara gogo shichi-ji made desu." },
      { jp: "月曜日から金曜日まであいています。", vi: "Mở cửa từ thứ Hai đến thứ Sáu.", romaji: "Getsuyoubi kara kinyoubi made aite imasu." },
      { jp: "土曜日と日曜日は休みです。", vi: "Thứ Bảy và Chủ nhật thì nghỉ.", romaji: "Doyoubi to nichiyoubi wa yasumi desu." },
      { jp: "としょかんには本がたくさんあります。", vi: "Trong thư viện có rất nhiều sách.", romaji: "Toshokan ni wa hon ga takusan arimasu." },
      { jp: "日本の本もあります。", vi: "Cũng có cả sách của Nhật Bản.", romaji: "Nihon no hon mo arimasu." },
      { jp: "わたしは水曜日の午後にとしょかんへ行きます。", vi: "Tôi đến thư viện vào chiều thứ Tư.", romaji: "Watashi wa suiyoubi no gogo ni toshokan e ikimasu." },
      { jp: "二時間、日本語の本を読みます。", vi: "Tôi đọc sách tiếng Nhật trong hai tiếng.", romaji: "Ni-jikan, nihongo no hon o yomimasu." },
      { jp: "としょかんはとてもきれいで、しずかです。", vi: "Thư viện rất đẹp và yên tĩnh.", romaji: "Toshokan wa totemo kirei de, shizuka desu." }
    ],
    translation: "Thư viện trường đại học mở cửa từ 9 giờ sáng đến 7 giờ tối. Thư viện mở từ thứ Hai đến thứ Sáu, còn thứ Bảy và Chủ nhật thì đóng cửa nghỉ. Ở thư viện có rất nhiều đầu sách, có cả sách tiếng Nhật nữa. Tôi thường đến thư viện vào các buổi chiều thứ Tư và đọc sách tiếng Nhật trong 2 tiếng đồng hồ. Thư viện ở đây rất khang trang và yên tĩnh.",
    romaji: "Daigaku no toshokan wa gozen kyuu-ji kara gogo shichi-ji made desu. Getsuyoubi kara kinyoubi made aite imasu. Doyoubi to nichiyoubi wa yasumi desu. Toshokan ni wa hon ga takusan arimasu. Nihon no hon mo arimasu. Watashi wa suiyoubi no gogo ni toshokan e ikimasu. Ni-jikan, nihongo no hon o yomimasu. Toshokan wa totemo kirei de, shizuka desu.",
    vocabularyUsed: ["大学", "図書館", "午前", "午後", "月曜日", "金曜日", "土曜日", "日曜日", "休み", "水曜日", "二時間", "日本語", "読む"],
    kanjiUsed: ["大", "学", "午", "前", "後", "九", "時", "七", "月", "曜", "日", "土", "休", "本", "水", "二", "間", "語"],
    questions: [
      {
        id: "jpd113-q3-1",
        prompt: "としょかんは何時から何時までですか。",
        options: ["午前九時から午後七時までです", "午前八時から午後六時までです", "午前九時から午後五時までです", "午前十時から午後八時までです"],
        answer: "午前九時から午後七時までです",
        explanation: {
          meaning: "Thư viện mở cửa từ mấy giờ đến mấy giờ? Đáp án: Từ 9 giờ sáng đến 7 giờ tối.",
          reason: "Câu mở đầu nêu rõ:「大学のとしょかんは午前九時から午後七時までです。」",
          wrongOptions: [
            { option: "午前八時から午後六時までです", reason: "Sai giờ bắt đầu và kết thúc." },
            { option: "午前九時から午後五時までです", reason: "5 giờ chiều là đóng cửa sớm hơn quy định." },
            { option: "午前十時から午後八時までです", reason: "Sai giờ mở cửa." }
          ]
        }
      },
      {
        id: "jpd113-q3-2",
        prompt: "としょかんは何曜日が休みですか。",
        options: ["土曜日と日曜日です", "月曜日と火曜日です", "水曜日と木曜日です", "きんようびです"],
        answer: "土曜日と日曜日です",
        explanation: {
          meaning: "Thư viện nghỉ vào những thứ mấy? Đáp án: Thứ Bảy và Chủ nhật.",
          reason: "Trong bài có câu:「土曜日と日曜日は休みです。」",
          wrongOptions: [
            { option: "月曜日と火曜日です", reason: "Thứ Hai và thứ Ba thư viện vẫn mở." },
            { option: "水曜日と木曜日です", reason: "Thư viện mở cửa ngày thường." },
            { option: "きんようびです", reason: "Thứ Sáu thư viện vẫn mở." }
          ]
        }
      },
      {
        id: "jpd113-q3-3",
        prompt: "わたしはいつとしょかんへ行きますか。",
        options: ["水曜日の午後です", "月曜日の午前です", "土曜日の午後です", "きんようびの午前です"],
        answer: "水曜日の午後です",
        explanation: {
          meaning: "Tôi đến thư viện vào lúc nào? Đáp án: Chiều thứ Tư.",
          reason: "Bài đọc ghi:「わたしは水曜日の午後にとしょかんへ行きます。」",
          wrongOptions: [
            { option: "月曜日の午前です", reason: "Sai thứ và buổi." },
            { option: "土曜日の午後です", reason: "Thứ Bảy thư viện đóng cửa nghỉ." },
            { option: "きんようびの午前です", reason: "Không đúng với thông tin bài đọc." }
          ]
        }
      }
    ]
  },
  {
    id: "jpd113-read-4",
    course: "JPD113",
    title: "大学の学食と買い物",
    titleVi: "Bữa trưa ở nhà ăn trường và đi mua sắm",
    theme: "Thời gian, giá tiền và hoạt động hàng ngày",
    content: "毎日、十二時半に大学の学食でひるごはんを食べます。学食にはラーメンやカレーがあります。ラーメンは五百円です。とても安いです。午後一時に、友達と本屋へ行きます。日本語の本とじしょを買います。じしょは三千円です。午後は三時から五時までとしょかんで日本語を勉強します。",
    sentences: [
      { jp: "毎日、十二時半に大学の学食でひるごはんを食べます。", vi: "Mỗi ngày, vào lúc 12 giờ rưỡi tôi ăn trưa ở căng tin trường.", romaji: "Mainichi, juuni-jihan ni daigaku no gakushoku de hirugohan o tabemasu." },
      { jp: "学食にはラーメンやカレーがあります。", vi: "Ở căng tin có mì ramen và cơm cà ri.", romaji: "Gakushoku ni wa raamen ya karee ga arimasu." },
      { jp: "ラーメンは五百円です。", vi: "Mì ramen có giá 500 yên.", romaji: "Raamen wa gohyaku-en desu." },
      { jp: "とても安いです。", vi: "Rất rẻ.", romaji: "Totemo yasui desu." },
      { jp: "午後一時に、友達と本屋へ行きます。", vi: "Lúc 1 giờ chiều, tôi cùng bạn đi đến hiệu sách.", romaji: "Gogo ichi-ji ni, tomodachi to honya e ikimasu." },
      { jp: "日本語の本とじしょを買います。", vi: "Chúng tôi mua sách tiếng Nhật và từ điển.", romaji: "Nihongo no hon to jisho o kaimasu." },
      { jp: "じしょは三千円です。", vi: "Từ điển có giá 3.000 yên.", romaji: "Jisho wa sanzen-en desu." },
      { jp: "午後は三時から五時までとしょかんで日本語を勉強します。", vi: "Buổi chiều tôi học tiếng Nhật ở thư viện từ 3 giờ đến 5 giờ.", romaji: "Gogo wa san-ji kara go-ji made toshokan de nihongo o benkyou shimasu." }
    ],
    translation: "Hàng ngày, đúng 12 giờ rưỡi trưa tôi đều dùng bữa tại nhà ăn của trường đại học. Ở căng tin có bán món mì ramen và cơm cà ri. Mì ramen giá 500 yên, rất vừa túi tiền và rẻ. Đến 1 giờ chiều, tôi cùng bạn đi đến hiệu sách để mua sách tiếng Nhật và một cuốn từ điển. Cuốn từ điển có giá 3.000 yên. Buổi chiều từ 3 giờ đến 5 giờ, tôi chăm chỉ ôn bài tiếng Nhật tại thư viện.",
    romaji: "Mainichi, juuni-jihan ni daigaku no gakushoku de hirugohan o tabemasu. Gakushoku ni wa raamen ya karee ga arimasu. Raamen wa gohyaku-en desu. Totemo yasui desu. Gogo ichi-ji ni, tomodachi to honya e ikimasu. Nihongo no hon to jisho o kaimasu. Jisho wa sanzen-en desu. Gogo wa san-ji kara go-ji made toshokan de nihongo o benkyou shimasu.",
    vocabularyUsed: ["毎日", "十二時半", "大学", "昼ご飯", "食べる", "ラーメン", "カレー", "五百円", "安い", "午後", "一時", "本屋", "行く", "日本語", "本", "辞書", "買う", "三千円", "三時", "五時", "図書館", "勉強"],
    kanjiUsed: ["毎", "日", "十", "二", "時", "半", "大", "学", "食", "円", "午", "後", "一", "本", "行", "語", "買", "三", "千", "五"],
    questions: [
      {
        id: "jpd113-q4-1",
        prompt: "ラーメンはいくらですか。",
        options: ["五百円です", "三百円です", "千円です", "五千円です"],
        answer: "五百円です",
        explanation: {
          meaning: "Mì ramen có giá bao nhiêu tiền? Đáp án: 500 yên (五百円).",
          reason: "Dẫn chứng câu 3:「ラーメンは五百円です。」",
          wrongOptions: [
            { option: "三百円です", reason: "Sai số tiền (300 yên)." },
            { option: "千円です", reason: "1.000 yên là đắt hơn thực tế." },
            { option: "五千円です", reason: "Sai hoàn toàn giá tiền." }
          ]
        }
      },
      {
        id: "jpd113-q4-2",
        prompt: "午後一時にどこへ行きますか。",
        options: ["本屋へ行きます", "としょかんへ行きます", "学食へ行きます", "へやへ帰ります"],
        answer: "本屋へ行きます",
        explanation: {
          meaning: "Lúc 1 giờ chiều đi đâu? Đáp án: Đến hiệu sách (本屋へ行きます).",
          reason: "Dẫn chứng câu 5:「午後一時に、友達と本屋へ行きます。」",
          wrongOptions: [
            { option: "としょかんへ行きます", reason: "Thư viện là 3 giờ chiều mới đến học." },
            { option: "学食へ行きます", reason: "Nhà ăn là 12h30 trưa." },
            { option: "へやへ帰ります", reason: "Không có thông tin về phòng lúc 1 giờ." }
          ]
        }
      },
      {
        id: "jpd113-q4-3",
        prompt: "じしょはいくらですか。",
        options: ["三千円です", "五百円です", "二千円です", "五千円です"],
        answer: "三千円です",
        explanation: {
          meaning: "Cuốn từ điển giá bao nhiêu tiền? Đáp án: 3.000 yên (三千円).",
          reason: "Dẫn chứng câu 7:「じしょは三千円です。」",
          wrongOptions: [
            { option: "五百円です", reason: "500 yên là giá của bát mì ramen." },
            { option: "二千円です", reason: "Sai giá tiền." },
            { option: "五千円です", reason: "Quá đắt so với bài đọc." }
          ]
        }
      }
    ]
  }
];

const RAW_PASSAGES_JPD123: ReadingPassage[] = [
  // SET 1 - Đề 1
  {
    id: "jpd123-read-1",
    course: "JPD123",
    title: "デパートでの買い物と日本料理",
    titleVi: "Mua sắm ở bách hóa và món ăn Nhật",
    theme: "Mua sắm, so sánh giá cả, dụng cụ ăn uống và phương tiện",
    content: "先週の土曜日、私は東京から来た本田さんとダナン市の区にある大きいデパートへ買い物に行きました。デパートでセールがありましたから、人がたくさんいました。私たちは白いTシャツを二まい買いました。二まいで三千円でした。とてもやすかったです。買い物をしてから、日本料理のレストランへ行きました。ナイフやスプーンなどの食事の道具をつかって、とり肉の料理やピザを食べました。デパートのピザはスーパーのピザよりずっとおいしかったです。小さいカフェでコーヒーを飲んでから、午後四時半にタクシーで帰りました。バスよりタクシーのほうがはやいですが、たかかったです。",
    sentences: [
      { jp: "先週の土曜日、私は東京から来た本田さんとダナン市の区にある大きいデパートへ買い物に行きました。", vi: "Thứ Bảy tuần trước, tôi và bạn Honda đến từ Tokyo đã đi mua sắm ở trung tâm thương mại lớn tại quận trung tâm Đà Nẵng.", romaji: "Senshuu no doyoubi, watashi wa Toukyou kara kita Honda-san to Danan-shi no ku ni aru ookii depaato e kaimono ni ikimashita." },
      { jp: "デパートでセールがありましたから、人がたくさんいました。", vi: "Vì ở trung tâm thương mại có đợt giảm giá nên rất đông người.", romaji: "Depaato de seeru ga arimashita kara, hito ga takusan imashita." },
      { jp: "私たちは白いTシャツを二まい買いました。", vi: "Chúng tôi đã mua hai chiếc áo phông trắng.", romaji: "Watashitachi wa shiroi tiishatsu o nimai kaimashita." },
      { jp: "二まいで三千円でした。", vi: "Hai chiếc có giá 3.000 yên.", romaji: "Nimai de sanzen-en deshita." },
      { jp: "とてもやすかったです。", vi: "Đã rất rẻ.", romaji: "Totemo yasukatta desu." },
      { jp: "買い物をしてから、日本料理のレストランへ行きました。", vi: "Sau khi mua sắm xong, chúng tôi đã đến nhà hàng ẩm thực Nhật Bản.", romaji: "Kaimono o shite kara, nihon ryouri no resutoran e ikimashita." },
      { jp: "ナイフやスプーンなどの食事の道具をつかって、とり肉の料理やピザを食べました。", vi: "Dùng các dụng cụ ăn uống như dao và thìa, chúng tôi ăn các món thịt gà và pizza.", romaji: "Naifu ya supuun nado no shokuji no dougu o tsukatte, toriniku no ryouri ya piza o tabemashita." },
      { jp: "デパートのピザはスーパーのピザよりずっとおいしかったです。", vi: "Bánh pizza ở trung tâm thương mại ngon hơn nhiều so với pizza ở siêu thị.", romaji: "Depaato no piza wa suupaa no piza yori zutto oishikatta desu." },
      { jp: "小さいカフェでコーヒーを飲んでから、午後四時半にタクシーで帰りました。", vi: "Sau khi uống cà phê ở quán nhỏ, chúng tôi bắt taxi về lúc 4 giờ rưỡi chiều.", romaji: "Chiisai kafe de koohii o nonde kara, gogo yo-jihan ni takushii de kaerimashita." },
      { jp: "バスよりタクシーのほうがはやいですが、たかかったです。", vi: "Taxi nhanh hơn xe buýt nhưng mà đắt tiền hơn.", romaji: "Basu yori takushii no hou ga hayai desu ga, takakatta desu." }
    ],
    translation: "Thứ Bảy tuần trước, tôi cùng bạn Honda đến từ Tokyo đi mua sắm ở trung tâm thương mại lớn nằm trong quận của thành phố Đà Nẵng. Vì trung tâm thương mại có đợt bán giảm giá lớn nên rất đông người đến. Chúng tôi đã mua hai chiếc áo phông trắng với giá 3.000 yên cho cả hai chiếc, giá rất rẻ. Mua sắm xong, chúng tôi ghé vào một nhà hàng món ăn Nhật Bản. Dùng dao và thìa, chúng tôi cùng ăn món thịt gà và pizza. Pizza ở đây ngon hơn nhiều so với pizza ở siêu thị. Sau đó, chúng tôi uống cà phê ở một quán nhỏ rồi đón taxi về lúc 4 giờ rưỡi chiều. Taxi chạy nhanh hơn xe buýt nhưng đắt tiền hơn.",
    romaji: "Senshuu no doyoubi, watashi wa Toukyou kara kita Honda-san to Danan-shi no ku ni aru ookii depaato e kaimono ni ikimashita. Depaato de seeru ga arimashita kara, hito ga takusan imashita. Watashitachi wa shiroi tiishatsu o nimai kaimashita. Nimai de sanzen-en deshita. Totemo yasukatta desu. Kaimono o shite kara, nihon ryouri no resutoran e ikimashita. Naifu ya supuun nado no shokuji no dougu o tsukatte, toriniku no ryouri ya piza o tabemashita. Depaato no piza wa suupaa no piza yori zutto oishikatta desu. Chiisai kafe de koohii o nonde kara, gogo yo-jihan ni takushii de kaerimashita. Basu yori takushii no hou ga hayai desu ga, takakatta desu.",
    vocabularyUsed: ["先週", "土曜日", "私", "東京", "来る", "市", "区", "大きい", "デパート", "買い物", "行く", "セール", "人", "Tシャツ", "二枚", "買う", "三千円", "日本料理", "レストラン", "ナイフ", "スプーン", "道具", "肉", "食べる", "ピザ", "スーパー", "小さい", "カフェ", "コーヒー", "飲む", "午後", "四時半", "タクシー", "帰る", "バス"],
    kanjiUsed: ["先", "週", "土", "曜", "日", "私", "東", "京", "来", "本", "田", "市", "区", "大", "買", "物", "行", "人", "二", "三", "千", "円", "料", "理", "食", "具", "肉", "小", "飲", "午", "後", "四", "時", "半", "帰"],
    questions: [
      {
        id: "jpd123-q1-1",
        prompt: "筆者は本田さんとどこへ買い物に行きましたか。",
        options: [
          "ダナン市の区にある大きいデパートへ行きました",
          "東京の小さいスーパーへ行きました",
          "ハノイの駅の前の本屋へ行きました",
          "大学の近くのコンビニへ行きました"
        ],
        answer: "ダナン市の区にある大きいデパートへ行きました",
        explanation: {
          meaning: "Tác giả đã cùng Honda đi mua sắm ở đâu? Đáp án: Trung tâm thương mại lớn ở quận của thành phố Đà Nẵng.",
          reason: "Dẫn chứng câu 1:「ダナン市の区にある大きいデパートへ買い物に行きました。」",
          wrongOptions: [
            { option: "東京の小さいスーパーへ行きました", reason: "Honda đến từ Tokyo chứ không phải đi siêu thị ở Tokyo." },
            { option: "ハノイの駅の前の本屋へ行きました", reason: "Không đi hiệu sách ở Hà Nội." },
            { option: "大学の近くのコンビニへ行きました", reason: "Tác giả đi trung tâm thương mại lớn." }
          ]
        }
      },
      {
        id: "jpd123-q1-2",
        prompt: "筆者はデパートで何を何まい買いましたか。",
        options: ["白いTシャツを二まい買いました", "黒いTシャツを三まい買いました", "ズボンを二まい買いました", "シャツを一まい買いました"],
        answer: "白いTシャツを二まい買いました",
        explanation: {
          meaning: "Tác giả đã mua cái gì và mấy chiếc ở bách hóa? Đáp án: Mua hai chiếc áo phông trắng.",
          reason: "Dẫn chứng câu 3:「私たちは白いTシャツを二まい買いました。」",
          wrongOptions: [
            { option: "黒いTシャツを三まい買いました", reason: "Áo màu trắng và mua 2 chiếc chứ không phải 3 chiếc." },
            { option: "ズボンを二まい買いました", reason: "Mua áo phông chứ không mua quần dài." },
            { option: "シャツを一まい買いました", reason: "Sai số lượng và chủng loại." }
          ]
        }
      },
      {
        id: "jpd123-q1-3",
        prompt: "レストランで何をつかって食べましたか。",
        options: [
          "ナイフやスプーンなどの食事の道具をつかいました",
          "ハシだけをつかって食べました",
          "手だけで食べました",
          "フォークだけで食べました"
        ],
        answer: "ナイフやスプーンなどの食事の道具をつかいました",
        explanation: {
          meaning: "Ở nhà hàng, tác giả đã dùng gì để ăn? Đáp án: Các dụng cụ ăn uống như dao và thìa.",
          reason: "Dẫn chứng câu 7:「ナイフやスプーンなどの食事の道具をつかって、とり肉の料理やピザを食べました。」",
          wrongOptions: [
            { option: "ハシだけをつかって食べました", reason: "Bài không nhắc đến dùng đũa." },
            { option: "手だけで食べました", reason: "Bài nêu rõ dùng dụng cụ dao và thìa." },
            { option: "フォークだけで食べました", reason: "Bài nêu dao và thìa (ナイフやスプーンなどの食事の道具)." }
          ]
        }
      },
      {
        id: "jpd123-q1-4",
        prompt: "デパートのピザとスーパーのピザはどうですか。",
        options: [
          "デパートのピザのほうがスーパーよりずっとおいしいです",
          "スーパーのピザのほうがデパートよりおいしいです",
          "どちらのピザも同じ味です",
          "デパートのピザはあまりおいしくないです"
        ],
        answer: "デパートのピザのほうがスーパーよりずっとおいしいです",
        explanation: {
          meaning: "So sánh pizza ở bách hóa và siêu thị như thế nào? Đáp án: Pizza ở bách hóa ngon hơn nhiều.",
          reason: "Dẫn chứng câu 8:「デパートのピザはスーパーのピザよりずっとおいしかったです。」",
          wrongOptions: [
            { option: "スーパーのピザのほうがデパートよりおいしいです", reason: "Ngược hoàn toàn với bài đọc." },
            { option: "どちらのピザも同じ味です", reason: "Bài khẳng định pizza bách hóa ngon hơn hẳn." },
            { option: "デパートのピザはあまりおいしくないです", reason: "Pizza ở bách hóa rất ngon." }
          ]
        }
      }
    ]
  },
  // SET 1 - Đề 2
  {
    id: "jpd123-read-2",
    course: "JPD123",
    title: "歴史のあるお寺と門の観光",
    titleVi: "Tham quan ngôi chùa lịch sử và cổng lớn",
    theme: "Du lịch, danh lam thắng cảnh, phương tiện và viết tên kỷ niệm",
    content: "来月の休みに、私の国のともだちと二人でお寺へりょこうに行きます。そのまちには大きい門とお寺がありますから、男の人も女の人もたくさん来ます。駅の前で有名なバスにのって、午前十時につきました。お寺の門の前でしゃしんをたくさんとって、きれいなたてものを見ました。たくさん歩きましたから、からだがつかれて力もなくなりましたが、とてもたのしかったです。お寺のノートに自分の名前を書いてから、よるにアパートへ帰りました。",
    sentences: [
      { jp: "来月の休みに、私の国のともだちと二人でお寺へりょこうに行きます。", vi: "Vào kỳ nghỉ tháng sau, tôi và người bạn cùng quê sẽ đi du lịch đến ngôi chùa cổ.", romaji: "Raigetsu no yasumi ni, watashi no kuni no tomodachi to futari de otera e ryokou ni ikimasu." },
      { jp: "そのまちには大きい門とお寺がありますから、男の人も女の人もたくさん来ます。", vi: "Vì thị trấn đó có cổng lớn và ngôi chùa nên cả nam và nữ đều đến rất đông.", romaji: "Sono machi ni wa ookii mon to otera ga arimasu kara, otoko no hito mo onna no hito mo takusan kimasu." },
      { jp: "駅の前で有名なバスにのって、午前十時につきました。", vi: "Chúng tôi lên tuyến xe buýt nổi tiếng ở trước nhà ga và đã đến nơi lúc 10 giờ sáng.", romaji: "Eki no mae de yuumeina basu ni notte, gozen juu-ji ni tsukimashita." },
      { jp: "お寺の門の前でしゃしんをたくさんとって、きれいなたてものを見ました。", vi: "Chúng tôi chụp nhiều ảnh trước cổng chùa và chiêm ngưỡng công trình tuyệt đẹp.", romaji: "Otera no mon no mae de shashin o takusan totte, kireina tatemono o mimashita." },
      { jp: "たくさん歩きましたから、からだがつかれて力もなくなりましたが、とてもたのしかったです。", vi: "Vì đi bộ nhiều nên người mệt và kiệt sức nhưng chuyến đi rất vui.", romaji: "Takusan arukimashita kara, karada ga tsukarete chikara mo nakunarimashita ga, totemo tanoshikatta desu." },
      { jp: "お寺のノートに自分の名前を書いてから、よるにアパートへ帰りました。", vi: "Sau khi viết tên mình vào cuốn sổ lưu niệm của chùa, chúng tôi trở về căn hộ vào buổi tối.", romaji: "Otera no nooto ni jibun no namae o kaite kara, yoru ni apaato e kaerimashita." }
    ],
    translation: "Vào kỳ nghỉ tháng sau, tôi cùng một người bạn đồng hương dự định đi du lịch viếng chùa. Nơi đó có cổng chào khổng lồ và ngôi chùa thanh tịnh nên thu hút rất đông cả nam giới và nữ giới tới tham quan. Chúng tôi đón xe buýt trước nhà ga và đến nơi vào lúc 10 giờ sáng. Cả hai chụp nhiều bức ảnh kỷ niệm trước cổng chùa và ngắm nhìn các công trình kiến trúc tuyệt đẹp. Do đi bộ khá nhiều nên cơ thể thấm mệt và tiêu hao nhiều thể lực, nhưng chuyến đi vô cùng ý nghĩa và vui vẻ. Sau khi nắn nót ghi tên mình vào sổ lưu niệm tại chùa, chúng tôi trở về căn hộ khi trời đã tối.",
    romaji: "Raigetsu no yasumi ni, watashi no kuni no tomodachi to futari de otera e ryokou ni ikimasu. Sono machi ni wa ookii mon to otera ga arimasu kara, otoko no hito mo onna no hito mo takusan kimasu. Eki no mae de yuumeina basu ni notte, gozen juu-ji ni tsukimashita. Otera no mon no mae de shashin o takusan totte, kireina tatemono o mimashita. Takusan arukimashita kara, karada ga tsukarete chikara mo nakunarimashita ga, totemo tanoshikatta desu. Otera no nooto ni jibun no namae o kaite kara, yoru ni apaato e kaerimashita.",
    vocabularyUsed: ["来月", "休み", "私", "国", "友達", "二人", "お寺", "旅行", "行く", "大きい", "門", "男の人", "女の人", "来る", "前", "バス", "午前", "十時", "写真", "見る", "力", "名前", "書く", "アパート", "帰る"],
    kanjiUsed: ["来", "月", "休", "私", "国", "二", "人", "寺", "行", "大", "門", "男", "女", "前", "午", "十", "時", "見", "力", "名", "書", "帰"],
    questions: [
      {
        id: "jpd123-q2-1",
        prompt: "筆者は来月の休みにだれとどこへ行きますか。",
        options: [
          "国のともだちと二人でお寺へ行きます",
          "会社の人と一人で海へ行きます",
          "先生と三人で東京へ行きます",
          "家族とデパートへ行きます"
        ],
        answer: "国のともだちと二人でお寺へ行きます",
        explanation: {
          meaning: "Tác giả sẽ đi đâu và đi cùng ai vào kỳ nghỉ tháng sau? Đáp án: Đi chùa cùng 1 người bạn đồng hương (2 người).",
          reason: "Dẫn chứng câu 1:「来月の休みに、私の国のともだちと二人でお寺へりょこうに行きます。」",
          wrongOptions: [
            { option: "会社の人と一人で海へ行きます", reason: "Đi với bạn cùng quê đến chùa chứ không đi biển." },
            { option: "先生と三人で東京へ行きます", reason: "Bài không nhắc đi với thầy giáo." },
            { option: "家族とデパートへ行きます", reason: "Không đi trung tâm thương mại với gia đình." }
          ]
        }
      },
      {
        id: "jpd123-q2-2",
        prompt: "そのまちにはどうして男の人も女の人もたくさん来ますか。",
        options: [
          "大きい門とお寺があるからです",
          "大きいデパートとカフェがあるからです",
          "海と山が近いからです",
          "スポーツの試合があるからです"
        ],
        answer: "大きい門とお寺があるからです",
        explanation: {
          meaning: "Tại sao thị trấn đó lại có nhiều cả nam và nữ đến tham quan? Đáp án: Vì có cổng lớn và ngôi chùa.",
          reason: "Dẫn chứng câu 2:「そのまちには大きい門とお寺がありますから、男の人も女の人もたくさん来ます。」",
          wrongOptions: [
            { option: "大きいデパートとカフェがあるからです", reason: "Thị trấn nổi tiếng nhờ cổng lớn và chùa cổ." },
            { option: "海と山が近いからです", reason: "Không có thông tin này trong bài." },
            { option: "スポーツの試合があるからです", reason: "Không có giải thi đấu thể thao." }
          ]
        }
      },
      {
        id: "jpd123-q2-3",
        prompt: "お寺の門の前で何をしましたか。",
        options: [
          "しゃしんをとって、きれいなたてものを見ました",
          "お弁当とおにぎりを食べました",
          "バスのチケットを買いました",
          "お茶とジュースを飲みました"
        ],
        answer: "しゃしんをとって、きれいなたてものを見ました",
        explanation: {
          meaning: "Họ đã làm gì trước cổng chùa? Đáp án: Chụp ảnh và ngắm các công trình đẹp.",
          reason: "Dẫn chứng câu 4:「お寺の門の前でしゃしんをたくさんとって、きれいなたてものを見ました。」",
          wrongOptions: [
            { option: "お弁当とおにぎりを食べました", reason: "Họ không ăn cơm hộp trước cổng chùa." },
            { option: "バスのチケットを買いました", reason: "Mua vé là ở trạm xe buýt trước nhà ga." },
            { option: "お茶とジュースを飲みました", reason: "Bài không nhắc đến việc uống nước tại đây." }
          ]
        }
      },
      {
        id: "jpd123-q2-4",
        prompt: "アパートへ帰る前に何をしましたか。",
        options: [
          "お寺のノートに自分の名前を書きました",
          "レストランでハンバーグを食べました",
          "デパートでTシャツを買いました",
          "駅の前でタクシーを呼びました"
        ],
        answer: "お寺のノートに自分の名前を書きました",
        explanation: {
          meaning: "Trước khi về căn hộ, tác giả đã làm gì? Đáp án: Ghi tên mình vào sổ lưu niệm ở chùa.",
          reason: "Dẫn chứng câu kết:「お寺のノートに自分の名前を書いてから、よるにアパートへ帰りました。」",
          wrongOptions: [
            { option: "レストランでハンバーグを食べました", reason: "Bài không nhắc đến ăn thịt Hamburg." },
            { option: "デパートでTシャツを買いました", reason: "Không đi mua áo phông." },
            { option: "駅の前でタクシーを呼びました", reason: "Không có hành động này trong bài." }
          ]
        }
      }
    ]
  },
  // SET 1 - Đề 3
  {
    id: "jpd123-read-3",
    course: "JPD123",
    title: "日本語のじゅぎょうと将来の会社",
    titleVi: "Giờ học tiếng Nhật và công ty tương lai",
    theme: "Học tập, thể て theo chỉ dẫn, đọc thành tiếng và rèn luyện năng lực",
    content: "毎週月曜日と水曜日に、私たちは日本語のじゅぎょうがあります。先生は「テキストを開けて、CDをよく聞いてください」と言いました。それから、学生たちに「この文を声に出して読んでください」と言って、先生はノートやパソコンに漢字を書いて、読み方を教えてくれました。じゅぎょうの後で、ルームメイトとカフェでテストについて日本語でたくさん話しました。私は今週、毎日二時間べんきょうしています。日本の会社で働きたいですから、日本語の力をつけたいです。",
    sentences: [
      { jp: "毎週月曜日と水曜日に、私たちは日本語のじゅぎょうがあります。", vi: "Mỗi thứ Hai và thứ Tư hàng tuần, chúng tôi đều có tiết học tiếng Nhật.", romaji: "Maishuu getsuyoubi to suiyoubi ni, watashitachi wa nihongo no jugyou ga arimasu." },
      { jp: "先生は「テキストを開けて、CDをよく聞いてください」と言いました。", vi: "Cô giáo nói: 'Cả lớp hãy mở sách giáo trình ra và chú ý lắng nghe đĩa CD'.", romaji: "Sensei wa 'tekisuto o akete, shii-dii o yoku kiite kudasai' to iimashita." },
      { jp: "それから、学生たちに「この文を声に出して読んでください」と言って、先生はノートやパソコンに漢字を書いて、読み方を教えてくれました。", vi: "Sau đó, cô bảo học sinh: 'Hãy đọc to câu này lên', rồi cô viết chữ Hán vào sổ và máy tính để dạy cách đọc.", romaji: "Sorekara, gakuseitachi ni 'kono bun o koe ni dashite yonde kudasai' to itte, sensei wa nooto ya pasokon ni kanji o kaite, yomikata o oshiete kuremashita." },
      { jp: "じゅぎょうの後で、ルームメイトとカフェでテストについて日本語でたくさん話しました。", vi: "Sau giờ học, tôi cùng bạn cùng phòng ra quán cà phê và trò chuyện rất nhiều bằng tiếng Nhật về bài thi.", romaji: "Jugyou no ato de, ruumumeito to kafe de tesuto ni tsuite nihongo de takusan hanashimashita." },
      { jp: "私は今週、毎日二時間べんきょうしています。", vi: "Tuần này, ngày nào tôi cũng chăm chỉ học 2 tiếng đồng hồ.", romaji: "Watashi wa konshuu, mainichi ni-jikan benkyou shite imasu." },
      { jp: "日本の会社で働きたいですから、日本語の力をつけたいです。", vi: "Vì tôi muốn làm việc ở công ty Nhật Bản nên tôi muốn nâng cao năng lực tiếng Nhật.", romaji: "Nihon no kaisha de hatarakitai desu kara, nihongo no chikara o tsuketai desu." }
    ],
    translation: "Vào mỗi sáng thứ Hai và thứ Tư hàng tuần, chúng tôi đều có tiết học tiếng Nhật tại trường. Giáo viên dặn cả lớp: 'Các em hãy mở sách giáo khoa tiếng Nhật và chú ý lắng nghe đĩa CD phát âm nhé'. Tiếp đó, cô yêu cầu: 'Hãy đọc to câu văn này lên', rồi cô viết từng chữ Hán quan trọng vào cuốn sổ lớn và hướng dẫn cách đọc chuẩn xác. Sau tiết học, sinh viên chúng tôi cùng ở lại lớp trò chuyện thật nhiều bằng tiếng Nhật. Tuần này, mỗi ngày tôi đều tự học đều đặn 2 tiếng. Vì mong muốn sau này được làm việc tại một công ty Nhật Bản, tôi đang nỗ lực hết mình để nâng cao năng lực tiếng Nhật.",
    romaji: "Maishuu getsuyoubi to suiyoubi ni, watashitachi wa nihongo no jugyou ga arimasu. Sensei wa 'nihongo no hon o akete, shii-dii o yoku kiite kudasai' to iimashita. Sorekara, gakuseitachi ni 'kono bun o koe ni dashite yonde kudasai' to itte, sensei wa nooto ni kanji o kaite, yomikata o oshiete kuremashita. Jugyou no ato de, gakuseitachi wa kyoushitsu de nihongo de takusan hanashimashita. Watashi wa konshuu, mainichi ni-jikan benkyou shite imasu. Nihon no kaisha de hatarakitai desu kara, nihongo no chikara o tsuketai desu.",
    vocabularyUsed: ["毎週", "月曜日", "水曜日", "私", "日本語", "先生", "本", "CD", "聞く", "言う", "読む", "書く", "後", "話す", "今週", "毎日", "二時間", "会社", "力"],
    kanjiUsed: ["毎", "週", "月", "曜", "日", "水", "私", "本", "語", "先", "生", "聞", "言", "読", "書", "後", "話", "今", "二", "時", "間", "会", "社", "力"],
    questions: [
      {
        id: "jpd123-q3-1",
        prompt: "先生は最初に学生たちに何と言いましたか。",
        options: [
          "「本を開けて、CDをよく聞いてください」と言いました",
          "「教室の窓を閉めてください」と言いました",
          "「すぐにテストを始めてください」と言いました",
          "「パソコンを消してください」と言いました"
        ],
        answer: "「本を開けて、CDをよく聞いてください」と言いました",
        explanation: {
          meaning: "Đầu tiên cô giáo đã nói gì với các học sinh? Đáp án: 'Hãy mở sách ra và nghe đĩa CD'.",
          reason: "Dẫn chứng câu 2:「先生は「日本語の本を開けて、CDをよく聞いてください」と言いました。」",
          wrongOptions: [
            { option: "「教室の窓を閉めてください」と言いました", reason: "Cô không yêu cầu đóng cửa sổ lớp." },
            { option: "「すぐにテストを始めてください」と言いました", reason: "Không phải giờ làm bài kiểm tra." },
            { option: "「パソコンを消してください」と言いました", reason: "Không có yêu cầu tắt máy tính." }
          ]
        }
      },
      {
        id: "jpd123-q3-2",
        prompt: "先生はノートに何を書いて教えましたか。",
        options: [
          "漢字を書いて、読み方を教えてくれました",
          "英語を書いて、意味を教えてくれました",
          "宿題の答えを書いてくれました",
          "レストランのメニューを書きました"
        ],
        answer: "漢字を書いて、読み方を教えてくれました",
        explanation: {
          meaning: "Cô giáo đã viết gì vào sổ và dạy điều gì? Đáp án: Viết chữ Hán và chỉ cách đọc.",
          reason: "Dẫn chứng câu 3:「先生はノートに漢字を書いて、読み方を教えてくれました。」",
          wrongOptions: [
            { option: "英語を書いて、意味を教えてくれました", reason: "Cô viết chữ Hán tiếng Nhật, không viết tiếng Anh." },
            { option: "宿題の答えを書いてくれました", reason: "Không viết đáp án bài tập về nhà." },
            { option: "レストランのメニューを書きました", reason: "Không liên quan đến thực đơn nhà hàng." }
          ]
        }
      },
      {
        id: "jpd123-q3-3",
        prompt: "じゅぎょうの後で学生たちは何をしましたか。",
        options: [
          "教室で日本語でたくさん話しました",
          "すぐにアパートへ帰りました",
          "食堂へご飯を食べに行きました",
          "スーパーへ買い物に行きました"
        ],
        answer: "教室で日本語でたくさん話しました",
        explanation: {
          meaning: "Sau giờ học, các bạn sinh viên đã làm gì? Đáp án: Trò chuyện nhiều bằng tiếng Nhật trong phòng học.",
          reason: "Dẫn chứng câu 4:「じゅぎょうの後で、学生たちは教室で日本語でたくさん話しました。」",
          wrongOptions: [
            { option: "すぐにアパートへ帰りました", reason: "Họ ở lại lớp luyện nói tiếng Nhật." },
            { option: "食堂へご飯を食べに行きました", reason: "Bài không nhắc đến việc đi nhà ăn." },
            { option: "スーパーへ買い物に行きました", reason: "Không đi mua sắm ở siêu thị sau giờ học." }
          ]
        }
      },
      {
        id: "jpd123-q3-4",
        prompt: "筆者はどうして日本語の力をつけたいですか。",
        options: [
          "将来、日本の会社で働きたいからです",
          "日本語のテストが嫌いだからです",
          "先生に怒られたからです",
          "友達に頼まれたからです"
        ],
        answer: "将来、日本の会社で働きたいからです",
        explanation: {
          meaning: "Tại sao tác giả lại muốn nâng cao năng lực tiếng Nhật? Đáp án: Vì sau này muốn làm việc ở công ty Nhật.",
          reason: "Dẫn chứng câu kết bài:「日本の会社で働きたいですから、日本語の力をつけたいです。」",
          wrongOptions: [
            { option: "日本語のテストが嫌いだからです", reason: "Tác giả học tập rất chăm chỉ và có mục tiêu rõ ràng." },
            { option: "先生に怒られたからです", reason: "Không bị giáo viên trách mắng." },
            { option: "友達に頼まれたからです", reason: "Đó là ước mơ cá nhân chứ không phải do bạn nhờ." }
          ]
        }
      }
    ]
  },
  // SET 1 - Đề 4
  {
    id: "jpd123-read-4",
    course: "JPD123",
    title: "大学のスポーツ大会とアルバイト",
    titleVi: "Đại hội thể thao ở đại học và việc làm thêm",
    theme: "Sự kiện trường học, rủ rê, từ chối khéo, đồ ăn nhẹ và không khí náo nhiệt",
    content: "今週の日曜日、大学でスポーツ大会があります。本田さんに「いっしょに野きゅうのしあいを見に行きませんか」と聞きました。でも、本田さんは「日曜日はちょっと…会社のアルバイトがありますから」と言いました。本田さんはえきの前のレストランで毎週アルバイトをしています。私は一人ででかけて、コンビニで野さいサンドイッチとジュースを買って食べました。午後から男の人も女の人もたくさんあつまって、とてもにぎやかでした。",
    sentences: [
      { jp: "今週の日曜日、大学でスポーツ大会があります。", vi: "Chủ nhật tuần này, ở trường đại học có đại hội thể thao.", romaji: "Konshuu no nichiyoubi, daigaku de supootsu taikai ga arimasu." },
      { jp: "本田さんに「いっしょに野きゅうの試合を見に行きませんか」と聞きました。", vi: "Tôi đã hỏi bạn Honda: 'Cậu có muốn cùng đi xem trận đấu bóng chày không?'.", romaji: "Honda-san ni 'issho ni yakyuu no shiai o mi ni ikimasen ka' to kikimashita." },
      { jp: "でも、本田さんは「日曜日はちょっと…会社のアルバイトがありますから」と言いました。", vi: "Nhưng bạn Honda đáp: 'Chủ nhật thì hơi kẹt... vì tớ có ca làm thêm ở công ty'.", romaji: "Demo, Honda-san wa 'nichiyoubi wa chotto... kaisha no arubaito ga arimasu kara' to iimashita." },
      { jp: "本田さんは駅の前のレストランで毎週アルバイトをしています。", vi: "Honda đang làm thêm cố định vào mỗi tuần ở nhà hàng trước nhà ga.", romaji: "Honda-san wa eki no mae no resutoran de maishuu arubaito o shite imasu." },
      { jp: "私は一人で出かけて、コンビニで野さいサンドイッチとジュースを買って食べました。", vi: "Tôi đi một mình, ghé cửa hàng tiện lợi mua bánh mì kẹp rau và nước ép để ăn.", romaji: "Watashi wa hitori de dekakete, konbini de yasai sandoitchi to juusu o katte tabemashita." },
      { jp: "午後から男の人も女の人もたくさんあつまって、とてもにぎやかでした。", vi: "Từ buổi chiều, rất đông nam và nữ tập trung lại nên không khí vô cùng sôi nổi.", romaji: "Gogo kara otoko no hito mo onna no hito mo takusan atsumatte, totemo nigiyaka deshita." }
    ],
    translation: "Chủ nhật tuần này, tại khuôn viên trường đại học có tổ chức ngày hội thể thao lớn. Tôi háo hức rủ bạn Honda: 'Chủ nhật này cùng đi xem trận bóng chày với mình không?'. Thế nhưng Honda đã khéo léo từ chối: 'Chủ nhật này thì hơi kẹt cho mình... vì mình có lịch đi làm thêm'. Hóa ra bạn ấy có ca làm thêm hàng tuần tại nhà hàng phía trước nhà ga. Tuy có chút tiếc nuối nhưng tôi vẫn quyết định đi một mình, trên đường ghé cửa hàng tiện lợi mua bánh sandwich rau tươi cùng một hộp nước hoa quả. Từ chiều, các bạn nam và nữ kéo đến cổ vũ rất đông, bầu không khí thực sự náo nhiệt và vui vẻ.",
    romaji: "Konshuu no nichiyoubi, daigaku de supootsu taikai ga arimasu. Honda-san ni 'issho ni yakyuu no shiai o mi ni ikimasen ka' to kikimashita. Demo, Honda-san wa 'nichiyoubi wa chotto... kaisha no arubaito ga arimasu kara' to iimashita. Honda-san wa eki no mae no resutoran de maishuu arubaito o shite imasu. Watashi wa hitori de dekakete, konbini de yasai sandoitchi to juusu o katte tabemashita. Gogo kara otoko no hito mo onna no hito mo takusan atsumatte, totemo nigiyaka deshita.",
    vocabularyUsed: ["今週", "日曜日", "大学", "スポーツ", "野球", "見る", "行く", "聞く", "会社", "アルバイト", "言う", "前", "レストラン", "毎週", "一人", "コンビニ", "野菜", "サンドイッチ", "ジュース", "買う", "食べる", "午後", "男の人", "女の人"],
    kanjiUsed: ["今", "週", "日", "曜", "大", "学", "本", "田", "野", "見", "行", "聞", "会", "社", "言", "前", "毎", "一", "人", "買", "食", "午", "後", "男", "女"],
    questions: [
      {
        id: "jpd123-q4-1",
        prompt: "本田さんはどうして野きゅうの試合を見に行きませんか。",
        options: [
          "日曜日に会社のアルバイトがあるからです",
          "野きゅうの試合がきらいだからです",
          "チケットがとてもたかいからです",
          "病気で休んでいるからです"
        ],
        answer: "日曜日に会社のアルバイトがあるからです",
        explanation: {
          meaning: "Tại sao Honda không đi xem trận đấu bóng chày cùng tác giả? Đáp án: Vì bạn có ca làm thêm vào Chủ nhật.",
          reason: "Dẫn chứng câu 3:「本田さんは「日曜日はちょっと…会社のアルバイトがありますから」と言いました。」",
          wrongOptions: [
            { option: "野きゅうの試合がきらいだからです", reason: "Honda không bảo ghét bóng chày." },
            { option: "チケットがとてもたかいからです", reason: "Sự kiện của trường, không phải vì giá vé." },
            { option: "病気で休んでいるからです", reason: "Honda hoàn toàn khỏe mạnh đi làm thêm." }
          ]
        }
      },
      {
        id: "jpd123-q4-2",
        prompt: "「日曜日はちょっと…」はどういう意味ですか。",
        options: [
          "ことわる（行けない）意味です",
          "時間を聞く意味です",
          "スポーツをほめる意味です",
          "チケットを予約する意味です"
        ],
        answer: "ことわる（行けない）意味です",
        explanation: {
          meaning: "Cụm câu 'Chủ nhật thì hơi...' thể hiện hàm ý gì? Đáp án: Là cách từ chối lịch sự (không thể đi được).",
          reason: "Cấu trúc giao tiếp Bài 6:「〜はちょっと…」là cách nói ngập ngừng khéo léo để từ chối lời mời trong văn hóa Nhật.",
          wrongOptions: [
            { option: "時間を聞く意味です", reason: "Không phải hỏi thời gian." },
            { option: "スポーツをほめる意味です", reason: "Không phải khen ngợi thể thao." },
            { option: "チケットを予約する意味です", reason: "Không phải đặt vé." }
          ]
        }
      },
      {
        id: "jpd123-q4-3",
        prompt: "筆者はコンビニで何を買って食べましたか。",
        options: [
          "野さいサンドイッチとジュースを買って食べました",
          "ラーメンとピザを買って食べました",
          "とり肉のお弁当とお茶を買いました",
          "カレーとパンを買いました"
        ],
        answer: "野さいサンドイッチとジュースを買って食べました",
        explanation: {
          meaning: "Tác giả đã mua món gì ở cửa hàng tiện lợi? Đáp án: Mua bánh mì kẹp rau củ và nước ép.",
          reason: "Dẫn chứng câu 5:「コンビニで野さいサンドイッチとジュースを買って食べました。」",
          wrongOptions: [
            { option: "ラーメンとピザを買って食べました", reason: "Không mua mì ramen hay pizza." },
            { option: "とり肉のお弁当とお茶を買いました", reason: "Không mua cơm hộp thịt gà." },
            { option: "カレーとパンを買いました", reason: "Không mua cà ri." }
          ]
        }
      },
      {
        id: "jpd123-q4-4",
        prompt: "午後からだれがたくさんあつまりましたか。",
        options: [
          "男の人も女の人もたくさんあつまりました",
          "先生と留学生だけが集まりました",
          "会社の人だけが集まりました",
          "だれも来ませんでした"
        ],
        answer: "男の人も女の人もたくさんあつまりました",
        explanation: {
          meaning: "Từ buổi chiều, ai đã tập trung lại rất đông? Đáp án: Cả nam giới và nữ giới.",
          reason: "Dẫn chứng câu 6:「午後から男の人も女の人もたくさんあつまって、とてもにぎやかでした。」",
          wrongOptions: [
            { option: "先生と留学生だけが集まりました", reason: "Bài nêu rõ cả nam và nữ tập trung đông." },
            { option: "会社の人だけが集まりました", reason: "Đây là đại hội thể thao của trường đại học." },
            { option: "だれも来ませんでした", reason: "Ngược hoàn toàn với thực tế rất đông vui." }
          ]
        }
      }
    ]
  },
  // SET 2 - Đề 5
  {
    id: "jpd123-read-5",
    course: "JPD123",
    title: "東京旅行としんかんせんの予約",
    titleVi: "Du lịch Tokyo và đặt vé tàu Shinkansen",
    theme: "Du lịch, so sánh phương tiện, tiện nghi khách sạn và kế hoạch tham quan",
    content: "来月の休みに、私は大学のともだちと二人で東京へりょこうに行きます。東京はとても大きくて、にぎやかなまちです。りょこうの前に、インターネットでホテルをよやくしました。ホテルのへやにテレビやパソコンがあります。東京までしんかんせんとバスとどちらがべんりですか。しんかんせんのほうがはやいですが、チケットがたかいですから、私たちはよるのバスで行きます。東京で大きい門やお寺を見て、カメラでしゃしんをたくさんとりたいです。今からとてもたのしみです。",
    sentences: [
      { jp: "来月の休みに、私は大学のともだちと二人で東京へりょこうに行きます。", vi: "Vào kỳ nghỉ tháng sau, tôi cùng người bạn đại học sẽ đi du lịch Tokyo.", romaji: "Raigetsu no yasumi ni, watashi wa daigaku no tomodachi to futari de Toukyou e ryokou ni ikimasu." },
      { jp: "東京はとても大きくて、にぎやかなまちです。", vi: "Tokyo là một thành phố rất rộng lớn và sầm uất.", romaji: "Toukyou wa totemo ookikute, nigiyakana machi desu." },
      { jp: "りょこうの前に、インターネットでホテルをよやくしました。", vi: "Trước chuyến đi, chúng tôi đã đặt phòng khách sạn qua Internet.", romaji: "Ryokou no mae ni, intaanetto de hoteru o yoyaku shimashita." },
      { jp: "ホテルのへやにテレビやパソコンがあります。", vi: "Trong phòng khách sạn có cả tivi và máy tính.", romaji: "Hoteru no heya ni terebi ya pasokon ga arimasu." },
      { jp: "東京までしんかんせんとバスとどちらがべんりですか。", vi: "Đến Tokyo thì đi tàu Shinkansen hay xe buýt tiện lợi hơn?", romaji: "Toukyou made shinkansen to basu to dochira ga benri desu ka." },
      { jp: "しんかんせんのほうがはやいですが、チケットがたかいですから、私たちはよるのバスで行きます。", vi: "Tàu Shinkansen nhanh hơn nhưng vé đắt, vì thế chúng tôi sẽ đi bằng xe buýt đêm.", romaji: "Shinkansen no hou ga hayai desu ga, chiketto ga takai desu kara, watashitachi wa yoru no basu de ikimasu." },
      { jp: "東京で大きい門やお寺を見て、カメラでしゃしんをたくさんとりたいです。", vi: "Tôi muốn ngắm nhìn các cổng lớn và ngôi chùa ở Tokyo, rồi dùng máy ảnh chụp thật nhiều ảnh.", romaji: "Toukyou de ookii mon ya otera o mite, kamera de shashin o takusan toritai desu." },
      { jp: "今からとてもたのしみです。", vi: "Ngay từ bây giờ tôi đã rất mong đợi chuyến đi này.", romaji: "Ima kara totemo tanoshimi desu." }
    ],
    translation: "Vào kỳ nghỉ tháng tới, tôi dự định cùng một người bạn đại học đi du lịch thủ đô Tokyo. Tokyo là một đại đô thị cực kỳ rộng lớn và nhộn nhịp. Trước ngày khởi hành, chúng tôi đã đặt trước phòng khách sạn qua mạng Internet. Căn phòng rất tiện nghi với cả tivi và máy tính. Đến Tokyo thì đi tàu Shinkansen hay xe buýt tiện hơn? Tàu Shinkansen chạy nhanh hơn hẳn nhưng vì giá vé đắt đỏ nên chúng tôi chọn đi bằng xe buýt đêm. Đến Tokyo, tôi muốn chiêm ngưỡng cổng đền khổng lồ và các ngôi chùa cổ kính, rồi dùng máy ảnh chụp thật nhiều kỷ niệm. Nghĩ đến thôi tôi đã thấy vô cùng hào hứng.",
    romaji: "Raigetsu no yasumi ni, watashi wa daigaku no tomodachi to futari de Toukyou e ryokou ni ikimasu. Toukyou wa totemo ookikute, nigiyakana machi desu. Ryokou no mae ni, intaanetto de hoteru o yoyaku shimashita. Hoteru no heya ni terebi ya pasokon ga arimasu. Toukyou made shinkansen to basu to dochira ga benri desu ka. Shinkansen no hou ga hayai desu ga, chiketto ga takai desu kara, watashitachi wa yoru no basu de ikimasu. Toukyou de ookii mon ya otera o mite, kamera de shashin o takusan toritai desu. Ima kara totemo tanoshimi desu.",
    vocabularyUsed: ["来月", "休み", "私", "大学", "二人", "東京", "旅行", "行く", "大きい", "前", "インターネット", "ホテル", "テレビ", "パソコン", "バス", "チケット", "門", "お寺", "見る", "カメラ", "今"],
    kanjiUsed: ["来", "月", "休", "私", "大", "学", "二", "人", "東", "京", "行", "前", "門", "寺", "見", "今"],
    questions: [
      {
        id: "jpd123-q5-1",
        prompt: "筆者たちはどうしてバスで東京へ行きますか。",
        options: [
          "しんかんせんのチケットがたかいですから",
          "バスのほうがしんかんせんよりはやいからです",
          "しんかんせんがすきじゃないからです",
          "ホテルがバスていの前にあるからです"
        ],
        answer: "しんかんせんのチケットがたかいですから",
        explanation: {
          meaning: "Tại sao nhóm tác giả lại đi Tokyo bằng xe buýt? Đáp án: Vì vé tàu Shinkansen đắt.",
          reason: "Dẫn chứng câu 6:「しんかんせんのほうがはやいですが、チケットがたかいですから、私たちはよるのバスで行きます。」",
          wrongOptions: [
            { option: "バスのほうがしんかんせんよりはやいからです", reason: "Shinkansen nhanh hơn chứ không phải xe buýt." },
            { option: "しんかんせんがすきじゃないからです", reason: "Tác giả không nói ghét tàu Shinkansen." },
            { option: "ホテルがバスていの前にあるからです", reason: "Không có thông tin này trong bài." }
          ]
        }
      },
      {
        id: "jpd123-q5-2",
        prompt: "ホテルのへやに何がありますか。",
        options: [
          "テレビやパソコンがあります",
          "電子レンジとギターがあります",
          "ゲームとCDがあります",
          "テーブルとナイフだけあります"
        ],
        answer: "テレビやパソコンがあります",
        explanation: {
          meaning: "Trong phòng khách sạn có những thiết bị gì? Đáp án: Có tivi và máy tính.",
          reason: "Dẫn chứng câu 4:「ホテルのへやにテレビやパソコンがあります。」",
          wrongOptions: [
            { option: "電子レンジとギターがあります", reason: "Không có lò vi sóng hay đàn guitar." },
            { option: "ゲームとCDがあります", reason: "Không có máy chơi game hay CD." },
            { option: "テーブルとナイフだけあります", reason: "Khách sạn trang bị tivi và máy vi tính." }
          ]
        }
      },
      {
        id: "jpd123-q5-3",
        prompt: "東京で何を見たいと言っていますか。",
        options: [
          "大きい門やお寺を見たいです",
          "海と山を見たいです",
          "古い学校と大学を見たいです",
          "デパートとこうえんを見たいです"
        ],
        answer: "大きい門やお寺を見たいです",
        explanation: {
          meaning: "Tác giả nói muốn ngắm nhìn cảnh vật gì ở Tokyo? Đáp án: Cổng lớn và những ngôi chùa.",
          reason: "Dẫn chứng câu 7:「東京で大きい門やお寺を見て、カメラでしゃしんをたくさんとりたいです。」",
          wrongOptions: [
            { option: "海と山を見たいです", reason: "Tác giả không nhắc đến biển hay núi ở Tokyo." },
            { option: "古い学校と大学を見たいです", reason: "Bài không đề cập tham quan trường học." },
            { option: "デパートとこうえんを見たいです", reason: "Mục đích tham quan là cổng lớn và chùa cổ." }
          ]
        }
      },
      {
        id: "jpd123-q5-4",
        prompt: "しんかんせんとバスとどちらのほうがはやいですか。",
        options: [
          "しんかんせんのほうがはやいです",
          "バスのほうがはやいです",
          "どちらも同じ速さです",
          "タクシーより遅いです"
        ],
        answer: "しんかんせんのほうがはやいです",
        explanation: {
          meaning: "Giữa Shinkansen và xe buýt, phương tiện nào chạy nhanh hơn? Đáp án: Tàu Shinkansen nhanh hơn.",
          reason: "Dẫn chứng câu 6:「しんかんせんのほうがはやいですが…」",
          wrongOptions: [
            { option: "バスのほうがはやいです", reason: "Xe buýt chậm hơn tàu Shinkansen." },
            { option: "どちらも同じ速さです", reason: "Tốc độ hai phương tiện hoàn toàn khác nhau." },
            { option: "タクシーより遅いです", reason: "Không so sánh với taxi trong câu này." }
          ]
        }
      }
    ]
  },
  // SET 2 - Đề 6
  {
    id: "jpd123-read-6",
    course: "JPD123",
    title: "学校の日本語指導と読書",
    titleVi: "Hướng dẫn tiếng Nhật ở trường và việc đọc sách",
    theme: "Thời khóa biểu, chỉ dẫn của giáo viên, đọc sách và rèn luyện năng lực",
    content: "毎週月曜日と水曜日の午前に、私たちは日本語のじゅぎょうがあります。先生は「テキストをあけて、CDをよく聞いてください」と言いました。それから、学生たちに「大きい声で読んでください」と言って、先生はノートやパソコンに漢字を書いて、読み方を教えてくれました。じゅぎょうの後で、ルームメイトと教室でテストについて日本語でたくさん話しました。私は今週、毎日二時間べんきょうしています。日本の会社で働きたいですから、日本語の力をつけたいです。",
    sentences: [
      { jp: "毎週月曜日と水曜日の午前に、私たちは日本語のじゅぎょうがあります。", vi: "Vào sáng thứ Hai và thứ Tư hàng tuần, chúng tôi đều có giờ học tiếng Nhật.", romaji: "Maishuu getsuyoubi to suiyoubi no gozen ni, watashitachi wa nihongo no jugyou ga arimasu." },
      { jp: "先生は「テキストをあけて、CDをよく聞いてください」と言いました。", vi: "Cô giáo nói: 'Cả lớp hãy mở sách giáo trình tiếng Nhật ra và lắng nghe đĩa CD'.", romaji: "Sensei wa 'tekisuto o akete, shii-dii o yoku kiite kudasai' to iimashita." },
      { jp: "それから、学生たちに「大きい声で読んでください」と言って、先生はノートやパソコンに漢字を書いて、読み方を教えてくれました。", vi: "Tiếp đó, cô bảo: 'Hãy đọc to lên', rồi cô viết chữ Hán vào sổ và máy tính để hướng dẫn cách đọc.", romaji: "Sorekara, gakuseitachi ni 'ookii koe de yonde kudasai' to itte, sensei wa nooto ya pasokon ni kanji o kaite, yomikata o oshiete kuremashita." },
      { jp: "じゅぎょうの後で、ルームメイトと教室でテストについて日本語でたくさん話しました。", vi: "Sau giờ học, tôi cùng bạn cùng phòng đã luyện nói tiếng Nhật rất nhiều trong phòng học về bài kiểm tra.", romaji: "Jugyou no ato de, ruumumeito to kyoushitsu de tesuto ni tsuite nihongo de takusan hanashimashita." },
      { jp: "私は今週、毎日二時間べんきょうしています。", vi: "Tuần này ngày nào tôi cũng học đều 2 tiếng.", romaji: "Watashi wa konshuu, mainichi ni-jikan benkyou shite imasu." },
      { jp: "日本の会社で働きたいですから、日本語の力をつけたいです。", vi: "Vì muốn làm việc ở công ty Nhật nên tôi muốn nâng cao năng lực tiếng Nhật.", romaji: "Nihon no kaisha de hatarakitai desu kara, nihongo no chikara o tsuketai desu." }
    ],
    translation: "Mỗi sáng thứ Hai và thứ Tư hàng tuần, chúng tôi đều có giờ học tiếng Nhật. Cô giáo bước vào lớp và nhẹ nhàng dặn: 'Cả lớp hãy mở sách giáo khoa tiếng Nhật và chú ý lắng nghe đĩa CD nhé'. Tiếp đó, cô yêu cầu các bạn đọc to dõng dạc từng câu, rồi nắn nót viết chữ Hán lên cuốn sổ lớn và hướng dẫn tỉ mỉ cách phát âm chuẩn xác. Sau tiết học kết thúc, sinh viên chúng tôi cùng ở lại phòng học luyện giao tiếp bằng tiếng Nhật. Tuần này ngày nào tôi cũng tự ôn tập đủ 2 tiếng. Vì tương lai muốn được làm việc tại một công ty Nhật Bản, tôi nỗ lực rèn luyện để nâng cao năng lực tiếng Nhật.",
    romaji: "Maishuu getsuyoubi to suiyoubi no gozen ni, watashitachi wa nihongo no jugyou ga arimasu. Sensei wa 'nihongo no hon o akete, shii-dii o yoku kiite kudasai' to iimashita. Sorekara, gakuseitachi ni 'ookii koe de yonde kudasai' to itte, sensei wa nooto ni kanji o kaite, yomikata o oshiete kuremashita. Jugyou no ato de, gakuseitachi wa kyoushitsu de nihongo de takusan hanashimashita. Watashi wa konshuu, mainichi ni-jikan benkyou shite imasu. Nihon no kaisha de hatarakitai desu kara, nihongo no chikara o tsuketai desu.",
    vocabularyUsed: ["毎週", "月曜日", "水曜日", "午前", "日本語", "先生", "本", "CD", "聞く", "言う", "大きい", "読む", "書く", "後", "話す", "今週", "毎日", "二時間", "会社", "力"],
    kanjiUsed: ["毎", "週", "月", "曜", "日", "水", "午", "前", "私", "本", "語", "先", "生", "聞", "言", "大", "読", "書", "後", "学", "話", "今", "二", "時", "間", "会", "社", "力"],
    questions: [
      {
        id: "jpd123-q6-1",
        prompt: "日本語のじゅぎょうはいつありますか。",
        options: [
          "毎週月曜日と水曜日の午前です",
          "毎週火曜日と木曜日の午後です",
          "土曜日と日曜日だけです",
          "毎日の午後です"
        ],
        answer: "毎週月曜日と水曜日の午前です",
        explanation: {
          meaning: "Giờ học tiếng Nhật diễn ra vào lúc nào? Đáp án: Sáng thứ Hai và thứ Tư hàng tuần.",
          reason: "Dẫn chứng câu 1:「毎週月曜日と水曜日の午前に、私たちは日本語のじゅぎょうがあります。」",
          wrongOptions: [
            { option: "毎週火曜日と木曜日の午後です", reason: "Sai thứ và buổi." },
            { option: "土曜日と日曜日だけです", reason: "Cuối tuần không có tiết học." },
            { option: "毎日の午後です", reason: "Chỉ học sáng thứ 2 và thứ 4." }
          ]
        }
      },
      {
        id: "jpd123-q6-2",
        prompt: "先生は学生たちにどんな声で読んでくださいと言いましたか。",
        options: [
          "「大きい声で読んでください」と言いました",
          "「小さい声で読んでください」と言いました",
          "「読まないでください」と言いました",
          "「早く読んでください」と言いました"
        ],
        answer: "「大きい声で読んでください」と言いました",
        explanation: {
          meaning: "Giáo viên đã dặn học sinh đọc bằng giọng như thế nào? Đáp án: 'Hãy đọc to lên'.",
          reason: "Dẫn chứng câu 3:「学生たちに「大きい声で読んでください」と言って…」",
          wrongOptions: [
            { option: "「小さい声で読んでください」と言いました", reason: "Cô dặn đọc to chứ không đọc nhỏ." },
            { option: "「読まないでください」と言いました", reason: "Cô yêu cầu luyện đọc." },
            { option: "「早く読んでください」と言いました", reason: "Cô dặn đọc to dõng dạc (大きい声)." }
          ]
        }
      },
      {
        id: "jpd123-q6-3",
        prompt: "筆者は今週、毎日何時間べんきょうしていますか。",
        options: [
          "毎日二時間べんきょうしています",
          "毎日一時間べんきょうしています",
          "毎日四時間べんきょうしています",
          "全然勉強していません"
        ],
        answer: "毎日二時間べんきょうしています",
        explanation: {
          meaning: "Tuần này mỗi ngày tác giả học mấy tiếng? Đáp án: Học 2 tiếng mỗi ngày.",
          reason: "Dẫn chứng câu 5:「私は今週、毎日二時間べんきょうしています。」",
          wrongOptions: [
            { option: "毎日一時間べんきょうしています", reason: "Thiếu 1 tiếng." },
            { option: "毎日四時間べんきょうしています", reason: "Nhiều hơn thông tin bài đọc." },
            { option: "全然勉強していません", reason: "Tác giả học tập rất chăm chỉ." }
          ]
        }
      },
      {
        id: "jpd123-q6-4",
        prompt: "どうして日本の会社で働きたいですか。",
        options: [
          "将来、日本語の力をいかして仕事がしたいからです",
          "日本へ買い物に行きたいからです",
          "日本の食べ物がきらいだからです",
          "会社が大学の近くにあるからです"
        ],
        answer: "将来、日本語の力をいかして仕事がしたいからです",
        explanation: {
          meaning: "Tại sao tác giả muốn làm việc ở công ty Nhật? Đáp án: Vì muốn rèn luyện và phát huy năng lực tiếng Nhật trong công việc.",
          reason: "Dẫn chứng câu kết bài:「日本の会社で働きたいですから、日本語の力をつけたいです。」",
          wrongOptions: [
            { option: "日本へ買い物に行きたいからです", reason: "Mục tiêu là nghề nghiệp và năng lực." },
            { option: "日本の食べ物がきらいだからです", reason: "Không liên quan ẩm thực." },
            { option: "会社が大学の近くにあるからです", reason: "Không có thông tin này trong bài." }
          ]
        }
      }
    ]
  },
  // SET 2 - Đề 7
  {
    id: "jpd123-read-7",
    course: "JPD123",
    title: "アパートでの料理作りと週末の食事",
    titleVi: "Nấu ăn tại căn hộ và bữa ăn cuối tuần",
    theme: "Nấu ăn, so sánh giá cả siêu thị vs cửa hàng tiện lợi, dụng cụ ăn uống",
    content: "今週の日曜日に、アパートでともだちと日本料理のパーティーをしました。午前十時に本田さんとスーパーへ行って、とり肉やさかなや野さいを買いました。ぜんぶで五千五百円でした。スーパーの食べ物はコンビニの食べ物よりやすいです。アパートに帰ってから、みんなで料理をつくりました。スプーンやフォークなどの食事の道具をつかって、大きいテーブルでスープとサラダを食べました。小さいコップでお茶やコーヒーを飲んで、午後四時半まで楽しく話しました。",
    sentences: [
      { jp: "今週の日曜日に、アパートでともだちと日本料理のパーティーをしました。", vi: "Chủ nhật tuần này, tôi đã tổ chức bữa tiệc ẩm thực Nhật Bản cùng bạn bè tại căn hộ.", romaji: "Konshuu no nichiyoubi ni, apaato de tomodachi to nihon ryouri no paatii o shimashita." },
      { jp: "午前十時に本田さんとスーパーへ行って、とり肉やさかなや野さいを買いました。", vi: "Lúc 10 giờ sáng, tôi cùng bạn Honda đi siêu thị mua thịt gà, cá và rau củ.", romaji: "Gozen juu-ji ni Honda-san to suupaa e itte, toriniku ya sakana ya yasai o kaimashita." },
      { jp: "ぜんぶで五千五百円でした。", vi: "Tổng cộng hết 5.500 yên.", romaji: "Zenbu de gosen gohyaku-en deshita." },
      { jp: "スーパーの食べ物はコンビニの食べ物よりやすいです。", vi: "Thực phẩm ở siêu thị rẻ hơn thực phẩm ở cửa hàng tiện lợi.", romaji: "Suupaa no tabemono wa konbini no tabemono yori yasui desu." },
      { jp: "アパートに帰ってから、みんなで料理をつくりました。", vi: "Sau khi về căn hộ, mọi người cùng nhau nấu nướng.", romaji: "Apaato ni kaette kara, minna de ryouri o tsukurimashita." },
      { jp: "スプーンやフォークなどの食事の道具をつかって、大きいテーブルでスープ và サラダを食べました。", vi: "Dùng các dụng cụ ăn uống như thìa và nĩa, chúng tôi ăn súp và sa lát ở chiếc bàn lớn.", romaji: "Supuun ya fooku nado no shokuji no dougu o tsukatte, ookii teeburu de suupu to sarada o tabemashita." },
      { jp: "小さいコップでお茶やコーヒーを飲んで、午後四時半まで楽しく話しました。", vi: "Chúng tôi uống trà và cà phê bằng chiếc cốc nhỏ, rồi trò chuyện vui vẻ đến 4 giờ rưỡi chiều.", romaji: "Chiisai koppu de ocha ya koohii o nonde, gogo yo-jihan made tanoshiku hanashimashita." }
    ],
    translation: "Chủ nhật tuần này, tôi tổ chức một bữa tiệc nấu các món ăn Nhật cùng bạn bè tại căn hộ của mình. Vào lúc 10 giờ sáng, tôi cùng Honda đi siêu thị mua thịt gà tươi, cá và rau củ. Tổng chi phí mua sắm hết 5.500 yên, đồ ăn ở siêu thị rẻ hơn nhiều so với mua ở cửa hàng tiện lợi. Về tới căn hộ, cả nhóm bắt tay vào nấu nướng. Chúng tôi dùng thìa và nĩa thưởng thức súp cùng sa lát trên chiếc bàn lớn. Sau bữa ăn, mọi người dùng cốc nhỏ nhâm nhi trà và cà phê, trò chuyện rôm rả đến tận 4 giờ rưỡi chiều.",
    romaji: "Konshuu no nichiyoubi ni, apaato de tomodachi to nihon ryouri no paatii o shimashita. Gozen juu-ji ni Honda-san to suupaa e itte, toriniku ya sakana ya yasai o kaimashita. Zenbu de gosen gohyaku-en deshita. Suupaa no tabemono wa konbini no tabemono yori yasui desu. Apaato ni kaette kara, minna de ryouri o tsukurimashita. Supuun ya fooku nado no shokuji no dougu o tsukatte, ookii teeburu de suupu to sarada o tabemashita. Chiisai koppu de ocha ya koohii o nonde, gogo yo-jihan made tanoshiku hanashimashita.",
    vocabularyUsed: ["今週", "日曜日", "アパート", "日本料理", "パーティー", "午前", "十時", "スーパー", "とり肉", "野菜", "買う", "五千五百円", "食べ物", "コンビニ", "帰る", "料理", "スプーン", "フォーク", "道具", "大きい", "テーブル", "スープ", "サラダ", "食べる", "小さい", "コップ", "お茶", "コーヒー", "飲む", "午後", "四時半", "話す"],
    kanjiUsed: ["今", "週", "日", "曜", "本", "田", "行", "肉", "野", "買", "五", "千", "百", "円", "食", "物", "帰", "料", "理", "具", "大", "小", "飲", "午", "後", "四", "時", "半", "話"],
    questions: [
      {
        id: "jpd123-q7-1",
        prompt: "スーパーでぜんぶでいくら買い物しましたか。",
        options: ["五千五百円でした", "五千円でした", "六千五百円でした", "四千五百円でした"],
        answer: "五千五百円でした",
        explanation: {
          meaning: "Đã mua sắm hết tổng cộng bao nhiêu tiền ở siêu thị? Đáp án: 5.500 yên (五千五百円).",
          reason: "Dẫn chứng câu 3:「ぜんぶで五千五百円でした。」",
          wrongOptions: [
            { option: "五千円でした", reason: "Thiếu 500 yên." },
            { option: "六千五百円でした", reason: "Nhiều hơn 1.000 yên." },
            { option: "四千五百円でした", reason: "Ít hơn 1.000 yên." }
          ]
        }
      },
      {
        id: "jpd123-q7-2",
        prompt: "スーパーとコンビニの食べ物はどちらがやすいですか。",
        options: [
          "スーパーの食べ物のほうがやすいです",
          "コンビニの食べ物のほうがやすいです",
          "どちらも同じ値段です",
          "コンビニのほうがずっと安いです"
        ],
        answer: "スーパーの食べ物のほうがやすいです",
        explanation: {
          meaning: "Thực phẩm ở siêu thị hay cửa hàng tiện lợi rẻ hơn? Đáp án: Thực phẩm ở siêu thị rẻ hơn.",
          reason: "Dẫn chứng câu 4:「スーパーの食べ物はコンビニの食べ物よりやすいです。」",
          wrongOptions: [
            { option: "コンビニの食べ物のほうがやすいです", reason: "Ngược với thông tin trong bài." },
            { option: "どちらも同じ値段です", reason: "Giá cả ở siêu thị rẻ hơn." },
            { option: "コンビニのほうがずっと安いです", reason: "Sai hoàn toàn." }
          ]
        }
      },
      {
        id: "jpd123-q7-3",
        prompt: "食事の時にどんな道具をつかいましたか。",
        options: [
          "スプーンやフォークをつかいました",
          "ハシだけをつかいました",
          "ナイフだけをつかいました",
          "手だけで食べました"
        ],
        answer: "スプーンやフォークをつかいました",
        explanation: {
          meaning: "Khi dùng bữa họ đã dùng những dụng cụ nào? Đáp án: Thìa và nĩa.",
          reason: "Dẫn chứng câu 6:「スプーンやフォークなどの食事の道具をつかって…」",
          wrongOptions: [
            { option: "ハシだけをつかいました", reason: "Bài nêu rõ dùng thìa và nĩa." },
            { option: "ナイフだけをつかいました", reason: "Bài không dùng dao cắt thịt ở bàn này." },
            { option: "手だけで食べました", reason: "Họ dùng dụng cụ ăn uống lịch sự." }
          ]
        }
      },
      {
        id: "jpd123-q7-4",
        prompt: "小さいコップで何を飲みましたか。",
        options: [
          "お茶やコーヒーを飲みました",
          "ビールやワインを飲みました",
          "ジュースと水を飲みました",
          "冷たいミルクを飲みました"
        ],
        answer: "お茶やコーヒーを飲みました",
        explanation: {
          meaning: "Họ đã dùng chiếc cốc nhỏ để uống thức uống gì? Đáp án: Trà và cà phê.",
          reason: "Dẫn chứng câu 7:「小さいコップでお茶やコーヒーを飲んで…」",
          wrongOptions: [
            { option: "ビールやワインを飲みました", reason: "Bài không nhắc đến đồ uống có cồn." },
            { option: "ジュースと水を飲みました", reason: "Họ uống trà và cà phê." },
            { option: "冷たいミルクを飲みました", reason: "Không có sữa trong bài đọc." }
          ]
        }
      }
    ]
  },
  // SET 2 - Đề 8
  {
    id: "jpd123-read-8",
    course: "JPD123",
    title: "ダナン市の音楽コンサートと約束",
    titleVi: "Buổi hòa nhạc ở thành phố Đà Nẵng và cuộc hẹn",
    theme: "Sự kiện âm nhạc ở trung tâm, rủ rê bạn bè, từ chối khéo và đông vui",
    content: "来週の土曜日のよる、ダナン市の大きい区でおんがくのコンサートがあります。私の国でもゆう名なジャズのコンサートです。チケットを二まい買って、本田さんに「いっしょに行きませんか」と聞きました。でも、本田さんは「土曜日はちょっと…アルバイトがありますから」と言いました。本田さんは前のレストランで毎週はたらいています。ざんねんですが、私は一人で行きます。ホールの前には男の人も女の人もたくさんあつまって、とてもにぎやかでした。私の名前を書いたメモをわたしました。",
    sentences: [
      { jp: "来週の土曜日のよる、ダナン市の大きい区でおんがくのコンサートがあります。", vi: "Tối thứ Bảy tuần tới, ở một quận lớn thuộc thành phố Đà Nẵng sẽ có buổi hòa nhạc.", romaji: "Raishuu no doyoubi no yoru, Danan-shi no ookii ku de ongaku no konsaato ga arimasu." },
      { jp: "私の国でもゆう名なジャズのコンサートです。", vi: "Đó là buổi biểu diễn nhạc Jazz nổi tiếng ngay cả ở đất nước tôi.", romaji: "Watashi no kuni demo yuumeina jazu no konsaato desu." },
      { jp: "チケットを二まい買って、本田さんに「いっしょに行きませんか」と聞きました。", vi: "Tôi đã mua hai chiếc vé rồi hỏi bạn Honda: 'Cậu cùng đi với mình nhé?'.", romaji: "Chiketto o nimai katte, Honda-san ni 'issho ni ikimasen ka' to kikimashita." },
      { jp: "でも、本田さんは「土曜日はちょっと…アルバイトがありますから」と言いました。", vi: "Nhưng Honda đáp: 'Thứ Bảy thì hơi kẹt... vì tớ có ca đi làm thêm'.", romaji: "Demo, Honda-san wa 'doyoubi wa chotto... arubaito ga arimasu kara' to iimashita." },
      { jp: "本田さんは前のレストランで毎週はたらいています。", vi: "Honda đang làm thêm đều đặn hàng tuần ở nhà hàng phía trước.", romaji: "Honda-san wa mae no resutoran de maishuu hataraite imasu." },
      { jp: "ざんねんですが、私は一人で行きます。", vi: "Tiếc thật, nhưng tôi sẽ đi một mình.", romaji: "Zannen desu ga, watashi wa hitori de ikimasu." },
      { jp: "ホールの前には男の人も女の人もたくさんあつまって、とてもにぎやかでした。", vi: "Phía trước khán phòng, cả nam và nữ tập trung lại rất đông, không khí vô cùng náo nhiệt.", romaji: "Hooru no mae ni wa otoko no hito mo onna no hito mo takusan atsumatte, totemo nigiyaka deshita." },
      { jp: "私の名前を書いたメモをわたしました。", vi: "Tôi đã đưa tờ giấy ghi tên mình cho ban tổ chức.", romaji: "Watashi no namae o kaita memo o watashimashita." }
    ],
    translation: "Tối thứ Bảy tuần sau, tại một quận lớn của thành phố Đà Nẵng sẽ diễn ra một buổi hòa nhạc quy mô lớn. Đây là đêm nhạc Jazz rất nổi tiếng ngay tại quê hương tôi. Sau khi mua hai tấm vé, tôi hồ hởi hỏi Honda: 'Cậu có muốn cùng đi xem với mình không?'. Thế nhưng Honda đã khéo léo từ chối: 'Thứ Bảy này thì hơi kẹt cho mình rồi... vì mình vướng ca làm thêm'. Bạn ấy đang làm thêm cố định vào mỗi tuần tại nhà hàng gần đó. Tuy hơi tiếc nhưng tôi vẫn quyết định đi một mình. Phía trước hội trường, rất đông đảo khán giả cả nam lẫn nữ tập trung đông đúc, náo nhiệt. Tôi đã đưa mảnh giấy ghi tên mình vào quầy đăng ký tham dự.",
    romaji: "Raishuu no doyoubi no yoru, Danan-shi no ookii ku de ongaku no konsaato ga arimasu. Watashi no kuni demo yuumeina jazu no konsaato desu. Chiketto o nimai katte, Honda-san ni 'issho ni ikimasen ka' to kikimashita. Demo, Honda-san wa 'doyoubi wa chotto... arubaito ga arimasu kara' to iimashita. Honda-san wa mae no resutoran de maishuu hataraite imasu. Zannen desu ga, watashi wa hitori de ikimasu. Hooru no mae ni wa otoko no hito mo onna no hito mo takusan atsumatte, totemo nigiyaka deshita. Watashi no namae o kaita memo o watashimashita.",
    vocabularyUsed: ["来週", "土曜日", "市", "区", "大きい", "コンサート", "私", "国", "ジャズ", "チケット", "二枚", "買う", "行く", "聞く", "アルバイト", "言う", "前", "レストラン", "毎週", "一人", "男の人", "女の人", "名前", "書く"],
    kanjiUsed: ["来", "週", "土", "曜", "日", "市", "区", "大", "私", "国", "名", "買", "本", "田", "行", "聞", "言", "前", "毎", "一", "人", "男", "女", "書"],
    questions: [
      {
        id: "jpd123-q8-1",
        prompt: "コンサートはどこでありますか。",
        options: [
          "ダナン市の大きい区であります",
          "東京の小さいホテルであります",
          "大学の図書館であります",
          "駅の中のカフェであります"
        ],
        answer: "ダナン市の大きい区であります",
        explanation: {
          meaning: "Buổi hòa nhạc diễn ra ở đâu? Đáp án: Tại một quận lớn thuộc thành phố Đà Nẵng.",
          reason: "Dẫn chứng câu 1:「ダナン市の大きい区でおんがくのコンサートがあります。」",
          wrongOptions: [
            { option: "東京の小さいホテルであります", reason: "Không diễn ra ở khách sạn Tokyo." },
            { option: "大学の図書館であります", reason: "Không diễn ra ở thư viện trường." },
            { option: "駅の中のカフェであります", reason: "Không phải quán cà phê trong nhà ga." }
          ]
        }
      },
      {
        id: "jpd123-q8-2",
        prompt: "本田さんはどうしてコンサートへ行きませんか。",
        options: [
          "アルバイトの予定があるからです",
          "ジャズのおんがくがきらいだからです",
          "チケットがたかいからです",
          "病気で病院へ行くからです"
        ],
        answer: "アルバイトの予定があるからです",
        explanation: {
          meaning: "Tại sao Honda không đi nghe hòa nhạc? Đáp án: Vì bạn có lịch đi làm thêm.",
          reason: "Dẫn chứng câu 4:「土曜日はちょっと…アルバイトがありますから」",
          wrongOptions: [
            { option: "ジャズのおんがくがきらいだからです", reason: "Honda không nói ghét nhạc Jazz." },
            { option: "チケットがたかいからです", reason: "Tác giả đã mua sẵn cả 2 vé rồi." },
            { option: "病気で病院へ行くからです", reason: "Honda hoàn toàn khỏe mạnh đi làm việc." }
          ]
        }
      },
      {
        id: "jpd123-q8-3",
        prompt: "ホールの前にはだれがたくさんあつまりましたか。",
        options: [
          "男の人も女の人もたくさんあつまりました",
          "小さい子どもだけが集まりました",
          "先生たちだけが集まりました",
          "だれも集まりませんでした"
        ],
        answer: "男の人も女の人もたくさんあつまりました",
        explanation: {
          meaning: "Trước hội trường có những ai tập trung lại đông đúc? Đáp án: Cả nam giới và nữ giới.",
          reason: "Dẫn chứng câu 7:「ホールの前には男の人も女の人もたくさんあつまって、とてもにぎやかでした。」",
          wrongOptions: [
            { option: "小さい子どもだけが集まりました", reason: "Không chỉ có trẻ nhỏ." },
            { option: "先生たちだけが集まりました", reason: "Không phải chỉ có các thầy cô." },
            { option: "だれも集まりませんでした", reason: "Rất đông người đến xem hòa nhạc." }
          ]
        }
      },
      {
        id: "jpd123-q8-4",
        prompt: "筆者はホールで何をわたしましたか。",
        options: [
          "私の名前を書いたメモをわたしました",
          "新しい本を渡しました",
          "お金と財布を渡しました",
          "カメラと写真を渡しました"
        ],
        answer: "私の名前を書いたメモをわたしました",
        explanation: {
          meaning: "Tác giả đã đưa cái gì tại hội trường? Đáp án: Tờ giấy ghi tên của mình.",
          reason: "Dẫn chứng câu 8:「私の名前を書いたメモをわたしました。」",
          wrongOptions: [
            { option: "新しい本を渡しました", reason: "Không đưa sách mới." },
            { option: "お金と財布を渡しました", reason: "Không đưa tiền hay ví." },
            { option: "カメラと写真を渡しました", reason: "Không đưa máy ảnh." }
          ]
        }
      }
    ]
  }
];

export const READING_PASSAGES_JPD113: ReadingPassage[] = RAW_PASSAGES_JPD113.map((p) =>
  sanitizePassage(p, [1, 2, 3]),
);

export const READING_PASSAGES_JPD123: ReadingPassage[] = RAW_PASSAGES_JPD123.map((p) =>
  sanitizePassage(p, [1, 2, 3, 4, 5, 6, 7]),
);

function createExamSet(
  id: string,
  course: ReadingCourse,
  title: string,
  titleVi: string,
  passages: ReadingPassage[],
): ReadingPassageSet {
  const coverage = computePassageSetKanjiCoverage(passages, course);
  return {
    id,
    course,
    title,
    titleVi,
    passages,
    coveredKanji: coverage.coveredKanji,
    targetKanjiCount: coverage.targetKanjiCount,
    coveragePercentage: coverage.coveragePercentage,
    isCompleteCoverage: coverage.isCompleteCoverage,
  };
}

export const READING_EXAM_SETS_JPD113: ReadingPassageSet[] = [
  createExamSet(
    "jpd113-set-1",
    "JPD113",
    "JPD113 読解問題セット 1",
    "Bộ đề 1: Đời sống học tập & sinh hoạt sinh viên",
    READING_PASSAGES_JPD113.slice(0, 4),
  ),
];

export const READING_EXAM_SETS_JPD123: ReadingPassageSet[] = [
  createExamSet(
    "jpd123-set-1",
    "JPD123",
    "JPD123 読解問題セット 1（第4課〜第7課の漢字全網羅）",
    "Bộ đề 1: Đời sống, du lịch và giao tiếp FPT (Phủ 100% 43 Kanji Bài 4–7)",
    READING_PASSAGES_JPD123.slice(0, 4),
  ),
  createExamSet(
    "jpd123-set-2",
    "JPD123",
    "JPD123 読解問題セット 2（第4課〜第7課の漢字全網羅）",
    "Bộ đề 2: Khám phá Tokyo, sự kiện và ẩm thực Nhật (Phủ 100% 43 Kanji Bài 4–7)",
    READING_PASSAGES_JPD123.slice(4, 8),
  ),
];
