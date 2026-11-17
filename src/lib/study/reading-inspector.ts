import { alphabet } from "../../data/alphabet.ts";
import { vocabulary } from "../../data/vocabulary.ts";
import { toKana, hasKanji, KANJI_SINGLE_CHAR_MAP } from "./kana-reading.ts";
import { toRomaji } from "./romaji.ts";
import type { WordInspection } from "./reading-types.ts";

/**
 * Bảng định nghĩa các cụm từ vựng đặc biệt thông dụng trong bài đọc JPD113 / JPD123
 * Giúp tra cứu chính xác 100% âm đọc Hiragana, Romaji và nghĩa,
 * triệt tiêu hoàn toàn hiện tượng trùng lặp xén ký tự (substring collision).
 */
export const READING_SPECIAL_WORDS: Record<string, WordInspection> = {
  // 1. Thứ trong tuần
  月曜日: { text: "月曜日", hiragana: "げつようび", romaji: "getsuyoubi", meaning: "thứ Hai", hanviet: "NGUYỆT DIỆU NHẬT", isKanji: true, lesson: "Bài 3 · Thời gian" },
  火曜日: { text: "火曜日", hiragana: "かようび", romaji: "kayoubi", meaning: "thứ Ba", hanviet: "HỎA DIỆU NHẬT", isKanji: true, lesson: "Bài 3 · Thời gian" },
  水曜日: { text: "水曜日", hiragana: "すいようび", romaji: "suiyoubi", meaning: "thứ Tư", hanviet: "THỦY DIỆU NHẬT", isKanji: true, lesson: "Bài 3 · Thời gian" },
  木曜日: { text: "木曜日", hiragana: "もくようび", romaji: "mokuyoubi", meaning: "thứ Năm", hanviet: "MỘC DIỆU NHẬT", isKanji: true, lesson: "Bài 3 · Thời gian" },
  金曜日: { text: "金曜日", hiragana: "きんようび", romaji: "kinyoubi", meaning: "thứ Sáu", hanviet: "KIM DIỆU NHẬT", isKanji: true, lesson: "Bài 3 · Thời gian" },
  きんようび: { text: "金曜日", hiragana: "きんようび", romaji: "kinyoubi", meaning: "thứ Sáu", hanviet: "KIM DIỆU NHẬT", isKanji: false, lesson: "Bài 3 · Thời gian" },
  土曜日: { text: "土曜日", hiragana: "どようび", romaji: "doyoubi", meaning: "thứ Bảy", hanviet: "THỔ DIỆU NHẬT", isKanji: true, lesson: "Bài 3 · Thời gian" },
  日曜日: { text: "日曜日", hiragana: "にちようび", romaji: "nichiyoubi", meaning: "Chủ nhật", hanviet: "NHẬT DIỆU NHẬT", isKanji: true, lesson: "Bài 3 · Thời gian" },

  // 2. Thời gian & mốc thời gian
  先週: { text: "先週", hiragana: "せんしゅう", romaji: "senshuu", meaning: "tuần trước", hanviet: "TIÊN CHU", isKanji: true, lesson: "Bài 5 · Thời gian" },
  今週: { text: "今週", hiragana: "こんしゅう", romaji: "konshuu", meaning: "tuần này", hanviet: "KIM CHU", isKanji: true, lesson: "Bài 5 · Thời gian" },
  来週: { text: "来週", hiragana: "らいしゅう", romaji: "raishuu", meaning: "tuần sau", hanviet: "LAI CHU", isKanji: true, lesson: "Bài 5 · Thời gian" },
  毎週: { text: "毎週", hiragana: "まいしゅう", romaji: "maishuu", meaning: "hàng tuần", hanviet: "MỖI CHU", isKanji: true, lesson: "Bài 5 · Thời gian" },
  来月: { text: "来月", hiragana: "らいげつ", romaji: "raigetsu", meaning: "tháng sau", hanviet: "LAI NGUYỆT", isKanji: true, lesson: "Bài 5 · Thời gian" },
  今月: { text: "今月", hiragana: "こんげつ", romaji: "kongetsu", meaning: "tháng này", hanviet: "KIM NGUYỆT", isKanji: true, lesson: "Bài 5 · Thời gian" },
  先月: { text: "先月", hiragana: "せんげつ", romaji: "sengetsu", meaning: "tháng trước", hanviet: "TIÊN NGUYỆT", isKanji: true, lesson: "Bài 5 · Thời gian" },
  毎日: { text: "毎日", hiragana: "まいにち", romaji: "mainichi", meaning: "mỗi ngày, hàng ngày", hanviet: "MỖI NHẬT", isKanji: true, lesson: "Bài 3 · Thời gian" },
  まいにち: { text: "毎日", hiragana: "まいにち", romaji: "mainichi", meaning: "mỗi ngày, hàng ngày", hanviet: "MỖI NHẬT", isKanji: false, lesson: "Bài 3 · Thời gian" },
  午前: { text: "午前", hiragana: "ごぜん", romaji: "gozen", meaning: "buổi sáng, trước 12h trưa (AM)", hanviet: "NGỌ TIỀN", isKanji: true, lesson: "Bài 3 · Thời gian" },
  ごぜん: { text: "午前", hiragana: "ごぜん", romaji: "gozen", meaning: "buổi sáng, trước 12h trưa (AM)", hanviet: "NGỌ TIỀN", isKanji: false, lesson: "Bài 3 · Thời gian" },
  午後: { text: "午後", hiragana: "ごご", romaji: "gogo", meaning: "buổi chiều, sau 12h trưa (PM)", hanviet: "NGỌ HẬU", isKanji: true, lesson: "Bài 3 · Thời gian" },
  ごご: { text: "午後", hiragana: "ごご", romaji: "gogo", meaning: "buổi chiều, sau 12h trưa (PM)", hanviet: "NGỌ HẬU", isKanji: false, lesson: "Bài 3 · Thời gian" },
  午前十時: { text: "午前十時", hiragana: "ごぜんじゅうじ", romaji: "gozen juu-ji", meaning: "10 giờ sáng", hanviet: "NGỌ TIỀN THẬP THỜI", isKanji: true, lesson: "Bài 3 · Thời gian" },
  午後四時半: { text: "午後四時半", hiragana: "ごごよじはん", romaji: "gogo yo-jihan", meaning: "4 giờ rưỡi chiều", hanviet: "NGỌ HẬU TỨ THỜI BÁN", isKanji: true, lesson: "Bài 3 · Thời gian" },
  四時半: { text: "四時半", hiragana: "よじはん", romaji: "yo-jihan", meaning: "4 giờ rưỡi", hanviet: "TỨ THỜI BÁN", isKanji: true, lesson: "Bài 3 · Thời gian" },
  よじはん: { text: "四時半", hiragana: "よじはん", romaji: "yo-jihan", meaning: "4 giờ rưỡi", hanviet: "TỨ THỜI BÁN", isKanji: false, lesson: "Bài 3 · Thời gian" },
  二時間: { text: "二時間", hiragana: "にじかん", romaji: "ni-jikan", meaning: "2 tiếng đồng hồ", hanviet: "NHỊ THỜI GIAN", isKanji: true, lesson: "Bài 3 · Thời gian" },
  十二時半: { text: "十二時半", hiragana: "じゅうにじはん", romaji: "juuni-jihan", meaning: "12 giờ rưỡi", hanviet: "THẬP NHỊ THỜI BÁN", isKanji: true, lesson: "Bài 3 · Thời gian" },
  十二じはん: { text: "十二時半", hiragana: "じゅうにじはん", romaji: "juuni-jihan", meaning: "12 giờ rưỡi", hanviet: "THẬP NHỊ THỜI BÁN", isKanji: true, lesson: "Bài 3 · Thời gian" },
  十九才: { text: "十九才", hiragana: "じゅうくさい", romaji: "juuku-sai", meaning: "19 tuổi", hanviet: "THẬP CỬU TÀI", isKanji: true, lesson: "Bài 1 · Giới thiệu" },
  二まい: { text: "二枚", hiragana: "にまい", romaji: "nimai", meaning: "2 tờ, 2 chiếc (áo)", hanviet: "NHỊ MAI", isKanji: true, lesson: "Bài 6 · Lượng từ" },
  二枚: { text: "二枚", hiragana: "にまい", romaji: "nimai", meaning: "2 tờ, 2 chiếc (áo)", hanviet: "NHỊ MAI", isKanji: true, lesson: "Bài 6 · Lượng từ" },
  三千円: { text: "三千円", hiragana: "さんぜんえん", romaji: "sanzen-en", meaning: "3.000 yên", hanviet: "TAM THIÊN VIÊN", isKanji: true, lesson: "Bài 2 · Mua sắm" },
  二千五百円: { text: "二千五百円", hiragana: "にせんごひゃくえん", romaji: "nisen gohyaku-en", meaning: "2.500 yên", hanviet: "NHỊ THIÊN NGŨ BÁCH VIÊN", isKanji: true, lesson: "Bài 2 · Mua sắm" },
  五千五百円: { text: "五千五百円", hiragana: "ごせんごひゃくえん", romaji: "gosen gohyaku-en", meaning: "5.500 yên", hanviet: "NGŨ THIÊN NGŨ BÁCH VIÊN", isKanji: true, lesson: "Bài 2 · Mua sắm" },
  一人: { text: "一人", hiragana: "ひとり", romaji: "hitori", meaning: "một mình", hanviet: "NHẤT NHÂN", isKanji: true, lesson: "Bài 5 · Đi lại" },
  ひとり: { text: "一人", hiragana: "ひとり", romaji: "hitori", meaning: "một mình", hanviet: "NHẤT NHÂN", isKanji: false, lesson: "Bài 5 · Đi lại" },
  二人: { text: "二人", hiragana: "ふたり", romaji: "futari", meaning: "hai người", hanviet: "NHỊ NHÂN", isKanji: true, lesson: "Bài 5 · Đi lại" },
  ふたり: { text: "二人", hiragana: "ふたり", romaji: "futari", meaning: "hai người", hanviet: "NHỊ NHÂN", isKanji: false, lesson: "Bài 5 · Đi lại" },

  // 3. Nhân vật & Địa danh
  東京: { text: "東京", hiragana: "とうきょう", romaji: "Toukyou", meaning: "Tokyo (thủ đô Nhật Bản)", hanviet: "ĐÔNG KINH", isKanji: true, lesson: "Bài 4 · Địa điểm" },
  本田さん: { text: "本田さん", hiragana: "ほんださん", romaji: "Honda-san", meaning: "bạn Honda / anh Honda", hanviet: "BẢN ĐIỀN", isKanji: true, lesson: "Bài 4 · Tên người" },
  本田: { text: "本田", hiragana: "ほんだ", romaji: "Honda", meaning: "họ Honda (Nhật Bản)", hanviet: "BẢN ĐIỀN", isKanji: true, lesson: "Bài 4 · Tên người" },
  ダナン市: { text: "ダナン市", hiragana: "ダナンし", romaji: "Danan-shi", meaning: "thành phố Đà Nẵng", hanviet: "THỊ", isKanji: true, lesson: "Bài 4 · Địa điểm" },
  男の人: { text: "男の人", hiragana: "おとこのひと", romaji: "otoko no hito", meaning: "người đàn ông, nam giới", hanviet: "NAM NHÂN", isKanji: true, lesson: "Bài 4 · Con người" },
  おとこのひと: { text: "男の人", hiragana: "おとこのひと", romaji: "otoko no hito", meaning: "người đàn ông, nam giới", hanviet: "NAM NHÂN", isKanji: false, lesson: "Bài 4 · Con người" },
  女の人: { text: "女の人", hiragana: "おんなのひと", romaji: "onna no hito", meaning: "người phụ nữ, nữ giới", hanviet: "NỮ NHÂN", isKanji: true, lesson: "Bài 4 · Con người" },
  おんなのひと: { text: "女の人", hiragana: "おんなのひと", romaji: "onna no hito", meaning: "người phụ nữ, nữ giới", hanviet: "NỮ NHÂN", isKanji: false, lesson: "Bài 4 · Con người" },
  駅の前: { text: "駅の前", hiragana: "えきのまえ", romaji: "eki no mae", meaning: "phía trước nhà ga", hanviet: "DỊCH TIỀN", isKanji: true, lesson: "Bài 4 · Vị trí" },
  えきの前: { text: "駅の前", hiragana: "えきのまえ", romaji: "eki no mae", meaning: "phía trước nhà ga", hanviet: "DỊCH TIỀN", isKanji: true, lesson: "Bài 4 · Vị trí" },
  日本の会社: { text: "日本の会社", hiragana: "にほんのかいしゃ", romaji: "Nihon no kaisha", meaning: "công ty Nhật Bản", hanviet: "NHẬT BẢN HỘI XÃ", isKanji: true, lesson: "Bài 6 · Công việc" },
  FPTだいがく: { text: "FPT大学", hiragana: "FPTだいがく", romaji: "Efu-pii-tii daigaku", meaning: "Đại học FPT", hanviet: "ĐẠI HỌC", isKanji: true, lesson: "Bài 1 · Trường học" },
  FPT大学: { text: "FPT大学", hiragana: "FPTだいがく", romaji: "Efu-pii-tii daigaku", meaning: "Đại học FPT", hanviet: "ĐẠI HỌC", isKanji: true, lesson: "Bài 1 · Trường học" },

  // 4. Các từ vựng, danh từ ghép trong bài đọc
  日本料理: { text: "日本料理", hiragana: "にほんりょうり", romaji: "nihon ryouri", meaning: "món ăn Nhật Bản, ẩm thực Nhật", hanviet: "NHẬT BẢN LIỆU LÝ", isKanji: true, lesson: "Bài 5 · Ẩm thực" },
  とり肉: { text: "とり肉", hiragana: "とりにく", romaji: "toriniku", meaning: "thịt gà", hanviet: "NHỤC", isKanji: true, lesson: "Bài 7 · Thực phẩm" },
  しょくじのどう具: { text: "食事の道具", hiragana: "しょくじのどうぐ", romaji: "shokuji no dougu", meaning: "dụng cụ ăn uống", hanviet: "THỰC SỰ ĐẠO CỤ", isKanji: true, lesson: "Bài 7 · Dụng cụ" },
  食事の道具: { text: "食事の道具", hiragana: "しょくじのどうぐ", romaji: "shokuji no dougu", meaning: "dụng cụ ăn uống", hanviet: "THỰC SỰ ĐẠO CỤ", isKanji: true, lesson: "Bài 7 · Dụng cụ" },
  しょくじ: { text: "食事", hiragana: "しょくじ", romaji: "shokuji", meaning: "bữa ăn, dùng bữa", hanviet: "THỰC SỰ", isKanji: false, lesson: "Bài 7 · Ẩm thực" },
  食事: { text: "食事", hiragana: "しょくじ", romaji: "shokuji", meaning: "bữa ăn, dùng bữa", hanviet: "THỰC SỰ", isKanji: true, lesson: "Bài 7 · Ẩm thực" },
  どう具: { text: "道具", hiragana: "どうぐ", romaji: "dougu", meaning: "dụng cụ, đồ dùng", hanviet: "ĐẠO CỤ", isKanji: true, lesson: "Bài 7 · Dụng cụ" },
  道具: { text: "道具", hiragana: "どうぐ", romaji: "dougu", meaning: "dụng cụ, đồ dùng", hanviet: "ĐẠO CỤ", isKanji: true, lesson: "Bài 7 · Dụng cụ" },
  学食: { text: "学食", hiragana: "がくしょく", romaji: "gakushoku", meaning: "nhà ăn sinh viên", hanviet: "HỌC THỰC", isKanji: true, lesson: "Bài 2 · Trường học" },
  がくしょく: { text: "学食", hiragana: "がくしょく", romaji: "gakushoku", meaning: "nhà ăn sinh viên", hanviet: "HỌC THỰC", isKanji: false, lesson: "Bài 2 · Trường học" },
  教室: { text: "教室", hiragana: "きょうしつ", romaji: "kyoushitsu", meaning: "lớp học, phòng học", hanviet: "GIÁO THẤT", isKanji: true, lesson: "Bài 2 · Trường học" },
  きょうしつ: { text: "教室", hiragana: "きょうしつ", romaji: "kyoushitsu", meaning: "lớp học, phòng học", hanviet: "GIÁO THẤT", isKanji: false, lesson: "Bài 2 · Trường học" },
  野きゅう: { text: "野球", hiragana: "やきゅう", romaji: "yakyuu", meaning: "môn bóng chày", hanviet: "DÃ CẦU", isKanji: true, lesson: "Bài 6 · Thể thao" },
  野球: { text: "野球", hiragana: "やきゅう", romaji: "yakyuu", meaning: "môn bóng chày", hanviet: "DÃ CẦU", isKanji: true, lesson: "Bài 6 · Thể thao" },
  野さい: { text: "野菜", hiragana: "やさい", romaji: "yasai", meaning: "rau củ", hanviet: "DÃ THÁI", isKanji: true, lesson: "Bài 7 · Thực phẩm" },
  野菜: { text: "野菜", hiragana: "やさい", romaji: "yasai", meaning: "rau củ", hanviet: "DÃ THÁI", isKanji: true, lesson: "Bài 7 · Thực phẩm" },
  ゆう名な: { text: "有名な", hiragana: "ゆうめいな", romaji: "yuumeina", meaning: "nổi tiếng", hanviet: "HỮU DANH", isKanji: true, lesson: "Bài 4 · Tính từ" },
  有名な: { text: "有名な", hiragana: "ゆうめいな", romaji: "yuumeina", meaning: "nổi tiếng", hanviet: "HỮU DANH", isKanji: true, lesson: "Bài 4 · Tính từ" },
  有名: { text: "有名", hiragana: "ゆうめい", romaji: "yuumei", meaning: "nổi tiếng", hanviet: "HỮU DANH", isKanji: true, lesson: "Bài 4 · Tính từ" },
  自分の名前: { text: "自分の名前", hiragana: "じぶんのなまえ", romaji: "jibun no namae", meaning: "tên của chính mình", hanviet: "TỰ PHÂN DANH TIỀN", isKanji: true, lesson: "Bài 4 · Danh từ" },
  じぶんの名前: { text: "自分の名前", hiragana: "じぶんのなまえ", romaji: "jibun no namae", meaning: "tên của chính mình", hanviet: "TỰ PHÂN DANH TIỀN", isKanji: true, lesson: "Bài 4 · Danh từ" },
  自分: { text: "自分", hiragana: "じぶん", romaji: "jibun", meaning: "bản thân mình, tự mình", hanviet: "TỰ PHÂN", isKanji: true, lesson: "Bài 4 · Đại từ" },
  じぶん: { text: "自分", hiragana: "じぶん", romaji: "jibun", meaning: "bản thân mình, tự mình", hanviet: "TỰ PHÂN", isKanji: false, lesson: "Bài 4 · Đại từ" },
  名前: { text: "名前", hiragana: "なまえ", romaji: "namae", meaning: "họ tên", hanviet: "DANH TIỀN", isKanji: true, lesson: "Bài 4 · Danh từ" },
  スポーツ大会: { text: "スポーツ大会", hiragana: "スポーツたいかい", romaji: "supootsu taikai", meaning: "đại hội thể thao", hanviet: "ĐẠI HỘI", isKanji: true, lesson: "Bài 6 · Sự kiện" },
  白いTシャツ: { text: "白いTシャツ", hiragana: "しろいTシャツ", romaji: "shiroi tiishatsu", meaning: "áo phông trắng", hanviet: "BẠCH", isKanji: true, lesson: "Bài 4 · Đồ mặc" },
  しろいTシャツ: { text: "白いTシャツ", hiragana: "しろいTシャツ", romaji: "shiroi tiishatsu", meaning: "áo phông trắng", hanviet: "BẠCH", isKanji: true, lesson: "Bài 4 · Đồ mặc" },

  // 5. Động từ chia quá khứ / thể て / thể ý muốn
  来た: { text: "来た", hiragana: "きた", romaji: "kita", meaning: "đã đến (từ...)", hanviet: "LAI", isKanji: true, lesson: "Bài 5 · Động từ" },
  書いた: { text: "書いた", hiragana: "かいた", romaji: "kaita", meaning: "đã viết", hanviet: "THƯ", isKanji: true, lesson: "Bài 6 · Động từ" },
  読んだ: { text: "読んだ", hiragana: "よんだ", romaji: "yonda", meaning: "đã đọc", hanviet: "ĐỘC", isKanji: true, lesson: "Bài 6 · Động từ" },
  飲んだ: { text: "飲んだ", hiragana: "のんだ", romaji: "nonda", meaning: "đã uống", hanviet: "ẨM", isKanji: true, lesson: "Bài 5 · Động từ" },
  食べた: { text: "食べた", hiragana: "たべた", romaji: "tabeta", meaning: "đã ăn", hanviet: "THỰC", isKanji: true, lesson: "Bài 5 · Động từ" },
  帰った: { text: "帰った", hiragana: "かえった", romaji: "kaetta", meaning: "đã về", hanviet: "QUY", isKanji: true, lesson: "Bài 5 · Động từ" },
  行った: { text: "行った", hiragana: "いった", romaji: "itta", meaning: "đã đi", hanviet: "HÀNH", isKanji: true, lesson: "Bài 5 · Động từ" },
  話した: { text: "話した", hiragana: "はなした", romaji: "hanashita", meaning: "đã nói chuyện", hanviet: "THOẠI", isKanji: true, lesson: "Bài 6 · Động từ" },
  歩いた: { text: "歩いた", hiragana: "あるいた", romaji: "aruita", meaning: "đã đi bộ", hanviet: "BỘ", isKanji: true, lesson: "Bài 5 · Động từ" },
  働きたい: { text: "働きたい", hiragana: "はたらきたい", romaji: "hatarakitai", meaning: "muốn làm việc", hanviet: "ĐỘNG", isKanji: true, lesson: "Bài 6 · Động từ" },
  はたらきたい: { text: "働きたい", hiragana: "はたらきたい", romaji: "hatarakitai", meaning: "muốn làm việc", hanviet: "ĐỘNG", isKanji: false, lesson: "Bài 6 · Động từ" },
  見に行きませんか: { text: "見に行きませんか", hiragana: "みにいきませんか", romaji: "mi ni ikimasen ka", meaning: "cùng đi xem nhé?", hanviet: "KIẾN HÀNH", isKanji: true, lesson: "Bài 6 · Ngữ pháp" },
  見に行きます: { text: "見に行きます", hiragana: "みにいきます", romaji: "mi ni ikimasu", meaning: "đi xem", hanviet: "KIẾN HÀNH", isKanji: true, lesson: "Bài 6 · Ngữ pháp" },
  教えてくれました: { text: "教えてくれました", hiragana: "おしえてくれました", romaji: "oshiete kuremashita", meaning: "đã dạy / chỉ bảo cho", hanviet: "GIÁO", isKanji: true, lesson: "Bài 6 · Ngữ pháp" },
  おしえてくれました: { text: "教えてくれました", hiragana: "おしえてくれました", romaji: "oshiete kuremashita", meaning: "đã dạy / chỉ bảo cho", isKanji: false, lesson: "Bài 6 · Ngữ pháp" },
  あつまって: { text: "集まって", hiragana: "あつまって", romaji: "atsumatte", meaning: "tập trung lại", isKanji: false, lesson: "Bài 6 · Động từ" },
  集まって: { text: "集まって", hiragana: "あつまって", romaji: "atsumatte", meaning: "tập trung lại", hanviet: "TẬP", isKanji: true, lesson: "Bài 6 · Động từ" },
  わたしました: { text: "渡しました", hiragana: "わたしました", romaji: "watashimashita", meaning: "đã đưa, đã trao", isKanji: false, lesson: "Bài 6 · Động từ" },
  渡しました: { text: "渡しました", hiragana: "わたしました", romaji: "watashimashita", meaning: "đã đưa, đã trao", hanviet: "ĐỘ", isKanji: true, lesson: "Bài 6 · Động từ" },
  つくりました: { text: "作りました", hiragana: "つくりました", romaji: "tsukurimashita", meaning: "đã nấu / làm ra", isKanji: false, lesson: "Bài 7 · Động từ" },
  つくり: { text: "作り", hiragana: "つくり", romaji: "tsukuri", meaning: "sự chế biến, việc làm", isKanji: false, lesson: "Bài 7 · Động từ" },
  つかれて: { text: "疲れて", hiragana: "つかれて", romaji: "tsukarete", meaning: "bị mệt mỏi", isKanji: false, lesson: "Bài 6 · Tính từ" },
  なくなりました: { text: "無くなりました", hiragana: "なくなりました", romaji: "nakunarimashita", meaning: "đã hết, không còn", isKanji: false, lesson: "Bài 6 · Động từ" },
  開けて: { text: "開けて", hiragana: "あけて", romaji: "akete", meaning: "hãy mở (sách) ra", isKanji: true, lesson: "Bài 6 · Ngữ pháp" },
  あけて: { text: "開けて", hiragana: "あけて", romaji: "akete", meaning: "hãy mở ra", isKanji: false, lesson: "Bài 6 · Ngữ pháp" },
};

