// Single source of truth for the eight primary roles.
// Kept framework-free so both route guards and UI components can use it.
// The backend mirrors these keys in backend/config/roles.js.

export const ROLES = Object.freeze({
  HEADMASTER: 'headmaster',
  ACADEMIC_ADMIN: 'academic_admin',
  DISCIPLINE_ADMIN: 'discipline_admin',
  ACCOUNTS_ADMIN: 'accounts_admin',
  ADMIN_ASSISTANT: 'admin_assistant',
  TEACHER: 'teacher',
  PARENT: 'parent',
  STUDENT: 'student'
});

export const ALL_ROLES = Object.freeze(Object.values(ROLES));

export const ROLE_LABELS = Object.freeze({
  [ROLES.HEADMASTER]: 'Headmaster',
  [ROLES.ACADEMIC_ADMIN]: 'Academic Administrator',
  [ROLES.DISCIPLINE_ADMIN]: 'Discipline Administrator',
  [ROLES.ACCOUNTS_ADMIN]: 'Accounts Administrator',
  [ROLES.ADMIN_ASSISTANT]: 'Admin Assistant',
  [ROLES.TEACHER]: 'Teacher',
  [ROLES.PARENT]: 'Parent',
  [ROLES.STUDENT]: 'Student'
});

export const ROLE_SHORT_LABELS = Object.freeze({
  [ROLES.HEADMASTER]: 'Headmaster',
  [ROLES.ACADEMIC_ADMIN]: 'Academic Admin',
  [ROLES.DISCIPLINE_ADMIN]: 'Discipline Admin',
  [ROLES.ACCOUNTS_ADMIN]: 'Accounts Admin',
  [ROLES.ADMIN_ASSISTANT]: 'Admin Assistant',
  [ROLES.TEACHER]: 'Teacher',
  [ROLES.PARENT]: 'Parent',
  [ROLES.STUDENT]: 'Student'
});

export const ROLE_ROUTES = Object.freeze({
  [ROLES.HEADMASTER]: '/portal/headmaster',
  [ROLES.ACADEMIC_ADMIN]: '/portal/academic-admin',
  [ROLES.DISCIPLINE_ADMIN]: '/portal/discipline-admin',
  [ROLES.ACCOUNTS_ADMIN]: '/portal/accounts-admin',
  [ROLES.ADMIN_ASSISTANT]: '/portal/admin-assistant',
  [ROLES.TEACHER]: '/portal/teacher',
  [ROLES.PARENT]: '/portal/parent',
  [ROLES.STUDENT]: '/portal/student'
});

export const ROLE_COLORS = Object.freeze({
  [ROLES.HEADMASTER]: '#6d28d9',
  [ROLES.ACADEMIC_ADMIN]: '#2563eb',
  [ROLES.DISCIPLINE_ADMIN]: '#b45309',
  [ROLES.ACCOUNTS_ADMIN]: '#047857',
  [ROLES.ADMIN_ASSISTANT]: '#0e7490',
  [ROLES.TEACHER]: '#7c3aed',
  [ROLES.PARENT]: '#be185d',
  [ROLES.STUDENT]: '#1d4ed8'
});

// Permission keys are deliberately narrow: one capability per key so a role
// never needs a broad "admin" flag that could leak into another domain.
export const PERMISSIONS = Object.freeze({
  // Website content (shared module, embedded in each authorized dashboard)
  CONTENT_CREATE: 'content:create',
  CONTENT_EDIT: 'content:edit',
  CONTENT_DELETE: 'content:delete',
  CONTENT_PUBLISH: 'content:publish',
  CONTENT_CATEGORIES: Object.freeze({
    ACADEMIC: 'academic',
    DISCIPLINE: 'discipline',
    FINANCIAL: 'financial',
    GENERAL: 'general'
  }),

  // People and admissions
  STUDENT_MANAGE: 'student:manage',
  PARENT_MANAGE: 'parent:manage',
  STAFF_MANAGE: 'staff:manage',
  APPLICATION_REVIEW: 'application:review',
  APPLICATION_APPROVE: 'application:approve',
  APPLICATION_REGISTER: 'application:register',

  // Academic
  CLASS_MANAGE: 'class:manage',
  SUBJECT_MANAGE: 'subject:manage',
  TEACHER_ASSIGN: 'teacher:assign',
  TIMETABLE_MANAGE: 'timetable:manage',
  EXAM_MANAGE: 'exam:manage',
  MARKS_ENTER: 'marks:enter',
  RESULTS_REVIEW: 'results:review',
  RESULTS_PUBLISH: 'results:publish',
  RESULTS_VIEW_OWN: 'results:view_own',
  MATERIAL_UPLOAD: 'material:upload',
  ASSIGNMENT_CREATE: 'assignment:create',

  // Discipline
  DISCIPLINE_RECORD: 'discipline:record',
  DISCIPLINE_VIEW: 'discipline:view',
  DISCIPLINE_NOTIFY_PARENT: 'discipline:notify_parent',

  // Finance
  FEE_STRUCTURE_MANAGE: 'fee:structure_manage',
  INVOICE_CREATE: 'invoice:create',
  PAYMENT_RECORD: 'payment:record',
  EXPENSE_MANAGE: 'expense:manage',
  FINANCE_VIEW: 'finance:view',

  // Communication and reports
  ANNOUNCEMENT_CREATE: 'announcement:create',
  NOTIFICATION_VIEW: 'notification:view',
  REPORT_VIEW: 'report:view',
  DOCUMENT_UPLOAD: 'document:upload'
});

