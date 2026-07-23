const vocabularyData = [
    { id: 1, lesson: 1, word: "私", reading: "わたし", meaning: "Tôi", example: "私は学生です。" },
    { id: 2, lesson: 1, word: "学生", reading: "がくせい", meaning: "Học sinh, sinh viên", example: "私は学生です。" },
    { id: 3, lesson: 1, word: "先生", reading: "せんせい", meaning: "Giáo viên", example: "彼は先生です。" },
    { id: 4, lesson: 1, word: "学校", reading: "がっこう", meaning: "Trường học", example: "学校へ行きます。" },
    { id: 5, lesson: 1, word: "本", reading: "ほん", meaning: "Sách", example: "本を読みます。" },
    { id: 6, lesson: 1, word: "食べる", reading: "たべる", meaning: "Ăn", example: "りんごを食べます。" },
    { id: 7, lesson: 1, word: "飲む", reading: "のむ", meaning: "Uống", example: "水を飲みます。" },
    { id: 8, lesson: 1, word: "行く", reading: "いく", meaning: "Đi", example: "日本へ行きます。" },
    { id: 9, lesson: 1, word: "来る", reading: "くる", meaning: "Đến", example: "友達が来ます。" },
    { id: 10, lesson: 1, word: "見る", reading: "みる", meaning: "Nhìn, xem", example: "テレビを見ます。" },
    { id: 11, lesson: 2, word: "買う", reading: "かう", meaning: "Mua", example: "辞書を買います。" },
    { id: 12, lesson: 2, word: "会う", reading: "あう", meaning: "Gặp gỡ", example: "友達に会います。" },
    { id: 13, lesson: 2, word: "聞く", reading: "きく", meaning: "Nghe", example: "音楽を聞きます。" },
    { id: 14, lesson: 2, word: "話す", reading: "はなす", meaning: "Nói chuyện", example: "日本語を話します。" },
    { id: 15, lesson: 2, word: "読む", reading: "よむ", meaning: "Đọc", example: "新聞を読みます。" },
    { id: 16, lesson: 2, word: "書く", reading: "かく", meaning: "Viết", example: "手紙を書きます。" },
    { id: 17, lesson: 2, word: "起きる", reading: "おきる", meaning: "Thức dậy", example: "６時に起きます。" },
    { id: 18, lesson: 2, word: "寝る", reading: "ねる", meaning: "Ngủ", example: "１１時に寝ます。" },
    { id: 19, lesson: 2, word: "働く", reading: "はたらく", meaning: "Làm việc", example: "会社で働きます。" },
    { id: 20, lesson: 2, word: "休む", reading: "やすむ", meaning: "Nghỉ ngơi", example: "日曜日は休みます。" },
    { id: 21, lesson: 3, word: "パソコン", reading: "pasokon", meaning: "Máy tính xách tay / PC", example: "" },
    { id: 22, lesson: 3, word: "カメラ", reading: "kamera", meaning: "Máy ảnh", example: "" },
    { id: 23, lesson: 3, word: "けいたいでんわ", reading: "keitai denwa", meaning: "Điện thoại di động", example: "" },
    { id: 24, lesson: 3, word: "でんしじしょ", reading: "denshi jisho", meaning: "Từ điển điện tử", example: "" },
    { id: 25, lesson: 3, word: "ペン", reading: "pen", meaning: "Cây bút", example: "" },
    { id: 26, lesson: 3, word: "本", reading: "hon", meaning: "Quyển sách", example: "" },
    { id: 27, lesson: 3, word: "けしゴム", reading: "keshigomu", meaning: "Cục tẩy / Gôm", example: "" },
    { id: 28, lesson: 3, word: "日本語の本", reading: "nihongo no hon", meaning: "Sách tiếng Nhật", example: "" },
    { id: 29, lesson: 3, word: "かばん", reading: "kaban", meaning: "Cặp xách / Túi xách", example: "" },
    { id: 30, lesson: 3, word: "さいふ", reading: "saifu", meaning: "Cái ví (đựng tiền)", example: "" },
    { id: 31, lesson: 4, word: "くつ", reading: "kutsu", meaning: "Đôi giày", example: "" },
    { id: 32, lesson: 4, word: "Tシャツ", reading: "T-shatsu", meaning: "Áo thun (Áo phông)", example: "" },
    { id: 33, lesson: 4, word: "ズボン", reading: "zubon", meaning: "Quần dài", example: "" },
    { id: 34, lesson: 4, word: "とけい", reading: "tokei", meaning: "Đồng hồ", example: "" },
    { id: 35, lesson: 4, word: "パン", reading: "pan", meaning: "Bánh mì", example: "" },
    { id: 36, lesson: 4, word: "あぶら", reading: "abura", meaning: "Dầu ăn", example: "" },
    { id: 37, lesson: 4, word: "たまご", reading: "tamago", meaning: "Quả trứng", example: "" },
    { id: 38, lesson: 4, word: "こめ", reading: "kome", meaning: "Gạo (chưa nấu)", example: "" },
    { id: 39, lesson: 4, word: "にく", reading: "niku", meaning: "Thịt (nói chung)", example: "" },
    { id: 40, lesson: 4, word: "ぶたにく", reading: "butaniku", meaning: "Thịt heo (lợn)", example: "" },
    { id: 41, lesson: 5, word: "とりにく", reading: "toriniku", meaning: "Thịt gà", example: "" },
    { id: 42, lesson: 5, word: "ぎゅうにく", reading: "gyuuniku", meaning: "Thịt bò", example: "" },
    { id: 43, lesson: 5, word: "いちご", reading: "ichigo", meaning: "Dâu tây", example: "" },
    { id: 44, lesson: 5, word: "りんご", reading: "ringo", meaning: "Quả táo", example: "" },
    { id: 45, lesson: 5, word: "やさい", reading: "yasai", meaning: "Rau củ", example: "" },
    { id: 46, lesson: 5, word: "カレー", reading: "karee", meaning: "Món cà ri", example: "" },
    { id: 47, lesson: 5, word: "スープ", reading: "suupu", meaning: "Món súp", example: "" },
    { id: 48, lesson: 5, word: "ハンバーグ", reading: "hanbaagu", meaning: "Thịt băm viên nướng (Hamburg)", example: "" },
    { id: 49, lesson: 5, word: "とんかつ", reading: "tonkatsu", meaning: "Thịt heo tẩm bột chiên xù", example: "" },
    { id: 50, lesson: 5, word: "ごはん", reading: "gohan", meaning: "Cơm (trong bát) / Bữa ăn", example: "" },
    { id: 51, lesson: 6, word: "ライス", reading: "raisu", meaning: "Cơm (phục vụ trên đĩa kiểu Tây)", example: "" },
    { id: 52, lesson: 6, word: "さかな", reading: "sakana", meaning: "Con cá / Món cá", example: "" },
    { id: 53, lesson: 6, word: "メニュー", reading: "menyuu", meaning: "Thực đơn", example: "" },
    { id: 54, lesson: 6, word: "ジュース", reading: "juusu", meaning: "Nước ép / Nước ngọt", example: "" },
    { id: 55, lesson: 6, word: "こうちゃ", reading: "koucha", meaning: "Hồng trà / Trà đen", example: "" },
    { id: 56, lesson: 6, word: "おちゃ", reading: "ocha", meaning: "Trà xanh / Trà kiểu Nhật", example: "" },
    { id: 57, lesson: 6, word: "みず (水)", reading: "mizu", meaning: "Nước lọc", example: "" },
    { id: 58, lesson: 6, word: "コーヒー", reading: "koohii", meaning: "Cà phê", example: "" },
    { id: 59, lesson: 6, word: "ワイン", reading: "wain", meaning: "Rượu vang", example: "" },
    { id: 60, lesson: 6, word: "ビール", reading: "biiru", meaning: "Bia", example: "" },
    { id: 61, lesson: 7, word: "フランス", reading: "furansu", meaning: "Nước Pháp", example: "" },
    { id: 62, lesson: 7, word: "インド", reading: "indo", meaning: "Nước Ấn Độ", example: "" },
    { id: 63, lesson: 7, word: "ドイツ", reading: "doitsu", meaning: "Nước Đức", example: "" },
    { id: 64, lesson: 7, word: "トイレ", reading: "toire", meaning: "Nhà vệ sinh", example: "" },
    { id: 65, lesson: 7, word: "トイレットペーパー", reading: "toiretto peepaa", meaning: "Giấy vệ sinh", example: "" },
    { id: 66, lesson: 7, word: "100円ショップ", reading: "hyaku-en shoppu", meaning: "Cửa hàng đồng giá 100 yên", example: "" },
    { id: 67, lesson: 7, word: "きっさてん", reading: "kissaten", meaning: "Quán cà phê / Quán nước", example: "" },
    { id: 68, lesson: 7, word: "スーパー", reading: "suupaa", meaning: "Siêu thị", example: "" },
    { id: 69, lesson: 7, word: "レジ", reading: "reji", meaning: "Quầy thu ngân / Máy tính tiền", example: "" },
    { id: 70, lesson: 7, word: "レストラン", reading: "resutoran", meaning: "Nhà hàng", example: "" },
    { id: 71, lesson: 8, word: "アルバイト", reading: "arubaito", meaning: "Việc làm thêm / Nhân viên làm thêm", example: "" },
    { id: 72, lesson: 8, word: "エスカレーター", reading: "esukareetaa", meaning: "Thang cuốn", example: "" },
    { id: 73, lesson: 8, word: "エレベーター", reading: "erebeetaa", meaning: "Thang máy", example: "" },
    { id: 74, lesson: 8, word: "きつえんじょ", reading: "kitsuenjo", meaning: "Khu vực hút thuốc", example: "" },
    { id: 75, lesson: 8, word: "すみません、トイレはどこですか", reading: "sumimasen, toire wa doko desu ka", meaning: "Xin lỗi, nhà vệ sinh ở đâu vậy?", example: "" },
    { id: 76, lesson: 8, word: "せんせいはどこですか", reading: "sensei wa doko desu ka", meaning: "Giáo viên đang ở đâu?", example: "" },
    { id: 77, lesson: 1, word: "なまえ", reading: "なまえ", meaning: "Tên", example: "" },
    { id: 78, lesson: 1, word: "おなまえ", reading: "おなまえ", meaning: "Tên (lịch sự)", example: "" },
    { id: 79, lesson: 1, word: "くに", reading: "くに", meaning: "Đất nước", example: "" },
    { id: 80, lesson: 1, word: "おくに", reading: "おくに", meaning: "Đất nước (lịch sự)", example: "" },
    { id: 81, lesson: 1, word: "日本", reading: "にほん", meaning: "Nhật Bản", example: "" },
    { id: 82, lesson: 1, word: "かんこく", reading: "かんこく", meaning: "Hàn Quốc", example: "" },
    { id: 83, lesson: 1, word: "ちゅうごく", reading: "ちゅうごく", meaning: "Trung Quốc", example: "" },
    { id: 84, lesson: 1, word: "アメリカ", reading: "アメリカ", meaning: "Mỹ", example: "" },
    { id: 85, lesson: 1, word: "イタリア", reading: "イタリア", meaning: "Ý", example: "" },
    { id: 86, lesson: 1, word: "オーストラリア", reading: "オーストラリア", meaning: "Úc", example: "" },
    { id: 87, lesson: 1, word: "タイ", reading: "タイ", meaning: "Thái Lan", example: "" },
    { id: 88, lesson: 1, word: "ベトナム", reading: "ベトナム", meaning: "Việt Nam", example: "" },
    { id: 89, lesson: 1, word: "ロシア", reading: "ロシア", meaning: "Nga", example: "" },
    { id: 90, lesson: 1, word: "こうこう", reading: "こうこう", meaning: "Trường cấp 3", example: "" },
    { id: 91, lesson: 1, word: "大学", reading: "だいがく", meaning: "Đại học", example: "" },
    { id: 92, lesson: 1, word: "日本語", reading: "にほんご", meaning: "Tiếng Nhật", example: "" },
    { id: 93, lesson: 1, word: "日本語学校", reading: "にほんごがっこう", meaning: "Trường tiếng Nhật", example: "" },
    { id: 94, lesson: 1, word: "しごと", reading: "しごと", meaning: "Công việc", example: "" },
    { id: 95, lesson: 1, word: "おしごと", reading: "おしごと", meaning: "Công việc (lịch sự)", example: "" },
    { id: 96, lesson: 1, word: "きょうし", reading: "きょうし", meaning: "Giáo viên", example: "" },
    { id: 97, lesson: 1, word: "かいしゃいん", reading: "かいしゃいん", meaning: "Nhân viên công ty", example: "" },
    { id: 98, lesson: 1, word: "しゃいん", reading: "しゃいん", meaning: "Nhân viên", example: "" },
    { id: 99, lesson: 1, word: "～さん", reading: "～さん", meaning: "Anh / chị ~", example: "" },
    { id: 100, lesson: 1, word: "～人", reading: "～じん", meaning: "Người nước ~", example: "" },
    { id: 101, lesson: 1, word: "どちら", reading: "どちら", meaning: "Ở đâu / phía nào", example: "" },
    { id: 102, lesson: 1, word: "はじめまして", reading: "はじめまして", meaning: "Rất vui được gặp", example: "" },
    { id: 103, lesson: 1, word: "どうぞよろしくおねがいします", reading: "どうぞよろしくおねがいします", meaning: "Rất mong được giúp đỡ", example: "" },
    { id: 104, lesson: 1, word: "あのう", reading: "あのう", meaning: "À...", example: "" },
    { id: 105, lesson: 1, word: "すみません", reading: "すみません", meaning: "Xin lỗi", example: "" },
    { id: 106, lesson: 1, word: "そうですか", reading: "そうですか", meaning: "Vậy à", example: "" },
    { id: 107, lesson: 1, word: "はい", reading: "はい", meaning: "Vâng", example: "" },
    { id: 108, lesson: 1, word: "いいえ", reading: "いいえ", meaning: "Không", example: "" },
    { id: 109, lesson: "Sở thích", word: "スポーツ", reading: "スポーツ", meaning: "Thể thao", example: "" },
    { id: 110, lesson: "Sở thích", word: "サッカー", reading: "サッカー", meaning: "Bóng đá", example: "" },
    { id: 111, lesson: "Sở thích", word: "テニス", reading: "テニス", meaning: "Quần vợt", example: "" },
    { id: 112, lesson: "Sở thích", word: "すいえい", reading: "すいえい", meaning: "Bơi lội", example: "" },
    { id: 113, lesson: "Sở thích", word: "えいが", reading: "えいが", meaning: "Phim", example: "" },
    { id: 114, lesson: "Sở thích", word: "おんがく", reading: "おんがく", meaning: "Âm nhạc", example: "" },
    { id: 115, lesson: "Sở thích", word: "どくしょ", reading: "どくしょ", meaning: "Đọc sách", example: "" },
    { id: 116, lesson: "Sở thích", word: "りょこう", reading: "りょこう", meaning: "Du lịch", example: "" },
    { id: 117, lesson: "Sở thích", word: "りょうり", reading: "りょうり", meaning: "Nấu ăn / món ăn", example: "" },
    { id: 118, lesson: "Sở thích", word: "なん", reading: "なん", meaning: "Cái gì", example: "" },
    { id: 119, lesson: "Sở thích", word: "つり", reading: "つり", meaning: "Câu cá", example: "" },
    { id: 121, lesson: "Sở thích", word: "おなじですね", reading: "おなじですね", meaning: "Giống nhau nhỉ", example: "" },
    { id: 122, lesson: "Đếm tháng tuổi", word: "～さい", reading: "～さい", meaning: "~ tuổi", example: "" },
    { id: 123, lesson: "Đếm tháng tuổi", word: "～がつ", reading: "～がつ", meaning: "Tháng ~", example: "" },
    { id: 124, lesson: "Đếm tháng tuổi", word: "いっさい", reading: "いっさい", meaning: "1 tuổi", example: "" },
    { id: 125, lesson: "Đếm tháng tuổi", word: "にさい", reading: "にさい", meaning: "2 tuổi", example: "" },
    { id: 126, lesson: "Đếm tháng tuổi", word: "さんさい", reading: "さんさい", meaning: "3 tuổi", example: "" },
    { id: 127, lesson: "Đếm tháng tuổi", word: "よんさい", reading: "よんさい", meaning: "4 tuổi", example: "" },
    { id: 128, lesson: "Đếm tháng tuổi", word: "ごさい", reading: "ごさい", meaning: "5 tuổi", example: "" },
    { id: 129, lesson: "Đếm tháng tuổi", word: "ろくさい", reading: "ろくさい", meaning: "6 tuổi", example: "" },
    { id: 130, lesson: "Đếm tháng tuổi", word: "ななさい", reading: "ななさい", meaning: "7 tuổi", example: "" },
    { id: 131, lesson: "Đếm tháng tuổi", word: "はっさい", reading: "はっさい", meaning: "8 tuổi", example: "" },
    { id: 132, lesson: "Đếm tháng tuổi", word: "きゅうさい", reading: "きゅうさい", meaning: "9 tuổi", example: "" },
    { id: 133, lesson: "Đếm tháng tuổi", word: "じゅっさい", reading: "じゅっさい", meaning: "10 tuổi", example: "" },
    { id: 134, lesson: "Đếm tháng tuổi", word: "じゅういっさい", reading: "じゅういっさい", meaning: "11 tuổi", example: "" },
    { id: 135, lesson: "Đếm tháng tuổi", word: "じゅうごさい", reading: "じゅうごさい", meaning: "15 tuổi", example: "" },
    { id: 136, lesson: "Đếm tháng tuổi", word: "はたち", reading: "はたち", meaning: "20 tuổi", example: "" },
    { id: 137, lesson: "Đếm tháng tuổi", word: "にじゅっさい", reading: "にじゅっさい", meaning: "20 tuổi", example: "" },
    { id: 138, lesson: "Đếm tháng tuổi", word: "さんじゅっさい", reading: "さんじゅっさい", meaning: "30 tuổi", example: "" },
    { id: 139, lesson: "Đếm tháng tuổi", word: "さんじゅうはっさい", reading: "さんじゅうはっさい", meaning: "38 tuổi", example: "" },
    { id: 140, lesson: "Đếm tháng tuổi", word: "なんさい", reading: "なんさい", meaning: "Bao nhiêu tuổi", example: "" },
    { id: 141, lesson: "Đếm tháng tuổi", word: "おいくつ", reading: "おいくつ", meaning: "Mấy tuổi (lịch sự)", example: "" },
    { id: 142, lesson: "Đếm tháng tuổi", word: "いちがつ", reading: "いちがつ", meaning: "Tháng 1", example: "" },
    { id: 143, lesson: "Đếm tháng tuổi", word: "にがつ", reading: "にがつ", meaning: "Tháng 2", example: "" },
    { id: 144, lesson: "Đếm tháng tuổi", word: "さんがつ", reading: "さんがつ", meaning: "Tháng 3", example: "" },
    { id: 145, lesson: "Đếm tháng tuổi", word: "しがつ", reading: "しがつ", meaning: "Tháng 4", example: "" },
    { id: 146, lesson: "Đếm tháng tuổi", word: "ごがつ", reading: "ごがつ", meaning: "Tháng 5", example: "" },
    { id: 147, lesson: "Đếm tháng tuổi", word: "ろくがつ", reading: "ろくがつ", meaning: "Tháng 6", example: "" },
    { id: 148, lesson: "Đếm tháng tuổi", word: "しちがつ", reading: "しちがつ", meaning: "Tháng 7", example: "" },
    { id: 149, lesson: "Đếm tháng tuổi", word: "はちがつ", reading: "はちがつ", meaning: "Tháng 8", example: "" },
    { id: 150, lesson: "Đếm tháng tuổi", word: "くがつ", reading: "くがつ", meaning: "Tháng 9", example: "" },
    { id: 151, lesson: "Đếm tháng tuổi", word: "じゅうがつ", reading: "じゅうがつ", meaning: "Tháng 10", example: "" },
    { id: 152, lesson: "Đếm tháng tuổi", word: "じゅういちがつ", reading: "じゅういちがつ", meaning: "Tháng 11", example: "" },
    { id: 153, lesson: "Đếm tháng tuổi", word: "じゅうにがつ", reading: "じゅうにがつ", meaning: "Tháng 12", example: "" },
    { id: 154, lesson: "Đếm tháng tuổi", word: "なんがつ", reading: "なんがつ", meaning: "Tháng mấy", example: "" },
    { id: 155, lesson: "Đếm tháng tuổi 2", word: "いつ", reading: "いつ", meaning: "Khi nào", example: "" },
    { id: 156, lesson: "Đếm tháng tuổi 2", word: "ブラジル", reading: "ブラジル", meaning: "Brazil", example: "" },
    { id: 157, lesson: "Đếm tháng tuổi 2", word: "たんじょうび", reading: "たんじょうび", meaning: "Sinh nhật", example: "" },
    { id: 158, lesson: "Đếm tháng tuổi 2", word: "～にち", reading: "～にち", meaning: "Ngày ~", example: "" },
    { id: 159, lesson: "Đếm tháng tuổi 2", word: "～か", reading: "～か", meaning: "Ngày ~", example: "" },
    { id: 160, lesson: "Đếm tháng tuổi 2", word: "ついたち", reading: "ついたち", meaning: "Ngày mồng 1", example: "" },
    { id: 161, lesson: "Đếm tháng tuổi 2", word: "ふつか", reading: "ふつか", meaning: "Ngày mồng 2", example: "" },
    { id: 162, lesson: "Đếm tháng tuổi 2", word: "みっか", reading: "みっか", meaning: "Ngày mồng 3", example: "" },
    { id: 163, lesson: "Đếm tháng tuổi 2", word: "よっか", reading: "よっか", meaning: "Ngày mồng 4", example: "" },
    { id: 164, lesson: "Đếm tháng tuổi 2", word: "いつか", reading: "いつか", meaning: "Ngày mồng 5", example: "" },
    { id: 165, lesson: "Đếm tháng tuổi 2", word: "むいか", reading: "むいか", meaning: "Ngày mồng 6", example: "" },
    { id: 166, lesson: "Đếm tháng tuổi 2", word: "なのか", reading: "なのか", meaning: "Ngày mồng 7", example: "" },
    { id: 167, lesson: "Đếm tháng tuổi 2", word: "ようか", reading: "ようか", meaning: "Ngày mồng 8", example: "" },
    { id: 168, lesson: "Đếm tháng tuổi 2", word: "ここのか", reading: "ここのか", meaning: "Ngày mồng 9", example: "" },
    { id: 169, lesson: "Đếm tháng tuổi 2", word: "とおか", reading: "とおか", meaning: "Ngày mồng 10", example: "" },
    { id: 170, lesson: "Đếm tháng tuổi 2", word: "じゅういちにち", reading: "じゅういちにち", meaning: "Ngày 11", example: "" },
    { id: 171, lesson: "Đếm tháng tuổi 2", word: "じゅうににち", reading: "じゅうににち", meaning: "Ngày 12", example: "" },
    { id: 172, lesson: "Đếm tháng tuổi 2", word: "じゅうよっか", reading: "じゅうよっか", meaning: "Ngày 14", example: "" },
    { id: 173, lesson: "Đếm tháng tuổi 2", word: "じゅうはちにち", reading: "じゅうはちにち", meaning: "Ngày 18", example: "" },
    { id: 174, lesson: "Đếm tháng tuổi 2", word: "じゅうくにち", reading: "じゅうくにち", meaning: "Ngày 19", example: "" },
    { id: 175, lesson: "Đếm tháng tuổi 2", word: "はつか", reading: "はつか", meaning: "Ngày 20", example: "" },
    { id: 176, lesson: "Đếm tháng tuổi 2", word: "にじゅうよっか", reading: "にじゅうよっか", meaning: "Ngày 24", example: "" },
    { id: 177, lesson: "Đếm tháng tuổi 2", word: "にじゅうくにち", reading: "にじゅうくにち", meaning: "Ngày 29", example: "" },
    { id: 178, lesson: "Đếm tháng tuổi 2", word: "さんじゅうにち", reading: "さんじゅうにち", meaning: "Ngày 30", example: "" },
    { id: 179, lesson: "Đếm tháng tuổi 2", word: "なんにち", reading: "なんにち", meaning: "Ngày mấy", example: "" },
    { id: 180, lesson: "Bài cuối", word: "週末", reading: "しゅうまつ", meaning: "cuối tuần", example: "週末、公園へ　行きます。 → Cuối tuần tôi đi công viên." },
    { id: 181, lesson: "Bài cuối", word: "今", reading: "いま", meaning: "bây giờ", example: "今、授業です。 → Bây giờ đang là giờ học." },
    { id: 182, lesson: "Bài cuối", word: "午前", reading: "ごぜん", meaning: "buổi sáng", example: "午前9時に　学校へ行きます。 → Tôi đi đến trường lúc 9 giờ sáng." },
    { id: 183, lesson: "Bài cuối", word: "午後", reading: "ごご", meaning: "buổi chiều", example: "午後3時に　うちへ　帰ります。 → Tôi về nhà lúc 3 giờ chiều." },
    { id: 184, lesson: "Bài cuối", word: "昼", reading: "ひる", meaning: "buổi trưa", example: "昼に　弁当を　食べます。 → Tôi ăn cơm hộp vào buổi trưa." },
    { id: 185, lesson: "Bài cuối", word: "銀行", reading: "ぎんこう", meaning: "ngân hàng", example: "銀行へ　行きます。 → Tôi đi ngân hàng." },
    { id: 186, lesson: "Bài cuối", word: "体育館", reading: "たいいくかん", meaning: "nhà thi đấu / nhà thể thao", example: "体育館で　スポーツを　します。 → Tôi chơi thể thao ở nhà thi đấu." },
    { id: 187, lesson: "Bài cuối", word: "図書館", reading: "としょかん", meaning: "thư viện", example: "図書館で　本を　読みます。 → Tôi đọc sách ở thư viện." },
    { id: 188, lesson: "Bài cuối", word: "病院", reading: "びょういん", meaning: "bệnh viện", example: "病院へ　行きます。 → Tôi đi bệnh viện." },
    { id: 189, lesson: "Bài cuối", word: "郵便局", reading: "ゆうびんきょく", meaning: "Bưu điện", example: "郵便局は　どこですか。 → Bưu điện ở đâu vậy?" },
    { id: 190, lesson: "Bài cuối", word: "授業", reading: "じゅぎょう", meaning: "Giờ học", example: "授業は　何時ですか。 → Giờ học bắt đầu lúc mấy giờ?" },
    { id: 191, lesson: "Bài cuối", word: "花火", reading: "はなび", meaning: "pháo hoa", example: "夏に　花火を　見ます。 → Mùa hè tôi xem pháo hoa." },
    { id: 192, lesson: "Bài cuối", word: "花見", reading: "はなみ", meaning: "ngắm hoa", example: "春に　花見を　します。 → Mùa xuân tôi đi ngắm hoa." },
    { id: 193, lesson: "Bài cuối", word: "ホームステイ", reading: "ホームステイ", meaning: "trọ nhà người bản xứ", example: "日本で　ホームステイを　します。 → Tôi ở trọ nhà người bản xứ tại Nhật Bản." },
    { id: 194, lesson: "Bài cuối", word: "祭り", reading: "まつり", meaning: "lễ hội", example: "祭りへ　行きます。 → Tôi đi lễ hội." },
    { id: 195, lesson: "Bài cuối", word: "海", reading: "うみ", meaning: "biển", example: "夏に　海へ　行きます。 → Mùa hè tôi đi biển." },
    { id: 196, lesson: "Bài cuối", word: "公園", reading: "こうえん", meaning: "công viên", example: "公園で　昼ご飯を　食べます。 → Tôi ăn cơm trưa ở công viên." },
    { id: 197, lesson: "Bài cuối", word: "桜", reading: "さくら", meaning: "hoa anh đào", example: "桜を　見ます。 → Tôi ngắm hoa anh đào." },
    { id: 198, lesson: "Bài cuối", word: "酒", reading: "さけ", meaning: "rượu", example: "父は　酒を　飲みます。 → Bố tôi uống rượu." },
    { id: 199, lesson: "Bài cuối", word: "すし", reading: "すし", meaning: "món sushi", example: "昼ご飯に　すしを　食べます。 → Tôi ăn sushi vào bữa trưa." },
    { id: 200, lesson: "Bài cuối", word: "バス", reading: "バス", meaning: "xe buýt", example: "バスで　学校へ　行きます。 → Tôi đi đến trường bằng xe buýt." },
    { id: 201, lesson: "Bài cuối", word: "弁当", reading: "べんとう", meaning: "cơm hộp", example: "弁当を　買います。 → Tôi mua cơm hộp." },
    { id: 202, lesson: "Bài cuối", word: "留学生", reading: "りゅうがくせい", meaning: "du học sinh", example: "私は　留学生です。 → Tôi là du học sinh." },
    { id: 203, lesson: "Bài cuối", word: "春", reading: "はる", meaning: "mùa xuân", example: "春に　さくらを　みますです。 → Vào mùa xuân tôi sẽ ngắm hoa anh đào." },
    { id: 204, lesson: "Bài cuối", word: "夏", reading: "なつ", meaning: "Mùa hè", example: "夏は　海へ　行きます。 → Mùa hè tôi đi biển." },
    { id: 205, lesson: "Bài cuối", word: "秋", reading: "あき", meaning: "Mùa thu", example: "秋に　公園へ　行きます。 → Mùa thu tôi đi công viên." },
    { id: 206, lesson: "Bài cuối", word: "冬", reading: "ふゆ", meaning: "Mùa đông", example: "冬に　スキーを　します。 → Mùa đông tôi đi trượt tuyết." },
    { id: 207, lesson: "Bài cuối", word: "ゴールデンウィーク", reading: "ゴールデンウィーク", meaning: "Tuần lễ Vàng", example: "ゴールデンウィークに　旅行を　します。 → Tôi đi du lịch vào Tuần lễ Vàng." },
    { id: 208, lesson: "Bài cuối", word: "行きます", reading: "いきます", meaning: "đi", example: "明日、図書館へ　行きます。 → Ngày mai tôi đi thư viện." },
    { id: 209, lesson: "Bài cuối", word: "帰ります", reading: "かえります", meaning: "về", example: "午後、5時に　帰ります。 → Tôi về lúc 5 giờ chiều." },
    { id: 210, lesson: "Bài cuối", word: "飲みます", reading: "のみます", meaning: "uống", example: "あさ、ぎゅうにゅう　を　飲みます。 → Buổi sáng tôi uống sữa." },
    { id: 211, lesson: "Bài cuối", word: "食べます", reading: "たべます", meaning: "ăn", example: "ひるごはんを　食べます。 → Tôi ăn cơm trưa." },
    { id: 212, lesson: "Bài cuối", word: "見ます", reading: "みます", meaning: "xem", example: "テレビを　見ます。 → Tôi xem tivi." },
    { id: 213, lesson: "Bài cuối", word: "します", reading: "します", meaning: "làm", example: "毎日、サッカーを　します。 → Tôi chơi đá bóng mỗi ngày." },
    { id: 214, lesson: "Bài cuối", word: "いいですね", reading: "いいですね", meaning: "thích nhỉ", example: "A：週末、海へ　行きます。 B：いいですね。 → A: Cuối tuần tôi đi biển. → B: Hay nhỉ!" },
    { id: 215, lesson: "Bài cuối", word: "えっ", reading: "えっ", meaning: "sao, hả", example: "A：明日、テストです。 B：えっ！ → A: Ngày mai có bài kiểm tra. → B: Hả!?" },
    { id: 216, lesson: "Bài cuối", word: "へえ", reading: "へえ", meaning: "à, thế à", example: "A：私は　留学生です。 B：へえ。 → A: Tôi là du học sinh. → B: À, vậy à." },
    { id: 217, lesson: "Bài cuối", word: "テスト", reading: "テスト", meaning: "bài kiểm tra", example: "ごご、テストを　します ➝Chiều nay làm bài kiểm tra" },
    { id: 218, lesson: "Bài cuối", word: "休み", reading: "やすみ", meaning: "giờ nghỉ", example: "休みの　時間に　テレビを　見ます。 → Tôi xem tivi trong giờ nghỉ." },
    { id: 219, lesson: "Bài cuối", word: "時間", reading: "じかん", meaning: "thời gian", example: "休みの　時間に　おんがくを　聞きます ➝ Tôi nghe nhạc trong giờ nghỉ" },
    { id: 220, lesson: "Bài cuối", word: "～時", reading: "～じ", meaning: "giờ", example: "4時、5時。。。 ➝ 4 giờ, 5 giờ..." },
    { id: 221, lesson: "Bài cuối", word: "～分", reading: "～ふん", meaning: "phút", example: "40分、30分。。。 ➝ 40 phút, 30 phút ..." },
    { id: 222, lesson: "Bài cuối", word: "～時半", reading: "～じはん", meaning: "Giờ rưỡi", example: "5 時半、7 時半。。。 ➝5h 30 phút, 7h 30 phút ..." },
    { id: 223, lesson: "Bài cuối", word: "～曜日", reading: "～ようび", meaning: "Thứ", example: "月曜日、火曜日。。。 ➝ thứ 2, thứ 3 ..." },
    { id: 224, lesson: "Bài cuối", word: "スケジュール", reading: "スケジュール", meaning: "lịch trình", example: "スケジュールを　見ます。 → Tôi xem lịch trình." },
    { id: 225, lesson: "Bài cuối", word: "アルバイト", reading: "アルバイト", meaning: "Việc làm thêm", example: "週末に　アルバイトを　します。 → Tôi làm thêm vào cuối tuần." },
    { id: 226, lesson: "Bài cuối", word: "スキー", reading: "スキー", meaning: "trượt tuyết", example: "冬に　スキーを　します。 → Tôi đi trượt tuyết vào mùa đông." },
    { id: 227, lesson: "Bài cuối", word: "パーティー", reading: "パーティー", meaning: "bữa tiệc", example: "パーティーへ　行きます。 → Tôi đi dự tiệc." },
    { id: 228, lesson: "Bài cuối", word: "バーベキュー", reading: "バーベキュー", meaning: "tiệc nướng", example: "公園で　バーベキューを　します。 → Tôi tổ chức tiệc nướng ở công viên." },
    { id: 229, lesson: "Bài cuối", word: "朝", reading: "あさ", meaning: "Buổi sáng", example: "朝に　ぎゅうにゅう　を　飲みます。 → Buổi sáng tôi uống sữa." },
    { id: 230, lesson: "Bài cuối", word: "夜", reading: "よる", meaning: "Buổi tối", example: "夜に　テレビを　見ます。 → Buổi tối tôi xem tivi." },
    { id: 231, lesson: "Bài cuối", word: "毎日", reading: "まいにち", meaning: "Mỗi ngày", example: "毎日、学校へ　行きます。 → Hằng ngày tôi đi học." },
    { id: 232, lesson: "Bài cuối", word: "毎朝", reading: "まいあさ", meaning: "Mỗi sáng", example: "毎朝、7時に　起きます。 → Mỗi sáng tôi thức dậy lúc 7 giờ." },
    { id: 233, lesson: "Bài cuối", word: "毎晩", reading: "まいばん", meaning: "Mỗi tối", example: "毎晩、11時に　寝ます。 → Mỗi tối tôi ngủ lúc 11 giờ." },
    { id: 234, lesson: "Bài cuối", word: "朝ご飯", reading: "あさごはん", meaning: "cơm sáng", example: "毎朝、朝ご飯を　食べます。 → Mỗi sáng tôi ăn sáng." },
    { id: 235, lesson: "Bài cuối", word: "昼ご飯", reading: "ひるごはん", meaning: "Cơm trưa, bữa trưa", example: "昼ご飯に　ハンバーガーを　食べます。 → Tôi ăn Hamburger vào bữa trưa." },
    { id: 236, lesson: "Bài cuối", word: "うち", reading: "うち", meaning: "nhà", example: "午後5時に　うちへ　帰ります。 → Tôi về nhà lúc 5 giờ chiều." },
    { id: 237, lesson: "Bài cuối", word: "会社", reading: "かいしゃ", meaning: "công ty", example: "会社で　働きます。 → Tôi làm việc ở công ty." },
    { id: 238, lesson: "Bài cuối", word: "学校", reading: "がっこう", meaning: "Trường học", example: "学校で　勉強します。 → Tôi học ở trường." },
    { id: 239, lesson: "Bài cuối", word: "コンビニ", reading: "コンビニ", meaning: "cửa hàng tiện lợi", example: "コンビニで　弁当を　買います。 → Tôi mua cơm hộp ở cửa hàng tiện lợi." },
    { id: 240, lesson: "Bài cuối", word: "牛乳", reading: "ぎゅうにゅう", meaning: "sữa bò", example: "牛乳を　飲みます。 → Tôi uống sữa." },
    { id: 241, lesson: "Bài cuối", word: "果物", reading: "くだもの", meaning: "trái cây", example: "果物を　食べます。 → Tôi ăn trái cây." },
    { id: 242, lesson: "Bài cuối", word: "サラダ", reading: "サラダ", meaning: "món sa-lát", example: "昼に　サラダを　食べます。 → Tôi ăn salad vào buổi trưa." },
    { id: 243, lesson: "Bài cuối", word: "チーズ", reading: "チーズ", meaning: "phô mai", example: "チーズを　食べます。 → Tôi ăn phô mai." },
    { id: 244, lesson: "Bài cuối", word: "インターネット", reading: "インターネット", meaning: "Internet", example: "インターネットを　見ます。 → Tôi xem Internet." },
    { id: 245, lesson: "Bài cuối", word: "新聞", reading: "しんぶん", meaning: "báo", example: "新聞を　読みます。 → Tôi đọc báo." },
    { id: 246, lesson: "Bài cuối", word: "テレビ", reading: "テレビ", meaning: "tivi", example: "テレビを　見ます。 → Tôi xem tivi." },
    { id: 247, lesson: "Bài cuối", word: "CD", reading: "シーディー", meaning: "đĩa CD", example: "CDを　聞きます。 → Tôi nghe đĩa CD." },
    { id: 248, lesson: "Bài cuối", word: "DVD", reading: "ディーブイディー", meaning: "đĩa DVD", example: "DVDを　見ます。 → Tôi xem DVD." },
    { id: 249, lesson: "Bài cuối", word: "買います", reading: "かいます", meaning: "mua", example: "コンビニで　ぎゅうにゅう　を　買います。 → Tôi mua sữa ở cửa hàng tiện lợi." },
    { id: 250, lesson: "Bài cuối", word: "聞きます", reading: "ききます", meaning: "nghe", example: "CDを　聞きます。 → Tôi nghe CD." },
    { id: 251, lesson: "Bài cuối", word: "働きます", reading: "はたらきます", meaning: "làm việc", example: "会社で　働きます。 → Tôi làm việc ở công ty." },
    { id: 252, lesson: "Bài cuối", word: "読みます", reading: "よみます", meaning: "đọc", example: "本を　読みます。 → Tôi đọc sách." },
    { id: 253, lesson: "Bài cuối", word: "起きます", reading: "おきます", meaning: "thức dậy", example: "毎朝6時に　起きます。 → Mỗi sáng tôi thức dậy lúc 6 giờ." },
    { id: 254, lesson: "Bài cuối", word: "寝ます", reading: "ねます", meaning: "ngủ", example: "毎晩10時に　寝ます。 → Mỗi tối tôi ngủ lúc 10 giờ." },
    { id: 255, lesson: "Bài cuối", word: "勉強します", reading: "べんきょうします", meaning: "học", example: "図書館で　勉強します。 → Tôi học ở thư viện." },
    { id: 256, lesson: "Bài cuối", word: "来ます", reading: "きます", meaning: "đến", example: "学校へ　来ます。 → Tôi đến trường." }
];

