// Các biến toàn cục lưu trạng thái hiện tại của ứng dụng
let currentAlphabet = "hiragana"; 
let currentFilterRow = "All";     // Bộ lọc hàng (VD: Hàng A, K, Bài 1...)
let activeData = [];              // Mảng chứa dữ liệu các chữ cái đang được hiển thị trên màn hình

// --- AUDIO ---
// Hàm phát âm thanh từ văn bản tiếng Nhật
function playSound(text) {
    if (text === "-") {
        return; // Bỏ qua nếu ký tự không có âm đọc
    }
    // Lọc bỏ các dấu chấm, gạch ngang để Web Speech API đọc mượt hơn
    const cleanText = text.replace(/[\.-]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "ja-JP"; 
    speechSynthesis.speak(utterance);
}

// --- ĐIỀU HƯỚNG BẢNG CHỮ CÁI ---
// Hàm đổi tab giữa Hiragana, Katakana và Kanji
function switchAlphabet(type) {
    currentAlphabet = type;

    // Đổi tiêu đề tương ứng với bảng chữ cái
    if (type === "hiragana") {
        document.getElementById("main-title").innerText = "Hành trình chinh phục Hiragana";
    } else if (type === "katakana") {
        document.getElementById("main-title").innerText = "Hành trình chinh phục Katakana";
    } else if (type === "kanji") {
        document.getElementById("main-title").innerText = "Hành trình chinh phục Kanji";
    }

    // Cập nhật lại UI: Nổi bật tab đang được chọn, làm mờ các tab còn lại
    const tabs = ["hiragana", "katakana", "kanji"];
    for (let i = 0; i < tabs.length; i++) {
        let t = tabs[i];
        const btn = document.getElementById("btn-" + t);
        if (btn) {
            if (t === type) {
                btn.className = "px-6 py-1.5 rounded-full bg-[#5f8a8b] text-white text-sm font-medium transition-all w-1/3 sm:w-auto";
            } else {
                btn.className = "px-6 py-1.5 rounded-full text-[#8b7b6c] text-sm font-medium hover:bg-[#f4f1ee] transition-all w-1/3 sm:w-auto";
            }
        }
    }

    // Gọi lại hàm lọc để hiển thị toàn bộ chữ của bảng mới chọn
    filterChars("All");
    renderQuizFilters();
    
    // Thoát quiz nếu đang trong quá trình làm để tránh lỗi logic
    exitQuiz();
}

// --- RENDER GIAO DIỆN BỘ LỌC ---
// Vẽ các nút bấm lọc (A, K, S... hoặc Bài 1, 2) trên giao diện học
function renderFilterButtons() {
    let rows = [];
    if (currentAlphabet === "kanji") {
        rows = ["Bài 1", "Bài 2", "Bài 3"];
    } else {
        rows = ["A", "K", "S", "T", "N", "H", "M", "Y", "R", "W"];
    }

    const container = document.getElementById("filter-buttons");
    let htmlContent = "";

    // Nút "Tất cả"
    let allBtnClass = "";
    if (currentFilterRow === "All") {
        allBtnClass = "filter-btn px-4 py-1.5 rounded-full bg-[#8b7b6c] text-white text-xs";
    } else {
        allBtnClass = "filter-btn px-4 py-1.5 rounded-full bg-white border border-[#e8e2db] text-[#8b7b6c] text-xs hover:bg-[#f4f1ee] transition-all";
    }
    htmlContent += `<button onclick="filterChars('All')" class="${allBtnClass}">Tất cả</button>`;

    // Render các nút bấm lọc theo mảng rows đã định nghĩa ở trên
    for (let i = 0; i < rows.length; i++) {
        let r = rows[i];
        let label = (currentAlphabet === "kanji") ? r : "Hàng " + r;

        let btnClass = "";
        if (currentFilterRow === r) {
            btnClass = "filter-btn px-4 py-1.5 rounded-full bg-[#8b7b6c] text-white text-xs";
        } else {
            btnClass = "filter-btn px-4 py-1.5 rounded-full bg-white border border-[#e8e2db] text-[#8b7b6c] text-xs hover:bg-[#f4f1ee] transition-all";
        }

        htmlContent += `<button onclick="filterChars('${r}')" class="${btnClass}">${label}</button>`;
    }

    container.innerHTML = htmlContent;
}

// Render các checkbox lọc (A, K, S...) bên trong phần Cài đặt Quiz
function renderQuizFilters() {
    const container = document.getElementById("quiz-row-filters");
    if (!container) return;

    let rows = [];
    if (currentAlphabet === "kanji") {
        rows = ["Bài 1", "Bài 2", "Bài 3"];
    } else {
        rows = ["A", "K", "S", "T", "N", "H", "M", "Y", "R", "W"];
    }

    let html = `
        <label class="flex items-center gap-1 text-sm bg-[#f4f1ee] px-3 py-1.5 rounded-lg cursor-pointer">
            <input type="checkbox" value="All" id="qrow-all" checked onchange="toggleAllRows()" class="accent-[#5f8a8b]" />
            Tất cả
        </label>
    `;

    for (let i = 0; i < rows.length; i++) {
        let r = rows[i];
        let label = (currentAlphabet === "kanji") ? r : "Hàng " + r;
        html += `
            <label class="flex items-center gap-1 text-sm bg-[#f4f1ee] px-3 py-1.5 rounded-lg cursor-pointer">
                <input type="checkbox" value="${r}" class="qrow-check accent-[#5f8a8b]" />
                ${label}
            </label>
        `;
    }

    container.innerHTML = html;
}

// --- LOGIC LỌC & HIỂN THỊ CHỮ CÁI ---
// Lọc dữ liệu tổng (alphabetData) và đổ vào lưới grid
function filterChars(row) {
    currentFilterRow = row;
    renderFilterButtons();

    // Duyệt dữ liệu tổng và chọn ra các chữ thỏa mãn bảng (type) và hàng (row)
    activeData = [];
    for (let i = 0; i < alphabetData.length; i++) {
        let d = alphabetData[i];
        if (d.type === currentAlphabet) {
            if (row === "All" || d.row === row) {
                activeData.push(d);
            }
        }
    }

    const grid = document.getElementById("char-grid");
    let gridHTML = "";

    // Đổ HTML hiển thị từng thẻ chữ cái
    for (let i = 0; i < activeData.length; i++) {
        let item = activeData[i];
        if (item.type === "kanji") {
            gridHTML += `
                <div class="bg-white p-4 rounded-xl card-shadow text-center">
                    <div class="text-4xl jp-font font-bold mb-3 cursor-pointer hover:text-[#5f8a8b] transition-colors" onclick="playSound('${item.char}')">
                        ${item.char}
                    </div>
                    <div class="flex flex-col gap-1 mb-2">
                        <div class="text-base bg-[#fdfbf7] border border-[#e8e2db] rounded p-1 flex justify-between items-center">
                            <span class="font-bold text-[#5f8a8b]">ON:</span>
                            <span class="cursor-pointer hover:underline" onclick="playSound('${item.onyomi}')">${item.onyomi}</span>
                        </div>
                        <div class="text-base bg-[#fdfbf7] border border-[#e8e2db] rounded p-1 flex justify-between items-center">
                            <span class="font-bold text-[#d97706]">KUN:</span>
                            <span class="cursor-pointer hover:underline" onclick="playSound('${item.kunyomi}')">${item.kunyomi}</span>
                        </div>
                    </div>
                    <div class="text-xs text-[#7d746d] font-medium">${item.example || ""}</div>
                </div>
            `;
        } else {
            gridHTML += `
                <div class="bg-white p-4 rounded-xl card-shadow text-center cursor-pointer hover:border-[#5f8a8b] border border-transparent transition-all" onclick="playSound('${item.char}')">
                    <div class="text-4xl jp-font font-bold mb-2">${item.char}</div>
                    <div class="text-sm text-[#8b7b6c] uppercase">${item.romaji}</div>
                    <div class="text-xs text-[#7d746d] mt-2">${item.example || ""}</div>
                    <button onclick="event.stopPropagation(); openAiModal('${item.char}', '${item.romaji}')" class="mt-2 text-xs text-[#5f8a8b] hover:underline">Hỏi AI</button>
                </div>
            `;
        }
    }

    grid.innerHTML = gridHTML;
    
    // Khởi tạo lại hệ thống Flashcard dựa trên activeData mới lọc
    fcFilter();
}

// --- LOGIC FLASHCARD ---
let fcIndex = 0;             // Vị trí thẻ hiện tại
let fcKnown = new Set();     // Tập hợp lưu các chữ cái người dùng đánh dấu "Đã nhớ"
let fcIsFlipped = false;     // Trạng thái lật của thẻ

// Khởi tạo/Reset lại Flashcard
function fcFilter() {
    fcIndex = 0;
    fcKnown.clear();
    renderFlashcard();
}

// Render dữ liệu lên thẻ Flashcard
function renderFlashcard() {
    if (activeData.length === 0) return;

    const item = activeData[fcIndex];
    document.getElementById("fc-front-char").textContent = item.char; // Mặt trước là chữ tiếng Nhật

    // Xử lý logic hiển thị mặt sau (Romaji/Nghĩa)
    if (item.type === "kanji") {
        if (item.kunyomi !== "-") {
            document.getElementById("fc-back-romaji").textContent = item.kunyomi;
        } else {
            document.getElementById("fc-back-romaji").textContent = item.onyomi;
        }
    } else {
        document.getElementById("fc-back-romaji").textContent = item.romaji.toUpperCase();
    }

    // Hiển thị ví dụ (nếu có)
    if (item.example) {
        document.getElementById("fc-back-example").textContent = item.example;
    } else {
        document.getElementById("fc-back-example").textContent = "";
    }

    // Cập nhật thanh tiến trình
    document.getElementById("fc-progress-label").textContent = fcIndex + 1 + " / " + activeData.length;
    document.getElementById("fc-known-label").textContent = "Đã nhớ: " + fcKnown.size;
    document.getElementById("fc-progress-bar").style.width = ((fcIndex + 1) / activeData.length) * 100 + "%";

    // Đặt lại thẻ về mặt trước
    document.getElementById("fc-card").classList.remove("flipped");
    fcIsFlipped = false;
}

// Hàm lật Flashcard qua lại
function flipCard() {
    if (fcIsFlipped) {
        fcIsFlipped = false;
        document.getElementById("fc-card").classList.remove("flipped");
    } else {
        fcIsFlipped = true;
        document.getElementById("fc-card").classList.add("flipped");
    }
}

// Điều hướng Flashcard (Tới/Lùi)
function fcNavigate(dir) {
    if (dir === 1) { // Tiến tới
        if (fcIndex === activeData.length - 1) { // Nếu đã tới thẻ cuối cùng
            // Kiểm tra xem đã nhớ hết chưa để hiện thông báo tổng kết
            if (fcKnown.size === activeData.length) {
                document.getElementById("fc-review-msg").innerHTML = "Tuyệt vời! Bạn đã ghi nhớ toàn bộ chữ cái trong phần này.";
                document.getElementById("btn-review-unlearned").classList.add("hidden");
                document.getElementById("btn-restart-fc").innerText = "Học lại từ đầu";
                document.getElementById("fc-review-modal").classList.remove("hidden");
            } else if (fcKnown.size > 0) {
                const unlearnedCount = activeData.length - fcKnown.size;
                document.getElementById("fc-review-msg").innerHTML = `Bạn còn <b class="text-[#d97706]">${unlearnedCount}</b> chữ chưa nhớ.<br>Bạn có muốn lọc ra để ôn lại không?`;
                document.getElementById("btn-review-unlearned").classList.remove("hidden");
                document.getElementById("btn-restart-fc").innerText = "Bỏ qua";
                document.getElementById("fc-review-modal").classList.remove("hidden");
            } else { // Quay lại từ đầu nếu chưa hoàn thành chu kì ghi nhớ
                fcIndex = 0;
                renderFlashcard();
            }
        } else {
            fcIndex = fcIndex + 1;
            renderFlashcard();
        }
    } else { // Lùi lại
        if (fcIndex === 0) {
            fcIndex = activeData.length - 1;
        } else {
            fcIndex = fcIndex - 1;
        }
        renderFlashcard();
    }
}

// Lọc ra các thẻ chưa nhớ để học lại
function reviewUnlearned() {
    let unlearnedData = [];
    for (let i = 0; i < activeData.length; i++) {
        if (!fcKnown.has(activeData[i].char)) {
            unlearnedData.push(activeData[i]);
        }
    }
    activeData = unlearnedData; // Cập nhật lại list active chỉ gồm chữ chưa học
    fcKnown.clear();
    fcIndex = 0;
    document.getElementById("fc-review-modal").classList.add("hidden");
    renderFlashcard();
}

function restartFlashcards() {
    fcIndex = 0;
    document.getElementById("fc-review-modal").classList.add("hidden");
    renderFlashcard();
}

// Đánh dấu thẻ là "Đã nhớ"
function markKnown() {
    fcKnown.add(activeData[fcIndex].char);
    setTimeout(function () {
        fcNavigate(1); // Tự động chuyển thẻ sau 300ms
    }, 300);
}

// --- LOGIC QUIZ ---
let quizQ = [];     // Danh sách câu hỏi
let quizCur = 0;    // Index câu hiện tại
let quizScore = 0;  // Điểm số

// Thiết lập và bắt đầu Quiz
function startQuiz() {
    const isAll = document.getElementById("qrow-all").checked;
    let selectedRows = [];

    // Lấy các hàng đã được chọn (checked)
    const checkboxes = document.querySelectorAll(".qrow-check");
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            selectedRows.push(checkboxes[i].value);
        }
    }

    let baseData = [];
    for (let i = 0; i < alphabetData.length; i++) {
        if (alphabetData[i].type === currentAlphabet) {
            baseData.push(alphabetData[i]);
        }
    }

    // Tạo 'pool' chứa các chữ được lọc dựa trên selectedRows
    let pool = [];
    if (selectedRows.length > 0) {
        for (let i = 0; i < baseData.length; i++) {
            if (selectedRows.includes(baseData[i].row)) {
                pool.push(baseData[i]);
            }
        }
    } else if (!isAll) {
        alert("Vui lòng chọn ít nhất 1 bài/hàng!");
        return;
    } else {
        pool = baseData;
    }

    if (pool.length < 4) {
        alert("Cần ít nhất 4 chữ để tạo quiz!");
        return;
    }

    const modeSelect = document.getElementById("q-mode");
    if (modeSelect.value === "typing" && currentAlphabet === "kanji") {
        alert("Chế độ gõ phiên âm chỉ dùng cho Hiragana và Katakana!");
        return;
    }

    // Xử lý số lượng câu hỏi
    const countSelect = document.getElementById("q-count").value;
    let numQ = 0;
    if (countSelect === "all") {
        numQ = pool.length;
    } else {
        numQ = parseInt(countSelect);
    }

    // Chọn ngẫu nhiên numQ câu hỏi từ pool
    quizQ = [];
    let tempPool = [...pool].sort(() => 0.5 - Math.random()); // Trộn ngẫu nhiên (Shuffle)

    while (quizQ.length < numQ) {
        if (tempPool.length === 0) {
            tempPool = [...pool].sort(() => 0.5 - Math.random());
        }
        quizQ.push(tempPool.pop());
    }

    // Khởi tạo các thông số và chuyển màn hình
    quizCur = 0;
    quizScore = 0;
    document.getElementById("quiz-setup").classList.add("hidden");
    document.getElementById("quiz-question").classList.remove("hidden");
    renderQuestion();
}

