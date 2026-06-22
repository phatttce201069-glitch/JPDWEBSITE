const vocabularyData = [
    { id: 1, lesson: 1, word: "私", reading: "わたし", meaning: "Tôi", example: "私は学生です。" },
    { id: 2, lesson: 1, word: "学生", reading: "がくせい", meaning: "Học sinh, sinh viên", example: "私は学生です。" },
    { id: 3, lesson: 1, word: "先生", reading: "せんせい", meaning: "Giáo viên", example: "彼は先生です。" },
    { id: 4, lesson: 1, word: "学校", reading: "がっこう", meaning: "Trường học", example: "学校へ行きます。" },
    { id: 5, lesson: 1, word: "本", reading: "ほん", meaning: "Sách", example: "本を読みます。" },
    { id: 6, lesson: 1, word: "食べる", reading: "たべる", meaning: "Ăn", example: "りんごを食べます。" },
    { id: 7, lesson: 1, word: "飲む", reading: "のむ", meaning: "Uống", example: "水を飲みます。" },
    { id: 8, lesson: 1, word: "行く", reading: "いく", meaning: "Đi", example: "日本へ行きます。" },
    { id: 9, lesson: 1, word: "来る", reading: "くる", meaning: "Đến", example: "友達が来ます。" },
    { id: 10, lesson: 1, word: "見る", reading: "みる", meaning: "Nhìn, xem", example: "テレビを見ます。" },
    { id: 11, lesson: 2, word: "買う", reading: "かう", meaning: "Mua", example: "辞書を買います。" },
    { id: 12, lesson: 2, word: "会う", reading: "あう", meaning: "Gặp gỡ", example: "友達に会います。" },
    { id: 13, lesson: 2, word: "聞く", reading: "きく", meaning: "Nghe", example: "音楽を聞きます。" },
    { id: 14, lesson: 2, word: "話す", reading: "はなす", meaning: "Nói chuyện", example: "日本語を話します。" },
    { id: 15, lesson: 2, word: "読む", reading: "よむ", meaning: "Đọc", example: "新聞を読みます。" },
    { id: 16, lesson: 2, word: "書く", reading: "かく", meaning: "Viết", example: "手紙を書きます。" },
    { id: 17, lesson: 2, word: "起きる", reading: "おきる", meaning: "Thức dậy", example: "６時に起きます。" },
    { id: 18, lesson: 2, word: "寝る", reading: "ねる", meaning: "Ngủ", example: "１１時に寝ます。" },
    { id: 19, lesson: 2, word: "働く", reading: "はたらく", meaning: "Làm việc", example: "会社で働きます。" },
    { id: 20, lesson: 2, word: "休む", reading: "やすむ", meaning: "Nghỉ ngơi", example: "日曜日は休みます。" }
];

let bookmarks = JSON.parse(localStorage.getItem('vocab_bookmarks')) || [];
let currentLesson = 'all';

function renderDashboard() {
    const container = document.getElementById('dashboard-container');
    if (!container) return;
    
    // get unique lessons
    const lessons = [...new Set(vocabularyData.map(w => w.lesson))].filter(Boolean).sort((a,b) => a - b);
    
    container.innerHTML = '';
    
    // Thẻ "Tất cả"
    const allCount = vocabularyData.length;
    const allCard = document.createElement('div');
    allCard.className = 'bg-[#5f8a8b] p-8 rounded-3xl shadow-sm border border-[#4d7576] flex flex-col items-center justify-center cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group text-white';
    allCard.onclick = () => openLesson('all');
    allCard.innerHTML = `
        <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 text-white text-2xl transition-colors">
            <i class="fa-solid fa-layer-group"></i>
        </div>
        <h3 class="text-2xl font-bold mb-2">Tất cả</h3>
        <p class="text-white/80">${allCount} từ vựng</p>
    `;
    container.appendChild(allCard);
    
    lessons.forEach(l => {
        const wordCount = vocabularyData.filter(w => w.lesson == l).length;
        const card = document.createElement('div');
        card.className = 'bg-white p-8 rounded-3xl shadow-sm border border-[#e8e2db] flex flex-col items-center justify-center cursor-pointer hover:shadow-md hover:border-[#5f8a8b] hover:-translate-y-1 transition-all group';
        card.onclick = () => openLesson(l);
        card.innerHTML = `
            <div class="w-16 h-16 rounded-full bg-[#f4f1ee] flex items-center justify-center mb-4 group-hover:bg-[#5f8a8b] group-hover:text-white transition-colors text-[#8b7b6c] text-2xl">
                <i class="fa-solid fa-book"></i>
            </div>
            <h3 class="text-2xl font-bold text-[#5c544d] mb-2">Bài ${l}</h3>
            <p class="text-[#7d746d]">${wordCount} từ vựng</p>
        `;
        container.appendChild(card);
    });
}

