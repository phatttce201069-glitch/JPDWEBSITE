# Hướng Dẫn Đóng Góp (Contributing Guide)

Cảm ơn bạn đã quan tâm đến việc phát triển và hoàn thiện dự án **JPD123 Website**! Chúng tôi luôn hoan nghênh các đóng góp từ cộng đồng sinh viên và giảng viên.

---

## 1. Quy Trình Đóng Góp

1. **Fork Repository**: Tạo bản sao của repository về tài khoản cá nhân.
2. **Tạo Nhánh Tính Năng (Feature Branch)**:
   ```bash
   git checkout -b feature/ten-tinh-nang
   # hoặc
   git checkout -b fix/ten-loi-can-sua
   ```
3. **Thực Hiện Thay Đổi**:
   - Viết code sạch sẽ, rõ ràng, tuân thủ quy chuẩn TypeScript.
   - Luôn bổ sung unit test tương ứng nếu có tính năng hoặc logic mới.
4. **Kiểm Tra Trước Khi Tạo Pull Request**:
   ```bash
   npm run test
   npm run typecheck
   npm run build
   ```
5. **Tạo Pull Request (PR)**: Gửi PR vào nhánh `main` kèm mô tả chi tiết các thay đổi.

---

## 2. Quy Chuẩn Thông Điệp Commit (Commit Convention)

Dự án áp dụng quy chuẩn **Conventional Commits**:

- `feat:` Thêm tính năng mới (Ví dụ: `feat: thêm bộ lọc câu hỏi theo bài học`)
- `fix:` Sửa lỗi (Ví dụ: `fix: sửa lỗi hiển thị lời giải chi tiết`)
- `docs:` Thay đổi hoặc bổ sung tài liệu (Ví dụ: `docs: cập nhật README.md`)
- `test:` Bổ sung hoặc chỉnh sửa bộ kiểm thử tự động
- `refactor:` Tái cấu trúc mã nguồn mà không làm thay đổi hành vi logic
- `chore:` Các tác vụ cấu hình hệ thống, công cụ phát triển

---

## 3. Tiêu Chuẩn Mã Nguồn

- Thụt lề bằng 2 dấu cách (spaces).
- Định dạng UTF-8, ký tự xuống dòng `LF`.
- Không để lại `console.log` thừa trong code môi trường production.