// Render một câu hỏi trong Quiz
function renderQuestion() {
    const q = quizQ[quizCur];
    const modeSelect = document.getElementById("q-mode");
    let mode = modeSelect ? modeSelect.value : "kana2romaji";

    // Random: tung đồng xu 50/50 chiều hỏi-đáp
    if (mode === "random") {
        if (Math.random() > 0.5) {
            mode = "kana2romaji";
        } else {
            mode = "romaji2kana";
        }
    }

    const optionsContainer = document.getElementById("q-options");
    const typingArea = document.getElementById("q-typing-area");
    const feedbackEl = document.getElementById("q-feedback");

    optionsContainer.innerHTML = "";
    feedbackEl.classList.add("hidden");

    // Hiển thị nội dung câu hỏi
    const promptEl = document.getElementById("q-prompt");
    if (currentAlphabet === "kanji") {
        if (mode === "romaji2kana") {
            let reading = [];
            if (q.onyomi !== "-") reading.push("ON: " + q.onyomi);
            if (q.kunyomi !== "-") reading.push("KUN: " + q.kunyomi);
            promptEl.textContent = reading.join(" / ") + "\n(" + q.example + ")"; 
            promptEl.className = "text-3xl font-bold text-[#4a443f] whitespace-pre-line";
        } else {
            promptEl.textContent = q.char; 
            promptEl.className = "text-6xl jp-font font-bold text-[#4a443f]";
        }
    } else {
        if (mode === "typing") {
            promptEl.textContent = q.char; 
            promptEl.className = "text-6xl jp-font font-bold text-[#4a443f]";
        } else if (mode === "romaji2kana") {
            let romajiText = q.romaji ? q.romaji.toUpperCase() : "HA";
            promptEl.textContent = romajiText; 
            promptEl.className = "text-6xl font-bold text-[#4a443f]";
        } else {
            promptEl.textContent = q.char; 
            promptEl.className = "text-6xl jp-font font-bold text-[#4a443f]";
        }
    }

    document.getElementById("q-progress-bar").style.width = ((quizCur + 1) / quizQ.length) * 100 + "%";

    // Phân luồng: Chế độ GÕ (Typing)
    if (mode === "typing" && currentAlphabet !== "kanji") {
        typingArea.classList.remove("hidden");
        optionsContainer.classList.add("hidden");
        const input = document.getElementById("q-typing-input");
        const checkBtn = document.querySelector("#q-typing-area button");
        
        input.value = "";
        input.disabled = false;
        input.focus();
        checkBtn.disabled = false;
        
        // Lưu đáp án vào HTML dataset để lát so sánh
        input.dataset.correctAnswer = q.romaji.toLowerCase();
        return;
    }

    // Phân luồng: Chế độ CHỌN ĐÁP ÁN (Trắc nghiệm)
    typingArea.classList.add("hidden");
    optionsContainer.classList.remove("hidden");

    // Lấy pool để sinh ra đáp án nhiễu
    let currentPool = [];
    for (let i = 0; i < alphabetData.length; i++) {
        if (alphabetData[i].type === currentAlphabet) {
            currentPool.push(alphabetData[i]);
        }
    }

    let wrongOpts = [];
    for (let i = 0; i < currentPool.length; i++) {
        if (currentPool[i].char !== q.char) {
            wrongOpts.push(currentPool[i]);
        }
    }
    wrongOpts = wrongOpts.sort(() => 0.5 - Math.random()).slice(0, 3); // Lấy ngẫu nhiên 3 đáp án sai

    // Trộn chung đáp án đúng và 3 đáp án sai
    let opts = [q, wrongOpts[0], wrongOpts[1], wrongOpts[2]];
    opts = opts.sort(() => 0.5 - Math.random());

    const container = document.getElementById("q-options");

    // Render nút đáp án
    for (let i = 0; i < opts.length; i++) {
        let o = opts[i];
        const btn = document.createElement("button");
        btn.className = "quiz-option py-4 border-2 border-[#e8e2db] rounded-xl font-bold transition-all px-2";

        if (currentAlphabet === "kanji") {
            if (mode === "romaji2kana") {
                btn.textContent = o.char; 
                btn.classList.add("text-3xl", "jp-font");
            } else {
                let reading = [];
                if (o.onyomi !== "-") reading.push("ON: " + o.onyomi);
                if (o.kunyomi !== "-") reading.push("KUN: " + o.kunyomi);
                btn.textContent = reading.join(" / ") + "\n(" + o.example + ")"; 
                btn.classList.add("text-sm", "whitespace-pre-line");
            }
        } else {
            if (mode === "romaji2kana") {
                btn.textContent = o.char; 
                btn.classList.add("text-3xl", "jp-font");
            } else {
                let romajiText = o.romaji ? o.romaji.toUpperCase() : "HA";
                btn.textContent = romajiText;
                btn.classList.add("text-lg");
            }
        }

        // Gắn cờ đúng/sai
        btn.dataset.correct = (o.char === q.char) ? "true" : "false";

        // Logic khi click chọn đáp án
        btn.onclick = function () {
            const allBtns = container.querySelectorAll("button");
            for (let j = 0; j < allBtns.length; j++) {
                allBtns[j].disabled = true; // Block các nút khác
                if (allBtns[j].dataset.correct === "true") {
                    allBtns[j].classList.add("correct");
                }
            }

            if (o.char === q.char) {
                quizScore = quizScore + 1;
            } else {
                btn.classList.add("wrong");
            }

            setTimeout(nextQuestion, 800); // Đợi 800ms sang câu tiếp
        };
        container.appendChild(btn);
    }
}

