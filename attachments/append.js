const fs = require('fs');
const content = `\n// --- THÊM TỪ VỰNG JPD123 (Bài 5 phần 2) ---
const newWordsJPD123_Bai5P2 = [
    { id: 1093, course: "JPD123", lesson: "JPD123 - Bài 5 phần 2", word: "今朝", reading: "けさ", meaning: "Sáng nay", example: "Phân loại: Danh từ chỉ thời gian" },
    { id: 1094, course: "JPD123", lesson: "JPD123 - Bài 5 phần 2", word: "先月", reading: "せんげつ", meaning: "Tháng trước", example: "Phân loại: Danh từ chỉ thời gian" },
    { id: 1095, course: "JPD123", lesson: "JPD123 - Bài 5 phần 2", word: "去年", reading: "きょねん", meaning: "Năm ngoái", example: "Phân loại: Danh từ chỉ thời gian" },
    { id: 1096, course: "JPD123", lesson: "JPD123 - Bài 5 phần 2", word: "かぜ", reading: "かぜ", meaning: "Cảm cúm", example: "Phân loại: Danh từ" },
    { id: 1097, course: "JPD123", lesson: "JPD123 - Bài 5 phần 2", word: "天気", reading: "てんき", meaning: "Thời tiết", example: "Phân loại: Danh từ" },
    { id: 1098, course: "JPD123", lesson: "JPD123 - Bài 5 phần 2", word: "ばんごはん", reading: "ばんごはん", meaning: "Cơm tối", example: "Phân loại: Danh từ" },
    { id: 1099, course: "JPD123", lesson: "JPD123 - Bài 5 phần 2", word: "ふく", reading: "ふく", meaning: "Quần áo", example: "Phân loại: Danh từ" },
    { id: 1100, course: "JPD123", lesson: "JPD123 - Bài 5 phần 2", word: "のぼります", reading: "のぼります", meaning: "Leo, trèo", example: "Phân loại: Động từ" },
    { id: 1101, course: "JPD123", lesson: "JPD123 - Bài 5 phần 2", word: "はいります", reading: "はいります", meaning: "Vào", example: "Phân loại: Động từ" },
    { id: 1102, course: "JPD123", lesson: "JPD123 - Bài 5 phần 2", word: "いそがしい", reading: "いそがしい", meaning: "Bận", example: "Phân loại: Tính từ đuôi i" },
    { id: 1103, course: "JPD123", lesson: "JPD123 - Bài 5 phần 2", word: "おもしろい", reading: "おもしろい", meaning: "Thú vị", example: "Phân loại: Tính từ đuôi i" },
    { id: 1104, course: "JPD123", lesson: "JPD123 - Bài 5 phần 2", word: "きもちがいい", reading: "きもちがいい", meaning: "Sảng khoái", example: "Phân loại: Cụm từ" },
    { id: 1105, course: "JPD123", lesson: "JPD123 - Bài 5 phần 2", word: "高い", reading: "たかい", meaning: "Cao, đắt", example: "Phân loại: Tính từ đuôi i" },
    { id: 1106, course: "JPD123", lesson: "JPD123 - Bài 5 phần 2", word: "安い", reading: "やすい", meaning: "Rẻ", example: "Phân loại: Tính từ đuôi i" },
    { id: 1107, course: "JPD123", lesson: "JPD123 - Bài 5 phần 2", word: "楽しい", reading: "たのしい", meaning: "Vui vẻ", example: "Phân loại: Tính từ đuôi i" },
    { id: 1108, course: "JPD123", lesson: "JPD123 - Bài 5 phần 2", word: "むずかしい", reading: "むずかしい", meaning: "Khó", example: "Phân loại: Tính từ đuôi i" },
    { id: 1109, course: "JPD123", lesson: "JPD123 - Bài 5 phần 2", word: "かんたん", reading: "かんたん", meaning: "Đơn giản", example: "Phân loại: Tính từ đuôi na" },
    { id: 1110, course: "JPD123", lesson: "JPD123 - Bài 5 phần 2", word: "たいへん", reading: "たいへん", meaning: "Vất vả", example: "Phân loại: Tính từ đuôi na" },
    { id: 1111, course: "JPD123", lesson: "JPD123 - Bài 5 phần 2", word: "ひま", reading: "ひま", meaning: "Rảnh rỗi", example: "Phân loại: Tính từ đuôi na" },
    { id: 1112, course: "JPD123", lesson: "JPD123 - Bài 5 phần 2", word: "どうして", reading: "どうして", meaning: "Tại sao", example: "Phân loại: Từ nghi vấn" }
];
vocabularyData.push(...newWordsJPD123_Bai5P2);
`;
fs.appendFileSync('d:\\\\Download\\\\WEB JPD\\\\js\\\\vocabulary.js', content, 'utf8');