let bookmarks = JSON.parse(localStorage.getItem('vocab_bookmarks')) || [];
let currentLesson = 'all';
let showReading = true;
let autoPronounce = false;
let showMeaning = true;

function toggleAutoPronounce() {
    autoPronounce = document.getElementById('global-auto-pronounce').checked;
}

function toggleGlobalMeaning() {
    showMeaning = document.getElementById('global-show-meaning').checked;
    if (document.getElementById('view-list').classList.contains('block')) {
        renderWordList();
    }
}

function toggleGlobalReading() {
    showReading = document.getElementById('global-show-reading').checked;
    
    // Update currently visible views
    if (document.getElementById('view-list').classList.contains('block')) renderWordList();
    if (document.getElementById('view-flashcard').classList.contains('block')) renderFlashcard();
    if (document.getElementById('view-quiz').classList.contains('block') && !document.getElementById('quiz-active').classList.contains('hidden')) {
        const readingEl = document.getElementById('quiz-question-reading');
        if (showReading) {
            readingEl.classList.remove('hidden');
        } else {
            readingEl.classList.add('hidden');
        }
    }
}

function renderDashboard() {
    const container = document.getElementById('dashboard-container');
    if (!container) return;
    
    // get unique lessons
    const lessons = [...new Set(vocabularyData.map(w => w.lesson))].filter(Boolean).sort((a,b) => {
        if (typeof a === 'number' && typeof b === 'number') return a - b;
        return String(a).localeCompare(String(b), undefined, {numeric: true});
    });
    
    container.innerHTML = '';
    
    // Thẻ "Tất cả"
    const allCount = vocabularyData.length;
    const allCard = document.createElement('div');
    allCard.className = 'bg-[#5f8a8b] p-8 rounded-3xl shadow-sm border border-[#4d7576] flex flex-col items-center justify-center cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group text-white';
    allCard.onclick = () => openLesson('all');
    allCard.innerHTML = `
        <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 text-white text-2xl transition-colors">
            <i class="fa-solid fa-layer-group"></i>
        </div>
        <h3 class="text-2xl font-bold mb-2">Tất cả</h3>
        <p class="text-white/80">${allCount} từ vựng</p>
    `;
    container.appendChild(allCard);
    
    lessons.forEach(l => {
        const wordCount = vocabularyData.filter(w => w.lesson == l).length;
        const card = document.createElement('div');
        card.className = 'bg-white p-8 rounded-3xl shadow-sm border border-[#e8e2db] flex flex-col items-center justify-center cursor-pointer hover:shadow-md hover:border-[#5f8a8b] hover:-translate-y-1 transition-all group';
        card.onclick = () => openLesson(l);
        const titleText = isNaN(l) ? l : `Bài ${l}`;
        card.innerHTML = `
            <div class="w-16 h-16 rounded-full bg-[#f4f1ee] flex items-center justify-center mb-4 group-hover:bg-[#5f8a8b] group-hover:text-white transition-colors text-[#8b7b6c] text-2xl">
                <i class="fa-solid fa-book"></i>
            </div>
            <h3 class="text-2xl font-bold text-[#5c544d] mb-2">${titleText}</h3>
            <p class="text-[#7d746d]">${wordCount} từ vựng</p>
        `;
        container.appendChild(card);
    });
}

