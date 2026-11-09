# مراجعة مراجع الواجهة في `public/pics`

**النطاق:** ملفات المجلد المحلية على هذا الفرع (64 ملفًا)، فُحصت بصريًا صورةً صورةً، مع مقارنة البنية الحالية لـ `src/views/Home.astro` و`src/components` و`src/styles/global.css` ووثائق الهوية. الأرقام أدناه مرتبطة بفهرس أسماء الملفات الكامل في آخر المستند، وليست ترتيبًا للجودة. هذه **توصيات وليست تغييرات منفذة في الواجهة**.

## الحكم السريع

الهوية القائمة هي **Sakinah Glass**: بنفسجي/برقوقي، فجر هادئ، زجاج خفيف، صور تعليمية تحريرية، خط عربي واضح، وسند وثقة بلا ادعاءات تسويقية مختلقة. الأفضل **إعادة بناء الفكرة بالكود والمحتوى الخاص بالأكاديمية**، لا نقل لقطة التصميم أو ألوان SaaS أو صور أشخاص آخرين إلى الإنتاج. ملفات الإلهام ليست إثباتًا لترخيص الاستخدام التجاري، وبعضها يتضمن صورًا وواجهات وعلامات تجارية وبيانات وهمية. لا تُستخدم كصور للطلبة/المعلمين أو نتائج أكاديمية حقيقية. الموقع متعدد اللغات (EN/AR/DE/FR/IT) وبوابة التشغيل منفصلة؛ الاختبار يجب أن يشمل RTL والوضع الداكن والموبايل وتقليل الحركة.

**التصنيف:** «أولوية» فكرة قابلة لتجربة قريبة؛ «لاحقًا» فقط لو خدمتها حاجة فعلية/بيانات حقيقية؛ «تجنب» غير مناسبة بصيغتها المعروضة. التقييم للفكرة لا للملف كأصل جاهز للنشر.

## فحص كل ملف على حدة

