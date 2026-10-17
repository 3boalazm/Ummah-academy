/** Accessibility statement — English (reference locale). */
export default {
  C: {
    meta: {
      title: 'Accessibility statement | Ummah Academy',
      desc: 'How the Ummah Academy public website is built for keyboard, screen-reader and Arabic (RTL) use, and how to ask us for another way to book or get a file.',
    },
    crumb: 'Accessibility',
    eyebrow: 'Legal',
    title: 'Accessibility <span class="accent">statement</span>',
    lede: 'This public website should work with a keyboard, a screen reader, and in Arabic from right to left. If something blocks you, tell us — we will fix it or offer another way.',
    updated: 'Last updated: 17 October 2026',
    intro:
      'This statement covers the public marketing website at ummahacademy.net. The signed-in family portal is a separate application; it is listed under Known limits.',
    sections: [
      {
        h: 'Our commitment',
        p: 'We aim to meet WCAG 2.2 Level AA on this public website. We have not commissioned a third-party certification, and we do not claim that every page is perfect.',
      },
      {
        h: 'What this website already does',
        p: 'Every page has one H1, landmarks and a skip link. Menus, dialogs and accordions work from the keyboard. Focus is a visible ring. Forms have labels and described errors. Arabic pages use lang="ar" and dir="rtl". Motion and transparency follow your system preferences. Contrast on glass cards is checked in QA.',
      },
      {
        h: 'Compatible tools',
        p: 'The site is static HTML and CSS, with a little JavaScript for booking, language, theme and install. It is built for current Safari, Chrome, Firefox and Edge, and for VoiceOver, TalkBack and NVDA. Booking still works by WhatsApp or email if JavaScript is off.',
      },
      {
        h: 'Known limits',
        p: 'The family portal (progress, recordings, billing) is a separate app and is not covered here. Some older blog images still need richer alt text. Decorative glass is reduced when you ask the system to limit transparency. WhatsApp and any future payment pages are outside our control.',
      },
      {
        h: 'How to ask for help',
        p: 'If a page, PDF or booking step is hard to use, email {email} or message us on WhatsApp ({whatsapp}). Send the page address, the browser or assistive tool you use, and what you were trying to do. We aim to reply within two working days and to offer another way to book or to get the file.',
      },
      {
        h: 'Formal complaints',
        p: 'If you are not satisfied with our reply, write to {email} and ask for a review. Families in the EU may also contact their national body for digital accessibility. This statement is reviewed whenever we ship a major change to the public site.',
      },
    ],
  },
};