// Kiểm tra đáp án cho chế độ gõ phím
function checkTypingAnswer() {
    const input = document.getElementById("q-typing-input");
    const userAnswer = input.value.trim().toLowerCase();
    const correctAnswer = input.dataset.correctAnswer;
    const feedbackEl = document.getElementById("q-feedback");
    const checkBtn = document.querySelector("#q-typing-area button");

    if (!userAnswer) {
        feedbackEl.classList.remove("hidden");
        feedbackEl.textContent = "Vui lòng nhập câu trả lời!";
        feedbackEl.className = "text-center py-3 rounded-xl text-sm mb-4 bg-yellow-100 text-yellow-800";
        return;
    }

    input.disabled = true;
    checkBtn.disabled = true;

    if (userAnswer === correctAnswer) {
        quizScore = quizScore + 1;
        feedbackEl.classList.remove("hidden");
        feedbackEl.textContent = "✓ Chính xác!";
        feedbackEl.className = "text-center py-3 rounded-xl text-sm mb-4 bg-green-100 text-green-800";
    } else {
        feedbackEl.classList.remove("hidden");
        feedbackEl.textContent = `✗ Sai! Đáp án đúng là: ${correctAnswer}`;
        feedbackEl.className = "text-center py-3 rounded-xl text-sm mb-4 bg-red-100 text-red-800";
    }

    setTimeout(nextQuestion, 800);
}