| # | ما يظهر/الفكرة | القرار ومكان التطبيق المحتمل وفق الهوية |
|---|---|---|
| 01 | كاروسيل وجهات بصور متراكبة وscroll snapping | **لاحقًا:** بطاقات البرامج/المدرسين بالسحب الطبيعي، دون صور وجهات أو إخفاء CTA؛ أسهم ولوحة مفاتيح وRTL. |
| 02 | هيرو داكن متوهج وشعارات عملاء | **تجنب:** هيرو الأكاديمية عنده حضور أهدأ؛ لا شعارات شركاء بلا موافقة، يمكن فقط استلهام وضوح العنوان. |
| 03 | هيرو تدرجي وبطاقات إنجاز عائمة | **لاحقًا:** ملخص رحلة المتعلم في البوابة ببيانات حقيقية؛ لا إنجازات وهمية في الهيرو العام. |
| 04 | `123` ملف بايت واحد غير قابل للعرض | **تجنب:** ليس مرجع تصميم؛ مراجعة سبب وجوده قبل تنظيف مستقل. |
| 05 | طبقات صور منتج ولوحة ألوان | **لاحقًا:** تراكب بصري لخطوات التعلم بالرسوم الأصلية؛ لا تنسخ لوحة اللون الأزرق/الذهبي. |
| 06 | مخطط ثلاث طبقات زجاجية | **أولوية:** شرح «تقييم مستوى ← خطة ← متابعة» برسمة HTML/CSS بسيطة مترجمة داخل صفحات المنهج أو المستوى؛ ترتيب RTL صحيح. |
| 07 | صفحة أمن سيبراني ذات تايبوجرافي وصورة فوتوغرافية | **تجنب:** الأسلوب والحكاية بعيدان عن التعليم؛ يمكن أخذ تباين العناوين فقط. |
| 08 | تقويم زجاجي شهري | **لاحقًا:** مواعيد الأسرة/المعلم في البوابة فقط عند ربط الجدولة الفعلية؛ عرض المنطقة الزمنية بوضوح. |
| 09 | هيرو منشئ تطبيقات داكن | **تجنب:** لمعان تقني أقوى من هوية «السكينة»، لا واجهة منتج غير موجود. |
| 10 | بطاقات صور متراكبة على الهاتف | **لاحقًا:** عرض مسارات القرآن/العربية/الدراسات الإسلامية برسومنا؛ تجنب صور طلاب غير مرخصة. |
| 11 | واجهة استكشاف أثينا ببطاقات طافية | **تجنب** كمظهر حرفي؛ قد يصلح نمط بطاقة استكشاف محتوى لو كانت القراءة أبسط من الحركة. |
| 12 | براندنج برتقالي عالي التباين | **تجنب:** تغيير الهوية البرقوقية بالكامل غير مبرر. |
| 13 | شريط حالة شبيه Dynamic Island | **لاحقًا:** حالة حصة قادمة في البوابة، نص واضح لا لون وحده، ولا تقليد نظام iOS. |
| 14 | فقاعة مركزية وخريطة موضوعات للمدونة | **لاحقًا:** روابط موضوعات مقال/منهج قابلة للقراءة بدل شبكة تفاعلية معقدة. |
| 15 | بطاقات خدمات معلّقة | **لاحقًا:** بطاقات الاختيارات بعد المقالات، لكن المكوّن `NextSteps` موجود بالفعل؛ تحسينه بدل إنشاء نسخة. |
| 16 | منحنى نمو مع نقطة بيانات | **لاحقًا:** تقدم المتعلم فقط ببيانات موثقة وبداية/نهاية فترة، لا رسم نمو للزينة. |
| 17 | نظام ألوان وبطاقات منتج خضراء/وردية | **تجنب** نسخ الألوان؛ يفيد فقط كمرجع لكيفية توثيق tokens الخاصة بنا. |
| 18 | تسلسل مراحل التصميم كخط زمني | **أولوية:** تبسيط خطوات الحصة التجريبية/الالتحاق على صفحة التواصل؛ تحقق أولًا من `Steps` قبل التكرار. |
| 19 | CTA داكن «تجربة مجانية» | **لاحقًا:** تباين CTA ختامي واضح، لكن لا وعد «مجاني» إلا لو تؤكده سياسة الأكاديمية؛ `CtaPanel` قائم. |
| 20 | فوتر تايبوجرافي ضخم | **تجنب** كنسخة؛ راجع سلاسة الانتقال من المحتوى إلى `Footer` فقط. |
| 21 | نفس ملف 20 حرفيًا (تطابق SHA-256) | **تجنب:** مكرر، لا اتجاه تصميم جديد. |
| 22 | فوتر فوق منظر عشبي | **تجنب:** صورة ليست من هوية الأكاديمية؛ يمكن اعتماد مساحات تنفس أكثر بالفوتر. |
| 23 | فوتر أزرق وشعار ضخم | **تجنب:** وزن بصري وتسويق SaaS غير مناسبين؛ حافظ على روابط ومعلومات الفوتر المقروءة. |
| 24 | صفحة هبوط بصورة بنفسجية وبطاقات كثيرة | **لاحقًا:** ترتيب محتوى هبوط لحملة محددة فقط، دون تحويل الصفحة الرئيسية لكولاج مشتت. |
| 25 | مخطط عقد workflow | **لاحقًا:** شرح رحلة الحجز/المتابعة بخطوات نصية بسيطة، وليس رسم n8n تقني للمستخدم. |
| 26 | دوائر استراتيجية/تصميم/نمو متقاطعة | **لاحقًا:** تقاطع «المعلم، المتعلم، الأسرة» في صفحة المنهج إن وُجد مضمون واضح؛ على الموبايل قائمة. |
| 27 | GIF معرض شرائح ضيقة تتسع بالنقر | **تجنب** كواجهة أساسية: يقلل قابلية الاكتشاف ويحتاج بديلًا ثابتًا وتفعيل لوحة مفاتيح؛ يمكن استخدامه كتجربة اختيارية لمعرض غير حرج. |
| 28 | دوائر «كيف/لماذا/ماذا» | **لاحقًا:** إبراز مقاربة الأكاديمية في قسم التدريس الحالي، دون دوائر إنفوغرافيك بنص صغير. |
| 29 | هيرو روبوت أبيض | **تجنب:** ادعاء/تصوير AI ليس منتج الأكاديمية. |
| 30 | بطاقات تطبيق تأمل وشخصيات | **لاحقًا:** هدوء المساحات والحواف فقط، لا صور أشخاص كأنهم طلاب حقيقيون. |
| 31 | بطاقة لقاء فيديو على الهاتف | **لاحقًا:** واجهة حصة/رابط لقاء فعلي في البوابة؛ `ClassroomMockup` للعرض التوضيحي موجود ولا يجب تقديمه كصورة جلسة حقيقية. |
| 32 | كولاج دليل مدن وأحداث | **تجنب** بصريًا؛ فكرة تجميع الموارد حسب موضوع مفيدة إن وُجد محتوى كافٍ. |
| 33 | مخطط دورة حياة المنتج على خلفية زرقاء | **لاحقًا:** رحلة التعلم خطية أبسط من مخطط مليء بعُقد مجهولة؛ محتوى حقيقي أولًا. |
| 34 | بطاقات منتجات زهرية في شبكة | **لاحقًا:** شبكة برامج/موارد بارتفاعات متسقة؛ `TrackCard` و`CourseCard` موجودان. |
| 35 | طبقات موجات متدرجة ومخطط تقني | **تجنب:** تجريد بصري لا يشرح قيمة تعليمية. |
| 36 | بطاقة مشاريع وشريط تقدم | **أولوية للبوابة فقط:** إنجاز خطة طالب بحساب حقيقي وتاريخ تحديث ووصف نصي؛ لا اختلاق نسبة تقدم. |
| 37 | رزمة بطاقات صور متعددة | **تجنب** الاكتظاظ؛ صالح فقط لفكرة عرض 3 برامج لا 10 بطاقات متراكبة. |
| 38 | مخطط عملية تصميم بعُقد | **لاحقًا:** إعادة صياغته خطوات منهج نصية وتبسيط بصري، لا نسخ بنية بعُقد صغيرة. |
| 39 | بطاقات أعمال بانورامية | **لاحقًا:** معرض موارد مختارة إن توافرت أعمال أصلية، وليس showcase لمجرد الحركة. |
| 40 | تجربة typography موسيقية بألوان ساخنة | **تجنب:** لا تناسب هوية القراءة التعليمية. |
| 41 | بطاقة ملخص أسبوعي ورزمة ملاحظات | **أولوية للبوابة:** ملخص تقدم أسبوعي للأسرة «حضر، ما تعلمه، التالي» من سجلات موثوقة، بلا أرقام زينة. |
| 42 | مجموعة بطاقات wellness صغيرة | **لاحقًا:** تنظيم معلومات البوابة في وحدات هادئة؛ لا تكدّس وحدات صغيرة على موبايل. |
| 43 | مشهد طبيعة وقسم «Disconnect to Connect» | **تجنب** الصور والنسق كنسخة، لكن فكرة الهدوء والبعد عن ضوضاء SaaS منسجمة مع الهوية. |
| 44 | واجهة وكلاء AI | **تجنب:** طرح قدرة غير متوفرة/ذات تبعات خصوصية. |
| 45 | صور مولدة AI حول CTA | **تجنب:** خطر صور طلبة مصطنعة؛ استخدم الرسوم التحريرية المرخصة الموجودة في `src/assets/art`. |
| 46 | بطاقات ملفات شخصية بصور وأسماء | **لاحقًا:** `TeacherCard` وملفات المعلمين بصور وموافقات حقيقية فقط؛ لا استنساخ المثال. |
| 47 | حقل بحث متوهج داكن | **لاحقًا:** بحث الموقع الموجود `SearchDialog` يحتاج وظيفة واكتشافًا لا وهجًا إضافيًا. |
| 48 | صفحة مساعد AI شخصي | **تجنب:** ليست خدمة موثقة، ولا تحوّل حجز مدرس بشري إلى وعد AI. |
| 49 | فوتر بلوحة زرقاء مصغرة | **لاحقًا:** فوتر أكثر اختصارًا فقط إذا كشف الاختبار ازدحامًا؛ `Footer` قائم. |
| 50 | شريط تقدم على بطاقة داكنة | **أولوية للبوابة:** حالة خطة التعلم داخل بطاقة مرئية؛ نص نسبة + مقام/إجمالي واضح، وخصوصية حسب دور المستخدم. |
| 51 | رسم طاقة منزلي | **لاحقًا:** نمط الرسم البياني لوتيرة الحصص/الواجبات، لكن لا تعرض رسمًا قبل وجود فترة ومصدر بيانات. |
| 52 | مخطط وزن/صحة | **تجنب** الدلالة الصحية؛ استلهم فقط إضافة شرح وتاريخ للبيانات التعليمية عند الحاجة. |
| 53 | مخطط مسارين يتفرعان | **أولوية:** تفريق خيار «اختبر مستواك» عن «احجز تجربة» في رحلة الزائر بدون إجباره على مسار واحد؛ `NextSteps` موجود. |
| 54 | بطاقات أرقام تسويقية كبيرة | **تجنب** أي نسب/أرقام بلا إثبات؛ يمكن استعمال بطاقات مميزات نصية من `FeatureGrid`. |
| 55 | رسم دائري ونسب مشكلة | **تجنب:** رسوم ونسب مبهرة بلا أساس بحثي أو تربوي. |
| 56 | سير عمل مخزون مصور | **لاحقًا:** مراحل التقدم الدراسي مرسومة ببساطة، وليس لغة B2B أو واجهة inventory. |
| 57 | رزمة مكونات UI | **لاحقًا:** مرجع لتوثيق حالات المكونات الموجودة (فارغ/تحميل/خطأ) لا لإضافة framework جديد. |
| 58 | صفحة عمل بصري أحمر | **تجنب:** اللون والصور لا تخدم الثقة التعليمية. |
| 59 | منحنى «+320%» | **تجنب:** رقم نمو غير قابل للنقل؛ ممنوع جعله دليلا على نتائج الطلبة. |
| 60 | لوحة صباحية وملاحة سفلى | **أولوية للبوابة:** شاشة «اليوم» للأسرة/المعلم بالمواعيد والمهام الفعلية؛ اختبر قابلية الوصول والتراخيص قبل تطبيق نمط الملاحة. |
| 61 | بطاقة شخص وحالة متابعة | **لاحقًا:** بطاقة المعلم/الطالب مع ضوابط خصوصية؛ لا صور/مقاييس متابعة اجتماعية. |
| 62 | بطاقة صفحة طويلة مع QR | **تجنب** QR بلا سبب؛ فكرة تسلسل صفحة موارد قابلة للتبني دون اعتماد مسح QR كشرط. |
| 63 | رزمة صور prompts | **تجنب:** مرجع منشورات AI وليس واجهة تعليمية. |
| 64 | خلفية تدرج أزرق مع تايبوجرافي صغير | **لاحقًا:** خلفية هادئة لقسم تنفّس؛ استخدم `--grad-dawn` الموجود ولا تجعل النص فوق تدرج منخفض التباين. |