function openLesson(lessonId) {
    currentLesson = lessonId;
    document.getElementById('dashboard-view').classList.remove('block');
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('lesson-detail-view').classList.remove('hidden');
    document.getElementById('lesson-detail-view').classList.add('block');
    
    const titleText = lessonId === 'all' ? 'Tất cả từ vựng' : `Bài ${lessonId}`;
    document.getElementById('page-title').textContent = titleText;
    document.getElementById('page-subtitle').textContent = "Học từ vựng qua Flashcards và kiểm tra bằng Quiz.";
    
    switchTab('list');
}

function closeLesson() {
    currentLesson = 'all';
    document.getElementById('lesson-detail-view').classList.remove('block');
    document.getElementById('lesson-detail-view').classList.add('hidden');
    document.getElementById('dashboard-view').classList.remove('hidden');
    document.getElementById('dashboard-view').classList.add('block');
    
    document.getElementById('page-title').textContent = "Luyện tập Từ Vựng";
    document.getElementById('page-subtitle').textContent = "Chọn một bài học để bắt đầu ôn tập qua Flashcards và kiểm tra bằng Quiz.";
}

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
    
    let filteredData = currentLesson === 'all' ? vocabularyData : vocabularyData.filter(w => w.lesson == currentLesson);
    
    const listToRender = filterBookmarkedList 
        ? filteredData.filter(w => isBookmarked(w.id))
        : filteredData;

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
    
    let filteredData = currentLesson === 'all' ? vocabularyData : vocabularyData.filter(w => w.lesson == currentLesson);
    
    flashcardList = onlyBookmarks 
        ? filteredData.filter(w => isBookmarked(w.id))
        : [...filteredData];
    
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
let wrongQuestions = [];
let quizMode = 'multiple';
let isRedoMode = false;

function showQuizSetup() {
    document.getElementById('quiz-setup').classList.remove('hidden');
    document.getElementById('quiz-active').classList.add('hidden');
    document.getElementById('quiz-result').classList.add('hidden');
}

function startQuiz() {
    isRedoMode = false;
    const onlyBookmarks = document.getElementById('quiz-bookmark-only').checked;
    const modeSelector = document.querySelector('input[name="quiz-mode"]:checked');
    quizMode = modeSelector ? modeSelector.value : 'multiple';

    quizList = vocabularyData.filter(w => {
        let matchBookmark = onlyBookmarks ? isBookmarked(w.id) : true;
        let matchLesson = currentLesson === 'all' ? true : w.lesson == currentLesson;
        return matchBookmark && matchLesson;
    });
    
    if (quizList.length < 4 && quizMode === 'multiple') {
        alert("Cần ít nhất 4 từ vựng để tạo bài Quiz trắc nghiệm. Hãy chọn bài khác hoặc tắt tùy chọn 'Chỉ tạo Quiz từ các từ đã lưu'.");
        return;
    } else if (quizList.length === 0) {
        alert("Không có từ vựng nào để tạo bài Quiz.");
        return;
    }

    // Shuffle quizList
    quizList.sort(() => Math.random() - 0.5);
    // Limit to 10 questions if large
    if(quizList.length > 10) quizList = quizList.slice(0, 10);

    currentQuizIndex = 0;
    quizScore = 0;
    wrongQuestions = [];

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
    const typingArea = document.getElementById('quiz-typing-area');
    
    if (quizMode === 'multiple') {
        optionsContainer.classList.remove('hidden');
        optionsContainer.classList.add('grid');
        typingArea.classList.add('hidden');
        typingArea.classList.remove('flex');
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
    } else {
        optionsContainer.classList.add('hidden');
        optionsContainer.classList.remove('grid');
        typingArea.classList.remove('hidden');
        typingArea.classList.add('flex');
        
        const inputEl = document.getElementById('quiz-typing-input');
        inputEl.value = '';
        inputEl.className = 'w-full max-w-md px-6 py-4 border-2 border-[#e8e2db] rounded-xl text-lg text-[#5c544d] focus:outline-none focus:border-[#5f8a8b] transition-colors mb-4 text-center placeholder-gray-400';
        inputEl.disabled = false;
        document.getElementById('quiz-typing-feedback').textContent = '';
        
        // Auto focus
        setTimeout(() => inputEl.focus(), 100);
    }
}

