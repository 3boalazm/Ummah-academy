/**
 * Privacy Policy and Terms of Service, EN + AR.
 * The English text is the live site's, ported verbatim. The Arabic is a faithful
 * convenience translation; the English version prevails (stated on the page).
 * Both are pending the legal review tracked in Linear ABO-44.
 * `{email}` and `{pricing}` are replaced at render time.
 */
import type { Lang } from '@/i18n';
import legalDe from '@/locales/de/data/legal';
import legalFr from '@/locales/fr/data/legal';
import legalIt from '@/locales/it/data/legal';

export type LegalDoc = 'privacy' | 'terms';

export interface Section {
  h: string;
  /** trusted HTML (authored here, never user input) */
  html: string;
}
export interface LegalContent {
  meta: { title: string; desc: string };
  title: string;
  lede: string;
  updated: string;
  intro: string;
  sections: Section[];
  note: string;
}

const EMAIL = '<a href="mailto:{email}">{email}</a>';

const PRIVACY: Partial<Record<Lang, LegalContent>> & { en: LegalContent } = {
  en: {
    meta: { title: 'Privacy Policy | Ummah Academy', desc: "How Ummah Academy collects, uses and protects your information — including children's privacy, recordings, payments and your rights." },
    title: 'Privacy Policy',
    lede: 'How we collect, use, and protect your information.',
    updated: 'Last updated: July 2026',
    intro: 'Ummah Academy (“we”, “us”, “our”) provides live, one-on-one online Quran, Arabic language, and Islamic studies education to students in 50+ countries. This Privacy Policy explains what information we collect, how we use it, and the choices and rights you have.',
    sections: [
      {
        h: '1. Information We Collect',
        html: `<p>We collect information you provide directly to us, including:</p><ul>
<li><strong>Registration information:</strong> your name, WhatsApp number, email address, country/timezone, and the course or track you are interested in.</li>
<li><strong>Family Portal information:</strong> if you register a child (e.g. for the Ummah Cubs program), we collect the child’s name, age, and course progress, managed under the parent or guardian’s account.</li>
<li><strong>Session data:</strong> live sessions are recorded and stored so students and parents can review lessons; teachers also prepare post-session progress reports.</li>
<li><strong>Payment information:</strong> when you subscribe to a paid plan, payment is processed by our payment providers (which may include card networks, PayPal, bank transfer, Western Union, or MoneyGram). We do not store your full card details on our own servers.</li>
<li><strong>Communications:</strong> messages you send us via WhatsApp, email, or our contact channels, including session reminders and renewal notifications we send to you.</li></ul>`,
      },
      { h: '2. How We Use Your Information', html: '<p>We use the information we collect to: schedule and deliver live sessions; match you with a suitable teacher and track level; send session reminders and progress reports via WhatsApp and email; process payments and manage subscriptions; issue certificates and Ijazah records where applicable; and improve our courses and platform.</p>' },
      { h: '3. Children’s Privacy', html: '<p>Our Ummah Cubs program is designed for children starting at age 5. Children’s accounts are created and managed by a parent or legal guardian through the Family Portal. Parents can review session recordings, progress reports, and manage billing for their children at any time. We do not knowingly collect information directly from a child without a parent or guardian’s involvement.</p>' },
      { h: '4. Sharing of Information', html: '<p>We do not sell your personal information. We share information only with: payment processors, to complete transactions; WhatsApp, to deliver messages and reminders you have opted into; and teachers, to the extent needed to deliver your sessions and progress reports. We may also disclose information if required by law.</p>' },
      { h: '5. Data Retention and Security', html: '<p>We retain account, session, and payment records for as long as your account is active and for a reasonable period afterward for record-keeping and legal purposes. We take reasonable technical and organizational measures to protect your information, though no online service can guarantee absolute security.</p>' },
      { h: '6. Your Rights', html: '<p>Depending on where you live, you may have the right to access, correct, export, or request deletion of your personal information, and to object to or restrict certain processing. To exercise any of these rights, contact us using the details below.</p>' },
      { h: '7. Cookies', html: '<p>Our website uses cookies and similar technologies to keep you signed in, remember your preferences, and understand how our site is used. You can control cookies through your browser settings.</p>' },
      { h: '8. International Data Transfers', html: '<p>Because we serve students across 50+ countries, your information may be processed in a country other than the one you live in. Where this happens, we take steps to ensure your information continues to be protected in line with this Policy.</p>' },
      { h: '9. Changes to This Policy', html: '<p>We may update this Privacy Policy from time to time. We will post any changes on this page with an updated “Last updated” date.</p>' },
      { h: '10. Contact Us', html: `<p>If you have questions about this Privacy Policy or how we handle your information, contact us at ${EMAIL} or via WhatsApp.</p>` },
    ],
    note: 'Note: This policy is a general template based on the services described on our website. It is not a substitute for legal advice specific to your situation or jurisdiction.',
  },
  ar: {
    meta: { title: 'سياسة الخصوصية | أكاديمية الأمة', desc: 'كيف تجمع أكاديمية الأمة معلوماتك وتستخدمها وتحميها، بما في ذلك خصوصية الأطفال وتسجيلات الحصص والمدفوعات وحقوقك.' },
    title: 'سياسة الخصوصية',
    lede: 'كيف نجمع معلوماتك ونستخدمها ونحميها.',
    updated: 'آخر تحديث: يوليو ٢٠٢٦',
    intro: 'تقدّم أكاديمية الأمة («نحن» أو «الأكاديمية») تعليمًا مباشرًا فرديًا عبر الإنترنت في القرآن الكريم واللغة العربية والدراسات الإسلامية لطلاب في أكثر من ٥٠ دولة. توضّح سياسة الخصوصية هذه المعلومات التي نجمعها، وكيف نستخدمها، والخيارات والحقوق المتاحة لك.',
    sections: [
      {
        h: '١. المعلومات التي نجمعها',
        html: `<p>نجمع المعلومات التي تقدّمها لنا مباشرة، ومنها:</p><ul>
<li><strong>بيانات التسجيل:</strong> اسمك، ورقم واتساب، وبريدك الإلكتروني، وبلدك ومنطقتك الزمنية، والدورة أو المسار الذي تهتم به.</li>
<li><strong>بيانات بوابة الأسرة:</strong> إذا سجّلت طفلًا (في برنامج أشبال الأمة مثلًا)، نجمع اسم الطفل وعمره وتقدّمه الدراسي، وتُدار هذه البيانات ضمن حساب الوالد أو ولي الأمر.</li>
<li><strong>بيانات الحصص:</strong> تُسجَّل الحصص المباشرة وتُحفظ ليتمكن الطلاب وأولياء الأمور من مراجعة الدروس، كما يُعدّ المعلمون تقارير تقدّم بعد الحصص.</li>
<li><strong>بيانات الدفع:</strong> عند اشتراكك في خطة مدفوعة، تتولى جهات الدفع معالجة المدفوعات (وقد تشمل شبكات البطاقات، وباي بال، والتحويل البنكي، وويسترن يونيون، وموني جرام). ولا نخزّن بيانات بطاقتك كاملة على خوادمنا.</li>
<li><strong>المراسلات:</strong> الرسائل التي ترسلها إلينا عبر واتساب أو البريد الإلكتروني أو قنوات التواصل لدينا، بما في ذلك تذكيرات الحصص وإشعارات التجديد التي نرسلها إليك.</li></ul>`,
      },
      { h: '٢. كيف نستخدم معلوماتك', html: '<p>نستخدم المعلومات التي نجمعها من أجل: جدولة الحصص المباشرة وتقديمها؛ واختيار المعلم والمستوى المناسبين لك؛ وإرسال تذكيرات الحصص وتقارير التقدّم عبر واتساب والبريد الإلكتروني؛ ومعالجة المدفوعات وإدارة الاشتراكات؛ وإصدار الشهادات وسجلات الإجازة عند الاقتضاء؛ وتحسين دوراتنا ومنصتنا.</p>' },
      { h: '٣. خصوصية الأطفال', html: '<p>صُمّم برنامج أشبال الأمة للأطفال من سن الخامسة. يُنشئ حسابات الأطفال ويديرها الوالد أو الوصي القانوني عبر بوابة الأسرة، ويمكن لأولياء الأمور مراجعة تسجيلات الحصص وتقارير التقدّم وإدارة الفوترة لأطفالهم في أي وقت. ولا نجمع عن علمٍ معلوماتٍ من طفل مباشرة دون مشاركة والده أو وليّ أمره.</p>' },
      { h: '٤. مشاركة المعلومات', html: '<p>لا نبيع معلوماتك الشخصية، ولا نشاركها إلا مع: جهات معالجة المدفوعات لإتمام المعاملات؛ وواتساب لإيصال الرسائل والتذكيرات التي اخترت تلقّيها؛ والمعلمين بالقدر اللازم لتقديم حصصك وتقارير تقدّمك. وقد نُفصح عن المعلومات إذا اقتضى القانون ذلك.</p>' },
      { h: '٥. الاحتفاظ بالبيانات وأمنها', html: '<p>نحتفظ بسجلات الحساب والحصص والمدفوعات طوال مدة نشاط حسابك، ولمدة معقولة بعد ذلك لأغراض حفظ السجلات والأغراض القانونية. ونتخذ تدابير تقنية وتنظيمية معقولة لحماية معلوماتك، مع أن أي خدمة عبر الإنترنت لا يمكنها ضمان الأمان المطلق.</p>' },
      { h: '٦. حقوقك', html: '<p>بحسب مكان إقامتك، قد يحق لك الاطلاع على معلوماتك الشخصية أو تصحيحها أو نقلها أو طلب حذفها، والاعتراض على بعض أوجه المعالجة أو تقييدها. ولممارسة أيٍّ من هذه الحقوق، تواصل معنا عبر البيانات أدناه.</p>' },
      { h: '٧. ملفات تعريف الارتباط', html: '<p>يستخدم موقعنا ملفات تعريف الارتباط (الكوكيز) وتقنيات مشابهة لإبقائك مسجّلًا للدخول، وتذكّر تفضيلاتك، وفهم طريقة استخدام الموقع. ويمكنك التحكم في ملفات تعريف الارتباط من إعدادات متصفحك.</p>' },
      { h: '٨. نقل البيانات دوليًا', html: '<p>لأننا نخدم طلابًا في أكثر من ٥٠ دولة، قد تُعالَج معلوماتك في بلد غير البلد الذي تقيم فيه. وفي هذه الحالة نتخذ الخطوات اللازمة لضمان استمرار حماية معلوماتك وفق هذه السياسة.</p>' },
      { h: '٩. التغييرات على هذه السياسة', html: '<p>قد نحدّث سياسة الخصوصية هذه من وقت لآخر، وسننشر أي تغييرات على هذه الصفحة مع تحديث تاريخ «آخر تحديث».</p>' },
      { h: '١٠. تواصل معنا', html: `<p>إذا كانت لديك أسئلة حول سياسة الخصوصية هذه أو طريقة تعاملنا مع معلوماتك، فتواصل معنا على ${EMAIL} أو عبر واتساب.</p>` },
    ],
    note: 'ملاحظة: هذه السياسة نموذج عام مبني على الخدمات الموصوفة في موقعنا، ولا تغني عن استشارة قانونية تناسب وضعك أو نطاقك القضائي.',
  },
};

