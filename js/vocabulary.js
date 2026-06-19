const vocabularyData = [
    { id: 1, word: "私", reading: "わたし", meaning: "Tôi", example: "私は学生です。" },
    { id: 2, word: "学生", reading: "がくせい", meaning: "Học sinh, sinh viên", example: "私は学生です。" },
    { id: 3, word: "先生", reading: "せんせい", meaning: "Giáo viên", example: "彼は先生です。" },
    { id: 4, word: "学校", reading: "がっこう", meaning: "Trường học", example: "学校へ行きます。" },
    { id: 5, word: "本", reading: "ほん", meaning: "Sách", example: "本を読みます。" },
    { id: 6, word: "食べる", reading: "たべる", meaning: "Ăn", example: "りんごを食べます。" },
    { id: 7, word: "飲む", reading: "のむ", meaning: "Uống", example: "水を飲みます。" },
    { id: 8, word: "行く", reading: "いく", meaning: "Đi", example: "日本へ行きます。" },
    { id: 9, word: "来る", reading: "くる", meaning: "Đến", example: "友達が来ます。" },
    { id: 10, word: "見る", reading: "みる", meaning: "Nhìn, xem", example: "テレビを見ます。" }
];

let bookmarks = JSON.parse(localStorage.getItem('vocab_bookmarks')) || [];

