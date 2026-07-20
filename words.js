const WORDS = [
    {
        ja: "こんにちは", tr: "merhaba", ar: "مرحبا", arLatn: "marḥaban", fa: "سلام", faLatn: "salâm", mn: "сайн байна уу",
        examples: {
            tr: { text: "Merhaba, nasılsın?", ja: "こんにちは、お元気ですか？" },
            ar: { text: "مرحبا، كيف حالك؟", latn: "marḥaban, kayfa ḥāluka?", ja: "こんにちは、お元気ですか？" },
            fa: { text: "سلام، حال شما چطور است؟", latn: "salâm, hâl-e shomâ chetor ast?", ja: "こんにちは、お元気ですか？" },
            mn: { text: "Сайн байна уу, та сайн уу?", ja: "こんにちは、お元気ですか？" }
        }
    },
    {
        ja: "太陽", tr: "güneş", ar: "شمس", arLatn: "shams", fa: "خورشید", faLatn: "xorshid", mn: "нар",
        examples: {
            tr: { text: "Güneş bugün parlak.", ja: "今日は太陽が明るいです。" },
            ar: { text: "الشمس ساطعة اليوم.", latn: "al-shams sāṭiʿa al-yawm.", ja: "今日は太陽が輝いています。" },
            fa: { text: "خورشید امروز درخشان است.", latn: "xorshid emruz deraxshân ast.", ja: "今日は太陽が輝いています。" },
            mn: { text: "Өнөөдөр нар гэрэлтэй байна.", ja: "今日は太陽が明るいです。" }
        }
    },
    {
        ja: "月", tr: "ay", ar: "قمر", arLatn: "qamar", fa: "ماه", faLatn: "mâh", mn: "сар",
        examples: {
            tr: { text: "Ay bu gece çok güzel.", ja: "今夜は月がとてもきれいです。" },
            ar: { text: "القمر جميل هذه الليلة.", latn: "al-qamar jamīl hādhihi al-layla.", ja: "今夜は月がきれいです。" },
            fa: { text: "ماه امشب زیباست.", latn: "mâh emshab zibâst.", ja: "今夜は月がきれいです。" },
            mn: { text: "Өнөө шөнө сар сайхан байна.", ja: "今夜は月がきれいです。" }
        }
    },
    {
        ja: "水", tr: "su", ar: "ماء", arLatn: "māʾ", fa: "آب", faLatn: "âb", mn: "ус",
        examples: {
            tr: { text: "Bir bardak su içiyorum.", ja: "私はコップ一杯の水を飲みます。" },
            ar: { text: "أشرب كوبا من الماء.", latn: "ashrabu kūban min al-māʾ.", ja: "私はコップ一杯の水を飲みます。" },
            fa: { text: "من یک لیوان آب می‌نوشم.", latn: "man yek livân âb minusham.", ja: "私はコップ一杯の水を飲みます。" },
            mn: { text: "Би нэг аяга ус ууж байна.", ja: "私はコップ一杯の水を飲んでいます。" }
        }
    },
    {
        ja: "パン", tr: "ekmek", ar: "خبز", arLatn: "khubz", fa: "نان", faLatn: "nân", mn: "талх",
        examples: {
            tr: { text: "Taze ekmek yiyorum.", ja: "私は焼きたてのパンを食べます。" },
            ar: { text: "آكل خبزا طازجا.", latn: "ākulu khubzan ṭāzajan.", ja: "私は焼きたてのパンを食べます。" },
            fa: { text: "من نان تازه می‌خورم.", latn: "man nân-e tâze mixoram.", ja: "私は焼きたてのパンを食べます。" },
            mn: { text: "Би шинэ талх идэж байна.", ja: "私は焼きたてのパンを食べています。" }
        }
    },
    {
        ja: "家", tr: "ev", ar: "بيت", arLatn: "bayt", fa: "خانه", faLatn: "xâne", mn: "гэр",
        examples: {
            tr: { text: "Bu benim evim.", ja: "これは私の家です。" },
            ar: { text: "هذا بيتي.", latn: "hādhā baytī.", ja: "これは私の家です。" },
            fa: { text: "این خانه من است.", latn: "in xâne-ye man ast.", ja: "これは私の家です。" },
            mn: { text: "Энэ бол миний гэр.", ja: "これは私の家です。" }
        }
    },
    {
        ja: "犬", tr: "köpek", ar: "كلب", arLatn: "kalb", fa: "سگ", faLatn: "sag", mn: "нохой",
        examples: {
            tr: { text: "Köpek bahçede koşuyor.", ja: "犬が庭を走っています。" },
            ar: { text: "الكلب يركض في الحديقة.", latn: "al-kalb yarkuḍu fī al-ḥadīqa.", ja: "犬が庭を走っています。" },
            fa: { text: "سگ در باغ می‌دود.", latn: "sag dar bâq midadavad.", ja: "犬が庭を走っています。" },
            mn: { text: "Нохой цэцэрлэгт гүйж байна.", ja: "犬が庭を走っています。" }
        }
    },
    {
        ja: "猫", tr: "kedi", ar: "قط", arLatn: "qiṭṭ", fa: "گربه", faLatn: "gorbe", mn: "муур",
        examples: {
            tr: { text: "Kedi sandalyede uyuyor.", ja: "猫が椅子の上で寝ています。" },
            ar: { text: "القط ينام على الكرسي.", latn: "al-qiṭṭ yanāmu ʿalā al-kursī.", ja: "猫が椅子の上で寝ています。" },
            fa: { text: "گربه روی صندلی خوابیده است.", latn: "gorbe ru-ye sandali xâbide ast.", ja: "猫が椅子の上で寝ています。" },
            mn: { text: "Муур сандал дээр унтаж байна.", ja: "猫が椅子の上で寝ています。" }
        }
    },
    {
        ja: "本", tr: "kitap", ar: "كتاب", arLatn: "kitāb", fa: "کتاب", faLatn: "ketâb", mn: "ном",
        examples: {
            tr: { text: "Bu kitabı okuyorum.", ja: "私はこの本を読んでいます。" },
            ar: { text: "أقرأ هذا الكتاب.", latn: "aqraʾu hādhā al-kitāb.", ja: "私はこの本を読んでいます。" },
            fa: { text: "من این کتاب را می‌خوانم.", latn: "man in ketâb râ mixânam.", ja: "私はこの本を読んでいます。" },
            mn: { text: "Би энэ номыг уншиж байна.", ja: "私はこの本を読んでいます。" }
        }
    },
    {
        ja: "学校", tr: "okul", ar: "مدرسة", arLatn: "madrasa", fa: "مدرسه", faLatn: "madrese", mn: "сургууль",
        examples: {
            tr: { text: "Her gün okula gidiyorum.", ja: "私は毎日学校へ行きます。" },
            ar: { text: "أذهب إلى المدرسة كل يوم.", latn: "adhhabu ilā al-madrasa kulla yawm.", ja: "私は毎日学校へ行きます。" },
            fa: { text: "من هر روز به مدرسه می‌روم.", latn: "man har ruz be madrese miravam.", ja: "私は毎日学校へ行きます。" },
            mn: { text: "Би өдөр бүр сургуульд явдаг.", ja: "私は毎日学校へ行きます。" }
        }
    }
];
