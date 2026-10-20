# Đặc Tả Cấu Trúc Đề Thi Môn JPD123 (Đại Học FPT)

Tài liệu này mô tả chi tiết quy chuẩn và cấu trúc ngân hàng câu hỏi đề thi trắc nghiệm môn JPD123 (Tiếng Nhật Sơ cấp 2) áp dụng trong hệ thống.

---

## 1. Cấu Trúc Đề Thi Chuẩn (30 Câu)

Mỗi đề thi bao gồm đúng **30 câu hỏi trắc nghiệm** lựa chọn 4 phương án (A, B, C, D) chia đều thành 3 phần chính:

| Phần | Section | Số Lượng | Dạng Câu Hỏi |
| :--- | :--- | :---: | :--- |
| **Phần 1: Chữ Hán** | `Kanji` | 10 câu | - Đọc Kanji trong ngoặc sang Hiragana<br>- Chọn Kanji đúng từ Hiragana<br>- Âm Hán Việt / Ý nghĩa Hán tự |
| **Phần 2: Từ Vựng** | `Từ vựng` | 10 câu | - Điền từ vựng phù hợp ngữ cảnh câu<br>- Phó từ / Liên từ / Từ đối nghĩa<br>- Hội thoại ngắn giao tiếp A - B |
| **Phần 3: Ngữ Pháp** | `Ngữ pháp` | 10 câu | - Trợ từ chỉ phương hướng, phương tiện, nơi diễn ra sự kiện<br>- Chia thể động từ (Quá khứ, Thể て, Vたい)<br>- Mẫu câu so sánh (より, ほど, どちら, 一番)<br>- Rủ rê, từ chối khéo, lượng từ đếm vật mỏng |

---

## 2. Quy Tắc Cô Lập Bài Học (Lesson Isolation Rule)

- Khi người dùng lựa chọn bài kiểm tra (ví dụ: chỉ chọn `Bài 4` và `Bài 5`):
  1. Toàn bộ 30 câu hỏi **100% bắt buộc** chỉ được lấy từ các bài đã chọn.
  2. **Tuyệt đối nghiêm cấm** rò rỉ kiến thức, từ vựng hoặc cấu trúc của các bài chưa chọn (ví dụ: cấm cấu trúc so sánh của Bài 6, cấm thể て của Bài 7 khi chỉ chọn Bài 4-5).
  3. Tất cả 30 câu hỏi phải hoàn toàn độc lập, **không trùng lặp** câu văn.

---

## 3. Hệ Thống Lời Giải Trực Quan

Mỗi câu hỏi đều liên kết với cấu trúc dữ liệu lời giải (`ExamExplanation`):
- `meaning`: Bản dịch nghĩa tiếng Việt hoàn chỉnh của câu văn.
- `grammar`: Tên và cấu trúc ngữ pháp tương ứng được kiểm tra.
- `reason`: Phân tích lý do vì sao chọn phương án đúng và loại trừ các phương án sai.
- `tip`: Mẹo nhận biết nhanh dấu hiệu trong bài thi FPT.
- `lesson`: Xác định chính xác bài học tương ứng (ví dụ: `JPD123 - Bài 6`).
