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

/**
 * Phân tích và chuyển đổi toàn bộ văn bản bài đọc sang Romaji hoàn chỉnh
 */
export function passageToRomaji(text: string): string {
  const kanaText = toKana(text);
  return toRomaji(kanaText);
}
