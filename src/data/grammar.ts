import type { GrammarLesson } from "@/lib/study/types";

export const grammar: GrammarLesson[] = [
  {
    "id": "1",
    "title": "Bài 1: Trợ từ cơ bản và Câu danh từ",
    "subtitle": "JPD113 – Bài 1",
    "description": "Học cách dùng các trợ từ cơ bản は、の、も、と và cấu trúc câu danh từ với です。",
    "points": [
      {
        "id": "1_1",
        "structure_jp": "N1 は N2 です。",
        "structure_vi": "N1 là N2",
        "chips": [
          "N1",
          "N2"
        ],
        "formula": "Danh từ 1 + は + Danh từ 2 + です",
        "explanation": "Câu khẳng định với です",
        "usage": "Dùng để giới thiệu tên, nghề nghiệp, quốc tịch, tuổi tác...",
        "note": "Trợ từ は phát âm là 'wa'. です thể hiện sự lịch sự.",
        "color": "#ffb6c1",
        "examples": [
          {
            "jp": "Aさんは学生です。",
            "reading": "Aさんはがくせいです。",
            "romaji": "A-san wa gakusei desu.",
            "vi": "Bạn A là sinh viên."
          },
          {
            "jp": "私は日本人です。",
            "reading": "わたしはにほんじんです。",
            "romaji": "Watashi wa nihonjin desu.",
            "vi": "Tôi là người Nhật."
          },
          {
            "jp": "田中さんは先生です。",
            "reading": "たなかさんはせんせいです。",
            "romaji": "Tanaka-san wa sensei desu.",
            "vi": "Anh Tanaka là giáo viên."
          },
          {
            "jp": "私は医者です。",
            "reading": "わたしはいしゃです。",
            "romaji": "Watashi wa isha desu.",
            "vi": "Tôi là bác sĩ."
          },
          {
            "jp": "マリアさんはブラジル人です。",
            "reading": "マリアさんはブラジルじんです。",
            "romaji": "Maria-san wa Burajiru-jin desu.",
            "vi": "Bạn Maria là người Brazil."
          }
        ]
      },
      {
        "id": "1_2",
        "structure_jp": "N1 は N2 の N3 です。",
        "structure_vi": "N1 là N3 của N2",
        "chips": [
          "N1",
          "N2",
          "N3"
        ],
        "formula": "Danh từ 1 + は + Danh từ 2 + の + Danh từ 3 + です",
        "explanation": "Trợ từ の chỉ sự sở hữu hoặc thuộc về",
        "usage": "Dùng để nói ai đó/cái gì đó thuộc về ai/tổ chức nào.",
        "note": "Trợ từ の nối 2 danh từ. N2 bổ nghĩa cho N3.",
        "color": "#ffd700",
        "examples": [
          {
            "jp": "やまださんはFPTの社員です。",
            "reading": "やまださんはFPTのしゃいんです。",
            "romaji": "Yamada-san wa FPT no shain desu.",
            "vi": "Anh Yamada là nhân viên của FPT."
          },
          {
            "jp": "アンさんは東京大学の学生です。",
            "reading": "アンさんはとうきょうだいがくのがくせいです。",
            "romaji": "An-san wa Toukyou daigaku no gakusei desu.",
            "vi": "Bạn An là sinh viên của trường đại học Tokyo."
          },
          {
            "jp": "佐藤さんはABCのエンジニアです。",
            "reading": "さとうさんはABCのエンジニアです。",
            "romaji": "Satou-san wa ABC no enjinia desu.",
            "vi": "Anh Sato là kỹ sư của công ty ABC."
          },
          {
            "jp": "ミラーさんはIMCの社員です。",
            "reading": "ミラーさんはIMCのしゃいんです。",
            "romaji": "Miraa-san wa IMC no shain desu.",
            "vi": "Anh Miller là nhân viên của IMC."
          },
          {
            "jp": "私は日本語センターの先生です。",
            "reading": "わたしはにほんごセンターのせんせいです。",
            "romaji": "Watashi wa nihongo sentaa no sensei desu.",
            "vi": "Tôi là giáo viên của trung tâm tiếng Nhật."
          }
        ]
      },
      {
        "id": "1_3",
        "structure_jp": "N1 の N2 は N3 です。",
        "structure_vi": "N2 của N1 là N3",
        "chips": [
          "N1",
          "N2",
          "N3"
        ],
        "formula": "Danh từ 1 + の + Danh từ 2 + は + Danh từ 3 + です",
        "explanation": "Chủ ngữ được mở rộng bằng trợ từ の",
        "usage": "Dùng để miêu tả đặc điểm, thông tin của một vật thuộc sở hữu.",
        "note": "",
        "color": "#98fb98",
        "examples": [
          {
            "jp": "私の趣味は映画です。",
            "reading": "わたしのしゅみはえいがです。",
            "romaji": "Watashi no shumi wa eiga desu.",
            "vi": "Sở thích của tôi là phim ảnh."
          },
          {
            "jp": "アンさんの誕生日は６月です。",
            "reading": "アンさんのたんじょうびはろくがつです。",
            "romaji": "An-san no tanjoubi wa rokugatsu desu.",
            "vi": "Sinh nhật của bạn An là tháng 6."
          },
          {
            "jp": "私の電話番号は123です。",
            "reading": "わたしのでんわばんごうは123です。",
            "romaji": "Watashi no denwa bangou wa 123 desu.",
            "vi": "Số điện thoại của tôi là 123."
          },
          {
            "jp": "田中さんの専門はコンピューターです。",
            "reading": "たなかさんのせんもんはコンピューターです。",
            "romaji": "Tanaka-san no senmon wa konpyuutaa desu.",
            "vi": "Chuyên môn của anh Tanaka là máy tính."
          },
          {
            "jp": "私の父の職業は公務員です。",
            "reading": "わたしのちちのしょくぎょうはこうむいんです。",
            "romaji": "Watashi no chichi no shokugyou wa koumuin desu.",
            "vi": "Nghề nghiệp của bố tôi là công chức."
          }
        ]
      },
      {
        "id": "1_4",
        "structure_jp": "N1 も N2 です。",
        "structure_vi": "N1 cũng là N2",
        "chips": [
          "N1",
          "N2"
        ],
        "formula": "Danh từ 1 + も + Danh từ 2 + です",
        "explanation": "Trợ từ も có nghĩa là 'cũng'",
        "usage": "Dùng khi thông tin của chủ ngữ này giống với chủ ngữ trước đó.",
        "note": "Thay thế cho trợ từ は.",
        "color": "#dda0dd",
        "examples": [
          {
            "jp": "私は二十歳です。Bさんも二十歳です。",
            "reading": "わたしははたちです。Bさんもはたちです。",
            "romaji": "Watashi wa hatachi desu. B-san mo hatachi desu.",
            "vi": "Tôi 20 tuổi. Bạn B cũng 20 tuổi."
          },
          {
            "jp": "私も学生です。",
            "reading": "わたしもがくせいです。",
            "romaji": "Watashi mo gakusei desu.",
            "vi": "Tôi cũng là sinh viên."
          },
          {
            "jp": "田中さんは日本人です。佐藤さんも日本人です。",
            "reading": "たなかさんはにほんじんです。さとうさんもにほんじんです。",
            "romaji": "Tanaka-san wa nihonjin desu. Satou-san mo nihonjin desu.",
            "vi": "Anh Tanaka là người Nhật. Anh Sato cũng là người Nhật."
          },
          {
            "jp": "この本は五百円です。その本も五百円です。",
            "reading": "このほんはごひゃくえんです。そのほんもごひゃくえんです。",
            "romaji": "Kono hon wa gohyakuen desu. Sono hon mo gohyakuen desu.",
            "vi": "Quyển sách này 500 yên. Quyển sách đó cũng 500 yên."
          },
          {
            "jp": "マリアさんは主婦です。アンさんも主婦です。",
            "reading": "マリアさんはしゅふです。アンさんもしゅふです。",
            "romaji": "Maria-san wa shufu desu. An-san mo shufu desu.",
            "vi": "Chị Maria là nội trợ. Bạn An cũng là nội trợ."
          }
        ]
      },
      {
        "id": "1_5",
        "structure_jp": "N1 は N2 じゃありません。",
        "structure_vi": "N1 không phải là N2",
        "chips": [
          "N1",
          "N2"
        ],
        "formula": "Danh từ 1 + は + Danh từ 2 + じゃありません",
        "explanation": "Câu phủ định của です",
        "usage": "Dùng để phủ định một danh từ.",
        "note": "Dạng lịch sự hơn là ではありません (dewa arimasen).",
        "color": "#ffb6c1",
        "examples": [
          {
            "jp": "さとさんは日本人じゃありません。",
            "reading": "さとさんはにほんじんじゃありません。",
            "romaji": "Sato-san wa nihonjin ja arimasen.",
            "vi": "Bạn Sato không phải là người Nhật."
          },
          {
            "jp": "私は学生じゃありません。",
            "reading": "わたしはがくせいじゃありません。",
            "romaji": "Watashi wa gakusei ja arimasen.",
            "vi": "Tôi không phải là sinh viên."
          },
          {
            "jp": "ミラーさんはアメリカ人じゃありません。",
            "reading": "ミラーさんはアメリカじんじゃありません。",
            "romaji": "Miraa-san wa amerikajin ja arimasen.",
            "vi": "Anh Miller không phải là người Mỹ."
          },
          {
            "jp": "ここは食堂じゃありません。",
            "reading": "ここはしょくどうじゃありません。",
            "romaji": "Koko wa shokudou ja arimasen.",
            "vi": "Ở đây không phải là nhà ăn."
          },
          {
            "jp": "今日は日曜日じゃありません。",
            "reading": "きょうはにちようびじゃありません。",
            "romaji": "Kyou wa nichiyoubi ja arimasen.",
            "vi": "Hôm nay không phải là chủ nhật."
          }
        ]
      },
      {
        "id": "1_6",
        "structure_jp": "N1 と N2",
        "structure_vi": "N1 và N2",
        "chips": [
          "N1",
          "N2"
        ],
        "formula": "Danh từ 1 + と + Danh từ 2",
        "explanation": "Trợ từ と dùng để nối 2 danh từ",
        "usage": "Dùng để liệt kê toàn bộ các sự vật, sự việc.",
        "note": "",
        "color": "#ffd700",
        "examples": []
      },
      {
        "id": "1_7",
        "structure_jp": "N は [Từ hỏi] ですか。",
        "structure_vi": "N là [gì/đâu/ai]?",
        "chips": [
          "N",
          "Từ hỏi"
        ],
        "formula": "Danh từ + は + Từ để hỏi + ですか",
        "explanation": "Câu hỏi có từ để hỏi",
        "usage": "Dùng để hỏi thông tin chưa biết.",
        "note": "Không trả lời bằng 'Vâng' hoặc 'Không'.",
        "color": "#98fb98",
        "examples": [
          {
            "jp": "Bさんの国はどちらですか。",
            "reading": "Bさんのくにはどちらですか。",
            "romaji": "B-san no kuni wa dochira desu ka.",
            "vi": "Đất nước của bạn B là ở đâu?"
          },
          {
            "jp": "お名前は何ですか。",
            "reading": "おなまえはなんですか。",
            "romaji": "Onamae wa nan desu ka.",
            "vi": "Tên bạn là gì?"
          },
          {
            "jp": "あの方はどなたですか。",
            "reading": "あのかたはどなたですか。",
            "romaji": "Ano kata wa donata desu ka.",
            "vi": "Vị kia là ai vậy?"
          },
          {
            "jp": "大学の電話番号は何番ですか。",
            "reading": "だいがくのでんわばんごうはなんばんですか。",
            "romaji": "Daigaku no denwa bangou wa nanban desu ka.",
            "vi": "Số điện thoại của trường đại học là số mấy?"
          },
          {
            "jp": "お手洗いはどこですか。",
            "reading": "おてあらいはどこですか。",
            "romaji": "Otearai wa doko desu ka.",
            "vi": "Nhà vệ sinh ở đâu vậy?"
          }
        ]
      },
      {
        "id": "1_8",
        "structure_jp": "N1 は N2 ですか。",
        "structure_vi": "N1 có phải là N2 không?",
        "chips": [
          "N1",
          "N2"
        ],
        "formula": "Danh từ 1 + は + Danh từ 2 + ですか",
        "explanation": "Câu hỏi Xác nhận (Yes/No question)",
        "usage": "Dùng để xác nhận tính đúng sai của một thông tin.",
        "note": "Trả lời bắt đầu bằng はい (Vâng) hoặc いいえ (Không).",
        "color": "#dda0dd",
        "examples": []
      }
    ]
  },
  {
    "id": "2",
    "title": "Bài 2: Vị trí, Giá cả và Xuất xứ",
    "subtitle": "JPD113 – Bài 2",
    "description": "Học cách hỏi vị trí, số tầng, giá tiền, nội dung, xuất xứ và sở hữu.",
    "points": [
      {
        "id": "2_1",
        "structure_jp": "〜は どこですか / どちらですか。",
        "structure_vi": "~ ở đâu?",
        "chips": [
          "〜",
          "どこ/どちら"
        ],
        "formula": "Danh từ + は + どこ (thông thường) / どちら (lịch sự) + ですか",
        "explanation": "Hỏi vị trí",
        "usage": "Hỏi vị trí của địa điểm, đồ vật hoặc người.",
        "note": "どちら còn dùng để hỏi phương hướng.",
        "color": "#ffb6c1",
        "examples": [
          {
            "jp": "トイレはどこですか。",
            "reading": "トイレはどこですか。",
            "romaji": "Toire wa doko desu ka.",
            "vi": "Nhà vệ sinh ở đâu?"
          },
          {
            "jp": "エレベーターはどちらですか。",
            "reading": "エレベーターはどちらですか。",
            "romaji": "Erebeetaa wa dochira desu ka.",
            "vi": "Thang máy ở đâu (hướng nào)?"
          },
          {
            "jp": "事務所はどこですか。",
            "reading": "じむしょはどこですか。",
            "romaji": "Jimusho wa doko desu ka.",
            "vi": "Văn phòng ở đâu vậy?"
          },
          {
            "jp": "あなたの国はどちらですか。",
            "reading": "あなたのくにはどちらですか。",
            "romaji": "Anata no kuni wa dochira desu ka.",
            "vi": "Đất nước của bạn là ở đâu (phía nào)?"
          },
          {
            "jp": "受付はどこですか。",
            "reading": "うけつけはどこですか。",
            "romaji": "Uketsuke wa doko desu ka.",
            "vi": "Quầy tiếp tân ở đâu?"
          }
        ]
      },
      {
        "id": "2_2",
        "structure_jp": "〜は なんがいですか。",
        "structure_vi": "~ ở tầng mấy?",
        "chips": [
          "〜",
          "なんがい"
        ],
        "formula": "Danh từ + は + なんかい + ですか",
        "explanation": "Hỏi số tầng",
        "usage": "Hỏi vị trí tầng của một địa điểm trong tòa nhà.",
        "note": "Trả lời bằng số tầng + かい/がい.",
        "color": "#ffd700",
        "examples": [
          {
            "jp": "レストランは何階ですか。",
            "reading": "レストランはなんかいですか。",
            "romaji": "Resutoran wa nankai desu ka.",
            "vi": "Nhà hàng ở tầng mấy?"
          },
          {
            "jp": "会議室は何階ですか。",
            "reading": "かいぎしつはなんかいですか。",
            "romaji": "Kaigishitsu wa nankai desu ka.",
            "vi": "Phòng họp ở tầng mấy?"
          },
          {
            "jp": "売り場は何階ですか。",
            "reading": "うりばはなんかいですか。",
            "romaji": "Uriba wa nankai desu ka.",
            "vi": "Quầy bán hàng ở tầng mấy?"
          },
          {
            "jp": "パソコン売り場は何階ですか。",
            "reading": "パソコンうりばはなんかいですか。",
            "romaji": "Pasokon uriba wa nankai desu ka.",
            "vi": "Quầy bán máy tính ở tầng mấy?"
          },
          {
            "jp": "私の部屋は三階です。",
            "reading": "わたしのへやはさんがいです。",
            "romaji": "Watashi no heya wa sangai desu.",
            "vi": "Phòng của tôi ở tầng 3."
          }
        ]
      },
      {
        "id": "2_3",
        "structure_jp": "N を ください。",
        "structure_vi": "Cho tôi N / Lấy cho tôi N",
        "chips": [
          "N",
          "ください"
        ],
        "formula": "Danh từ + を + ください",
        "explanation": "Yêu cầu/Gọi món",
        "usage": "Dùng khi mua hàng hoặc gọi món trong nhà hàng.",
        "note": "Có thể thêm số lượng vào trước ください.",
        "color": "#98fb98",
        "examples": [
          {
            "jp": "そのTシャツをください。",
            "reading": "そのTシャツをください。",
            "romaji": "Sono T-shatsu o kudasai.",
            "vi": "Cho tôi cái áo thun đó."
          },
          {
            "jp": "りんごを三つください。",
            "reading": "りんごをみっつください。",
            "romaji": "Ringo o mittsu kudasai.",
            "vi": "Cho tôi 3 quả táo."
          },
          {
            "jp": "このペンをください。",
            "reading": "このペンをください。",
            "romaji": "Kono pen o kudasai.",
            "vi": "Lấy cho tôi cái bút này."
          },
          {
            "jp": "コーヒーを二つください。",
            "reading": "コーヒーをふたつください。",
            "romaji": "Koohii o futatsu kudasai.",
            "vi": "Cho tôi 2 ly cà phê."
          },
          {
            "jp": "水をください。",
            "reading": "みずをください。",
            "romaji": "Mizu o kudasai.",
            "vi": "Cho tôi xin nước."
          }
        ]
      },
      {
        "id": "2_4",
        "structure_jp": "〜は いくらですか。",
        "structure_vi": "~ bao nhiêu tiền?",
        "chips": [
          "〜",
          "いくら"
        ],
        "formula": "Danh từ + は + いくら + ですか",
        "explanation": "Hỏi giá tiền",
        "usage": "Dùng để hỏi giá của một món đồ.",
        "note": "",
        "color": "#dda0dd",
        "examples": []
      },
      {
        "id": "2_5",
        "structure_jp": "〜は どこの N ですか。",
        "structure_vi": "N của nước nào/hãng nào?",
        "chips": [
          "〜",
          "どこの N"
        ],
        "formula": "N1 + は + どこの + N2 + ですか",
        "explanation": "Hỏi về xuất xứ/nơi sản xuất",
        "usage": "Hỏi về nguồn gốc, nơi sản xuất của đồ vật.",
        "note": "どこの trả lời bằng tên quốc gia hoặc tên công ty.",
        "color": "#ffb6c1",
        "examples": [
          {
            "jp": "これはどこのビールですか。",
            "reading": "これはどこのビールですか。",
            "romaji": "Kore wa doko no biiru desu ka.",
            "vi": "Đây là bia của nước nào?"
          },
          {
            "jp": "これはどこのカメラですか。",
            "reading": "これはどこのカメラですか。",
            "romaji": "Kore wa doko no kamera desu ka.",
            "vi": "Đây là máy ảnh của hãng nào (nước nào)?"
          },
          {
            "jp": "それはどこの車ですか。",
            "reading": "それはどこのくるまですか。",
            "romaji": "Sore wa doko no kuruma desu ka.",
            "vi": "Đó là xe ô tô của hãng nào?"
          },
          {
            "jp": "これはどこのワインですか。",
            "reading": "これはどこのワインですか。",
            "romaji": "Kore wa doko no wain desu ka.",
            "vi": "Đây là rượu vang của nước nào?"
          },
          {
            "jp": "このネクタイはどこのですか。",
            "reading": "このネクタイはどこのですか。",
            "romaji": "Kono nekutai wa doko no desu ka.",
            "vi": "Cái cà vạt này là của hãng nào?"
          }
        ]
      },
      {
        "id": "2_6",
        "structure_jp": "〜は だれの N ですか。",
        "structure_vi": "N của ai?",
        "chips": [
          "〜",
          "だれの N"
        ],
        "formula": "Danh từ 1 + は + だれの + Danh từ 2 + ですか",
        "explanation": "Hỏi sở hữu",
        "usage": "Hỏi xem một vật thuộc về ai.",
        "note": "",
        "color": "#ffd700",
        "examples": []
      }
    ]
  },
  {
    "id": "3",
    "title": "Bài 3: Động từ ます",
    "subtitle": "JPD113 – Bài 3",
    "description": "Nói việc làm hay không làm, đi đâu, làm gì, làm ở đâu, lúc mấy giờ, và từ đâu đến đâu.",
    "points": [
      {
        "color": "#ffb6c1",
        "note": "ます không đi với です. Không nói 食べますです.",
        "id": "3_1",
        "structure_jp": "Vます / Vません",
        "structure_vi": "Làm / không làm",
        "chips": [
          "ます",
          "ません"
        ],
        "formula": "ます là khẳng định, lịch sự, hiện tại hoặc tương lai. Đổi ます thành ません để phủ định.",
        "explanation": "Động từ lịch sự ở hiện tại và tương lai",
        "usage": "食べます là ăn. 食べません là không ăn. Câu hỏi thêm か.",
        "examples": [
          {
            "jp": "毎日朝ごはんを食べます。",
            "reading": "まいにちあさごはんをたべます。",
            "romaji": "Mainichi asagohan o tabemasu.",
            "vi": "Mỗi ngày tôi ăn sáng."
          },
          {
            "jp": "はい、食べます。",
            "reading": "はい、たべます。",
            "romaji": "Hai, tabemasu.",
            "vi": "Vâng, tôi ăn."
          },
          {
            "jp": "いいえ、食べません。",
            "reading": "いいえ、たべません。",
            "romaji": "Iie, tabemasen.",
            "vi": "Không, tôi không ăn."
          },
          {
            "jp": "明日、勉強します。",
            "reading": "あした、べんきょうします。",
            "romaji": "Ashita, benkyou shimasu.",
            "vi": "Ngày mai tôi học."
          },
          {
            "jp": "お酒を飲みません。",
            "reading": "おさけをのみません。",
            "romaji": "Osake o nomimasen.",
            "vi": "Tôi không uống rượu."
          }
        ]
      },
      {
        "color": "#ffd700",
        "note": "Hỏi đích đến bằng どこへ行きますか. Không dùng で cho đích đến.",
        "id": "3_2",
        "structure_jp": "Nơi へ 行きます",
        "structure_vi": "Đi, đến, về đâu",
        "chips": [
          "へ",
          "行きます",
          "来ます",
          "帰ります"
        ],
        "formula": "Nơi chốn + へ + 行きます / 来ます / 帰ります.",
        "explanation": "Đích của việc di chuyển",
        "usage": "行きます là đi, 来ます là đến, 帰ります là về.",
        "examples": [
          {
            "jp": "冬休み、北海道へ行きます。",
            "reading": "ふゆやすみ、ほっかいどうへいきます。",
            "romaji": "Fuyuyasumi, Hokkaidou e ikimasu.",
            "vi": "Kỳ nghỉ đông tôi đi Hokkaido."
          },
          {
            "jp": "夏休み、国へ帰りません。",
            "reading": "なつやすみ、くにへかえりません。",
            "romaji": "Natsuyasumi, kuni e kaerimasen.",
            "vi": "Kỳ nghỉ hè tôi không về nước."
          },
          {
            "jp": "学校へ来ます。",
            "reading": "がっこうへきます。",
            "romaji": "Gakkou e kimasu.",
            "vi": "Tôi đến trường."
          },
          {
            "jp": "どこへ行きますか。",
            "reading": "どこへいきますか。",
            "romaji": "Doko e ikimasu ka.",
            "vi": "Bạn đi đâu?"
          },
          {
            "jp": "うちへ帰ります。",
            "reading": "うちへかえります。",
            "romaji": "Uchi e kaerimasu.",
            "vi": "Tôi về nhà."
          }
        ]
      },
      {
        "color": "#98fb98",
        "note": "を đọc là o, không đọc là wo khi là trợ từ.",
        "id": "3_3",
        "structure_jp": "N を Vます",
        "structure_vi": "Làm việc đó với N",
        "chips": [
          "を",
          "何を"
        ],
        "formula": "Tân ngữ + を + động từ ます.",
        "explanation": "を đánh dấu cái bị tác động",
        "usage": "パンを食べます là ăn bánh mì. Hỏi bằng 何を食べますか.",
        "examples": [
          {
            "jp": "パンを食べます。",
            "reading": "パンをたべます。",
            "romaji": "Pan o tabemasu.",
            "vi": "Tôi ăn bánh mì."
          },
          {
            "jp": "水を飲みます。",
            "reading": "みずをのみます。",
            "romaji": "Mizu o nomimasu.",
            "vi": "Tôi uống nước."
          },
          {
            "jp": "本を読みます。",
            "reading": "ほんをよみます。",
            "romaji": "Hon o yomimasu.",
            "vi": "Tôi đọc sách."
          },
          {
            "jp": "何を食べますか。",
            "reading": "なにをたべますか。",
            "romaji": "Nani o tabemasu ka.",
            "vi": "Bạn ăn gì?"
          },
          {
            "jp": "手紙を書きます。",
            "reading": "てがみをかきます。",
            "romaji": "Tegami o kakimasu.",
            "vi": "Tôi viết thư."
          }
        ]
      },
      {
        "color": "#dda0dd",
        "note": "Đi đến đâu dùng へ. Làm gì ở đó dùng で.",
        "id": "3_4",
        "structure_jp": "Nơi で Vます",
        "structure_vi": "Làm việc đó ở đâu",
        "chips": [
          "で",
          "どこで"
        ],
        "formula": "Nơi thực hiện + で + tân ngữ を + động từ.",
        "explanation": "で đánh dấu nơi diễn ra hành động",
        "usage": "学校で勉強します là học ở trường. Khác với へ, là nơi đến.",
        "examples": [
          {
            "jp": "うちで料理をします。",
            "reading": "うちでりょうりをします。",
            "romaji": "Uchi de ryouri o shimasu.",
            "vi": "Tôi nấu ăn ở nhà."
          },
          {
            "jp": "学校で勉強します。",
            "reading": "がっこうでべんきょうします。",
            "romaji": "Gakkou de benkyou shimasu.",
            "vi": "Tôi học ở trường."
          },
          {
            "jp": "コンビニでアルバイトをします。",
            "reading": "コンビニでアルバイトをします。",
            "romaji": "Konbini de arubaito o shimasu.",
            "vi": "Tôi làm thêm ở cửa hàng tiện lợi."
          },
          {
            "jp": "どこで食べますか。",
            "reading": "どこでたべますか。",
            "romaji": "Doko de tabemasu ka.",
            "vi": "Bạn ăn ở đâu?"
          },
          {
            "jp": "図書館で本を読みます。",
            "reading": "としょかんでほんをよみます。",
            "romaji": "Toshokan de hon o yomimasu.",
            "vi": "Tôi đọc sách ở thư viện."
          }
        ]
      },
      {
        "color": "#ffb6c1",
        "note": "毎日、明日、昨日 không thêm に. Hỏi bằng いつ.",
        "id": "3_5",
        "structure_jp": "時 に Vます",
        "structure_vi": "Làm vào lúc nào",
        "chips": [
          "に",
          "いつ"
        ],
        "formula": "Giờ, thứ, ngày hoặc tháng cụ thể + に + động từ.",
        "explanation": "に gắn vào thời điểm chính xác",
        "usage": "7時に起きます là dậy lúc 7 giờ. 月曜日に銀行へ行きます là thứ hai đi ngân hàng.",
        "examples": [
          {
            "jp": "7時に起きます。",
            "reading": "しちじにおきます。",
            "romaji": "Shichiji ni okimasu.",
            "vi": "Tôi dậy lúc 7 giờ."
          },
          {
            "jp": "毎晩11時に寝ます。",
            "reading": "まいばんじゅういちじにねます。",
            "romaji": "Maiban juuichiji ni nemasu.",
            "vi": "Mỗi tối tôi ngủ lúc 11 giờ."
          },
          {
            "jp": "月曜日に銀行へ行きます。",
            "reading": "げつようびにぎんこうへいきます。",
            "romaji": "Getsuyoubi ni ginkou e ikimasu.",
            "vi": "Thứ hai tôi đi ngân hàng."
          },
          {
            "jp": "5月10日に東京へ行きます。",
            "reading": "ごがつとおかにとうきょうへいきます。",
            "romaji": "Gogatsu tooka ni Toukyou e ikimasu.",
            "vi": "Ngày 10 tháng 5 tôi đi Tokyo."
          },
          {
            "jp": "いつ日本へ行きますか。",
            "reading": "いつにほんへいきますか。",
            "romaji": "Itsu Nihon e ikimasu ka.",
            "vi": "Khi nào bạn đi Nhật?"
          }
        ]
      },
      {
        "color": "#ffd700",
        "note": "Hỏi bằng 何時から何時までですか.",
        "id": "3_6",
        "structure_jp": "N から N まで",
        "structure_vi": "Từ… đến…",
        "chips": [
          "から",
          "まで"
        ],
        "formula": "Điểm đầu + から + điểm cuối + まで + động từ hoặc tính từ.",
        "explanation": "から là từ, まで là đến. Dùng cho thời gian và nơi chốn",
        "usage": "9時から5時まで働きます là làm việc từ 9 giờ đến 5 giờ.",
        "examples": [
          {
            "jp": "9時から5時まで働きます。",
            "reading": "くじからごじまではたらきます。",
            "romaji": "Kuji kara goji made hatarakimasu.",
            "vi": "Tôi làm việc từ 9 giờ đến 5 giờ."
          },
          {
            "jp": "月曜日から金曜日まで学校へ行きます。",
            "reading": "げつようびからきんようびまでがっこうへいきます。",
            "romaji": "Getsuyoubi kara kin'youbi made gakkou e ikimasu.",
            "vi": "Từ thứ hai đến thứ sáu tôi đi học."
          },
          {
            "jp": "ここから駅まで歩きます。",
            "reading": "ここからえきまであるきます。",
            "romaji": "Koko kara eki made arukimasu.",
            "vi": "Tôi đi bộ từ đây đến ga."
          },
          {
            "jp": "何時から何時までですか。",
            "reading": "なんじからなんじまでですか。",
            "romaji": "Nanji kara nanji made desu ka.",
            "vi": "Từ mấy giờ đến mấy giờ?"
          },
          {
            "jp": "1月から3月まで寒いです。",
            "reading": "いちがつからさんがつまでさむいです。",
            "romaji": "Ichigatsu kara sangatsu made samui desu.",
            "vi": "Từ tháng 1 đến tháng 3 thì lạnh."
          }
        ]
      },
      {
        "color": "#98fb98",
        "note": "Không dùng với câu khẳng định. Không nói 何も食べます.",
        "id": "3_7",
        "structure_jp": "何も / どこも Vません",
        "structure_vi": "Không gì cả, không đâu cả",
        "chips": [
          "何も",
          "どこも",
          "ません"
        ],
        "formula": "何も hoặc どこも / どこへも + động từ thể phủ định.",
        "explanation": "も kèm từ hỏi, rồi phủ định, nghĩa là hoàn toàn không",
        "usage": "何も食べません là không ăn gì cả. どこも行きません là không đi đâu cả.",
        "examples": [
          {
            "jp": "日曜日、どこも行きません。",
            "reading": "にちようび、どこもいきません。",
            "romaji": "Nichiyoubi, doko mo ikimasen.",
            "vi": "Chủ nhật tôi không đi đâu cả."
          },
          {
            "jp": "毎晩、何も食べません。",
            "reading": "まいばん、なにもたべません。",
            "romaji": "Maiban, nani mo tabemasen.",
            "vi": "Mỗi tối tôi không ăn gì cả."
          },
          {
            "jp": "今日は何もしません。",
            "reading": "きょうはなにもしません。",
            "romaji": "Kyou wa nani mo shimasen.",
            "vi": "Hôm nay tôi không làm gì cả."
          },
          {
            "jp": "週末、どこへも行きません。",
            "reading": "しゅうまつ、どこへもいきません。",
            "romaji": "Shuumatsu, doko e mo ikimasen.",
            "vi": "Cuối tuần tôi không đi đâu cả."
          },
          {
            "jp": "朝、何も飲みません。",
            "reading": "あさ、なにものみません。",
            "romaji": "Asa, nani mo nomimasen.",
            "vi": "Sáng tôi không uống gì cả."
          }
        ]
      }
    ]
  },
  {
    "id": "4",
    "title": "Bài 4: Tính từ và Liên từ",
    "subtitle": "JPD123 – Bài 4",
    "description": "Chia tính từ đuôi い và な, ghép với danh từ hoặc động từ, nói mức độ, và nối câu bằng が、しかし、そして。",
    "points": [
      {
        "color": "#ffb6c1",
        "examples": [
          {
            "jp": "このりんごはおいしいです。",
            "reading": "このりんごはおいしいです。",
            "romaji": "Kono ringo wa oishii desu.",
            "vi": "Quả táo này ngon."
          },
          {
            "jp": "このりんごはおいしくないです。",
            "reading": "このりんごはおいしくないです。",
            "romaji": "Kono ringo wa oishikunai desu.",
            "vi": "Quả táo này không ngon."
          },
          {
            "jp": "きのうのケーキはおいしかったです。",
            "reading": "きのうのケーキはおいしかったです。",
            "romaji": "Kinou no keeki wa oishikatta desu.",
            "vi": "Chiếc bánh hôm qua đã ngon."
          },
          {
            "jp": "きのうのケーキはおいしくなかったです。",
            "reading": "きのうのケーキはおいしくなかったです。",
            "romaji": "Kinou no keeki wa oishikunakatta desu.",
            "vi": "Chiếc bánh hôm qua đã không ngon."
          },
          {
            "jp": "この映画はよかったです。",
            "reading": "このえいがはよかったです。",
            "romaji": "Kono eiga wa yokatta desu.",
            "vi": "Bộ phim này đã hay."
          }
        ],
        "note": "いい là ngoại lệ: よくない、よかった、よくなかった. Không nói いくない hay いかった.",
        "id": "4_1",
        "structure_jp": "〜くない / 〜かった",
        "structure_vi": "Phủ định và quá khứ của tính từ đuôi い",
        "chips": [
          "い",
          "くない",
          "かった"
        ],
        "formula": "Bỏ い. Phủ định: くない. Quá khứ: かった. Phủ định quá khứ: くなかった. Thêm です để lịch sự.",
        "explanation": "Tính từ đuôi い tự chia, không mượn じゃありません",
        "usage": "おいしい → おいしくない → おいしかった → おいしくなかった."
      },
      {
        "color": "#ffd700",
        "examples": [
          {
            "jp": "この部屋はきれいです。",
            "reading": "このへやはきれいです。",
            "romaji": "Kono heya wa kirei desu.",
            "vi": "Căn phòng này sạch."
          },
          {
            "jp": "この部屋はきれいじゃありません。",
            "reading": "このへやはきれいじゃありません。",
            "romaji": "Kono heya wa kirei ja arimasen.",
            "vi": "Căn phòng này không sạch."
          },
          {
            "jp": "きのうは暇でした。",
            "reading": "きのうはひまでした。",
            "romaji": "Kinou wa hima deshita.",
            "vi": "Hôm qua tôi rảnh."
          },
          {
            "jp": "きのうは暇じゃありませんでした。",
            "reading": "きのうはひまじゃありませんでした。",
            "romaji": "Kinou wa hima ja arimasen deshita.",
            "vi": "Hôm qua tôi không rảnh."
          },
          {
            "jp": "あの公園は静かでした。",
            "reading": "あのこうえんはしずかでした。",
            "romaji": "Ano kouen wa shizuka deshita.",
            "vi": "Công viên đó đã yên tĩnh."
          }
        ],
        "note": "Dạng trang trọng hơn của じゃありません là ではありません.",
        "id": "4_2",
        "structure_jp": "〜じゃありません / 〜でした",
        "structure_vi": "Phủ định và quá khứ của tính từ đuôi な",
        "chips": [
          "な",
          "じゃありません",
          "でした"
        ],
        "formula": "Bỏ な khi kết câu. Khẳng định: です. Phủ định: じゃありません. Quá khứ: でした. Phủ định quá khứ: じゃありませんでした.",
        "explanation": "Tính từ đuôi な mượn cách chia của danh từ",
        "usage": "きれい → きれいじゃありません → きれいでした → きれいじゃありませんでした."
      },
      {
        "color": "#98fb98",
        "examples": [
          {
            "jp": "これは新しい車です。",
            "reading": "これはあたらしいくるまです。",
            "romaji": "Kore wa atarashii kuruma desu.",
            "vi": "Đây là chiếc xe mới."
          },
          {
            "jp": "きれいな花です。",
            "reading": "きれいなはなです。",
            "romaji": "Kirei na hana desu.",
            "vi": "Là một bông hoa đẹp."
          },
          {
            "jp": "おいしい料理を食べます。",
            "reading": "おいしいりょうりをたべます。",
            "romaji": "Oishii ryouri o tabemasu.",
            "vi": "Tôi ăn một món ngon."
          },
          {
            "jp": "静かな部屋で勉強します。",
            "reading": "しずかなへやでべんきょうします。",
            "romaji": "Shizuka na heya de benkyou shimasu.",
            "vi": "Tôi học trong phòng yên tĩnh."
          },
          {
            "jp": "大きい犬がいます。",
            "reading": "おおきいいぬがいます。",
            "romaji": "Ookii inu ga imasu.",
            "vi": "Có một con chó to."
          }
        ],
        "note": "Khi đứng trước danh từ thì không chia quá khứ hay phủ định ở chính tính từ đó.",
        "id": "4_3",
        "structure_jp": "新しい車 / きれいな花",
        "structure_vi": "Tính từ đứng trước danh từ",
        "chips": [
          "い",
          "な",
          "N"
        ],
        "formula": "Trước danh từ, tính từ đuôi い giữ nguyên い. Tính từ đuôi な giữ な.",
        "explanation": "Tính từ bổ nghĩa trực tiếp cho danh từ phía sau",
        "usage": "新しい車 là xe mới. きれいな花 là hoa đẹp. Không bỏ な."
      },
      {
        "color": "#dda0dd",
        "examples": [
          {
            "jp": "部屋をきれいにします。",
            "reading": "へやをきれいにします。",
            "romaji": "Heya o kirei ni shimasu.",
            "vi": "Tôi dọn phòng cho sạch."
          },
          {
            "jp": "早く起きます。",
            "reading": "はやくおきます。",
            "romaji": "Hayaku okimasu.",
            "vi": "Tôi dậy sớm."
          },
          {
            "jp": "字を大きく書きます。",
            "reading": "じをおおきくかきます。",
            "romaji": "Ji o ookiku kakimasu.",
            "vi": "Tôi viết chữ to."
          },
          {
            "jp": "静かに話してください。",
            "reading": "しずかにはなしてください。",
            "romaji": "Shizuka ni hanashite kudasai.",
            "vi": "Xin hãy nói nhỏ."
          },
          {
            "jp": "遅く帰ります。",
            "reading": "おそくかえります。",
            "romaji": "Osoku kaerimasu.",
            "vi": "Tôi về muộn."
          }
        ],
        "note": "Không giữ い hay な khi tính từ đứng ngay trước động từ.",
        "id": "4_4",
        "structure_jp": "早く起きます / きれいにします",
        "structure_vi": "Tính từ bổ nghĩa cho động từ",
        "chips": [
          "く",
          "に",
          "V"
        ],
        "formula": "Trước động từ, đuôi い đổi thành く. Đuôi な đổi thành に.",
        "explanation": "Tính từ nói về cách thức của hành động",
        "usage": "早く起きます là dậy sớm. きれいにします là làm cho sạch."
      },
      {
        "color": "#ffb6c1",
        "examples": [
          {
            "jp": "このラーメンはとてもおいしいです。",
            "reading": "このラーメンはとてもおいしいです。",
            "romaji": "Kono raamen wa totemo oishii desu.",
            "vi": "Bát mì này rất ngon."
          },
          {
            "jp": "この本はすこし高いです。",
            "reading": "このほんはすこしたかいです。",
            "romaji": "Kono hon wa sukoshi takai desu.",
            "vi": "Quyển sách này hơi đắt."
          },
          {
            "jp": "この映画はあまりおもしろくないです。",
            "reading": "このえいがはあまりおもしろくないです。",
            "romaji": "Kono eiga wa amari omoshirokunai desu.",
            "vi": "Phim này không hay lắm."
          },
          {
            "jp": "今日はぜんぜん寒くないです。",
            "reading": "きょうはぜんぜんさむくないです。",
            "romaji": "Kyou wa zenzen samukunai desu.",
            "vi": "Hôm nay hoàn toàn không lạnh."
          },
          {
            "jp": "この部屋はとてもきれいです。",
            "reading": "このへやはとてもきれいです。",
            "romaji": "Kono heya wa totemo kirei desu.",
            "vi": "Căn phòng này rất sạch."
          }
        ],
        "note": "あまり và ぜんぜん không đứng một mình với tính từ khẳng định.",
        "id": "4_5",
        "structure_jp": "とても / あまり / すこし / ぜんぜん",
        "structure_vi": "Rất, không… lắm, một chút, hoàn toàn không",
        "chips": [
          "とても",
          "あまり",
          "すこし",
          "ぜんぜん"
        ],
        "formula": "とても và すこし đi với câu khẳng định. あまり và ぜんぜん đi với câu phủ định.",
        "explanation": "Bốn từ chỉ mức độ đứng trước tính từ hoặc động từ",
        "usage": "とてもおいしい là rất ngon. あまりおいしくない là không ngon lắm. ぜんぜん寒くない là hoàn toàn không lạnh."
      },
      {
        "color": "#ffd700",
        "examples": [
          {
            "jp": "この店は安いですが、あまりおいしくないです。",
            "reading": "このみせはやすいですが、あまりおいしくないです。",
            "romaji": "Kono mise wa yasui desu ga, amari oishikunai desu.",
            "vi": "Quán này rẻ, nhưng không ngon lắm."
          },
          {
            "jp": "部屋は小さいです。しかし、きれいです。",
            "reading": "へやはちいさいです。しかし、きれいです。",
            "romaji": "Heya wa chiisai desu. Shikashi, kirei desu.",
            "vi": "Phòng nhỏ. Tuy nhiên, sạch."
          },
          {
            "jp": "朝ごはんを食べます。そして、学校へ行きます。",
            "reading": "あさごはんをたべます。そして、がっこうへいきます。",
            "romaji": "Asagohan o tabemasu. Soshite, gakkou e ikimasu.",
            "vi": "Tôi ăn sáng. Rồi đi đến trường."
          },
          {
            "jp": "天気はいいですが、風が強いです。",
            "reading": "てんきはいいですが、かぜがつよいです。",
            "romaji": "Tenki wa ii desu ga, kaze ga tsuyoi desu.",
            "vi": "Trời đẹp, nhưng gió mạnh."
          },
          {
            "jp": "本を読みます。そして、寝ます。",
            "reading": "ほんをよみます。そして、ねます。",
            "romaji": "Hon o yomimasu. Soshite, nemasu.",
            "vi": "Tôi đọc sách. Rồi đi ngủ."
          }
        ],
        "note": "Trước が, です giữ nguyên: 安いですが. Không nói 安いがです.",
        "id": "4_6",
        "structure_jp": "が / しかし / そして",
        "structure_vi": "Nhưng, và",
        "chips": [
          "が",
          "しかし",
          "そして"
        ],
        "formula": "が nối hai vế trong một câu. しかし và そして đứng đầu câu tiếp theo.",
        "explanation": "が và しかし là nhưng. そして là và, rồi thì",
        "usage": "Dùng が khi hai ý còn trong một câu. しかし tách thành câu mới, giọng mạnh hơn. そして thêm việc tiếp theo."
      },
      {
        "color": "#98fb98",
        "note": "Người và động vật dùng います, không dùng あります.",
        "id": "4_7",
        "structure_jp": "N にあります / N であります",
        "structure_vi": "Ở đâu có vật, ở đâu có sự kiện",
        "chips": [
          "に",
          "で",
          "あります"
        ],
        "formula": "Nơi + に + vật + があります. Nơi + で + sự kiện + があります.",
        "explanation": "に cho đồ vật và người. で cho sự kiện, tiệc, lễ hội",
        "usage": "部屋に本があります là trong phòng có sách. 大学でパーティーがあります là ở trường có tiệc.",
        "examples": [
          {
            "jp": "私の町にきれいな川があります。",
            "reading": "わたしのまちにきれいかわがあります。",
            "romaji": "Watashi no machi ni kirei na kawa ga arimasu.",
            "vi": "Ở thành phố của tôi có một con sông đẹp."
          },
          {
            "jp": "大学でパーティーがあります。",
            "reading": "だいがくでパーティーがあります。",
            "romaji": "Daigaku de paatii ga arimasu.",
            "vi": "Ở trường có một buổi tiệc."
          },
          {
            "jp": "日本でお祭りがあります。",
            "reading": "にほんでおまつりがあります。",
            "romaji": "Nihon de omaturi ga arimasu.",
            "vi": "Ở Nhật có lễ hội."
          },
          {
            "jp": "机の上に本があります。",
            "reading": "つくえのうえにほんがあります。",
            "romaji": "Tsukue no ue ni hon ga arimasu.",
            "vi": "Trên bàn có sách."
          },
          {
            "jp": "部屋に猫がいます。",
            "reading": "へやにねこがいます。",
            "romaji": "Heya ni neko ga imasu.",
            "vi": "Trong phòng có một con mèo."
          }
        ]
      },
      {
        "color": "#dda0dd",
        "note": "Phương tiện đi bằng で: 飛行機で、電車で、歩いて.",
        "id": "4_8",
        "structure_jp": "から〜まで どのくらいですか",
        "structure_vi": "Từ… đến… mất bao lâu",
        "chips": [
          "どのくらい",
          "かかります"
        ],
        "formula": "Nơi + から + nơi + まで + phương tiện で + どのくらいですか.",
        "explanation": "Hỏi thời gian hoặc khoảng cách của một chặng",
        "usage": "Trả lời bằng khoảng thời gian + です, hoặc + かかります.",
        "examples": [
          {
            "jp": "ホーチミンからハノイまで飛行機でどのくらいですか。",
            "reading": "ホーチミンからハノイまでひこうきでどのくらいですか。",
            "romaji": "Hoochimin kara Hanoi made hikouki de dono kurai desu ka.",
            "vi": "Từ Thành phố Hồ Chí Minh đến Hà Nội bằng máy bay mất bao lâu?"
          },
          {
            "jp": "大阪から京都まで電車で30分ぐらいです。",
            "reading": "おおさかからきょうとまででんしゃでさんじゅっぷんぐらいです。",
            "romaji": "Oosaka kara Kyouto made densha de sanjuppun gurai desu.",
            "vi": "Từ Osaka đến Kyoto bằng tàu điện khoảng 30 phút."
          },
          {
            "jp": "うちから学校まで歩いて20分かかります。",
            "reading": "うちからがっこうまであるいてにじゅっぷんかかります。",
            "romaji": "Uchi kara gakkou made aruite nijuppun kakarimasu.",
            "vi": "Từ nhà đến trường đi bộ mất 20 phút."
          },
          {
            "jp": "どのくらいかかりますか。",
            "reading": "どのくらいかかりますか。",
            "romaji": "Dono kurai kakarimasu ka.",
            "vi": "Mất khoảng bao lâu?"
          },
          {
            "jp": "バスで1時間ぐらいです。",
            "reading": "バスでいちじかんぐらいです。",
            "romaji": "Basu de ichijikan gurai desu.",
            "vi": "Đi xe buýt khoảng một tiếng."
          }
        ]
      },
      {
        "color": "#ffb6c1",
        "note": "でも không đứng giữa câu. Giữa câu dùng が.",
        "id": "4_9",
        "structure_jp": "でも / それから",
        "structure_vi": "Nhưng, sau đó",
        "chips": [
          "でも",
          "それから"
        ],
        "formula": "Câu 1。でも Câu 2. Câu 1。それから Câu 2.",
        "explanation": "でも là nhưng khi nói. それから là sau đó",
        "usage": "でも đứng đầu câu sau, giống しかし nhưng thân mật hơn. それから kể việc xảy ra tiếp.",
        "examples": [
          {
            "jp": "雨です。でも、行きます。",
            "reading": "あめです。でも、いきます。",
            "romaji": "Ame desu. Demo, ikimasu.",
            "vi": "Trời mưa. Nhưng tôi vẫn đi."
          },
          {
            "jp": "きのう映画を見ました。それから、食事をしました。",
            "reading": "きのうえいがをみました。それから、しょくじをしました。",
            "romaji": "Kinou eiga o mimashita. Sorekara, shokuji o shimashita.",
            "vi": "Hôm qua tôi xem phim. Sau đó tôi đi ăn."
          },
          {
            "jp": "高いです。でも、きれいです。",
            "reading": "たかいです。でも、きれいです。",
            "romaji": "Takai desu. Demo, kirei desu.",
            "vi": "Đắt. Nhưng đẹp."
          },
          {
            "jp": "勉強します。それから、寝ます。",
            "reading": "べんきょうします。それから、ねます。",
            "romaji": "Benkyou shimasu. Sorekara, nemasu.",
            "vi": "Tôi học. Sau đó đi ngủ."
          },
          {
            "jp": "忙しいです。でも、行きます。",
            "reading": "いそがしいです。でも、いきます。",
            "romaji": "Isogashii desu. Demo, ikimasu.",
            "vi": "Tôi bận. Nhưng tôi vẫn đi."
          }
        ]
      }
    ]
  },
  {
    "id": "5",
    "title": "Bài 5: Quá khứ, mong muốn và mục đích",
    "subtitle": "JPD123 – Bài 5",
    "description": "Nói việc đã làm, tính từ ở quá khứ, vì sao, đi cùng ai, muốn có và muốn làm.",
    "points": [
      {
        "color": "#ffb6c1",
        "examples": [
          {
            "jp": "パソコンがほしいです。",
            "reading": "パソコンがほしいです。",
            "romaji": "Pasokon ga hoshii desu.",
            "vi": "Tôi muốn có máy tính."
          },
          {
            "jp": "新しい車がほしいです。",
            "reading": "あたらしいくるまがほしいです。",
            "romaji": "Atarashii kuruma ga hoshii desu.",
            "vi": "Tôi muốn có một chiếc xe mới."
          },
          {
            "jp": "時間がほしいです。",
            "reading": "じかんがほしいです。",
            "romaji": "Jikan ga hoshii desu.",
            "vi": "Tôi muốn có thời gian."
          },
          {
            "jp": "水がほしいです。",
            "reading": "みずがほしいです。",
            "romaji": "Mizu ga hoshii desu.",
            "vi": "Tôi muốn có nước."
          },
          {
            "jp": "きれいな花がほしいです。",
            "reading": "きれいなはながほしいです。",
            "romaji": "Kirei na hana ga hoshii desu.",
            "vi": "Tôi muốn có hoa đẹp."
          }
        ],
        "note": "Vật được muốn đi với が, không dùng を. Phủ định là ほしくないです.",
        "id": "5_1",
        "structure_jp": "N が ほしいです",
        "structure_vi": "Tôi muốn có N",
        "chips": [
          "N",
          "が",
          "ほしい"
        ],
        "formula": "Danh từ + が + ほしいです. ほしい chia như tính từ đuôi い.",
        "explanation": "Muốn sở hữu một vật, không phải muốn làm một hành động",
        "usage": "パソコンがほしいです là tôi muốn có máy tính."
      },
      {
        "color": "#ffd700",
        "examples": [
          {
            "jp": "日本へ行きたいです。",
            "reading": "にほんへいきたいです。",
            "romaji": "Nihon e ikitai desu.",
            "vi": "Tôi muốn đi Nhật Bản."
          },
          {
            "jp": "すしを食べたいです。",
            "reading": "すしをたべたいです。",
            "romaji": "Sushi o tabetai desu.",
            "vi": "Tôi muốn ăn sushi."
          },
          {
            "jp": "日本語を勉強したいです。",
            "reading": "にほんごをべんきょうしたいです。",
            "romaji": "Nihongo o benkyou shitai desu.",
            "vi": "Tôi muốn học tiếng Nhật."
          },
          {
            "jp": "映画を見たいです。",
            "reading": "えいがをみたいです。",
            "romaji": "Eiga o mitai desu.",
            "vi": "Tôi muốn xem phim."
          },
          {
            "jp": "早く帰りたいです。",
            "reading": "はやくかえりたいです。",
            "romaji": "Hayaku kaeritai desu.",
            "vi": "Tôi muốn về sớm."
          }
        ],
        "note": "Không dùng ほしい cho động từ. 食べたいです, không phải 食べることがほしいです.",
        "id": "5_2",
        "structure_jp": "V たいです",
        "structure_vi": "Tôi muốn làm V",
        "chips": [
          "V",
          "たい"
        ],
        "formula": "Bỏ ます, thêm たいです. たい chia như tính từ đuôi い: たくない、たかった.",
        "explanation": "Muốn thực hiện một hành động",
        "usage": "行きます → 行きたいです. 日本へ行きたいです là tôi muốn đi Nhật Bản."
      },
      {
        "color": "#98fb98",
        "examples": [
          {
            "jp": "映画を見に行きます。",
            "reading": "えいがをみにいきます。",
            "romaji": "Eiga o mi ni ikimasu.",
            "vi": "Tôi đi xem phim."
          },
          {
            "jp": "買い物に行きます。",
            "reading": "かいものにいきます。",
            "romaji": "Kaimono ni ikimasu.",
            "vi": "Tôi đi mua sắm."
          },
          {
            "jp": "日本語を勉強しに来ました。",
            "reading": "にほんごをべんきょうしにきました。",
            "romaji": "Nihongo o benkyou shi ni kimashita.",
            "vi": "Tôi đã đến để học tiếng Nhật."
          },
          {
            "jp": "昼ごはんを食べに帰ります。",
            "reading": "ひるごはんをたべにかえります。",
            "romaji": "Hirugohan o tabe ni kaerimasu.",
            "vi": "Tôi về để ăn trưa."
          },
          {
            "jp": "友達に会いに行きます。",
            "reading": "ともだちにあいにいきます。",
            "romaji": "Tomodachi ni ai ni ikimasu.",
            "vi": "Tôi đi gặp bạn."
          }
        ],
        "note": "Chỉ dùng với động từ di chuyển. Không nói 映画を見に食べます.",
        "id": "5_3",
        "structure_jp": "V / N に 行きます",
        "structure_vi": "Đi, đến, về để làm gì",
        "chips": [
          "に",
          "行きます",
          "来ます",
          "帰ります"
        ],
        "formula": "Bỏ ます rồi thêm に, hoặc danh từ mục đích + に, rồi 行きます / 来ます / 帰ります.",
        "explanation": "Nói mục đích của việc di chuyển",
        "usage": "見ます → 見に行きます. 映画を見に行きます là tôi đi xem phim. Danh từ thì 買い物に行きます."
      },
      {
        "color": "#dda0dd",
        "note": "Câu hỏi: Vましたか. Trả lời はい、Vました / いいえ、Vませんでした.",
        "id": "5_4",
        "structure_jp": "Vました / Vませんでした",
        "structure_vi": "Đã làm / đã không làm",
        "chips": [
          "ました",
          "ませんでした"
        ],
        "formula": "Đổi ます thành ました để khẳng định quá khứ. Đổi thành ませんでした để phủ định quá khứ.",
        "explanation": "Thì quá khứ lịch sự của động từ",
        "usage": "行きました là đã đi. 行きませんでした là đã không đi.",
        "examples": [
          {
            "jp": "おととい、新宿へ行きました。",
            "reading": "おととい、しんじゅくへいきました。",
            "romaji": "Ototoi, Shinjuku e ikimashita.",
            "vi": "Hôm kia tôi đã đi Shinjuku."
          },
          {
            "jp": "きのう、勉強しませんでした。",
            "reading": "きのう、べんきょうしませんでした。",
            "romaji": "Kinou, benkyou shimasen deshita.",
            "vi": "Hôm qua tôi đã không học."
          },
          {
            "jp": "朝ごはんを食べましたか。",
            "reading": "あさごはんをたべましたか。",
            "romaji": "Asagohan o tabemashita ka.",
            "vi": "Bạn đã ăn sáng chưa?"
          },
          {
            "jp": "いいえ、食べませんでした。",
            "reading": "いいえ、たべませんでした。",
            "romaji": "Iie, tabemasen deshita.",
            "vi": "Không, tôi đã không ăn."
          },
          {
            "jp": "先週、国へ帰りました。",
            "reading": "せんしゅう、くにへかえりました。",
            "romaji": "Senshuu, kuni e kaerimashita.",
            "vi": "Tuần trước tôi đã về nước."
          }
        ]
      },
      {
        "color": "#ffb6c1",
        "note": "Không nói かったくない. Phủ định quá khứ của đuôi い là くなかった. いい thành よかった / よくなかった.",
        "id": "5_5",
        "structure_jp": "Aかったです / Aくなかったです",
        "structure_vi": "Đã… / đã không…",
        "chips": [
          "かった",
          "くなかった",
          "でした"
        ],
        "formula": "Đuôi い: bỏ い, quá khứ かったです, phủ định quá khứ くなかったです. Đuôi な: でした / じゃありませんでした.",
        "explanation": "Tính từ ở thì quá khứ",
        "usage": "暑かったです là đã nóng. 難しくなかったです là đã không khó.",
        "examples": [
          {
            "jp": "きのうは暑かったです。",
            "reading": "きのうはあつかったです。",
            "romaji": "Kinou wa atsukatta desu.",
            "vi": "Hôm qua đã nóng."
          },
          {
            "jp": "テストは難しくなかったです。",
            "reading": "テストはむずかしくなかったです。",
            "romaji": "Tesuto wa muzukashikunakatta desu.",
            "vi": "Bài kiểm tra đã không khó."
          },
          {
            "jp": "映画はよかったです。",
            "reading": "えいがはよかったです。",
            "romaji": "Eiga wa yokatta desu.",
            "vi": "Bộ phim đã hay."
          },
          {
            "jp": "部屋はきれいでした。",
            "reading": "へやはきれいでした。",
            "romaji": "Heya wa kirei deshita.",
            "vi": "Phòng đã sạch."
          },
          {
            "jp": "あまり有名じゃありませんでした。",
            "reading": "あまりゆうめいじゃありませんでした。",
            "romaji": "Amari yuumei ja arimasen deshita.",
            "vi": "Đã không nổi tiếng cho lắm."
          }
        ]
      },
      {
        "color": "#ffd700",
        "note": "Câu hỏi ở quá khứ thì lý do cũng ở quá khứ. 何も chỉ đi với thể phủ định.",
        "id": "5_6",
        "structure_jp": "どうして…か。…から。",
        "structure_vi": "Vì sao? Vì…",
        "chips": [
          "どうして",
          "から"
        ],
        "formula": "Hỏi: どうして + câu + か. Trả lời: lý do + から.",
        "explanation": "から đứng sau lý do, không đứng đầu câu như vì",
        "usage": "どうして食べませんでしたか. Trả lời 忙しかったですから.",
        "examples": [
          {
            "jp": "どうして朝、何も食べませんでしたか。",
            "reading": "どうしてあさ、なにもたべませんでしたか。",
            "romaji": "Doushite asa, nani mo tabemasen deshita ka.",
            "vi": "Vì sao sáng nay bạn đã không ăn gì?"
          },
          {
            "jp": "忙しかったですから。",
            "reading": "いそがしかったですから。",
            "romaji": "Isogashikatta desu kara.",
            "vi": "Vì lúc đó tôi bận."
          },
          {
            "jp": "どうして行きませんか。",
            "reading": "どうしていきませんか。",
            "romaji": "Doushite ikimasen ka.",
            "vi": "Vì sao bạn không đi?"
          },
          {
            "jp": "雨ですから。",
            "reading": "あめですから。",
            "romaji": "Ame desu kara.",
            "vi": "Vì trời mưa."
          },
          {
            "jp": "疲れましたから、帰ります。",
            "reading": "つかれましたから、かえります。",
            "romaji": "Tsukaremashita kara, kaerimasu.",
            "vi": "Vì tôi mệt rồi, tôi về."
          }
        ]
      },
      {
        "color": "#98fb98",
        "note": "と giữa hai danh từ nghĩa là và. と trước động từ nghĩa là cùng với.",
        "id": "5_7",
        "structure_jp": "N と Vます",
        "structure_vi": "Làm cùng với N",
        "chips": [
          "と",
          "誰と"
        ],
        "formula": "Người + と + động từ. Hỏi bằng 誰と.",
        "explanation": "と trước động từ nghĩa là cùng với",
        "usage": "友達とサッカーをします là chơi bóng cùng bạn.",
        "examples": [
          {
            "jp": "週末、友達とサッカーをします。",
            "reading": "しゅうまつ、ともだちとサッカーをします。",
            "romaji": "Shuumatsu, tomodachi to sakkaa o shimasu.",
            "vi": "Cuối tuần tôi đá bóng cùng bạn."
          },
          {
            "jp": "先週、家族とレストランへ行きました。",
            "reading": "せんしゅう、かぞくとレストランへいきました。",
            "romaji": "Senshuu, kazoku to resutoran e ikimashita.",
            "vi": "Tuần trước tôi đã đi nhà hàng cùng gia đình."
          },
          {
            "jp": "誰と行きますか。",
            "reading": "だれといきますか。",
            "romaji": "Dare to ikimasu ka.",
            "vi": "Bạn đi cùng ai?"
          },
          {
            "jp": "一人で勉強します。",
            "reading": "ひとりでべんきょうします。",
            "romaji": "Hitori de benkyou shimasu.",
            "vi": "Tôi học một mình."
          },
          {
            "jp": "恋人と映画を見ました。",
            "reading": "こいびととえいがをみました。",
            "romaji": "Koibito to eiga o mimashita.",
            "vi": "Tôi đã xem phim cùng người yêu."
          }
        ]
      }
    ]
  },
  {
    "id": "6",
    "title": "Bài 6: So sánh, Rủ rê & Sự kiện, Lượng từ",
    "subtitle": "JPD123 – Bài 6",
    "description": "Hỏi cái nào hơn, so sánh hơn/kém, rủ rê và đáp lại (từ chối khéo kèm lý do), nơi diễn ra sự kiện và đếm vật mỏng.",
    "points": [
      {
        "color": "#ffb6c1",
        "examples": [
          {
            "jp": "日本語は英語より難しいです。",
            "reading": "にほんごはえいごよりむずかしいです。",
            "romaji": "Nihongo wa eigo yori muzukashii desu.",
            "vi": "Tiếng Nhật khó hơn tiếng Anh."
          },
          {
            "jp": "東京は大阪より大きいです。",
            "reading": "とうきょうはおおさかよりおおきいです。",
            "romaji": "Toukyou wa Oosaka yori ookii desu.",
            "vi": "Tokyo lớn hơn Osaka."
          },
          {
            "jp": "電車はバスより速いです。",
            "reading": "でんしゃはバスよりはやいです。",
            "romaji": "Densha wa basu yori hayai desu.",
            "vi": "Tàu điện nhanh hơn xe buýt."
          },
          {
            "jp": "夏は冬より暑いです。",
            "reading": "なつはふゆよりあついです。",
            "romaji": "Natsu wa fuyu yori atsui desu.",
            "vi": "Mùa hè nóng hơn mùa đông."
          },
          {
            "jp": "この店はあの店より安いです。",
            "reading": "このみせはあのみせよりやすいです。",
            "romaji": "Kono mise wa ano mise yori yasui desu.",
            "vi": "Quán này rẻ hơn quán kia."
          }
        ],
        "note": "より đứng ngay sau cái làm mốc, không đứng sau tính từ.",
        "id": "6_1",
        "structure_jp": "A は B より Adj です",
        "structure_vi": "A hơn B",
        "chips": [
          "A",
          "B",
          "より"
        ],
        "formula": "A + は + B + より + tính từ + です. B là mốc so sánh.",
        "explanation": "So sánh hơn giữa hai đối tượng",
        "usage": "日本語は英語より難しいです là tiếng Nhật khó hơn tiếng Anh."
      },
      {
        "color": "#ffd700",
        "examples": [
          {
            "jp": "英語は日本語ほど難しくないです。",
            "reading": "えいごはにほんごほどむずかしくないです。",
            "romaji": "Eigo wa nihongo hodo muzukashikunai desu.",
            "vi": "Tiếng Anh không khó bằng tiếng Nhật."
          },
          {
            "jp": "大阪は東京ほど大きくないです。",
            "reading": "おおさかはとうきょうほどおおきくないです。",
            "romaji": "Oosaka wa Toukyou hodo ookikunai desu.",
            "vi": "Osaka không lớn bằng Tokyo."
          },
          {
            "jp": "バスは電車ほど速くないです。",
            "reading": "バスはでんしゃほどはやくないです。",
            "romaji": "Basu wa densha hodo hayakunai desu.",
            "vi": "Xe buýt không nhanh bằng tàu điện."
          },
          {
            "jp": "今日はきのうほど寒くないです。",
            "reading": "きょうはきのうほどさむくないです。",
            "romaji": "Kyou wa kinou hodo samukunai desu.",
            "vi": "Hôm nay không lạnh bằng hôm qua."
          },
          {
            "jp": "この本はあの本ほどおもしろくないです。",
            "reading": "このほんはあのほんほどおもしろくないです。",
            "romaji": "Kono hon wa ano hon hodo omoshirokunai desu.",
            "vi": "Quyển này không hay bằng quyển kia."
          }
        ],
        "note": "Tính từ phải ở thể phủ định: 難しくない、大きくない、好きじゃない.",
        "id": "6_2",
        "structure_jp": "A は B ほど Adj ない",
        "structure_vi": "A không bằng B",
        "chips": [
          "A",
          "B",
          "ほど"
        ],
        "formula": "A + は + B + ほど + tính từ thể phủ định. ほど không đi với câu khẳng định.",
        "explanation": "So sánh kém, A không đạt tới mức của B",
        "usage": "英語は日本語ほど難しくないです là tiếng Anh không khó bằng tiếng Nhật."
      },
      {
        "color": "#98fb98",
        "examples": [
          {
            "jp": "一年で八月がいちばん暑いです。",
            "reading": "いちねんで はちがつがいちばんあついです。",
            "romaji": "Ichinen de hachigatsu ga ichiban atsui desu.",
            "vi": "Trong một năm, tháng 8 nóng nhất."
          },
          {
            "jp": "クラスのなかで田中さんがいちばん若いです。",
            "reading": "クラスのなかでたなかさんがいちばんわかいです。",
            "romaji": "Kurasu no naka de Tanaka-san ga ichiban wakai desu.",
            "vi": "Trong lớp, anh Tanaka trẻ nhất."
          },
          {
            "jp": "日本で富士山がいちばん高いです。",
            "reading": "にほんでふじさんがいちばんたかいです。",
            "romaji": "Nihon de Fujisan ga ichiban takai desu.",
            "vi": "Ở Nhật, núi Phú Sĩ cao nhất."
          },
          {
            "jp": "この三つでこれが一番安いです。",
            "reading": "このみっつでこれがいちばんやすいです。",
            "romaji": "Kono mittsu de kore ga ichiban yasui desu.",
            "vi": "Trong ba cái này, cái này rẻ nhất."
          },
          {
            "jp": "季節のなかで春がいちばん暖かいです。",
            "reading": "きせつのなかではるがいちばんあたたかいです。",
            "romaji": "Kisetsu no naka de haru ga ichiban atatakai desu.",
            "vi": "Trong các mùa, mùa xuân ấm nhất."
          }
        ],
        "note": "Cái nhất dùng trợ từ が, không dùng は. のなかで nêu nhóm đang so.",
        "id": "6_3",
        "structure_jp": "N のなかで A がいちばん Adj",
        "structure_vi": "Trong N, A là nhất",
        "chips": [
          "のなかで",
          "が",
          "いちばん"
        ],
        "formula": "Phạm vi + のなかで / で + cái nhất + が + いちばん + tính từ + です.",
        "explanation": "So sánh nhất trong một nhóm",
        "usage": "一年で八月がいちばん暑いです là trong một năm, tháng 8 nóng nhất."
      },
      {
        "color": "#dda0dd",
        "note": "Câu trả lời dùng のほうが, không lặp lại どちら.",
        "id": "6_4",
        "structure_jp": "N1 と N2 と どちらが A ですか",
        "structure_vi": "N1 và N2, cái nào hơn?",
        "chips": [
          "どちら",
          "のほうが"
        ],
        "formula": "N1 と N2 と どちらが + tính từ + ですか. Trả lời: N のほうが + tính từ + です.",
        "explanation": "Hỏi cái nào hơn trong hai thứ",
        "usage": "夏と冬とどちらが暑いですか. Trả lời 夏のほうが暑いです.",
        "examples": [
          {
            "jp": "サッカーとテニスとどちらが好きですか。",
            "reading": "サッカーとテニスとどちらがすきですか。",
            "romaji": "Sakkaa to tenisu to dochira ga suki desu ka.",
            "vi": "Bóng đá và quần vợt, bạn thích môn nào hơn?"
          },
          {
            "jp": "夏と冬とどちらが暑いですか。",
            "reading": "なつとふゆとどちらがあついですか。",
            "romaji": "Natsu to fuyu to dochira ga atsui desu ka.",
            "vi": "Mùa hè và mùa đông, mùa nào nóng hơn?"
          },
          {
            "jp": "夏のほうが暑いです。",
            "reading": "なつのほうがあついです。",
            "romaji": "Natsu no hou ga atsui desu.",
            "vi": "Mùa hè nóng hơn."
          },
          {
            "jp": "バスと電車とどちらが速いですか。",
            "reading": "バスとでんしゃとどちらがはやいですか。",
            "romaji": "Basu to densha to dochira ga hayai desu ka.",
            "vi": "Xe buýt và tàu điện, cái nào nhanh hơn?"
          },
          {
            "jp": "電車のほうが速いです。",
            "reading": "でんしゃのほうがはやいです。",
            "romaji": "Densha no hou ga hayai desu.",
            "vi": "Tàu điện nhanh hơn."
          }
        ]
      },
      {
        "color": "#ffb6c1",
        "examples": [
          {
            "jp": "日曜日、いっしょに映画を見に行きませんか。",
            "reading": "にちようび、いっしょにえいがをみにいきませんか。",
            "romaji": "Nichiyoubi, isshoni eiga o mi ni ikimasen ka.",
            "vi": "Chủ nhật này cùng đi xem phim với tôi không?"
          },
          {
            "jp": "すみません。日曜日はちょっと… 約束がありますから。",
            "reading": "すみません。にちようびはちょっと… やくそくがありますから。",
            "romaji": "Sumimasen. Nichiyoubi wa chotto... Yakusoku ga arimasu kara.",
            "vi": "Xin lỗi. Chủ nhật thì hơi... Vì tôi có hẹn rồi."
          },
          {
            "jp": "いっしょにお茶を飲みませんか。",
            "reading": "いっしょにおちゃをのみませんか。",
            "romaji": "Isshoni ocha o nomimasen ka.",
            "vi": "Cùng đi uống trà với tôi nhé?"
          },
          {
            "jp": "ええ、飲みましょう。",
            "reading": "ええ、のみましょう。",
            "romaji": "Ee, nomimashou.",
            "vi": "Vâng, chúng ta cùng uống nhé."
          },
          {
            "jp": "あした、テニスをしませんか。すみません、用事がありますから。",
            "reading": "あした、テニスをしませんか。すみません、ようじがありますから。",
            "romaji": "Ashita, tenisu o shimasen ka. Sumimasen, youji ga arimasu kara.",
            "vi": "Ngày mai chơi tennis nhé? - Xin lỗi, vì tôi có việc bận rồi."
          }
        ],
        "note": "Mẫu 〜はちょっと… là cách từ chối khéo léo và tế nhị rất phổ biến của người Nhật. Vế sau dùng「N がありますから」để đưa ra lý do chính đáng.",
        "id": "6_5",
        "structure_jp": "〜はちょっと… / 〜がありますから",
        "structure_vi": "Rủ rê, Đồng ý và Từ chối khéo kèm lý do",
        "chips": [
          "Vませんか",
          "Vましょう",
          "〜はちょっと",
          "〜から"
        ],
        "formula": "Rủ rê: いっしょに Vませんか。 Đồng ý: ええ、Vましょう。 Từ chối khéo: すみません、〜はちょっと…。 Nêu lý do: [N/Lý do] がありますから。",
        "explanation": "Mở rộng nhóm câu mời rủ: cách rủ rê cùng làm gì, cách đồng ý nhiệt tình và cách từ chối khéo léo kèm theo lý do cụ thể.",
        "usage": "Khi từ chối lời mời, người Nhật tránh nói thẳng「いいえ」mà dùng「すみません。〜はちょっと…」(Xin lỗi, việc đó thì hơi...) rồi giải thích lý do「やくそくがありますから」(Vì tôi có hẹn rồi)."
      },
      {
        "color": "#ffd700",
        "examples": [
          {
            "jp": "FPT大学でお祭りがあります。",
            "reading": "FPTだいがくでおまつりがあります。",
            "romaji": "FPT daigaku de omatsuri ga arimasu.",
            "vi": "Có lễ hội ở trường Đại học FPT."
          },
          {
            "jp": "あした、大学で日本語の試験があります。",
            "reading": "あした、だいがくでにほんごのしけんがあります。",
            "romaji": "Ashita, daigaku de nihongo no shiken ga arimasu.",
            "vi": "Ngày mai có kỳ thi tiếng Nhật ở trường đại học."
          },
          {
            "jp": "今晩、公園でパーティーがあります。",
            "reading": "こんばん、こうえんでパーティーがあります。",
            "romaji": "Konban, kouen de paatii ga arimasu.",
            "vi": "Tối nay có bữa tiệc ở công viên."
          },
          {
            "jp": "東京でサッカーの試合があります。",
            "reading": "とうきょうでサッカーのしあいがあります。",
            "romaji": "Toukyou de sakkaa no shiai ga arimasu.",
            "vi": "Ở Tokyo có trận thi đấu bóng đá."
          },
          {
            "jp": "日曜日、どこでコンサートがありますか。",
            "reading": "にちようび、どこでコンサートがありますか。",
            "romaji": "Nichiyoubi, doko de konsaato ga arimasu ka.",
            "vi": "Chủ nhật có buổi hòa nhạc ở đâu vậy?"
          }
        ],
        "note": "FPT大学でお祭りがあります (Có lễ hội ở FPT). Dùng で vì lễ hội là sự kiện/hoạt động diễn ra, không dùng に (vốn chỉ nơi tồn tại của đồ vật).",
        "id": "6_6",
        "structure_jp": "Địa điểm で N(sự kiện) が あります",
        "structure_vi": "Nơi diễn ra sự kiện, hoạt động",
        "chips": [
          "で",
          "イベント",
          "あります"
        ],
        "formula": "Địa điểm + で + N (sự kiện, hoạt động: lễ hội, tiệc, thi cử...) + があります",
        "explanation": "Dùng trợ từ で để chỉ địa điểm nơi diễn ra, tổ chức một sự kiện hoặc hoạt động.",
        "usage": "Khác với「Địa điểm に N があります」chỉ nơi tồn tại của đồ vật, khi danh từ là sự kiện (お祭り, 試験, パーティー, コンサート, 試合) thì phải dùng trợ từ で."
      },
      {
        "color": "#98fb98",
        "examples": [
          {
            "jp": "私の部屋にCDが1まいあります。",
            "reading": "わたしのへやにCDがいちまいあります。",
            "romaji": "Watashi no heya ni shiidii ga ichimai arimasu.",
            "vi": "Trong phòng tôi có 1 cái đĩa CD."
          },
          {
            "jp": "デパートで白いシャツを2枚買いました。",
            "reading": "デパートでしろいシャツをにまいかいました。",
            "romaji": "Depaato de shiroi shatsu o nimai kaimashita.",
            "vi": "Tôi đã mua 2 chiếc áo sơ mi trắng ở trung tâm thương mại."
          },
          {
            "jp": "郵便局で84円の切手を5まい買いました。",
            "reading": "ゆうびんきょくではちじゅうよんえんのきってをごまいかいました。",
            "romaji": "Yuubinkyoku de hachijuuyonen no kitte o gomai kaimashita.",
            "vi": "Tôi đã mua 5 con tem 84 yên ở bưu điện."
          },
          {
            "jp": "映画のチケットが2枚ありますから、いっしょに行きませんか。",
            "reading": "えいがのチケットがにまいありますから、いっしょにいきませんか。",
            "romaji": "Eiga no chiketto ga nimai arimasu kara, isshoni ikimasen ka.",
            "vi": "Tôi có 2 vé xem phim, cùng đi với tôi không?"
          },
          {
            "jp": "この紙を3枚コピーしてください。",
            "reading": "このかみをさんまいコピーしてください。",
            "romaji": "Kono kami o sanmai kopii shite kudasai.",
            "vi": "Hãy photocopy 3 tờ giấy này giúp tôi."
          }
        ],
        "note": "Vật mỏng dẹt phẳng (áo sơ mi, đĩa CD, vé, tem, tờ giấy, bức ảnh) dùng lượng từ 枚 (まい). Đếm máy móc/xe cộ dùng 台 (だい), đếm vật dài dùng 本 (ほん).",
        "id": "6_7",
        "structure_jp": "N が / を 〜まい あります / 買いました",
        "structure_vi": "Đếm số lượng vật mỏng, dẹt (tờ, cái, chiếc, đĩa)",
        "chips": [
          "枚",
          "まい",
          "あります",
          "買いました"
        ],
        "formula": "Danh từ (vật mỏng, dẹt) + が / を + Số từ + 枚 (まい) + あります / 買いました / ください",
        "explanation": "Lượng từ「枚 (まい)」dùng để đếm các vật mỏng, phẳng như tờ giấy, cái áo sơ mi, đĩa CD, vé, tem, bưu thiếp, ảnh.",
        "usage": "CD が 1まい あります là tôi có 1 đĩa CD. シャツを 2まい 買いました là tôi đã mua 2 cái áo sơ mi. 切手を 5まい ください là cho tôi 5 con tem."
      }
    ]
  },
  {
    "id": "7",
    "title": "Bài 7: Động từ thể て và Mẫu câu giao tiếp",
    "subtitle": "JPD123 – Bài 7",
    "description": "Học về sự tồn tại của người và động vật (います), thể て (ください / います), đề nghị giúp đỡ (ましょうか) và cách làm (方).",
    "points": [
      {
        "id": "7_1",
        "structure_jp": "Vて: Chia động từ sang thể て (Nhóm 1, 2, 3)",
        "structure_vi": "Quy tắc chia động từ sang thể て",
        "chips": [
          "Chia động từ",
          "Nhóm 1",
          "Nhóm 2",
          "Nhóm 3",
          "Thể て"
        ],
        "formula": "• Nhóm 1: [う・つ・る] → って | [む・ぶ・ぬ] → んで | [く] → いて (Ngoại lệ: 行く→行って) | [ぐ] → いで | [す] → して\n• Nhóm 2: [Bỏ ます] + て (食べます→食べて, 見ます→見て)\n• Nhóm 3: します → して | 来ます (きます) → 来て (きて)",
        "explanation": "Thể て là dạng chia quan trọng nhất trong tiếng Nhật sơ cấp, dùng để nối các hành động theo thứ tự thời gian và làm nền tảng tạo thành các mẫu câu: yêu cầu (Vてください), thì tiếp diễn (Vています), xin phép (Vてもいいです), cấm chỉ (Vてはいけません).",
        "usage": "1. Nhóm 1: Động từ có âm trước ます thuộc hàng い (買い・立ち・帰り・飲み・呼び・書き・泳ぎ・話し) đổi theo quy tắc âm đệm.\n2. Nhóm 2: Động từ có âm trước ます thuộc hàng え hoặc một số động từ đặc biệt (見ます, います, 起きます, 借ります) bỏ ます thêm て.\n3. Nhóm 3: します → して, 来ます → 来て.",
        "note": "Ngoại lệ quan trọng nhất: 行きます (ikimasu) chia thành 行って (itte), KHÔNG chia là 行いて. Chú ý phân biệt động từ Nhóm 2 đặc biệt có đuôi âm [い] như 見ます, 起きます.",
        "color": "#ffb6c1",
        "examples": [
          {
            "jp": "手紙を書いて、郵便局へ行きます。",
            "reading": "てがみを かいて、ゆうびんきょくへ いきます。",
            "romaji": "Tegami o kaite, yuubinkyoku e ikimasu.",
            "vi": "Viết thư xong rồi đi đến bưu điện."
          },
          {
            "jp": "毎朝7時に起きて、朝ごはんを食べます。",
            "reading": "まいあさ しちじに おきて、あさごはんを たべます。",
            "romaji": "Maiasa shichiji ni okite, asagohan o tabemasu.",
            "vi": "Mỗi sáng tôi thức dậy lúc 7 giờ rồi ăn sáng."
          },
          {
            "jp": "友達に会って、映画を見ました。",
            "reading": "ともだちに あって、えいがを みました。",
            "romaji": "Tomodachi ni atte, eiga o mimashita.",
            "vi": "Tôi đã gặp bạn rồi xem phim."
          },
          {
            "jp": "図書館で本を借りて、家で読みます。",
            "reading": "としょかんで ほんを かりて、いえで よみます。",
            "romaji": "Toshokan de hon o karite, ie de yomimasu.",
            "vi": "Tôi mượn sách ở thư viện rồi đọc ở nhà."
          },
          {
            "jp": "急いで駅へ行って、電車に乗りました。",
            "reading": "いそいで えきへ いって、でんしゃに のりました。",
            "romaji": "Isoide eki e itte, densha ni norimashita.",
            "vi": "Tôi khẩn trương đi ra ga rồi lên tàu."
          }
        ]
      },
      {
        "id": "7_2",
        "structure_jp": "N1 に N2 (Người/Động vật) が います",
        "structure_vi": "Ở N1 có N2",
        "chips": [
          "N1",
          "に",
          "N2",
          "が",
          "います"
        ],
        "formula": "Địa điểm (N1) + に + Người/Động vật (N2) + が + います",
        "explanation": "Diễn tả sự hiện diện, tồn tại của người hoặc động vật tại một địa điểm cụ thể.",
        "usage": "Dùng います cho người và động vật (sinh vật cử động được), khác với あります dùng cho đồ vật, cây cối, sự kiện. Trợ từ に đi với nơi chốn, が đi với chủ thể.",
        "note": "Phủ định: いません (không có). Câu hỏi: N1 に だれ／なに が いますか。Đồ vật không dùng います mà dùng あります.",
        "color": "#ffb6c1",
        "examples": [
          {
            "jp": "庭に犬がいます。",
            "reading": "にわに いぬが います。",
            "romaji": "Niwa ni inu ga imasu.",
            "vi": "Ở trong sân có một con chó."
          },
          {
            "jp": "教室に先生と学生がいます。",
            "reading": "きょうしつに せんせいと がくせいが います。",
            "romaji": "Kyoushitsu ni sensei to gakusei ga imasu.",
            "vi": "Trong phòng học có giáo viên và sinh viên."
          },
          {
            "jp": "部屋に猫が2匹います。",
            "reading": "へやに ねこが にひき います。",
            "romaji": "Heya ni neko ga nihiki imasu.",
            "vi": "Trong phòng có 2 con mèo."
          },
          {
            "jp": "あそこに誰がいますか。田中さんがいます。",
            "reading": "あそこに だれが いますか。たなかさんが います。",
            "romaji": "Asoko ni dare ga imasu ka. Tanaka-san ga imasu.",
            "vi": "Ở đằng kia có ai thế? Có anh Tanaka."
          },
          {
            "jp": "公園に子供がたくさんいます。",
            "reading": "こうえんに こどもが たくさん います。",
            "romaji": "Kouen ni kodomo ga takusan imasu.",
            "vi": "Ở công viên có rất nhiều trẻ em."
          }
        ]
      },
      {
        "id": "7_3",
        "structure_jp": "Vて ください",
        "structure_vi": "Xin hãy V",
        "chips": [
          "Vて",
          "ください"
        ],
        "formula": "V (thể て) + ください",
        "explanation": "Dùng để yêu cầu, nhờ vả hoặc đề nghị ai đó làm việc gì một cách lịch sự.",
        "usage": "Chuyển động từ sang thể て rồi thêm ください. Nhóm 1: う・つ・る→って, む・ぶ・ぬ→んで, く→いて (行く→行って), ぐ→いで, す→して. Nhóm 2: bỏ る thêm て. Nhóm 3: する→して, 来る→来て.",
        "note": "Dùng để nhờ cậy hoặc chỉ dẫn một cách lịch sự. Khi muốn nhờ người trên hoặc cấp trên thì tránh dùng ください trực tiếp mà dùng mẫu lịch sự hơn.",
        "color": "#ffd700",
        "examples": [
          {
            "jp": "ちょっと待ってください。",
            "reading": "ちょっと まって ください。",
            "romaji": "Chotto matte kudasai.",
            "vi": "Xin vui lòng chờ một chút."
          },
          {
            "jp": "窓を開けてください。",
            "reading": "まどを あけて ください。",
            "romaji": "Mado o akete kudasai.",
            "vi": "Xin hãy mở cửa sổ giúp tôi."
          },
          {
            "jp": "ここに名前と住所を書いてください。",
            "reading": "ここに なまえと じゅうしょを かいて ください。",
            "romaji": "Koko ni namae to juusho o kaite kudasai.",
            "vi": "Xin hãy viết tên và địa chỉ vào đây."
          },
          {
            "jp": "日本語で話してください。",
            "reading": "にほんごで はなして ください。",
            "romaji": "Nihongo de hanashite kudasai.",
            "vi": "Xin hãy nói bằng tiếng Nhật."
          },
          {
            "jp": "この本を読んでください。",
            "reading": "このほんを よんで ください。",
            "romaji": "Kono hon o yonde kudasai.",
            "vi": "Xin hãy đọc quyển sách này."
          }
        ]
      },
      {
        "id": "7_4",
        "structure_jp": "Vて います (Thì tiếp diễn)",
        "structure_vi": "Thì tiếp diễn: Đang làm V",
        "chips": [
          "Vて います",
          "Thì tiếp diễn",
          "Đang làm gì",
          "Trạng thái",
          "Phủ định Vていません"
        ],
        "formula": "• Khẳng định: V[thể て] + います (Đang làm...)\n• Phủ định: V[thể て] + いません (Đang không làm...)\n• Câu hỏi: 今、何をしていますか。(Bây giờ bạn đang làm gì?)",
        "explanation": "Thì hiện tại tiếp diễn (Vて います) dùng để diễn tả một hành động đang trực tiếp diễn ra tại thời điểm nói. Ngoài ra, cấu trúc này còn dùng để diễn tả trạng thái kéo dài là kết quả của hành động trước đó, hoặc thói quen, nghề nghiệp duy trì thường xuyên.",
        "usage": "1. Hành động đang xảy ra: 今、日本語を勉強しています (Bây giờ tôi đang học tiếng Nhật); 外で雨が降っています (Bên ngoài trời đang mưa).\n2. Câu hỏi tiếp diễn: A: 今、何をしていますか。B: テレビを見ています。(A: Bây giờ bạn đang làm gì? B: Tôi đang xem tivi).\n3. Phủ định tiếp diễn: 今、ゲームをしていません。勉強しています。(Bây giờ tôi không chơi game, tôi đang học bài).\n4. Trạng thái tiếp diễn / kết quả: 田中さんは結婚しています (Anh Tanaka đã kết hôn); ハノイに住んでいます (Đang sống ở Hà Nội).",
        "note": "Phủ định của Vています là Vていません (không dùng Vてじゃありません/Vてではありません). Trong văn nói giao tiếp thân mật của người Nhật, âm [い] thường được lược bỏ: 勉強してる (benkyou shiteru).",
        "color": "#98fb98",
        "examples": [
          {
            "jp": "今、日本語を勉強しています。",
            "reading": "いま、にほんごを べんきょうして います。",
            "romaji": "Ima, nihongo o benkyou shite imasu.",
            "vi": "Bây giờ tôi đang học tiếng Nhật."
          },
          {
            "jp": "外で雨が降っています。",
            "reading": "そとで あめが ふって います。",
            "romaji": "Soto de ame ga futte imasu.",
            "vi": "Bên ngoài trời đang mưa."
          },
          {
            "jp": "A：今、何をしていますか。B：本を読んでいます。",
            "reading": "A：いま、なにを して いますか。B：ほんを よんで います。",
            "romaji": "A: Ima, nani o shite imasu ka. B: Hon o yonde imasu.",
            "vi": "A: Bây giờ bạn đang làm gì? B: Tôi đang đọc sách."
          },
          {
            "jp": "田中さんは電話をかけています。",
            "reading": "たなかさんは でんわを かけて います。",
            "romaji": "Tanaka-san wa denwa o kakete imasu.",
            "vi": "Anh Tanaka đang gọi điện thoại."
          },
          {
            "jp": "母は台所で料理を作っています。",
            "reading": "ははは だいどころで りょうりを つくって います。",
            "romaji": "Haha wa daidokoro de ryouri o tsukutte imasu.",
            "vi": "Mẹ tôi đang nấu ăn trong bếp."
          },
          {
            "jp": "今、ゲームをしていません。勉強しています。",
            "reading": "いま、ゲームを して いません。べんきょうして います。",
            "romaji": "Ima, geemu o shite imasen. Benkyou shite imasu.",
            "vi": "Bây giờ tôi không chơi game, tôi đang học bài."
          }
        ]
      },
      {
        "id": "7_5",
        "structure_jp": "V ましょうか",
        "structure_vi": "Để tôi làm V nhé?",
        "chips": [
          "Vましょうか",
          "đề nghị giúp đỡ"
        ],
        "formula": "V (bỏ ます) + ましょうか",
        "explanation": "Người nói chủ động đề nghị làm một hành động nào đó để giúp đỡ cho người nghe.",
        "usage": "Đưa ra lời đề nghị giúp đỡ nhiệt tình. Đáp lại: đồng ý thì dùng「ええ、お願いします / すみません、お願いします」; từ chối khéo thì dùng「いいえ、けっこうです / 大丈夫です」.",
        "note": "Khác với「V ましょう」(Chúng ta cùng làm nhé),「V ましょうか」hàm ý người nói sẽ thực hiện hành động đó giúp đối phương.",
        "color": "#dda0dd",
        "examples": [
          {
            "jp": "荷物を持ちましょうか。",
            "reading": "にもつを もちましょうか。",
            "romaji": "Nimotsu o mochimashouka.",
            "vi": "Để tôi xách hành lý giúp bạn nhé?"
          },
          {
            "jp": "窓を閉めましょうか。",
            "reading": "まどを しめましょうか。",
            "romaji": "Mado o shimemashouka.",
            "vi": "Để tôi đóng cửa sổ giúp bạn nhé?"
          },
          {
            "jp": "手伝いましょうか。",
            "reading": "てつだいましょうか。",
            "romaji": "Tetsudaimashouka.",
            "vi": "Để tôi giúp bạn một tay nhé?"
          },
          {
            "jp": "エアコンをつけましょうか。",
            "reading": "エアコンを つけましょうか。",
            "romaji": "Eeakon o tsukemashouka.",
            "vi": "Để tôi bật điều hòa giúp bạn nhé?"
          },
          {
            "jp": "駅まで車で送りましょうか。",
            "reading": "えきまで くるまで おくりましょうか。",
            "romaji": "Eki made kuruma de okurimashouka.",
            "vi": "Để tôi lái xe chở bạn ra ga nhé?"
          }
        ]
      },
      {
        "id": "7_6",
        "structure_jp": "Vます かた",
        "structure_vi": "Cách V",
        "chips": [
          "Vます",
          "かた",
          "方"
        ],
        "formula": "[Danh từ] の + V (bỏ ます) + 方 (かた)",
        "explanation": "Biến động từ thành danh từ chỉ cách thức hoặc phương pháp thực hiện hành động.",
        "usage": "Bỏ ます thêm 方 (かた). Khi có tân ngữ phía trước đi với を, chuyển を thành の: 漢字を読みます → 漢字の読み方 (cách đọc chữ Hán). Toàn bộ cụm từ đóng vai trò như một danh từ.",
        "note": "方 trong cấu trúc này đọc là かた, không đọc là ほう.",
        "color": "#ffb6c1",
        "examples": [
          {
            "jp": "この漢字の読み方を教えてください。",
            "reading": "この かんじの よみかたを おしえて ください。",
            "romaji": "Kono kanji no yomikata o oshiete kudasai.",
            "vi": "Hãy chỉ cho tôi cách đọc chữ Hán này."
          },
          {
            "jp": "すしの作り方を習いました。",
            "reading": "すしの つくりかたを ならいました。",
            "romaji": "Sushi no tsukurikata o naraimashita.",
            "vi": "Tôi đã học cách làm món sushi."
          },
          {
            "jp": "パソコンの使い方を教えてください。",
            "reading": "パソコンの つかいかたを おしえて ください。",
            "romaji": "Pasokon no tsukaikata o oshiete kudasai.",
            "vi": "Hãy chỉ cho tôi cách sử dụng máy tính."
          },
          {
            "jp": "駅までの行き方が分かりません。",
            "reading": "えきまでの いきかたが わかりません。",
            "romaji": "Eki made no ikikata ga wakarimasen.",
            "vi": "Tôi không biết cách đi đến nhà ga."
          },
          {
            "jp": "お箸の持ち方を見せてください。",
            "reading": "おはしの もちかたを みせて ください。",
            "romaji": "Ohashi no mochikata o misete kudasai.",
            "vi": "Hãy cho tôi xem cách cầm đũa."
          }
        ]
      }
    ]
  }
];
