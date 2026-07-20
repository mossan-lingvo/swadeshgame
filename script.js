let currentQuestion;
let previousQuestion;
let total = 0;
let correct = 0;
let retryQueue = [];

const LANGUAGES = {
    turkish: { label: "🇹🇷 トルコ語", key: "tr", lang: "tr" },
    arabic: { label: "🇸🇦 アラビア語", key: "ar", lang: "ar", transliterationKey: "arLatn", rtl: true },
    persian: { label: "🇮🇷 ペルシア語", key: "fa", lang: "fa", transliterationKey: "faLatn", rtl: true },
    mongolian: { label: "🇲🇳 モンゴル語", key: "mn", lang: "mn" }
};

const wordEl = document.getElementById("word");
const labelEl = document.getElementById("languageLabel");
const resultEl = document.getElementById("result");
const nextButton = document.getElementById("nextButton");
const examplesEl = document.getElementById("examples");
const exampleListEl = document.getElementById("exampleList");
const firstLanguageEl = document.getElementById("firstLanguage");
const secondLanguageEl = document.getElementById("secondLanguage");

const questionNumber = document.getElementById("questionNumber");
const correctCount = document.getElementById("correctCount");
const accuracy = document.getElementById("accuracy");

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

function renderExamples(languages) {
    exampleListEl.replaceChildren();

    languages.forEach(language => {
        const example = currentQuestion.examples[language.key];
        const card = document.createElement("article");
        card.className = "example-card";

        const heading = document.createElement("h3");
        heading.textContent = language.label;
        card.appendChild(heading);

        const sentence = document.createElement("p");
        sentence.className = "example-sentence";
        sentence.lang = language.lang;
        sentence.dir = language.rtl ? "rtl" : "ltr";
        sentence.textContent = example.text;
        card.appendChild(sentence);

        if (example.latn) {
            const transliteration = document.createElement("p");
            transliteration.className = "example-transliteration";
            transliteration.lang = "en-Latn";
            transliteration.dir = "ltr";
            transliteration.textContent = example.latn;
            card.appendChild(transliteration);
        }

        const translation = document.createElement("p");
        translation.className = "example-translation";
        translation.lang = "ja";
        translation.textContent = `日本語：${example.ja}`;
        card.appendChild(translation);

        exampleListEl.appendChild(card);
    });

    examplesEl.hidden = false;
}

function renderWords(languages) {
    wordEl.replaceChildren();

    languages.forEach(language => {
        const entry = document.createElement("div");
        entry.className = "word-entry";

        const original = document.createElement("div");
        original.lang = language.lang;
        original.dir = language.rtl ? "rtl" : "ltr";
        original.textContent = currentQuestion[language.key];
        entry.appendChild(original);

        if (language.transliterationKey) {
            const transliteration = document.createElement("div");
            transliteration.className = "transliteration";
            transliteration.lang = "en-Latn";
            transliteration.dir = "ltr";
            transliteration.textContent = currentQuestion[language.transliterationKey];
            entry.appendChild(transliteration);
        }

        wordEl.appendChild(entry);
    });
}

function pickQuestion() {
    if (WORDS.length < 4) {
        throw new Error("クイズには4件以上の単語が必要です。");
    }

    const retryIndex = retryQueue.findIndex(item => total >= item.availableAfter);
    let question;

    if (retryIndex >= 0) {
        question = retryQueue.splice(retryIndex, 1)[0].word;
    } else {
        const queuedWords = new Set(retryQueue.map(item => item.word));
        const candidates = WORDS.filter(word =>
            word !== previousQuestion && !queuedWords.has(word)
        );
        const pool = candidates.length > 0 ? candidates : WORDS.filter(word => word !== previousQuestion);
        question = pool[Math.floor(Math.random() * pool.length)];
    }

    previousQuestion = question;

    return question;
}

function nextQuestion() {

    resultEl.textContent = "";
    examplesEl.hidden = true;
    exampleListEl.replaceChildren();

    nextButton.style.display = "none";

    buttons.forEach(button => {

        button.disabled = false;
        button.className = "choice";

    });

    currentQuestion = pickQuestion();

    const selectedLanguages = getSelectedLanguages();

    labelEl.textContent = selectedLanguages.map(language => language.label).join("　");
    renderWords(selectedLanguages);

    const distractors = shuffle(
        WORDS.filter(word => word !== currentQuestion).map(word => word.ja)
    ).slice(0, 3);
    const choices = shuffle([currentQuestion.ja, ...distractors]);

    choices.forEach((choice, index) => {

        buttons[index].textContent = choice;

        buttons[index].onclick = () => check(choice);

    });

}

function check(selected) {

    total++;

    const isCorrect = selected === currentQuestion.ja;

    if (isCorrect) {

        correct++;
        resultEl.textContent = "⭕ 正解！";

    } else {

        resultEl.textContent =
            "❌ 不正解！（正解：" + currentQuestion.ja + "）";

        retryQueue.push({ word: currentQuestion, availableAfter: total + 1 });

    }

    buttons.forEach(button => {

        button.disabled = true;

        if (button.textContent === currentQuestion.ja) {
            button.classList.add("correct");
        } else if (button.textContent === selected) {
            button.classList.add("wrong");
        }

    });

    renderExamples(getSelectedLanguages());

    questionNumber.textContent = total + 1;
    correctCount.textContent = correct;
    accuracy.textContent =
        Math.round(correct / total * 100) + "%";

    nextButton.style.display = "block";

}

nextButton.onclick = nextQuestion;

document.getElementById("restart").onclick = () => {

    total = 0;
    correct = 0;

    questionNumber.textContent = 1;
    correctCount.textContent = 0;
    accuracy.textContent = "0%";
    previousQuestion = undefined;
    retryQueue = [];

    nextQuestion();

};

function resetForLanguageChange() {

    total = 0;
    correct = 0;

    questionNumber.textContent = 1;
    correctCount.textContent = 0;
    accuracy.textContent = "0%";
    previousQuestion = undefined;
    retryQueue = [];

    nextQuestion();

}

const previousSelections = {
    firstLanguage: firstLanguageEl.value,
    secondLanguage: secondLanguageEl.value
};

function changeLanguage(changedSelect, otherSelect) {
    if (changedSelect.value === otherSelect.value) {
        otherSelect.value = previousSelections[changedSelect.id];
    }

    previousSelections.firstLanguage = firstLanguageEl.value;
    previousSelections.secondLanguage = secondLanguageEl.value;
    resetForLanguageChange();
}

firstLanguageEl.onchange = () => changeLanguage(firstLanguageEl, secondLanguageEl);
secondLanguageEl.onchange = () => changeLanguage(secondLanguageEl, firstLanguageEl);

nextQuestion();
