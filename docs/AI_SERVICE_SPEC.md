# Đặc Tả Dịch Vụ Sinh Đề Thi Bằng AI (AI Exam Service Specification)

Tài liệu này giải thích chi tiết cơ chế hoạt động, prompt engineering, và các thuật toán kiểm duyệt của bộ sinh đề thi bằng trí tuệ nhân tạo (`src/lib/study/ai-service.ts`).

---

## 1. Cơ Chế Hoạt Động (Architecture)

Quy trình sinh đề thi gồm 4 tầng xử lý:

```text
[Yêu cầu người dùng (Bài 4, 5, 6, 7)]
                  │
                  ▼
         [Xây dựng Prompt AI]
  - Đưa vào dàn bài từ vựng, kanji, ngữ pháp
  - Thiết lập Negative Constraints (Cấm bài chưa chọn)
                  │
                  ▼
         [Gọi mô hình xAI / Gemini]
  - Sinh mảng 30 câu hỏi dạng JSON thuần túy
                  │
                  ▼
     [Kiểm duyệt & Lọc bài nghiêm ngặt]
  - Kiểm tra tính hợp lệ JSON
  - Hàm `isQuestionAllowedForLessons` rà soát 100% nội dung
  - Thuật toán bổ sung câu hỏi bù trừ nếu thiếu
                  │
                  ▼
          [Đề thi hoàn chỉnh 30 câu]
```

---

## 2. Ràng Buộc Âm Bản (Negative Constraints)

Để đảm bảo đề thi không xuất hiện kiến thức của bài học chưa được học:
- **Nếu không chọn Bài 6**: AI bị cấm tạo câu hỏi về So sánh (`より`, `ほど`, `どちら`, `一番`), Rủ rê & từ chối khéo (`〜はちょっと…`), Nơi diễn ra sự kiện (`Địa điểm で Sự kiện があります`), Lượng từ đếm vật mỏng (`枚 - まい`).
- **Nếu không chọn Bài 7**: AI bị cấm tạo câu hỏi về Thể て (`Vてください`, `Vています`, `〜かた`) và dụng cụ ăn uống (`スプーン`, `フォーク`, `ナイフ`).

---

## 3. Dự Phòng Khi Mất Kết Nối (Fallback Mechanism)

Nếu mô hình AI gặp sự cố mạng hoặc phản hồi không hợp lệ:
- Hệ thống tự động chuyển tiếp sang **High-Diversity Seed Engine** (`fpt-jpd123-engine.ts`).
- Vẫn đảm bảo tạo đủ 30 câu hỏi trắc nghiệm A-D không trùng lặp, bám sát 100% các bài học đã chọn.
