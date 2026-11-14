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
    title: "デパートでの買い物とイタリアレストラン",
    titleVi: "Mua sắm ở bách hóa và nhà hàng Ý",
    theme: "Mua sắm, so sánh giá cả, dụng cụ ăn uống và phương tiện",
    content: "先週の土曜日、私は本田さんとバスで大きいデパートへ行きました。デパートでセールがありましたから、人がたくさんいました。私は白いTシャツを二まい買いました。二まいで三千円でした。とてもやすかったです。買い物をしてから、レストランへ行きました。本田さんはピザとコーヒーをたのんで、ナイフとフォークで食べました。私はカレーとジュースをスプーンで食べました。デパートのピザはスーパーのピザよりずっとおいしかったです。午後四時半にタクシーで帰りました。バスよりタクシーのほうがはやいですが、たかかったです。",
    sentences: [
      { jp: "先週の土曜日、私は本田さんとバスで大きいデパートへ行きました。", vi: "Thứ Bảy tuần trước, tôi và bạn Honda đã đi xe buýt đến trung tâm thương mại lớn.", romaji: "Senshuu no doyoubi, watashi wa Honda-san to basu de ookii depaato e ikimashita." },
      { jp: "デパートでセールがありましたから、人がたくさんいました。", vi: "Vì ở trung tâm thương mại có đợt giảm giá nên rất đông người.", romaji: "Depaato de seeru ga arimashita kara, hito ga takusan imashita." },
      { jp: "私は白いTシャツを二まい買いました。", vi: "Tôi đã mua hai chiếc áo phông trắng.", romaji: "Watashi wa shiroi tiishatsu o nimai kaimashita." },
      { jp: "二まいで三千円でした。", vi: "Hai chiếc có giá 3.000 yên.", romaji: "Nimai de sanzen-en deshita." },
      { jp: "とてもやすかったです。", vi: "Đã rất rẻ.", romaji: "Totemo yasukatta desu." },
      { jp: "買い物をしてから、レストランへ行きました。", vi: "Sau khi mua sắm xong, chúng tôi đã đến nhà hàng.", romaji: "Kaimono o shite kara, resutoran e ikimashita." },
      { jp: "本田さんはピザとコーヒーをたのんで、ナイフとフォークで食べました。", vi: "Honda gọi bánh pizza và cà phê, rồi ăn bằng dao và nĩa.", romaji: "Honda-san wa piza to koohii o tanonde, naifu to fooku de tabemashita." },
      { jp: "私はカレーとジュースをスプーンで食べました。", vi: "Tôi thì ăn cà ri và uống nước ép bằng thìa.", romaji: "Watashi wa karee to juusu o supuun de tabemashita." },
      { jp: "デパートのピザはスーパーのピザよりずっとおいしかったです。", vi: "Bánh pizza ở trung tâm thương mại ngon hơn nhiều so với pizza ở siêu thị.", romaji: "Depaato no piza wa suupaa no piza yori zutto oishikatta desu." },
      { jp: "午後四時半にタクシーで帰りました。", vi: "Đến 4 giờ rưỡi chiều, chúng tôi đi taxi về.", romaji: "Gogo yo-jihan ni takushii de kaerimashita." },
      { jp: "バスよりタクシーのほうがはやいですが、たかかったです。", vi: "Taxi nhanh hơn xe buýt nhưng mà đắt tiền hơn.", romaji: "Basu yori takushii no hou ga hayai desu ga, takakatta desu." }
    ],
    translation: "Thứ Bảy tuần trước, tôi cùng bạn Honda đi xe buýt đến một trung tâm thương mại lớn. Vì trung tâm thương mại đang có đợt giảm giá nên có rất đông người. Tôi đã mua hai chiếc áo phông trắng với giá 3.000 yên cho cả hai chiếc, thực sự rất rẻ. Mua sắm xong, chúng tôi lên nhà hàng ăn uống. Honda gọi pizza cùng cà phê rồi ăn bằng dao và nĩa. Tôi thì ăn món cà ri và uống nước ép bằng thìa. Pizza ở trung tâm thương mại ngon hơn nhiều so với pizza ở siêu thị. Đến 4 giờ rưỡi chiều, chúng tôi bắt taxi về nhà. Taxi đi nhanh hơn xe buýt nhưng tốn tiền hơn.",
    romaji: "Senshuu no doyoubi, watashi wa Honda-san to basu de ookii depaato e ikimashita. Depaato de seeru ga arimashita kara, hito ga takusan imashita. Watashi wa shiroi tiishatsu o nimai kaimashita. Nimai de sanzen-en deshita. Totemo yasukatta desu. Kaimono o shite kara, resutoran e ikimashita. Honda-san wa piza to koohii o tanonde, naifu to fooku de tabemashita. Watashi wa karee to juusu o supuun de tabemashita. Depaato no piza wa suupaa no piza yori zutto oishikatta desu. Gogo yo-jihan ni takushii de kaerimashita. Basu yori takushii no hou ga hayai desu ga, takakatta desu.",
    vocabularyUsed: ["先週", "土曜日", "私", "バス", "デパート", "セール", "人", "Tシャツ", "二枚", "買う", "三千円", "買い物", "レストラン", "ピザ", "コーヒー", "ナイフ", "フォーク", "食べる", "カレー", "ジュース", "スプーン", "スーパー", "午後", "四時半", "タクシー", "帰る", "より", "ほう"],
    kanjiUsed: ["先", "週", "土", "曜", "日", "私", "本", "田", "大", "行", "人", "二", "買", "三", "千", "円", "物", "食", "午", "後", "四", "時", "半", "帰"],
    questions: [
      {
        id: "jpd123-q1-1",
        prompt: "筆者はデパートで何を何まい買いましたか。",
        options: ["Tシャツを二まい買いました", "Tシャツを三まい買いました", "ズボンを二まい買いました", "シャツを一まい買いました"],
        answer: "Tシャツを二まい買いました",
        explanation: {
          meaning: "Tác giả đã mua cái gì và mấy chiếc ở bách hóa? Đáp án: Mua hai chiếc áo phông (Tシャツ).",
          reason: "Dẫn chứng câu 3:「私は白いTシャツを二まい買いました。」(Tôi đã mua hai chiếc áo phông trắng).",
          wrongOptions: [
            { option: "Tシャツを三まい買いました", reason: "Sai số lượng: Mua 2 chiếc (二まい) chứ không phải 3 chiếc." },
            { option: "ズボンを二まい買いました", reason: "Sai loại đồ: Tác giả mua Tシャツ (áo phông) chứ không mua quần dài (ズボン)." },
            { option: "シャツを一まい買いました", reason: "Sai cả loại áo và số lượng." }
          ]
        }
      },
      {
        id: "jpd123-q1-2",
        prompt: "本田さんは何でピザを食べましたか。",
        options: ["ナイフとフォークで食べました", "スプーンだけで食べました", "手だけで食べました", "ハシで食べました"],
        answer: "ナイフとフォークで食べました",
        explanation: {
          meaning: "Bạn Honda đã ăn bánh pizza bằng dụng cụ gì? Đáp án: Bằng dao và nĩa.",
          reason: "Dẫn chứng câu 7:「本田さんはピザとコーヒーをたのんで、ナイフとフォークで食べました。」",
          wrongOptions: [
            { option: "スプーンだけで食べました", reason: "Thìa là dụng cụ tác giả dùng để ăn cơm cà ri." },
            { option: "手だけで食べました", reason: "Honda dùng dao và nĩa theo cách ăn lịch sự kiểu Tây." },
            { option: "ハシで食べました", reason: "Bài đọc không đề cập đến đũa (ハシ)." }
          ]
        }
      },
      {
        id: "jpd123-q1-3",
        prompt: "デパートのピザとスーパーのピザはどうですか。",
        options: [
          "デパートのピザのほうがスーパーよりずっとおいしいです",
          "スーパーのピザのほうがデパートよりおいしいです",
          "どちらのピザも同じくらいおいしいです",
          "デパートのピザはスーパーよりまずいです"
        ],
        answer: "デパートのピザのほうがスーパーよりずっとおいしいです",
        explanation: {
          meaning: "So sánh pizza ở bách hóa và pizza ở siêu thị như thế nào? Đáp án: Pizza ở bách hóa ngon hơn nhiều.",
          reason: "Dẫn chứng câu 9:「デパートのピザはスーパーのピザよりずっとおいしかったです。」",
          wrongOptions: [
            { option: "スーパーのピザのほうがデパートよりおいしいです", reason: "Ngược hoàn toàn với ý trong bài." },
            { option: "どちらのピザも同じくらいおいしいです", reason: "Bài khẳng định pizza ở bách hóa ngon hơn hẳn (ずっとおいしかった)." },
            { option: "デパートのピザはスーパーよりまずいです", reason: "Sai hoàn toàn vì pizza ở bách hóa rất ngon." }
          ]
        }
      },
      {
        id: "jpd123-q1-4",
        prompt: "どうして帰りはタクシーにのりましたか。",
        options: [
          "バスよりタクシーのほうがはやいからです",
          "タクシーのほうがバスよりやすいからです",
          "バスがもうなかったからです",
          "デパートの前にバスていがなかったからです"
        ],
        answer: "バスよりタクシーのほうがはやいからです",
        explanation: {
          meaning: "Tại sao lúc về lại đi bằng taxi? Đáp án: Vì taxi đi nhanh hơn xe buýt.",
          reason: "Dẫn chứng câu kết bài:「バスよりタクシーのほうがはやいですが、たかかったです。」",
          wrongOptions: [
            { option: "タクシーのほうがバスよりやすいからです", reason: "Taxi đắt hơn xe buýt (たかかったです)." },
            { option: "バスがもうなかったからです", reason: "Bài không đề cập xe buýt hết chuyến." },
            { option: "デパートの前にバスていがなかったからです", reason: "Bài đọc không đề cập đến chi tiết này." }
          ]
        }
      }
    ]
  },
  {
    id: "jpd123-read-2",
    course: "JPD123",
    title: "アパートでの日本料理パーティー",
    titleVi: "Bữa tiệc món ăn Nhật ở khu căn hộ",
    theme: "Nấu ăn, thể て chỉ trình tự, mời thầy cô, miêu tả hương vị và giao tiếp",
    content: "私はFPT大学の学生です。今週の日曜日に、アパートでともだちと日本料理のパーティーをしました。午前十時に本田さんとスーパーへ行って、とり肉やさかなややさいを買いました。ぜんぶで五千五百円でした。スーパーの食べ物はコンビニの食べ物よりやすいです。アパートに帰ってから、みんなで料理をつくりました。本田さんはナイフで肉をきって、私は大きいテーブルでスープとサラダをつくりました。田中先生も来て、「とてもおいしいですね」と言いました。料理を食べてから、みんなでコーヒーを飲んで、日本語でたくさん話しました。とてもたのしかったです。",
    sentences: [
      { jp: "私はFPT大学の学生です。", vi: "Tôi là sinh viên trường Đại học FPT.", romaji: "Watashi wa Efu-pii-tii daigaku no gakusei desu." },
      { jp: "今週の日曜日に、アパートでともだちと日本料理のパーティーをしました。", vi: "Chủ nhật tuần này, tôi đã tổ chức bữa tiệc món ăn Nhật Bản cùng bạn bè tại căn hộ.", romaji: "Konshuu no nichiyoubi ni, apaato de tomodachi to nihon ryouri no paatii o shimashita." },
      { jp: "午前十時に本田さんとスーパーへ行って、とり肉やさかなややさいを買いました。", vi: "Lúc 10 giờ sáng, tôi cùng bạn Honda đi siêu thị mua thịt gà, cá và rau củ.", romaji: "Gozen juu-ji ni Honda-san to suupaa e itte, toriniku ya sakana ya yasai o kaimashita." },
      { jp: "ぜんぶで五千五百円でした。", vi: "Tổng cộng hết 5.500 yên.", romaji: "Zenbu de gosen gohyaku-en deshita." },
      { jp: "スーパーの食べ物はコンビニの食べ物よりやすいです。", vi: "Thực phẩm ở siêu thị rẻ hơn thực phẩm ở cửa hàng tiện lợi.", romaji: "Suupaa no tabemono wa konbini no tabemono yori yasui desu." },
      { jp: "アパートに帰ってから、みんなで料理をつくりました。", vi: "Sau khi về đến căn hộ, mọi người cùng nhau nấu nướng.", romaji: "Apaato ni kaette kara, minna de ryouri o tsukurimashita." },
      { jp: "本田さんはナイフで肉をきって、私は大きいテーブルでスープとサラダをつくりました。", vi: "Honda dùng dao thái thịt, còn tôi làm món súp và sa lát ở chiếc bàn lớn.", romaji: "Honda-san wa naifu de niku o kitte, watashi wa ookii teeburu de suupu to sarada o tsukurimashita." },
      { jp: "田中先生も来て、「とてもおいしいですね」と言いました。", vi: "Thầy Tanaka cũng đến tham dự và khen: 'Ngon tuyệt vời nhỉ'.", romaji: "Tanaka-sensei mo kite, 'Totemo oishii desu ne' to iimashita." },
      { jp: "料理を食べてから、みんなでコーヒーを飲んで、日本語でたくさん話しました。", vi: "Sau khi ăn xong, mọi người cùng uống cà phê và trò chuyện rất nhiều bằng tiếng Nhật.", romaji: "Ryouri o tabete kara, minna de koohii o nonde, nihongo de takusan hanashimashita." },
      { jp: "とてもたのしかったです。", vi: "Buổi tiệc đã thực sự rất vui vẻ.", romaji: "Totemo tanoshikatta desu." }
    ],
    translation: "Tôi là sinh viên trường Đại học FPT. Chủ nhật tuần này, tôi đã tổ chức một bữa tiệc ẩm thực Nhật Bản cùng bạn bè tại căn hộ của mình. Đúng 10 giờ sáng, tôi cùng Honda đi siêu thị mua thịt gà, cá tươi và rau củ. Tổng chi phí hết 5.500 yên, đồ ăn ở siêu thị rẻ hơn nhiều so với cửa hàng tiện lợi. Về đến nhà, mọi người bắt tay vào nấu nướng. Honda dùng dao cắt thịt, còn tôi chuẩn bị súp và sa lát trên chiếc bàn lớn. Thầy Tanaka cũng tới dự và khen món ăn rất ngon. Sau khi dùng bữa, mọi người cùng nhâm nhi cà phê và trò chuyện rôm rả bằng tiếng Nhật. Bữa tiệc hôm đó thật trọn vẹn và vui vẻ.",
    romaji: "Watashi wa Efu-pii-tii daigaku no gakusei desu. Konshuu no nichiyoubi ni, apaato de tomodachi to nihon ryouri no paatii o shimashita. Gozen juu-ji ni Honda-san to suupaa e itte, toriniku ya sakana ya yasai o kaimashita. Zenbu de gosen gohyaku-en deshita. Suupaa no tabemono wa konbini no tabemono yori yasui desu. Apaato ni kaette kara, minna de ryouri o tsukurimashita. Honda-san wa naifu de niku o kitte, watashi wa ookii teeburu de suupu to sarada o tsukurimashita. Tanaka-sensei mo kite, 'Totemo oishii desu ne' to iimashita. Ryouri o tabete kara, minna de koohii o nonde, nihongo de takusan hanashimashita. Totemo tanoshikatta desu.",
    vocabularyUsed: ["私", "大学", "学生", "今週", "日曜日", "アパート", "日本料理", "パーティー", "午前", "十時", "スーパー", "とり肉", "買う", "五千五百円", "食べ物", "コンビニ", "帰る", "料理", "ナイフ", "テーブル", "スープ", "サラダ", "先生", "来る", "言う", "食べる", "コーヒー", "飲む", "日本語", "話す"],
    kanjiUsed: ["私", "大", "学", "生", "今", "週", "日", "曜", "本", "料", "理", "午", "前", "十", "時", "田", "行", "肉", "買", "五", "千", "百", "円", "食", "物", "帰", "先", "言", "飲", "語", "話"],
    questions: [
      {
        id: "jpd123-q2-1",
        prompt: "スーパーでぜんぶでいくら買い物しましたか。",
        options: ["五千五百円でした", "五千円でした", "六千五百円でした", "四千五百円でした"],
        answer: "五千五百円でした",
        explanation: {
          meaning: "Đã mua sắm hết tổng cộng bao nhiêu tiền ở siêu thị? Đáp án: 5.500 yên (五千五百円).",
          reason: "Dẫn chứng câu 4:「ぜんぶで五千五百円でした。」",
          wrongOptions: [
            { option: "五千円でした", reason: "Thiếu 500 yên (五百円)." },
            { option: "六千五百円でした", reason: "Nhiều hơn 1.000 yên so với thực tế." },
            { option: "四千五百円でした", reason: "Ít hơn 1.000 yên so với thực tế." }
          ]
        }
      },
      {
        id: "jpd123-q2-2",
        prompt: "筆者はアパートで何をつくりましたか。",
        options: [
          "スープとサラダをつくりました",
          "肉料理とピザをつくりました",
          "カレーとケーキをつくりました",
          "パンとハンバーグをつくりました"
        ],
        answer: "スープとサラダをつくりました",
        explanation: {
          meaning: "Tác giả đã làm món gì ở căn hộ? Đáp án: Món súp và sa lát.",
          reason: "Dẫn chứng câu 7:「私は大きいテーブルでスープとサラダをつくりました。」",
          wrongOptions: [
            { option: "肉料理とピザをつくりました", reason: "Honda là người cắt thịt, bài không làm pizza." },
            { option: "カレーとケーキをつくりました", reason: "Bài không làm bánh ngọt hay cà ri." },
            { option: "パンとハンバーグをつくりました", reason: "Không có các món này trong bữa tiệc." }
          ]
        }
      },
      {
        id: "jpd123-q2-3",
        prompt: "田中先生は何と言いましたか。",
        options: [
          "「とてもおいしいですね」と言いました",
          "「少しからいですね」と言いました",
          "「あまりおいしくないですね」と言いました",
          "「時間がありません」と言いました"
        ],
        answer: "「とてもおいしいですね」と言いました",
        explanation: {
          meaning: "Thầy Tanaka đã nói câu gì? Đáp án: Thầy khen 'Ngon tuyệt vời nhỉ'.",
          reason: "Dẫn chứng câu 8:「田中先生も来て、「とてもおいしいですね」と言いました。」",
          wrongOptions: [
            { option: "「少しからいですね」と言いました", reason: "Thầy không bảo món ăn cay." },
            { option: "「あまりおいしくないですね」と言いました", reason: "Thầy khen ngon chứ không chê dở." },
            { option: "「時間がありません」と言いました", reason: "Thầy đến tham gia vui vẻ và không vội vã." }
          ]
        }
      },
      {
        id: "jpd123-q2-4",
        prompt: "料理を食べた後で、みんなで何をしましたか。",
        options: [
          "コーヒーを飲んで、日本語で話しました",
          "すぐにアパートへ帰りました",
          "テレビを見て、ゲームをしました",
          "スーパーへ買い物に行きました"
        ],
        answer: "コーヒーを飲んで、日本語で話しました",
        explanation: {
          meaning: "Sau khi ăn xong, mọi người đã làm gì? Đáp án: Uống cà phê và trò chuyện bằng tiếng Nhật.",
          reason: "Dẫn chứng câu 9:「料理を食べてから、みんなでコーヒーを飲んで、日本語でたくさん話しました。」",
          wrongOptions: [
            { option: "すぐにアパートへ帰りました", reason: "Bữa tiệc đang diễn ra tại căn hộ, không phải về ngay." },
            { option: "テレビを見て、ゲームをしました", reason: "Bài không nhắc đến việc xem tivi hay chơi game." },
            { option: "スーパーへ買い物に行きました", reason: "Đi siêu thị đã diễn ra từ sáng trước khi nấu." }
          ]
        }
      }
    ]
  },
  {
    id: "jpd123-read-3",
    course: "JPD123",
    title: "東京りょこうとホテルのけいかく",
    titleVi: "Chuyến du lịch Tokyo và kế hoạch đặt khách sạn",
    theme: "Du lịch, so sánh phương tiện Shinkansen và xe buýt, đặt phòng, chụp ảnh và tham quan cổng chùa",
    content: "来月の休みに、私は大学のともだちと二人で東京へりょこうに行きたいです。東京はとても大きくて、にぎやかなまちです。りょこうの前に、インターネットでホテルをよやくしました。ホテルのへやにテレビやパソコンがあります。東京までしんかんせんとバスとどちらがべんりですか。しんかんせんのほうがはやいですが、チケットがたかいですから、私たちはよるのバスで行きます。東京で大きい門やお寺を見て、カメラでしゃしんをたくさんとりたいです。よるはレストランでハンバーグを食べてから、カラオケへ行きたいです。今からとてもたのしみです。",
    sentences: [
      { jp: "来月の休みに、私は大学のともだちと二人で東京へりょこうに行きたいです。", vi: "Vào kỳ nghỉ tháng sau, tôi muốn cùng một người bạn đại học đi du lịch Tokyo.", romaji: "Raigetsu no yasumi ni, watashi wa daigaku no tomodachi to futari de Toukyou e ryokou ni ikitai desu." },
      { jp: "東京はとても大きくて、にぎやかなまちです。", vi: "Tokyo là một thành phố rất rộng lớn và náo nhiệt.", romaji: "Toukyou wa totemo ookikute, nigiyakana machi desu." },
      { jp: "りょこうの前に、インターネットでホテルをよやくしました。", vi: "Trước chuyến đi, chúng tôi đã đặt phòng khách sạn qua Internet.", romaji: "Ryokou no mae ni, intaanetto de hoteru o yoyaku shimashita." },
      { jp: "ホテルのへやにテレビやパソコンがあります。", vi: "Trong phòng khách sạn có trang bị tivi và máy tính.", romaji: "Hoteru no heya ni terebi ya pasokon ga arimasu." },
      { jp: "東京までしんかんせんとバスとどちらがべんりですか。", vi: "Đến Tokyo thì đi tàu Shinkansen hay xe buýt tiện hơn?", romaji: "Toukyou made shinkansen to basu to dochira ga benri desu ka." },
      { jp: "しんかんせんのほうがはやいですが、チケットがたかいですから、私たちはよるのバスで行きます。", vi: "Tàu Shinkansen nhanh hơn nhưng vé đắt, vì vậy chúng tôi sẽ đi bằng xe buýt đêm.", romaji: "Shinkansen no hou ga hayai desu ga, chiketto ga takai desu kara, watashitachi wa yoru no basu de ikimasu." },
      { jp: "東京で大きい門やお寺を見て、カメラでしゃしんをたくさんとりたいです。", vi: "Tôi muốn ngắm nhìn những cổng chào lớn và ngôi chùa ở Tokyo, rồi dùng máy ảnh chụp thật nhiều ảnh.", romaji: "Toukyou de ookii mon ya otera o mite, kamera de shashin o takusan toritai desu." },
      { jp: "よるはレストランでハンバーグを食べてから、カラオケへ行きたいです。", vi: "Buổi tối, sau khi ăn món thịt băm nướng Hamburg ở nhà hàng, tôi muốn đi hát karaoke.", romaji: "Yoru wa resutoran de hanbaagu o tabete kara, karaoke e ikitai desu." },
      { jp: "今からとてもたのしみです。", vi: "Ngay từ bây giờ tôi đã rất mong đợi chuyến đi này.", romaji: "Ima kara totemo tanoshimi desu." }
    ],
    translation: "Vào kỳ nghỉ tháng tới, tôi dự định cùng một người bạn học đại học đi du lịch Tokyo. Tokyo là một đại đô thị cực kỳ rộng lớn và sầm uất. Trước khi lên đường, chúng tôi đã đặt phòng khách sạn qua mạng Internet. Khách sạn tiện nghi có cả tivi và máy vi tính trong phòng. Đi đến Tokyo thì tàu Shinkansen hay xe buýt tiện hơn? Tàu Shinkansen chạy nhanh hơn hẳn nhưng vì giá vé đắt đỏ nên chúng tôi chọn đi bằng xe buýt đêm. Đến Tokyo, tôi muốn chiêm ngưỡng cổng đền khổng lồ và các ngôi chùa cổ kính, rồi dùng máy ảnh chụp thật nhiều kỷ niệm. Tối đến, sau khi thưởng thức món Hamburg tại nhà hàng, cả hai sẽ cùng đi hát karaoke. Nghĩ đến thôi tôi đã thấy vô cùng hào hứng.",
    romaji: "Raigetsu no yasumi ni, watashi wa daigaku no tomodachi to futari de Toukyou e ryokou ni ikitai desu. Toukyou wa totemo ookikute, nigiyakana machi desu. Ryokou no mae ni, intaanetto de hoteru o yoyaku shimashita. Hoteru no heya ni terebi ya pasokon ga arimasu. Toukyou made shinkansen to basu to dochira ga benri desu ka. Shinkansen no hou ga hayai desu ga, chiketto ga takai desu kara, watashitachi wa yoru no basu de ikimasu. Toukyou de ookii mon ya otera o mite, kamera de shashin o takusan toritai desu. Yoru wa resutoran de hanbaagu o tabete kara, karaoke e ikitai desu. Ima kara totemo tanoshimi desu.",
    vocabularyUsed: ["来月", "休み", "私", "大学", "二人", "東京", "旅行", "行く", "大きい", "前", "インターネット", "ホテル", "テレビ", "パソコン", "バス", "チケット", "門", "お寺", "見る", "カメラ", "レストラン", "ハンバーグ", "食べる", "カラオケ", "今"],
    kanjiUsed: ["来", "月", "休", "私", "大", "学", "二", "人", "東", "京", "行", "前", "門", "寺", "見", "食", "今"],
    questions: [
      {
        id: "jpd123-q3-1",
        prompt: "筆者たちはどうしてバスで東京へ行きますか。",
        options: [
          "しんかんせんのチケットがたかいですから",
          "バスのほうがしんかんせんよりはやいからです",
          "しんかんせんがすきじゃないからです",
          "ホテルがバスていの前にあるからです"
        ],
        answer: "しんかんせんのチケットがたかいですから",
        explanation: {
          meaning: "Tại sao nhóm tác giả lại đi Tokyo bằng xe buýt? Đáp án: Vì giá vé tàu Shinkansen đắt.",
          reason: "Dẫn chứng câu 6:「しんかんせんのほうがはやいですが、チケットがたかいですから、私たちはよるのバスで行きます。」",
          wrongOptions: [
            { option: "バスのほうがしんかんせんよりはやいからです", reason: "Shinkansen nhanh hơn xe buýt, không phải xe buýt nhanh hơn." },
            { option: "しんかんせんがすきじゃないからです", reason: "Tác giả không nói không thích Shinkansen mà là do giá vé." },
            { option: "ホテルがバスていの前にあるからです", reason: "Không có thông tin này trong bài." }
          ]
        }
      },
      {
        id: "jpd123-q3-2",
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
            { option: "電子レンジとギターがあります", reason: "Không có lò vi sóng hay đàn guitar trong phòng." },
            { option: "ゲームとCDがあります", reason: "Không có máy chơi game hay đĩa CD." },
            { option: "テーブルとナイフだけあります", reason: "Khách sạn trang bị tivi và máy tính." }
          ]
        }
      },
      {
        id: "jpd123-q3-3",
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
        id: "jpd123-q3-4",
        prompt: "よる、レストランで何を食べた後でカラオケへ行きますか。",
        options: [
          "ハンバーグを食べてから行きます",
          "ピザを食べてから行きます",
          "ラーメンを食べてから行きます",
          "カレーを食べてから行きます"
        ],
        answer: "ハンバーグを食べてから行きます",
        explanation: {
          meaning: "Buổi tối, sau khi ăn món gì ở nhà hàng thì đi karaoke? Đáp án: Ăn món thịt nướng Hamburg.",
          reason: "Dẫn chứng câu 8:「よるはレストランでハンバーグを食べてから、カラオケへ行きたいです。」",
          wrongOptions: [
            { option: "ピザを食べてから行きます", reason: "Pizza không phải món ăn tối trong chuyến đi này." },
            { option: "ラーメンを食べてから行きます", reason: "Bài không nhắc đến món mì ramen." },
            { option: "カレーを食べてから行きます", reason: "Bài không nhắc đến cà ri." }
          ]
        }
      }
    ]
  },
  {
    id: "jpd123-read-4",
    course: "JPD123",
    title: "ジャズコンサートのやくそくとアルバイト",
    titleVi: "Hẹn đi xem hòa nhạc Jazz và việc làm thêm",
    theme: "Sự kiện, rủ rê, từ chối khéo 〜はちょっと…, việc làm thêm định kỳ",
    content: "来週の土曜日のよる、ダナン市で大きいおんがくのコンサートがあります。私はジャズがすきですから、チケットを二まい買いました。大学で本田さんに「いっしょにコンサートへ行きませんか」と言いました。でも、本田さんは「土曜日はちょっと…アルバイトがありますから」と言いました。本田さんは前のレストランで毎週きん曜日と土曜日にアルバイトをしています。ざんねんですが、私は一人で行きます。コンサートの前に、カフェでパンを食べて、コーヒーを飲みます。それから、カメラでしゃしんをたくさんとりたいです。",
    sentences: [
      { jp: "来週の土曜日のよる、ダナン市で大きいおんがくのコンサートがあります。", vi: "Tối thứ Bảy tuần sau, ở thành phố Đà Nẵng sẽ có một buổi hòa nhạc lớn.", romaji: "Raishuu no doyoubi no yoru, Danan-shi de ookii ongaku no konsaato ga arimasu." },
      { jp: "私はジャズがすきですから、チケットを二まい買いました。", vi: "Vì tôi thích nhạc Jazz nên đã mua hai tấm vé.", romaji: "Watashi wa jazu ga suki desu kara, chiketto o nimai kaimashita." },
      { jp: "大学で本田さんに「いっしょにコンサートへ行きませんか」と言いました。", vi: "Ở trường đại học, tôi rủ bạn Honda: 'Cậu có muốn cùng đi nghe hòa nhạc không?'.", romaji: "Daigaku de Honda-san ni 'issho ni konsaato e ikimasen ka' to iimashita." },
      { jp: "でも、本田さんは「土曜日はちょっと…アルバイトがありますから」と言いました。", vi: "Nhưng bạn Honda đáp: 'Thứ Bảy thì hơi kẹt... vì tớ có lịch đi làm thêm'.", romaji: "Demo, Honda-san wa 'doyoubi wa chotto... arubaito ga arimasu kara' to iimashita." },
      { jp: "本田さんは前のレストランで毎週きん曜日と土曜日にアルバイトをしています。", vi: "Honda đang làm thêm ở nhà hàng trước đó vào mỗi thứ Sáu và thứ Bảy hàng tuần.", romaji: "Honda-san wa mae no resutoran de maishuu kinyoubi to doyoubi ni arubaito o shite imasu." },
      { jp: "ざんねんですが、私は一人で行きます。", vi: "Tiếc thật, nhưng tôi sẽ đi một mình.", romaji: "Zannen desu ga, watashi wa hitori de ikimasu." },
      { jp: "コンサートの前に、カフェでパンを食べて、コーヒーを飲みます。", vi: "Trước buổi hòa nhạc, tôi sẽ vào quán cà phê ăn bánh mì và uống cà phê.", romaji: "Konsaato no mae ni, kafe de pan o tabete, koohii o nomimasu." },
      { jp: "それから、カメラでしゃしんをたくさんとりたいです。", vi: "Sau đó, tôi muốn dùng máy ảnh chụp thật nhiều bức hình đẹp.", romaji: "Sorekara, kamera de shashin o takusan toritai desu." }
    ],
    translation: "Tối thứ Bảy tuần sau, tại thành phố Đà Nẵng sẽ diễn ra một đại nhạc hội lớn. Vì đặc biệt yêu thích nhạc Jazz nên tôi đã mua trước hai tấm vé. Khi ở trường đại học, tôi hồ hởi rủ Honda: 'Thứ Bảy này cậu cùng đi xem hòa nhạc với mình nhé!'. Nhưng Honda đã khéo léo từ chối: 'Thứ Bảy thì hơi kẹt cho mình rồi... vì hôm đó mình có ca làm thêm'. Hóa ra bạn ấy đang làm thêm cố định ở nhà hàng gần đó vào mỗi thứ Sáu và thứ Bảy hàng tuần. Tuy hơi tiếc nhưng tôi vẫn quyết định sẽ đi một mình. Trước giờ diễn, tôi ghé tiệm cà phê ăn tạm chiếc bánh mì và nhâm nhi tách cà phê. Sau đó tôi sẽ dùng máy ảnh chụp thật nhiều khoảnh khắc đẹp.",
    romaji: "Raishuu no doyoubi no yoru, Danan-shi de ookii ongaku no konsaato ga arimasu. Watashi wa jazu ga suki desu kara, chiketto o nimai kaimashita. Daigaku de Honda-san ni 'issho ni konsaato e ikimasen ka' to iimashita. Demo, Honda-san wa 'doyoubi wa chotto... arubaito ga arimasu kara' to iimashita. Honda-san wa mae no resutoran de maishuu kinyoubi to doyoubi ni arubaito o shite imasu. Zannen desu ga, watashi wa hitori de ikimasu. Konsaato no mae ni, kafe de pan o tabete, koohii o nomimasu. Sorekara, kamera de shashin o takusan toritai desu.",
    vocabularyUsed: ["来週", "土曜日", "市", "大きい", "コンサート", "ジャズ", "チケット", "二枚", "買う", "大学", "言う", "アルバイト", "レストラン", "毎週", "金曜日", "一人", "行く", "前", "カフェ", "パン", "食べる", "コーヒー", "飲む", "カメラ"],
    kanjiUsed: ["来", "週", "土", "曜", "日", "市", "大", "私", "二", "買", "学", "本", "田", "行", "言", "前", "毎", "一", "人", "食", "飲"],
    questions: [
      {
        id: "jpd123-q4-1",
        prompt: "本田さんはどうしてコンサートへ行きませんか。",
        options: [
          "土曜日にアルバイトがあるからです",
          "ジャズのおんがくがきらいだからです",
          "チケットがたかいからです",
          "病気で休んでいるからです"
        ],
        answer: "土曜日にアルバイトがあるからです",
        explanation: {
          meaning: "Tại sao Honda không đi nghe hòa nhạc cùng tác giả? Đáp án: Vì thứ Bảy bạn có ca đi làm thêm.",
          reason: "Dẫn chứng câu 4:「本田さんは「土曜日はちょっと…アルバイトがありますから」と言いました。」",
          wrongOptions: [
            { option: "ジャズのおんがくがきらいだからです", reason: "Honda không nói ghét nhạc Jazz." },
            { option: "チケットがたかいからです", reason: "Tác giả đã mua sẵn cả 2 vé rồi (チケットを二まい買いました)." },
            { option: "病気で休んでいるからです", reason: "Honda không bị ốm đau." }
          ]
        }
      },
      {
        id: "jpd123-q4-2",
        prompt: "「土曜日はちょっと…」はどういう意味ですか。",
        options: [
          "ことわる（行けない）意味です",
          "時間をたずねる意味です",
          "コンサートをほめる意味です",
          "チケットをかう意味です"
        ],
        answer: "ことわる（行けない）意味です",
        explanation: {
          meaning: "Cụm từ 'Thứ Bảy thì hơi...' thể hiện hàm ý gì? Đáp án: Là cách từ chối khéo léo (không thể đi được).",
          reason: "Mẫu câu giao tiếp Bài 6:「〜はちょっと…」là cách nói từ chối lịch sự và tinh tế đặc trưng của người Nhật khi không thể nhận lời mời.",
          wrongOptions: [
            { option: "時間をたずねる意味です", reason: "Không phải để hỏi giờ giấc." },
            { option: "コンサートをほめる意味です", reason: "Không phải lời khen ngợi buổi hòa nhạc." },
            { option: "チケットをかう意味です", reason: "Không phải hỏi mua vé." }
          ]
        }
      },
      {
        id: "jpd123-q4-3",
        prompt: "本田さんはいつレストランでアルバイトをしていますか。",
        options: [
          "毎週きん曜日と土曜日です",
          "毎週月曜日と水曜日です",
          "日曜日だけです",
          "毎日の午前です"
        ],
        answer: "毎週きん曜日と土曜日です",
        explanation: {
          meaning: "Honda làm thêm ở nhà hàng vào những thời gian nào? Đáp án: Vào thứ Sáu và thứ Bảy hàng tuần.",
          reason: "Dẫn chứng câu 5:「本田さんは前のレストランで毎週きん曜日と土曜日にアルバイトをしています。」",
          wrongOptions: [
            { option: "毎週月曜日と水曜日です", reason: "Sai các thứ trong tuần." },
            { option: "日曜日だけです", reason: "Chủ nhật không phải ngày làm thêm của Honda." },
            { option: "毎日の午前です", reason: "Honda chỉ làm thứ 6 và thứ 7, không phải mọi buổi sáng." }
          ]
        }
      },
      {
        id: "jpd123-q4-4",
        prompt: "筆者はコンサートの前に何をしますか。",
        options: [
          "カフェでパンを食べて、コーヒーを飲みます",
          "デパートでTシャツを買います",
          "ホテルでテレビを見ます",
          "本田さんと日本語を勉強します"
        ],
        answer: "カフェでパンを食べて、コーヒーを飲みます",
        explanation: {
          meaning: "Tác giả làm gì trước khi buổi biểu diễn bắt đầu? Đáp án: Đến quán cà phê ăn bánh mì và uống cà phê.",
          reason: "Dẫn chứng câu 7:「コンサートの前に、カフェでパンを食べて、コーヒーを飲みます。」",
          wrongOptions: [
            { option: "デパートでTシャツを買います", reason: "Không đi mua áo phông ở bách hóa." },
            { option: "ホテルでテレビを見ます", reason: "Không ở khách sạn xem tivi." },
            { option: "本田さんと日本語を勉強します", reason: "Honda bận đi làm thêm." }
          ]
        }
      }
    ]
  },
  {
    id: "jpd123-read-5",
    course: "JPD123",
    title: "日本語のじゅぎょうとパソコンでのべんきょう",
    titleVi: "Giờ học tiếng Nhật và việc tự học trên máy tính",
    theme: "Lớp học tiếng Nhật, thể て yêu cầu lịch sự, so sánh cách học và mục đích di chuyển",
    content: "毎週月曜日と水曜日の午前に、私たちは日本語のじゅぎょうがあります。先生は「日本語の本をあけて、CDを聞いてください」と言いました。それから、先生は大きいノートに書いて、よみかたをおしえました。じゅぎょうの後で、私は大学でインターネットとパソコンをつかって、べんきょうしました。パソコンでのべんきょうは本よりべんりでおもしろいです。来週、日本語のテストがありますから、今週は毎日二時間べんきょうします。今日の午後はともだちとレストランへラーメンを食べに行きます。",
    sentences: [
      { jp: "毎週月曜日と水曜日の午前に、私たちは日本語のじゅぎょうがあります。", vi: "Vào mỗi sáng thứ Hai và thứ Tư hàng tuần, chúng tôi đều có giờ học tiếng Nhật.", romaji: "Maishuu getsuyoubi to suiyoubi no gozen ni, watashitachi wa nihongo no jugyou ga arimasu." },
      { jp: "先生は「日本語の本をあけて、CDを聞いてください」と言いました。", vi: "Giáo viên nói: 'Hãy mở sách tiếng Nhật ra và lắng nghe đĩa CD'.", romaji: "Sensei wa 'nihongo no hon o akete, shii-dii o kiite kudasai' to iimashita." },
      { jp: "それから、先生は大きいノートに書いて、よみかたをおしえました。", vi: "Sau đó, cô viết lên cuốn sổ lớn và dạy cách phát âm.", romaji: "Sorekara, sensei wa ookii nooto ni kaite, yomikata o oshiemashita." },
      { jp: "じゅぎょうの後で、私は大学でインターネットとパソコンをつかって、べんきょうしました。", vi: "Sau giờ học, tôi ở lại trường dùng máy tính và Internet để tự học.", romaji: "Jugyou no ato de, watashi wa daigaku de intaanetto to pasokon o tsukatte, benkyou shimashita." },
      { jp: "パソコンでのべんきょうは本よりべんりでおもしろいです。", vi: "Học trên máy tính tiện lợi và thú vị hơn so với chỉ học trong sách.", romaji: "Pasokon de no benkyou wa hon yori benri de omoshiroi desu." },
      { jp: "来週、日本語のテストがありますから、今週は毎日二時間べんきょうします。", vi: "Vì tuần sau có bài kiểm tra tiếng Nhật nên tuần này ngày nào tôi cũng học 2 tiếng.", romaji: "Raishuu, nihongo no tesuto ga arimasu kara, konshuu wa mainichi ni-jikan benkyou shimasu." },
      { jp: "今日の午後はともだちとレストランへラーメンを食べに行きます。", vi: "Chiều nay tôi sẽ cùng bạn đến nhà hàng để ăn mì ramen.", romaji: "Kyou no gogo wa tomodachi to resutoran e raamen o tabe ni ikimasu." }
    ],
    translation: "Vào mỗi sáng thứ Hai và thứ Tư hàng tuần, chúng tôi đều có tiết học tiếng Nhật. Cô giáo bước vào lớp và nhẹ nhàng dặn: 'Cả lớp hãy mở sách giáo khoa tiếng Nhật và chú ý lắng nghe đĩa CD nhé'. Tiếp đó, cô viết các từ quan trọng lên cuốn sổ lớn rồi hướng dẫn tỉ mỉ cách đọc chính xác. Sau khi tiết học kết thúc, tôi ở lại trường tận dụng máy tính nối mạng Internet để tự ôn bài. Việc học qua máy tính tiện dụng và sinh động hơn hẳn so với chỉ cầm sách đọc thông thường. Tuần tới sẽ có bài kiểm tra kết thúc học phần tiếng Nhật, vì thế tuần này ngày nào tôi cũng chăm chỉ tự học đủ 2 tiếng đồng hồ. Chiều nay tôi sẽ rủ bạn thân đến nhà hàng ăn một tô mì ramen nóng hổi.",
    romaji: "Maishuu getsuyoubi to suiyoubi no gozen ni, watashitachi wa nihongo no jugyou ga arimasu. Sensei wa 'nihongo no hon o akete, shii-dii o kiite kudasai' to iimashita. Sorekara, sensei wa ookii nooto ni kaite, yomikata o oshiemashita. Jugyou no ato de, watashi wa daigaku de intaanetto to pasokon o tsukatte, benkyou shimashita. Pasokon de no benkyou wa hon yori benri de omoshiroi desu. Raishuu, nihongo no tesuto ga arimasu kara, konshuu wa mainichi ni-jikan benkyou shimasu. Kyou no gogo wa tomodachi to resutoran e raamen o tabe ni ikimasu.",
    vocabularyUsed: ["毎週", "月曜日", "水曜日", "午前", "日本語", "先生", "本", "CD", "聞く", "言う", "大きい", "ノート", "書く", "後", "大学", "インターネット", "パソコン", "来週", "テスト", "今週", "毎日", "二時間", "今日", "午後", "レストラン", "ラーメン", "食べる", "行く"],
    kanjiUsed: ["毎", "週", "月", "曜", "日", "水", "午", "前", "私", "本", "語", "先", "生", "聞", "言", "大", "書", "後", "学", "来", "今", "二", "時", "間", "食", "行"],
    questions: [
      {
        id: "jpd123-q5-1",
        prompt: "先生は学生に何と言いましたか。",
        options: [
          "「本をあけて、CDを聞いてください」と言いました",
          "「パソコンを消してください」と言いました",
          "「ドアを閉めてください」と言いました",
          "「教室から出てください」と言いました"
        ],
        answer: "「本をあけて、CDを聞いてください」と言いました",
        explanation: {
          meaning: "Giáo viên đã nói gì với học sinh? Đáp án: 'Hãy mở sách ra và nghe đĩa CD'.",
          reason: "Dẫn chứng câu 2:「先生は「日本語の本をあけて、CDを聞いてください」と言いました。」",
          wrongOptions: [
            { option: "「パソコンを消してください」と言いました", reason: "Cô không yêu cầu tắt máy tính." },
            { option: "「ドアを閉めてください」と言いました", reason: "Cô không yêu cầu đóng cửa." },
            { option: "「教室から出てください」と言いました", reason: "Cô không bảo học sinh đi ra ngoài." }
          ]
        }
      },
      {
        id: "jpd123-q5-2",
        prompt: "筆者はパソコンでのべんきょうをどう思っていますか。",
        options: [
          "本よりべんりでおもしろいと思っています",
          "本よりたいへんでつまらないと思っています",
          "本と同じくらいむずかしいと思っています",
          "あまりよくないと思っています"
        ],
        answer: "本よりべんりでおもしろいと思っています",
        explanation: {
          meaning: "Tác giả cảm nhận việc học qua máy tính như thế nào? Đáp án: Tiện lợi và thú vị hơn so với sách.",
          reason: "Dẫn chứng câu 5:「パソコンでのべんきょうは本よりべんりでおもしろいです。」",
          wrongOptions: [
            { option: "本よりたいへんでつまらないと思っています", reason: "Ngược lại, tác giả thấy tiện và thú vị." },
            { option: "本と同じくらいむずかしいと思っています", reason: "Bài không so sánh về độ khó ngang nhau." },
            { option: "あまりよくないと思っています", reason: "Tác giả đánh giá rất tích cực." }
          ]
        }
      },
      {
        id: "jpd123-q5-3",
        prompt: "どうして今週は毎日二時間べんきょうしますか。",
        options: [
          "来週、日本語のテストがあるからです",
          "先生にしゅくだいを出されたからです",
          "ひまで時間があるからです",
          "アルバイトを休んだからです"
        ],
        answer: "来週、日本語のテストがあるからです",
        explanation: {
          meaning: "Tại sao tuần này ngày nào tác giả cũng tự học 2 tiếng? Đáp án: Vì tuần tới có bài kiểm tra tiếng Nhật.",
          reason: "Dẫn chứng câu 6:「来週、日本語のテストがありますから、今週は毎日二時間べんきょうします。」",
          wrongOptions: [
            { option: "先生にしゅくだいを出されたからです", reason: "Bài không đề cập lý do bị giao bài tập về nhà." },
            { option: "ひまで時間があるからです", reason: "Không phải vì rảnh rỗi." },
            { option: "アルバイトを休んだからです", reason: "Bài không đề cập nghỉ làm thêm." }
          ]
        }
      },
      {
        id: "jpd123-q5-4",
        prompt: "今日の午後、筆者は何をしに行きますか。",
        options: [
          "レストランへラーメンを食べに行きます",
          "スーパーへジュースを買いに行きます",
          "カフェへコーヒーを飲みに行きます",
          "アパートへテレビを見に行きます"
        ],
        answer: "レストランへラーメンを食べに行きます",
        explanation: {
          meaning: "Chiều nay tác giả dự định đi đâu làm gì? Đáp án: Đến nhà hàng để ăn mì ramen.",
          reason: "Dẫn chứng câu kết:「今日の午後はともだちとレストランへラーメンを食べに行きます。」(Cấu trúc V(bỏ ます) + に行きます).",
          wrongOptions: [
            { option: "スーパーへジュースを買いに行きます", reason: "Không đi mua nước hoa quả." },
            { option: "カフェへコーヒーを飲みに行きます", reason: "Không đi quán cà phê." },
            { option: "アパートへテレビを見に行きます", reason: "Không về nhà xem tivi." }
          ]
        }
      }
    ]
  },
  {
    id: "jpd123-read-6",
    course: "JPD123",
    title: "ハノイ市とダナン市の生活とてんき",
    titleVi: "Đời sống và thời tiết ở Hà Nội và Đà Nẵng",
    theme: "So sánh hai thành phố, thời tiết bốn mùa, kỳ nghỉ, hải sản và phương tiện",
    content: "私の国のなかで、ハノイ市とダナン市はどちらがすきですか。ハノイ市はとても大きくて、ゆうめいなまちです。人がおおくて、バスやタクシーがたくさんあります。ダナン市はうみがちかくて、おいしいさかなや日本料理のレストランがあります。ハノイのなつはダナンよりあついです。しかし、ふゆはハノイのほうがずっとさむいです。ダナンはあまりさむくないですから、ふゆ休みにたくさんの人がホテルやアパートへりょこうに来ます。私はダナンでピザを食べて、おいしいコーヒーを飲みたいです。",
    sentences: [
      { jp: "私の国のなかで、ハノイ市とダナン市はどちらがすきですか。", vi: "Trong đất nước của tôi, giữa Hà Nội và Đà Nẵng bạn thích nơi nào hơn?", romaji: "Watashi no kuni no naka de, Hanoi-shi to Danan-shi wa dochira ga suki desu ka." },
      { jp: "ハノイ市はとても大きくて、ゆうめいなまちです。", vi: "Hà Nội là một thành phố rất lớn và nổi tiếng.", romaji: "Hanoi-shi wa totemo ookikute, yuumeina machi desu." },
      { jp: "人がおおくて、バスやタクシーがたくさんあります。", vi: "Nơi đây đông đúc dân cư, có rất nhiều xe buýt và taxi.", romaji: "Hito ga ookute, basu ya takushii ga takusan arimasu." },
      { jp: "ダナン市はうみがちかくて、おいしいさかなや日本料理のレストランがあります。", vi: "Đà Nẵng thì gần biển, có nhiều cá ngon và các nhà hàng ẩm thực Nhật Bản.", romaji: "Danan-shi wa umi ga chikakute, oishii sakana ya nihon ryouri no resutoran ga arimasu." },
      { jp: "ハノイのなつはダナンよりあついです。", vi: "Mùa hè ở Hà Nội nóng hơn ở Đà Nẵng.", romaji: "Hanoi no natsu wa Danan yori atsui desu." },
      { jp: "しかし、ふゆはハノイのほうがずっとさむいです。", vi: "Thế nhưng vào mùa đông, Hà Nội lại lạnh hơn nhiều.", romaji: "Shikashi, fuyu wa Hanoi no hou ga zutto samui desu." },
      { jp: "ダナンはあまりさむくないですから、ふゆ休みにたくさんの人がホテルやアパートへりょこうに来ます。", vi: "Vì Đà Nẵng không lạnh lắm nên vào kỳ nghỉ đông có rất nhiều người đến khách sạn và căn hộ nghỉ dưỡng du lịch.", romaji: "Danan wa amari samukunai desu kara, fuyuyasumi ni takusan no hito ga hoteru ya apaato e ryokou ni kimasu." },
      { jp: "私はダナンでピザを食べて、おいしいコーヒーを飲みたいです。", vi: "Tôi muốn được thưởng thức pizza và uống cà phê ngon tại Đà Nẵng.", romaji: "Watashi wa Danan de piza o tabete, oishii koohii o nomitai desu." }
    ],
    translation: "Trong số các thành phố ở nước tôi, giữa thủ đô Hà Nội và Đà Nẵng bạn yêu thích nơi nào hơn? Hà Nội là một thành phố lớn và vô cùng nổi tiếng, dân cư đông đúc, đường phố nhộn nhịp xe buýt và taxi. Còn Đà Nẵng lại gần bãi biển xanh, nổi tiếng với nhiều món cá tươi ngon cùng hàng loạt nhà hàng ẩm thực Nhật Bản. Mùa hè ở Hà Nội oi bức hơn ở Đà Nẵng, nhưng vào mùa đông thì Hà Nội lại rét buốt hơn nhiều. Mùa đông ở Đà Nẵng không bị lạnh sâu, do đó vào kỳ nghỉ đông có rất nhiều du khách đặt phòng khách sạn và căn hộ ven biển để đi du lịch. Riêng tôi, tôi chỉ mong được vào Đà Nẵng ăn bánh pizza và thưởng thức tách cà phê thơm ngon bên bờ biển.",
    romaji: "Watashi no kuni no naka de, Hanoi-shi to Danan-shi wa dochira ga suki desu ka. Hanoi-shi wa totemo ookikute, yuumeina machi desu. Hito ga ookute, basu ya takushii ga takusan arimasu. Danan-shi wa umi ga chikakute, oishii sakana ya nihon ryouri no resutoran ga arimasu. Hanoi no natsu wa Danan yori atsui desu. Shikashi, fuyu wa Hanoi no hou ga zutto samui desu. Danan wa amari samukunai desu kara, fuyuyasumi ni takusan no hito ga hoteru ya apaato e ryokou ni kimasu. Watashi wa Danan de piza o tabete, oishii koohii o nomitai desu.",
    vocabularyUsed: ["私", "国", "市", "大きい", "人", "バス", "タクシー", "日本料理", "レストラン", "より", "しかし", "ほう", "休み", "ホテル", "アパート", "旅行", "来る", "ピザ", "食べる", "コーヒー", "飲む"],
    kanjiUsed: ["私", "国", "市", "大", "人", "日", "本", "料", "理", "休", "来", "食", "飲"],
    questions: [
      {
        id: "jpd123-q6-1",
        prompt: "ハノイ市とダナン市のふゆのてんきはどうですか。",
        options: [
          "ふゆはハノイのほうがダナンよりずっとさむいです",
          "ふゆはダナンのほうがハノイよりずっとさむいです",
          "どちらも同じくらいあついです",
          "ハノイのふゆはぜんぜんさむくないです"
        ],
        answer: "ふゆはハノイのほうがダナンよりずっとさむいです",
        explanation: {
          meaning: "Thời tiết mùa đông ở Hà Nội và Đà Nẵng như thế nào? Đáp án: Mùa đông ở Hà Nội lạnh hơn nhiều so với Đà Nẵng.",
          reason: "Dẫn chứng câu 6:「しかし、ふゆはハノイのほうがずっとさむいです。」",
          wrongOptions: [
            { option: "ふゆはダナンのほうがハノイよりずっとさむいです", reason: "Ngược hoàn toàn với thực tế và bài đọc." },
            { option: "どちらも同じくらいあついです", reason: "Mùa đông có sự chênh lệch rõ rệt về nhiệt độ." },
            { option: "ハノイのふゆはぜんぜんさむくないです", reason: "Hà Nội mùa đông rất lạnh." }
          ]
        }
      },
      {
        id: "jpd123-q6-2",
        prompt: "ダナン市にはどんなレストランがありますか。",
        options: [
          "おいしいさかなや日本料理のレストランがあります",
          "フランス料理のレストランだけあります",
          "ファストフードの店しかありません",
          "山の上に小さいカフェしかありません"
        ],
        answer: "おいしいさかなや日本料理のレストランがあります",
        explanation: {
          meaning: "Ở thành phố Đà Nẵng có những nhà hàng kiểu như thế nào? Đáp án: Các nhà hàng cá ngon và món Nhật.",
          reason: "Dẫn chứng câu 4:「ダナン市はうみがちかくて、おいしいさかなや日本料理のレストランがあります。」",
          wrongOptions: [
            { option: "フランス料理のレストランだけあります", reason: "Bài không nhắc đến nhà hàng Pháp." },
            { option: "ファストフードの店しかありません", reason: "Không có thông tin này trong bài." },
            { option: "山の上に小さいカフェしかありません", reason: "Đà Nẵng có nhiều nhà hàng hải sản và món Nhật gần biển." }
          ]
        }
      },
      {
        id: "jpd123-q6-3",
        prompt: "どうしてふゆ休みにたくさんの人がダナンへ来ますか。",
        options: [
          "ダナンのふゆはあまりさむくないからです",
          "ダナンに雪がたくさんふるからです",
          "ハノイよりホテルがたかいからです",
          "テストがないからです"
        ],
        answer: "ダナンのふゆはあまりさむくないからです",
        explanation: {
          meaning: "Tại sao vào kỳ nghỉ đông nhiều người lại chọn đến Đà Nẵng? Đáp án: Vì mùa đông Đà Nẵng không lạnh lắm.",
          reason: "Dẫn chứng câu 7:「ダナンはあまりさむくないですから、ふゆ休みにたくさんの人がホテルやアパートへりょこうに来ます。」",
          wrongOptions: [
            { option: "ダナンに雪がたくさんふるからです", reason: "Đà Nẵng không có tuyết rơi." },
            { option: "ハノイよりホテルがたかいからです", reason: "Khách sạn đắt không phải lý do thu hút khách du lịch." },
            { option: "テストがないからです", reason: "Bài không đề cập lý do thi cử." }
          ]
        }
      },
      {
        id: "jpd123-q6-4",
        prompt: "筆者はダナンで何をしたいと言っていますか。",
        options: [
          "ピザを食べて、おいしいコーヒーを飲みたいです",
          "山にのぼって、スキーをしたいです",
          "新しい車を買って、ドライブしたいです",
          "一日中ホテルで寝たいです"
        ],
        answer: "ピザを食べて、おいしいコーヒーを飲みたいです",
        explanation: {
          meaning: "Tác giả muốn làm gì khi ở Đà Nẵng? Đáp án: Muốn ăn bánh pizza và thưởng thức cà phê ngon.",
          reason: "Dẫn chứng câu kết bài:「私はダナンでピザを食べて、おいしいコーヒーを飲みたいです。」",
          wrongOptions: [
            { option: "山にのぼって、スキーをしたいです", reason: "Không đi trượt tuyết ở Đà Nẵng." },
            { option: "新しい車を買って、ドライブしたいです", reason: "Không có ý định mua ô tô mới." },
            { option: "一日中ホテルで寝たいです", reason: "Tác giả muốn đi ăn uống và trải nghiệm." }
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

