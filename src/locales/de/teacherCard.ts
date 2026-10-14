/** TeacherCard — Deutsch. */
import type { Teacher } from '@/data/people';

export default {
  L: (t: Teacher) => ({
    verified: t.ijazah ? 'Ijaza verifiziert' : 'Qualifikationen verifiziert',
    bestFor: 'Ideal für',
    creds: 'Qualifikationen',
    book: `Bei ${t.name.split(' ')[0]} buchen`,
    profile: 'Vollständiges Profil',
  }),
};
