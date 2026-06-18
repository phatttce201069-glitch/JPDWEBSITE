let currentAlphabet = "hiragana";
let currentFilterRow = "All";
let activeData = [];

function playSound(text) {
    if (text === "-") {
        return;
    }
    const cleanText = text.replace(/[\.-]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ja-JP';
    speechSynthesis.speak(utterance);
}

function switchAlphabet(type) {
    currentAlphabet = type;
    
    if (type === "hiragana") {
        document.getElementById("main-title").innerText = "Hành trình chinh phục Hiragana";
    } else if (type === "katakana") {
        document.getElementById("main-title").innerText = "Hành trình chinh phục Katakana";
    } else if (type === "kanji") {
        document.getElementById("main-title").innerText = "Hành trình chinh phục Kanji";
    }

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

    filterChars("All");
    renderQuizFilters();
}

function renderFilterButtons() {
    let rows = [];
    if (currentAlphabet === "kanji") {
        rows = ["Bài 1", "Bài 2", "Bài 3"];
    } else {
        rows = ["A", "K", "S", "T", "N", "H", "M", "Y", "R", "W"];
    }
        
    const container = document.getElementById("filter-buttons");
    let htmlContent = "";

    let allBtnClass = "";
    if (currentFilterRow === "All") {
        allBtnClass = "filter-btn px-4 py-1.5 rounded-full bg-[#8b7b6c] text-white text-xs";
    } else {
        allBtnClass = "filter-btn px-4 py-1.5 rounded-full bg-white border border-[#e8e2db] text-[#8b7b6c] text-xs hover:bg-[#f4f1ee] transition-all";
    }
    htmlContent += `<button onclick="filterChars('All')" class="${allBtnClass}">Tất cả</button>`;

    for (let i = 0; i < rows.length; i++) {
        let r = rows[i];
        let label = "";
        if (currentAlphabet === "kanji") {
            label = r;
        } else {
            label = "Hàng " + r;
        }

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

function renderQuizFilters() {
    const container = document.getElementById("quiz-row-filters");
    if (!container) {
        return;
    }

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
        let label = "";
        if (currentAlphabet === "kanji") {
            label = r;
        } else {
            label = "Hàng " + r;
        }
        html += `
            <label class="flex items-center gap-1 text-sm bg-[#f4f1ee] px-3 py-1.5 rounded-lg cursor-pointer">
                <input type="checkbox" value="${r}" class="qrow-check accent-[#5f8a8b]" />
                ${label}
            </label>
        `;
    }

    container.innerHTML = html;
}

function filterChars(row) {
    currentFilterRow = row;
    renderFilterButtons();

    activeData = [];
    for (let i = 0; i < alphabetData.length; i++) {
        let d = alphabetData[i];
        if (d.type === currentAlphabet) {
            if (row === "All") {
                activeData.push(d);
            } else if (d.row === row) {
                activeData.push(d);
            }
        }
    }

    const grid = document.getElementById("char-grid");
    let gridHTML = "";

    for (let i = 0; i < activeData.length; i++) {
        let item = activeData[i];
        if (item.type === "kanji") {
            gridHTML += `
                <div class="bg-white p-4 rounded-xl card-shadow text-center">
                    <div class="text-4xl jp-font font-bold mb-3 cursor-pointer hover:text-[#5f8a8b] transition-colors" onclick="playSound('${item.char}')">
                        ${item.char}
                    </div>
                    <div class="flex flex-col gap-1 mb-2">
                        <div class="text-[11px] bg-[#fdfbf7] border border-[#e8e2db] rounded p-1 flex justify-between items-center">
                            <span class="font-bold text-[#5f8a8b]">ON:</span>
                            <span class="cursor-pointer hover:underline" onclick="playSound('${item.onyomi}')">${item.onyomi}</span>
                        </div>
                        <div class="text-[11px] bg-[#fdfbf7] border border-[#e8e2db] rounded p-1 flex justify-between items-center">
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
    fcFilter();
}

let fcIndex = 0;
let fcKnown = new Set();
let fcIsFlipped = false;

function fcFilter() {
    fcIndex = 0;
    fcKnown.clear();
    renderFlashcard();
}

function renderFlashcard() {
    if (activeData.length === 0) {
        return;
    }
    
    const item = activeData[fcIndex];
    document.getElementById("fc-front-char").textContent = item.char;
    
    if (item.type === "kanji") {
        if (item.kunyomi !== "-") {
            document.getElementById("fc-back-romaji").textContent = item.kunyomi;
        } else {
            document.getElementById("fc-back-romaji").textContent = item.onyomi;
        }
    } else {
        document.getElementById("fc-back-romaji").textContent = item.romaji.toUpperCase();
    }
    
    if (item.example) {
        document.getElementById("fc-back-example").textContent = item.example;
    } else {
        document.getElementById("fc-back-example").textContent = "";
    }
    
    document.getElementById("fc-progress-label").textContent = (fcIndex + 1) + " / " + activeData.length;
    document.getElementById("fc-known-label").textContent = "Đã nhớ: " + fcKnown.size;
    document.getElementById("fc-progress-bar").style.width = ((fcIndex + 1) / activeData.length * 100) + "%";
    
    document.getElementById("fc-card").classList.remove("flipped");
    fcIsFlipped = false;
}

function flipCard() {
    if (fcIsFlipped) {
        fcIsFlipped = false;
        document.getElementById("fc-card").classList.remove("flipped");
    } else {
        fcIsFlipped = true;
        document.getElementById("fc-card").classList.add("flipped");
    }
}

function fcNavigate(dir) {
    if (dir === 1) {
        if (fcIndex === activeData.length - 1) {
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
            } else {
                fcIndex = 0;
                renderFlashcard();
            }
        } else {
            fcIndex = fcIndex + 1;
            renderFlashcard();
        }
    } else {
        if (fcIndex === 0) {
            fcIndex = activeData.length - 1;
        } else {
            fcIndex = fcIndex - 1;
        }
        renderFlashcard();
    }
}

function reviewUnlearned() {
    let unlearnedData = [];
    for (let i = 0; i < activeData.length; i++) {
        if (!fcKnown.has(activeData[i].char)) {
            unlearnedData.push(activeData[i]);
        }
    }
    activeData = unlearnedData;
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

function markKnown() {
    fcKnown.add(activeData[fcIndex].char);
    setTimeout(function() {
        fcNavigate(1);
    }, 300);
}

let quizQ = [];
let quizCur = 0;
let quizScore = 0;

function startQuiz() {
    const isAll = document.getElementById("qrow-all").checked;
    let selectedRows = [];

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

    const countSelect = document.getElementById("q-count").value;
    let numQ = 0;
    if (countSelect === "all") {
        numQ = pool.length;
    } else {
        numQ = parseInt(countSelect);
    }

    quizQ = [];
    let tempPool = [...pool].sort(() => 0.5 - Math.random());

    while (quizQ.length < numQ) {
        if (tempPool.length === 0) {
            tempPool = [...pool].sort(() => 0.5 - Math.random());
        }
        quizQ.push(tempPool.pop());
    }

    quizCur = 0;
    quizScore = 0;
    document.getElementById("quiz-setup").classList.add("hidden");
    document.getElementById("quiz-question").classList.remove("hidden");
    renderQuestion();
}

function renderQuestion() {
    const q = quizQ[quizCur];
    
    // Lấy chế độ hỏi từ giao diện
    const modeSelect = document.getElementById("q-mode");
    let mode = "kana2romaji";
    if (modeSelect) {
        mode = modeSelect.value;
    }
    
    // Nếu chọn ngẫu nhiên, tung đồng xu 50/50 để quyết định chiều hỏi
    if (mode === "random") {
        if (Math.random() > 0.5) {
            mode = "kana2romaji";
        } else {
            mode = "romaji2kana";
        }
    }

    // Hiển thị câu hỏi (Prompt)
    const promptEl = document.getElementById("q-prompt");
    if (currentAlphabet === "kanji") {
        if (mode === "romaji2kana") {
            promptEl.textContent = q.example; // Hỏi Nghĩa
            promptEl.className = "text-3xl font-bold text-[#4a443f]";
        } else {
            promptEl.textContent = q.char; // Hỏi Kanji
            promptEl.className = "text-6xl jp-font font-bold text-[#4a443f]";
        }
    } else {
        if (mode === "romaji2kana") {
            let romajiText = "";
            if (q.romaji) {
                romajiText = q.romaji.toUpperCase();
            } else {
                romajiText = "HA"; // Phòng hờ lỗi dữ liệu
            }
            promptEl.textContent = romajiText; // Hỏi Romaji
            promptEl.className = "text-6xl font-bold text-[#4a443f]";
        } else {
            promptEl.textContent = q.char; // Hỏi Kana
            promptEl.className = "text-6xl jp-font font-bold text-[#4a443f]";
        }
    }

    document.getElementById("q-progress-bar").style.width = ((quizCur + 1) / quizQ.length * 100) + "%";

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
    wrongOpts = wrongOpts.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    let opts = [q, wrongOpts[0], wrongOpts[1], wrongOpts[2]];
    opts = opts.sort(() => 0.5 - Math.random());

    const container = document.getElementById("q-options");
    container.innerHTML = "";

    for (let i = 0; i < opts.length; i++) {
        let o = opts[i];
        const btn = document.createElement("button");
        btn.className = "quiz-option py-4 border-2 border-[#e8e2db] rounded-xl font-bold transition-all px-2";
        
        // Hiển thị đáp án (Options)
        if (currentAlphabet === "kanji") {
            if (mode === "romaji2kana") {
                btn.textContent = o.char; // Đáp án là chữ Kanji
                btn.classList.add("text-3xl", "jp-font");
            } else {
                btn.textContent = o.example; // Đáp án là Nghĩa
                btn.classList.add("text-sm");
            }
        } else {
            if (mode === "romaji2kana") {
                btn.textContent = o.char; // Đáp án là chữ Kana
                btn.classList.add("text-3xl", "jp-font");
            } else {
                let romajiText = "";
                if (o.romaji) {
                    romajiText = o.romaji.toUpperCase();
                } else {
                    romajiText = "HA"; 
                }
                btn.textContent = romajiText; // Đáp án là Romaji
                btn.classList.add("text-lg");
            }
        }
        
        if (o.char === q.char) {
            btn.dataset.correct = "true";
        } else {
            btn.dataset.correct = "false";
        }

        btn.onclick = function() {
            const allBtns = container.querySelectorAll("button");
            for (let j = 0; j < allBtns.length; j++) {
                allBtns[j].disabled = true;
                if (allBtns[j].dataset.correct === "true") {
                    allBtns[j].classList.add("correct");
                }
            }

            if (o.char === q.char) {
                quizScore = quizScore + 1;
            } else {
                btn.classList.add("wrong");
            }
            
            setTimeout(nextQuestion, 1500);
        };
        container.appendChild(btn);
    }
}

function nextQuestion() {
    quizCur = quizCur + 1;
    if (quizCur >= quizQ.length) {
        document.getElementById("quiz-question").classList.add("hidden");
        document.getElementById("quiz-result").classList.remove("hidden");
        document.getElementById("result-score").textContent = quizScore + " / " + quizQ.length;
    } else {
        renderQuestion();
    }
}

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

window.onload = function() {
    switchAlphabet("hiragana");
};