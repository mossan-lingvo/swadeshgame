const ROUND_SIZE = 10;

const LANGUAGES = {
    turkish: { label: "🇹🇷 トルコ語", key: "tr", lang: "tr" },
    arabic: { label: "🇸🇦 アラビア語", key: "ar", lang: "ar", transliterationKey: "arLatn", rtl: true },
    persian: { label: "🇮🇷 ペルシア語", key: "fa", lang: "fa", transliterationKey: "faLatn", rtl: true },
    mongolian: { label: "🇲🇳 モンゴル語", key: "mn", lang: "mn", ipaKey: "mnIpa" },
    hindi: { label: "🇮🇳 ヒンディー語", key: "hi", lang: "hi", transliterationKey: "hiLatn" }
};

let currentQuestion;
let previousQuestion;
let roundWords = [];
let learnedWords = new Set();
let retryQueue = [];
let attempts = 0;
let correct = 0;
let incorrect = 0;

const wordEl = document.getElementById("word");
const labelEl = document.getElementById("languageLabel");
const resultEl = document.getElementById("result");
const nextButton = document.getElementById("nextButton");
const examplesEl = document.getElementById("examples");
const exampleListEl = document.getElementById("exampleList");
const summaryEl = document.getElementById("roundSummary");
const firstLanguageEl = document.getElementById("firstLanguage");
const secondLanguageEl = document.getElementById("secondLanguage");
const learnedCountEl = document.getElementById("learnedCount");
const attemptCountEl = document.getElementById("attemptCount");
const accuracyEl = document.getElementById("accuracy");
const buttons = document.querySelectorAll(".choice");

