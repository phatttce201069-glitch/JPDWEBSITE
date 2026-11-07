# Đặc Tả Dịch Vụ Sinh Đề Thi Bằng AI (AI Exam Service Specification)

Tài liệu này giải thích chi tiết cơ chế hoạt động, prompt engineering, và các thuật toán kiểm duyệt của bộ sinh đề thi bằng trí tuệ nhân tạo (`src/lib/study/ai-service.ts`).

---

## 1. Cơ Chế Hoạt Động (Architecture)

Quy trình sinh đề thi gồm 4 tầng xử lý:

```text
[Yêu cầu người dùng (Tùy chọn bất kỳ bài nào: Bài 1 -> Bài 7+)]
                  │
                  ▼
         [Dynamic Lesson Outline & Prompt Engineering]
  - Trích xuất động ngữ pháp (grammar.ts), từ vựng (vocabulary.ts) và chữ Hán
  - Tự động thích ứng khi thêm bài học mới mà không cần sửa cứng mã nguồn
  - Mã muối ngẫu nhiên (Entropy Salt: `#HEXSEED`) tăng tối đa độ đa dạng câu hỏi
  - Thiết lập Negative Constraints (Cấm nghiêm ngặt bài chưa chọn)
                  │
                  ▼
         [Gọi mô hình xAI / Gemini / OpenAI / Groq]
  - Sinh mảng 30 câu hỏi dạng JSON thuần túy (10 Kanji, 10 Từ vựng, 10 Ngữ pháp)
  - Phân bổ bối cảnh thực tế (đời sống, trường học FPT, công sở, hội thoại)
                  │
                  ▼
      [Kiểm duyệt & Lọc bài nghiêm ngặt (Auditor)]
  - Kiểm tra cấu trúc câu, đáp án, giải thích chi tiết
  - Hàm `isQuestionAllowedForLessons` rà soát 100% nội dung bài chọn vs không chọn
  - Thuật toán bổ sung câu hỏi bù trừ nếu thiếu từ kho hạt giống đa dạng
  - Xáo trộn ngẫu nhiên toàn bộ 30 câu (không cố định 10 câu Kanji ở đầu)
                  │
                  ▼
          [Đề thi hoàn chỉnh 30 câu đa dạng]
```

---

## 2. Dynamic Lesson Outline (Cơ Chế Bắt Trúng Bài Động)

Hàm `getDynamicLessonOutline(bai)` tự động:
1. Duyệt dữ liệu ngữ pháp gốc từ `src/data/grammar.ts` để trích xuất cấu trúc câu, công thức, ví dụ mẫu.
2. Duyệt từ vựng từ `src/data/vocabulary.ts` lọc theo bài học để trích xuất toàn bộ từ vựng và Kanji thực tế.
3. Ghép vào System Prompt và User Prompt, giúp AI bám chính xác 100% vào nội dung bài được chọn kể cả khi mở rộng thêm bài học mới trong tương lai.

---

## 3. Ràng Buộc Âm Bản (Negative Constraints)

Để đảm bảo đề thi không xuất hiện kiến thức của bài học chưa được chọn:
- **Nếu không chọn Bài 1**: Cấm câu danh từ `N1 は N2 です/じゃありません`, quốc tịch, nghề nghiệp cơ bản.
- **Nếu không chọn Bài 2**: Cấm chỉ định từ `これ, それ, あれ`, `どこ, どちら`, hỏi giá `いくら`, `何階`, `をください`.
- **Nếu không chọn Bài 3**: Cấm thời gian `に`, nơi chốn `へ行きます`, `で`, `から〜まで`.
- **Nếu không chọn Bài 4**: Cấm tính từ chia quá khứ (`〜かった, 〜でした`), phó từ (`ぜんぜん`), liên từ (`しかし, そして`), khoảng cách (`どのくらい`).
- **Nếu không chọn Bài 5**: Cấm mong muốn (`ほしい, たい`), mục đích (`〜に行きます`), quá khứ (`ました`), giải thích lý do (`どうして, 〜から`).
- **Nếu không chọn Bài 6**: AI bị cấm tạo câu hỏi về So sánh (`より`, `ほど`, `どちら`, `一番`), Rủ rê & từ chối khéo (`〜はちょっと…`), Nơi diễn ra sự kiện (`Địa điểm で Sự kiện があります`), Lượng từ đếm vật mỏng (`枚 - まい`).
- **Nếu không chọn Bài 7**: AI bị cấm tạo câu hỏi về Thể て (`Vてください`, `Vています`, `Vましょうか`, `〜かた`), sự tồn tại người/động vật (`N1 に N2 がいます`) và dụng cụ ăn uống (`スプーン`, `フォーク`, `ナイフ`).

---

## 4. Dự Phòng Khi Mất Kết Nối (Fallback Mechanism)

Nếu mô hình AI gặp sự cố mạng hoặc phản hồi không hợp lệ:
- Hệ thống tự động chuyển tiếp sang **High-Diversity Seed Engine** (`fpt-jpd123-engine.ts`) với gần 300 câu hỏi hạt giống phủ kín từng bài.
- Vẫn đảm bảo tạo đủ 30 câu hỏi trắc nghiệm A-D không trùng lặp, bám sát 100% các bài học đã chọn.
