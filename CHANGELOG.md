# Nhật Ký Thay Đổi (Changelog)

Tất cả các thay đổi đáng chú ý của dự án **JPD123 - Cổng Học & Luyện Thi Tiếng Nhật Sơ Cấp (FPT University)** sẽ được ghi chép tại tài liệu này.

Định dạng dựa trên [Keep a Changelog](https://keepachangelog.com/vi/1.0.0/) và tuân thủ [Semantic Versioning](https://semver.org/).

---

## [1.3.0] - 2026-10-22

### ✨ Tính Năng Mới (Added)
- **Luyện riêng từng phần ngữ pháp**:
  - Hỗ trợ chọn luyện độc lập từng phần/chuyên đề trong một bài học ngữ pháp (ví dụ: luyện riêng *So sánh hơn*, *So sánh kém*, *So sánh nhất*, *So sánh lựa chọn*, *Từ chối khéo*, *Sự kiện*, *Lượng từ* của Bài 6).
  - Tích hợp nút **`🎯 Luyện riêng`** ngay tại danh sách các phần của bài học và trong trang chi tiết lý thuyết.
  - Tự động sinh câu hỏi phong phú từ ngân hàng đề thi chuẩn kết hợp dữ liệu câu ví dụ thực tế (`generateQuestionsFromExamples`).
  - Hỗ trợ chuyển tiếp nhanh sang phần kế tiếp (**`Luyện tiếp phần tiếp theo →`**) ngay tại màn hình hoàn thành.
- **Lời giải chi tiết theo thời gian thực trong bài luyện**:
  - Tích hợp `QuestionExplanationPanel` ngay sau khi chọn đáp án trong lúc luyện tập ngữ pháp.
- **Bộ kiểm thử toàn diện**:
  - Bổ sung `src/lib/study/grammar-drill.test.ts` kiểm thử toàn bộ 7 bài học và các chuyên đề trọng điểm.
- **Tài liệu hướng dẫn**:
  - Bổ sung tài liệu đặc tả kiến trúc và hướng dẫn học `docs/GRAMMAR_PRACTICE_GUIDE.md`.

### ⚡ Cải Tiến & Tối Ưu (Changed)
- Chuẩn hóa đường dẫn import trong `src/lib/study/content.ts` và `src/lib/study/exam.ts` để tối ưu hóa quá trình chạy kiểm thử Native Node.js ESM.
- Cập nhật `.gitignore` loại trừ các asset nhị phân tạm thời và log runtime nhằm tiết kiệm dung lượng kho chứa GitHub.
- Cải tiến thuật toán chọn lọc câu hỏi trong `fpt-jpd123-engine.ts` để đảm bảo 100% câu hỏi hạt giống phân bổ đều giữa các chuyên đề.

---

## [1.2.0] - 2026-10-21

### ✨ Tính Năng Mới (Added)
- Bổ sung đầy đủ 3 mẫu ngữ pháp trọng điểm của Bài 6:
  - Mẫu câu rủ rê, đồng ý và từ chối khéo kèm lý do (`〜はちょっと… / 〜がありますから`).
  - Mẫu câu chỉ nơi diễn ra sự kiện, hoạt động (`Địa điểm で N(sự kiện) が あります`).
  - Mẫu lượng từ đếm vật mỏng phẳng (`枚 - まい`).
- Bổ sung bộ câu hỏi trắc nghiệm tương ứng cho kỳ thi thử FPT JPD123.

### 🐛 Sửa Lỗi (Fixed)
- Khắc phục triệt để lỗi hiển thị nhãn bài học chung chung (như "Bài 4 đến Bài 7") trong phần giải thích; cố định chính xác bài học duy nhất cho từng câu hỏi.
- Sửa lỗi lệch giải thích câu hỏi khi làm bài thi trắc nghiệm.

---

## [1.1.0] - 2026-10-20

### ✨ Tính Năng Mới (Added)
- **Tích hợp AI sinh đề thi**:
  - Hỗ trợ xAI (Grok), OpenAI và Mock AI sinh đề thi ngữ cảnh tự nhiên, sát thực tế.
  - Áp dụng nguyên tắc *Lesson Isolation Rule* không rò rỉ kiến thức bài chưa học.
- **Hộp lời giải chi tiết trực quan**:
  - Hiển thị lại nội dung câu hỏi hoàn chỉnh với đáp án đúng được làm nổi bật.
  - Phân tích nghĩa câu văn, cấu trúc ngữ pháp, lưu ý và mẹo giải nhanh.
- **Đánh dấu từ vựng (Bookmark)**:
  - Cho phép người học lưu lại các từ vựng khó nhớ và tạo bài kiểm tra trắc nghiệm riêng.

---

## [1.0.0] - 2026-10-18

### 🎉 Phát Hành Ban Đầu (Initial Release)
- Ra mắt cổng học tập và ôn thi JPD123 Đại học FPT.
- Hệ thống tra cứu bảng chữ cái Kana (Hiragana, Katakana).
- Kho từ vựng và ngữ pháp Bài 4 đến Bài 7.
- Hệ thống thi thử 30 câu chuẩn ma trận đề thi FPT (10 Kanji, 10 Từ vựng, 10 Ngữ pháp).