## خطة تطبيق مرتبة (بدون نسخ الصور)

1. **الموقع العام:** نموذج واحد بسيط ومترجم لمراحل «تقييم المستوى → خطة مناسبة → متابعة»، مستلهم من 06/18؛ راجع `Steps` و`SanadChain` لتجنب الازدواج. في صفحات التواصل/الموارد، راجع خيارَي 53 عبر `NextSteps` قبل إضافة CTA جديد.
2. **البوابة بعد مراجعة البيانات:** بطاقات «الحصة القادمة» (08/13) و«ملخص الأسبوع» (41/60) و«تقدم الخطة» (36/50)، ببيانات مصرح بها ومؤرخة؛ لا تُعرض نسب أو رسومات مع بيانات ناقصة. بوابة التشغيل ليست صفحة تسويق، ولا يُعتبر وجود Mockup دليلًا على جهوزية إطلاقها.
3. **ضوابط القبول لأي تنفيذ لاحق:** AR/RTL واللغات الخمس، شاشات 320px+، لوحة المفاتيح وقارئ الشاشة، contrast في light/dark، `prefers-reduced-motion`، تحميل كسول للصور غير الحرجة، وتتبّع هدف واضح بدل إضافة animation للتزيين.
4. **قرار الأصول:** أبقِ هذه الملفات مراجع داخلية فقط حاليًا. تحقّق من مصدر/ترخيص كل أصل قبل أي نشر، ولا تنقل لقطات Pinterest/Dribbble/X أو الوجوه أو أرقامها كما هي. ملف 04 غير صالح و21 مكرر؛ يمكن تنظيفهما في تغيير منفصل بعد تأكيد صاحب المشروع.

