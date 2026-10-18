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
                    { jp: "Aさんは学生です。", reading: "Aさんはがくせいです。", romaji: "A-san wa gakusei desu.", vi: "Bạn A là sinh viên." },
                    { jp: "私は日本人です。", reading: "わたしはにほんじんです。", romaji: "Watashi wa nihonjin desu.", vi: "Tôi là người Nhật." },
                    { jp: "田中さんは先生です。", reading: "たなかさんはせんせいです。", romaji: "Tanaka-san wa sensei desu.", vi: "Anh Tanaka là giáo viên." },
                    { jp: "私は医者です。", reading: "わたしはいしゃです。", romaji: "Watashi wa isha desu.", vi: "Tôi là bác sĩ." },
                    { jp: "マリアさんはブラジル人です。", reading: "マリアさんはブラジルじんです。", romaji: "Maria-san wa Burajiru-jin desu.", vi: "Bạn Maria là người Brazil." }
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
                    { jp: "やまださんはFPTの社員です。", reading: "やまださんはFPTのしゃいんです。", romaji: "Yamada-san wa FPT no shain desu.", vi: "Anh Yamada là nhân viên của FPT." },
                    { jp: "アンさんは東京大学の学生です。", reading: "アンさんはとうきょうだいがくのがくせいです。", romaji: "An-san wa Toukyou daigaku no gakusei desu.", vi: "Bạn An là sinh viên của trường đại học Tokyo." },
                    { jp: "佐藤さんはABCのエンジニアです。", reading: "さとうさんはABCのエンジニアです。", romaji: "Satou-san wa ABC no enjinia desu.", vi: "Anh Sato là kỹ sư của công ty ABC." },
                    { jp: "ミラーさんはIMCの社員です。", reading: "ミラーさんはIMCのしゃいんです。", romaji: "Miraa-san wa IMC no shain desu.", vi: "Anh Miller là nhân viên của IMC." },
                    { jp: "私は日本語センターの先生です。", reading: "わたしはにほんごセンターのせんせいです。", romaji: "Watashi wa nihongo sentaa no sensei desu.", vi: "Tôi là giáo viên của trung tâm tiếng Nhật." }
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
                examples: [
                    { jp: "私の趣味は映画です。", reading: "わたしのしゅみはえいがです。", romaji: "Watashi no shumi wa eiga desu.", vi: "Sở thích của tôi là phim ảnh." },
                    { jp: "アンさんの誕生日は６月です。", reading: "アンさんのたんじょうびはろくがつです。", romaji: "An-san no tanjoubi wa rokugatsu desu.", vi: "Sinh nhật của bạn An là tháng 6." },
                    { jp: "私の電話番号は123です。", reading: "わたしのでんわばんごうは123です。", romaji: "Watashi no denwa bangou wa 123 desu.", vi: "Số điện thoại của tôi là 123." },
                    { jp: "田中さんの専門はコンピューターです。", reading: "たなかさんのせんもんはコンピューターです。", romaji: "Tanaka-san no senmon wa konpyuutaa desu.", vi: "Chuyên môn của anh Tanaka là máy tính." },
                    { jp: "私の父の職業は公務員です。", reading: "わたしのちちのしょくぎょうはこうむいんです。", romaji: "Watashi no chichi no shokugyou wa koumuin desu.", vi: "Nghề nghiệp của bố tôi là công chức." }
                ]
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
                examples: [
                    { jp: "私は二十歳です。Bさんも二十歳です。", reading: "わたしははたちです。Bさんもはたちです。", romaji: "Watashi wa hatachi desu. B-san mo hatachi desu.", vi: "Tôi 20 tuổi. Bạn B cũng 20 tuổi." },
                    { jp: "私も学生です。", reading: "わたしもがくせいです。", romaji: "Watashi mo gakusei desu.", vi: "Tôi cũng là sinh viên." },
                    { jp: "田中さんは日本人です。佐藤さんも日本人です。", reading: "たなかさんはにほんじんです。さとうさんもにほんじんです。", romaji: "Tanaka-san wa nihonjin desu. Satou-san mo nihonjin desu.", vi: "Anh Tanaka là người Nhật. Anh Sato cũng là người Nhật." },
                    { jp: "この本は五百円です。その本も五百円です。", reading: "このほんはごひゃくえんです。そのほんもごひゃくえんです。", romaji: "Kono hon wa gohyakuen desu. Sono hon mo gohyakuen desu.", vi: "Quyển sách này 500 yên. Quyển sách đó cũng 500 yên." },
                    { jp: "マリアさんは主婦です。アンさんも主婦です。", reading: "マリアさんはしゅふです。アンさんもしゅふです。", romaji: "Maria-san wa shufu desu. An-san mo shufu desu.", vi: "Chị Maria là nội trợ. Bạn An cũng là nội trợ." }
                ]
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
                examples: [
                    { jp: "さとさんは日本人じゃありません。", reading: "さとさんはにほんじんじゃありません。", romaji: "Sato-san wa nihonjin ja arimasen.", vi: "Bạn Sato không phải là người Nhật." },
                    { jp: "私は学生じゃありません。", reading: "わたしはがくせいじゃありません。", romaji: "Watashi wa gakusei ja arimasen.", vi: "Tôi không phải là sinh viên." },
                    { jp: "ミラーさんはアメリカ人じゃありません。", reading: "ミラーさんはアメリカじんじゃありません。", romaji: "Miraa-san wa amerikajin ja arimasen.", vi: "Anh Miller không phải là người Mỹ." },
                    { jp: "ここは食堂じゃありません。", reading: "ここはしょくどうじゃありません。", romaji: "Koko wa shokudou ja arimasen.", vi: "Ở đây không phải là nhà ăn." },
                    { jp: "今日は日曜日じゃありません。", reading: "きょうはにちようびじゃありません。", romaji: "Kyou wa nichiyoubi ja arimasen.", vi: "Hôm nay không phải là chủ nhật." }
                ]
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
                examples: [
                    { jp: "Bさんの国はどちらですか。", reading: "Bさんのくにはどちらですか。", romaji: "B-san no kuni wa dochira desu ka.", vi: "Đất nước của bạn B là ở đâu?" },
                    { jp: "お名前は何ですか。", reading: "おなまえはなんですか。", romaji: "Onamae wa nan desu ka.", vi: "Tên bạn là gì?" },
                    { jp: "あの方はどなたですか。", reading: "あのかたはどなたですか。", romaji: "Ano kata wa donata desu ka.", vi: "Vị kia là ai vậy?" },
                    { jp: "大学の電話番号は何番ですか。", reading: "だいがくのでんわばんごうはなんばんですか。", romaji: "Daigaku no denwa bangou wa nanban desu ka.", vi: "Số điện thoại của trường đại học là số mấy?" },
                    { jp: "お手洗いはどこですか。", reading: "おてあらいはどこですか。", romaji: "Otearai wa doko desu ka.", vi: "Nhà vệ sinh ở đâu vậy?" }
                ]
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
    },
    {
        id: "2",
        title: "Bài 2: Vị trí, Giá cả và Xuất xứ",
        subtitle: "JPD113 – Bài 2",
        description: "Học cách hỏi vị trí, số tầng, giá tiền, nội dung, xuất xứ và sở hữu.",
        points: [
            {
                id: "2_1",
                structure_jp: "〜は どこですか / どちらですか。",
                structure_vi: "~ ở đâu?",
                chips: ["〜", "どこ/どちら"],
                formula: "Danh từ + は + どこ (thông thường) / どちら (lịch sự) + ですか",
                explanation: "Hỏi vị trí",
                usage: "Hỏi vị trí của địa điểm, đồ vật hoặc người.",
                note: "どちら còn dùng để hỏi phương hướng.",
                color: "#ffb6c1", // pink
                examples: [
                    { jp: "トイレはどこですか。", reading: "トイレはどこですか。", romaji: "Toire wa doko desu ka.", vi: "Nhà vệ sinh ở đâu?" },
                    { jp: "エレベーターはどちらですか。", reading: "エレベーターはどちらですか。", romaji: "Erebeetaa wa dochira desu ka.", vi: "Thang máy ở đâu (hướng nào)?" },
                    { jp: "事務所はどこですか。", reading: "じむしょはどこですか。", romaji: "Jimusho wa doko desu ka.", vi: "Văn phòng ở đâu vậy?" },
                    { jp: "あなたの国はどちらですか。", reading: "あなたのくにはどちらですか。", romaji: "Anata no kuni wa dochira desu ka.", vi: "Đất nước của bạn là ở đâu (phía nào)?" },
                    { jp: "受付はどこですか。", reading: "うけつけはどこですか。", romaji: "Uketsuke wa doko desu ka.", vi: "Quầy tiếp tân ở đâu?" }
                ]
            },
            {
                id: "2_2",
                structure_jp: "〜は なんがいですか。",
                structure_vi: "~ ở tầng mấy?",
                chips: ["〜", "なんがい"],
                formula: "Danh từ + は + なんかい + ですか",
                explanation: "Hỏi số tầng",
                usage: "Hỏi vị trí tầng của một địa điểm trong tòa nhà.",
                note: "Trả lời bằng số tầng + かい/がい.",
                color: "#ffd700", // yellow
                examples: [
                    { jp: "レストランは何階ですか。", reading: "レストランはなんかいですか。", romaji: "Resutoran wa nankai desu ka.", vi: "Nhà hàng ở tầng mấy?" },
                    { jp: "会議室は何階ですか。", reading: "かいぎしつはなんかいですか。", romaji: "Kaigishitsu wa nankai desu ka.", vi: "Phòng họp ở tầng mấy?" },
                    { jp: "売り場は何階ですか。", reading: "うりばはなんかいですか。", romaji: "Uriba wa nankai desu ka.", vi: "Quầy bán hàng ở tầng mấy?" },
                    { jp: "パソコン売り場は何階ですか。", reading: "パソコンうりばはなんかいですか。", romaji: "Pasokon uriba wa nankai desu ka.", vi: "Quầy bán máy tính ở tầng mấy?" },
                    { jp: "私の部屋は三階です。", reading: "わたしのへやはさんがいです。", romaji: "Watashi no heya wa sangai desu.", vi: "Phòng của tôi ở tầng 3." }
                ]
            },
            {
                id: "2_3",
                structure_jp: "N を ください。",
                structure_vi: "Cho tôi N / Lấy cho tôi N",
                chips: ["N", "ください"],
                formula: "Danh từ + を + ください",
                explanation: "Yêu cầu/Gọi món",
                usage: "Dùng khi mua hàng hoặc gọi món trong nhà hàng.",
                note: "Có thể thêm số lượng vào trước ください.",
                color: "#98fb98", // green
                examples: [
                    { jp: "そのTシャツをください。", reading: "そのTシャツをください。", romaji: "Sono T-shatsu o kudasai.", vi: "Cho tôi cái áo thun đó." },
                    { jp: "りんごを三つください。", reading: "りんごをみっつください。", romaji: "Ringo o mittsu kudasai.", vi: "Cho tôi 3 quả táo." },
                    { jp: "このペンをください。", reading: "このペンをください。", romaji: "Kono pen o kudasai.", vi: "Lấy cho tôi cái bút này." },
                    { jp: "コーヒーを二つください。", reading: "コーヒーをふたつください。", romaji: "Koohii o futatsu kudasai.", vi: "Cho tôi 2 ly cà phê." },
                    { jp: "水をください。", reading: "みずをください。", romaji: "Mizu o kudasai.", vi: "Cho tôi xin nước." }
                ]
            },
            {
                id: "2_4",
                structure_jp: "〜は いくらですか。",
                structure_vi: "~ bao nhiêu tiền?",
                chips: ["〜", "いくら"],
                formula: "Danh từ + は + いくら + ですか",
                explanation: "Hỏi giá tiền",
                usage: "Dùng để hỏi giá của một món đồ.",
                note: "",
                color: "#dda0dd", // purple
                examples: []
            },
            {
                id: "2_5",
                structure_jp: "〜は どこの N ですか。",
                structure_vi: "N của nước nào/hãng nào?",
                chips: ["〜", "どこの N"],
                formula: "N1 + は + どこの + N2 + ですか",
                explanation: "Hỏi về xuất xứ/nơi sản xuất",
                usage: "Hỏi về nguồn gốc, nơi sản xuất của đồ vật.",
                note: "どこの trả lời bằng tên quốc gia hoặc tên công ty.",
                color: "#ffb6c1", // pink
                examples: [
                    { jp: "これはどこのビールですか。", reading: "これはどこのビールですか。", romaji: "Kore wa doko no biiru desu ka.", vi: "Đây là bia của nước nào?" },
                    { jp: "これはどこのカメラですか。", reading: "これはどこのカメラですか。", romaji: "Kore wa doko no kamera desu ka.", vi: "Đây là máy ảnh của hãng nào (nước nào)?" },
                    { jp: "それはどこの車ですか。", reading: "それはどこのくるまですか。", romaji: "Sore wa doko no kuruma desu ka.", vi: "Đó là xe ô tô của hãng nào?" },
                    { jp: "これはどこのワインですか。", reading: "これはどこのワインですか。", romaji: "Kore wa doko no wain desu ka.", vi: "Đây là rượu vang của nước nào?" },
                    { jp: "このネクタイはどこのですか。", reading: "このネクタイはどこのですか。", romaji: "Kono nekutai wa doko no desu ka.", vi: "Cái cà vạt này là của hãng nào?" }
                ]
            },
            {
                id: "2_6",
                structure_jp: "〜は だれの N ですか。",
                structure_vi: "N của ai?",
                chips: ["〜", "だれの N"],
                formula: "Danh từ 1 + は + だれの + Danh từ 2 + ですか",
                explanation: "Hỏi sở hữu",
                usage: "Hỏi xem một vật thuộc về ai.",
                note: "",
                color: "#ffd700", // yellow
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
        structureHtml = structureHtml.replace(chip, `<span class="inline-block bg-[#e0e7ff] text-[#4f46e5] text-xs font-bold px-2 py-0.5 rounded mr-1">${chip}</span>`);
    });
    structureBox.innerHTML = `<div class="text-xl font-bold mb-4">${structureHtml}</div><div class="h-px bg-gray-200 w-full mb-3"></div><div class="text-sm text-gray-600">${point.formula}</div>`;
    
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
                    ${ex.reading ? `<div class="example-reading text-sm text-[#4b6584] mt-1 ${showReading ? '' : 'hidden'}">${ex.reading}</div>` : ''}
                    <div class="example-romaji text-xs text-gray-500 mt-1 ${showRomaji ? '' : 'hidden'}">${ex.romaji}</div>
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

let showRomaji = false;
let showReading = false;

function toggleRomaji() {
    showRomaji = !showRomaji;
    const btn = document.getElementById('toggle-romaji-btn');
    if (showRomaji) {
        btn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Ẩn Romaji';
    } else {
        btn.innerHTML = '<i class="fa-solid fa-eye"></i> Hiện Romaji';
    }
    
    // Update all visible romaji
    const romajiEls = document.querySelectorAll('.example-romaji');
    romajiEls.forEach(el => {
        if (showRomaji) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
}

function toggleReading() {
    showReading = !showReading;
    const btn = document.getElementById('toggle-reading-btn');
    if (showReading) {
        btn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Ẩn Cách đọc';
    } else {
        btn.innerHTML = '<i class="fa-solid fa-eye"></i> Hiện Cách đọc';
    }
    
    // Update all visible reading
    const readingEls = document.querySelectorAll('.example-reading');
    readingEls.forEach(el => {
        if (showReading) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
}

