# Quy Ước Kiến Trúc Thư Mục (Project Structure)

Tài liệu này giải thích chi tiết cấu trúc các tầng và vai trò của từng thư mục trong dự án.

---

## 1. Sơ Đồ Cấu Trúc Toàn Diện

```text
├── .github/                 # Cấu hình GitHub Actions / Workflows
├── docs/                    # Tài liệu kỹ thuật, đặc tả đề thi, hướng dẫn
│   ├── AI_SERVICE_SPEC.md   # Đặc tả dịch vụ AI tạo đề thi
│   ├── DEVELOPMENT.md       # Hướng dẫn quy trình phát triển
│   ├── EXAM_SPEC.md         # Quy chuẩn ma trận đề thi 30 câu FPT
│   ├── GRAMMAR_SUMMARY.md   # Tóm tắt lý thuyết ngữ pháp Bài 4-7
│   └── PROJECT_STRUCTURE.md # Tài liệu kiến trúc dự án
├── public/                  # Static assets (favicons, manifests, pwa icons)
├── scripts/                 # Scripts tự động hóa (migration, preview, smoke test)
├── src/
│   ├── components/          # UI Components dùng chung
│   │   ├── question-explanation.tsx # Hộp hiển thị lời giải chi tiết
│   │   ├── quiz-panel.tsx           # Bảng câu hỏi thi trắc nghiệm
│   │   └── word-quiz.tsx            # Bài kiểm tra từ vựng
│   ├── data/                # Dữ liệu tĩnh gốc
│   │   ├── alphabet.ts              # Bảng chữ cái Kana & Kanji cơ bản
│   │   ├── grammar.ts               # Dữ liệu ngữ pháp Bài 4 đến 7
│   │   └── vocabulary.ts            # Kho từ vựng JPD123
│   ├── lib/                 # Core logic, services & engines
│   │   ├── auth/                    # Better Auth & Session management
│   │   └── study/                   # Study Engine & Business logic
│   │       ├── ai-service.ts        # Tích hợp AI sinh đề thi
│   │       ├── exam.ts              # Bộ tạo đề luyện tập ngữ pháp
│   │       ├── explanation.ts       # Engine phân tích & tạo lời giải
│   │       ├── fpt-jpd123-engine.ts # Ngân hàng câu hỏi hạt giống & tạo đề thi
│   │       ├── romaji.ts            # Xử lý Romaji & chuẩn hóa tiếng Việt
│   │       ├── store.ts             # Quản lý Bookmark & State (Zustand)
│   │       └── types.ts             # Định nghĩa Type TypeScript
│   └── routes/              # Định tuyến trang web (TanStack Router)
│       ├── __root.tsx               # Root layout & Navigation bar
│       ├── exam.tsx                 # Trang kiểm tra & tạo đề thi
│       ├── grammar.tsx              # Trang học ngữ pháp
│       ├── index.tsx                # Trang chủ dashboard
│       ├── kana.tsx                 # Trang học bảng chữ cái
│       └── words.tsx                # Trang tra cứu & học từ vựng
├── vercel.json              # Cấu hình Vercel Deployment
└── vite.config.ts           # Cấu hình Vite & Nitro
```
