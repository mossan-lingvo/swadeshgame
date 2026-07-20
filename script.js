let currentQuestion;
let previousQuestion;
let total = 0;
let correct = 0;

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
    const mode = document.getElementById("mode").value;

    if (mode === "mixed") {
        return Object.values(LANGUAGES);
    }

    return [LANGUAGES[mode]];
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

    const candidates = WORDS.length > 1
        ? WORDS.filter(word => word !== previousQuestion)
        : WORDS;
    const question = candidates[Math.floor(Math.random() * candidates.length)];
    previousQuestion = question;

    return question;
}

function nextQuestion() {

    resultEl.textContent = "";

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

    }

    buttons.forEach(button => {

        button.disabled = true;

        if (button.textContent === currentQuestion.ja) {
            button.classList.add("correct");
        } else if (button.textContent === selected) {
            button.classList.add("wrong");
        }

    });

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

    nextQuestion();

};

document.getElementById("mode").onchange = () => {

    total = 0;
    correct = 0;

    questionNumber.textContent = 1;
    correctCount.textContent = 0;
    accuracy.textContent = "0%";
    previousQuestion = undefined;

    nextQuestion();

};

nextQuestion();