const TERMS: Partial<Record<Lang, LegalContent>> & { en: LegalContent } = {
  en: {
    meta: { title: 'Terms of Service | Ummah Academy', desc: "The terms that govern Ummah Academy's website and live online classes: free trial, subscriptions, cancellation, rescheduling, recordings and conduct." },
    title: 'Terms of Service',
    lede: 'The terms that govern your use of Ummah Academy.',
    updated: 'Last updated: July 2026',
    intro: 'These Terms of Service (“Terms”) govern your use of Ummah Academy’s website and live online education services. By registering for a free trial or a paid plan, you agree to these Terms.',
    sections: [
      { h: '1. Our Service', html: '<p>Ummah Academy provides live, one-on-one online instruction in Quran recitation and Tajweed, Arabic language, Islamic studies, and our Ummah Cubs program for children, delivered by Al-Azhar certified teachers.</p>' },
      { h: '2. Free Trial', html: '<p>New students may register for two free live trial sessions, with no payment card required. Free trials are limited to one per student/family and are intended to let you assess our teaching before subscribing to a paid plan.</p>' },
      { h: '3. Accounts and Registration', html: '<p>You must provide accurate registration information (name and WhatsApp number at minimum). For children under the Ummah Cubs program, an account must be created and managed by a parent or legal guardian via the Family Portal, who remains responsible for the account and its use.</p>' },
      { h: '4. Subscriptions, Fees and Payment', html: '<p>Paid plans are billed monthly according to the plan you select. Accepted payment methods include Visa, Mastercard, PayPal, bank transfer, Western Union, and MoneyGram. You authorize us (or our payment processor) to charge the applicable fees for your selected plan. Prices are as displayed on our <a href="{pricing}">Pricing page</a> at the time of purchase and may change for future billing periods with notice.</p>' },
      { h: '5. Cancellation', html: '<p>You may cancel your subscription at any time; cancellation will take effect at the end of your current billing period. We do not offer prorated refunds for partial months unless required by applicable law.</p>' },
      { h: '6. Rescheduling Policy', html: '<p>Sessions may be rescheduled with at least 24 hours’ advance notice. Sessions cancelled or missed with less notice may be forfeited, at our discretion, except in cases of genuine emergency.</p>' },
      { h: '7. Session Recordings and Intellectual Property', html: '<p>Live sessions are recorded for your reference and stored in your student or Family Portal account. Recordings are provided for your personal educational use only and may not be redistributed, resold, or published without our written permission. Our course materials, curriculum, branding, and website content remain the intellectual property of Ummah Academy.</p>' },
      { h: '8. Code of Conduct', html: '<p>We ask all students, parents, and guardians to treat teachers and staff with respect. We reserve the right to suspend or terminate accounts that engage in abusive behavior, harassment, or use of our services for any unlawful purpose.</p>' },
      { h: '9. Teacher Qualifications and Educational Outcomes', html: '<p>Our teachers are Al-Azhar University graduates. While we are committed to high-quality instruction, individual learning outcomes depend on many factors including student effort, attendance, and starting level, and we cannot guarantee specific results or timelines (e.g. for memorization or Ijazah completion).</p>' },
      { h: '10. Limitation of Liability', html: '<p>To the fullest extent permitted by law, Ummah Academy is not liable for indirect, incidental, or consequential damages arising from your use of our services. Our total liability for any claim relating to our services is limited to the amount you paid us in the three months preceding the claim.</p>' },
      { h: '11. Termination', html: '<p>We may suspend or terminate access to our services for any account that violates these Terms. You may stop using our services and cancel your subscription at any time as described above.</p>' },
      { h: '12. Governing Law', html: '<p>These Terms are governed by the laws applicable to Ummah Academy’s place of operation, without regard to conflict-of-law principles, except where local consumer-protection law provides otherwise for students in your country.</p>' },
      { h: '13. Changes to These Terms', html: '<p>We may update these Terms from time to time. Continued use of our services after changes take effect constitutes acceptance of the updated Terms.</p>' },
      { h: '14. Contact Us', html: `<p>Questions about these Terms can be sent to ${EMAIL} or via WhatsApp.</p>` },
    ],
    note: 'Note: This is a general template based on the services described on our website. It is not a substitute for legal advice specific to your jurisdiction.',
  },
  ar: {
    meta: { title: 'شروط الخدمة | أكاديمية الأمة', desc: 'الشروط التي تحكم موقع أكاديمية الأمة وحصصها المباشرة عبر الإنترنت: التجربة المجانية، والاشتراكات، والإلغاء، وتغيير المواعيد، والتسجيلات، وقواعد السلوك.' },
    title: 'شروط الخدمة',
    lede: 'الشروط التي تحكم استخدامك لأكاديمية الأمة.',
    updated: 'آخر تحديث: يوليو ٢٠٢٦',
    intro: 'تحكم شروط الخدمة هذه («الشروط») استخدامك لموقع أكاديمية الأمة وخدماتها التعليمية المباشرة عبر الإنترنت. وبتسجيلك في التجربة المجانية أو في خطة مدفوعة، فإنك توافق على هذه الشروط.',
    sections: [
      { h: '١. خدمتنا', html: '<p>تقدّم أكاديمية الأمة تعليمًا مباشرًا فرديًا عبر الإنترنت في تلاوة القرآن والتجويد، واللغة العربية، والدراسات الإسلامية، وبرنامج أشبال الأمة للأطفال، على يد معلمين معتمدين من الأزهر.</p>' },
      { h: '٢. التجربة المجانية', html: '<p>يمكن للطلاب الجدد التسجيل في حصتين تجريبيتين مباشرتين مجانًا دون الحاجة إلى بطاقة دفع. والتجربة المجانية مرة واحدة لكل طالب أو أسرة، والغرض منها أن تقيّم تدريسنا قبل الاشتراك في خطة مدفوعة.</p>' },
      { h: '٣. الحسابات والتسجيل', html: '<p>يجب أن تقدّم بيانات تسجيل صحيحة (الاسم ورقم واتساب على الأقل). وبالنسبة للأطفال في برنامج أشبال الأمة، يجب أن يُنشئ الحساب ويديره الوالد أو الوصي القانوني عبر بوابة الأسرة، ويبقى مسؤولًا عن الحساب واستخدامه.</p>' },
      { h: '٤. الاشتراكات والرسوم والدفع', html: '<p>تُحتسب الخطط المدفوعة شهريًا بحسب الخطة التي تختارها. وتشمل وسائل الدفع المقبولة: فيزا، وماستركارد، وباي بال، والتحويل البنكي، وويسترن يونيون، وموني جرام. وأنت تفوّضنا (أو تفوّض جهة معالجة المدفوعات لدينا) بتحصيل الرسوم المستحقة للخطة التي اخترتها. والأسعار هي المعروضة في <a href="{pricing}">صفحة الأسعار</a> وقت الشراء، وقد تتغير في فترات الفوترة اللاحقة بعد إشعار مسبق.</p>' },
      { h: '٥. الإلغاء', html: '<p>يمكنك إلغاء اشتراكك في أي وقت، ويسري الإلغاء في نهاية فترة الفوترة الحالية. ولا نردّ مبالغ جزئية عن أجزاء الشهر إلا إذا اقتضى القانون المعمول به ذلك.</p>' },
      { h: '٦. سياسة تغيير المواعيد', html: '<p>يمكن تغيير موعد الحصة بإشعار مسبق لا يقل عن ٢٤ ساعة. وقد تسقط الحصص التي تُلغى أو تفوت بإشعار أقصر من ذلك، وفق تقديرنا، إلا في حالات الطوارئ الحقيقية.</p>' },
      { h: '٧. تسجيلات الحصص والملكية الفكرية', html: '<p>تُسجَّل الحصص المباشرة للرجوع إليها، وتُحفظ في حساب الطالب أو حساب بوابة الأسرة. والتسجيلات مخصّصة لاستخدامك التعليمي الشخصي فقط، ولا يجوز إعادة توزيعها أو بيعها أو نشرها دون إذن كتابي منا. وتبقى مواد دوراتنا ومناهجنا وعلامتنا التجارية ومحتوى موقعنا ملكية فكرية لأكاديمية الأمة.</p>' },
      { h: '٨. قواعد السلوك', html: '<p>نطلب من جميع الطلاب وأولياء الأمور والأوصياء معاملة المعلمين والموظفين باحترام. ونحتفظ بحق تعليق أو إنهاء الحسابات التي يصدر عنها سلوك مسيء أو تحرّش، أو تستخدم خدماتنا لأي غرض غير مشروع.</p>' },
      { h: '٩. مؤهلات المعلمين والنتائج التعليمية', html: '<p>معلمونا من خريجي جامعة الأزهر. ومع التزامنا بتعليم عالي الجودة، فإن نتائج التعلّم الفردية تتوقف على عوامل كثيرة، منها جهد الطالب وانتظامه في الحضور ومستواه عند البدء، ولا يمكننا ضمان نتائج أو مدد زمنية محددة (كإتمام الحفظ أو نيل الإجازة مثلًا).</p>' },
      { h: '١٠. حدود المسؤولية', html: '<p>إلى أقصى حد يسمح به القانون، لا تتحمل أكاديمية الأمة المسؤولية عن الأضرار غير المباشرة أو العرضية أو التبعية الناشئة عن استخدامك لخدماتنا. ويقتصر إجمالي مسؤوليتنا عن أي مطالبة تتعلق بخدماتنا على المبلغ الذي دفعته لنا خلال الأشهر الثلاثة السابقة للمطالبة.</p>' },
      { h: '١١. إنهاء الخدمة', html: '<p>يجوز لنا تعليق أو إنهاء وصول أي حساب يخالف هذه الشروط إلى خدماتنا. ويمكنك التوقف عن استخدام خدماتنا وإلغاء اشتراكك في أي وقت كما هو موضّح أعلاه.</p>' },
      { h: '١٢. القانون الحاكم', html: '<p>تخضع هذه الشروط للقوانين المعمول بها في مكان عمل أكاديمية الأمة، دون اعتبار لقواعد تنازع القوانين، إلا حيث ينص قانون حماية المستهلك المحلي في بلدك على خلاف ذلك.</p>' },
      { h: '١٣. التغييرات على هذه الشروط', html: '<p>قد نحدّث هذه الشروط من وقت لآخر، ويُعدّ استمرارك في استخدام خدماتنا بعد سريان التغييرات قبولًا للشروط المحدّثة.</p>' },
      { h: '١٤. تواصل معنا', html: `<p>يمكنك إرسال أسئلتك حول هذه الشروط إلى ${EMAIL} أو عبر واتساب.</p>` },
    ],
    note: 'ملاحظة: هذا نموذج عام مبني على الخدمات الموصوفة في موقعنا، ولا يغني عن استشارة قانونية تناسب نطاقك القضائي.',
  },
};

// German, French and Italian convenience translations (the English text prevails — stated on the page).
const TRANSLATED: Partial<Record<Lang, { privacy: LegalContent; terms: LegalContent }>> = { de: legalDe, fr: legalFr, it: legalIt };

export const getLegal = (doc: LegalDoc, lang: Lang): LegalContent => {
  const tr = TRANSLATED[lang];
  if (tr) return tr[doc];
  const all = doc === 'privacy' ? PRIVACY : TERMS;
  return all[lang] ?? all.en;
};
