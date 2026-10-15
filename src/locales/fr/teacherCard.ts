/** TeacherCard — français. */
import type { Teacher } from '@/data/people';

export default {
  L: (t: Teacher) => ({
    verified: t.ijazah ? 'Ijaza vérifiée' : 'Diplômes vérifiés',
    bestFor: 'Idéal pour',
    creds: 'Diplômes',
    book: `Réserver avec ${t.name.split(' ')[0]}`,
    profile: 'Profil complet',
  }),
};