/**
 * Tra cứu thông tin chi tiết (Romaji, Hiragana, Hán Việt, Ý nghĩa) khi người dùng
 * ấn đúp (double-click) vào bất kỳ một chữ hoặc một từ trong bài đọc.
 */
export function inspectJapaneseCharOrWord(target: string): WordInspection {
  const clean = target.trim().replace(/^[「『（(]+|[」』）)！？。、・…]+$/g, "");
  if (!clean) {
    return {
      text: "",
      hiragana: "",
      romaji: "",
      meaning: "",
      isKanji: false,
    };
  }

  // 1. Kiểm tra trực tiếp trong bảng từ vựng chuyên dụng cho bài đọc
  if (READING_SPECIAL_WORDS[clean]) {
    return { ...READING_SPECIAL_WORDS[clean] };
  }

  // 2. Khớp CHÍNH XÁC trong từ điển giáo trình (vocabulary.ts)
  const exactVocab = vocabulary.find(
    (w) =>
      w.word === clean ||
      w.word.replace(/（.*?）/g, "").trim() === clean ||
      w.reading === clean,
  );

  if (exactVocab) {
    const wordHiragana = exactVocab.reading || toKana(exactVocab.word);
    const wordRomaji = toRomaji(wordHiragana);
    const matchedKanjiChars = exactVocab.word.match(/[一-龯]/g) || [];
    const hanvietList = matchedKanjiChars
      .map((c) => alphabet.find((g) => g.char === c && g.type === "kanji")?.hanviet)
      .filter(Boolean);

    return {
      text: exactVocab.word,
      hiragana: wordHiragana,
      romaji: wordRomaji,
      meaning: exactVocab.meaning,
      hanviet: hanvietList.length > 0 ? hanvietList.join(" ") : undefined,
      isKanji: hasKanji(clean),
      lesson: exactVocab.lesson,
    };
  }

  // 3. Khớp CHÍNH XÁC trong từ ghép chữ Hán của alphabet.ts (料理, 料金, 新幹線...)
  for (const k of alphabet) {
    if (k.type === "kanji" && k.compounds) {
      const matchComp = k.compounds.find(
        (c) => c.word === clean || c.reading === clean,
      );
      if (matchComp) {
        const hiragana = matchComp.reading || toKana(clean);
        const romaji = toRomaji(hiragana);
        const kanjiChars = clean.match(/[一-龯]/g) || [];
        const hanvietList = kanjiChars
          .map((c) => alphabet.find((g) => g.char === c && g.type === "kanji")?.hanviet)
          .filter(Boolean);

        return {
          text: clean,
          hiragana,
          romaji,
          meaning: matchComp.meaning,
          hanviet: hanvietList.length > 0 ? hanvietList.join(" ") : undefined,
          isKanji: true,
          lesson: k.row,
        };
      }
    }
  }

  // 4. Khớp tiếp đầu ngữ cho động từ / tính từ chia (prefix match, loại trừ đơn tự)
  if (clean.length >= 2) {
    const prefixMatches = vocabulary
      .filter((w) => {
        const cw = w.word.replace(/（.*?）/g, "").trim();
        const stem = cw.length >= 2 ? cw.slice(0, 2) : cw;
        return stem.length >= 2 && (clean.startsWith(stem) || cw.startsWith(clean));
      })
      .sort((a, b) => b.word.length - a.word.length);

    if (prefixMatches.length > 0) {
      const best = prefixMatches[0];
      const matchedKanjiChars = best.word.match(/[一-龯]/g) || [];
      const hanvietList = matchedKanjiChars
        .map((c) => alphabet.find((g) => g.char === c && g.type === "kanji")?.hanviet)
        .filter(Boolean);
      const hiragana = toKana(clean);
      const romaji = toRomaji(hiragana);

      return {
        text: clean,
        hiragana,
        romaji,
        meaning: `${best.meaning} (dạng biến thể của 「${best.word}」)`,
        hanviet: hanvietList.length > 0 ? hanvietList.join(" ") : undefined,
        isKanji: hasKanji(clean),
        lesson: best.lesson,
      };
    }
  }

  // 5. Kiểm tra nếu là chữ Hán (Kanji) đơn lẻ trong alphabet.ts
  if (clean.length === 1 && hasKanji(clean)) {
    const kanjiItem = alphabet.find((g) => g.char === clean && g.type === "kanji");
    const fallbackReading = KANJI_SINGLE_CHAR_MAP[clean] || "";
    const hiraganaReading =
      fallbackReading ||
      (kanjiItem?.kunyomi && /[ぁ-んァ-ヶ]/.test(kanjiItem.kunyomi)
        ? kanjiItem.kunyomi.split(".")[0]
        : kanjiItem?.onyomi && /[ぁ-んァ-ヶ]/.test(kanjiItem.onyomi)
        ? kanjiItem.onyomi
        : "");
    const romajiReading = toRomaji(hiraganaReading) || kanjiItem?.romaji || "";

    return {
      text: clean,
      hiragana: hiraganaReading ? `${hiraganaReading}` : "",
      romaji: romajiReading,
      meaning: kanjiItem?.meaning || "Chữ Hán trong bài học",
      hanviet: kanjiItem?.hanviet,
      isKanji: true,
      lesson: kanjiItem?.row,
    };
  }

  // 6. Nếu là chuỗi có chứa chữ Hán ghép chưa có trong từ điển
  if (hasKanji(clean)) {
    const hiragana = toKana(clean);
    const romaji = toRomaji(hiragana);
    const kanjiChars = clean.match(/[一-龯]/g) || [];
    const hanvietList = kanjiChars
      .map((c) => alphabet.find((g) => g.char === c && g.type === "kanji")?.hanviet)
      .filter(Boolean);

    return {
      text: clean,
      hiragana,
      romaji,
      meaning: hanvietList.length > 0 ? `Từ chữ Hán ghép (${hanvietList.join(" ")})` : "Từ chữ Hán",
      hanviet: hanvietList.length > 0 ? hanvietList.join(" ") : undefined,
      isKanji: true,
    };
  }

  // 7. Nếu là Kana đơn hoặc từ Kana
  const kanaRomaji = toRomaji(clean);
  return {
    text: clean,
    hiragana: clean,
    romaji: kanaRomaji,
    meaning: "Ký tự Kana",
    isKanji: false,
  };
}

