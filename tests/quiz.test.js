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
        this.lang = "";
        this.style = {};
        this.textContent = "";
        this.value = "";
    }

    appendChild(child) {
        this.children.push(child);
        return child;
    }

    replaceChildren(...children) {
        this.children = children;
    }

    get classList() {
        return {
            add: className => {
                const classNames = new Set(this.className.split(" ").filter(Boolean));
                classNames.add(className);
                this.className = [...classNames].join(" ");
            }
        };
    }
}

function createQuiz() {
    const ids = Object.fromEntries([
        "word", "languageLabel", "result", "nextButton", "examples", "exampleList",
        "firstLanguage", "secondLanguage", "questionNumber", "correctCount", "accuracy", "restart"
    ].map(id => [id, new Element(id)]));
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
    const source = `${fs.readFileSync("words.js", "utf8")}\n${fs.readFileSync("script.js", "utf8")}`;
    vm.runInContext(source, context);

    return { choices, context, ids };
}

{
    const { context } = createQuiz();
    const data = JSON.parse(vm.runInContext("JSON.stringify(WORDS)", context));

    data.forEach(word => {
        ["tr", "ar", "fa", "mn"].forEach(language => {
            assert.ok(word.examples[language].text, `${word.ja}/${language} needs an example`);
            assert.ok(word.examples[language].ja, `${word.ja}/${language} needs a Japanese translation`);
        });
        assert.ok(word.examples.ar.latn, `${word.ja}/ar needs a transliteration`);
        assert.ok(word.examples.fa.latn, `${word.ja}/fa needs a transliteration`);
    });
}

{
    const { context, ids } = createQuiz();
    assert.equal(ids.word.children.length, 2);
    assert.match(ids.languageLabel.textContent, /トルコ語.*アラビア語/);

    ids.firstLanguage.value = "persian";
    ids.firstLanguage.onchange();
    ids.secondLanguage.value = "mongolian";
    ids.secondLanguage.onchange();
    assert.match(ids.languageLabel.textContent, /ペルシア語.*モンゴル語/);
    assert.equal(ids.word.children[0].children[0].lang, "fa");
    assert.equal(ids.word.children[1].children[0].lang, "mn");

    vm.runInContext("check(currentQuestion.ja)", context);
    assert.equal(ids.examples.hidden, false);
    assert.equal(ids.exampleList.children.length, 2);
    assert.match(ids.exampleList.children[0].children.at(-1).textContent, /^日本語：/);
}

{
    const { context } = createQuiz();
    const missedWord = vm.runInContext("currentQuestion", context);
    vm.runInContext("check('__wrong__'); nextQuestion()", context);
    assert.notEqual(vm.runInContext("currentQuestion", context), missedWord);
    vm.runInContext("check(currentQuestion.ja); nextQuestion()", context);
    assert.equal(vm.runInContext("currentQuestion", context), missedWord);
}

console.log("Quiz behavior tests passed.");
