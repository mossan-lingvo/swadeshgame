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

const EXAMPLE_GROUPS = {
    count: new Set(["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"]),
    nature: new Set(["太陽", "月", "星", "空", "木", "石", "道", "山", "川", "海"]),
    weather: new Set(["雨", "風", "雪"]),
    animal: new Set(["魚", "鳥", "犬", "猫"]),
    people: new Set(["人", "子ども", "母", "父", "男の人", "女の人", "友だち"]),
    body: new Set(["目", "耳", "鼻", "口", "手", "足", "頭", "心臓・心"]),
    place: new Set(["家", "学校", "部屋", "店", "駅", "ホテル", "トイレ", "病院"]),
    food: new Set(["食べ物", "パン", "米・ご飯", "肉", "卵", "塩"]),
    drink: new Set(["水", "お茶", "コーヒー"]),
    time: new Set(["今日", "明日", "昨日", "今", "朝", "夜", "日・昼", "年", "時間", "分"]),
    transport: new Set(["電車", "バス", "車", "自転車", "切符"]),
    work: new Set(["医者", "仕事", "先生", "学生"]),
    study: new Set(["本", "紙", "ペン", "机", "椅子"]),
    belongings: new Set(["ドア", "窓", "服", "靴", "鍵", "かばん", "電話", "写真", "名前", "お金", "薬"])
};

function getExampleGroup(word) {
    return Object.keys(EXAMPLE_GROUPS).find(group => EXAMPLE_GROUPS[group].has(word.ja)) || "belongings";
}