// Bảng từ vựng và ngữ pháp bổ trợ cho việc phân tách Romaji có dấu cách chuẩn xác
const EXTRA_ROMAJI_TOKENS: [string, string][] = [
  // Chủ ngữ, đại từ & chỉ định từ
  ["私たち", "watashitachi"],
  ["わたしたち", "watashitachi"],
  ["あなたたち", "anatatachi"],
  ["この", "kono"],
  ["その", "sono"],
  ["あの", "ano"],
  ["どの", "dono"],
  ["これ", "kore"],
  ["それ", "sore"],
  ["あれ", "are"],
  ["どれ", "dore"],
  ["ここ", "koko"],
  ["そこ", "soko"],
  ["あそこ", "asoko"],
  ["どこ", "doko"],
  ["だれ", "dare"],
  ["誰", "dare"],
  ["何", "nani"],
  ["なん", "nan"],
  ["いくら", "ikura"],
  ["いくつ", "ikutsu"],
  ["どうして", "doushite"],
  ["なぜ", "naze"],
  ["どんな", "donna"],
  ["どう", "dou"],

  // Màu sắc & tính từ thông dụng
  ["白い", "shiroi"],
  ["しろい", "shiroi"],
  ["青い", "aoi"],
  ["あおい", "aoi"],
  ["黒い", "kuroi"],
  ["くろい", "kuroi"],
  ["赤い", "akai"],
  ["あかい", "akai"],
  ["新しい", "atarashii"],
  ["あたらしい", "atarashii"],
  ["古い", "furui"],
  ["ふるい", "furui"],
  ["大きい", "ookii"],
  ["おおきい", "ookii"],
  ["小さい", "chiisai"],
  ["ちいさい", "chiisai"],
  ["高い", "takai"],
  ["たかい", "takai"],
  ["安い", "yasui"],
  ["やすい", "yasui"],
  ["広い", "hiroi"],
  ["ひろい", "hiroi"],
  ["狭い", "semai"],
  ["せまい", "semai"],
  ["静か", "shizuka"],
  ["しずか", "shizuka"],
  ["賑やか", "nigiyaka"],
  ["にぎやか", "nigiyaka"],
  ["便利", "benri"],
  ["べんり", "benri"],
  ["親切", "shinsetsu"],
  ["しんせつ", "shinsetsu"],
  ["有名", "yuumei"],
  ["ゆうめい", "yuumei"],
  ["きれい", "kirei"],
  ["綺麗", "kirei"],
  ["面白い", "omoshiroi"],
  ["おもしろい", "omoshiroi"],
  ["おいしい", "oishii"],
  ["美味しい", "oishii"],
  ["楽しい", "tanoshii"],
  ["たのしい", "tanoshii"],
  ["忙しい", "isogashii"],
  ["いそがしい", "isogashii"],
  ["暇", "hima"],
  ["ひま", "hima"],

  // Thời gian, ngày tháng năm
  ["今日", "kyou"],
  ["きょう", "kyou"],
  ["明日", "ashita"],
  ["あした", "ashita"],
  ["きのう", "kinou"],
  ["昨日", "kinou"],
  ["今", "ima"],
  ["いま", "ima"],
  ["毎朝", "maiasa"],
  ["まいあさ", "maiasa"],
  ["毎日", "mainichi"],
  ["まいにち", "mainichi"],
  ["毎週", "maishuu"],
  ["まいしゅう", "maishuu"],
  ["毎晩", "maiban"],
  ["まいばん", "maiban"],
  ["午前", "gozen"],
  ["ごぜん", "gozen"],
  ["午後", "gogo"],
  ["ごご", "gogo"],
  ["朝", "asa"],
  ["あさ", "asa"],
  ["昼", "hiru"],
  ["ひる", "hiru"],
  ["夜", "yoru"],
  ["よる", "yoru"],
  ["一年", "ichinen"],
  ["いちねん", "ichinen"],
  ["二年", "ninen"],
  ["三年", "sannen"],
  ["四年", "yonen"],
  ["五年", "gonen"],
  ["今年", "kotoshi"],
  ["ことし", "kotoshi"],
  ["去年", "kyonen"],
  ["きょねん", "kyonen"],
  ["来年", "rainen"],
  ["らいねん", "rainen"],
  ["何年", "nannen"],
  ["十二か月", "juuni-kagetsu"],
  ["四月一日", "shigatsu tsuitachi"],
  ["一日", "tsuitachi"],
  ["ついたち", "tsuitachi"],
  ["二日", "futsuka"],
  ["ふつか", "futsuka"],
  ["三日", "mikka"],
  ["みっか", "mikka"],
  ["四日", "yokka"],
  ["よっか", "yokka"],
  ["五日", "itsuka"],
  ["いつか", "itsuka"],
  ["六日", "muika"],
  ["むいか", "muika"],
  ["七日", "nanoka"],
  ["なのか", "nanoka"],
  ["八日", "youka"],
  ["ようか", "youka"],
  ["九日", "kokonoka"],
  ["ここのか", "kokonoka"],
  ["十日", "tooka"],
  ["とおか", "tooka"],

  // Địa điểm & đồ vật & người
  ["ベトナム人", "betonamujin"],
  ["日本人", "nihonjin"],
  ["にほんじん", "nihonjin"],
  ["外国人", "gaikokujin"],
  ["がいこくじん", "gaikokujin"],
  ["木村先生", "Kimura-sensei"],
  ["田中先生", "Tanaka-sensei"],
  ["佐藤先生", "Satou-sensei"],
  ["山田先生", "Yamada-sensei"],
  ["小林先生", "Kobayashi-sensei"],
  ["鈴木先生", "Suzuki-sensei"],
  ["きむらせんせい", "Kimura-sensei"],
  ["たなかせんせい", "Tanaka-sensei"],
  ["さとうせんせい", "Satou-sensei"],
  ["やまだせんせい", "Yamada-sensei"],
  ["こばやしせんせい", "Kobayashi-sensei"],
  ["すずきせんせい", "Suzuki-sensei"],
  ["山田さん", "Yamada-san"],
  ["本田さん", "Honda-san"],
  ["田中さん", "Tanaka-san"],
  ["佐藤さん", "Satou-san"],
  ["小林さん", "Kobayashi-san"],
  ["鈴木さん", "Suzuki-san"],
  ["やまださん", "Yamada-san"],
  ["ほんださん", "Honda-san"],
  ["学校", "gakkou"],
  ["がっこう", "gakkou"],
  ["教室", "kyoushitsu"],
  ["きょうしつ", "kyoushitsu"],
  ["図書館", "toshokan"],
  ["としょかん", "toshokan"],
  ["売店", "baiten"],
  ["ばいてん", "baiten"],
  ["部屋", "heya"],
  ["へや", "heya"],
  ["アパート", "apaato"],
  ["オフィス", "ofisu"],
  ["スーパー", "suupaa"],
  ["コンビニ", "konbini"],
  ["ホテル", "hoteru"],
  ["カフェ", "kafe"],
  ["レストラン", "resutoran"],
  ["駅", "eki"],
  ["えき", "eki"],
  ["公園", "kouen"],
  ["こうえん", "kouen"],
  ["お寺", "otera"],
  ["おてら", "otera"],
  ["会議室", "kaigishitsu"],
  ["かいぎしつ", "kaigishitsu"],
  ["授業", "jugyou"],
  ["じゅぎょう", "jugyou"],
  ["日本語", "nihongo"],
  ["にほんご", "nihongo"],
  ["英語", "eigo"],
  ["えいご", "eigo"],
  ["パソコン", "pasokon"],
  ["ノート", "nooto"],
  ["ペン", "pen"],
  ["机", "tsukue"],
  ["つくえ", "tsukue"],
  ["椅子", "isu"],
  ["いす", "isu"],
  ["本棚", "hondana"],
  ["ほんだな", "hondana"],
  ["カレンダー", "karendaa"],
  ["とり肉", "toriniku"],
  ["とりにく", "toriniku"],
  ["魚", "sakana"],
  ["さかな", "sakana"],
  ["野さい", "yasai"],
  ["野菜", "yasai"],
  ["やさい", "yasai"],
  ["食べ物", "tabemono"],
  ["たべもの", "tabemono"],
  ["飲み物", "nomimono"],
  ["のみもの", "nomimono"],
  ["お土産", "omiyage"],
  ["おみやげ", "omiyage"],
  ["お菓子", "okashi"],
  ["おかし", "okashi"],
  ["料理", "ryouri"],
  ["りょうり", "ryouri"],
  ["カレー料理", "karee ryouri"],
  ["カレー", "karee"],
  ["すき焼き", "sukiyaki"],
  ["スプーン", "supuun"],
  ["フォーク", "fooku"],
  ["ナイフ", "naifu"],
  ["テーブル", "teeburu"],
  ["ベッド", "beddo"],
  ["サッカー", "sakkaa"],
  ["テニス", "tenisu"],
  ["バドミントン", "badominton"],
  ["テレビ", "terebi"],
  ["テスト", "tesuto"],
  ["シャワー", "shawaa"],
  ["ビール", "biiru"],
  ["お茶", "ocha"],
  ["おちゃ", "ocha"],
  ["ジュース", "juusu"],
  ["コーヒー", "koohii"],
  ["水", "mizu"],
  ["みず", "mizu"],
  ["しりょう", "shiryou"],
  ["資料", "shiryou"],
  ["ぶちょう", "buchou"],
  ["部長", "buchou"],
  ["せつめい", "setsumei"],
  ["説明", "setsumei"],
  ["ぎじゅつ", "gijutsu"],
  ["技術", "gijutsu"],
  ["きょう力", "kyouryoku"],
  ["協力", "kyouryoku"],
  ["おれい", "orei"],
  ["お礼", "orei"],
  ["名前", "namae"],
  ["なまえ", "namae"],
  ["国", "kuni"],
  ["くに", "kuni"],
  ["田んぼ", "tanbo"],
  ["たんぼ", "tanbo"],
  ["山", "yama"],
  ["やま", "yama"],
  ["町", "machi"],
  ["まち", "machi"],
  ["市", "shi"],
  ["し", "shi"],
  ["区", "ku"],
  ["く", "ku"],
  ["門", "mon"],
  ["もん", "mon"],

  // Đếm số, lượng từ
  ["百五十円", "hyaku gojuu-en"],
  ["五百四十円", "gohyaku yonjuu-en"],
  ["八十円", "hachijuu-en"],
  ["五十円", "gojuu-en"],
  ["一千円", "issen-en"],
  ["一万円", "ichiman-en"],
  ["二千五百円", "nisen gohyaku-en"],
  ["五千五百円", "gosen gohyaku-en"],
  ["三千円", "sanzen-en"],
  ["五百円", "gohyaku-en"],
  ["三百円", "sanbyaku-en"],
  ["百円", "hyaku-en"],
  ["九人", "kyuunin"],
  ["八人", "hachinin"],
  ["七人", "shichinin"],
  ["六人", "rokunin"],
  ["五人", "gonin"],
  ["四人", "yonin"],
  ["三人", "sannin"],
  ["二人", "futari"],
  ["一人", "hitori"],
  ["何人", "nannin"],
  ["一冊", "issatsu"],
  ["二冊", "nisatsu"],
  ["三冊", "sansatsu"],
  ["何冊", "nansatsu"],
  ["一本", "ippon"],
  ["二本", "nihon"],
  ["三本", "sanbon"],
  ["何本", "nanbon"],
  ["三階", "sangai"],
  ["二階", "nikai"],
  ["一階", "ikkai"],
  ["何階", "nankai"],
  ["十五分", "juugofun"],
  ["十分", "juppun"],
  ["三十分", "sanjuppun"],
  ["二十分", "nijuppun"],
  ["何分", "nanpun"],
  ["一時間目", "ichijikanme"],
  ["二時間目", "nijikanme"],
  ["三時間目", "sanjikanme"],
  ["何時間", "nanjikan"],
  ["一時間", "ichijikan"],
  ["二時間", "nijikan"],
  ["午前八時半", "gozen hachi-jihan"],
  ["午前九時半", "gozen ku-jihan"],
  ["午前十時半", "gozen juu-jihan"],
  ["十二時半", "juuni-jihan"],
  ["六時半", "roku-jihan"],
  ["午後五時", "gogo go-ji"],
  ["午後四時", "gogo yo-ji"],
  ["三十五才", "sanjuugo-sai"],
  ["三十才", "sanjuu-sai"],
  ["二十八才", "nijuuhachi-sai"],
  ["十九才", "juuku-sai"],
  ["二十才", "hatachi"],

  // Động từ, cụm vị ngữ & liên từ
  ["といっしょに", "to issho ni"],
  ["だけでなく", "dakedenaku"],
  ["のために", "no tame ni"],
  ["について", "ni tsuite"],
  ["まわりで", "no mawari de"],
  ["まえに", "mae ni"],
  ["前に", "mae ni"],
  ["から", "kara"],
  ["まで", "made"],
  ["より", "yori"],
  ["など", "nado"],
  ["でも", "demo"],
  ["また", "mata"],
  ["そして", "soshite"],
  ["いつも", "itsumo"],
  ["とても", "totemo"],
  ["ずっと", "zutto"],
  ["みんなで", "minna de"],
  ["ぜんぶで", "zenbu de"],
  ["ぜんぶ", "zenbu"],
  ["じぶんで", "jibun de"],
  ["自分で", "jibun de"],
  ["自分で作った", "jibun de tsukutta"],
  ["じぶんでつくった", "jibun de tsukutta"],
  ["作った", "tsukutta"],
  ["つくった", "tsukutta"],
  ["入りました", "hairimashita"],
  ["はいりました", "hairimashita"],
  ["入ります", "hairimasu"],
  ["はいります", "hairimasu"],
  ["行きました", "ikimashita"],
  ["いきました", "ikimashita"],
  ["行きます", "ikimasu"],
  ["いきます", "ikimasu"],
  ["帰りました", "kaerimashita"],
  ["かえりました", "kaerimashita"],
  ["帰ります", "kaerimasu"],
  ["かえります", "kaerimasu"],
  ["帰ってから", "kaette kara"],
  ["かえってから", "kaette kara"],
  ["作りました", "tsukurimashita"],
  ["つくりました", "tsukurimashita"],
  ["作ります", "tsukurimasu"],
  ["つくります", "tsukurimasu"],
  ["話しました", "hanashimashita"],
  ["はなしました", "hanashimashita"],
  ["話します", "hanashimasu"],
  ["はなします", "hanashimasu"],
  ["読みました", "yomimashita"],
  ["よみました", "yomimashita"],
  ["読みます", "yomimasu"],
  ["よみます", "yomimasu"],
  ["書きました", "kakimashita"],
  ["かきました", "kakimashita"],
  ["書きます", "kakimasu"],
  ["かきます", "kakimasu"],
  ["聞きました", "kikimashita"],
  ["ききました", "kikimashita"],
  ["聞いて", "kiite"],
  ["きいて", "kiite"],
  ["聞きます", "kikimasu"],
  ["ききます", "kikimasu"],
  ["見学に行きました", "kengaku ni ikimashita"],
  ["けんがくにいきました", "kengaku ni ikimashita"],
  ["見学に行きます", "kengaku ni ikimasu"],
  ["けんがくにいきます", "kengaku ni ikimasu"],
  ["買い物に行きました", "kaimono ni ikimashita"],
  ["かいものにいきました", "kaimono ni ikimashita"],
  ["買い物に行きます", "kaimono ni ikimasu"],
  ["かいものにいきます", "kaimono ni ikimasu"],
  ["散歩しました", "sanpo shimashita"],
  ["散歩して", "sanpo shite"],
  ["散歩します", "sanpo shimasu"],
  ["住んでいます", "sunde imasu"],
  ["すんでいます", "sunde imasu"],
  ["教えてくれました", "oshiete kuremashita"],
  ["おしえてくれました", "oshiete kuremashita"],
  ["言いました", "iimashita"],
  ["いいました", "iimashita"],
  ["言ってから", "itte kara"],
  ["いってから", "itte kara"],
  ["着いてから", "tsuite kara"],
  ["ついてから", "tsuite kara"],
  ["使いながら", "tsukainagara"],
  ["つかいながら", "tsukainagara"],
  ["飲みながら", "nominagara"],
  ["のみながら", "nominagara"],
  ["思い出しながら", "omoidashinagara"],
  ["おもい出しながら", "omoidashinagara"],
  ["勉強しますか", "benkyou shimasu ka"],
  ["べんきょうしますか", "benkyou shimasu ka"],
  ["勉強します", "benkyou shimasu"],
  ["勉強して", "benkyou shite"],
  ["勉強しました", "benkyou shimashita"],
  ["べんきょうします", "benkyou shimasu"],
  ["べんきょうして", "benkyou shite"],
  ["べんきょうしています", "benkyou shite imasu"],
  ["勉強しています", "benkyou shite imasu"],
  ["練習をします", "renshuu o shimasu"],
  ["練習します", "renshuu shimasu"],
  ["れんしゅうをします", "renshuu o shimasu"],
  ["れんしゅうします", "renshuu shimasu"],
  ["売られています", "urarete imasu"],
  ["うられています", "urarete imasu"],
  ["売っています", "utte imasu"],
  ["うっています", "utte imasu"],
  ["買いました", "kaimashita"],
  ["かいました", "kaimashita"],
  ["買います", "kaimasu"],
  ["かいます", "kaimasu"],
  ["起きます", "okimasu"],
  ["おきます", "okimasu"],
  ["寝ました", "nemashita"],
  ["ねました", "nemashita"],
  ["寝ます", "nemasu"],
  ["ねます", "nemasu"],
  ["歩いて", "aruite"],
  ["あるいて", "aruite"],
  ["出しました", "dashimashita"],
  ["だしました", "dashimashita"],
  ["出します", "dashimasu"],
  ["だします", "dashimasu"],
  ["出して", "dashite"],
  ["だして", "dashite"],
  ["もらいました", "moraimashita"],
  ["あります", "arimasu"],
  ["ありました", "arimashita"],
  ["います", "imasu"],
  ["いました", "imashita"],
  ["でした", "deshita"],
  ["ですから", "desu kara"],
  ["ですが", "desu ga"],
  ["です", "desu"],
  ["だ", "da"],

  // Trợ từ đơn
  ["は", "wa"],
  ["へ", "e"],
  ["を", "o"],
  ["が", "ga"],
  ["に", "ni"],
  ["で", "de"],
  ["と", "to"],
  ["も", "mo"],
  ["や", "ya"],
  ["の", "no"],
  ["か", "ka"],
  ["ね", "ne"],
  ["よ", "yo"],
  ["、", ","],
  ["。", "."],
  ["！", "!"],
  ["？", "?"],
];