function playAudio(text, event) {
    if (event) {
        event.stopPropagation();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP'; // Tiếng Nhật
    window.speechSynthesis.speak(utterance);
}

function toggleBookmark(id) {
    const index = bookmarks.indexOf(id);
    if (index > -1) {
        bookmarks.splice(index, 1);
    } else {
        bookmarks.push(id);
    }
    localStorage.setItem('vocab_bookmarks', JSON.stringify(bookmarks));
    renderWordList();
    if (document.getElementById('view-flashcard').classList.contains('block')) {
        initFlashcard();
    }
}

function isBookmarked(id) {
    return bookmarks.includes(id);
}

// --- Tab Switching ---
function switchTab(tabId) {
    ['list', 'flashcard', 'quiz'].forEach(id => {
        document.getElementById(`view-${id}`).classList.add('hidden');
        document.getElementById(`view-${id}`).classList.remove('block');
        document.getElementById(`tab-${id}`).classList.remove('bg-[#5f8a8b]', 'text-white');
        document.getElementById(`tab-${id}`).classList.add('text-[#8b7b6c]');
    });
    
    document.getElementById(`view-${tabId}`).classList.remove('hidden');
    document.getElementById(`view-${tabId}`).classList.add('block');
    document.getElementById(`tab-${tabId}`).classList.add('bg-[#5f8a8b]', 'text-white');
    document.getElementById(`tab-${tabId}`).classList.remove('text-[#8b7b6c]');

    if (tabId === 'list') renderWordList();
    if (tabId === 'flashcard') initFlashcard();
    if (tabId === 'quiz') showQuizSetup();
}

// --- List View ---
let filterBookmarkedList = false;

function toggleFilterBookmark() {
    filterBookmarkedList = !filterBookmarkedList;
    const btn = document.getElementById('filter-bookmark-btn');
    if (filterBookmarkedList) {
        btn.classList.add('bg-[#f4f1ee]', 'font-bold');
    } else {
        btn.classList.remove('bg-[#f4f1ee]', 'font-bold');
    }
    renderWordList();
}

function renderWordList() {
    const container = document.getElementById('word-list-container');
    container.innerHTML = '';
    
    const listToRender = filterBookmarkedList 
        ? vocabularyData.filter(w => isBookmarked(w.id))
        : vocabularyData;

    if (listToRender.length === 0) {
        container.innerHTML = `<p class="col-span-full text-center text-[#7d746d] py-10">Không có từ vựng nào.</p>`;
        return;
    }

    listToRender.forEach(word => {
        const bookmarked = isBookmarked(word.id);
        const starIcon = bookmarked ? 'fa-solid text-[#d97706]' : 'fa-regular text-gray-300 hover:text-[#d97706]';
        
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-2xl shadow-sm border border-[#e8e2db] flex flex-col justify-between';
        card.innerHTML = `
            <div>
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-3">
                        <h4 class="text-3xl font-bold text-[#5c544d]">${word.word}</h4>
                        <button onclick="playAudio('${word.word}', event)" class="text-xl text-[#8b7b6c] hover:text-[#5f8a8b] transition-colors" title="Phát âm">
                            <i class="fa-solid fa-volume-high"></i>
                        </button>
                    </div>
                    <button onclick="toggleBookmark(${word.id})" class="text-xl transition-colors" title="Đánh dấu">
                        <i class="${starIcon} fa-star"></i>
                    </button>
                </div>
                <p class="text-sm text-[#7d746d] mb-4">${word.reading}</p>
                <p class="text-lg text-[#5f8a8b] font-medium">${word.meaning}</p>
            </div>
            <div class="mt-4 pt-4 border-t border-[#e8e2db]">
                <p class="text-sm text-[#7d746d] italic">${word.example}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- Flashcard View ---
let flashcardList = [];
let currentFlashcardIndex = 0;

function initFlashcard() {
    const onlyBookmarks = document.getElementById('flashcard-bookmark-only').checked;
    flashcardList = onlyBookmarks 
        ? vocabularyData.filter(w => isBookmarked(w.id))
        : [...vocabularyData];
    
    currentFlashcardIndex = 0;
    
    const container = document.getElementById('flashcard-container');
    if (container) {
        container.classList.remove('flipped');
    }

    renderFlashcard();
}

function renderFlashcard() {
    const container = document.getElementById('flashcard-container');
    const wordEl = document.getElementById('flashcard-word');
    const readingEl = document.getElementById('flashcard-reading');
    const meaningEl = document.getElementById('flashcard-meaning');
    const exampleEl = document.getElementById('flashcard-example');
    const progressEl = document.getElementById('flashcard-progress');
    const starEl = document.getElementById('flashcard-front-star');

    if (flashcardList.length === 0) {
        wordEl.textContent = "Trống";
        readingEl.textContent = "";
        meaningEl.textContent = "Không có từ nào để học.";
        exampleEl.textContent = "";
        progressEl.textContent = "0/0";
        return;
    }

    const word = flashcardList[currentFlashcardIndex];
    wordEl.textContent = word.word;
    readingEl.textContent = word.reading;
    meaningEl.textContent = word.meaning;
    exampleEl.textContent = word.example;
    progressEl.textContent = `${currentFlashcardIndex + 1}/${flashcardList.length}`;
    
    const isBookmarkedWord = isBookmarked(word.id);
    starEl.innerHTML = `<button onclick="event.stopPropagation(); toggleBookmark(${word.id})"><i class="${isBookmarkedWord ? 'fa-solid text-[#d97706]' : 'fa-regular'} fa-star"></i></button>`;
    
    const audioEl = document.getElementById('flashcard-front-audio');
    if (audioEl) {
        audioEl.innerHTML = `<button onclick="playAudio('${word.word}', event)"><i class="fa-solid fa-volume-high"></i></button>`;
    }
}

function flipFlashcard() {
    if (flashcardList.length === 0) return;
    const container = document.getElementById('flashcard-container');
    container.classList.toggle('flipped');
}

function nextFlashcard() {
    if (flashcardList.length === 0) return;
    const container = document.getElementById('flashcard-container');
    container.classList.remove('flipped');
    
    setTimeout(() => {
        currentFlashcardIndex = (currentFlashcardIndex + 1) % flashcardList.length;
        renderFlashcard();
    }, 150);
}

function prevFlashcard() {
    if (flashcardList.length === 0) return;
    const container = document.getElementById('flashcard-container');
    container.classList.remove('flipped');
    
    setTimeout(() => {
        currentFlashcardIndex = (currentFlashcardIndex - 1 + flashcardList.length) % flashcardList.length;
        renderFlashcard();
    }, 150);
}

// --- Quiz View ---
let quizList = [];
let currentQuizIndex = 0;
let quizScore = 0;

function showQuizSetup() {
    document.getElementById('quiz-setup').classList.remove('hidden');
    document.getElementById('quiz-active').classList.add('hidden');
    document.getElementById('quiz-result').classList.add('hidden');
}

function startQuiz() {
    const onlyBookmarks = document.getElementById('quiz-bookmark-only').checked;
    quizList = onlyBookmarks 
        ? vocabularyData.filter(w => isBookmarked(w.id))
        : [...vocabularyData];
    
    if (quizList.length < 4) {
        alert("Cần ít nhất 4 từ vựng để tạo bài Quiz. Hãy đánh dấu thêm từ hoặc bỏ chọn 'Chỉ tạo Quiz từ các từ đã lưu'.");
        return;
    }

    // Shuffle quizList
    quizList.sort(() => Math.random() - 0.5);
    // Limit to 10 questions if large
    if(quizList.length > 10) quizList = quizList.slice(0, 10);

    currentQuizIndex = 0;
    quizScore = 0;

    document.getElementById('quiz-setup').classList.add('hidden');
    document.getElementById('quiz-active').classList.remove('hidden');
    document.getElementById('quiz-result').classList.add('hidden');

    renderQuizQuestion();
}

function renderQuizQuestion() {
    const word = quizList[currentQuizIndex];
    document.getElementById('quiz-question-word').textContent = word.word;
    document.getElementById('quiz-question-reading').textContent = word.reading;
    document.getElementById('quiz-progress').textContent = `Câu ${currentQuizIndex + 1}/${quizList.length}`;
    document.getElementById('quiz-score').textContent = `Điểm: ${quizScore}`;

    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';

    // Generate options: 1 correct, 3 wrong
    let options = [word];
    let otherWords = vocabularyData.filter(w => w.id !== word.id);
    otherWords.sort(() => Math.random() - 0.5);
    options.push(...otherWords.slice(0, 3));
    options.sort(() => Math.random() - 0.5); // Shuffle options

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option w-full py-4 px-6 border-2 border-[#e8e2db] rounded-xl text-left text-[#5c544d] font-medium hover:bg-[#f4f1ee] hover:border-[#5f8a8b] transition-all bg-white';
        btn.textContent = opt.meaning;
        btn.onclick = () => checkAnswer(btn, opt.id === word.id);
        optionsContainer.appendChild(btn);
    });
}

function checkAnswer(btn, isCorrect) {
    // Disable all options
    const allBtns = document.querySelectorAll('.quiz-option');
    allBtns.forEach(b => {
        b.onclick = null;
        b.classList.remove('hover:bg-[#f4f1ee]', 'hover:border-[#5f8a8b]', 'cursor-pointer');
    });

    if (isCorrect) {
        btn.classList.add('bg-[#d1fae5]', 'border-[#10b981]', 'text-[#065f46]');
        quizScore++;
    } else {
        btn.classList.add('bg-[#fee2e2]', 'border-[#ef4444]', 'text-[#991b1b]');
        // Highlight correct
        const word = quizList[currentQuizIndex];
        allBtns.forEach(b => {
            if (b.textContent === word.meaning) {
                b.classList.add('bg-[#d1fae5]', 'border-[#10b981]', 'text-[#065f46]');
            }
        });
    }

    document.getElementById('quiz-score').textContent = `Điểm: ${quizScore}`;

    setTimeout(() => {
        currentQuizIndex++;
        if (currentQuizIndex < quizList.length) {
            renderQuizQuestion();
        } else {
            showQuizResult();
        }
    }, 1500);
}

function showQuizResult() {
    document.getElementById('quiz-active').classList.add('hidden');
    document.getElementById('quiz-result').classList.remove('hidden');
    document.getElementById('quiz-final-score').innerHTML = `Bạn trả lời đúng <strong class="text-[#5f8a8b]">${quizScore}/${quizList.length}</strong> câu.`;
}

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    switchTab('list');
});
