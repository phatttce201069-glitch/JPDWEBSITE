# Hướng Dẫn Phát Triển & Kiểm Thử (Development & Testing)

Tài liệu này cung cấp các hướng dẫn kỹ thuật dành cho nhà phát triển tham gia xây dựng và bảo trì hệ thống học tập JPD123.

---

## 1. Cấu Trúc Mã Nguồn

```text
src/
├── components/          # Các React Component dùng chung (Quiz, Dialog, Explanation...)
├── data/                # Dữ liệu tĩnh (Bảng chữ cái, Từ vựng, Ngữ pháp)
│   ├── alphabet.ts
│   ├── grammar.ts
│   └── vocabulary.ts
├── lib/                 # Các tiện ích cốt lõi
│   ├── auth/            # Quản lý phiên và xác thực người dùng
│   └── study/           # Engine tạo đề, AI generator, phân tích lời giải
│       ├── ai-service.ts
│       ├── exam.ts
│       ├── explanation.ts
│       ├── fpt-jpd123-engine.ts
│       └── types.ts
└── routes/              # Các trang giao diện (TanStack Router)
    ├── __root.tsx
    ├── exam.tsx
    ├── grammar.tsx
    ├── index.tsx
    ├── kana.tsx
    └── words.tsx
```

---

## 2. Quy Trình Kiểm Thử (Testing Workflow)

Trước khi commit bất kỳ thay đổi nào lên mã nguồn, bắt buộc phải chạy qua 3 bước kiểm thử tự động:

1. **Chạy Bộ Kiểm Thử (Unit Tests)**:
   ```bash
   npm run test
   ```
   Hệ thống chạy 68+ test case kiểm tra tính hợp lệ của đề thi, phân phối câu hỏi, thuật toán xáo trộn, và quy tắc cô lập bài học.

2. **Kiểm Tra Kiểu Dữ Liệu TypeScript**:
   ```bash
   npm run typecheck
   ```
   Đảm bảo không có lỗi type mismatch hoặc biến undefined.

3. **Kiểm Tra Build Production**:
   ```bash
   npm run build
   ```
   Xác minh ứng dụng build thành công với Nitro và Vite.
