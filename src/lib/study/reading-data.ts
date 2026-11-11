import type { ReadingPassage } from "./reading-types.ts";
import { getAllowedKanjiChars, replaceUntaughtKanjiWithKana } from "./kana-reading.ts";

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
          reason: "Bài đọc ghi:「へやはひろくないですが、しずかです。」",
          wrongOptions: [
            { option: "ひろくて、にぎやかです", reason: "Trái ngược với thông tin trong bài." },
            { option: "せまくて、うるさいです", reason: "Phòng yên tĩnh chứ không ồn ào." },
            { option: "とてもひろいです", reason: "Bài nói rõ phòng không rộng." }
          ]
        }
      }
    ]
  },
  {
    id: "jpd113-read-3",
    course: "JPD113",
    title: "大学のとしょかん",
    titleVi: "Thư viện của trường đại học",
    theme: "Thời gian và địa điểm học tập",
    content: "FPT大学のとしょかんは二かいにあります。としょかんは月曜日からきんようびまであきます。時間は午前九時から午後六時までです。土曜日と日曜日は休みです。としょかんには日本語の本がたくさんあります。わたしは水曜日の午後にとしょかんへ行きます。",
    sentences: [
      { jp: "FPT大学のとしょかんは二かいにあります。", vi: "Thư viện trường Đại học FPT ở tầng 2.", romaji: "Efu-pii-tii daigaku no toshokan wa nikai ni arimasu." },
      { jp: "としょかんは月曜日からきんようびまであきます。", vi: "Thư viện mở cửa từ thứ Hai đến thứ Sáu.", romaji: "Toshokan wa getsuyoubi kara kinyoubi made akimasu." },
      { jp: "時間は午前九時から午後六時までです。", vi: "Thời gian từ 9 giờ sáng đến 6 giờ chiều.", romaji: "Jikan wa gozen ku-ji kara gogo roku-ji made desu." },
      { jp: "土曜日と日曜日は休みです。", vi: "Thứ Bảy và Chủ nhật là ngày nghỉ.", romaji: "Doyoubi to nichiyoubi wa yasumi desu." },
      { jp: "としょかんには日本語の本がたくさんあります。", vi: "Ở thư viện có rất nhiều sách tiếng Nhật.", romaji: "Toshokan ni wa nihongo no hon ga takusan arimasu." },
      { jp: "わたしは水曜日の午後にとしょかんへ行きます。", vi: "Tôi đến thư viện vào chiều thứ Tư.", romaji: "Watashi wa suiyoubi no gogo ni toshokan e ikimasu." }
    ],
    translation: "Thư viện trường Đại học FPT nằm ở tầng 2. Thư viện mở cửa từ thứ Hai đến thứ Sáu. Giờ mở cửa từ 9 giờ sáng đến 6 giờ chiều. Thứ Bảy và Chủ nhật nghỉ. Ở thư viện có rất nhiều sách tiếng Nhật. Tôi thường đến thư viện vào chiều thứ Tư.",
    romaji: "Efu-pii-tii daigaku no toshokan wa nikai ni arimasu. Toshokan wa getsuyoubi kara kinyoubi made akimasu. Jikan wa gozen ku-ji kara gogo roku-ji made desu. Doyoubi to nichiyoubi wa yasumi desu. Toshokan ni wa nihongo no hon ga takusan arimasu. Watashi wa suiyoubi no gogo ni toshokan e ikimasu.",
    vocabularyUsed: ["図書館", "大学", "二階", "月曜日", "金曜日", "土曜日", "日曜日", "水曜日", "午前", "午後", "休み", "行きます"],
    kanjiUsed: ["学", "二", "月", "火", "水", "木", "土", "日", "曜", "九", "六", "時", "間", "私", "本", "語"],
    questions: [
      {
        id: "jpd113-q3-1",
        prompt: "としょかんは何かいにありますか。",
        options: ["二かいにあります", "一かいにあります", "三かいにあります", "四かいにあります"],
        answer: "二かいにあります",
        explanation: {
          meaning: "Thư viện ở tầng mấy? Đáp án: Ở tầng 2.",
          reason: "Bài đọc nêu rõ câu đầu tiên:「FPT大学のとしょかんは二かいにあります。」",
          wrongOptions: [
            { option: "一かいにあります", reason: "Tầng 1 là sai." },
            { option: "三かいにあります", reason: "Tầng 3 là sai." },
            { option: "四かいにあります", reason: "Tầng 4 là sai." }
          ]
        }
      },
      {
        id: "jpd113-q3-2",
        prompt: "としょかんの休みは何曜日ですか。",
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
  }
];

const RAW_PASSAGES_JPD123: ReadingPassage[] = [
  {
    id: "jpd123-read-1",
    course: "JPD123",
    title: "ハノイの四季とりょこう",
    titleVi: "Bốn mùa ở Hà Nội và chuyến du lịch",
    theme: "Thời tiết, bốn mùa và so sánh",
    content: "ハノイには四季があります。はる、なつ、あき、ふゆです。なつはとてもあついですが、ふゆはさむいです。わたしはあきが一番すきです。あきはすずしくて、てんきがとてもいいですからです。なつとふゆとどちらがすきですか。日本のふゆはハノイのふゆよりずっとさむいです。ゆきがふりますから、ふゆ休みに日本へ行きたいです。新幹線にのって、りょこうをしたいです。",
    sentences: [
      { jp: "ハノイには四季があります。", vi: "Hà Nội có bốn mùa.", romaji: "Hanoi ni wa shiki ga arimasu." },
      { jp: "はる、なつ、あき、ふゆです。", vi: "Đó là xuân, hạ, thu, đông.", romaji: "Haru, natsu, aki, fuyu desu." },
      { jp: "なつはとてもあついですが、ふゆはさむいです。", vi: "Mùa hè rất nóng, nhưng mùa đông thì lạnh.", romaji: "Natsu wa totemo atsui desu ga, fuyu wa samui desu." },
      { jp: "わたしはあきが一番すきです。", vi: "Tôi thích mùa thu nhất.", romaji: "Watashi wa aki ga ichiban suki desu." },
      { jp: "あきはすずしくて、てんきがとてもいいですからです。", vi: "Bởi vì mùa thu mát mẻ và thời tiết rất đẹp.", romaji: "Aki wa suzushikute, tenki ga totemo ii kara desu." },
      { jp: "なつとふゆとどちらがすきですか。", vi: "Giữa mùa hè và mùa đông bạn thích mùa nào hơn?", romaji: "Natsu to fuyu to dochira ga suki desu ka." },
      { jp: "日本のふゆはハノイのふゆよりずっとさむいです。", vi: "Mùa đông ở Nhật Bản lạnh hơn nhiều so với mùa đông ở Hà Nội.", romaji: "Nihon no fuyu wa Hanoi no fuyu yori zutto samui desu." },
      { jp: "ゆきがふりますから、ふゆ休みに日本へ行きたいです。", vi: "Vì có tuyết rơi nên vào kỳ nghỉ đông tôi muốn đi Nhật.", romaji: "Yuki ga furimasu kara, fuyuyasumi ni Nihon e ikitai desu." },
      { jp: "新幹線にのって、りょこうをしたいです。", vi: "Tôi muốn đi tàu Shinkansen và đi du lịch.", romaji: "Shinkansen ni notte, ryokou o shitai desu." }
    ],
    translation: "Hà Nội có 4 mùa rõ rệt: xuân, hạ, thu và đông. Mùa hè rất nóng, còn mùa đông thì lạnh. Tôi thích mùa thu nhất, vì mùa thu mát mẻ và thời tiết rất dễ chịu. Giữa mùa hè và mùa đông bạn thích mùa nào hơn? Mùa đông ở Nhật Bản lạnh hơn nhiều so với mùa đông ở Hà Nội. Vì ở Nhật có tuyết rơi nên tôi muốn đi du lịch Nhật Bản vào kỳ nghỉ đông để được đi tàu Shinkansen.",
    romaji: "Hanoi ni wa shiki ga arimasu. Haru, natsu, aki, fuyu desu. Natsu wa totemo atsui desu ga, fuyu wa samui desu. Watashi wa aki ga ichiban suki desu. Aki wa suzushikute, tenki ga totemo ii kara desu. Natsu to fuyu to dochira ga suki desu ka. Nihon no fuyu wa Hanoi no fuyu yori zutto samui desu. Yuki ga furimasu kara, fuyuyasumi ni Nihon e ikitai desu. Shinkansen ni notte, ryokou o shitai desu.",
    vocabularyUsed: ["春", "夏", "秋", "冬", "暑い", "寒い", "涼しい", "一番", "好き", "より", "旅行", "行きたい", "天気", "雪"],
    kanjiUsed: ["私", "日", "本", "四", "一", "休", "行", "新", "幹線"],
    questions: [
      {
        id: "jpd123-q1-1",
        prompt: "筆者はどのきせつが一番すきですか。",
        options: ["あきが一番すきです", "なつが一番すきです", "ふゆが一番すきです", "はるが一番すきです"],
        answer: "あきが一番すきです",
        explanation: {
          meaning: "Tác giả thích mùa nào nhất? Đáp án: Thích mùa thu nhất.",
          reason: "Trong bài đọc nêu rõ:「わたしはあきが一番すきです。」",
          wrongOptions: [
            { option: "なつが一番すきです", reason: "Mùa hè rất nóng, tác giả không chọn thích nhất." },
            { option: "ふゆが一番すきです", reason: "Mùa đông lạnh, không phải mùa thích nhất." },
            { option: "はるが一番すきです", reason: "Mùa xuân không được nhắc là mùa thích nhất." }
          ]
        }
      },
      {
        id: "jpd123-q1-2",
        prompt: "どうしてあきがすきですか。",
        options: ["すずしくて、てんきがいいからです", "あついからです", "ゆきがふるからです", "休みがたくさんあるからです"],
        answer: "すずしくて、てんきがいいからです",
        explanation: {
          meaning: "Tại sao tác giả lại thích mùa thu? Đáp án: Vì mát mẻ và thời tiết đẹp.",
          reason: "Bài viết giải thích trực tiếp nguyên nhân:「あきはすずしくて、てんきがとてもいいですからです。」",
          wrongOptions: [
            { option: "あついからです", reason: "Mùa hè mới nóng, không phải mùa thu." },
            { option: "ゆきがふるからです", reason: "Mùa đông ở Nhật mới có tuyết, mùa thu không có tuyết." },
            { option: "休みがたくさんあるからです", reason: "Bài đọc không đề cập đến lý do này." }
          ]
        }
      },
      {
        id: "jpd123-q1-3",
        prompt: "日本のふゆはどうですか。",
        options: ["ハノイのふゆよりずっとさむいです", "ハノイのふゆよりあたたかいです", "ハノイのふゆと同じくらいです", "あまりさむくないです"],
        answer: "ハノイのふゆよりずっとさむいです",
        explanation: {
          meaning: "Mùa đông ở Nhật Bản như thế nào? Đáp án: Lạnh hơn nhiều so với mùa đông ở Hà Nội.",
          reason: "Cấu trúc so sánh hơn trong bài:「日本のふゆはハノイのふゆよりずっとさむいです。」",
          wrongOptions: [
            { option: "ハノイのふゆよりあたたかいです", reason: "Ấm hơn là sai hoàn toàn." },
            { option: "ハノイのふゆと同じくらいです", reason: "Bằng nhau là sai." },
            { option: "あまりさむくないです", reason: "Ở Nhật tuyết rơi nên rất lạnh." }
          ]
        }
      },
      {
        id: "jpd123-q1-4",
        prompt: "筆者はふゆ休みに何をしたいですか。",
        options: ["日本へ行って、新幹線にのりたいです", "ハノイでずっと休みたいです", "うみへおよぎに行きたいです", "エアコンを買いたいです"],
        answer: "日本へ行って、新幹線にのりたいです",
        explanation: {
          meaning: "Tác giả muốn làm gì vào kỳ nghỉ đông? Đáp án: Muốn đi Nhật và đi tàu Shinkansen.",
          reason: "Hai câu cuối của bài:「ふゆ休みに日本へ行きたいです。新幹線にのって、りょこうをしたいです。」",
          wrongOptions: [
            { option: "ハノイでずっと休みたいです", reason: "Tác giả muốn đi du lịch Nhật Bản." },
            { option: "うみへおよぎに行きたいです", reason: "Mùa đông không đi biển bơi." },
            { option: "エアコンを買いたいです", reason: "Không có thông tin mua điều hòa." }
          ]
        }
      }
    ]
  },
  {
    id: "jpd123-read-2",
    course: "JPD123",
    title: "週末の料理パーティー",
    titleVi: "Bữa tiệc nấu ăn cuối tuần",
    theme: "Nấu ăn, thể て và yêu cầu lịch sự",
    content: "日曜日、わたしのへやで友達と料理を作りました。スーパーへ行って、牛肉と野菜を買いました。へやがあつかったですから、まどをあけてくださいと言いました。ナムさんはナイフで肉をきって、マイさんは野菜をあらいました。田中先生につくりかたをおしえてもらいました。日本のカレーはからくなくて、とてもおいしかったです。みんなでスプーンで食べました。とてもたのしかったです。",
    sentences: [
      { jp: "日曜日、わたしのへやで友達と料理を作りました。", vi: "Chủ nhật, tôi cùng bạn bè đã làm đồ ăn ở phòng tôi.", romaji: "Nichiyoubi, watashi no heya de tomodachi to ryouri o tsukurimashita." },
      { jp: "スーパーへ行って、牛肉と野菜を買いました。", vi: "Chúng tôi đã đi siêu thị và mua thịt bò và rau.", romaji: "Suupaa e itte, gyuuniku to yasai o kaimashita." },
      { jp: "へやがあつかったですから、まどをあけてくださいと言いました。", vi: "Vì phòng nóng nên tôi đã bảo: 'Hãy mở cửa sổ giúp'.", romaji: "Heya ga atsukatta desu kara, mado o akete kudasai to iimashita." },
      { jp: "ナムさんはナイフで肉をきって、マイさんは野菜をあらいました。", vi: "Bạn Nam dùng dao cắt thịt, còn bạn Mai rửa rau.", romaji: "Namu-san wa naifu de niku o kitte, Mai-san wa yasai o araimashita." },
      { jp: "田中先生につくりかたをおしえてもらいました。", vi: "Chúng tôi được thầy Tanaka dạy cho cách làm.", romaji: "Tanaka-sensei ni tsukurikata o oshiete moraimashita." },
      { jp: "日本のカレーはからくなくて、とてもおいしかったです。", vi: "Món cà ri Nhật Bản không cay và rất ngon.", romaji: "Nihon no karee wa karakunakute, totemo oishikatta desu." },
      { jp: "みんなでスプーンで食べました。", vi: "Mọi người cùng ăn bằng thìa.", romaji: "Minna de supuun de tabemashita." },
      { jp: "とてもたのしかったです。", vi: "Đã rất vui.", romaji: "Totemo tanoshikatta desu." }
    ],
    translation: "Chủ nhật vừa rồi, tôi cùng bạn bè nấu ăn ở phòng của tôi. Chúng tôi đã đến siêu thị mua thịt bò và rau tươi. Vì trong phòng nóng nên tôi nhờ bạn mở cửa sổ giúp. Nam dùng dao cắt thịt, còn Mai thì rửa rau. Chúng tôi được thầy Tanaka chỉ cho cách nấu. Món cà ri Nhật không bị cay mà rất vừa miệng và ngon. Mọi người cùng dùng thìa thưởng thức. Bữa tiệc hôm đó thật là vui.",
    romaji: "Nichiyoubi, watashi no heya de tomodachi to ryouri o tsukurimashita. Suupaa e itte, gyuuniku to yasai o kaimashita. Heya ga atsukatta desu kara, mado o akete kudasai to iimashita. Namu-san wa naifu de niku o kitte, Mai-san wa yasai o araimashita. Tanaka-sensei ni tsukurikata o oshiete moraimashita. Nihon no karee wa karakunakute, totemo oishikatta desu. Minna de supuun de tabemashita. Totemo tanoshikatta desu.",
    vocabularyUsed: ["料理", "作る", "牛肉", "野菜", "買う", "切る", "開ける", "作り方", "スプーン", "ナイフ", "おいしい", "辛くない", "楽しい"],
    kanjiUsed: ["日", "曜", "私", "友", "料", "理", "作", "買", "肉", "野", "食", "言", "話", "先", "生"],
    questions: [
      {
        id: "jpd123-q2-1",
        prompt: "スーパーで何を買いに行きましたか。",
        options: ["牛肉と野菜を買いました", "さかなとくだものを買いました", "ケーキとお茶を買いました", "お酒とビールを買いました"],
        answer: "牛肉と野菜を買いました",
        explanation: {
          meaning: "Đã đi mua gì ở siêu thị? Đáp án: Mua thịt bò và rau.",
          reason: "Bài viết nêu rõ:「スーパーへ行って、牛肉と野菜を買いました。」",
          wrongOptions: [
            { option: "さかなとくだものを買いました", reason: "Bài không mua cá hay hoa quả." },
            { option: "ケーキとお茶を買いました", reason: "Bài không mua bánh ngọt hay trà." },
            { option: "お酒とビールを買いました", reason: "Bài không mua rượu bia." }
          ]
        }
      },
      {
        id: "jpd123-q2-2",
        prompt: "ナムさんは何で肉をきりましたか。",
        options: ["ナイフできりました", "スプーンできりました", "フォークできりました", "手できりました"],
        answer: "ナイフできりました",
        explanation: {
          meaning: "Nam cắt thịt bằng cái gì? Đáp án: Bằng dao (ナイフで).",
          reason: "Trong bài có câu:「ナムさんはナイフで肉をきって…」",
          wrongOptions: [
            { option: "スプーンできりました", reason: "Thìa dùng để ăn cơm/cà ri, không dùng cắt thịt." },
            { option: "フォークできりました", reason: "Nĩa không dùng cắt thịt." },
            { option: "手できりました", reason: "Không đúng với nội dung bài đọc." }
          ]
        }
      },
      {
        id: "jpd123-q2-3",
        prompt: "カレーの味はどうでしたか。",
        options: ["からくなくて、とてもおいしかったです", "とてもからくて、食べられませんでした", "あまりおいしくなかったです", "あまくて、変な味でした"],
        answer: "からくなくて、とてもおいしかったです",
        explanation: {
          meaning: "Vị món cà ri như thế nào? Đáp án: Không cay và rất ngon.",
          reason: "Bài đọc nêu rõ:「日本のカレーはからくなくて、とてもおいしかったです。」",
          wrongOptions: [
            { option: "とてもからくて、食べられませんでした", reason: "Trái ngược với thông tin trong bài." },
            { option: "あまりおいしくなかったです", reason: "Món ăn ngon chứ không dở." },
            { option: "あまくて、変な味でした", reason: "Không có thông tin này trong bài." }
          ]
        }
      },
      {
        id: "jpd123-q2-4",
        prompt: "だれが料理のつくりかたをおしえましたか。",
        options: ["田中先生です", "マイさんです", "ナムさんです", "おかあさんです"],
        answer: "田中先生です",
        explanation: {
          meaning: "Ai đã dạy cách làm món ăn? Đáp án: Thầy Tanaka.",
          reason: "Bài ghi rõ:「田中先生につくりかたをおしえてもらいました。」",
          wrongOptions: [
            { option: "マイさんです", reason: "Mai là người rửa rau." },
            { option: "ナムさんです", reason: "Nam là người thái thịt." },
            { option: "おかあさんです", reason: "Không có mẹ trong bài đọc." }
          ]
        }
      }
    ]
  },
  {
    id: "jpd123-read-3",
    course: "JPD123",
    title: "週末のお祭りとやくそく",
    titleVi: "Lễ hội cuối tuần và lời hẹn",
    theme: "Sự kiện, rủ rê và từ chối khéo",
    content: "あした、FPT大学でお祭りがあります。いろいろな国の料理やうたがありますから、とてもにぎやかです。わたしはマイさんをさそいました。「あした、いっしょにお祭りへ行きませんか」。でも、マイさんは言いました。「あしたはちょっと…用事がありますから」。マイさんはアルバイトのやくそくがあります。ざんねんですが、わたしは一人で行きます。写真がたくさんとりたいです。",
    sentences: [
      { jp: "あした、FPT大学でお祭りがあります。", vi: "Ngày mai, ở trường Đại học FPT có lễ hội.", romaji: "Ashita, Efu-pii-tii daigaku de omatsuri ga arimasu." },
      { jp: "いろいろな国の料理やうたがありますから、とてもにぎやかです。", vi: "Vì có món ăn và bài hát của nhiều nước nên rất náo nhiệt.", romaji: "Iroirona kuni no ryouri ya uta ga arimasu kara, totemo nigiyaka desu." },
      { jp: "わたしはマイさんをさそいました。", vi: "Tôi đã rủ bạn Mai.", romaji: "Watashi wa Mai-san o sasoimashita." },
      { jp: "「あした、いっしょにお祭りへ行きませんか」。", vi: "'Ngày mai, cùng đi lễ hội với mình không?'.", romaji: "'Ashita, issho ni omatsuri e ikimasen ka'." },
      { jp: "でも、マイさんは言いました。", vi: "Nhưng Mai đã nói:", romaji: "Demo, Mai-san wa iimashita." },
      { jp: "「あしたはちょっと…用事がありますから」。", vi: "'Ngày mai thì hơi kẹt... vì mình có chút việc bận'.", romaji: "'Ashita wa chotto... youji ga arimasu kara'." },
      { jp: "マイさんはアルバイトのやくそくがあります。", vi: "Mai có lịch hẹn làm thêm.", romaji: "Mai-san wa arubaito no yakusoku ga arimasu." },
      { jp: "ざんねんですが、わたしは一人で行きます。", vi: "Tiếc thật, nhưng tôi sẽ đi một mình.", romaji: "Zannen desu ga, watashi wa hitori de ikimasu." },
      { jp: "写真がたくさんとりたいです。", vi: "Tôi muốn chụp thật nhiều ảnh.", romaji: "Shashin ga takusan toritai desu." }
    ],
    translation: "Ngày mai, tại trường Đại học FPT sẽ diễn ra lễ hội. Vì có nhiều món ăn và các tiết mục ca nhạc của nhiều quốc gia nên không khí chắc chắn rất náo nhiệt. Tôi đã rủ Mai: 'Ngày mai cùng đi lễ hội với mình nhé!'. Nhưng Mai đã khéo léo từ chối: 'Ngày mai thì hơi kẹt... vì mình có việc bận mất rồi'. Hóa ra Mai có lịch hẹn đi làm thêm. Tuy hơi tiếc nhưng tôi sẽ đi một mình. Tôi muốn chụp thật nhiều bức ảnh đẹp tại lễ hội.",
    romaji: "Ashita, Efu-pii-tii daigaku de omatsuri ga arimasu. Iroirona kuni no ryouri ya uta ga arimasu kara, totemo nigiyaka desu. Watashi wa Mai-san o sasoimashita. 'Ashita, issho ni omatsuri e ikimasen ka'. Demo, Mai-san wa iimashita. 'Ashita wa chotto... youji ga arimasu kara'. Mai-san wa arubaito no yakusoku ga arimasu. Zannen desu ga, watashi wa hitori de ikimasu. Shashin ga takusan toritai desu.",
    vocabularyUsed: ["お祭り", "大学", "料理", "歌", "にぎやか", "一緒", "ちょっと", "用事", "約束", "残念", "一人", "写真", "撮りたい"],
    kanjiUsed: ["大", "学", "私", "友", "料", "理", "国", "行", "来", "会", "社", "言", "話", "人", "一", "時"],
    questions: [
      {
        id: "jpd123-q3-1",
        prompt: "お祭りはどこでありますか。",
        options: ["FPT大学であります", "公園であります", "駅前であります", "ホテルであります"],
        answer: "FPT大学であります",
        explanation: {
          meaning: "Lễ hội diễn ra ở đâu? Đáp án: Ở trường Đại học FPT.",
          reason: "Câu mở đầu nêu rõ:「あした、FPT大学でお祭りがあります。」",
          wrongOptions: [
            { option: "公園であります", reason: "Công viên là sai." },
            { option: "駅前であります", reason: "Trước nhà ga là sai." },
            { option: "ホテルであります", reason: "Khách sạn là sai." }
          ]
        }
      },
      {
        id: "jpd123-q3-2",
        prompt: "マイさんはどうしてお祭りへ行きませんか。",
        options: ["用事とアルバイトのやくそくがあるからです", "お祭りがきらいだからです", "病気だからです", "お金がないからです"],
        answer: "用事とアルバイトのやくそくがあるからです",
        explanation: {
          meaning: "Tại sao Mai không đi lễ hội? Đáp án: Vì bận việc và có hẹn làm thêm.",
          reason: "Trong bài:「あしたはちょっと…用事がありますから。マイさんはアルバイトのやくそくがあります。」",
          wrongOptions: [
            { option: "お祭りがきらいだからです", reason: "Mai không nói ghét lễ hội." },
            { option: "病気だからです", reason: "Mai không bị ốm." },
            { option: "お金がないからです", reason: "Bài không nhắc đến việc thiếu tiền." }
          ]
        }
      },
      {
        id: "jpd123-q3-3",
        prompt: "「あしたはちょっと…」はどういう意味ですか。",
        options: ["ことわる（行けない）意味です", "さんせいする意味です", "しつもんする意味です", "時間を聞く意味です"],
        answer: "ことわる（行けない）意味です",
        explanation: {
          meaning: "Cụm 'Ngày mai thì hơi...' có ý nghĩa gì? Đáp án: Ý nghĩa từ chối khéo (không thể đi được).",
          reason: "Mẫu câu giao tiếp Bài 6:「〜はちょっと…」là cách từ chối khéo léo trong tiếng Nhật khi không thể nhận lời mời.",
          wrongOptions: [
            { option: "さんせいする意味です", reason: "Không phải đồng ý." },
            { option: "しつもんする意味です", reason: "Không phải đặt câu hỏi." },
            { option: "時間を聞く意味です", reason: "Không phải hỏi thời gian." }
          ]
        }
      },
      {
        id: "jpd123-q3-4",
        prompt: "筆者はお祭りで何をしたいですか。",
        options: ["写真をたくさんとりたいです", "たくさん食べたいです", "うたをうたいたいです", "買い物をしたいです"],
        answer: "写真をたくさんとりたいです",
        explanation: {
          meaning: "Tác giả muốn làm gì ở lễ hội? Đáp án: Muốn chụp nhiều ảnh.",
          reason: "Câu kết bài:「写真がたくさんとりたいです。」",
          wrongOptions: [
            { option: "たくさん食べたいです", reason: "Tác giả không nhắc muốn ăn nhiều." },
            { option: "うたをうたいたいです", reason: "Tác giả không nhắc muốn hát." },
            { option: "買い物をしたいです", reason: "Tác giả không nhắc muốn mua sắm." }
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

