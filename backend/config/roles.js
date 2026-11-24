// Single source of truth for the eight primary roles on the backend.
// This mirrors frontend/src/config/roles.js. Route guards, utilities, seeds
// and the User schema should all import from here instead of hardcoding roles.

const ROLES = Object.freeze({
  HEADMASTER: 'headmaster',
  ACADEMIC_ADMIN: 'academic_admin',
  DISCIPLINE_ADMIN: 'discipline_admin',
  ACCOUNTS_ADMIN: 'accounts_admin',
  ADMIN_ASSISTANT: 'admin_assistant',
  TEACHER: 'teacher',
  PARENT: 'parent',
  STUDENT: 'student'
});

const ALL_ROLES = Object.freeze(Object.values(ROLES));

const ROLE_LABELS = Object.freeze({
  [ROLES.HEADMASTER]: 'Headmaster',
  [ROLES.ACADEMIC_ADMIN]: 'Academic Administrator',
  [ROLES.DISCIPLINE_ADMIN]: 'Discipline Administrator',
  [ROLES.ACCOUNTS_ADMIN]: 'Accounts Administrator',
  [ROLES.ADMIN_ASSISTANT]: 'Admin Assistant',
  [ROLES.TEACHER]: 'Teacher',
  [ROLES.PARENT]: 'Parent',
  [ROLES.STUDENT]: 'Student'
});

const ROLE_ROUTES = Object.freeze({
  [ROLES.HEADMASTER]: '/portal/headmaster',
  [ROLES.ACADEMIC_ADMIN]: '/portal/academic-admin',
  [ROLES.DISCIPLINE_ADMIN]: '/portal/discipline-admin',
  [ROLES.ACCOUNTS_ADMIN]: '/portal/accounts-admin',
  [ROLES.ADMIN_ASSISTANT]: '/portal/admin-assistant',
  [ROLES.TEACHER]: '/portal/teacher',
  [ROLES.PARENT]: '/portal/parent',
  [ROLES.STUDENT]: '/portal/student'
});

// Permission keys are deliberately narrow: one capability per key so a role
// never needs a broad "admin" flag that could leak into another domain.
const PERMISSIONS = Object.freeze({
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

  STUDENT_MANAGE: 'student:manage',
  PARENT_MANAGE: 'parent:manage',
  STAFF_MANAGE: 'staff:manage',
  APPLICATION_REVIEW: 'application:review',
  APPLICATION_APPROVE: 'application:approve',
  APPLICATION_REGISTER: 'application:register',

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

  DISCIPLINE_RECORD: 'discipline:record',
  DISCIPLINE_VIEW: 'discipline:view',
  DISCIPLINE_NOTIFY_PARENT: 'discipline:notify_parent',

  FEE_STRUCTURE_MANAGE: 'fee:structure_manage',
  INVOICE_CREATE: 'invoice:create',
  PAYMENT_RECORD: 'payment:record',
  EXPENSE_MANAGE: 'expense:manage',
  FINANCE_VIEW: 'finance:view',

  ANNOUNCEMENT_CREATE: 'announcement:create',
  NOTIFICATION_VIEW: 'notification:view',
  REPORT_VIEW: 'report:view',
  DOCUMENT_UPLOAD: 'document:upload'
});

const P = PERMISSIONS;

const ROLE_PERMISSIONS = Object.freeze({
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

const can = (role, permission) => (ROLE_PERMISSIONS[role] || []).includes(permission);

const CATEGORY_MANAGERS = Object.freeze({
  [P.CONTENT_CATEGORIES.ACADEMIC]: Object.freeze([ROLES.HEADMASTER, ROLES.ACADEMIC_ADMIN, ROLES.ADMIN_ASSISTANT]),
  [P.CONTENT_CATEGORIES.DISCIPLINE]: Object.freeze([ROLES.HEADMASTER, ROLES.DISCIPLINE_ADMIN, ROLES.ADMIN_ASSISTANT]),
  [P.CONTENT_CATEGORIES.FINANCIAL]: Object.freeze([ROLES.HEADMASTER, ROLES.ACCOUNTS_ADMIN]),
  [P.CONTENT_CATEGORIES.GENERAL]: Object.freeze([ROLES.HEADMASTER, ROLES.ADMIN_ASSISTANT])
});

const canManageCategory = (role, category) => (CATEGORY_MANAGERS[category] || []).includes(role);

const ADMIN_ROLES = Object.freeze([
  ROLES.HEADMASTER, ROLES.ACADEMIC_ADMIN, ROLES.DISCIPLINE_ADMIN,
  ROLES.ACCOUNTS_ADMIN, ROLES.ADMIN_ASSISTANT
]);

const STAFF_ROLES = Object.freeze([...ADMIN_ROLES, ROLES.TEACHER]);

const isStaffRole = (role) => STAFF_ROLES.includes(role);
const isAdminRole = (role) => ADMIN_ROLES.includes(role);

// Roles the Headmaster is allowed to create through admin management.
const CREATABLE_ADMIN_ROLES = Object.freeze([
  ROLES.ACADEMIC_ADMIN, ROLES.DISCIPLINE_ADMIN,
  ROLES.ACCOUNTS_ADMIN, ROLES.ADMIN_ASSISTANT
]);

// Used while migrating stored role values from the previous seven-role model.
const ROLE_ALIASES = Object.freeze({ super_admin: ROLES.HEADMASTER });
const normalizeRole = (role) => ROLE_ALIASES[role] || role;

module.exports = {
  ROLES,
  ALL_ROLES,
  ROLE_LABELS,
  ROLE_ROUTES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  CATEGORY_MANAGERS,
  ADMIN_ROLES,
  STAFF_ROLES,
  CREATABLE_ADMIN_ROLES,
  ROLE_ALIASES,
  can,
  canManageCategory,
  isStaffRole,
  isAdminRole,
  normalizeRole
};
