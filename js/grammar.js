const grammarLessons = [
    {
        id: "1",
        title: "Bài 1: Trợ từ cơ bản và Câu danh từ",
        subtitle: "第1課",
        description: "Học cách dùng các trợ từ cơ bản は、の、も、と và cấu trúc câu danh từ với です。",
        points: [
            {
                id: "1_1",
                structure_jp: "N1 は N2 です。",
                structure_vi: "N1 là N2",
                chips: ["N1", "N2"],
                formula: "Danh từ 1 + は + Danh từ 2 + です",
                explanation: "Câu khẳng định với です",
                usage: "Dùng để giới thiệu tên, nghề nghiệp, quốc tịch, tuổi tác...",
                note: "Trợ từ は phát âm là 'wa'. です thể hiện sự lịch sự.",
                color: "#ffb6c1", // pink
                examples: [
                    { jp: "Aさんは学生です。", romaji: "A-san wa gakusei desu.", vi: "Bạn A là sinh viên." },
                    { jp: "私は日本人です。", romaji: "Watashi wa nihonjin desu.", vi: "Tôi là người Nhật." },
                    { jp: "田中さんは先生です。", romaji: "Tanaka-san wa sensei desu.", vi: "Anh Tanaka là giáo viên." },
                    { jp: "私は医者です。", romaji: "Watashi wa isha desu.", vi: "Tôi là bác sĩ." },
                    { jp: "マリアさんはブラジル人です。", romaji: "Maria-san wa Burajiru-jin desu.", vi: "Bạn Maria là người Brazil." }
                ]
            },
            {
                id: "1_2",
                structure_jp: "N1 は N2 の N3 です。",
                structure_vi: "N1 là N3 của N2",
                chips: ["N1", "N2", "N3"],
                formula: "Danh từ 1 + は + Danh từ 2 + の + Danh từ 3 + です",
                explanation: "Trợ từ の chỉ sự sở hữu hoặc thuộc về",
                usage: "Dùng để nói ai đó/cái gì đó thuộc về ai/tổ chức nào.",
                note: "Trợ từ の nối 2 danh từ. N2 bổ nghĩa cho N3.",
                color: "#ffd700", // yellow
                examples: [
                    { jp: "私はIMCの社員です。", romaji: "Watashi wa IMC no shain desu.", vi: "Tôi là nhân viên của công ty IMC." }
                ]
            },
            {
                id: "1_3",
                structure_jp: "N1 の N2 は N3 です。",
                structure_vi: "N2 của N1 là N3",
                chips: ["N1", "N2", "N3"],
                formula: "Danh từ 1 + の + Danh từ 2 + は + Danh từ 3 + です",
                explanation: "Chủ ngữ được mở rộng bằng trợ từ の",
                usage: "Dùng để miêu tả đặc điểm, thông tin của một vật thuộc sở hữu.",
                note: "",
                color: "#98fb98", // green
                examples: []
            },
            {
                id: "1_4",
                structure_jp: "N1 も N2 です。",
                structure_vi: "N1 cũng là N2",
                chips: ["N1", "N2"],
                formula: "Danh từ 1 + も + Danh từ 2 + です",
                explanation: "Trợ từ も có nghĩa là 'cũng'",
                usage: "Dùng khi thông tin của chủ ngữ này giống với chủ ngữ trước đó.",
                note: "Thay thế cho trợ từ は.",
                color: "#dda0dd", // purple
                examples: []
            },
            {
                id: "1_5",
                structure_jp: "N1 は N2 じゃありません。",
                structure_vi: "N1 không phải là N2",
                chips: ["N1", "N2"],
                formula: "Danh từ 1 + は + Danh từ 2 + じゃありません",
                explanation: "Câu phủ định của です",
                usage: "Dùng để phủ định một danh từ.",
                note: "Dạng lịch sự hơn là ではありません (dewa arimasen).",
                color: "#ffb6c1", // pink
                examples: []
            },
            {
                id: "1_6",
                structure_jp: "N1 と N2",
                structure_vi: "N1 và N2",
                chips: ["N1", "N2"],
                formula: "Danh từ 1 + と + Danh từ 2",
                explanation: "Trợ từ と dùng để nối 2 danh từ",
                usage: "Dùng để liệt kê toàn bộ các sự vật, sự việc.",
                note: "",
                color: "#ffd700", // yellow
                examples: []
            },
            {
                id: "1_7",
                structure_jp: "N は [Từ hỏi] ですか。",
                structure_vi: "N là [gì/đâu/ai]?",
                chips: ["N", "Từ hỏi"],
                formula: "Danh từ + は + Từ để hỏi + ですか",
                explanation: "Câu hỏi có từ để hỏi",
                usage: "Dùng để hỏi thông tin chưa biết.",
                note: "Không trả lời bằng 'Vâng' hoặc 'Không'.",
                color: "#98fb98", // green
                examples: []
            },
            {
                id: "1_8",
                structure_jp: "N1 は N2 ですか。",
                structure_vi: "N1 có phải là N2 không?",
                chips: ["N1", "N2"],
                formula: "Danh từ 1 + は + Danh từ 2 + ですか",
                explanation: "Câu hỏi Xác nhận (Yes/No question)",
                usage: "Dùng để xác nhận tính đúng sai của một thông tin.",
                note: "Trả lời bắt đầu bằng はい (Vâng) hoặc いいえ (Không).",
                color: "#dda0dd", // purple
                examples: []
            }
        ]
    }
];