// Chuyển sang câu hỏi kế tiếp
function nextQuestion() {
    quizCur = quizCur + 1;
    if (quizCur >= quizQ.length) {
        // Hết câu hỏi -> Hiện kết quả
        document.getElementById("quiz-question").classList.add("hidden");
        document.getElementById("quiz-result").classList.remove("hidden");
        document.getElementById("result-score").textContent = quizScore + " / " + quizQ.length;
    } else {
        renderQuestion();
    }
}

// --- CÁC HÀM UI HELPERS & RESET ---
function goToSetup() {
    document.getElementById("quiz-result").classList.add("hidden");
    document.getElementById("quiz-setup").classList.remove("hidden");
}

function switchTab(tab) {
    if (tab === "flashcard") {
        document.getElementById("panel-flashcard").classList.remove("hidden");
        document.getElementById("panel-quiz").classList.add("hidden");
        document.getElementById("tab-flashcard").classList.add("active");
        document.getElementById("tab-flashcard").classList.remove("text-[#8b7b6c]");
        document.getElementById("tab-quiz").classList.remove("active");
        document.getElementById("tab-quiz").classList.add("text-[#8b7b6c]");
    } else {
        document.getElementById("panel-quiz").classList.remove("hidden");
        document.getElementById("panel-flashcard").classList.add("hidden");
        document.getElementById("tab-quiz").classList.add("active");
        document.getElementById("tab-quiz").classList.remove("text-[#8b7b6c]");
        document.getElementById("tab-flashcard").classList.remove("active");
        document.getElementById("tab-flashcard").classList.add("text-[#8b7b6c]");
    }
}

function openAiModal(char, romaji) {
    document.getElementById("modal-char-title").innerText = char + " (" + romaji + ")";
    document.getElementById("ai-modal").style.display = "block";
}

function closeAiModal() {
    document.getElementById("ai-modal").style.display = "none";
}

function exitQuiz() {
    quizCur = 0;
    quizScore = 0;
    document.getElementById("quiz-question").classList.add("hidden");
    document.getElementById("quiz-result").classList.add("hidden");
    document.getElementById("quiz-setup").classList.remove("hidden");
}

function toggleAllRows() {
    const checkboxes = document.querySelectorAll(".qrow-check");
    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
    }
}

function shuffleFlashcards() {
    activeData = activeData.sort(() => 0.5 - Math.random());
    fcIndex = 0;
    fcKnown.clear();
    renderFlashcard();
}

function resetFlashcards() {
    filterChars(currentFilterRow);
}

// Init mặc định khi web vừa load xong
window.onload = function () {
    switchAlphabet("hiragana");
};