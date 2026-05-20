let currentAlphabet = "hiragana";
let currentFilterRow = "All";
let chartInstance = null;
let activeData = [];

function switchAlphabet(type) {
    currentAlphabet = type;
    document.getElementById("main-title").innerText =
        `Hành trình chinh phục ${type === "hiragana" ? "Hiragana" : "Katakana"}`;

    const btnHi = document.getElementById("btn-hiragana");
    const btnKa = document.getElementById("btn-katakana");

    if (type === "hiragana") {
        btnHi.className =
            "px-4 py-1.5 rounded-full bg-[#5f8a8b] text-white text-sm font-medium transition-all";
        btnKa.className =
            "px-4 py-1.5 rounded-full text-[#8b7b6c] text-sm font-medium hover:bg-[#f4f1ee] transition-all";
    } else {
        btnKa.className =
            "px-4 py-1.5 rounded-full bg-[#5f8a8b] text-white text-sm font-medium transition-all";
        btnHi.className =
            "px-4 py-1.5 rounded-full text-[#8b7b6c] text-sm font-medium hover:bg-[#f4f1ee] transition-all";
    }

    renderFilterButtons();
    filterChars("All");
}

function renderFilterButtons() {
    const rows = ["A", "K", "S", "T", "N", "H", "M", "Y", "R", "W"];
    const container = document.getElementById("filter-buttons");
    container.innerHTML = `<button onclick="filterChars('All')" class="filter-btn px-4 py-1.5 rounded-full bg-[#8b7b6c] text-white text-xs">Tất cả</button>`;

    rows.forEach((r) => {
        container.innerHTML += `<button onclick="filterChars('${r}')" class="filter-btn px-4 py-1.5 rounded-full bg-white border border-[#e8e2db] text-[#8b7b6c] text-xs">Hàng ${r}</button>`;
    });
}

function filterChars(row) {
    currentFilterRow = row;
    activeData = alphabetData.filter(
        (d) => d.type === currentAlphabet && (row === "All" || d.row === row),
    );

    const grid = document.getElementById("char-grid");
    grid.innerHTML = "";

    activeData.forEach((item) => {
        grid.innerHTML += `
            <div class="bg-white p-4 rounded-xl card-shadow text-center">
                <div class="text-4xl jp-font font-bold mb-2">${item.char}</div>
                <div class="text-sm text-[#8b7b6c] uppercase">${item.romaji}</div>
                <div class="text-xs text-[#7d746d] mt-2">${item.example || ""}</div>
                <button onclick="openAiModal('${item.char}', '${item.romaji}')" class="mt-2 text-xs text-[#5f8a8b]">Hỏi AI</button>
            </div>
        `;
    });

    fcFilter();
}



// Flashcard Logic
let fcIndex = 0,
    fcKnown = new Set(),
    fcIsFlipped = false;

function fcFilter() {
    fcIndex = 0;
    fcKnown.clear();
    renderFlashcard();
}

function renderFlashcard() {
    if (!activeData.length) return;
    const item = activeData[fcIndex];
    document.getElementById("fc-front-char").textContent = item.char;
    document.getElementById("fc-back-romaji").textContent =
        item.romaji.toUpperCase();
    document.getElementById("fc-back-example").textContent = item.example || "";
    document.getElementById("fc-progress-label").textContent =
        `${fcIndex + 1} / ${activeData.length}`;
    document.getElementById("fc-known-label").textContent =
        `Đã nhớ: ${fcKnown.size}`;
    document.getElementById("fc-progress-bar").style.width =
        `${((fcIndex + 1) / activeData.length) * 100}%`;
    document.getElementById("fc-card").classList.remove("flipped");
    fcIsFlipped = false;
}

function flipCard() {
    fcIsFlipped = !fcIsFlipped;
    document.getElementById("fc-card").classList.toggle("flipped", fcIsFlipped);
}

function fcNavigate(dir) {
    if (dir === 1 && fcIndex === activeData.length - 1) {
        if (fcKnown.size === activeData.length) {
            document.getElementById("fc-review-msg").innerHTML =
                "Tuyệt vời! Bạn đã ghi nhớ toàn bộ chữ cái trong phần này.";
            document
                .getElementById("btn-review-unlearned")
                .classList.add("hidden");
            document.getElementById("btn-restart-fc").innerText =
                "Học lại từ đầu";
            document
                .getElementById("fc-review-modal")
                .classList.remove("hidden");
        } else if (fcKnown.size > 0 && fcKnown.size < activeData.length) {
            const unlearnedCount = activeData.length - fcKnown.size;
            document.getElementById("fc-review-msg").innerHTML =
                `Bạn còn <b class="text-[#d97706]">${unlearnedCount}</b> chữ chưa nhớ.<br>Bạn có muốn lọc ra để ôn lại không?`;
            document
                .getElementById("btn-review-unlearned")
                .classList.remove("hidden");
            document.getElementById("btn-restart-fc").innerText = "Bỏ qua";
            document
                .getElementById("fc-review-modal")
                .classList.remove("hidden");
        } else {
            fcIndex = 0;
            renderFlashcard();
        }
    } else {
        fcIndex = (fcIndex + dir + activeData.length) % activeData.length;
        renderFlashcard();
    }
}

