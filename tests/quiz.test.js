const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

class Element {
    constructor(id = "") {
        this.id = id;
        this.children = [];
        this.className = "";
        this.dir = "";
        this.disabled = false;
        this.hidden = false;
        this.innerHTML = "";
        this.lang = "";
        this.style = {};
        this.textContent = "";
        this.value = "";
    }
    appendChild(child) { this.children.push(child); return child; }
    replaceChildren(...children) { this.children = children; }
    get classList() {
        return { add: name => {
            const names = new Set(this.className.split(" ").filter(Boolean));
            names.add(name);
            this.className = [...names].join(" ");
        }};
    }
}

function createQuiz() {
    const names = ["word", "languageLabel", "result", "nextButton", "examples", "exampleList",
        "roundSummary", "firstLanguage", "secondLanguage", "learnedCount", "attemptCount", "accuracy", "restart"];
    const ids = Object.fromEntries(names.map(id => [id, new Element(id)]));
    ids.firstLanguage.value = "turkish";
    ids.secondLanguage.value = "arabic";
    const choices = Array.from({ length: 4 }, () => new Element());
    const document = {
        createElement: () => new Element(),
        getElementById: id => ids[id],
        querySelectorAll: selector => selector === ".choice" ? choices : []
    };
    const predictableMath = Object.create(Math);
    predictableMath.random = () => 0;
    const context = vm.createContext({ console, document, Math: predictableMath, Set });
    vm.runInContext(`${fs.readFileSync("words.js", "utf8")}\n${fs.readFileSync("script.js", "utf8")}`, context);
    return { choices, context, ids };
}

{
    const { context } = createQuiz();
    const words = JSON.parse(vm.runInContext("JSON.stringify(WORDS)", context));
    assert.equal(words.length, 95);
    words.forEach(word => {
        ["tr", "ar", "arLatn", "fa", "faLatn", "mn", "mnIpa", "hi", "hiLatn"].forEach(key =>
            assert.ok(word[key], `${word.ja} needs ${key}`));
    });
    assert.equal(vm.runInContext("roundWords.length", context), 10);
}

{
    const { context, ids } = createQuiz();
    ids.firstLanguage.value = "hindi";
    ids.firstLanguage.onchange();
    ids.secondLanguage.value = "mongolian";
    ids.secondLanguage.onchange();
    assert.match(ids.languageLabel.textContent, /ヒンディー語.*モンゴル語/);
    assert.equal(ids.word.children[0].children[1].className, "transliteration");
    assert.equal(ids.word.children[1].children[1].className, "ipa");
    vm.runInContext("checkAnswer(currentQuestion.ja)", context);
    assert.equal(ids.exampleList.children.length, 2);
}

{
    const { context, ids } = createQuiz();
    const seen = new Set();
    for (let index = 0; index < 10; index++) {
        const word = vm.runInContext("currentQuestion", context);
        assert.ok(!seen.has(word), "a learned word must not repeat in the round");
        seen.add(word);
        vm.runInContext("checkAnswer(currentQuestion.ja)", context);
        if (index < 9) vm.runInContext("renderQuestion()", context);
    }
    vm.runInContext("showRoundSummary()", context);
    assert.equal(seen.size, 10);
    assert.match(ids.roundSummary.innerHTML, /正答率：100%/);
}

{
    const { context } = createQuiz();
    const missed = vm.runInContext("currentQuestion", context);
    vm.runInContext("checkAnswer('__wrong__'); renderQuestion()", context);
    assert.notEqual(vm.runInContext("currentQuestion", context), missed);
    vm.runInContext("checkAnswer(currentQuestion.ja); renderQuestion()", context);
    assert.equal(vm.runInContext("currentQuestion", context), missed);
}

console.log("Quiz behavior tests passed.");