function checkAnswer(btn, isCorrect) {
    // Disable all options
    const allBtns = document.querySelectorAll('.quiz-option');
    allBtns.forEach(b => {
        b.onclick = null;
        b.classList.remove('hover:bg-[#f4f1ee]', 'hover:border-[#5f8a8b]', 'cursor-pointer');
    });

    const word = quizList[currentQuizIndex];

    if (isCorrect) {
        btn.classList.add('bg-[#d1fae5]', 'border-[#10b981]', 'text-[#065f46]');
        quizScore++;
    } else {
        btn.classList.add('bg-[#fee2e2]', 'border-[#ef4444]', 'text-[#991b1b]');
        if (!wrongQuestions.find(w => w.id === word.id)) wrongQuestions.push(word);
        // Highlight correct
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
    }, isCorrect ? 1000 : 2000);
}

function checkTypingAnswer() {
    const inputEl = document.getElementById('quiz-typing-input');
    if (inputEl.disabled) return; // Prevent double submit
    
    const userAnswer = inputEl.value.trim().toLowerCase();
    if (!userAnswer) return;
    
    inputEl.disabled = true;
    const word = quizList[currentQuizIndex];
    const correctAnswer = word.meaning.trim().toLowerCase();
    
    const isCorrect = userAnswer === correctAnswer;
    const feedbackEl = document.getElementById('quiz-typing-feedback');
    
    if (isCorrect) {
        inputEl.classList.remove('border-[#e8e2db]', 'focus:border-[#5f8a8b]');
        inputEl.classList.add('border-[#10b981]', 'bg-[#d1fae5]', 'text-[#065f46]');
        feedbackEl.textContent = 'Chính xác!';
        feedbackEl.className = 'mt-4 text-lg font-medium h-6 text-[#10b981]';
        quizScore++;
    } else {
        inputEl.classList.remove('border-[#e8e2db]', 'focus:border-[#5f8a8b]');
        inputEl.classList.add('border-[#ef4444]', 'bg-[#fee2e2]', 'text-[#991b1b]');
        feedbackEl.innerHTML = `Sai! Đáp án đúng: <strong>${word.meaning}</strong>`;
        feedbackEl.className = 'mt-4 text-lg font-medium h-6 text-[#ef4444]';
        if (!wrongQuestions.find(w => w.id === word.id)) wrongQuestions.push(word);
    }
    
    document.getElementById('quiz-score').textContent = `Điểm: ${quizScore}`;
    
    setTimeout(() => {
        currentQuizIndex++;
        if (currentQuizIndex < quizList.length) {
            renderQuizQuestion();
        } else {
            showQuizResult();
        }
    }, isCorrect ? 1000 : 2500);
}

function showQuizResult() {
    document.getElementById('quiz-active').classList.add('hidden');
    document.getElementById('quiz-result').classList.remove('hidden');
    document.getElementById('quiz-final-score').innerHTML = `Bạn trả lời đúng <strong class="text-[#5f8a8b]">${quizScore}/${quizList.length}</strong> câu.`;
    
    const redoBtn = document.getElementById('quiz-redo-btn');
    if (wrongQuestions.length > 0) {
        redoBtn.classList.remove('hidden');
        redoBtn.textContent = `Làm lại ${wrongQuestions.length} câu sai`;
    } else {
        redoBtn.classList.add('hidden');
    }
}

function startRedoQuiz() {
    isRedoMode = true;
    quizList = [...wrongQuestions];
    
    // Shuffle quizList
    quizList.sort(() => Math.random() - 0.5);

    currentQuizIndex = 0;
    quizScore = 0;
    wrongQuestions = []; // Reset wrong questions for this redo session

    document.getElementById('quiz-setup').classList.add('hidden');
    document.getElementById('quiz-result').classList.add('hidden');
    document.getElementById('quiz-active').classList.remove('hidden');

    renderQuizQuestion();
}

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
    // Default tab when a lesson is opened will be set by openLesson()
});