let cachedRomajiDict: Map<string, string> | null = null;
let cachedSortedKeys: string[] | null = null;

function getRomajiDict(): { dict: Map<string, string>; sortedKeys: string[] } {
  if (cachedRomajiDict && cachedSortedKeys) {
    return { dict: cachedRomajiDict, sortedKeys: cachedSortedKeys };
  }

  const dict = new Map<string, string>();

  // 1. Thêm các từ đặc biệt đã cấu hình
  for (const [key, val] of Object.entries(READING_SPECIAL_WORDS)) {
    if (val.romaji) {
      dict.set(key, val.romaji);
      if (val.hiragana && val.hiragana !== key) dict.set(val.hiragana, val.romaji);
    }
  }

  // 2. Thêm từ vựng giáo trình
  for (const v of vocabulary) {
    const cleanWord = v.word.replace(/（.*?）/g, "").trim();
    const rom = toRomaji(v.reading);
    if (cleanWord && !dict.has(cleanWord)) dict.set(cleanWord, rom);
    if (v.reading && !dict.has(v.reading)) dict.set(v.reading, rom);
  }

  // 3. Thêm bảng từ vựng và ngữ pháp bổ trợ
  for (const [k, r] of EXTRA_ROMAJI_TOKENS) {
    dict.set(k, r);
  }

  const sortedKeys = Array.from(dict.keys()).sort((a, b) => b.length - a.length);
  cachedRomajiDict = dict;
  cachedSortedKeys = sortedKeys;

  return { dict, sortedKeys };
}

