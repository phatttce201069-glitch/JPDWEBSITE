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

## 📄 Bản Quyền
Dự án được phát triển phục vụ mục đích học tập và ôn thi môn Tiếng Nhật JPD123 Đại học FPT.
