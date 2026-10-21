# JPD123 - Cổng Học & Luyện Thi Tiếng Nhật Sơ Cấp (FPT University)

Ứng dụng web học tập và ôn luyện thi môn **JPD123 (Tiếng Nhật Sơ cấp 2)** dành cho sinh viên Đại học FPT, xây dựng trên nền tảng **React 19**, **TanStack Start / Router**, và **Tailwind CSS v4**.

---

## 🌟 Tính Năng Nổi Bật

- 📚 **Học Từ Vựng & Đánh Dấu (Bookmark)**: Xem từ vựng kèm chữ Hán, Hiragana/Katakana, nghĩa tiếng Việt, phát âm và đánh dấu các từ khó để ôn luyện riêng.
- 📖 **Ngữ Pháp Trọng Tâm Bài 4 - Bài 7**: Hệ thống lý thuyết ngữ pháp chi tiết kèm ví dụ song ngữ Nhật - Việt sát giáo trình JPD123.
- 🈁 **Bảng Chữ Cái Kana**: Tra cứu và kiểm tra bảng chữ cái Hiragana, Katakana, Âm đục (Dakuon) và Âm ghép (Yoon).
- 📝 **Luyện Thi Trắc Nghiệm Chuẩn Form FPT**:
  - Đề thi 30 câu: **10 câu Kanji**, **10 câu Từ vựng**, **10 câu Ngữ pháp**.
  - Tùy chọn phạm vi bài thi (Bài 4, Bài 5, Bài 6, Bài 7) - lọc bài chính xác 100%, không rò rỉ kiến thức bài chưa chọn.
  - Hỗ trợ làm đề riêng cho các từ vựng đã đánh dấu.
- 🤖 **Tích Hợp AI Tạo Đề Thi Đa Dạng**: Sử dụng AI để sinh đề thi phong phú, ngữ cảnh tự nhiên nhưng luôn bám sát khung kiến thức JPD123.
- 💡 **Hộp Lời Giải Chi Tiết Trực Quan**:
  - Hiển thị lại câu hỏi hoàn chỉnh đã điền đáp án đúng.
  - Dịch nghĩa câu văn, chỉ rõ cấu trúc ngữ pháp áp dụng, nguồn bài học và mẹo giải bài thi.
- ⏸️ **Hủy & Xác Nhận Bài Thi**: Hỗ trợ hủy bài thi bất kỳ lúc nào với hộp thoại xác nhận trực quan.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 19, TanStack Start, TanStack Router, TanStack Query
- **Styling**: Tailwind CSS v4, Radix UI Primitives, Lucide React Icons
- **Database & Storage**: PGLite, LocalStorage
- **Testing**: Node.js Native Test Runner (`node:test`)
- **Hosting & CI/CD**: Vercel

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

1. **Cài đặt thư viện**:
   ```bash
   npm install
   ```

2. **Khởi chạy môi trường phát triển (Dev Server)**:
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại địa chỉ `http://localhost:8080`.

3. **Kiểm tra kiểu dữ liệu (Typecheck)**:
   ```bash
   npm run typecheck
   ```

4. **Chạy Unit Test**:
   ```bash
   npm run test
   ```

5. **Build dự án**:
   ```bash
   npm run build
   ```

---

## 🗺️ Lộ Trình Phát Triển (Roadmap)

- [x] Hệ thống tra cứu từ vựng và bảng chữ cái Kana
- [x] Ngữ pháp bài 4 đến bài 7 chuẩn giáo trình FPT JPD123
- [x] Tạo đề thi trắc nghiệm 30 câu tự động với tính năng chọn bài linh hoạt
- [x] Tích hợp AI sinh đề thi phong phú, không trùng lặp
- [x] Hộp lời giải chi tiết (Dịch câu, Ngữ pháp, Mẹo giải, Bài học)
- [x] Đánh dấu từ vựng và làm đề thi riêng cho từ đã bookmark
- [ ] Thêm tính năng bấm giờ đếm ngược 30 phút mô phỏng phòng thi thật
- [ ] Thống kê lịch sử điểm số và biểu đồ phân tích kỹ năng theo thời gian
- [ ] Mở rộng ngân hàng câu hỏi nghe hiểu (Listening Comprehension)

---

## ❓ Câu Hỏi Thường Gặp (FAQ)

**Q1: Đề thi tạo bởi AI có bị rò rỉ kiến thức bài chưa học không?**  
A: Không. Hệ thống áp dụng quy chuẩn *Lesson Isolation Rule* với các ràng buộc âm bản nghiêm ngặt. Nếu bạn chọn Bài 4 và Bài 5, AI sẽ tuyệt đối không đưa vào cấu trúc ngữ pháp hay từ vựng của Bài 6 và Bài 7.

**Q2: Dữ liệu từ vựng đã đánh dấu (Bookmark) được lưu ở đâu?**  
A: Dữ liệu bookmark được lưu trữ cục bộ trên trình duyệt thông qua Zustand Store và LocalStorage, giúp lưu lại trạng thái học tập ngay cả khi bạn tải lại trang hoặc mất mạng.

**Q3: Ứng dụng có thể chạy offline khi không có internet không?**  
A: Có. Toàn bộ tính năng học từ vựng, ngữ pháp, bảng chữ cái và tạo đề thi bằng High-Diversity Seed Engine đều hoạt động hoàn toàn offline trên trình duyệt.

---

## 📄 Bản Quyền
Dự án được phát triển phục vụ mục đích học tập và ôn thi môn Tiếng Nhật JPD123 Đại học FPT.