function reviewUnlearned() {
    activeData = activeData.filter((item) => !fcKnown.has(item.char));
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
    setTimeout(() => fcNavigate(1), 300);
}

// Quiz Logic
let quizQ = [],
    quizCur = 0,
    quizScore = 0;

function startQuiz() {
    const isAll = document.getElementById("qrow-all").checked;
    let selectedRows = [];

    if (!isAll) {
        document
            .querySelectorAll(".qrow-check:checked")
            .forEach((cb) => selectedRows.push(cb.value));
    }

    let pool = activeData;
    if (selectedRows.length > 0) {
        pool = activeData.filter((d) => selectedRows.includes(d.row));
    } else if (!isAll) {
        alert("Vui lòng chọn ít nhất 1 hàng chữ cái!");
        return;
    }

    if (pool.length < 4) {
        alert("Cần ít nhất 4 chữ cái để tạo quiz!");
        return;
    }

    const countSelect = document.getElementById("q-count").value;
    let numQ = countSelect === "all" ? pool.length : parseInt(countSelect);

    quizQ = [];
    let tempPool = [...pool].sort(() => 0.5 - Math.random());

    while (quizQ.length < numQ) {
        if (tempPool.length === 0) {
            tempPool = [...pool].sort(() => 0.5 - Math.random());
        }
        quizQ.push(tempPool.pop());
    }

    quizCur = quizScore = 0;

    document.getElementById("quiz-setup").classList.add("hidden");
    document.getElementById("quiz-question").classList.remove("hidden");
    renderQuestion();
}

function renderQuestion() {
    const q = quizQ[quizCur];
    document.getElementById("q-prompt").textContent = q.char;

    document.getElementById("q-progress-bar").style.width =
        `${((quizCur + 1) / quizQ.length) * 100}%`;

    const opts = [
        q,
        ...activeData
            .filter((d) => d.char !== q.char)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3),
    ].sort(() => 0.5 - Math.random());

    const container = document.getElementById("q-options");
    container.innerHTML = "";

    opts.forEach((o) => {
        const btn = document.createElement("button");
        btn.className =
            "quiz-option py-4 border-2 border-[#e8e2db] rounded-xl text-lg font-bold transition-all";
        btn.textContent = o.romaji.toUpperCase();
        btn.dataset.correct = (o.char === q.char).toString();

        btn.onclick = () => {
            const allBtns = container.querySelectorAll("button");
            allBtns.forEach((b) => {
                b.disabled = true;
                if (b.dataset.correct === "true") {
                    b.classList.add("correct");
                }
            });

            if (o.char === q.char) {
                quizScore++;
            } else {
                btn.classList.add("wrong");
            }

            setTimeout(nextQuestion, 1500);
        };
        container.appendChild(btn);
    });
}
function nextQuestion() {
    quizCur++;
    if (quizCur >= quizQ.length) {
        document.getElementById("quiz-question").classList.add("hidden");
        document.getElementById("quiz-result").classList.remove("hidden");
        document.getElementById("result-score").textContent =
            `${quizScore} / ${quizQ.length}`;
    } else {
        renderQuestion();
    }
}

function goToSetup() {
    document.getElementById("quiz-result").classList.add("hidden");
    document.getElementById("quiz-setup").classList.remove("hidden");
}

function switchTab(tab) {
    document
        .getElementById("panel-flashcard")
        .classList.toggle("hidden", tab !== "flashcard");
    document
        .getElementById("panel-quiz")
        .classList.toggle("hidden", tab !== "quiz");
}

function openAiModal(char, romaji) {
    document.getElementById("modal-char-title").innerText =
        `${char} (${romaji})`;
    document.getElementById("ai-modal").style.display = "block";
}
function closeAiModal() {
    document.getElementById("ai-modal").style.display = "none";
}

window.onload = () => switchAlphabet("hiragana");
function exitQuiz() {
    quizCur = 0;
    quizScore = 0;
    document.getElementById("quiz-question").classList.add("hidden");
    document.getElementById("quiz-setup").classList.remove("hidden");
}
function toggleAllRows() {
    document
        .querySelectorAll(".qrow-check")
        .forEach((cb) => (cb.checked = false));
}

function shuffleFlashcards() {
    activeData.sort(() => 0.5 - Math.random());
    fcIndex = 0;
    fcKnown.clear();
    renderFlashcard();
}

function resetFlashcards() {
    filterChars(currentFilterRow);
}
