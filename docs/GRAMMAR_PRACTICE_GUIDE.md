# Hướng Dẫn Tính Năng Luyện Riêng Từng Phần Ngữ Pháp (Grammar Section Practice Guide)

Tài liệu này đặc tả chi tiết kiến trúc và hướng dẫn sử dụng tính năng **Luyện riêng từng phần trong một bài ngữ pháp** trên cổng học tập **JPD123 Website (FPT University)**.

---

## 🎯 Mục Đích Tính Năng

Trong chương trình tiếng Nhật JPD123 (Bài 4 đến Bài 7) và JPD113 (Bài 1 đến Bài 3), mỗi bài học ngữ pháp bao gồm nhiều chuyên đề/mẫu câu khác nhau.
- *Ví dụ ở Bài 6*: Bao gồm 7 phần ngữ pháp riêng biệt:
  1. `6_1`: So sánh hơn (`A は B より Adj です`)
  2. `6_2`: So sánh kém (`A は B ほど Adj ない`)
  3. `6_3`: So sánh nhất (`N のなかで A がいちばん Adj`)
  4. `6_4`: So sánh lựa chọn (`N1 と N2 と どちらが A ですか`)
  5. `6_5`: Rủ rê, Đồng ý và Từ chối khéo kèm lý do (`〜はちょっと… / 〜がありますから`)
  6. `6_6`: Địa điểm diễn ra sự kiện (`Địa điểm で N(sự kiện) が あります`)
  7. `6_7`: Lượng từ đếm vật mỏng dẹt (`N が / を 〜まい あります / 買いました`)

Trước đây, tính năng luyện trắc nghiệm chỉ hỗ trợ làm toàn bộ bài (trộn ngẫu nhiên tất cả các phần). Tính năng mới cho phép:
- Người học yếu phần nào (ví dụ hay nhầm giữa `より` và `ほど`) có thể **tập trung luyện riêng phần đó**.
- Rút ngắn thời gian ôn tập trọng điểm trước giờ thi hoặc kiểm tra trên lớp (Progress Test).

---

## 🏗️ Kiến Trúc Hệ Thống (Architecture)

### 1. Phân phối & Điều hướng (Routing & URL Params)
Hệ thống sử dụng TanStack Router với query parameters rõ ràng:
- `?lesson=6`: Xem danh sách tất cả các phần ngữ pháp Bài 6.
- `?lesson=6&point=6_1`: Xem chi tiết lý thuyết, công thức, lưu ý và ví dụ của phần 6.1 (So sánh hơn).
- `?lesson=6&point=6_1&drill=true`: Chế độ **Luyện riêng phần 6.1**.
- `?lesson=6&drill=true`: Chế độ **Luyện tổng hợp cả Bài 6** (tất cả các phần).

### 2. Thuật toán sinh câu hỏi theo chuyên đề (`src/lib/study/exam.ts`)
Hàm cốt lõi:
```typescript
export function buildGrammarDrill(bai: string, pointId?: string): ExamQuestion[]
```

Khi nhận tham số `pointId` (ví dụ `"6_1"`):
1. **Lọc từ Question Seeds (`patternQuestions`)**:
   Hệ thống ánh xạ `POINT_KEY_MAPPINGS[pointId]` để lấy các câu hỏi mẫu chuẩn thi khớp với chuyên đề.
2. **Sinh động từ ví dụ thực tế (`generateQuestionsFromExamples`)**:
   Dựa trên các câu ví dụ thực tế trong dữ liệu bài học (`point.examples`), thuật toán tự động sinh 3 nhóm câu hỏi chất lượng cao:
   - **Điền vào chỗ trống (Fill-in-the-blank)**: Ẩn trợ từ hoặc từ khóa trọng tâm (ví dụ `より` trong câu so sánh hơn) và tạo 3 phương án gây nhiễu hợp lý (`ほど`, `から`, `まで`).
   - **Dịch nghĩa xuôi (Translation)**: Yêu cầu chọn câu tiếng Nhật đúng cho nghĩa tiếng Việt của ví dụ.
   - **Dịch nghĩa ngược (Meaning Match)**: Yêu cầu chọn nghĩa tiếng Việt chính xác của câu ví dụ.
3. **Đa dạng hóa câu hỏi (`takeDiverse`)**:
   Xáo trộn và đảm bảo các câu hỏi trong đề có cấu trúc câu và dạng câu hỏi đa dạng, không trùng lặp.

---

## 🖥️ Trải Nghiệm Người Dùng (UI/UX)

### 1. Tại trang danh sách bài học (`src/routes/grammar.tsx`)
- Mỗi phần ngữ pháp có số thứ tự rõ ràng (`Phần 01`, `Phần 02`...), cấu trúc tiếng Nhật, cấu trúc tiếng Việt và các thẻ chip gợi ý.
- Nút **`🎯 Luyện riêng`** màu đỏ đặc trưng giúp bắt đầu làm bài trắc nghiệm ngay chỉ với 1 click.
- Nút **`Lý thuyết`** để xem phân tích chi tiết.

### 2. Trong lúc làm bài trắc nghiệm
- Tiêu đề hiển thị rõ ràng: `🎯 Luyện riêng phần X: [Tên cấu trúc]`.
- Ngay sau khi chọn đáp án, hệ thống tích hợp bảng **💡 Lời giải chi tiết** ([`QuestionExplanationPanel`](file:///d:/Download/CJqDgkBrTmNaokhl-grok-workspace/src/components/question-explanation.tsx)) giải thích lý do, công thức và mẹo giải bài.

### 3. Tại màn hình kết quả
- Thống kê tỷ lệ chính xác (%).
- Phân tích chi tiết các câu làm sai.
- Nút **`Làm lại phần này`** để củng cố kiến thức.
- Nút **`Luyện tiếp phần tiếp theo →`** giúp chuyển thẳng sang phần kế tiếp mà không cần quay lại danh mục bài học.

---

## 🧪 Kiểm Thử & Đảm Bảo Chất Lượng (QA)

- Unit test toàn diện tại [`src/lib/study/grammar-drill.test.ts`](file:///d:/Download/CJqDgkBrTmNaokhl-grok-workspace/src/lib/study/grammar-drill.test.ts).
- Kiểm tra 100% các bài học từ Bài 1 đến Bài 7 và các chuyên đề trọng điểm Bài 6.
- Chạy kiểm tra tự động bằng lệnh:
  ```bash
  npm test
  ```
