/** Domain errors. Both languages travel with the code so the UI never invents policy. */
export class DomainError extends Error {
  constructor(code, status, message, messageAr, details = null) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.status = status;
    this.messageAr = messageAr;
    this.details = details;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      messageAr: this.messageAr,
      details: this.details,
    };
  }
}

export const E = {
  unauthorized: () =>
    new DomainError('unauthorized', 401, 'Sign in required.', 'يلزم تسجيل الدخول.'),
  forbidden: () =>
    new DomainError(
      'forbidden',
      403,
      'You do not have access to this record.',
      'ليست لديك صلاحية الوصول إلى هذا السجل.',
    ),
  notFound: () => new DomainError('not_found', 404, 'Record not found.', 'السجل غير موجود.'),
  conflict: (details) =>
    new DomainError(
      'schedule_conflict',
      409,
      'This time overlaps another session for the same teacher or student.',
      'هذا الموعد يتعارض مع حصة أخرى لنفس المعلم أو نفس الطالب.',
      details,
    ),
  reason: () =>
    new DomainError('reason_required', 400, 'A clear reason is required for this change.', 'سبب واضح مطلوب لهذا التغيير.'),
  outcome: () =>
    new DomainError(
      'outcome_required',
      400,
      'A follow-up cannot be closed without an outcome.',
      'لا يمكن إغلاق المتابعة دون تسجيل النتيجة.',
    ),
  already: (what, whatAr) =>
    new DomainError('already_applied', 409, `Already ${what}. This was not applied again.`, `تم ${whatAr} مسبقًا. لم تُكرَّر العملية.`),
  frozen: () =>
    new DomainError(
      'subscription_frozen',
      409,
      'The subscription is frozen. Resume it before scheduling.',
      'الاشتراك مجمّد. استأنفه قبل جدولة حصة جديدة.',
    ),
  badState: (message, messageAr) => new DomainError('invalid_state', 409, message, messageAr),
  validation: (message, messageAr) => new DomainError('validation', 400, message, messageAr),
  credentials: () =>
    new DomainError('invalid_credentials', 401, 'Email or password is incorrect.', 'البريد أو كلمة المرور غير صحيحة.'),
};
