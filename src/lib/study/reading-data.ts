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
,
  // JPD113-READ-5
  {
    "id": "jpd113-read-5",
    "course": "JPD113",
    "title": "学校の日本語のクラス",
    "titleVi": "Lớp học tiếng Nhật tại trường học",
    "theme": "Trường học, số người, tuổi tác và lịch học buổi sáng",
    "content": "ここは私たちの学校です。教室に学生が七人います。九月からの新しいベトナム人と日本人の学生です。先生は日本人で、木村先生です。木村先生は三十五才です。毎日何時から何時まで勉強しますか。一時間目は午前八時半からです。日本語の授業はとても面白いです。",
    "sentences": [
      {
        "jp": "ここは私たちの学校です。",
        "vi": "Đây là trường học của chúng tôi.",
        "romaji": "Koko wa watashitachi no gakkou desu."
      },
      {
        "jp": "教室に学生が七人います。",
        "vi": "Trong lớp học có 7 bạn sinh viên.",
        "romaji": "Kyoushitsu ni gakusei ga shichinin imasu."
      },
      {
        "jp": "九月からの新しいベトナム人と日本人の学生です。",
        "vi": "Đó là những sinh viên người Việt Nam và Nhật Bản nhập học từ tháng 9.",
        "romaji": "Kugatsu kara no atarashii Betonamujin to Nihonjin no gakusei desu."
      },
      {
        "jp": "先生は日本人で、木村先生です。",
        "vi": "Giáo viên là người Nhật, thầy Kimura.",
        "romaji": "Sensei wa Nihonjin de, Kimura-sensei desu."
      },
      {
        "jp": "木村先生は三十五才です。",
        "vi": "Thầy Kimura 35 tuổi.",
        "romaji": "Kimura-sensei wa sanjuugo-sai desu."
      },
      {
        "jp": "毎日何時から何時まで勉強しますか。",
        "vi": "Mỗi ngày học từ mấy giờ đến mấy giờ?",
        "romaji": "Mainichi nan-ji kara nan-ji made benkyou shimasu ka."
      },
      {
        "jp": "一時間目は午前八時半からです。",
        "vi": "Tiết học thứ nhất bắt đầu từ 8 giờ rưỡi sáng.",
        "romaji": "Ichi-jikanme wa gozen hachi-jihan kara desu."
      },
      {
        "jp": "日本語の授業はとても面白いです。",
        "vi": "Giờ học tiếng Nhật rất thú vị.",
        "romaji": "Nihongo no jugyou wa totemo omoshiroi desu."
      }
    ],
    "translation": "Đây là trường học của chúng tôi. Trong phòng học hiện có 7 bạn học sinh, gồm cả các bạn người Việt Nam và người Nhật nhập học từ tháng 9. Giáo viên phụ trách là thầy Kimura, người Nhật Bản. Năm nay thầy 35 tuổi. Lớp học bắt đầu từ mấy giờ đến mấy giờ mỗi ngày? Tiết thứ nhất bắt đầu lúc 8 giờ rưỡi sáng. Giờ học tiếng Nhật vô cùng hấp dẫn và vui vẻ.",
    "romaji": "Koko wa watashitachi no gakkou desu. Kyoushitsu ni gakusei ga shichinin imasu. Kugatsu kara no atarashii Betonamujin to Nihonjin no gakusei desu. Sensei wa Nihonjin de, Kimura-sensei desu. Kimura-sensei wa sanjuugo-sai desu. Mainichi nan-ji kara nan-ji made benkyou shimasu ka. Ichi-jikanme wa gozen hachi-jihan kara desu. Nihongo no jugyou wa totemo omoshiroi desu.",
    "vocabularyUsed": [
      "ここ",
      "私",
      "学校",
      "教室",
      "学生",
      "七人",
      "九月",
      "人",
      "先生",
      "三十五才",
      "毎日",
      "何時",
      "勉強",
      "一時間",
      "午前",
      "八時半",
      "日本語",
      "授業",
      "面白い"
    ],
    "kanjiUsed": [
      "私",
      "学",
      "校",
      "生",
      "七",
      "人",
      "九",
      "月",
      "日",
      "本",
      "木",
      "才",
      "毎",
      "何",
      "時",
      "一",
      "間",
      "午",
      "八",
      "半",
      "語"
    ],
    "questions": [
      {
        "id": "jpd113-q5-1",
        "prompt": "教室に学生が何人いますか。",
        "options": [
          "七人います",
          "五人います",
          "九人います",
          "十人います"
        ],
        "answer": "七人います",
        "explanation": {
          "meaning": "Trong lớp học có bao nhiêu học sinh? Đáp án: 7 người.",
          "reason": "Dẫn chứng câu 2:「教室に学生が七人います。」",
          "wrongOptions": [
            {
              "option": "五人います",
              "reason": "Bài nêu rõ có 7 người."
            },
            {
              "option": "九人います",
              "reason": "Tháng 9 (九月) là thời điểm nhập học, không phải số học sinh."
            },
            {
              "option": "十人います",
              "reason": "Không có 10 người."
            }
          ]
        }
      },
      {
        "id": "jpd113-q5-2",
        "prompt": "先生の名前は何ですか。",
        "options": [
          "木村先生です",
          "田中先生です",
          "山田先生です",
          "佐藤先生です"
        ],
        "answer": "木村先生です",
        "explanation": {
          "meaning": "Tên của giáo viên là gì? Đáp án: Thầy Kimura.",
          "reason": "Dẫn chứng câu 4:「先生は日本人で、木村先生です。」",
          "wrongOptions": [
            {
              "option": "田中先生です",
              "reason": "Thầy tên là Kimura (木村)."
            },
            {
              "option": "山田先生です",
              "reason": "Sai tên giáo viên."
            },
            {
              "option": "佐藤先生です",
              "reason": "Sai tên giáo viên."
            }
          ]
        }
      },
      {
        "id": "jpd113-q5-3",
        "prompt": "木村先生は何才ですか。",
        "options": [
          "三十五才です",
          "二十才です",
          "四十才です",
          "三十才です"
        ],
        "answer": "三十五才です",
        "explanation": {
          "meaning": "Thầy Kimura bao nhiêu tuổi? Đáp án: 35 tuổi.",
          "reason": "Dẫn chứng câu 5:「木村先生は三十五才です。」",
          "wrongOptions": [
            {
              "option": "二十才です",
              "reason": "Thầy 35 tuổi (三十五才)."
            },
            {
              "option": "四十才です",
              "reason": "Sai số tuổi."
            },
            {
              "option": "三十才です",
              "reason": "Sai số tuổi."
            }
          ]
        }
      },
      {
        "id": "jpd113-q5-4",
        "prompt": "一時間目は午前何時から始まりますか。",
        "options": [
          "午前八時半からです",
          "午前九時からです",
          "午前七時半からです",
          "午前十時からです"
        ],
        "answer": "午前八時半からです",
        "explanation": {
          "meaning": "Tiết thứ nhất bắt đầu từ mấy giờ sáng? Đáp án: Từ 8 giờ rưỡi.",
          "reason": "Dẫn chứng câu 7:「一時間目は午前八時半からです。」",
          "wrongOptions": [
            {
              "option": "午前九時からです",
              "reason": "Tiết một bắt đầu lúc 8:30 sáng."
            },
            {
              "option": "午前七時半からです",
              "reason": "Không bắt đầu lúc 7:30."
            },
            {
              "option": "午前十時からです",
              "reason": "Không bắt đầu lúc 10:00."
            }
          ]
        }
      }
    ]
  },
  // JPD113-READ-6
  {
    "id": "jpd113-read-6",
    "course": "JPD113",
    "title": "寮の生活と時間",
    "titleVi": "Đời sống ở ký túc xá và thời gian",
    "theme": "Phòng ở, thời gian biểu hàng ngày, thức dậy và đi bộ",
    "content": "私の部屋は三階の三〇二号室です。部屋に机と椅子と本棚があります。毎朝六時半に起きます。午前八時から十二時半（三十分）まで学校で勉強します。学校から寮まで歩いて十五分です。午後は図書館で本を読みます。",
    "sentences": [
      {
        "jp": "私の部屋は三階の三〇二号室です。",
        "vi": "Phòng của tôi là phòng 302 ở tầng 3.",
        "romaji": "Watashi no heya wa sangai no san-maru-ni-goushitsu desu."
      },
      {
        "jp": "部屋に机と椅子と本棚があります。",
        "vi": "Trong phòng có bàn, ghế và giá sách.",
        "romaji": "Heya ni tsukue to isu to hondana ga arimasu."
      },
      {
        "jp": "毎朝六時半に起きます。",
        "vi": "Mỗi sáng tôi thức dậy lúc 6 giờ rưỡi.",
        "romaji": "Maiasa roku-jihan ni okimasu."
      },
      {
        "jp": "午前八時から十二時半（三十分）まで学校で勉強します。",
        "vi": "Từ 8 giờ sáng đến 12 giờ rưỡi (30 phút) tôi học ở trường.",
        "romaji": "Gozen hachi-ji kara juuni-jihan (sanjuppun) made gakkou de benkyou shimasu."
      },
      {
        "jp": "学校から寮まで歩いて十五分です。",
        "vi": "Từ trường về ký túc xá đi bộ mất 15 phút.",
        "romaji": "Gakkou kara ryou made aruite juugo-fun desu."
      },
      {
        "jp": "午後は図書館で本を読みます。",
        "vi": "Buổi chiều tôi đọc sách ở thư viện.",
        "romaji": "Gogo wa toshokan de hon o yomimasu."
      }
    ],
    "translation": "Căn phòng ký túc xá của tôi là phòng 302 ở tầng 3. Trong phòng trang bị bàn học, ghế tựa và giá sách. Mỗi sáng tôi đều thức dậy lúc 6 giờ rưỡi. Từ 8 giờ sáng đến 12 giờ rưỡi trưa (30 phút), tôi học các tiết tại trường. Từ trường về lại ký túc xá đi bộ mất đúng 15 phút. Buổi chiều tôi thường ghé thư viện để đọc thêm sách.",
    "romaji": "Watashi no heya wa sangai no san-maru-ni-goushitsu desu. Heya ni tsukue to isu to hondana ga arimasu. Maiasa roku-jihan ni okimasu. Gozen hachi-ji kara juuni-jihan (sanjuppun) made gakkou de benkyou shimasu. Gakkou kara ryou made aruite juugo-fun desu. Gogo wa toshokan de hon o yomimasu.",
    "vocabularyUsed": [
      "私",
      "部屋",
      "三階",
      "毎朝",
      "六時半",
      "起きる",
      "午前",
      "八時",
      "十二時半",
      "三十分",
      "学校",
      "勉強",
      "寮",
      "歩いて",
      "十五分",
      "午後",
      "図書館",
      "本",
      "読む"
    ],
    "kanjiUsed": [
      "私",
      "三",
      "階",
      "毎",
      "朝",
      "六",
      "時",
      "半",
      "午",
      "前",
      "八",
      "十",
      "二",
      "分",
      "学",
      "校",
      "後",
      "本",
      "読"
    ],
    "questions": [
      {
        "id": "jpd113-q6-1",
        "prompt": "筆者の部屋は何階ですか。",
        "options": [
          "三階です",
          "一階です",
          "二階です",
          "四階です"
        ],
        "answer": "三階です",
        "explanation": {
          "meaning": "Phòng của tác giả ở tầng mấy? Đáp án: Tầng 3.",
          "reason": "Dẫn chứng câu 1:「私の部屋は三階の三〇二号室です。」",
          "wrongOptions": [
            {
              "option": "一階です",
              "reason": "Phòng ở tầng 3."
            },
            {
              "option": "二階です",
              "reason": "Sai tầng."
            },
            {
              "option": "四階です",
              "reason": "Sai tầng."
            }
          ]
        }
      },
      {
        "id": "jpd113-q6-2",
        "prompt": "毎朝何時に起きますか。",
        "options": [
          "六時半に起きます",
          "七時に起きます",
          "八時に起きます",
          "六時に起きます"
        ],
        "answer": "六時半に起きます",
        "explanation": {
          "meaning": "Mỗi sáng tác giả thức dậy lúc mấy giờ? Đáp án: 6 giờ rưỡi.",
          "reason": "Dẫn chứng câu 3:「毎朝六時半に起きます。」",
          "wrongOptions": [
            {
              "option": "七時に起きます",
              "reason": "Dậy lúc 6:30 sáng."
            },
            {
              "option": "八時に起きます",
              "reason": "8:00 là giờ bắt đầu học ở trường."
            },
            {
              "option": "六時に起きます",
              "reason": "Dậy lúc 6 giờ rưỡi."
            }
          ]
        }
      },
      {
        "id": "jpd113-q6-3",
        "prompt": "学校での勉強は何時までですか。",
        "options": [
          "十二時半（三十分）までです",
          "午前十一時までです",
          "午後二時までです",
          "午後四時までです"
        ],
        "answer": "十二時半（三十分）までです",
        "explanation": {
          "meaning": "Việc học ở trường kết thúc lúc mấy giờ? Đáp án: Đến 12 giờ rưỡi.",
          "reason": "Dẫn chứng câu 4:「午前八時から十二時半（三十分）まで学校で勉強します。」",
          "wrongOptions": [
            {
              "option": "午前十一時までです",
              "reason": "Học đến 12:30."
            },
            {
              "option": "午後二時までです",
              "reason": "Buổi chiều tác giả đọc sách ở thư viện."
            },
            {
              "option": "午後四時までです",
              "reason": "Sai thời gian kết thúc buổi học."
            }
          ]
        }
      },
      {
        "id": "jpd113-q6-4",
        "prompt": "学校から寮まで歩いて何分ですか。",
        "options": [
          "歩いて十五分です",
          "歩いて十分です",
          "歩いて三十分です",
          "歩いて五分です"
        ],
        "answer": "歩いて十五分です",
        "explanation": {
          "meaning": "Từ trường về ký túc xá đi bộ mất bao nhiêu phút? Đáp án: 15 phút.",
          "reason": "Dẫn chứng câu 5:「学校から寮まで歩いて十五分です。」",
          "wrongOptions": [
            {
              "option": "歩いて十分です",
              "reason": "Mất 15 phút đi bộ."
            },
            {
              "option": "歩いて三十分です",
              "reason": "Không mất 30 phút."
            },
            {
              "option": "歩いて五分です",
              "reason": "Mất 15 phút."
            }
          ]
        }
      }
    ]
  },
  // JPD113-READ-7
  {
    "id": "jpd113-read-7",
    "course": "JPD113",
    "title": "学校の売店と買い物",
    "titleVi": "Cửa hàng trong trường học và mua sắm",
    "theme": "Mua sắm học cụ, số lượng, đếm tiền yên và tiền lẻ",
    "content": "学校の売店にノートやペンがあります。この白いノートは一冊百五十円です。青いペンは一本八十円です。私はノート二冊とペン三本を買いました。ぜんぶで五百四十円でした。一千円や一万円を出しておつりをもらいました。売店の人はとても親切です。",
    "sentences": [
      {
        "jp": "学校の売店にノートやペンがあります。",
        "vi": "Ở căng tin trường học có vở và bút.",
        "romaji": "Gakkou no baiten ni nooto ya pen ga arimasu."
      },
      {
        "jp": "この白いノートは一冊百五十円です。",
        "vi": "Cuốn vở màu trắng này giá 150 yên một quyển.",
        "romaji": "Kono shiroi nooto wa issatsu hyaku gojuu-en desu."
      },
      {
        "jp": "青いペンは一本八十円です。",
        "vi": "Cây bút màu xanh này giá 80 yên một chiếc.",
        "romaji": "Aoi pen wa ippon hachijuu-en desu."
      },
      {
        "jp": "私はノート二冊とペン三本を買いました。",
        "vi": "Tôi đã mua 2 cuốn vở và 3 cây bút.",
        "romaji": "Watashi wa nooto nisatsu to pen sanbon o kaimashita."
      },
      {
        "jp": "ぜんぶで五百四十円でした。",
        "vi": "Tổng cộng hết 540 yên.",
        "romaji": "Zenbu de gohyaku yonjuu-en deshita."
      },
      {
        "jp": "一千円や一万円を出しておつりをもらいました。",
        "vi": "Tôi đưa tờ 1.000 yên hoặc 10.000 yên và nhận lại tiền thừa.",
        "romaji": "Issen-en ya ichiman-en o dashite otsuri o moraimashita."
      },
      {
        "jp": "売店の人はとても親切です。",
        "vi": "Người bán hàng ở căng tin rất tốt bụng.",
        "romaji": "Baiten no hito wa totemo shinsetsu desu."
      }
    ],
    "translation": "Tại căng tin của trường học có bán nhiều loại vở và bút viết. Cuốn vở trắng này có giá 150 yên một quyển. Cây bút mực xanh có giá 80 yên một chiếc. Tôi đã chọn mua 2 cuốn vở và 3 cây bút. Tổng cộng hết 540 yên. Tôi đưa tiền chẵn 1.000 yên hoặc 10.000 yên và nhận lại tiền thừa đầy đủ. Cô nhân viên bán hàng ở căng tin vô cùng niềm nở và thân thiện.",
    "romaji": "Gakkou no baiten ni nooto ya pen ga arimasu. Kono shiroi nooto wa issatsu hyaku gojuu-en desu. Aoi pen wa ippon hachijuu-en desu. Watashi wa nooto nisatsu to pen sanbon o kaimashita. Zenbu de gohyaku yonjuu-en deshita. Issen-en ya ichiman-en o dashite otsuri o moraimashita. Baiten no hito wa totemo shinsetsu desu.",
    "vocabularyUsed": [
      "学校",
      "売店",
      "ノート",
      "ペン",
      "白",
      "一冊",
      "百五十円",
      "青",
      "一本",
      "八十円",
      "私",
      "二冊",
      "三本",
      "買う",
      "五百四十円",
      "一千円",
      "一万円",
      "人",
      "親切"
    ],
    "kanjiUsed": [
      "学",
      "校",
      "一",
      "冊",
      "百",
      "五",
      "十",
      "円",
      "本",
      "八",
      "私",
      "二",
      "三",
      "買",
      "四",
      "千",
      "万",
      "人"
    ],
    "questions": [
      {
        "id": "jpd113-q7-1",
        "prompt": "白いノートは一冊いくらですか。",
        "options": [
          "百五十円です",
          "百円です",
          "二百円です",
          "八十円です"
        ],
        "answer": "百五十円です",
        "explanation": {
          "meaning": "Cuốn vở màu trắng giá bao nhiêu một quyển? Đáp án: 150 yên.",
          "reason": "Dẫn chứng câu 2:「この白いノートは一冊百五十円です。」",
          "wrongOptions": [
            {
              "option": "百円です",
              "reason": "Giá là 150 yên."
            },
            {
              "option": "二百円です",
              "reason": "Sai mức giá."
            },
            {
              "option": "八十円です",
              "reason": "80 yên là giá của cây bút xanh."
            }
          ]
        }
      },
      {
        "id": "jpd113-q7-2",
        "prompt": "青いペンは一本いくらですか。",
        "options": [
          "八十円です",
          "五十円です",
          "百円です",
          "百二十円です"
        ],
        "answer": "八十円です",
        "explanation": {
          "meaning": "Cây bút màu xanh giá bao nhiêu một chiếc? Đáp án: 80 yên.",
          "reason": "Dẫn chứng câu 3:「青いペンは一本八十円です。」",
          "wrongOptions": [
            {
              "option": "五十円です",
              "reason": "Giá là 80 yên."
            },
            {
              "option": "百円です",
              "reason": "Sai mức giá."
            },
            {
              "option": "百二十円です",
              "reason": "Sai mức giá."
            }
          ]
        }
      },
      {
        "id": "jpd113-q7-3",
        "prompt": "筆者は何を買いましたか。",
        "options": [
          "ノート二冊とペン三本を買いました",
          "ノート一冊と消しゴムを買いました",
          "ペン五本を買いました",
          "辞書を一冊買いました"
        ],
        "answer": "ノート二冊とペン三本を買いました",
        "explanation": {
          "meaning": "Tác giả đã mua những gì? Đáp án: 2 quyển vở và 3 cây bút.",
          "reason": "Dẫn chứng câu 4:「私はノート二冊とペン三本を買いました。」",
          "wrongOptions": [
            {
              "option": "ノート一冊と消しゴムを買いました",
              "reason": "Tác giả mua 2 cuốn vở và 3 cây bút."
            },
            {
              "option": "ペン五本を買いました",
              "reason": "Chỉ mua 3 cây bút."
            },
            {
              "option": "辞書を一冊買いました",
              "reason": "Không mua từ điển."
            }
          ]
        }
      },
      {
        "id": "jpd113-q7-4",
        "prompt": "ぜんぶでいくらでしたか。",
        "options": [
          "五百四十円でした",
          "四百五十円でした",
          "六百円でした",
          "千円でした"
        ],
        "answer": "五百四十円でした",
        "explanation": {
          "meaning": "Tổng cộng hết bao nhiêu tiền? Đáp án: 540 yên.",
          "reason": "Dẫn chứng câu 5:「ぜんぶで五百四十円でした。」",
          "wrongOptions": [
            {
              "option": "四百五十円でした",
              "reason": "Tổng tiền là 540 yên."
            },
            {
              "option": "六百円でした",
              "reason": "Sai số tiền."
            },
            {
              "option": "千円でした",
              "reason": "1.000 yên là tờ tiền khách đưa."
            }
          ]
        }
      }
    ]
  },
  // JPD113-READ-8
  {
    "id": "jpd113-read-8",
    "course": "JPD113",
    "title": "一週間の予定とカレンダー",
    "titleVi": "Lịch trình một tuần và cuốn lịch",
    "theme": "Các ngày trong tuần, ngày tháng, thời gian biểu và nghỉ ngơi",
    "content": "今日は四月一日、月曜日です。月曜日と水曜日と金曜日は日本語の授業があります。火曜日と木曜日の午後はパソコンを勉強します。土曜日は休みです。友達と買い物に行きます。日曜日の午前は部屋をそうじして、午後は休みます。一年は十二か月あります。",
    "sentences": [
      {
        "jp": "今日は四月一日、月曜日です。",
        "vi": "Hôm nay là ngày 1 tháng 4, thứ Hai.",
        "romaji": "Kyou wa shigatsu tsuitachi, getsuyoubi desu."
      },
      {
        "jp": "月曜日と水曜日と金曜日は日本語の授業があります。",
        "vi": "Thứ Hai, thứ Tư và thứ Sáu có giờ học tiếng Nhật.",
        "romaji": "Getsuyoubi to suiyoubi to kinyoubi wa nihongo no jugyou ga arimasu."
      },
      {
        "jp": "火曜日と木曜日の午後はパソコンを勉強します。",
        "vi": "Chiều thứ Ba và thứ Năm học máy vi tính.",
        "romaji": "Kayoubi to mokuyoubi no gogo wa pasokon o benkyou shimasu."
      },
      {
        "jp": "土曜日は休みです。",
        "vi": "Thứ Bảy là ngày nghỉ.",
        "romaji": "Doyoubi wa yasumi desu."
      },
      {
        "jp": "友達と買い物に行きます。",
        "vi": "Tôi cùng bạn đi mua sắm.",
        "romaji": "Tomodachi to kaimono ni ikimasu."
      },
      {
        "jp": "日曜日の午前は部屋をそうじして、午後は休みます。",
        "vi": "Sáng Chủ nhật dọn dẹp phòng, buổi chiều nghỉ ngơi.",
        "romaji": "Nichiyoubi no gozen wa heya o souji shite, gogo wa yasumimasu."
      },
      {
        "jp": "一年は十二か月あります。",
        "vi": "Một năm có 12 tháng.",
        "romaji": "Ichinen wa juuni-kagetsu arimasu."
      }
    ],
    "translation": "Hôm nay là ngày mùng 1 tháng 4, thứ Hai. Thứ Hai, thứ Tư và thứ Sáu hàng tuần tôi đều có giờ học tiếng Nhật. Vào chiều thứ Ba và thứ Năm tôi học tin học máy tính. Thứ Bảy là ngày nghỉ, tôi cùng bạn bè đi mua sắm. Sáng Chủ nhật tôi dọn dẹp phòng ốc sạch sẽ, chiều nghỉ ngơi thư giãn. Một năm có tất cả 12 tháng.",
    "romaji": "Kyou wa shigatsu tsuitachi, getsuyoubi desu. Getsuyoubi to suiyoubi to kinyoubi wa nihongo no jugyou ga arimasu. Kayoubi to mokuyoubi no gogo wa pasokon o benkyou shimasu. Doyoubi wa yasumi desu. Tomodachi to kaimono ni ikimasu. Nichiyoubi no gozen wa heya o souji shite, gogo wa yasumimasu. Ichinen wa juuni-kagetsu arimasu.",
    "vocabularyUsed": [
      "今日",
      "四月一日",
      "月曜日",
      "水曜日",
      "金曜日",
      "日本語",
      "授業",
      "火曜日",
      "木曜日",
      "午後",
      "パソコン",
      "勉強",
      "土曜日",
      "休み",
      "友達",
      "買い物",
      "行く",
      "日曜日",
      "午前",
      "部屋",
      "一年",
      "十二か月"
    ],
    "kanjiUsed": [
      "今",
      "日",
      "四",
      "月",
      "一",
      "曜",
      "水",
      "金",
      "語",
      "火",
      "木",
      "午",
      "後",
      "土",
      "休",
      "買",
      "物",
      "行",
      "年",
      "十",
      "二"
    ],
    "questions": [
      {
        "id": "jpd113-q8-1",
        "prompt": "今日は何月何日ですか。",
        "options": [
          "四月一日です",
          "四月二日です",
          "五月一日です",
          "三月三十日です"
        ],
        "answer": "四月一日です",
        "explanation": {
          "meaning": "Hôm nay là ngày mấy tháng mấy? Đáp án: Ngày 1 tháng 4.",
          "reason": "Dẫn chứng câu 1:「今日は四月一日、月曜日です。」",
          "wrongOptions": [
            {
              "option": "四月二日です",
              "reason": "Hôm nay là ngày 1 tháng 4 (四月一日)."
            },
            {
              "option": "五月一日です",
              "reason": "Sai tháng."
            },
            {
              "option": "三月三十日です",
              "reason": "Sai ngày tháng."
            }
          ]
        }
      },
      {
        "id": "jpd113-q8-2",
        "prompt": "日本語の授業は何曜日ですか。",
        "options": [
          "月曜日と水曜日と金曜日です",
          "火曜日と木曜日です",
          "土曜日と日曜日です",
          "毎日です"
        ],
        "answer": "月曜日と水曜日と金曜日です",
        "explanation": {
          "meaning": "Giờ học tiếng Nhật vào những thứ mấy? Đáp án: Thứ Hai, thứ Tư và thứ Sáu.",
          "reason": "Dẫn chứng câu 2:「月曜日と水曜日と金曜日は日本語の授業があります。」",
          "wrongOptions": [
            {
              "option": "火曜日と木曜日です",
              "reason": "Thứ Ba và thứ Năm là giờ học máy tính."
            },
            {
              "option": "土曜日と日曜日です",
              "reason": "Cuối tuần là ngày nghỉ."
            },
            {
              "option": "毎日です",
              "reason": "Học 3 buổi một tuần."
            }
          ]
        }
      },
      {
        "id": "jpd113-q8-3",
        "prompt": "土曜日に何をしますか。",
        "options": [
          "友達と買い物に行きます",
          "学校で勉強します",
          "アルバイトをします",
          "病院へ行きます"
        ],
        "answer": "友達と買い物に行きます",
        "explanation": {
          "meaning": "Thứ Bảy tác giả làm gì? Đáp án: Đi mua sắm cùng bạn.",
          "reason": "Dẫn chứng câu 4-5:「土曜日は休みです。友達と買い物に行きます。」",
          "wrongOptions": [
            {
              "option": "学校で勉強します",
              "reason": "Thứ Bảy được nghỉ học."
            },
            {
              "option": "アルバイトをします",
              "reason": "Không đi làm thêm."
            },
            {
              "option": "病院へ行きます",
              "reason": "Không đi bệnh viện."
            }
          ]
        }
      },
      {
        "id": "jpd113-q8-4",
        "prompt": "日曜日の午前は何をしますか。",
        "options": [
          "部屋をそうじします",
          "サッカーをします",
          "映画を見ます",
          "料理を作ります"
        ],
        "answer": "部屋をそうじします",
        "explanation": {
          "meaning": "Sáng Chủ nhật tác giả làm gì? Đáp án: Dọn dẹp phòng.",
          "reason": "Dẫn chứng câu 6:「日曜日の午前は部屋をそうじして、午後は休みます。」",
          "wrongOptions": [
            {
              "option": "サッカーをします",
              "reason": "Tác giả dọn phòng vào buổi sáng."
            },
            {
              "option": "映画を見ます",
              "reason": "Không đi xem phim."
            },
            {
              "option": "料理を作ります",
              "reason": "Không nấu ăn."
            }
          ]
        }
      }
    ]
  },
];

