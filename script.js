let currentQuestion;
let total = 0;
let correct = 0;

const wordEl = document.getElementById("word");
const labelEl = document.getElementById("languageLabel");
const resultEl = document.getElementById("result");
const nextButton = document.getElementById("nextButton");

const questionNumber = document.getElementById("questionNumber");
const correctCount = document.getElementById("correctCount");
const accuracy = document.getElementById("accuracy");

const buttons = document.querySelectorAll(".choice");

function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

function getPool() {

    const mode = document.getElementById("mode").value;

    if (mode === "turkish") {
        return WORDS.filter(w => w.lang === "turkish");
    }

    if (mode === "arabic") {
        return WORDS.filter(w => w.lang === "arabic");
    }

    return WORDS;
}

function nextQuestion() {

    resultEl.textContent = "";

    nextButton.style.display = "none";

    buttons.forEach(button => {

        button.disabled = false;
        button.className = "choice";

    });

    const pool = getPool();

    currentQuestion =
        pool[Math.floor(Math.random() * pool.length)];

    labelEl.textContent = "🇹🇷 トルコ語　🇸🇦 アラビア語";

wordEl.innerHTML =
    `<div>${currentQuestion.tr}</div>
     <div style="margin-top:15px;font-size:44px;direction:rtl;">
        ${currentQuestion.ar}
     </div>`;

    let choices = [currentQuestion.ja];
    
    while (choices.length < 4) {

     const candidate =
    pool[Math.floor(Math.random() * pool.length)].ja;

        if (!choices.includes(candidate)) {
            choices.push(candidate);
        }

    }

    shuffle(choices).forEach((choice, index) => {

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

    nextQuestion();

};

document.getElementById("mode").onchange = () => {

    total = 0;
    correct = 0;

    questionNumber.textContent = 1;
    correctCount.textContent = 0;
    accuracy.textContent = "0%";

    nextQuestion();

};

nextQuestion();