let currentLessonId = null;
let currentGrammarPointId = null;

document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
});

function renderDashboard() {
    const container = document.getElementById('dashboard-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    grammarLessons.forEach(lesson => {
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-2xl shadow-sm border border-[#e8e2db] flex flex-col cursor-pointer hover:shadow-md hover:border-[#5f8a8b] hover:-translate-y-1 transition-all group relative overflow-hidden';
        card.onclick = () => openLesson(lesson.id);
        
        card.innerHTML = `
            <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-xl bg-[#f0f4f8] flex items-center justify-center text-[#5f8a8b] text-xl group-hover:bg-[#5f8a8b] group-hover:text-white transition-colors">
                        <i class="fa-solid fa-book-open"></i>
                    </div>
                    <div>
                        <div class="text-sm font-semibold text-[#8b7b6c]">${lesson.subtitle}</div>
                        <h3 class="text-xl font-bold text-[#2c3e50]">${lesson.title}</h3>
                    </div>
                </div>
                <div class="flex items-center gap-1 text-sm font-medium text-[#5f8a8b] bg-[#eef5f5] px-3 py-1 rounded-full">
                    ${lesson.points.length} mẫu <i class="fa-solid fa-chevron-right text-[10px] ml-1"></i>
                </div>
            </div>
            <p class="text-[#7d746d] text-sm mt-3">${lesson.description}</p>
        `;
        container.appendChild(card);
    });
}

function openLesson(lessonId) {
    currentLessonId = lessonId;
    const lesson = grammarLessons.find(l => l.id === lessonId);
    if (!lesson) return;
    
    document.getElementById('view-dashboard').classList.add('hidden');
    document.getElementById('view-lesson-detail').classList.remove('hidden');
    
    document.getElementById('lesson-title').textContent = lesson.title;
    document.getElementById('lesson-subtitle').textContent = lesson.description;
    
    const container = document.getElementById('grammar-points-container');
    container.innerHTML = '';
    
    lesson.points.forEach(point => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-2xl shadow-sm border border-[#e8e2db] relative cursor-pointer hover:shadow-md transition-all overflow-hidden';
        card.onclick = () => openGrammarPoint(point.id);
        
        // Top color tab
        const tab = document.createElement('div');
        tab.className = 'absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-b-md';
        tab.style.backgroundColor = point.color;
        
        const content = document.createElement('div');
        content.className = 'p-5 flex justify-between items-center';
        content.innerHTML = `
            <div>
                <div class="text-lg font-bold text-[#2c3e50] flex items-center gap-2">
                    ${point.structure_jp} <i class="fa-solid fa-chevron-right text-xs text-gray-400"></i>
                </div>
                <div class="text-sm text-gray-500 mt-1">${point.structure_vi}</div>
            </div>
            <div class="flex gap-2">
                <button class="w-8 h-8 rounded-lg bg-[#fbbf24] text-white flex items-center justify-center hover:bg-[#f59e0b] transition-colors shadow-sm border border-[#d97706]" onclick="event.stopPropagation()">
                    <i class="fa-solid fa-pen text-sm"></i>
                </button>
                <button class="w-8 h-8 rounded-lg bg-[#3b82f6] text-white flex items-center justify-center hover:bg-[#2563eb] transition-colors shadow-sm border border-[#1d4ed8]" onclick="event.stopPropagation()">
                    <i class="fa-solid fa-plus text-sm"></i>
                </button>
            </div>
        `;
        
        card.appendChild(tab);
        card.appendChild(content);
        container.appendChild(card);
    });
}

