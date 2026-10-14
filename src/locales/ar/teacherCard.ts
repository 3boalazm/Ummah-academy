/** TeacherCard — Arabic copy. */
import type { Teacher } from '@/data/people';

export default {
  L: (t: Teacher) => ({ verified: t.ijazah ? 'إجازة موثّقة' : 'مؤهلات موثّقة', bestFor: 'الأنسب لـ', creds: 'المؤهلات', book: `احجز مع ${t.name.split(' ')[0]}`, profile: 'الملف الكامل' }),
};
