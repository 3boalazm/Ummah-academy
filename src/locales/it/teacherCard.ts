/** TeacherCard — italiano. */
import type { Teacher } from '@/data/people';

export default {
  L: (t: Teacher) => ({
    verified: t.ijazah ? 'Ijaza verificata' : 'Titoli verificati',
    bestFor: 'Ideale per',
    creds: 'Titoli',
    book: `Prenota con ${t.name.split(' ')[0]}`,
    profile: 'Profilo completo',
  }),
};