function shuffle(array) {
    const shuffled = [...array];
    for (let index = shuffled.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    return shuffled;
}

function getSelectedLanguages() {
    return [LANGUAGES[firstLanguageEl.value], LANGUAGES[secondLanguageEl.value]];
}

function createText(className, text, language, direction) {
    const element = document.createElement("p");
    element.className = className;
    element.textContent = text;
    if (language) element.lang = language;
    if (direction) element.dir = direction;
    return element;
}

function getExample(word, language) {
    const example = EXAMPLES[word.ja]?.[language.key];
    if (!example) {
        throw new Error(`例文が登録されていません: ${word.ja}/${language.key}`);
    }

    return {
        text: example.sentence,
        latn: example.transliteration,
        ja: example.translationJa
    };
}

function renderExamples(languages) {
    exampleListEl.replaceChildren();
    languages.forEach(language => {
        const example = getExample(currentQuestion, language);
        const card = document.createElement("article");
        card.className = "example-card";
        const heading = document.createElement("h3");
        heading.textContent = language.label;
        card.appendChild(heading);
        card.appendChild(createText("example-sentence", example.text, language.lang, language.rtl ? "rtl" : "ltr"));
        if (example.latn) card.appendChild(createText("example-transliteration", example.latn, "en-Latn", "ltr"));
        card.appendChild(createText("example-translation", `日本語：${example.ja}`, "ja"));
        exampleListEl.appendChild(card);
    });
    examplesEl.hidden = false;
}

function renderWords(languages) {
    wordEl.replaceChildren();
    languages.forEach(language => {
        const entry = document.createElement("div");
        entry.className = "word-entry";
        entry.appendChild(createText("original-word", currentQuestion[language.key], language.lang, language.rtl ? "rtl" : "ltr"));
        if (language.transliterationKey) {
            entry.appendChild(createText("transliteration", currentQuestion[language.transliterationKey], "en-Latn", "ltr"));
        }
        if (language.ipaKey) {
            entry.appendChild(createText("ipa", `/${currentQuestion[language.ipaKey]}/`, "und-fonipa", "ltr"));
        }
        wordEl.appendChild(entry);
    });
}

function updateScore() {
    learnedCountEl.textContent = `${learnedWords.size}/${ROUND_SIZE}`;
    attemptCountEl.textContent = attempts;
    accuracyEl.textContent = attempts ? `${Math.round(correct / attempts * 100)}%` : "0%";
}

function pickQuestion() {
    const eligibleRetry = retryQueue.findIndex(item => attempts >= item.availableAfter);
    if (eligibleRetry >= 0) return retryQueue.splice(eligibleRetry, 1)[0].word;

    const queued = new Set(retryQueue.map(item => item.word));
    const candidates = roundWords.filter(word => !learnedWords.has(word) && !queued.has(word) && word !== previousQuestion);
    if (candidates.length) return candidates[Math.floor(Math.random() * candidates.length)];

    const waiting = retryQueue.shift();
    return waiting ? waiting.word : null;
}

function renderQuestion() {
    resultEl.textContent = "";
    examplesEl.hidden = true;
    summaryEl.hidden = true;
    exampleListEl.replaceChildren();
    nextButton.hidden = true;
    buttons.forEach(button => {
        button.hidden = false;
        button.disabled = false;
        button.className = "choice";
    });


    currentQuestion = pickQuestion();
    if (!currentQuestion) return showRoundSummary();
    previousQuestion = currentQuestion;
    const selectedLanguages = getSelectedLanguages();
    labelEl.textContent = selectedLanguages.map(language => language.label).join("　");
    renderWords(selectedLanguages);

    const choices = shuffle([
        currentQuestion.ja,
        ...shuffle(WORDS.filter(word => word !== currentQuestion).map(word => word.ja)).slice(0, 3)
    ]);
    choices.forEach((choice, index) => {
        buttons[index].textContent = choice;
        buttons[index].onclick = () => checkAnswer(choice);
    });
}

function checkAnswer(selected) {
    attempts++;
    const isCorrect = selected === currentQuestion.ja;
    if (isCorrect) {
        correct++;
        learnedWords.add(currentQuestion);
        retryQueue = retryQueue.filter(item => item.word !== currentQuestion);
        resultEl.textContent = "⭕ 正解！";
    } else {
        incorrect++;
        resultEl.textContent = `❌ 不正解！（正解：${currentQuestion.ja}）`;
        if (!retryQueue.some(item => item.word === currentQuestion)) {
            retryQueue.push({ word: currentQuestion, availableAfter: attempts + 1 });
        }
    }

    buttons.forEach(button => {
        button.disabled = true;
        if (button.textContent === currentQuestion.ja) button.classList.add("correct");
        else if (button.textContent === selected) button.classList.add("wrong");
    });
    renderExamples(getSelectedLanguages());
    updateScore();
    nextButton.textContent = learnedWords.size === ROUND_SIZE ? "結果を見る" : "次の問題";
    nextButton.hidden = false;
}

function showRoundSummary() {
    wordEl.replaceChildren();
    labelEl.textContent = "10語を学習しました！";
    buttons.forEach(button => { button.hidden = true; });
    examplesEl.hidden = true;
    resultEl.textContent = "";
    summaryEl.hidden = false;
    summaryEl.innerHTML = `<h2>今回の結果</h2><p>学習した単語：${ROUND_SIZE}語</p><p>総解答回数：${attempts}回</p><p>正解：${correct}回</p><p>不正解：${incorrect}回</p><p class="summary-accuracy">正答率：${Math.round(correct / attempts * 100)}%</p>`;
    nextButton.textContent = "次の10語";
    nextButton.hidden = false;
    nextButton.onclick = startRound;
}

function startRound() {
    roundWords = shuffle(WORDS).slice(0, ROUND_SIZE);
    learnedWords = new Set();
    retryQueue = [];
    previousQuestion = undefined;
    attempts = 0;
    correct = 0;
    incorrect = 0;
    nextButton.onclick = () => learnedWords.size === ROUND_SIZE ? showRoundSummary() : renderQuestion();
    updateScore();
    renderQuestion();
}

const previousSelections = { firstLanguage: firstLanguageEl.value, secondLanguage: secondLanguageEl.value };
function changeLanguage(changedSelect, otherSelect) {
    if (changedSelect.value === otherSelect.value) otherSelect.value = previousSelections[changedSelect.id];
    previousSelections.firstLanguage = firstLanguageEl.value;
    previousSelections.secondLanguage = secondLanguageEl.value;
    startRound();
}

firstLanguageEl.onchange = () => changeLanguage(firstLanguageEl, secondLanguageEl);
secondLanguageEl.onchange = () => changeLanguage(secondLanguageEl, firstLanguageEl);
document.getElementById("restart").onclick = startRound;
startRound();