const P = PERMISSIONS;

// The canonical role -> permission map. Frontend route guards use this only to
// hide irrelevant UI; every permission is re-checked by backend middleware.
export const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.HEADMASTER]: Object.freeze([
    P.CONTENT_CREATE, P.CONTENT_EDIT, P.CONTENT_DELETE, P.CONTENT_PUBLISH,
    P.APPLICATION_REVIEW, P.APPLICATION_APPROVE,
    P.STAFF_MANAGE, P.EXAM_MANAGE,
    P.ANNOUNCEMENT_CREATE, P.NOTIFICATION_VIEW, P.REPORT_VIEW,
    P.FINANCE_VIEW, P.DISCIPLINE_VIEW, P.DOCUMENT_UPLOAD
  ]),

  [ROLES.ACADEMIC_ADMIN]: Object.freeze([
    P.CONTENT_CREATE, P.CONTENT_EDIT, P.CONTENT_DELETE, P.CONTENT_PUBLISH,
    P.CLASS_MANAGE, P.SUBJECT_MANAGE, P.TEACHER_ASSIGN,
    P.TIMETABLE_MANAGE, P.EXAM_MANAGE, P.RESULTS_REVIEW, P.RESULTS_PUBLISH,
    P.STUDENT_MANAGE, P.NOTIFICATION_VIEW, P.REPORT_VIEW, P.DOCUMENT_UPLOAD
  ]),

  [ROLES.DISCIPLINE_ADMIN]: Object.freeze([
    P.CONTENT_CREATE, P.CONTENT_EDIT, P.CONTENT_DELETE, P.CONTENT_PUBLISH,
    P.DISCIPLINE_RECORD, P.DISCIPLINE_VIEW, P.DISCIPLINE_NOTIFY_PARENT,
    P.STUDENT_MANAGE, P.ANNOUNCEMENT_CREATE, P.NOTIFICATION_VIEW, P.REPORT_VIEW
  ]),

  [ROLES.ACCOUNTS_ADMIN]: Object.freeze([
    P.CONTENT_CREATE, P.CONTENT_EDIT, P.CONTENT_DELETE, P.CONTENT_PUBLISH,
    P.FEE_STRUCTURE_MANAGE, P.INVOICE_CREATE, P.PAYMENT_RECORD,
    P.EXPENSE_MANAGE, P.FINANCE_VIEW, P.NOTIFICATION_VIEW, P.REPORT_VIEW
  ]),

  [ROLES.ADMIN_ASSISTANT]: Object.freeze([
    P.CONTENT_CREATE, P.CONTENT_EDIT, P.CONTENT_DELETE, P.CONTENT_PUBLISH,
    P.STUDENT_MANAGE, P.PARENT_MANAGE, P.STAFF_MANAGE,
    P.APPLICATION_REVIEW, P.APPLICATION_REGISTER,
    P.DOCUMENT_UPLOAD, P.ANNOUNCEMENT_CREATE, P.NOTIFICATION_VIEW
  ]),

  [ROLES.TEACHER]: Object.freeze([
    P.MARKS_ENTER, P.MATERIAL_UPLOAD, P.ASSIGNMENT_CREATE,
    P.ANNOUNCEMENT_CREATE, P.NOTIFICATION_VIEW, P.DISCIPLINE_NOTIFY_PARENT
  ]),

  [ROLES.PARENT]: Object.freeze([
    P.RESULTS_VIEW_OWN, P.NOTIFICATION_VIEW, P.FINANCE_VIEW
  ]),

  [ROLES.STUDENT]: Object.freeze([
    P.RESULTS_VIEW_OWN, P.NOTIFICATION_VIEW, P.FINANCE_VIEW
  ])
});

export const can = (role, permission) => (ROLE_PERMISSIONS[role] || []).includes(permission);

export const canManageCategory = (role, category) => {
  const map = {
    [P.CONTENT_CATEGORIES.ACADEMIC]: [ROLES.HEADMASTER, ROLES.ACADEMIC_ADMIN, ROLES.ADMIN_ASSISTANT],
    [P.CONTENT_CATEGORIES.DISCIPLINE]: [ROLES.HEADMASTER, ROLES.DISCIPLINE_ADMIN, ROLES.ADMIN_ASSISTANT],
    [P.CONTENT_CATEGORIES.FINANCIAL]: [ROLES.HEADMASTER, ROLES.ACCOUNTS_ADMIN],
    [P.CONTENT_CATEGORIES.GENERAL]: [ROLES.HEADMASTER, ROLES.ADMIN_ASSISTANT]
  };
  return (map[category] || []).includes(role);
};

export const isStaffRole = (role) => [
  ROLES.HEADMASTER, ROLES.ACADEMIC_ADMIN, ROLES.DISCIPLINE_ADMIN,
  ROLES.ACCOUNTS_ADMIN, ROLES.ADMIN_ASSISTANT, ROLES.TEACHER
].includes(role);

export const isAdminRole = (role) => [
  ROLES.HEADMASTER, ROLES.ACADEMIC_ADMIN, ROLES.DISCIPLINE_ADMIN,
  ROLES.ACCOUNTS_ADMIN, ROLES.ADMIN_ASSISTANT
].includes(role);

// Used while migrating stored role values from the previous seven-role model.
export const ROLE_ALIASES = Object.freeze({ super_admin: ROLES.HEADMASTER });

export const normalizeRole = (role) => ROLE_ALIASES[role] || role;