function goBackToDashboard() {
    currentLessonId = null;
    document.getElementById('view-lesson-detail').classList.add('hidden');
    document.getElementById('view-dashboard').classList.remove('hidden');
}

function goBackToLesson() {
    currentGrammarPointId = null;
    document.getElementById('view-grammar-point').classList.add('hidden');
    document.getElementById('view-lesson-detail').classList.remove('hidden');
}

function openGrammarPoint(pointId) {
    currentGrammarPointId = pointId;
    const lesson = grammarLessons.find(l => l.id === currentLessonId);
    if (!lesson) return;
    const point = lesson.points.find(p => p.id === pointId);
    if (!point) return;
    
    document.getElementById('view-lesson-detail').classList.add('hidden');
    document.getElementById('view-grammar-point').classList.remove('hidden');
    
    // Header
    document.getElementById('gp-title').textContent = point.structure_jp;
    document.getElementById('gp-subtitle').textContent = point.structure_vi;
    
    // Structure Box
    const structureBox = document.getElementById('gp-structure-content');
    let structureHtml = point.structure_jp;
    point.chips.forEach((chip, index) => {
        // Replace exact chip text with styled span
        structureHtml = structureHtml.replace(chip, \`<span class="inline-block bg-[#e0e7ff] text-[#4f46e5] text-xs font-bold px-2 py-0.5 rounded mr-1">\${chip}</span>\`);
    });
    structureBox.innerHTML = \`<div class="text-xl font-bold mb-4">\${structureHtml}</div><div class="h-px bg-gray-200 w-full mb-3"></div><div class="text-sm text-gray-600">\${point.formula}</div>\`;
    
    // Meaning Box
    document.getElementById('gp-meaning').textContent = point.structure_vi;
    document.getElementById('gp-explanation').textContent = point.explanation;
    
    // Usage Box
    document.getElementById('gp-usage').textContent = point.usage;
    
    // Note Box
    document.getElementById('gp-note').textContent = point.note || "Không có lưu ý đặc biệt.";
    
    // Examples
    const exampleContainer = document.getElementById('gp-examples-container');
    exampleContainer.innerHTML = '';
    
    if (point.examples.length === 0) {
        exampleContainer.innerHTML = '<div class="text-gray-500 italic p-4 text-center">Chưa có ví dụ.</div>';
    } else {
        point.examples.forEach((ex, idx) => {
            const exCard = document.createElement('div');
            exCard.className = 'bg-white rounded-xl shadow-sm border border-[#e8e2db] relative overflow-hidden flex items-center p-4 gap-4';
            
            // Tab color
            const tab = document.createElement('div');
            tab.className = 'absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-b-md';
            tab.style.backgroundColor = point.color;
            
            exCard.innerHTML = `
                <div class="flex-1">
                    <div class="text-lg font-bold text-[#2c3e50]">${ex.jp}</div>
                    <div class="text-xs text-gray-500 mt-1">${ex.romaji}</div>
                </div>
                <div class="flex-1 text-sm text-gray-700">
                    ${ex.vi}
                </div>
                <div class="flex flex-col gap-1">
                    <button class="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-600 border border-gray-200 transition-colors flex items-center gap-1" onclick="playAudio('${ex.jp}', 1)">
                        1x <i class="fa-solid fa-volume-high text-[10px]"></i>
                    </button>
                    <button class="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-600 border border-gray-200 transition-colors flex items-center gap-1" onclick="playAudio('${ex.jp}', 0.5)">
                        2x <i class="fa-solid fa-volume-high text-[10px]"></i>
                    </button>
                </div>
            `;
            exCard.appendChild(tab);
            exampleContainer.appendChild(exCard);
        });
    }
}

function playAudio(text, rate) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop any currently playing audio
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = rate; // 1.0 is normal, 0.5 is slow
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Trình duyệt của bạn không hỗ trợ phát âm thanh (Web Speech API).");
    }
}