function getExample(word, language) {
    const group = getExampleGroup(word);
    const examples = {
        count: {
            tr: [`Tahtaya ${word.tr} sayısını yazdım.`, `tahtaya ${word.tr} sayısını yazdım`],
            ar: [`كتبت الرقم ${word.ar} على اللوح.`, `katabtu al-raqama ${word.arLatn} ʿalā al-lawḥ`],
            fa: [`عدد ${word.fa} را روی تخته نوشتم.`, `adad-e ${word.faLatn} râ ru-ye taxte neveshtam`],
            mn: [`Би самбар дээр ${word.mn} гэсэн тоо бичлээ.`],
            hi: [`मैंने बोर्ड पर ${word.hi} लिखा।`, `mainne borḍ par ${word.hiLatn} likhā`],
            ja: `黒板に「${word.ja}」と書きました。`
        },
        nature: {
            tr: [`Bugün ${word.tr} çok güzel görünüyor.`, `bugün ${word.tr} çok güzel görünüyor`],
            ar: [`يبدو ${word.ar} جميلا اليوم.`, `yabdū ${word.arLatn} jamīlan al-yawm`],
            fa: [`${word.fa} امروز زیبا به نظر می‌رسد.`, `${word.faLatn} emruz zibâ be nazar miresad`],
            mn: [`Өнөөдөр ${word.mn} сайхан харагдаж байна.`],
            hi: [`आज ${word.hi} बहुत सुंदर दिख रहा है।`, `āj ${word.hiLatn} bahut sundar dikh rahā hai`],
            ja: `今日は${word.ja}がとてもきれいに見えます。`
        },
        weather: {
            tr: [`Bugün ${word.tr} çok güçlü.`, `bugün ${word.tr} çok güçlü`],
            ar: [`${word.ar} قوي اليوم.`, `${word.arLatn} qawī al-yawm`],
            fa: [`${word.fa} امروز شدید است.`, `${word.faLatn} emruz shadid ast`],
            mn: [`Өнөөдөр ${word.mn} их байна.`],
            hi: [`आज ${word.hi} तेज़ है।`, `āj ${word.hiLatn} tez hai`],
            ja: `今日は${word.ja}が強いです。`
        },
        animal: {
            tr: [`Bahçede bir ${word.tr} gördüm.`, `bahçede bir ${word.tr} gördüm`],
            ar: [`رأيت ${word.ar} في الحديقة.`, `raʾaytu ${word.arLatn} fī al-ḥadīqa`],
            fa: [`یک ${word.fa} در باغ دیدم.`, `yek ${word.faLatn} dar bâq didam`],
            mn: [`Би цэцэрлэгт ${word.mn} харлаа.`],
            hi: [`मैंने बगीचे में ${word.hi} देखा।`, `mainne bagīche mẽ ${word.hiLatn} dekhā`],
            ja: `庭で${word.ja}を見ました。`
        },
        people: {
            tr: [`${word.tr} bugün bize geldi.`, `${word.tr} bugün bize geldi`],
            ar: [`جاء ${word.ar} لزيارتنا اليوم.`, `jāʾa ${word.arLatn} li-ziyāratinā al-yawm`],
            fa: [`${word.fa} امروز به دیدن ما آمد.`, `${word.faLatn} emruz be didan-e mâ âmad`],
            mn: [`${word.mn} өнөөдөр манайд ирлээ.`],
            hi: [`${word.hi} आज हमसे मिलने आया।`, `${word.hiLatn} āj hamse milne āyā`],
            ja: `${word.ja}が今日、私たちを訪ねてきました。`
        },
        body: {
            tr: [`Doktor ${word.tr} kontrol etti.`, `doktor ${word.tr} kontrol etti`],
            ar: [`فحص الطبيب ${word.ar}.`, `faḥaṣa al-ṭabību ${word.arLatn}`],
            fa: [`پزشک ${word.fa} را معاینه کرد.`, `pezeshk ${word.faLatn} râ moâyene kard`],
            mn: [`Эмч миний ${word.mn} үзлээ.`],
            hi: [`डॉक्टर ने ${word.hi} की जाँच की।`, `ḍŏkṭar ne ${word.hiLatn} kī jā̃ch kī`],
            ja: `医者が${word.ja}を診察しました。`
        },
        place: {
            tr: [`${word.tr} buraya yakın.`, `${word.tr} buraya yakın`],
            ar: [`${word.ar} قريب من هنا.`, `${word.arLatn} qarīb min hunā`],
            fa: [`${word.fa} نزدیک اینجاست.`, `${word.faLatn} nazdik-e injâst`],
            mn: [`${word.mn} эндээс ойрхон.`],
            hi: [`${word.hi} यहाँ से पास है।`, `${word.hiLatn} yahā̃ se pās hai`],
            ja: `${word.ja}はここから近いです。`
        },
        food: {
            tr: [`Masada ${word.tr} var.`, `masada ${word.tr} var`],
            ar: [`يوجد ${word.ar} على المائدة.`, `yūjadu ${word.arLatn} ʿalā al-māʾida`],
            fa: [`${word.fa} روی میز است.`, `${word.faLatn} ru-ye miz ast`],
            mn: [`Ширээн дээр ${word.mn} байна.`],
            hi: [`मेज़ पर ${word.hi} है।`, `mez par ${word.hiLatn} hai`],
            ja: `テーブルの上に${word.ja}があります。`
        },
        drink: {
            tr: [`Her sabah ${word.tr} içiyorum.`, `her sabah ${word.tr} içiyorum`],
            ar: [`أشرب ${word.ar} كل صباح.`, `ashrabu ${word.arLatn} kulla ṣabāḥ`],
            fa: [`هر صبح ${word.fa} می‌نوشم.`, `har sobh ${word.faLatn} minusham`],
            mn: [`Би өглөө бүр ${word.mn} уудаг.`],
            hi: [`मैं हर सुबह ${word.hi} पीता हूँ।`, `main har subah ${word.hiLatn} pītā hū̃`],
            ja: `私は毎朝${word.ja}を飲みます。`
        },
        time: {
            tr: [`${word.tr} için bir plan yaptım.`, `${word.tr} için bir plan yaptım`],
            ar: [`وضعت خطة من أجل ${word.ar}.`, `waḍaʿtu khuṭṭatan min ajli ${word.arLatn}`],
            fa: [`برای ${word.fa} برنامه دارم.`, `barâ-ye ${word.faLatn} barnâme dâram`],
            mn: [`Би ${word.mn}-д зориулж төлөвлөгөө гаргасан.`],
            hi: [`मैंने ${word.hi} के लिए योजना बनाई।`, `mainne ${word.hiLatn} ke lie yojnā banāī`],
            ja: `${word.ja}のために予定を立てました。`
        },
        transport: {
            tr: [`Her gün ${word.tr} kullanıyorum.`, `her gün ${word.tr} kullanıyorum`],
            ar: [`أستخدم ${word.ar} كل يوم.`, `astakhdimu ${word.arLatn} kulla yawm`],
            fa: [`هر روز از ${word.fa} استفاده می‌کنم.`, `har ruz az ${word.faLatn} estefâde mikonam`],
            mn: [`Би өдөр бүр ${word.mn} хэрэглэдэг.`],
            hi: [`मैं हर दिन ${word.hi} इस्तेमाल करता हूँ।`, `main har din ${word.hiLatn} istemāl kartā hū̃`],
            ja: `私は毎日${word.ja}を使います。`
        },
        work: {
            tr: [`${word.tr} bugün çok meşgul.`, `${word.tr} bugün çok meşgul`],
            ar: [`${word.ar} مشغول اليوم.`, `${word.arLatn} mashghūl al-yawm`],
            fa: [`${word.fa} امروز مشغول است.`, `${word.faLatn} emruz mashqul ast`],
            mn: [`${word.mn} өнөөдөр завгүй байна.`],
            hi: [`${word.hi} आज व्यस्त है।`, `${word.hiLatn} āj vyast hai`],
            ja: `${word.ja}は今日は忙しいです。`
        },
        study: {
            tr: [`Ders için ${word.tr} kullanıyorum.`, `ders için ${word.tr} kullanıyorum`],
            ar: [`أستخدم ${word.ar} في الدرس.`, `astakhdimu ${word.arLatn} fī al-dars`],
            fa: [`در کلاس از ${word.fa} استفاده می‌کنم.`, `dar kelâs az ${word.faLatn} estefâde mikonam`],
            mn: [`Би хичээлдээ ${word.mn} хэрэглэдэг.`],
            hi: [`मैं कक्षा में ${word.hi} इस्तेमाल करता हूँ।`, `main kakshā mẽ ${word.hiLatn} istemāl kartā hū̃`],
            ja: `授業で${word.ja}を使います。`
        },
        belongings: {
            tr: [`${word.tr} nerede?`, `${word.tr} nerede`],
            ar: [`أين ${word.ar}؟`, `ayna ${word.arLatn}`],
            fa: [`${word.fa} کجاست؟`, `${word.faLatn} kojâst`],
            mn: [`${word.mn} хаана байна вэ?`],
            hi: [`${word.hi} कहाँ है?`, `${word.hiLatn} kahā̃ hai`],
            ja: `${word.ja}はどこにありますか？`
        }
    }[group];

    const [text, latn] = examples[language.key];
    return { text, latn: language.key === "mn" || language.key === "tr" ? undefined : latn, ja: examples.ja };
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
    labelEl.textContent = selectedLanguages.map(language => language.label).join("　→　");
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