function openLesson(lessonId) {
    currentLesson = lessonId;
    document.getElementById('dashboard-view').classList.remove('block');
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('lesson-detail-view').classList.remove('hidden');
    document.getElementById('lesson-detail-view').classList.add('block');
    
    const titleText = lessonId === 'all' ? 'Tất cả từ vựng' : (isNaN(lessonId) ? lessonId : `Bài ${lessonId}`);
    document.getElementById('page-title').textContent = titleText;
    document.getElementById('page-subtitle').textContent = "Học từ vựng qua Flashcards và kiểm tra bằng Quiz.";
    
    switchTab('list');
}

function closeLesson() {
    currentLesson = 'all';
    document.getElementById('lesson-detail-view').classList.remove('block');
    document.getElementById('lesson-detail-view').classList.add('hidden');
    document.getElementById('dashboard-view').classList.remove('hidden');
    document.getElementById('dashboard-view').classList.add('block');
    
    document.getElementById('page-title').textContent = "Luyện tập Từ Vựng";
    document.getElementById('page-subtitle').textContent = "Chọn một bài học để bắt đầu ôn tập qua Flashcards và kiểm tra bằng Quiz.";
}

function playAudio(text, event) {
    if (event) {
        event.stopPropagation();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP'; // Tiếng Nhật
    window.speechSynthesis.speak(utterance);
}

function toggleBookmark(id) {
    const index = bookmarks.indexOf(id);
    if (index > -1) {
        bookmarks.splice(index, 1);
    } else {
        bookmarks.push(id);
    }
    localStorage.setItem('vocab_bookmarks', JSON.stringify(bookmarks));
    
    if (document.getElementById('view-list').classList.contains('block')) {
        renderWordList();
    }
    if (document.getElementById('view-flashcard').classList.contains('block')) {
        renderFlashcard();
    }
}

function isBookmarked(id) {
    return bookmarks.includes(id);
}

function clearAllBookmarks() {
    if (bookmarks.length === 0) {
        alert("Bạn chưa lưu từ vựng nào!");
        return;
    }
    if (confirm("Bạn có chắc chắn muốn xóa TẤT CẢ các từ đã lưu không? Hành động này không thể hoàn tác.")) {
        bookmarks = [];
        localStorage.setItem('vocab_bookmarks', JSON.stringify(bookmarks));
        
        if (document.getElementById('view-list').classList.contains('block')) {
            renderWordList();
        }
        if (document.getElementById('view-flashcard').classList.contains('block')) {
            initFlashcard(); 
        }
    }
}

// --- Tab Switching ---
function switchTab(tabId) {
    ['list', 'flashcard', 'quiz', 'game'].forEach(id => {
        document.getElementById(`view-${id}`).classList.add('hidden');
        document.getElementById(`view-${id}`).classList.remove('block');
        document.getElementById(`tab-${id}`).classList.remove('bg-[#5f8a8b]', 'text-white');
        document.getElementById(`tab-${id}`).classList.add('text-[#8b7b6c]');
    });
    
    document.getElementById(`view-${tabId}`).classList.remove('hidden');
    document.getElementById(`view-${tabId}`).classList.add('block');
    document.getElementById(`tab-${tabId}`).classList.add('bg-[#5f8a8b]', 'text-white');
    document.getElementById(`tab-${tabId}`).classList.remove('text-[#8b7b6c]');

    if (tabId === 'list') renderWordList();
    if (tabId === 'flashcard') initFlashcard();
    if (tabId === 'quiz') showQuizSetup();
    if (tabId === 'game') showGameSetup();
}

// --- List View ---
let filterBookmarkedList = false;

function toggleFilterBookmark() {
    filterBookmarkedList = !filterBookmarkedList;
    const btn = document.getElementById('filter-bookmark-btn');
    if (filterBookmarkedList) {
        btn.classList.add('bg-[#f4f1ee]', 'font-bold');
    } else {
        btn.classList.remove('bg-[#f4f1ee]', 'font-bold');
    }
    renderWordList();
}

function renderWordList() {
    const container = document.getElementById('word-list-container');
    container.innerHTML = '';
    
    let filteredData = currentLesson === 'all' ? vocabularyData : vocabularyData.filter(w => w.lesson == currentLesson);
    
    const listToRender = filterBookmarkedList 
        ? filteredData.filter(w => isBookmarked(w.id))
        : filteredData;

    if (listToRender.length === 0) {
        container.innerHTML = `<p class="col-span-full text-center text-[#7d746d] py-10">Không có từ vựng nào.</p>`;
        return;
    }

    listToRender.forEach(word => {
        const bookmarked = isBookmarked(word.id);
        const starIcon = bookmarked ? 'fa-solid text-[#d97706]' : 'fa-regular text-gray-300 hover:text-[#d97706]';
        
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-2xl shadow-sm border border-[#e8e2db] flex flex-col justify-between';
        card.innerHTML = `
            <div>
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-3">
                        <h4 class="text-3xl font-bold text-[#5c544d]">${word.word}</h4>
                        <button onclick="playAudio('${word.word}', event)" class="text-xl text-[#8b7b6c] hover:text-[#5f8a8b] transition-colors" title="Phát âm">
                            <i class="fa-solid fa-volume-high"></i>
                        </button>
                    </div>
                    <button onclick="toggleBookmark(${word.id})" class="text-xl transition-colors" title="Đánh dấu">
                        <i class="${starIcon} fa-star"></i>
                    </button>
                </div>
                <p class="text-sm text-[#7d746d] mb-4 ${showReading ? '' : 'hidden'}">${word.reading}</p>
                <p class="text-lg text-[#5f8a8b] font-medium ${showMeaning ? '' : 'hidden'}">${word.meaning}</p>
            </div>
            <div class="mt-4 pt-4 border-t border-[#e8e2db]">
                <p class="text-sm text-[#7d746d] italic">${word.example}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- Flashcard View ---
let flashcardList = [];
let currentFlashcardIndex = 0;

function initFlashcard() {
    const onlyBookmarks = document.getElementById('flashcard-bookmark-only').checked;
    
    let filteredData = currentLesson === 'all' ? vocabularyData : vocabularyData.filter(w => w.lesson == currentLesson);
    
    flashcardList = onlyBookmarks 
        ? filteredData.filter(w => isBookmarked(w.id))
        : [...filteredData];
    
    currentFlashcardIndex = 0;
    
    const container = document.getElementById('flashcard-container');
    if (container) {
        container.classList.remove('flipped');
    }

    renderFlashcard();
}

function renderFlashcard() {
    const container = document.getElementById('flashcard-container');
    const wordEl = document.getElementById('flashcard-word');
    const readingEl = document.getElementById('flashcard-reading');
    const meaningEl = document.getElementById('flashcard-meaning');
    const exampleEl = document.getElementById('flashcard-example');
    const progressEl = document.getElementById('flashcard-progress');
    const starEl = document.getElementById('flashcard-front-star');

    if (flashcardList.length === 0) {
        wordEl.textContent = "Trống";
        readingEl.textContent = "";
        meaningEl.textContent = "Không có từ nào để học.";
        exampleEl.textContent = "";
        progressEl.textContent = "0/0";
        return;
    }

    const word = flashcardList[currentFlashcardIndex];
    wordEl.textContent = word.word;
    readingEl.textContent = word.reading;
    if (showReading) {
        readingEl.classList.remove('hidden');
    } else {
        readingEl.classList.add('hidden');
    }
    meaningEl.textContent = word.meaning;
    exampleEl.textContent = word.example;
    progressEl.textContent = `${currentFlashcardIndex + 1}/${flashcardList.length}`;
    
    const isBookmarkedWord = isBookmarked(word.id);
    starEl.innerHTML = `<button onclick="event.stopPropagation(); toggleBookmark(${word.id})"><i class="${isBookmarkedWord ? 'fa-solid text-[#d97706]' : 'fa-regular'} fa-star"></i></button>`;
    
    const audioEl = document.getElementById('flashcard-front-audio');
    if (audioEl) {
        audioEl.innerHTML = `<button onclick="playAudio('${word.word}', event)"><i class="fa-solid fa-volume-high"></i></button>`;
    }
}

function flipFlashcard() {
    if (flashcardList.length === 0) return;
    const container = document.getElementById('flashcard-container');
    container.classList.toggle('flipped');
}

function nextFlashcard() {
    if (flashcardList.length === 0) return;
    const container = document.getElementById('flashcard-container');
    container.classList.remove('flipped');
    
    setTimeout(() => {
        currentFlashcardIndex = (currentFlashcardIndex + 1) % flashcardList.length;
        renderFlashcard();
    }, 150);
}

function prevFlashcard() {
    if (flashcardList.length === 0) return;
    const container = document.getElementById('flashcard-container');
    container.classList.remove('flipped');
    
    setTimeout(() => {
        currentFlashcardIndex = (currentFlashcardIndex - 1 + flashcardList.length) % flashcardList.length;
        renderFlashcard();
    }, 150);
}

// --- Quiz View ---
let quizList = [];
let currentQuizIndex = 0;
let quizScore = 0;
let wrongQuestions = [];
let quizMode = 'multiple';
let isRedoMode = false;

function showQuizSetup() {
    document.getElementById('quiz-setup').classList.remove('hidden');
    document.getElementById('quiz-active').classList.add('hidden');
    document.getElementById('quiz-result').classList.add('hidden');
}

function startQuiz() {
    isRedoMode = false;
    const onlyBookmarks = document.getElementById('quiz-bookmark-only').checked;
    const modeSelector = document.querySelector('input[name="quiz-mode"]:checked');
    quizMode = modeSelector ? modeSelector.value : 'multiple';

    quizList = vocabularyData.filter(w => {
        let matchBookmark = onlyBookmarks ? isBookmarked(w.id) : true;
        let matchLesson = currentLesson === 'all' ? true : w.lesson == currentLesson;
        return matchBookmark && matchLesson;
    });
    
    if (quizList.length < 4 && quizMode === 'multiple') {
        alert("Cần ít nhất 4 từ vựng để tạo bài Quiz trắc nghiệm. Hãy chọn bài khác hoặc tắt tùy chọn 'Chỉ tạo Quiz từ các từ đã lưu'.");
        return;
    } else if (quizList.length === 0) {
        alert("Không có từ vựng nào để tạo bài Quiz.");
        return;
    }

    // Shuffle quizList
    quizList.sort(() => Math.random() - 0.5);
    
    // Limit to requested questions if not 'all'
    const questionCountStr = document.getElementById('quiz-question-count') ? document.getElementById('quiz-question-count').value : "10";
    if (questionCountStr !== 'all') {
        const limit = parseInt(questionCountStr, 10);
        if (quizList.length > limit) {
            quizList = quizList.slice(0, limit);
        }
    }

    currentQuizIndex = 0;
    quizScore = 0;
    wrongQuestions = [];

    document.getElementById('quiz-setup').classList.add('hidden');
    document.getElementById('quiz-active').classList.remove('hidden');
    document.getElementById('quiz-result').classList.add('hidden');

    renderQuizQuestion();
}

function renderQuizQuestion() {
    const word = quizList[currentQuizIndex];
    document.getElementById('quiz-question-word').textContent = word.word;
    const readingEl = document.getElementById('quiz-question-reading');
    readingEl.textContent = word.reading;
    if (showReading) {
        readingEl.classList.remove('hidden');
    } else {
        readingEl.classList.add('hidden');
    }
    document.getElementById('quiz-progress').textContent = `Câu ${currentQuizIndex + 1}/${quizList.length}`;
    document.getElementById('quiz-score').textContent = `Điểm: ${quizScore}`;

    if (autoPronounce) {
        // Cần truyền null cho event vì playAudio có tham số event (hoặc sửa playAudio xử lý event undefined)
        playAudio(word.word, null);
    }

    const optionsContainer = document.getElementById('quiz-options');
    const typingArea = document.getElementById('quiz-typing-area');
    
    if (quizMode === 'multiple') {
        optionsContainer.classList.remove('hidden');
        optionsContainer.classList.add('grid');
        typingArea.classList.add('hidden');
        typingArea.classList.remove('flex');
        optionsContainer.innerHTML = '';

        // Generate options: 1 correct, 3 wrong
        let options = [word];
        let otherWords = vocabularyData.filter(w => w.id !== word.id);
        otherWords.sort(() => Math.random() - 0.5);
        options.push(...otherWords.slice(0, 3));
        options.sort(() => Math.random() - 0.5); // Shuffle options

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option w-full py-4 px-6 border-2 border-[#e8e2db] rounded-xl text-left text-[#5c544d] font-medium hover:bg-[#f4f1ee] hover:border-[#5f8a8b] transition-all bg-white';
            btn.textContent = opt.meaning;
            btn.onclick = () => checkAnswer(btn, opt.id === word.id);
            optionsContainer.appendChild(btn);
        });
    } else {
        optionsContainer.classList.add('hidden');
        optionsContainer.classList.remove('grid');
        typingArea.classList.remove('hidden');
        typingArea.classList.add('flex');
        
        const inputEl = document.getElementById('quiz-typing-input');
        inputEl.value = '';
        inputEl.className = 'w-full max-w-md px-6 py-4 border-2 border-[#e8e2db] rounded-xl text-lg text-[#5c544d] focus:outline-none focus:border-[#5f8a8b] transition-colors mb-4 text-center placeholder-gray-400';
        inputEl.disabled = false;
        document.getElementById('quiz-typing-feedback').textContent = '';
        
        // Auto focus
        setTimeout(() => inputEl.focus(), 100);
    }
}

function checkAnswer(btn, isCorrect) {
    // Disable all options
    const allBtns = document.querySelectorAll('.quiz-option');
    allBtns.forEach(b => {
        b.onclick = null;
        b.classList.remove('hover:bg-[#f4f1ee]', 'hover:border-[#5f8a8b]', 'cursor-pointer');
    });

    const word = quizList[currentQuizIndex];

    if (isCorrect) {
        btn.classList.add('bg-[#d1fae5]', 'border-[#10b981]', 'text-[#065f46]');
        quizScore++;
    } else {
        btn.classList.add('bg-[#fee2e2]', 'border-[#ef4444]', 'text-[#991b1b]');
        if (!wrongQuestions.find(w => w.id === word.id)) wrongQuestions.push(word);
        // Highlight correct
        allBtns.forEach(b => {
            if (b.textContent === word.meaning) {
                b.classList.add('bg-[#d1fae5]', 'border-[#10b981]', 'text-[#065f46]');
            }
        });
    }

    document.getElementById('quiz-score').textContent = `Điểm: ${quizScore}`;

    setTimeout(() => {
        currentQuizIndex++;
        if (currentQuizIndex < quizList.length) {
            renderQuizQuestion();
        } else {
            showQuizResult();
        }
    }, isCorrect ? 1000 : 2000);
}

function checkTypingAnswer() {
    const inputEl = document.getElementById('quiz-typing-input');
    if (inputEl.disabled) return; // Prevent double submit
    
    const userAnswer = inputEl.value.trim().toLowerCase();
    if (!userAnswer) return;
    
    inputEl.disabled = true;
    const word = quizList[currentQuizIndex];
    const correctAnswer = word.meaning.trim().toLowerCase();
    
    // Hàm tính khoảng cách Levenshtein (chấp nhận sai lỗi chính tả nhỏ)
    function getEditDistance(a, b) {
        if(a.length === 0) return b.length;
        if(b.length === 0) return a.length;
        var matrix = [];
        for(var i = 0; i <= b.length; i++){
            matrix[i] = [i];
        }
        for(var j = 0; j <= a.length; j++){
            matrix[0][j] = j;
        }
        for(var i = 1; i <= b.length; i++){
            for(var j = 1; j <= a.length; j++){
                if(b.charAt(i-1) === a.charAt(j-1)){
                    matrix[i][j] = matrix[i-1][j-1];
                } else {
                    matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, Math.min(matrix[i][j-1] + 1, matrix[i-1][j] + 1));
                }
            }
        }
        return matrix[b.length][a.length];
    }

    let isCorrect = (userAnswer === correctAnswer);
    
    if (!isCorrect) {
        let cleanMeaning = correctAnswer.replace(/\s*\([^)]*\)/g, '').trim();
        let validAnswers = cleanMeaning.split(/\s*[\/,]\s*/);
        
        let extendedAnswers = [];
        validAnswers.forEach(ans => {
            extendedAnswers.push(ans);
            let simplified = ans.replace(/^(quyển|cái|con|chiếc|sự|món|quả|trái|đôi)\s+/g, '').trim();
            if (simplified && simplified !== ans) extendedAnswers.push(simplified);
        });
        
        isCorrect = extendedAnswers.some(ans => {
            if (ans === userAnswer) return true;
            
            // Tính số lỗi chính tả cho phép dựa trên độ dài đáp án
            let allowedTypos = 0;
            if (ans.length > 4 && ans.length <= 8) allowedTypos = 1;
            else if (ans.length > 8) allowedTypos = 2;
            
            let dist = getEditDistance(ans, userAnswer);
            return dist <= allowedTypos;
        });
    }
    
    const feedbackEl = document.getElementById('quiz-typing-feedback');
    
    if (isCorrect) {
        inputEl.classList.remove('border-[#e8e2db]', 'focus:border-[#5f8a8b]');
        inputEl.classList.add('border-[#10b981]', 'bg-[#d1fae5]', 'text-[#065f46]');
        feedbackEl.textContent = 'Chính xác!';
        feedbackEl.className = 'mt-4 text-lg font-medium h-6 text-[#10b981]';
        quizScore++;
    } else {
        inputEl.classList.remove('border-[#e8e2db]', 'focus:border-[#5f8a8b]');
        inputEl.classList.add('border-[#ef4444]', 'bg-[#fee2e2]', 'text-[#991b1b]');
        feedbackEl.innerHTML = `Sai! Đáp án đúng: <strong>${word.meaning}</strong>`;
        feedbackEl.className = 'mt-4 text-lg font-medium h-6 text-[#ef4444]';
        if (!wrongQuestions.find(w => w.id === word.id)) wrongQuestions.push(word);
    }
    
    document.getElementById('quiz-score').textContent = `Điểm: ${quizScore}`;
    
    setTimeout(() => {
        currentQuizIndex++;
        if (currentQuizIndex < quizList.length) {
            renderQuizQuestion();
        } else {
            showQuizResult();
        }
    }, isCorrect ? 1000 : 2500);
}

function showQuizResult() {
    document.getElementById('quiz-active').classList.add('hidden');
    document.getElementById('quiz-result').classList.remove('hidden');
    document.getElementById('quiz-final-score').innerHTML = `Bạn trả lời đúng <strong class="text-[#5f8a8b]">${quizScore}/${quizList.length}</strong> câu.`;
    
    const redoBtn = document.getElementById('quiz-redo-btn');
    if (wrongQuestions.length > 0) {
        redoBtn.classList.remove('hidden');
        redoBtn.textContent = `Làm lại ${wrongQuestions.length} câu sai`;
    } else {
        redoBtn.classList.add('hidden');
    }
}

function startRedoQuiz() {
    isRedoMode = true;
    quizList = [...wrongQuestions];
    
    // Shuffle quizList
    quizList.sort(() => Math.random() - 0.5);

    currentQuizIndex = 0;
    quizScore = 0;
    wrongQuestions = []; // Reset wrong questions for this redo session

    document.getElementById('quiz-setup').classList.add('hidden');
    document.getElementById('quiz-result').classList.add('hidden');
    document.getElementById('quiz-active').classList.remove('hidden');

    renderQuizQuestion();
}

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
    // Default tab when a lesson is opened will be set by openLesson()
});

// --- Game Logic ---
let gameTimerInterval = null;
let gameSeconds = 0;
let gameMoves = 0;
let gameCardsData = [];
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 0;

function showGameSetup() {
    document.getElementById('game-setup').classList.remove('hidden');
    document.getElementById('game-active').classList.add('hidden');
    document.getElementById('game-result').classList.add('hidden');
    clearInterval(gameTimerInterval);
}

function startGame() {
    const onlyBookmarks = document.getElementById('game-bookmark-only').checked;
    let filteredData = currentLesson === 'all' ? vocabularyData : vocabularyData.filter(w => w.lesson == currentLesson);
    
    if (onlyBookmarks) {
        filteredData = filteredData.filter(w => isBookmarked(w.id));
    }
    
    if (filteredData.length < 2) {
        alert("Cần ít nhất 2 từ vựng để chơi game!");
        return;
    }

    // Shuffle and pick up to 8 words
    filteredData.sort(() => 0.5 - Math.random());
    const selectedWords = filteredData.slice(0, 8);
    totalPairs = selectedWords.length;
    
    // Create 16 cards (8 pairs)
    gameCardsData = [];
    selectedWords.forEach(word => {
        gameCardsData.push({ id: word.id, text: word.word, type: 'jp', matchId: word.id });
        gameCardsData.push({ id: word.id, text: word.meaning, type: 'vn', matchId: word.id });
    });
    
    // Shuffle cards
    gameCardsData.sort(() => 0.5 - Math.random());
    
    // Reset state
    gameMoves = 0;
    gameSeconds = 0;
    matchedPairs = 0;
    flippedCards = [];
    updateGameStatus();
    
    // Render grid
    renderGameGrid();
    
    document.getElementById('game-setup').classList.add('hidden');
    document.getElementById('game-result').classList.add('hidden');
    document.getElementById('game-active').classList.remove('hidden');
    
    // Start timer
    clearInterval(gameTimerInterval);
    gameTimerInterval = setInterval(() => {
        gameSeconds++;
        updateGameStatus();
    }, 1000);
}

function updateGameStatus() {
    document.getElementById('game-moves').textContent = gameMoves;
    const m = Math.floor(gameSeconds / 60).toString().padStart(2, '0');
    const s = (gameSeconds % 60).toString().padStart(2, '0');
    document.getElementById('game-timer').textContent = `${m}:${s}`;
}

function renderGameGrid() {
    const grid = document.getElementById('game-grid');
    grid.innerHTML = '';
    
    // Adjust columns based on pairs
    if (totalPairs <= 3) {
        grid.className = 'grid grid-cols-2 sm:grid-cols-3 gap-4 perspective-1000 max-w-2xl mx-auto';
    } else {
        grid.className = 'grid grid-cols-3 sm:grid-cols-4 gap-4 perspective-1000';
    }

    gameCardsData.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'game-card shadow-sm';
        cardEl.dataset.index = index;
        cardEl.onclick = () => handleGameCardClick(index, cardEl);
        
        cardEl.innerHTML = `
            <div class="game-card-inner">
                <div class="game-card-face game-card-front">
                    <i class="fa-solid fa-question text-[#e8e2db] text-4xl"></i>
                </div>
                <div class="game-card-face game-card-back">
                    <p class="${card.type === 'jp' ? 'text-2xl font-bold text-[#5c544d]' : 'text-sm text-[#7d746d] font-medium'}">${card.text}</p>
                </div>
            </div>
        `;
        grid.appendChild(cardEl);
    });
}

function handleGameCardClick(index, cardEl) {
    if (flippedCards.length >= 2 || cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) {
        return;
    }
    
    cardEl.classList.add('flipped');
    flippedCards.push({ index, el: cardEl, data: gameCardsData[index] });
    
    if (flippedCards.length === 2) {
        gameMoves++;
        updateGameStatus();
        checkGameMatch();
    }
}

function checkGameMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.data.matchId === card2.data.matchId && card1.data.type !== card2.data.type) {
        // Match
        setTimeout(() => {
            card1.el.classList.add('matched');
            card2.el.classList.add('matched');
            matchedPairs++;
            flippedCards = [];
            
            if (matchedPairs === totalPairs) {
                endGame();
            }
        }, 400);
    } else {
        // Mismatch
        setTimeout(() => {
            card1.el.classList.add('mismatched');
            card2.el.classList.add('mismatched');
            
            setTimeout(() => {
                card1.el.classList.remove('flipped', 'mismatched');
                card2.el.classList.remove('flipped', 'mismatched');
                flippedCards = [];
            }, 400);
        }, 600);
    }
}

function endGame() {
    clearInterval(gameTimerInterval);
    document.getElementById('game-active').classList.add('hidden');
    document.getElementById('game-result').classList.remove('hidden');
    document.getElementById('game-final-moves').textContent = gameMoves;
    const m = Math.floor(gameSeconds / 60).toString().padStart(2, '0');
    const s = (gameSeconds % 60).toString().padStart(2, '0');
    document.getElementById('game-final-time').textContent = `${m}:${s}`;
}
