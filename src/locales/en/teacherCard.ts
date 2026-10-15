/** TeacherCard — English (reference locale) copy. */
import type { Teacher } from '@/data/people';

export default {
  L: (t: Teacher) => ({
    verified: t.ijazah ? 'Ijazah verified' : 'Credentials verified',
    bestFor: 'Best for',
    creds: 'Credentials',
    book: `Book with ${t.name.split(' ')[0]}`,
    profile: 'Full profile',
  }),
};