/**
 * Phân tích và chuyển đổi một câu tiếng Nhật thành Romaji có dấu cách, hạt từ và dấu câu chuẩn.
 */
function singleSentenceToRomaji(sentence: string): string {
  const clean = sentence.trim();
  if (!clean) return "";

  const { dict, sortedKeys } = getRomajiDict();
  let i = 0;
  const tokens: string[] = [];

  while (i < clean.length) {
    let matched = false;
    for (const key of sortedKeys) {
      if (clean.startsWith(key, i)) {
        tokens.push(dict.get(key)!);
        i += key.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      const rest = clean.slice(i);
      const kataMatch = rest.match(/^[ァ-ヴー]+/);
      if (kataMatch) {
        tokens.push(toRomaji(kataMatch[0]));
        i += kataMatch[0].length;
        continue;
      }
      const engMatch = rest.match(/^[A-Za-z0-9-]+/);
      if (engMatch) {
        tokens.push(engMatch[0]);
        i += engMatch[0].length;
        continue;
      }
      const char = clean[i];
      if (/\s/.test(char)) {
        i++;
        continue;
      }
      tokens.push(toRomaji(toKana(char)));
      i++;
    }
  }

  let out = tokens
    .join(" ")
    .replace(/\s+([,.:;!?])/g, (_match, p1) => p1)
    .replace(/([,.:;!?])(?=[^\s])/g, (_match, p1) => p1 + " ")
    .replace(/\s+/g, " ")
    .trim();

  if (out.length > 0) {
    out = out.charAt(0).toUpperCase() + out.slice(1);
  }

  return out;
}

/**
 * Phân tích và chuyển đổi toàn bộ văn bản bài đọc sang Romaji hoàn chỉnh
 */
export function passageToRomaji(text: string): string {
  if (!text || !text.trim()) return "";

  // Tách theo câu dựa trên dấu chấm hoặc dòng mới
  const parts = text.split(/(?<=[。！？\n])/);
  const converted = parts.map((part) => singleSentenceToRomaji(part)).filter(Boolean);

  return converted.join(" ");
}