const RAW_PASSAGES_JPD123: ReadingPassage[] = [
  // SET 1 - Đề 1
  {
    id: "jpd123-read-1",
    course: "JPD123",
    title: "デパートでの買い物と日本料理",
    titleVi: "Mua sắm ở bách hóa và món ăn Nhật",
    theme: "Mua sắm, so sánh giá cả, dụng cụ ăn uống và phương tiện",
    content: "先週の土曜日、私は東京から来た本田さんとダナン市の区にある大きいデパートへ買い物に行きました。デパートでセールがありましたから、人がたくさんいました。私たちは白いTシャツを二まい買いました。二まいで三千円でした。とてもやすかったです。買い物をしてから、日本料理のレストランへ行きました。ナイフやスプーンなどのしょくじのどう具をつかって、とり肉の料理やピザを食べました。デパートのピザはスーパーのピザよりずっとおいしかったです。小さいカフェでコーヒーを飲んでから、午後四時半にタクシーで帰りました。バスよりタクシーのほうがはやいですが、たかかったです。",
    sentences: [
      { jp: "先週の土曜日、私は東京から来た本田さんとダナン市の区にある大きいデパートへ買い物に行きました。", vi: "Thứ Bảy tuần trước, tôi và bạn Honda đến từ Tokyo đã đi mua sắm ở trung tâm thương mại lớn tại quận trung tâm Đà Nẵng.", romaji: "Senshuu no doyoubi, watashi wa Toukyou kara kita Honda-san to Danan-shi no ku ni aru ookii depaato e kaimono ni ikimashita." },
      { jp: "デパートでセールがありましたから、人がたくさんいました。", vi: "Vì ở trung tâm thương mại có đợt giảm giá nên rất đông người.", romaji: "Depaato de seeru ga arimashita kara, hito ga takusan imashita." },
      { jp: "私たちは白いTシャツを二まい買いました。", vi: "Chúng tôi đã mua hai chiếc áo phông trắng.", romaji: "Watashitachi wa shiroi tiishatsu o nimai kaimashita." },
      { jp: "二まいで三千円でした。", vi: "Hai chiếc có giá 3.000 yên.", romaji: "Nimai de sanzen-en deshita." },
      { jp: "とてもやすかったです。", vi: "Đã rất rẻ.", romaji: "Totemo yasukatta desu." },
      { jp: "買い物をしてから、日本料理のレストランへ行きました。", vi: "Sau khi mua sắm xong, chúng tôi đã đến nhà hàng ẩm thực Nhật Bản.", romaji: "Kaimono o shite kara, nihon ryouri no resutoran e ikimashita." },
      { jp: "ナイフやスプーンなどのしょくじのどう具をつかって、とり肉の料理やピザを食べました。", vi: "Dùng các dụng cụ ăn uống như dao và thìa, chúng tôi ăn các món thịt gà và pizza.", romaji: "Naifu ya supuun nado no shokuji no dougu o tsukatte, toriniku no ryouri ya piza o tabemashita." },
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
    content: "来月の休みに、私の国のともだちと二人でお寺へりょこうに行きます。そのまちには大きい門とお寺がありますから、男の人も女の人もたくさん来ます。駅の前で有名なバスにのって、午前十時につきました。お寺の門の前でしゃしんをたくさんとって、きれいなたてものを見ました。たくさん歩きましたから、からだがつかれて力もなくなりましたが、とてもたのしかったです。お寺のノートにじぶんの名前を書いてから、よるにアパートへ帰りました。",
    sentences: [
      { jp: "来月の休みに、私の国のともだちと二人でお寺へりょこうに行きます。", vi: "Vào kỳ nghỉ tháng sau, tôi và người bạn cùng quê sẽ đi du lịch đến ngôi chùa cổ.", romaji: "Raigetsu no yasumi ni, watashi no kuni no tomodachi to futari de otera e ryokou ni ikimasu." },
      { jp: "そのまちには大きい門とお寺がありますから、男の人も女の人もたくさん来ます。", vi: "Vì thị trấn đó có cổng lớn và ngôi chùa nên cả nam và nữ đều đến rất đông.", romaji: "Sono machi ni wa ookii mon to otera ga arimasu kara, otoko no hito mo onna no hito mo takusan kimasu." },
      { jp: "駅の前で有名なバスにのって、午前十時につきました。", vi: "Chúng tôi lên tuyến xe buýt nổi tiếng ở trước nhà ga và đã đến nơi lúc 10 giờ sáng.", romaji: "Eki no mae de yuumeina basu ni notte, gozen juu-ji ni tsukimashita." },
      { jp: "お寺の門の前でしゃしんをたくさんとって、きれいなたてものを見ました。", vi: "Chúng tôi chụp nhiều ảnh trước cổng chùa và chiêm ngưỡng công trình tuyệt đẹp.", romaji: "Otera no mon no mae de shashin o takusan totte, kireina tatemono o mimashita." },
      { jp: "たくさん歩きましたから、からだがつかれて力もなくなりましたが、とてもたのしかったです。", vi: "Vì đi bộ nhiều nên người mệt và kiệt sức nhưng chuyến đi rất vui.", romaji: "Takusan arukimashita kara, karada ga tsukarete chikara mo nakunarimashita ga, totemo tanoshikatta desu." },
      { jp: "お寺のノートにじぶんの名前を書いてから、よるにアパートへ帰りました。", vi: "Sau khi viết tên mình vào cuốn sổ lưu niệm của chùa, chúng tôi trở về căn hộ vào buổi tối.", romaji: "Otera no nooto ni jibun no namae o kaite kara, yoru ni apaato e kaerimashita." }
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
    content: "今週の日曜日に、アパートでともだちと日本料理のパーティーをしました。午前十時に本田さんとスーパーへ行って、とり肉やさかなや野さいを買いました。ぜんぶで五千五百円でした。スーパーの食べ物はコンビニの食べ物よりやすいです。アパートに帰ってから、みんなで料理をつくりました。スプーンやフォークなどのしょくじのどう具をつかって、大きいテーブルでスープとサラダを食べました。小さいコップでお茶やコーヒーを飲んで、午後四時半まで楽しく話しました。",
    sentences: [
      { jp: "今週の日曜日に、アパートでともだちと日本料理のパーティーをしました。", vi: "Chủ nhật tuần này, tôi đã tổ chức bữa tiệc ẩm thực Nhật Bản cùng bạn bè tại căn hộ.", romaji: "Konshuu no nichiyoubi ni, apaato de tomodachi to nihon ryouri no paatii o shimashita." },
      { jp: "午前十時に本田さんとスーパーへ行って、とり肉やさかなや野さいを買いました。", vi: "Lúc 10 giờ sáng, tôi cùng bạn Honda đi siêu thị mua thịt gà, cá và rau củ.", romaji: "Gozen juu-ji ni Honda-san to suupaa e itte, toriniku ya sakana ya yasai o kaimashita." },
      { jp: "ぜんぶで五千五百円でした。", vi: "Tổng cộng hết 5.500 yên.", romaji: "Zenbu de gosen gohyaku-en deshita." },
      { jp: "スーパーの食べ物はコンビニの食べ物よりやすいです。", vi: "Thực phẩm ở siêu thị rẻ hơn thực phẩm ở cửa hàng tiện lợi.", romaji: "Suupaa no tabemono wa konbini no tabemono yori yasui desu." },
      { jp: "アパートに帰ってから、みんなで料理をつくりました。", vi: "Sau khi về căn hộ, mọi người cùng nhau nấu nướng.", romaji: "Apaato ni kaette kara, minna de ryouri o tsukurimashita." },
      { jp: "スプーンやフォークなどのしょくじのどう具をつかって、大きいテーブルでスープとサラダを食べました。", vi: "Dùng các dụng cụ ăn uống như thìa và nĩa, chúng tôi ăn súp và sa lát ở chiếc bàn lớn.", romaji: "Supuun ya fooku nado no shokuji no dougu o tsukatte, ookii teeburu de suupu to sarada o tabemashita." },
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
,
  // JPD123-READ-9
  {
    "id": "jpd123-read-9",
    "course": "JPD123",
    "title": "京都の有名なお寺と門の旅行",
    "titleVi": "Chuyến du lịch ngắm ngôi chùa nổi tiếng và cổng đền ở Kyoto",
    "theme": "Du lịch, danh lam thắng cảnh Kyoto, tàu Shinkansen và quà lưu niệm",
    "content": "先週、私は大学の男の学生と女の学生といっしょに、新幹線で京都へ行きました。京都は古いお寺や大きな門がたくさんあって、外国からの観光客にもとても有名な町です。午前十時半に駅に着いてから、きれいな公園を散歩して、みんなでしゃしんをたくさんとりました。午後はお寺の近くの小さい店で、おみやげの食べ物を買いました。よるにホテルへ帰る前に、みんなでカフェで冷たいジュースやコーヒーを飲みながら楽しく話しました。京都の旅行はほんとうにすばらしくて、また来年も友達と来たいです。",
    "sentences": [
      {
        "jp": "先週、私は大学の男の学生と女の学生といっしょに、新幹線で京都へ行きました。",
        "vi": "Tuần trước, tôi cùng các bạn sinh viên nam và nữ cùng trường đại học đi Kyoto bằng tàu Shinkansen.",
        "romaji": "Senshuu, watashi wa daigaku no otoko no gakusei to onna no gakusei to issho ni, shinkansen de Kyouto e ikimashita."
      },
      {
        "jp": "京都は古いお寺や大きな門がたくさんあって、外国からの観光客にもとても有名な町です。",
        "vi": "Kyoto có nhiều ngôi chùa cổ và những chiếc cổng lớn, là thành phố rất nổi tiếng với cả du khách nước ngoài.",
        "romaji": "Kyouto wa furui otera ya ookii mon ga takusan atte, gaikoku kara no kankoukyaku ni mo totemo yuumeina machi desu."
      },
      {
        "jp": "午前十時半に駅に着いてから、きれいな公園を散歩して、みんなでしゃしんをたくさんとりました。",
        "vi": "Sau khi đến ga lúc 10 giờ rưỡi sáng, chúng tôi đi dạo ở công viên đẹp và cùng nhau chụp nhiều ảnh.",
        "romaji": "Gozen juu-jihan ni eki ni tsuite kara, kireina kouen o sanpo shite, minna de shashin o takusan torimashita."
      },
      {
        "jp": "午後はお寺の近くの小さい店で、おみやげの食べ物を買いました。",
        "vi": "Buổi chiều tại một cửa hàng nhỏ gần chùa, chúng tôi đã mua đồ ăn làm quà lưu niệm.",
        "romaji": "Gogo wa otera no chikaku no chiisai mise de, omiyage no tabemono o kaimashita."
      },
      {
        "jp": "よるにホテルへ帰る前に、みんなでカフェで楽しく話しました。",
        "vi": "Trước khi trở về khách sạn vào buổi chiều tối, mọi người đã vào quán cà phê trò chuyện rất vui vẻ.",
        "romaji": "Yuugata ni hoteru e kaeru mae ni, minna de kafe de tsumetai juusu ya koohii o nominagara tanoshiku hanashimashita."
      },
      {
        "jp": "京都の旅行はほんとうにすばらしくて、また来年も友達と来たいです。",
        "vi": "Chuyến du lịch Kyoto thực sự rất tuyệt vời, năm sau tôi lại muốn cùng bạn bè đến đây.",
        "romaji": "Kyouto no ryokou wa hontou ni subarashikute, mata rainen mo tomodachi to kitai desu."
      }
    ],
    "translation": "Tuần trước, tôi cùng các bạn sinh viên nam và nữ cùng trường đại học đi du lịch Kyoto bằng tàu Shinkansen. Kyoto có rất nhiều ngôi chùa cổ kính và cổng đền khổng lồ, là điểm đến nổi tiếng khắp thế giới. Đến ga lúc 10 giờ rưỡi sáng, cả nhóm đi dạo quanh công viên tuyệt đẹp và chụp vô số bức ảnh kỷ niệm. Buổi chiều, chúng tôi ghé một cửa hàng nhỏ gần chùa mua đặc sản làm quà lưu niệm. Trước khi trở về khách sạn nghỉ ngơi, cả nhóm cùng vào quán cà phê trò chuyện rôm rả. Chuyến đi Kyoto thật vô cùng tuyệt vời, năm sau tôi nhất định muốn cùng bạn bè quay lại nơi này.",
    "romaji": "Senshuu, watashi wa daigaku no otoko no gakusei to onna no gakusei to issho ni, shinkansen de Kyouto e ikimashita. Kyouto wa furui otera ya ookii mon ga takusan atte, gaikoku kara no kankoukyaku ni mo totemo yuumeina machi desu. Gozen juu-jihan ni eki ni tsuite kara, kireina kouen o sanpo shite, minna de shashin o takusan torimashita. Gogo wa otera no chikaku no chiisai mise de, omiyage no tabemono o kaimashita. Yuugata ni hoteru e kaeru mae ni, minna de kafe de tanoshiku hanashimashita. Kyouto no ryokou wa hontou ni subarashikute, mata rainen mo tomodachi to kitai desu.",
    "vocabularyUsed": [
      "先週",
      "私",
      "大学",
      "男",
      "学生",
      "女",
      "新幹線",
      "京都",
      "行く",
      "古い",
      "お寺",
      "大きい",
      "門",
      "外国",
      "有名",
      "午前",
      "十時半",
      "散歩",
      "写真",
      "午後",
      "近く",
      "小さい",
      "店",
      "お土産",
      "食べ物",
      "買う",
      "夕方",
      "ホテル",
      "帰る",
      "前",
      "カフェ",
      "話す",
      "旅行",
      "来年",
      "友達",
      "来る"
    ],
    "kanjiUsed": [
      "先",
      "週",
      "私",
      "大",
      "学",
      "男",
      "生",
      "女",
      "行",
      "京",
      "寺",
      "門",
      "外",
      "国",
      "午",
      "前",
      "十",
      "時",
      "半",
      "後",
      "小",
      "物",
      "食",
      "買",
      "帰",
      "話",
      "来",
      "年"
    ],
    "questions": [
      {
        "id": "jpd123-q9-1",
        "prompt": "筆者は先週だれと京都へ行きましたか。",
        "options": [
          "大学の男の学生と女の学生といっしょに行きました",
          "一人で新幹線に乗って行きました",
          "高校の先生と行きました",
          "家族といっしょに行きました"
        ],
        "answer": "大学の男の学生と女の学生といっしょに行きました",
        "explanation": {
          "meaning": "Tác giả đã đi du lịch Kyoto tuần trước cùng ai? Đáp án: Đi cùng các bạn sinh viên nam và nữ ở đại học.",
          "reason": "Dẫn chứng câu 1:「大学の男の学生と女の学生といっしょに、新幹線で京都へ行きました。」",
          "wrongOptions": [
            {
              "option": "一人で新幹線に乗って行きました",
              "reason": "Tác giả đi cùng nhóm bạn bè."
            },
            {
              "option": "高校の先生と行きました",
              "reason": "Không có giáo viên đi cùng."
            },
            {
              "option": "家族といっしょに行きました",
              "reason": "Đi với bạn đại học, không đi với gia đình."
            }
          ]
        }
      },
      {
        "id": "jpd123-q9-2",
        "prompt": "京都の町について、文章で何と言っていますか。",
        "options": [
          "古いお寺や大きな門がたくさんある有名な町です",
          "小さなお寺しかありません",
          "新しいビルばかりある町です",
          "人がぜんぜんいない町です"
        ],
        "answer": "古いお寺や大きな門がたくさんある有名な町です",
        "explanation": {
          "meaning": "Về thành phố Kyoto, bài văn miêu tả điều gì? Đáp án: Là thành phố nổi tiếng có nhiều chùa cổ và cổng lớn.",
          "reason": "Dẫn chứng câu 2:「京都は古いお寺や大きな門がたくさんあって、外国からの観光客にもとても有名な町です。」",
          "wrongOptions": [
            {
              "option": "小さなお寺しかありません",
              "reason": "Kyoto có nhiều chùa cổ và cổng lớn."
            },
            {
              "option": "新しいビルばかりある町です",
              "reason": "Bài nhấn mạnh cảnh quan lịch sử."
            },
            {
              "option": "人がぜんぜんいない町です",
              "reason": "Rất đông du khách trong và ngoài nước."
            }
          ]
        }
      },
      {
        "id": "jpd123-q9-3",
        "prompt": "午前十時半に駅に着いてから何をしましたか。",
        "options": [
          "きれいな公園を散歩して写真を撮りました",
          "すぐホテルへ行って寝ました",
          "デパートで洋服を買いました",
          "会社へ行って仕事をしました"
        ],
        "answer": "きれいな公園を散歩して写真を撮りました",
        "explanation": {
          "meaning": "Sau khi đến ga lúc 10 giờ rưỡi sáng, họ đã làm gì? Đáp án: Đi dạo công viên đẹp và chụp ảnh.",
          "reason": "Dẫn chứng câu 3:「午前十時半に駅に着いてから、きれいな公園を散歩して、みんなでしゃしんをたくさんとりました。」",
          "wrongOptions": [
            {
              "option": "すぐホテルへ行って寝ました",
              "reason": "Họ đi dạo công viên chụp ảnh."
            },
            {
              "option": "デパートで洋服を買いました",
              "reason": "Không đi mua quần áo."
            },
            {
              "option": "会社へ行って仕事をしました",
              "reason": "Đây là chuyến du lịch thư giãn."
            }
          ]
        }
      },
      {
        "id": "jpd123-q9-4",
        "prompt": "午後にお寺の近くの小さい店で何を買いましたか。",
        "options": [
          "おみやげの食べ物を買いました",
          "カメラとパソコンを買いました",
          "新しい靴と鞄を買いました",
          "高い自動車を買いました"
        ],
        "answer": "おみやげの食べ物を買いました",
        "explanation": {
          "meaning": "Buổi chiều tại cửa hàng nhỏ gần chùa, họ đã mua gì? Đáp án: Mua đồ ăn làm quà lưu niệm.",
          "reason": "Dẫn chứng câu 4:「午後はお寺の近くの小さい店で、おみやげの食べ物を買いました。」",
          "wrongOptions": [
            {
              "option": "カメラとパソコンを買いました",
              "reason": "Họ mua đồ ăn làm quà."
            },
            {
              "option": "新しい靴と鞄を買いました",
              "reason": "Không mua giày dép hay túi xách."
            },
            {
              "option": "高い自動車を買いました",
              "reason": "Không mua xe hơi."
            }
          ]
        }
      }
    ]
  },
  // JPD123-READ-10
  {
    "id": "jpd123-read-10",
    "course": "JPD123",
    "title": "シェアハウスの料理と夕食会",
    "titleVi": "Nấu ăn và bữa tiệc tối tại nhà chung",
    "theme": "Nấu ăn, siêu thị, thực phẩm thịt rau và dụng cụ ăn uống",
    "content": "今週の日曜日の午後、私たちの部屋でパーティーをしました。山田さんと田中さんはスーパーへ行って、とり肉や新鮮な野さいをたくさん買いました。山田さんは日本の料理がとても上手で、おいしいスープとサラダを作ってくれました。みんなで大きいテーブルのまわりで、フォークやスプーンなどの食事のどう具を並べました。私は冷たいお茶やジュースを飲みながら、日本のせいかつについて楽しく話しました。今晩はみんなでお腹がいっぱいになるまで食べて、ほんとうに楽しかったです。",
    "sentences": [
      {
        "jp": "今週の日曜日の午後、私たちの部屋でパーティーをしました。",
        "vi": "Chiều Chủ nhật tuần này, chúng tôi đã tổ chức một bữa tiệc tại phòng.",
        "romaji": "Konshuu no nichiyoubi no gogo, watashitachi no heya de paatii o shimashita."
      },
      {
        "jp": "山田さんと田中さんはスーパーへ行って、とり肉や新鮮な野さいをたくさん買いました。",
        "vi": "Bạn Yamada và Tanaka đã đi siêu thị mua rất nhiều thịt gà và rau tươi.",
        "romaji": "Yamada-san to Tanaka-san wa suupaa e itte, toriniku ya shinsenna yasai o takusan kaimashita."
      },
      {
        "jp": "山田さんは日本の料理がとても上手で、おいしいスープとサラダを作ってくれました。",
        "vi": "Yamada nấu món ăn Nhật rất giỏi và đã nấu cho chúng tôi món súp và salad ngon tuyệt.",
        "romaji": "Yamada-san wa Nihon no ryouri ga totemo jouzu de, oishii suupu to sarada o tsukutte kuremashita."
      },
      {
        "jp": "みんなで大きいテーブルのまわりで、フォークやスプーンなどの食事のどう具を並べました。",
        "vi": "Mọi người quây quần quanh chiếc bàn lớn, sắp xếp các dụng cụ ăn uống như nĩa và thìa.",
        "romaji": "Minna de ookii teeburu o kakonde, fooku ya supuun nado no shokuji no dougu o narabemashita."
      },
      {
        "jp": "私は冷たいお茶やジュースを飲みながら、日本のせいかつについて楽しく話しました。",
        "vi": "Tôi vừa uống trà lạnh và nước ép, vừa trò chuyện vui vẻ về cuộc sống ở Nhật Bản.",
        "romaji": "Watashi wa tsumetai ocha ya juusu o nominagara, Nihon no seikatsu ni tsuite tanoshiku hanashimashita."
      },
      {
        "jp": "今晩はみんなでお腹がいっぱいになるまで食べて、ほんとうに楽しかったです。",
        "vi": "Tối nay mọi người cùng nhau ăn uống no nê, thực sự vô cùng vui vẻ.",
        "romaji": "Konban wa minna de onaka ga ippai ni naru made tabete, hontou ni tanoshikatta desu."
      }
    ],
    "translation": "Chiều Chủ nhật tuần này, nhóm chúng tôi tổ chức một bữa tiệc ấm cúng tại phòng. Anh Yamada và anh Tanaka đã ghé siêu thị mua thịt gà tươi cùng đủ loại rau củ quả. Anh Yamada nấu món Nhật rất khéo tay và đã nấu chiêu đãi cả phòng món súp nóng hổi và món salad tuyệt ngon. Cả nhóm quây quần bên chiếc bàn ăn lớn, bày biện các dụng cụ ăn uống như thìa và nĩa. Tôi vừa nhâm nhi cốc trà lạnh và nước trái cây tươi, vừa hào hứng sẻ chia về cuộc sống du học sinh tại xứ sở hoa anh đào. Tối nay ai nấy đều ăn uống no nê, tiếng cười ngập tràn khắp gian phòng.",
    "romaji": "Konshuu no nichiyoubi no gogo, watashitachi no heya de paatii o shimashita. Yamada-san to Tanaka-san wa suupaa e itte, toriniku ya shinsenna yasai o takusan kaimashita. Yamada-san wa Nihon no ryouri ga totemo jouzu de, oishii suupu to sarada o tsukutte kuremashita. Minna de ookii teeburu o kakonde, fooku ya supuun nado no shokuji no dougu o narabemashita. Watashi wa tsumetai ocha ya juusu o nominagara, Nihon no seikatsu ni tsuite tanoshiku hanashimashita. Konban wa minna de onaka ga ippai ni naru made tabete, hontou ni tanoshikatta desu.",
    "vocabularyUsed": [
      "今週",
      "日曜日",
      "午後",
      "私",
      "部屋",
      "パーティー",
      "山田",
      "田中",
      "スーパー",
      "行く",
      "肉",
      "野菜",
      "買う",
      "料理",
      "上手",
      "おいしい",
      "スープ",
      "サラダ",
      "大きい",
      "テーブル",
      "フォーク",
      "スプーン",
      "食事",
      "道具",
      "冷たい",
      "お茶",
      "ジュース",
      "飲む",
      "日本",
      "生活",
      "話す",
      "今晩",
      "食べる"
    ],
    "kanjiUsed": [
      "今",
      "週",
      "日",
      "曜",
      "午",
      "後",
      "私",
      "山",
      "田",
      "中",
      "行",
      "肉",
      "野",
      "買",
      "料",
      "理",
      "上",
      "手",
      "大",
      "食",
      "事",
      "具",
      "茶",
      "飲",
      "本",
      "話"
    ],
    "questions": [
      {
        "id": "jpd123-q10-1",
        "prompt": "パーティーはいつ行われましたか。",
        "options": [
          "今週の日曜日の午後です",
          "先週の月曜日の朝です",
          "毎日の夜です",
          "来週の土曜日です"
        ],
        "answer": "今週の日曜日の午後です",
        "explanation": {
          "meaning": "Bữa tiệc được tổ chức vào khi nào? Đáp án: Chiều Chủ nhật tuần này.",
          "reason": "Dẫn chứng câu 1:「今週の日曜日の午後、私たちの部屋でパーティーをしました。」",
          "wrongOptions": [
            {
              "option": "先週の月曜日の朝です",
              "reason": "Tiệc diễn ra chiều Chủ nhật tuần này."
            },
            {
              "option": "毎日の夜です",
              "reason": "Không phải tổ chức mỗi tối."
            },
            {
              "option": "来週の土曜日です",
              "reason": "Sai mốc thời gian."
            }
          ]
        }
      },
      {
        "id": "jpd123-q10-2",
        "prompt": "山田さんと田中さんはスーパーで何を買いましたか。",
        "options": [
          "とり肉や新鮮な野さいを買いました",
          "お魚とくだものだけを買いました",
          "パンとケーキを買いました",
          "お酒とビールだけを買いました"
        ],
        "answer": "とり肉や新鮮な野さいを買いました",
        "explanation": {
          "meaning": "Yamada và Tanaka đã mua gì ở siêu thị? Đáp án: Thịt gà và rau tươi.",
          "reason": "Dẫn chứng câu 2:「とり肉や新鮮な野さいをたくさん買いました。」",
          "wrongOptions": [
            {
              "option": "お魚とくだものだけを買いました",
              "reason": "Họ mua thịt gà và rau."
            },
            {
              "option": "パンとケーキを買いました",
              "reason": "Không mua bánh mì hay bánh ngọt."
            },
            {
              "option": "お酒とビールだけを買いました",
              "reason": "Họ mua nguyên liệu nấu ăn."
            }
          ]
        }
      },
      {
        "id": "jpd123-q10-3",
        "prompt": "山田さんはどんな人ですか。",
        "options": [
          "日本の料理がとても上手な人です",
          "料理がぜんぜんできない人です",
          "スーパーの店員さんです",
          "料理が嫌いな人です"
        ],
        "answer": "日本の料理がとても上手な人です",
        "explanation": {
          "meaning": "Yamada là người như thế nào? Đáp án: Nấu món ăn Nhật rất giỏi.",
          "reason": "Dẫn chứng câu 3:「山田さんは日本の料理がとても上手で、おいしいスープとサラダを作ってくれました。」",
          "wrongOptions": [
            {
              "option": "料理がぜんぜんできない人です",
              "reason": "Yamada nấu ăn rất khéo."
            },
            {
              "option": "スーパーの店員さんです",
              "reason": "Là bạn cùng phòng."
            },
            {
              "option": "料理が嫌いな人です",
              "reason": "Ngược lại với bài đọc."
            }
          ]
        }
      },
      {
        "id": "jpd123-q10-4",
        "prompt": "筆者は何をしながら話しましたか。",
        "options": [
          "冷たいお茶やジュースを飲みながら話しました",
          "一人でテレビを見ながら話しました",
          "部屋をそうじしながら話しました",
          "音楽を聞きながら宿題をしました"
        ],
        "answer": "冷たいお茶やジュースを飲みながら話しました",
        "explanation": {
          "meaning": "Tác giả vừa làm gì vừa trò chuyện? Đáp án: Vừa uống trà lạnh và nước ép vừa nói chuyện.",
          "reason": "Dẫn chứng câu 5:「私は冷たいお茶やジュースを飲みながら、日本のせいかつについて楽しく話しました。」",
          "wrongOptions": [
            {
              "option": "一人でテレビを見ながら話しました",
              "reason": "Uống trà và nước ép cùng bạn bè."
            },
            {
              "option": "部屋をそうじしながら話しました",
              "reason": "Không vừa dọn phòng vừa nói chuyện."
            },
            {
              "option": "音楽を聞きながら宿題をしました",
              "reason": "Không làm bài tập trong bữa tiệc."
            }
          ]
        }
      }
    ]
  },
  // JPD123-READ-11
  {
    "id": "jpd123-read-11",
    "course": "JPD123",
    "title": "東京のIT会社見学とインタビュー",
    "titleVi": "Chuyến tham quan công ty CNTT tại Tokyo và phỏng vấn",
    "theme": "Tham quan doanh nghiệp, máy tính, giới thiệu bản thân và tinh thần hợp tác",
    "content": "先週の水曜日、私たちは東京のIT会社へ見学に行きました。会社の入口で受付の人にじぶんの名前と国を言ってから、オフィスに入りました。広い部屋で社員の人がパソコンを使いながら熱心に仕事をしていました。午後は会議室でぶちょうのせつめいを聞いて、会社についての本やしりょうを読みました。仕事には高いぎじゅつだけでなく、人とよく話してきょう力する力も大切だと教えてくれました。社員の人たちにおれいを言ってから、午後五時にアパートへ帰りました。",
    "sentences": [
      {
        "jp": "先週の水曜日、私たちは東京のIT会社へ見学に行きました。",
        "vi": "Thứ Tư tuần trước, chúng tôi đã đi tham quan một công ty công nghệ thông tin ở Tokyo.",
        "romaji": "Senshuu no suiyoubi, watashitachi wa Toukyou no ai-tii kaisha e kengaku ni ikimashita."
      },
      {
        "jp": "会社の入口で受付の人にじぶんの名前と国を言ってから、オフィスに入りました。",
        "vi": "Tại lối vào của công ty, sau khi nói tên và quốc tịch của mình với lễ tân, chúng tôi đã bước vào văn phòng.",
        "romaji": "Kaisha no iriguchi de uketsuke no hito ni jibun no namae to kuni o itte kara, ofisu ni hairimashita."
      },
      {
        "jp": "広い部屋で社員の人がパソコンを使いながら熱心に仕事をしていました。",
        "vi": "Trong căn phòng rộng rãi, các nhân viên đang chăm chỉ làm việc bên máy vi tính.",
        "romaji": "Hiroi heya de shain no hito ga pasokon o tsukainagara nesshin ni shigoto o shite imashita."
      },
      {
        "jp": "午後は会議室でぶちょうのせつめいを聞いて、会社についての本やしりょうを読みました。",
        "vi": "Buổi chiều tại phòng họp, chúng tôi đã nghe giải thích của trưởng phòng và đọc sách tài liệu về công ty.",
        "romaji": "Gogo wa kaigishitsu de buchou no setsumei o kiite, kaisha ni tsuite no hon ya shiryou o yomimashita."
      },
      {
        "jp": "仕事には高いぎじゅつだけでなく、人とよく話してきょう力する力も大切だと教えてくれました。",
        "vi": "Người ta đã dạy cho chúng tôi rằng trong công việc không chỉ cần kỹ thuật cao mà năng lực giao tiếp và hợp tác với mọi người cũng rất quan trọng.",
        "romaji": "Shigoto ni wa takai gijutsu dakedenaku, hito to yoku hanashite kyouryoku suru chikara mo taisetsu da to oshiete kuremashita."
      },
      {
        "jp": "社員の人たちにおれいを言ってから、午後五時にアパートへ帰りました。",
        "vi": "Sau khi cảm ơn các nhân viên công ty, chúng tôi đã trở về căn hộ vào lúc 5 giờ chiều.",
        "romaji": "Shain no hitotachi ni orei o itte kara, gogo go-ji ni apaato e kaerimashita."
      }
    ],
    "translation": "Thứ Tư tuần trước, nhóm sinh viên chúng tôi có chuyến tham quan thực tế tại một công ty phần mềm ở Tokyo. Tại sảnh đón tiếp, sau khi xưng tên và quốc gia của mình với nhân viên lễ tân, chúng tôi được dẫn vào văn phòng làm việc. Trong không gian làm việc rộng rãi, các kỹ sư phần mềm đang chăm chú làm việc trên máy tính. Sang buổi chiều, chúng tôi lắng nghe trưởng phòng thuyết trình tại phòng hội nghị và đọc các tài liệu giới thiệu công ty. Chúng tôi được chia sẻ một bài học quý báu: làm việc không chỉ cần chuyên môn kỹ thuật giỏi mà kỹ năng giao tiếp và sức mạnh hợp tác đồng đội cũng vô cùng cần thiết. Sau khi gửi lời cảm ơn sâu sắc đến mọi người, đúng 5 giờ chiều chúng tôi lên tàu trở về căn hộ.",
    "romaji": "Senshuu no suiyoubi, watashitachi wa Toukyou no ai-tii kaisha e kengaku ni ikimashita. Kaisha no iriguchi de uketsuke no hito ni jibun no namae to kuni o itte kara, ofisu ni hairimashita. Hiroi heya de shain no hito ga pasokon o tsukainagara nesshin ni shigoto o shite imashita. Gogo wa kaigishitsu de buchou no setsumei o kiite, kaisha ni tsuite no hon ya shiryou o yomimashita. Shigoto ni wa takai gijutsu dakedenaku, hito to yoku hanashite kyouryoku suru chikara mo taisetsu da to oshiete kuremashita. Shain no hitotachi ni orei o itte kara, gogo go-ji ni apaato e kaerimashita.",
    "vocabularyUsed": [
      "先週",
      "水曜日",
      "私",
      "東京",
      "会社",
      "見学",
      "行く",
      "入口",
      "人",
      "自分",
      "名前",
      "国",
      "言う",
      "入る",
      "広い",
      "部屋",
      "社員",
      "パソコン",
      "使う",
      "仕事",
      "午後",
      "説明",
      "聞く",
      "本",
      "読む",
      "高い",
      "話す",
      "力",
      "教える",
      "アパート",
      "帰る"
    ],
    "kanjiUsed": [
      "先",
      "週",
      "水",
      "曜",
      "日",
      "私",
      "東",
      "京",
      "会",
      "社",
      "見",
      "行",
      "入",
      "人",
      "名",
      "前",
      "国",
      "言",
      "午",
      "後",
      "聞",
      "本",
      "読",
      "高",
      "話",
      "力",
      "帰"
    ],
    "questions": [
      {
        "id": "jpd123-q11-1",
        "prompt": "会社の入口でまず何をしましたか。",
        "options": [
          "じぶんの名前と国を言いました",
          "すぐにお金を払いました",
          "お土産をわたしました",
          "写真を撮りました"
        ],
        "answer": "じぶんの名前と国を言いました",
        "explanation": {
          "meaning": "Tại lối vào của công ty, trước tiên họ đã làm gì? Đáp án: Nói tên và quốc tịch của mình.",
          "reason": "Dẫn chứng câu 2:「会社の入口で受付の人にじぶんの名前と国を言ってから、オフィスに入りました。」",
          "wrongOptions": [
            {
              "option": "すぐにお金を払いました",
              "reason": "Đi tham quan học tập, không phải trả tiền."
            },
            {
              "option": "お土産をわたしました",
              "reason": "Không tặng quà tại cửa."
            },
            {
              "option": "写真を撮りました",
              "reason": "Họ làm thủ tục giới thiệu tên và quốc tịch."
            }
          ]
        }
      },
      {
        "id": "jpd123-q11-2",
        "prompt": "社員の人は部屋で何をしていましたか。",
        "options": [
          "パソコンを使いながら熱心に仕事をしていました",
          "お茶を飲んで休んでいました",
          "新聞を読んでいました",
          "テレビを見ていました"
        ],
        "answer": "パソコンを使いながら熱心に仕事をしていました",
        "explanation": {
          "meaning": "Các nhân viên công ty đang làm gì trong phòng? Đáp án: Vừa dùng máy tính vừa chăm chỉ làm việc.",
          "reason": "Dẫn chứng câu 3:「広い部屋で社員の人がパソコンを使いながら熱心に仕事をしていました。」",
          "wrongOptions": [
            {
              "option": "お茶を飲んで休んでいました",
              "reason": "Họ làm việc chăm chỉ, không ngồi uống trà."
            },
            {
              "option": "新聞を読んでいました",
              "reason": "Họ thao tác máy vi tính."
            },
            {
              "option": "テレビを見ていました",
              "reason": "Không xem tivi."
            }
          ]
        }
      },
      {
        "id": "jpd123-q11-3",
        "prompt": "午後に会議室で何をしましたか。",
        "options": [
          "ぶちょうのせつめいを聞いて会社についての本やしりょうを読みました",
          "テストを受けました",
          "お弁当を食べました",
          "みんなで歌を歌いました"
        ],
        "answer": "ぶちょうのせつめいを聞いて会社についての本やしりょうを読みました",
        "explanation": {
          "meaning": "Buổi chiều tại phòng họp họ đã làm gì? Đáp án: Nghe trưởng phòng giải thích và đọc sách tài liệu về công ty.",
          "reason": "Dẫn chứng câu 4:「午後は会議室でぶちょうのせつめいを聞いて、会社についての本やしりょうを読みました。」",
          "wrongOptions": [
            {
              "option": "テストを受けました",
              "reason": "Không thi cử tại đây."
            },
            {
              "option": "お弁当を食べました",
              "reason": "Không ăn cơm hộp."
            },
            {
              "option": "みんなで歌を歌いました",
              "reason": "Không hát hò."
            }
          ]
        }
      },
      {
        "id": "jpd123-q11-4",
        "prompt": "仕事で何が大切だと教えてくれましたか。",
        "options": [
          "高い技術と人と協力する力です",
          "お金をたくさん使うことです",
          "一人で休まずに働くことです",
          "外国へたくさん旅行することです"
        ],
        "answer": "高い技術と人と協力する力です",
        "explanation": {
          "meaning": "Người ta đã dạy điều gì là quan trọng trong công việc? Đáp án: Kỹ thuật cao và năng lực hợp tác với mọi người.",
          "reason": "Dẫn chứng câu 5:「仕事には高いぎじゅつだけでなく、人とよく話してきょう力する力も大切だと教えてくれました。」",
          "wrongOptions": [
            {
              "option": "お金をたくさん使うことです",
              "reason": "Cần kỹ thuật và năng lực giao tiếp hợp tác."
            },
            {
              "option": "一人で休まずに働くことです",
              "reason": "Cần hợp tác làm việc nhóm."
            },
            {
              "option": "外国へたくさん旅行することです",
              "reason": "Không phải nội dung được khuyên."
            }
          ]
        }
      }
    ]
  },
  // JPD123-READ-12
  {
    "id": "jpd123-read-12",
    "course": "JPD123",
    "title": "東京での生活と週末の休み",
    "titleVi": "Cuộc sống ở Tokyo và ngày nghỉ cuối tuần",
    "theme": "Khu vực đô thị, lịch sinh hoạt hàng tuần, thư viện và thể thao",
    "content": "私は今、東京の新宿区のアパートに住んでいます。この市や区はデパートやレストランが多くて、毎日とてもにぎやかです。毎週月曜日から金曜日まで大学で日本語を勉強して、夜は少し休みます。土曜日は図書館で本を読んだり、ノートに日本語の文を書いたりします。来週の休みにはいなかのきれいな田んぼや山を見に行きたいとおもっています。日曜日の午後は友達とサッカーをしてから、早くアパートへ帰ります。",
    "sentences": [
      {
        "jp": "私は今、東京の新宿区のアパートに住んでいます。",
        "vi": "Hiện tại tôi đang sống trong một căn hộ ở quận Shinjuku, Tokyo.",
        "romaji": "Watashi wa ima, Toukyou no Shinjuku-ku no apaato ni sunde imasu."
      },
      {
        "jp": "この市や区はデパートやレストランが多くて、毎日とてもにぎやかです。",
        "vi": "Thành phố và quận này có nhiều trung tâm thương mại và nhà hàng nên mỗi ngày đều vô cùng nhộn nhịp.",
        "romaji": "Kono shi ya ku wa depaato ya resutoran ga ookute, mainichi totemo nigiyaka desu."
      },
      {
        "jp": "毎週月曜日から金曜日まで大学で日本語を勉強して、夜は少し休みます。",
        "vi": "Mỗi tuần từ thứ Hai đến thứ Sáu tôi học tiếng Nhật ở trường đại học, tối đến thì nghỉ ngơi một chút.",
        "romaji": "Maishuu getsuyoubi kara kinyoubi made daigaku de nihongo o benkyou shite, yoru wa sukoshi yasumimasu."
      },
      {
        "jp": "土曜日は図書館で本を読んだり、ノートに日本語の文を書いたりします。",
        "vi": "Thứ Bảy tôi thường đọc sách ở thư viện và viết các câu tiếng Nhật vào vở.",
        "romaji": "Doyoubi wa toshokan de hon o yondari, nooto ni nihongo no bun o kaitari shimasu."
      },
      {
        "jp": "来週の休みにはいなかのきれいな田んぼや山を見に行きたいとおもっています。",
        "vi": "Vào kỳ nghỉ tuần tới, tôi dự định đi ngắm những cánh đồng lúa và núi non xinh đẹp ở miền quê.",
        "romaji": "Raishuu no yasumi ni wa inaka no kireina tanbo ya yama o mi ni ikitai to omotte imasu."
      },
      {
        "jp": "日曜日の午後は友達とサッカーをしてから、早くアパートへ帰ります。",
        "vi": "Chiều Chủ nhật sau khi đá bóng cùng bạn bè, tôi về căn hộ sớm.",
        "romaji": "Nichiyoubi no gogo wa tomodachi to sakkaa o shite kara, hayaku apaato e kaerimasu."
      }
    ],
    "translation": "Hiện tại tôi đang sinh sống tại một căn hộ tiện nghi ở quận Shinjuku, thủ đô Tokyo. Quận đô thị sầm uất này tập trung vô số trung tâm bách hóa và nhà hàng sang trọng, lúc nào cũng tấp nập người qua lại. Mỗi tuần, từ thứ Hai đến thứ Sáu tôi đều đặn đến giảng đường học tiếng Nhật, tối về dành thời gian nghỉ ngơi dưỡng sức. Thứ Bảy tôi đến thư viện yên tĩnh đọc sách và luyện viết văn bản tiếng Nhật vào cuốn sổ tay. Tuần tới được nghỉ, tôi ấp ủ dự định đi về vùng thôn quê thanh bình ngắm những cánh đồng lúa trải dài và dãy núi non trập trùng. Chiều Chủ nhật sau khi chơi bóng đá rèn luyện sức khỏe cùng bạn bè, tôi trở về căn hộ sớm để chuẩn bị cho tuần mới.",
    "romaji": "Watashi wa ima, Toukyou no Shinjuku-ku no apaato ni sunde imasu. Kono shi ya ku wa depaato ya resutoran ga ookute, mainichi totemo nigiyaka desu. Maishuu getsuyoubi kara kinyoubi made daigaku de nihongo o benkyou shite, yoru wa sukoshi yasumimasu. Doyoubi wa toshokan de hon o yondari, nooto ni nihongo no bun o kaitari shimasu. Raishuu no yasumi ni wa inaka no kireina tanbo ya yama o mi ni ikitai to omotte imasu. Nichiyoubi no gogo wa tomodachi to sakkaa o shite kara, hayaku apaato e kaerimasu.",
    "vocabularyUsed": [
      "私",
      "今",
      "東京",
      "区",
      "アパート",
      "市",
      "デパート",
      "レストラン",
      "多い",
      "毎日",
      "毎週",
      "月曜日",
      "金曜日",
      "大学",
      "日本語",
      "勉強",
      "夜",
      "少し",
      "休む",
      "土曜日",
      "図書館",
      "本",
      "読む",
      "ノート",
      "書く",
      "来週",
      "休み",
      "田んぼ",
      "山",
      "見る",
      "行く",
      "日曜日",
      "午後",
      "友達",
      "サッカー",
      "早く",
      "帰る"
    ],
    "kanjiUsed": [
      "私",
      "今",
      "東",
      "京",
      "区",
      "市",
      "大",
      "毎",
      "日",
      "週",
      "月",
      "曜",
      "金",
      "学",
      "本",
      "語",
      "休",
      "土",
      "読",
      "書",
      "来",
      "田",
      "見",
      "行",
      "午",
      "後",
      "帰"
    ],
    "questions": [
      {
        "id": "jpd123-q12-1",
        "prompt": "筆者はどこに住んでいますか。",
        "options": [
          "東京の新宿区のアパートです",
          "京都の古いお寺です",
          "大学の寮の小さい部屋です",
          "外国の静かな町です"
        ],
        "answer": "東京の新宿区のアパートです",
        "explanation": {
          "meaning": "Tác giả đang sống ở đâu? Đáp án: Căn hộ ở quận Shinjuku, Tokyo.",
          "reason": "Dẫn chứng câu 1:「私は今、東京の新宿区のアパートに住んでいます。」",
          "wrongOptions": [
            {
              "option": "京都の古いお寺です",
              "reason": "Tác giả sống ở Shinjuku, Tokyo."
            },
            {
              "option": "大学の寮の小さい部屋です",
              "reason": "Sống ở căn hộ riêng."
            },
            {
              "option": "外国の静かな町です",
              "reason": "Sống ở khu đô thị nhộn nhịp."
            }
          ]
        }
      },
      {
        "id": "jpd123-q12-2",
        "prompt": "筆者は毎週何曜日から何曜日まで勉強しますか。",
        "options": [
          "月曜日から金曜日まで勉強します",
          "土曜日と日曜日だけ勉強します",
          "水曜日と木曜日だけです",
          "毎日朝から晩まで休みます"
        ],
        "answer": "月曜日から金曜日まで勉強します",
        "explanation": {
          "meaning": "Tác giả học từ thứ mấy đến thứ mấy mỗi tuần? Đáp án: Từ thứ Hai đến thứ Sáu.",
          "reason": "Dẫn chứng câu 3:「毎週月曜日から金曜日まで大学で日本語を勉強して、夜は少し休みます。」",
          "wrongOptions": [
            {
              "option": "土曜日と日曜日だけ勉強します",
              "reason": "Học từ thứ Hai đến thứ Sáu."
            },
            {
              "option": "水曜日と木曜日だけです",
              "reason": "Lịch học cả tuần."
            },
            {
              "option": "毎日朝から晩まで休みます",
              "reason": "Tác giả học tập rất chăm chỉ."
            }
          ]
        }
      },
      {
        "id": "jpd123-q12-3",
        "prompt": "土曜日の午後は何をしますか。",
        "options": [
          "図書館で本を読んだりノートに文を書いたりします",
          "一人でアパートをそうじします",
          "会社でアルバイトをします",
          "一日中寝ています"
        ],
        "answer": "図書館で本を読んだりノートに文を書いたりします",
        "explanation": {
          "meaning": "Thứ Bảy tác giả làm gì? Đáp án: Đọc sách ở thư viện và viết câu vào vở.",
          "reason": "Dẫn chứng câu 4:「土曜日は図書館で本を読んだり、ノートに日本語の文を書いたりします。」",
          "wrongOptions": [
            {
              "option": "一人でアパートをそうじします",
              "reason": "Đọc sách và luyện viết ở thư viện."
            },
            {
              "option": "会社でアルバイトをします",
              "reason": "Không đi làm thêm vào thứ Bảy."
            },
            {
              "option": "一日中寝ています",
              "reason": "Dành thời gian học tập bổ ích."
            }
          ]
        }
      },
      {
        "id": "jpd123-q12-4",
        "prompt": "来週の休みは何をしたいと思っていますか。",
        "options": [
          "いなかのきれいな田んぼや山を見に行きたいです",
          "デパートで高い服を買いたいです",
          "海で泳ぎたいです",
          "国へ帰りたいです"
        ],
        "answer": "いなかのきれいな田んぼや山を見に行きたいです",
        "explanation": {
          "meaning": "Kỳ nghỉ tuần tới tác giả mong muốn làm gì? Đáp án: Đi ngắm ruộng lúa và núi non tuyệt đẹp ở miền quê.",
          "reason": "Dẫn chứng câu 5:「来週の休みにはいなかのきれいな田んぼや山を見に行きたいとおもっています。」",
          "wrongOptions": [
            {
              "option": "デパートで高い服を買いたいです",
              "reason": "Muốn đi dã ngoại ngắm cảnh đồng quê."
            },
            {
              "option": "海で泳ぎたいです",
              "reason": "Muốn ngắm núi và ruộng đồng."
            },
            {
              "option": "国へ帰りたいです",
              "reason": "Không về nước vào dịp này."
            }
          ]
        }
      }
    ]
  },
  // JPD123-READ-13
  {
    "id": "jpd123-read-13",
    "course": "JPD123",
    "title": "浅草の雷門とお寺の見学",
    "titleVi": "Tham quan cổng Kaminarimon và ngôi chùa ở Asakusa",
    "theme": "Du lịch Asakusa, cổng chào Kaminarimon, chùa cổ Sensoji và quán giải khát",
    "content": "先週の日曜日、留学生の男の人と女の人で東京のあさくさへ行きました。駅を出てから、とても大きくて有名な赤色の門を見ました。この門の名前はかみなり門で、毎日世界中の国から観光客がたくさん来ています。門をとおってから古いお寺へ行って、みんなでおいのりをしました。近くの小さい店できねんの食べ物やおみやげを買って、カフェで冷たいジュースやコーヒーを飲みました。午後三時半に地下鉄で会社のアパートへ帰りました。",
    "sentences": [
      {
        "jp": "先週の日曜日、留学生の男の人と女の人で東京のあさくさへ行きました。",
        "vi": "Chủ nhật tuần trước, nhóm du học sinh gồm cả các bạn nam và nữ đã đi đến Asakusa ở Tokyo.",
        "romaji": "Senshuu no nichiyoubi, ryuugakusei no otoko no hito to onna no hito de Toukyou no Asakusa e ikimashita."
      },
      {
        "jp": "駅を出てから、とても大きくて有名な赤色の門を見ました。",
        "vi": "Sau khi ra khỏi nhà ga, chúng tôi đã nhìn thấy chiếc cổng màu đỏ rất lớn và nổi tiếng.",
        "romaji": "Eki o dete kara, totemo ookikute yuumeina akairo no mon o mimashita."
      },
      {
        "jp": "この門の名前はかみなり門で、毎日世界中の国から観光客がたくさん来ています。",
        "vi": "Chiếc cổng này có tên là Kaminarimon, mỗi ngày đều có rất nhiều du khách từ các quốc gia trên thế giới ghé thăm.",
        "romaji": "Kono mon no namae wa Kaminarimon de, mainichi sekaijuu no kuni kara kankoukyaku ga takusan kite imasu."
      },
      {
        "jp": "門をとおってから古いお寺へ行って、みんなでおいのりをしました。",
        "vi": "Sau khi đi qua cổng, chúng tôi đến ngôi chùa cổ và cùng nhau cầu nguyện.",
        "romaji": "Mon o tootte kara furui otera e itte, minna de oinori o shimashita."
      },
      {
        "jp": "近くの小さい店できねんの食べ物やおみやげを買って、喫茶店で冷たいジュースを飲みました。",
        "vi": "Tại một cửa hàng nhỏ gần đó, chúng tôi mua quà lưu niệm và đồ ăn kỷ niệm, rồi vào quán nước uống nước ép lạnh.",
        "romaji": "Chikaku no chiisai mise de kinen no tabemono ya omiyage o katte, kafe de tsumetai juusu ya koohii o nomimashita."
      },
      {
        "jp": "午後三時半に地下鉄で会社のアパートへ帰りました。",
        "vi": "Lúc 3 giờ rưỡi chiều, chúng tôi đi tàu điện ngầm trở về căn hộ do công ty sắp xếp.",
        "romaji": "Gogo san-jihan ni chikatetsu de kaisha no apaato e kaerimashita."
      }
    ],
    "translation": "Vào ngày Chủ nhật tuần trước, các bạn lưu học sinh nam và nữ chúng tôi rủ nhau đi tham quan Asakusa, Tokyo. Vừa bước chân ra khỏi ga tàu, sừng sững trước mắt chúng tôi là chiếc cổng màu đỏ khổng lồ vô cùng nổi tiếng. Cổng này mang tên Kaminarimon (Lôi Môn), nơi đón hàng ngàn lượt khách từ khắp năm châu mỗi ngày. Bước qua cổng lớn, chúng tôi tiến vào ngôi chùa cổ kính thanh tịnh và cùng nhau dâng hương nguyện cầu bình an. Ở một gian hàng nhỏ xinh gần chùa, cả nhóm chọn mua đặc sản đồ ăn và quà lưu niệm, rồi ghé quán cà phê nhâm nhi cốc nước ép hoa quả mát lạnh. Đúng 3 giờ rưỡi chiều, chúng tôi lên tàu điện ngầm trở về căn hộ của công ty.",
    "romaji": "Senshuu no nichiyoubi, ryuugakusei no otoko no hito to onna no hito de Toukyou no Asakusa e ikimashita. Eki o dete kara, totemo ookikute yuumeina akairo no mon o mimashita. Kono mon no namae wa Kaminarimon de, mainichi sekaijuu no kuni kara kankoukyaku ga takusan kite imasu. Mon o tootte kara furui otera e itte, minna de oinori o shimashita. Chikaku no chiisai mise de kinen no tabemono ya omiyage o katte, kissaten de tsumetai juusu o nomimashita. Gogo san-jihan ni chikatetsu de kaisha no apaato e kaerimashita.",
    "vocabularyUsed": [
      "先週",
      "日曜日",
      "留学生",
      "男",
      "女",
      "東京",
      "行く",
      "出る",
      "大きい",
      "有名",
      "門",
      "名前",
      "毎日",
      "国",
      "来る",
      "古い",
      "お寺",
      "近く",
      "小さい",
      "店",
      "食べ物",
      "お土産",
      "買う",
      "喫茶店",
      "冷たい",
      "ジュース",
      "飲む",
      "午後",
      "三時半",
      "地下鉄",
      "会社",
      "アパート",
      "帰る"
    ],
    "kanjiUsed": [
      "先",
      "週",
      "日",
      "曜",
      "学",
      "生",
      "男",
      "人",
      "女",
      "東",
      "京",
      "行",
      "大",
      "門",
      "名",
      "前",
      "毎",
      "国",
      "来",
      "寺",
      "見",
      "小",
      "食",
      "物",
      "買",
      "飲",
      "午",
      "後",
      "三",
      "時",
      "半",
      "会",
      "社",
      "帰"
    ],
    "questions": [
      {
        "id": "jpd123-q13-1",
        "prompt": "筆者はだれとあさくさへ行きましたか。",
        "options": [
          "留学生の男の人と女の人で行きました",
          "高校の先生と行きました",
          "一人だけで行きました",
          "会社の人と行きました"
        ],
        "answer": "留学生の男の人と女の人で行きました",
        "explanation": {
          "meaning": "Tác giả đã đi Asakusa cùng ai? Đáp án: Đi cùng các bạn du học sinh nam và nữ.",
          "reason": "Dẫn chứng câu 1:「留学生の男の人と女の人で東京のあさくさへ行きました。」",
          "wrongOptions": [
            {
              "option": "高校の先生と行きました",
              "reason": "Đi cùng bạn du học sinh."
            },
            {
              "option": "一人だけで行きました",
              "reason": "Đi theo nhóm bạn bè."
            },
            {
              "option": "会社的人と行きました",
              "reason": "Nhóm du học sinh rủ nhau đi chơi."
            }
          ]
        }
      },
      {
        "id": "jpd123-q13-2",
        "prompt": "駅を出てから何を見ましたか。",
        "options": [
          "大きくて有名な赤色の門を見ました",
          "高いタワーを見ました",
          "新しい自動車を見ました",
          "大きい海を見ました"
        ],
        "answer": "大きくて有名な赤色の門を見ました",
        "explanation": {
          "meaning": "Sau khi ra khỏi ga, họ đã nhìn thấy cái gì? Đáp án: Nhìn thấy cổng lớn màu đỏ nổi tiếng (Kaminarimon).",
          "reason": "Dẫn chứng câu 2:「駅を出てから、とても大きくて有名な赤色の門を見ました。」",
          "wrongOptions": [
            {
              "option": "高いタワーを見ました",
              "reason": "Nhìn thấy chiếc cổng lớn màu đỏ."
            },
            {
              "option": "新しい自動車を見ました",
              "reason": "Không phải nhìn ô tô mới."
            },
            {
              "option": "大きい海を見ました",
              "reason": "Asakusa ở trung tâm Tokyo, không có biển."
            }
          ]
        }
      },
      {
        "id": "jpd123-q13-3",
        "prompt": "門をとおってから何をしましたか。",
        "options": [
          "古いお寺へ行って、みんなでおいのりをしました",
          "すぐにレストランでごはんを食べました",
          "ホテルで休みました",
          "デパートへ買い物に行きました"
        ],
        "answer": "古いお寺へ行って、みんなでおいのりをしました",
        "explanation": {
          "meaning": "Sau khi đi qua cổng họ đã làm gì? Đáp án: Vào chùa cổ và cùng nhau cầu nguyện.",
          "reason": "Dẫn chứng câu 4:「門をとおってから古いお寺へ行って、みんなでおいのりをしました。」",
          "wrongOptions": [
            {
              "option": "すぐにレストランでごはんを食べました",
              "reason": "Họ vào chùa tham quan và cầu nguyện trước."
            },
            {
              "option": "ホテルで休みました",
              "reason": "Họ tiếp tục mua sắm quà lưu niệm."
            },
            {
              "option": "デパートへ買い物に行きました",
              "reason": "Không đi trung tâm bách hóa."
            }
          ]
        }
      },
      {
        "id": "jpd123-q13-4",
        "prompt": "喫茶店で何を飲みましたか。",
        "options": [
          "冷たいジュースを飲みました",
          "温かいお茶を飲みました",
          "ビールを飲みました",
          "コーヒーを飲みました"
        ],
        "answer": "冷たいジュースを飲みました",
        "explanation": {
          "meaning": "Ở quán nước họ đã uống gì? Đáp án: Uống nước ép lạnh.",
          "reason": "Dẫn chứng câu 5:「喫茶店で冷たいジュースを飲みました。」",
          "wrongOptions": [
            {
              "option": "温かいお茶を飲みました",
              "reason": "Họ uống nước trái cây mát lạnh (冷たいジュース)."
            },
            {
              "option": "ビールを飲みました",
              "reason": "Không uống bia."
            },
            {
              "option": "コーヒーを飲みました",
              "reason": "Bài nêu rõ nước ép (ジュース)."
            }
          ]
        }
      }
    ]
  },
  // JPD123-READ-14
  {
    "id": "jpd123-read-14",
    "course": "JPD123",
    "title": "スーパーでの買い物とカレー料理",
    "titleVi": "Mua sắm ở siêu thị và nấu món cà ri",
    "theme": "Mua sắm, nấu ăn, nguyên liệu thực phẩm, dụng cụ ăn uống và trò chuyện",
    "content": "毎週土曜日の午前、私は山田さんと区の大きいスーパーへ買い物に行きます。スーパーには新鮮なとり肉や魚や野さいがたくさん売られています。コンビニの物より安いですから、私たちはいつもここで食べ物を買います。アパートへ帰ってから、スプーンなどの食事のどう具をじゅんびして、おいしいカレー料理を作りました。会社や大学の友達と会話をしながら大きいテーブルで食べて、とても楽しかったです。自分で作った日本のカレー料理は、レストランの料理よりずっとおいしかったです。",
    "sentences": [
      {
        "jp": "毎週土曜日の午前、私は山田さんと区の大きいスーパーへ買い物に行きます。",
        "vi": "Sáng thứ Bảy hàng tuần, tôi cùng bạn Yamada đi mua sắm ở siêu thị lớn trong quận.",
        "romaji": "Maishuu doyoubi no gozen, watashi wa Yamada-san to ku no ookii suupaa e kaimono ni ikimasu."
      },
      {
        "jp": "スーパーには新鮮なとり肉や魚や野さいがたくさん売られています。",
        "vi": "Tại siêu thị bày bán rất nhiều thịt gà tươi ngon, cá và rau củ quả.",
        "romaji": "Suupaa ni wa shinsenna toriniku ya sakana ya yasai ga takusan urarete imasu."
      },
      {
        "jp": "コンビニの物より安いですから、私たちはいつもここで食べ物を買います。",
        "vi": "Vì rẻ hơn đồ ở cửa hàng tiện lợi nên chúng tôi luôn mua thức ăn ở đây.",
        "romaji": "Konbini no mono yori yasui desu kara, watashitachi wa itsumo koko de tabemono o kaimasu."
      },
      {
        "jp": "アパートへ帰ってから、スプーンなどの食事のどう具をじゅんびして、おいしいカレー料理を作りました。",
        "vi": "Sau khi về căn hộ, chúng tôi chuẩn bị các dụng cụ ăn uống như thìa và nấu món cà ri thơm ngon.",
        "romaji": "Apaato e kaette kara, supuun nado no shokuji no dougu o junbi shite, oishii karee ryouri o tsukurimashita."
      },
      {
        "jp": "会社や大学の友達と会話をしながら大きいテーブルで食べて、とても楽しかったです。",
        "vi": "Vừa trò chuyện với bạn bè ở công ty và trường đại học, vừa cùng ăn bên chiếc bàn lớn, chúng tôi thấy rất vui.",
        "romaji": "Kaisha ya daigaku no tomodachi to kaiwa o shinagara ookii teeburu de tabete, totemo tanoshikatta desu."
      },
      {
        "jp": "自分で作った日本のカレー料理は、レストランの料理よりずっとおいしかったです。",
        "vi": "Món cà ri Nhật Bản tự nấu ngon hơn nhiều so với món ăn ở nhà hàng.",
        "romaji": "Jibun de tsukutta Nihon no karee ryouri wa, resutoran no ryouri yori zutto oishikatta desu."
      }
    ],
    "translation": "Cứ vào sáng thứ Bảy mỗi tuần, tôi lại cùng anh Yamada rảo bước đến siêu thị lớn trong quận để mua thực phẩm. Quầy kệ siêu thị ngập tràn thịt gà tươi, cá tươi cùng rau xanh mơn mởn. So với cửa hàng tiện lợi thì giá cả ở đây rẻ hơn rất nhiều, nên chúng tôi luôn chọn nơi này làm điểm mua sắm quen thuộc. Xách đồ về căn hộ, chúng tôi nhanh chóng chuẩn bị các dụng cụ ăn uống như thìa dĩa và bắt tay vào nấu món cơm cà ri thơm lừng. Cùng bạn bè ở trường đại học và đồng nghiệp công ty vừa rôm rả trò chuyện vừa thưởng thức món ăn bên chiếc bàn lớn, không khí tràn ngập niềm vui. Đĩa cà ri phong cách Nhật tự tay chúng tôi nấu ngon hơn hẳn đồ ăn ở các nhà hàng thông thường.",
    "romaji": "Maishuu doyoubi no gozen, watashi wa Yamada-san to ku no ookii suupaa e kaimono ni ikimasu. Suupaa ni wa shinsenna toriniku ya sakana ya yasai ga takusan urarete imasu. Konbini no mono yori yasui desu kara, watashitachi wa itsumo koko de tabemono o kaimasu. Apaato e kaette kara, supuun nado no shokuji no dougu o junbi shite, oishii karee ryouri o tsukurimashita. Kaisha ya daigaku no tomodachi to kaiwa o shinagara ookii teeburu de tabete, totemo tanoshikatta desu. Jibun de tsukutta Nihon no karee ryouri wa, resutoran no ryouri yori zutto oishikatta desu.",
    "vocabularyUsed": [
      "毎週",
      "土曜日",
      "午前",
      "私",
      "山田",
      "区",
      "大きい",
      "スーパー",
      "買い物",
      "行く",
      "肉",
      "野菜",
      "コンビニ",
      "物",
      "安い",
      "食べ物",
      "買う",
      "アパート",
      "帰る",
      "スプーン",
      "食事",
      "道具",
      "カレー",
      "料理",
      "作る",
      "会社",
      "大学",
      "友達",
      "会話",
      "テーブル",
      "食べる",
      "自分",
      "日本",
      "レストラン"
    ],
    "kanjiUsed": [
      "毎",
      "週",
      "土",
      "曜",
      "日",
      "午",
      "前",
      "私",
      "山",
      "田",
      "区",
      "大",
      "買",
      "物",
      "行",
      "肉",
      "野",
      "安",
      "食",
      "帰",
      "具",
      "料",
      "理",
      "会",
      "社",
      "学",
      "自",
      "分",
      "本"
    ],
    "questions": [
      {
        "id": "jpd123-q14-1",
        "prompt": "筆者は毎週土曜日の午前、だれとスーパーへ行きますか。",
        "options": [
          "山田さんと行きます",
          "田中さんと行きます",
          "先生と行きます",
          "一人で行きます"
        ],
        "answer": "山田さんと行きます",
        "explanation": {
          "meaning": "Sáng thứ Bảy hàng tuần tác giả đi siêu thị cùng ai? Đáp án: Đi cùng bạn Yamada.",
          "reason": "Dẫn chứng câu 1:「毎週土曜日の午前、私は山田さんと区の大きいスーパーへ買い物に行きます。」",
          "wrongOptions": [
            {
              "option": "田中さんと行きます",
              "reason": "Đi cùng Yamada (山田さん)."
            },
            {
              "option": "先生と行きます",
              "reason": "Không đi cùng giáo viên."
            },
            {
              "option": "一人で行きます",
              "reason": "Có bạn Yamada đồng hành."
            }
          ]
        }
      },
      {
        "id": "jpd123-q14-2",
        "prompt": "スーパーで何を買いましたか。",
        "options": [
          "とり肉や魚や野さいを買いました",
          "ジュースとお菓子だけ買いました",
          "本とノートを買いました",
          "洋服と靴を買いました"
        ],
        "answer": "とり肉や魚や野さいを買いました",
        "explanation": {
          "meaning": "Họ đã mua gì tại siêu thị? Đáp án: Thịt gà, cá và rau củ tươi.",
          "reason": "Dẫn chứng câu 2:「スーパーには新鮮なとり肉や魚や野さいがたくさん売られています。」",
          "wrongOptions": [
            {
              "option": "ジュースとお菓子だけ買いました",
              "reason": "Họ mua thịt gà, cá và rau để nấu ăn."
            },
            {
              "option": "本とノートを買いました",
              "reason": "Không mua sách vở ở quầy thực phẩm."
            },
            {
              "option": "洋服と靴を買いました",
              "reason": "Không đi mua sắm trang phục."
            }
          ]
        }
      },
      {
        "id": "jpd123-q14-3",
        "prompt": "なぜこのスーパーで食べ物を買いますか。",
        "options": [
          "コンビニの物より安いですから",
          "大学からとても近いですから",
          "日本の料理がたくさんありますから",
          "友達が働いていますから"
        ],
        "answer": "コンビニの物より安いですから",
        "explanation": {
          "meaning": "Tại sao họ lại mua đồ ăn ở siêu thị này? Đáp án: Vì giá rẻ hơn so với cửa hàng tiện lợi.",
          "reason": "Dẫn chứng câu 3:「コンビニの物より安いですから、私たちはいつもここで食べ物を買います。」",
          "wrongOptions": [
            {
              "option": "大学からとても近いですから",
              "reason": "Lý do là giá rẻ hơn cửa hàng tiện ích."
            },
            {
              "option": "日本の料理がたくさんありますから",
              "reason": "Họ mua nguyên liệu về tự nấu."
            },
            {
              "option": "友達が働いていますから",
              "reason": "Không có chi tiết này trong bài."
            }
          ]
        }
      },
      {
        "id": "jpd123-q14-4",
        "prompt": "アパートへ帰ってから何をしましたか。",
        "options": [
          "食事のどう具をじゅんびしておいしいカレー料理を作りました",
          "テレビを見て寝ました",
          "宿題をしました",
          "そうじをしました"
        ],
        "answer": "食事のどう具をじゅんびしておいしいカレー料理を作りました",
        "explanation": {
          "meaning": "Sau khi về căn hộ họ đã làm gì? Đáp án: Chuẩn bị dụng cụ ăn uống và nấu món cà ri ngon.",
          "reason": "Dẫn chứng câu 4:「アパートへ帰ってから、スプーンなどの食事のどう具をじゅんびして、おいしいカレー料理を作りました。」",
          "wrongOptions": [
            {
              "option": "テレビを見て寝ました",
              "reason": "Họ cùng nhau chuẩn bị và nấu ăn."
            },
            {
              "option": "宿題をしました",
              "reason": "Họ nấu cà ri ăn cùng bạn bè."
            },
            {
              "option": "そうじをしました",
              "reason": "Không phải dọn dẹp."
            }
          ]
        }
      }
    ]
  },
  // JPD123-READ-15
  {
    "id": "jpd123-read-15",
    "course": "JPD123",
    "title": "大学の日本語の授業とインタビュー",
    "titleVi": "Giờ học tiếng Nhật ở trường đại học và phỏng vấn",
    "theme": "Giảng đường đại học, chữ Hán, phát âm to rõ và kỹ năng giao tiếp",
    "content": "毎日の授業で、私たちは先生の日本語のせつめいを熱心に聞きます。先生はテキストを開けてこくばんにかんじを書いて、私たちに「大きい声で読んでください」と言いました。それから、パソコンやノートを使って、隣のルームメイトといっしょに日本語で話す練習をしました。テキストの文を読んだり、ノートにじぶんの名前や国について書いたりしました。外国語を勉強することは大変ですが、人と話す力がふえてとても嬉しいです。しょうらいは日本の有名な会社で働いて、たくさんの人と会話をしたいです。",
    "sentences": [
      {
        "jp": "毎日の授業で、私たちは先生の日本語のせつめいを熱心に聞きます。",
        "vi": "Trong mỗi tiết học hàng ngày, chúng tôi đều chăm chú lắng nghe thầy giáo giải thích tiếng Nhật.",
        "romaji": "Mainichi no jugyou de, watashitachi wa sensei no nihongo no setsumei o nesshin ni kikimasu."
      },
      {
        "jp": "先生はこくばんにかんじを書いて、私たちに「大きい声で読んでください」と言いました。",
        "vi": "Thầy viết chữ Hán lên bảng đen và dặn chúng tôi: 'Các em hãy đọc to câu văn lên nhé'.",
        "romaji": "Sensei wa kokuban ni kanji o kaite, watashitachi ni 'ookii koe de yonde kudasai' to iimashita."
      },
      {
        "jp": "それから、隣の学生といっしょに日本語で話す練習をしました。",
        "vi": "Sau đó, tôi cùng bạn sinh viên ngồi bên cạnh luyện tập hội thoại bằng tiếng Nhật.",
        "romaji": "Sorekara, tonari no gakusei to issho ni nihongo de hanasu renshuu o shimashita."
      },
      {
        "jp": "テキストの文を読んだり、ノートにじぶんの名前や国について書いたりしました。",
        "vi": "Chúng tôi vừa đọc câu văn trong sách giáo khoa, vừa viết tên và quốc gia của mình vào vở.",
        "romaji": "Kyoukasho no bun o yondari, nooto ni jibun no namae ya kuni ni tsuite kaitari shimashita."
      },
      {
        "jp": "外国語を勉強することは大変ですが、人と話す力がふえてとても嬉しいです。",
        "vi": "Học ngoại ngữ tuy có nhiều vất vả nhưng năng lực giao tiếp với mọi người ngày một tiến bộ khiến tôi rất vui.",
        "romaji": "Gaikokugo o benkyou suru koto wa taihen desu ga, hito to hanasu chikara ga fuete totemo ureshii desu."
      },
      {
        "jp": "しょうらいは日本の有名な会社で働いて、たくさんの人と会話をしたいです。",
        "vi": "Trong tương lai, tôi mong muốn được làm việc tại một công ty nổi tiếng ở Nhật Bản và trò chuyện cùng nhiều người.",
        "romaji": "Shourai wa Nihon no yuumeina kaisha de hataraite, takusan no hito to kaiwa o shitai desu."
      }
    ],
    "translation": "Trong các giờ học mỗi ngày trên giảng đường, cả lớp đều chăm chú lắng nghe thầy giáo giảng giải tỉ mỉ từng mẫu ngữ pháp tiếng Nhật. Thầy nắn nót viết từng chữ Hán lên bảng rồi ân cần nhắc nhở: 'Các em hãy mở to giọng đọc đồng thanh câu này nhé'. Sau đó, tôi bắt cặp cùng bạn sinh viên bàn bên để cùng nhau luyện tập hội thoại giao tiếp. Chúng tôi đọc to các đoạn văn trong sách giáo khoa, rồi ghi chép cẩn thận tên tuổi và quê hương đất nước của mình vào cuốn sổ tay. Việc trau dồi một ngôn ngữ mới tuy đòi hỏi nhiều công sức và sự kiên trì, nhưng nhìn thấy năng lực giao tiếp và trò chuyện của mình ngày càng vững vàng, tôi cảm thấy vô cùng hạnh phúc và tự hào. Sau này tôi khát khao được cống hiến tại một công ty danh tiếng tại Nhật Bản, tự tin đàm đạo và hợp tác cùng bạn bè khắp muôn phương.",
    "romaji": "Mainichi no jugyou de, watashitachi wa sensei no nihongo no setsumei o nesshin ni kikimasu. Sensei wa tekisuto o akete kokuban ni kanji o kaite, watashitachi ni 'ookii koe de yonde kudasai' to iimashita. Sorekara, pasokon ya nooto o tsukatte, tonari no ruumumeito to issho ni nihongo de hanasu renshuu o shimashita. Kyoukasho no bun o yondari, nooto ni jibun no namae ya kuni ni tsuite kaitari shimashita. Gaikokugo o benkyou suru koto wa taihen desu ga, hito to hanasu chikara ga fuete totemo ureshii desu. Shourai wa Nihon no yuumeina kaisha de hataraite, takusan no hito to kaiwa o shitai desu.",
    "vocabularyUsed": [
      "毎日",
      "授業",
      "私",
      "先生",
      "日本語",
      "説明",
      "聞く",
      "書く",
      "大きい",
      "声",
      "読む",
      "言う",
      "学生",
      "話す",
      "練習",
      "文",
      "ノート",
      "自分",
      "名前",
      "国",
      "外国語",
      "勉強",
      "大変",
      "人",
      "力",
      "嬉しい",
      "日本",
      "有名",
      "会社",
      "働く",
      "会話"
    ],
    "kanjiUsed": [
      "毎",
      "日",
      "私",
      "先",
      "生",
      "本",
      "語",
      "聞",
      "書",
      "大",
      "読",
      "言",
      "学",
      "話",
      "名",
      "前",
      "国",
      "外",
      "人",
      "力",
      "有",
      "会",
      "社"
    ],
    "questions": [
      {
        "id": "jpd123-q15-1",
        "prompt": "学生たちは授業で先生の何を熱心に聞きますか。",
        "options": [
          "日本語のせつめいを熱心に聞きます",
          "音楽を聞きます",
          "ラジオのニュースを聞きます",
          "友達の歌を聞きます"
        ],
        "answer": "日本語のせつめいを熱心に聞きます",
        "explanation": {
          "meaning": "Các bạn học sinh chăm chú lắng nghe điều gì của thầy giáo trong giờ học? Đáp án: Lắng nghe giải thích tiếng Nhật.",
          "reason": "Dẫn chứng câu 1:「毎日の授業で、私たちは先生の日本語のせつめいを熱心に聞きます。」",
          "wrongOptions": [
            {
              "option": "音楽を聞きます",
              "reason": "Nghe thầy giải thích bài học, không nghe nhạc."
            },
            {
              "option": "ラジオのニュースを聞きます",
              "reason": "Không nghe đài phát thanh."
            },
            {
              "option": "友達の歌を聞きます",
              "reason": "Không nghe hát."
            }
          ]
        }
      },
      {
        "id": "jpd123-q15-2",
        "prompt": "先生は黒板に何を書きましたか。",
        "options": [
          "かんじを書きました",
          "えを書きました",
          "英語を書きました",
          "数字だけを書きました"
        ],
        "answer": "かんじを書きました",
        "explanation": {
          "meaning": "Thầy giáo đã viết gì lên bảng đen? Đáp án: Viết chữ Hán (Kanji).",
          "reason": "Dẫn chứng câu 2:「先生はこくばんにかんじを書いて、私たちに「大きい声で読んでください」と言いました。」",
          "wrongOptions": [
            {
              "option": "えを書きました",
              "reason": "Thầy viết chữ Hán, không vẽ tranh."
            },
            {
              "option": "英語を書きました",
              "reason": "Viết chữ Hán tiếng Nhật."
            },
            {
              "option": "数字だけを書きました",
              "reason": "Không chỉ viết con số."
            }
          ]
        }
      },
      {
        "id": "jpd123-q15-3",
        "prompt": "隣の学生といっしょに何をしましたか。",
        "options": [
          "日本語で話す練習をしました",
          "ゲームをしました",
          "ごはんを食べました",
          "テレビを見ました"
        ],
        "answer": "日本語で話す練習をしました",
        "explanation": {
          "meaning": "Tác giả đã làm gì cùng bạn sinh viên ngồi cạnh? Đáp án: Luyện tập hội thoại bằng tiếng Nhật.",
          "reason": "Dẫn chứng câu 3:「それから、隣の学生といっしょに日本語で話す練習をしました。」",
          "wrongOptions": [
            {
              "option": "ゲームをしました",
              "reason": "Họ luyện giao tiếp tiếng Nhật."
            },
            {
              "option": "ごはんを食べました",
              "reason": "Không ăn cơm trong lớp học."
            },
            {
              "option": "テレビを見ました",
              "reason": "Không xem tivi."
            }
          ]
        }
      },
      {
        "id": "jpd123-q15-4",
        "prompt": "外国語の勉強について、筆者はどう思っていますか。",
        "options": [
          "人と話す力がふえてとても嬉しいです",
          "つまらないと思っています",
          "難しくて嫌いです",
          "ぜんぜん役に立たないと思っています"
        ],
        "answer": "人と話す力がふえてとても嬉しいです",
        "explanation": {
          "meaning": "Về việc học ngoại ngữ, tác giả có suy nghĩ gì? Đáp án: Rất vui vì năng lực nói chuyện giao tiếp ngày càng tăng tiến.",
          "reason": "Dẫn chứng câu 5:「人と話す力がふえてとても嬉しいです。」",
          "wrongOptions": [
            {
              "option": "つまらないと思っています",
              "reason": "Tác giả thấy rất vui và tự hào."
            },
            {
              "option": "難しくて嫌いです",
              "reason": "Dù vất vả nhưng tác giả rất yêu thích."
            },
            {
              "option": "ぜんぜん役に立たないと思っています",
              "reason": "Ngược lại hoàn toàn với cảm xúc tích cực của bài."
            }
          ]
        }
      }
    ]
  },
  // JPD123-READ-16
  {
    "id": "jpd123-read-16",
    "course": "JPD123",
    "title": "市での生活と週末のスポーツ",
    "titleVi": "Đời sống ở thành phố và thể thao cuối tuần",
    "theme": "Cuộc sống tiện ích tại đô thị, hẹn gặp cuối tuần, thể thao và ôn tập thi",
    "content": "私は今、東京の近くのきれいな市に住んでいます。この町は大きい公園や小さい店があって、とても便利です。毎週水曜日の午後、大学のグラウンドで友達とサッカーを練習します。今週の土曜日は本田さんとテニスの試合を見に行く約束をしました。日曜日の朝はアパートで少し休んでから、午後は田んぼの近くを散歩してリフレッシュします。来週のテストのために夜は早く帰って勉強します。",
    "sentences": [
      {
        "jp": "私は今、東京の近くのきれいな市に住んでいます。",
        "vi": "Hiện tại tôi đang sống ở một thành phố xinh đẹp nằm gần Tokyo.",
        "romaji": "Watashi wa ima, Toukyou no chikaku no kireina shi ni sunde imasu."
      },
      {
        "jp": "この町は大きい公園や小さい店があって、とても便利です。",
        "vi": "Thị trấn này có công viên rộng và những cửa hàng nhỏ, vô cùng tiện lợi.",
        "romaji": "Kono machi wa ookii kouen ya chiisai mise ga atte, totemo benri desu."
      },
      {
        "jp": "毎週水曜日の午後、大学のグラウンドで友達とサッカーを練習します。",
        "vi": "Mỗi chiều thứ Tư, tôi cùng các bạn luyện tập bóng đá trên sân vận động của trường đại học.",
        "romaji": "Maishuu suiyoubi no gogo, daigaku no guraundo de tomodachi to sakkaa o renshuu shimasu."
      },
      {
        "jp": "今週の土曜日は本田さんとテニスの試合を見に行く約束をしました。",
        "vi": "Thứ Bảy tuần này, tôi đã hẹn cùng bạn Honda đi xem trận đấu quần vợt.",
        "romaji": "Konshuu no doyoubi wa Honda-san to tenisu no shiai o mi ni iku yakusoku o shimashita."
      },
      {
        "jp": "日曜日の朝はアパートで少し休んでから、午後は田んぼの近くを散歩してリフレッシュします。",
        "vi": "Sáng Chủ nhật nghỉ ngơi một chút ở căn hộ, chiều đến tôi đi dạo gần cánh đồng lúa để lấy lại năng lượng.",
        "romaji": "Nichiyoubi no asa wa apaato de sukoshi yasunde kara, gogo wa tanbo no chikaku o sanpo shite rifuresshu shimasu."
      },
      {
        "jp": "来週のテストのために夜は早く帰って勉強します。",
        "vi": "Vì kỳ kiểm tra tuần tới, tối đến tôi về nhà sớm và chăm chỉ ôn bài.",
        "romaji": "Raishuu no tesuto no tame ni yoru wa hayaku kaette benkyou shimasu."
      }
    ],
    "translation": "Hiện tại tôi đang tận hưởng cuộc sống tại một thành phố thanh bình và xinh đẹp nằm ngay gần thủ đô Tokyo. Khu đô thị này có công viên cây xanh rộng lớn và các cửa hàng tiện ích phong phú, sinh hoạt vô cùng thuận tiện. Vào các buổi chiều thứ Tư hàng tuần, tôi cùng bạn bè trong trường đại học ra sân vận động tập luyện bóng đá. Thứ Bảy tuần này, tôi có hẹn cùng anh Honda đi xem một trận thi đấu tennis hấp dẫn. Sáng Chủ nhật tôi dành chút thời gian thảnh thơi nghỉ ngơi trong phòng, rồi chiều đến rảo bước dạo mát dọc con đường ven những ruộng lúa xanh ngát để hít thở bầu không khí trong lành. Hướng đến kỳ thi kiểm tra quan trọng vào tuần sau, mỗi tối tôi đều về căn hộ sớm để tập trung ôn tập bài vở.",
    "romaji": "Watashi wa ima, Toukyou no chikaku no kireina shi ni sunde imasu. Kono machi wa ookii kouen ya chiisai mise ga atte, totemo benri desu. Maishuu suiyoubi no gogo, daigaku no guraundo de tomodachi to sakkaa o renshuu shimasu. Konshuu no doyoubi wa Honda-san to tenisu no shiai o mi ni iku yakusoku o shimashita. Nichiyoubi no asa wa apaato de sukoshi yasunde kara, gogo wa tanbo no chikaku o sanpo shite rifuresshu shimasu. Raishuu no tesuto no tame ni yoru wa hayaku kaette benkyou shimasu.",
    "vocabularyUsed": [
      "私",
      "今",
      "東京",
      "近く",
      "市",
      "住む",
      "町",
      "大きい",
      "公園",
      "小さい",
      "店",
      "便利",
      "毎週",
      "水曜日",
      "午後",
      "大学",
      "友達",
      "サッカー",
      "練習",
      "今週",
      "土曜日",
      "テニス",
      "試合",
      "見る",
      "行く",
      "約束",
      "日曜日",
      "朝",
      "アパート",
      "少し",
      "休む",
      "田んぼ",
      "散歩",
      "来週",
      "テスト",
      "夜",
      "早く",
      "帰る",
      "勉強"
    ],
    "kanjiUsed": [
      "私",
      "今",
      "東",
      "京",
      "市",
      "大",
      "小",
      "毎",
      "週",
      "水",
      "曜",
      "日",
      "午",
      "後",
      "学",
      "土",
      "見",
      "行",
      "本",
      "田",
      "休",
      "来",
      "帰"
    ],
    "questions": [
      {
        "id": "jpd123-q16-1",
        "prompt": "筆者が住んでいる町はどんな町ですか。",
        "options": [
          "大きい公園や小さい店があってとても便利な町です",
          "にぎやかでうるさい町です",
          "何も店がない不便な町です",
          "海が近いきれいな町です"
        ],
        "answer": "大きい公園や小さい店があってとても便利な町です",
        "explanation": {
          "meaning": "Thành phố tác giả đang sống là nơi như thế nào? Đáp án: Có công viên lớn và các cửa hàng nhỏ, rất tiện lợi.",
          "reason": "Dẫn chứng câu 2:「この町は大きい公園や小さい店があって、とても便利です。」",
          "wrongOptions": [
            {
              "option": "にぎやかでうるさい町です",
              "reason": "Bài nhấn mạnh cảnh đẹp và tính tiện lợi."
            },
            {
              "option": "何も店がない不便な町です",
              "reason": "Có nhiều cửa hàng nhỏ tiện ích."
            },
            {
              "option": "海が近いきれいな町です",
              "reason": "Gần cánh đồng lúa và công viên, không nhắc đến biển."
            }
          ]
        }
      },
      {
        "id": "jpd123-q16-2",
        "prompt": "毎週水曜日の午後は何をしますか。",
        "options": [
          "大学のグラウンドで友達とサッカーを練習します",
          "図書館で本を読みます",
          "部屋をそうじします",
          "アルバイトをします"
        ],
        "answer": "大学のグラウンドで友達とサッカーを練習します",
        "explanation": {
          "meaning": "Chiều thứ Tư hàng tuần tác giả làm gì? Đáp án: Tập bóng đá cùng bạn bè trên sân vận động trường.",
          "reason": "Dẫn chứng câu 3:「毎週水曜日の午後、大学のグラウンドで友達とサッカーを練習します。」",
          "wrongOptions": [
            {
              "option": "図書館で本を読みます",
              "reason": "Tác giả tập luyện thể thao bóng đá."
            },
            {
              "option": "部屋をそうじします",
              "reason": "Không phải lịch dọn phòng."
            },
            {
              "option": "アルバイトをします",
              "reason": "Không đi làm thêm vào giờ này."
            }
          ]
        }
      },
      {
        "id": "jpd123-q16-3",
        "prompt": "今週の土曜日はだれと約束をしましたか。",
        "options": [
          "本田さんとテニスの試合を見に行く約束をしました",
          "山田さんと映画を見る約束をしました",
          "田中さんと買い物に行く約束をしました",
          "先生と会う約束をしました"
        ],
        "answer": "本田さんとテニスの試合を見に行く約束をしました",
        "explanation": {
          "meaning": "Thứ Bảy tuần này tác giả đã hẹn cùng ai? Đáp án: Hẹn cùng bạn Honda đi xem trận đấu tennis.",
          "reason": "Dẫn chứng câu 4:「今週の土曜日は本田さんとテニスの試合を見に行く約束をしました。」",
          "wrongOptions": [
            {
              "option": "山田さんと映画を見る約束をしました",
              "reason": "Hẹn với Honda đi xem quần vợt."
            },
            {
              "option": "田中さんと買い物に行く約束をしました",
              "reason": "Không phải đi mua sắm cùng Tanaka."
            },
            {
              "option": "先生と会う約束をしました",
              "reason": "Không có lịch hẹn gặp thầy cô."
            }
          ]
        }
      },
      {
        "id": "jpd123-q16-4",
        "prompt": "来週の何のために夜は早く帰って勉強しますか。",
        "options": [
          "来週のテストのためです",
          "スピーチ大会のためです",
          "日本旅行のためです",
          "面接のためです"
        ],
        "answer": "来週のテストのためです",
        "explanation": {
          "meaning": "Vì sự kiện gì vào tuần sau mà buổi tối tác giả về sớm để học? Đáp án: Vì kỳ thi kiểm tra tuần tới.",
          "reason": "Dẫn chứng câu kết:「来週のテストのために夜は早く帰って勉強します。」",
          "wrongOptions": [
            {
              "option": "スピーチ大会のためです",
              "reason": "Để chuẩn bị cho kỳ kiểm tra (テスト)."
            },
            {
              "option": "日本旅行のためです",
              "reason": "Không phải chuẩn bị đi du lịch."
            },
            {
              "option": "面接のためです",
              "reason": "Không phải chuẩn bị phỏng vấn."
            }
          ]
        }
      }
    ]
  },
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
  createExamSet(
    "jpd113-set-2",
    "JPD113",
    "JPD113 読解問題セット 2",
    "Bộ đề 2: Lớp học, thời gian biểu và mua sắm (Phủ 100% 34 Kanji Bài 1–3)",
    READING_PASSAGES_JPD113.slice(4, 8),
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
  createExamSet(
    "jpd123-set-3",
    "JPD123",
    "JPD123 読解問題セット 3（第4課〜第7課の漢字全網羅）",
    "Bộ đề 3: Du lịch Kyoto, ẩm thực và văn phòng FPT (Phủ 100% 43 Kanji Bài 4–7)",
    READING_PASSAGES_JPD123.slice(8, 12),
  ),
  createExamSet(
    "jpd123-set-4",
    "JPD123",
    "JPD123 読解問題セット 4（第4課〜第7課の漢字全網羅）",
    "Bộ đề 4: Lễ hội Asakusa, mua sắm và thể thao cuối tuần (Phủ 100% 43 Kanji Bài 4–7)",
    READING_PASSAGES_JPD123.slice(12, 16),
  ),
];