## فهرس أسماء الملفات (المطابقة الدقيقة للأرقام)

01. [`(1) Charlie J on X_ _One of the most underrated CSS props is definitely scroll snapping, it feels insane to me that these carousels are possible with CSS alone 🤯 This just went live on @AtoBeach - meaning gesture s.jpg`](../public/pics/%281%29%20Charlie%20J%20on%20X_%20_One%20of%20the%20most%20underrated%20CSS%20props%20is%20definitely%20scroll%20snapping%2C%20it%20feels%20insane%20to%20me%20that%20these%20carousels%20are%20possible%20with%20CSS%20alone%20%F0%9F%A4%AF%20This%20just%20went%20live%20on%20%40AtoBeach%20-%20meaning%20gesture%20s.jpg)
02. [`(1) Home _ X.jpg`](../public/pics/%281%29%20Home%20_%20X.jpg)
03. [`(3) Instagram.jpg`](../public/pics/%283%29%20Instagram.jpg)
04. [`123`](../public/pics/123)
05. [`12343`](../public/pics/12343)
06. [`3 layer stack diagram template with space for your text - glassmorphism business technology slide infographic template for corporate presentations - minimal design isolated on light background vector Stock Vector.jpg`](../public/pics/3%20layer%20stack%20diagram%20template%20with%20space%20for%20your%20text%20-%20glassmorphism%20business%20technology%20slide%20infographic%20template%20for%20corporate%20presentations%20-%20minimal%20design%20isolated%20on%20light%20background%20vector%20Stock%20Vector.jpg)
07. [`A modern cybersecurity landing page designed for SaaS businesses with a premium minimal aesthetic_ The interface combines bold typography, i. Every section is designed to create a clean, premium, and conversion-focus___`](../public/pics/A%20modern%20cybersecurity%20landing%20page%20designed%20for%20SaaS%20businesses%20with%20a%20premium%20minimal%20aesthetic_%20The%20interface%20combines%20bold%20typography%2C%20i.%20Every%20section%20is%20designed%20to%20create%20a%20clean%2C%20premium%2C%20and%20conversion-focus___)
08. [`ABDUL W_ _ Web calendar interface, My screen, Pinterest interface.jpg`](../public/pics/ABDUL%20W_%20_%20Web%20calendar%20interface%2C%20My%20screen%2C%20Pinterest%20interface.jpg)
09. [`AI APP BUILDER HERO PAGE.jpg`](../public/pics/AI%20APP%20BUILDER%20HERO%20PAGE.jpg)
10. [`Anyway.jpg`](../public/pics/Anyway.jpg)
11. [`Athens Explorer App – Cultural Travel UX Concept.jpg`](../public/pics/Athens%20Explorer%20App%20%E2%80%93%20Cultural%20Travel%20UX%20Concept.jpg)
12. [`Azentos – Branding Studio Website Design.jpg`](../public/pics/Azentos%20%E2%80%93%20Branding%20Studio%20Website%20Design.jpg)
13. [`Battery Charging UI with Dynamic Island _ iOS Energy Status Design.jpg`](../public/pics/Battery%20Charging%20UI%20with%20Dynamic%20Island%20_%20iOS%20Energy%20Status%20Design.jpg)
14. [`Blog.jpg`](../public/pics/Blog.jpg)
15. [`Cards.jpg`](../public/pics/Cards.jpg)
16. [`Chart snippet by Mohammed Kabir Hussaini _ Layers.jpg`](../public/pics/Chart%20snippet%20by%20Mohammed%20Kabir%20Hussaini%20_%20Layers.jpg)
17. [`Color set.jpg`](../public/pics/Color%20set.jpg)
18. [`Crypto Swap (4) _ Images __ Behance.jpg`](../public/pics/Crypto%20Swap%20%284%29%20_%20Images%20__%20Behance.jpg)
19. [`Dataly - SaaS & Tech _ CTA Website Design Ideas.jpg`](../public/pics/Dataly%20-%20SaaS%20%26%20Tech%20_%20CTA%20Website%20Design%20Ideas.jpg)
20. [`Faizur Rehman (@fazurrehman) on X (1).jpg`](../public/pics/Faizur%20Rehman%20%28%40fazurrehman%29%20on%20X%20%281%29.jpg)
21. [`Faizur Rehman (@fazurrehman) on X.jpg`](../public/pics/Faizur%20Rehman%20%28%40fazurrehman%29%20on%20X.jpg)
22. [`Footer UI Design.jpg`](../public/pics/Footer%20UI%20Design.jpg)
23. [`Footer Website UI design.jpg`](../public/pics/Footer%20Website%20UI%20design.jpg)
24. [`High Conversion Landing Page Design Ideas.jpg`](../public/pics/High%20Conversion%20Landing%20Page%20Design%20Ideas.jpg)
25. [`How To Setup Ollama With N8n_ A Beginner's Guide To Workflow Automation.jpg`](../public/pics/How%20To%20Setup%20Ollama%20With%20N8n_%20A%20Beginner%27s%20Guide%20To%20Workflow%20Automation.jpg)
26. [`How to create a great Design System for your brand.jpg`](../public/pics/How%20to%20create%20a%20great%20Design%20System%20for%20your%20brand.jpg)
27. [`Image Gallery Stacked as Narrow Slits and Expands to Show The Full Image on Click.gif`](../public/pics/Image%20Gallery%20Stacked%20as%20Narrow%20Slits%20and%20Expands%20to%20Show%20The%20Full%20Image%20on%20Click.gif)
28. [`Keep It Clean and Beautiful with Free Minimalist PowerPoint Templates.jpg`](../public/pics/Keep%20It%20Clean%20and%20Beautiful%20with%20Free%20Minimalist%20PowerPoint%20Templates.jpg)
29. [`Lomen Ai Glass landing page.jpg`](../public/pics/Lomen%20Ai%20Glass%20landing%20page.jpg)
30. [`Meditation Mobile App by Bogdan Nikitin for Nixtio on Dribbble.jpg`](../public/pics/Meditation%20Mobile%20App%20by%20Bogdan%20Nikitin%20for%20Nixtio%20on%20Dribbble.jpg)
31. [`Meeting App UI Design 📱✨_📝 Designed by_ @gautham_ui__👉 Follow @uiuxbunker for more UI inspiration_ and Daily Tips_⠀⠀⠀⠀⠀⠀_Use #uiuxbunker and tag us to be featured 😉 ⠀_⠀_#ui #ux #appdesign #interfacedesign #useri.jpg`](../public/pics/Meeting%20App%20UI%20Design%20%F0%9F%93%B1%E2%9C%A8_%F0%9F%93%9D%20Designed%20by_%20%40gautham_ui__%F0%9F%91%89%20Follow%20%40uiuxbunker%20for%20more%20UI%20inspiration_%20and%20Daily%20Tips_%E2%A0%80%E2%A0%80%E2%A0%80%E2%A0%80%E2%A0%80%E2%A0%80_Use%20%23uiuxbunker%20and%20tag%20us%20to%20be%20featured%20%F0%9F%98%89%20%E2%A0%80_%E2%A0%80_%23ui%20%23ux%20%23appdesign%20%23interfacedesign%20%23useri.jpg)
32. [`MorniX - Online City Guide.jpg`](../public/pics/MorniX%20-%20Online%20City%20Guide.jpg)
33. [`Nike Year in Review _ Instrument.jpg`](../public/pics/Nike%20Year%20in%20Review%20_%20Instrument.jpg)
34. [`OP (@openpurpose) on X.jpg`](../public/pics/OP%20%28%40openpurpose%29%20on%20X.jpg)
35. [`OpenAI launches professional services business with $4B investment - SiliconANGLE 🗣️ OpenAI's $4B bet on hand-holding enterprises screams _AI can't deploy itself yet,_ huh; ready to outsource your future_; #AIReali.jpg`](../public/pics/OpenAI%20launches%20professional%20services%20business%20with%20%244B%20investment%20-%20SiliconANGLE%20%F0%9F%97%A3%EF%B8%8F%20OpenAI%27s%20%244B%20bet%20on%20hand-holding%20enterprises%20screams%20_AI%20can%27t%20deploy%20itself%20yet%2C_%20huh%3B%20ready%20to%20outsource%20your%20future_%3B%20%23AIReali.jpg)
36. [`Progress Bar.jpg`](../public/pics/Progress%20Bar.jpg)
37. [`Random designs - Collection Social Media - Pham Ngoc Anh.jpg`](../public/pics/Random%20designs%20-%20Collection%20Social%20Media%20-%20Pham%20Ngoc%20Anh.jpg)
38. [`Smart Book Rental App – Design Process & Workflow.jpg`](../public/pics/Smart%20Book%20Rental%20App%20%E2%80%93%20Design%20Process%20%26%20Workflow.jpg)
39. [`Stunning Framer Template for Agencies (Free Portfolio Framer template).jpg`](../public/pics/Stunning%20Framer%20Template%20for%20Agencies%20%28Free%20Portfolio%20Framer%20template%29.jpg)
40. [`Typography Music.jpg`](../public/pics/Typography%20Music.jpg)
41. [`Week on Journal - summary card.jpg`](../public/pics/Week%20on%20Journal%20-%20summary%20card.jpg)
42. [`Wellness_ All-in-One UI Kit ( Components) by Kawsar Ahmed on Dribbble.jpg`](../public/pics/Wellness_%20All-in-One%20UI%20Kit%20%28%20Components%29%20by%20Kawsar%20Ahmed%20on%20Dribbble.jpg)
43. [`X.jpg`](../public/pics/X.jpg)
44. [`download (1).jpg`](../public/pics/download%20%281%29.jpg)
45. [`download (10).jpg`](../public/pics/download%20%2810%29.jpg)
46. [`download (11).jpg`](../public/pics/download%20%2811%29.jpg)
47. [`download (12).jpg`](../public/pics/download%20%2812%29.jpg)
48. [`download (13).jpg`](../public/pics/download%20%2813%29.jpg)
49. [`download (14).jpg`](../public/pics/download%20%2814%29.jpg)
50. [`download (2).jpg`](../public/pics/download%20%282%29.jpg)
51. [`download (3).jpg`](../public/pics/download%20%283%29.jpg)
52. [`download (4).jpg`](../public/pics/download%20%284%29.jpg)
53. [`download (5).jpg`](../public/pics/download%20%285%29.jpg)
54. [`download (6).jpg`](../public/pics/download%20%286%29.jpg)
55. [`download (7).jpg`](../public/pics/download%20%287%29.jpg)
56. [`download (8).jpg`](../public/pics/download%20%288%29.jpg)
57. [`download (9).jpg`](../public/pics/download%20%289%29.jpg)
58. [`download.jpg`](../public/pics/download.jpg)
59. [`hehe.jpg`](../public/pics/hehe.jpg)
60. [`ui component.jpg`](../public/pics/ui%20component.jpg)
61. [`ui.jpg`](../public/pics/ui.jpg)
62. [`visual inspo AI idea.jpg`](../public/pics/visual%20inspo%20AI%20idea.jpg)
63. [`Жми на ссылку и переходи на доску с промптами для нейросетей.jpg`](../public/pics/%D0%96%D0%BC%D0%B8%20%D0%BD%D0%B0%20%D1%81%D1%81%D1%8B%D0%BB%D0%BA%D1%83%20%D0%B8%20%D0%BF%D0%B5%D1%80%D0%B5%D1%85%D0%BE%D0%B4%D0%B8%20%D0%BD%D0%B0%20%D0%B4%D0%BE%D1%81%D0%BA%D1%83%20%D1%81%20%D0%BF%D1%80%D0%BE%D0%BC%D0%BF%D1%82%D0%B0%D0%BC%D0%B8%20%D0%B4%D0%BB%D1%8F%20%D0%BD%D0%B5%D0%B9%D1%80%D0%BE%D1%81%D0%B5%D1%82%D0%B5%D0%B9.jpg)
64. [`Магия AI_ Читай в профиле.jpg`](../public/pics/%D0%9C%D0%B0%D0%B3%D0%B8%D1%8F%20AI_%20%D0%A7%D0%B8%D1%82%D0%B0%D0%B9%20%D0%B2%20%D0%BF%D1%80%D0%BE%D1%84%D0%B8%D0%BB%D0%B5.jpg)

## أول تنفيذ بعد المراجعة

أضيف مكوّن `LearningPath` إلى صفحة الدورات في اللغات الخمس، مستلهم من وضوح الطبقات/المراحل في 06 و18 و53، لكنه يستخدم ألوان وهوية الموقع ومحتوى تعليميًا أصليًا. الخطوات وصف لرحلة التعلم وليست شريط تقدم أو ادعاء ببيانات طالب. خيارا تحديد المستوى والحجز موجودان كرابطين مستقلين. لا توجد صور مرجعية منشورة من `public/pics` في الواجهة. تم التحقق بـ `npm run build` و`npm run verify` (روابط ولغات وبيانات منظمة وخريطة موقع وSEO).
