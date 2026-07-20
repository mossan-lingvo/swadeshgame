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
    vm.runInContext(`${fs.readFileSync("words.js", "utf8")}\n${fs.readFileSync("examples.js", "utf8")}\n${fs.readFileSync("script.js", "utf8")}`, context);
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

    const japaneseExamples = JSON.parse(vm.runInContext(
        "JSON.stringify(WORDS.map(word => getExample(word, LANGUAGES.turkish).ja))",
        context
    ));
    assert.ok(new Set(japaneseExamples).size >= 20,
        "examples should provide varied, contextual Japanese translations");
    assert.ok(japaneseExamples.every(example => !example.includes("という単語を学んでいます")));

    vm.runInContext(`WORDS.forEach(word => {
        Object.values(LANGUAGES).forEach(language => {
            const example = getExample(word, language);
            const wordCount = example.text.trim().split(/\\s+/).length;
            if (wordCount < 2 || wordCount > 6) {
                throw new Error(word.ja + "/" + language.key + " example has " + wordCount + " words");
            }
            const normalize = value => value.toLocaleLowerCase(language.lang)
                .normalize("NFD").replace(/\\p{M}/gu, "");
            const normalizedWord = normalize(word[language.key]);
            const searchableStem = normalizedWord.slice(0, Math.max(2, Math.ceil(normalizedWord.length * 0.6)));
            if (!normalize(example.text).includes(searchableStem)) {
                throw new Error(word.ja + "/" + language.key + " example omits its vocabulary word");
            }
            if (!example.ja) {
                throw new Error(word.ja + "/" + language.key + " needs a Japanese translation");
            }
            if (["ar", "fa", "hi"].includes(language.key) && !example.latn) {
                throw new Error(word.ja + "/" + language.key + " needs a transliteration");
            }
        });
    })`, context);

    const numberExamples = JSON.parse(vm.runInContext(
        "JSON.stringify(WORDS.slice(0, 10).map(word => EXAMPLES[word.ja]))", context));
    assert.equal(new Set(numberExamples.map(example => example.tr.sentence)).size, 10);
    assert.ok(numberExamples.every(example => example.reviewed === true));
    assert.ok(numberExamples.every(example => !example.tr.sentence.includes("Tahtaya")));

    const stoneExample = JSON.parse(vm.runInContext("JSON.stringify(EXAMPLES['石'])", context));
    assert.equal(stoneExample.tr.sentence, "Bu taş ağır.");
    Object.values(stoneExample).filter(value => typeof value === "object").forEach(example => {
        assert.equal(example.translationJa, "この石は重いです。");
        assert.ok(!example.translationJa.includes("きれいに見えます"));
    });
}

{
    const { context, ids } = createQuiz();
    ids.firstLanguage.value = "hindi";
    ids.firstLanguage.onchange();
    ids.secondLanguage.value = "mongolian";
    ids.secondLanguage.onchange();
    assert.match(ids.languageLabel.textContent, /ヒンディー語.*モンゴル語/);
    assert.ok(!ids.languageLabel.textContent.includes("→"));
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
