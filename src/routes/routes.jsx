import { lazy } from 'react';

// Lazy load pages for better performance
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));

const Dashboard = lazy(() => import('../pages/Dashboard'));
const WorkflowPage = lazy(() => import('../pages/workflow/WorkflowPage'));
const WorkflowList = lazy(() => import('../components/workflow/WorkflowList'));
const WorkflowDetailsPage = lazy(() => import('../pages/workflow/WorkflowDetailsPage'));

const PersonalAssistant = lazy(() => import('../pages/agents/PersonalAssistant'));
const FrontendGenerator = lazy(() => import('../pages/agents/FrontendGenerator'));

const Documents = lazy(() => import('../pages/documents/Documents'));
const DocumentDetail = lazy(() => import('../pages/documents/DocumentDetail'));

const KnowledgeBase = lazy(() => import('../pages/knowledge/KnowledgeBase'));
const KnowledgeDetail = lazy(() => import('../pages/knowledge/KnowledgeDetail'));

const TokenUsage = lazy(() => import('../pages/token/TokenUsage'));
const Settings = lazy(() => import('../pages/settings/Settings'));
const Profile = lazy(() => import('../pages/settings/Profile'));

export const routes = [
  // Public Routes
  {
    path: '/login',
    element: Login,
    isPublic: true,
  },
  {
    path: '/register',
    element: Register,
    isPublic: true,
  },
  {
    path: '/forgot-password',
    element: ForgotPassword,
    isPublic: true,
  },
  {
    path: '/reset-password',
    element: ResetPassword,
    isPublic: true,
  },
  
  // Protected Routes
  {
    path: '/',
    element: Dashboard,
    isProtected: true,
  },
  {
    path: '/dashboard',
    element: Dashboard,
    isProtected: true,
  },
  
  // Workflow Routes - Verschachtelte Struktur
  {
    path: '/workflows',
    element: WorkflowPage,
    isProtected: true,
    children: [
      {
        index: true, // Index Route -> /workflows
        element: WorkflowList,
      },
      {
        path: ':id', // Child Route -> /workflows/:id
        element: WorkflowDetailsPage,
      },
    ],
  },
  
  // Agent Routes
  {
    path: '/agents/personal',
    element: PersonalAssistant,
    isProtected: true,
  },
  {
    path: '/agents/frontend',
    element: FrontendGenerator,
    isProtected: true,
  },
  
  // Document Routes
  {
    path: '/documents',
    element: Documents,
    isProtected: true,
  },
  {
    path: '/documents/:id',
    element: DocumentDetail,
    isProtected: true,
  },
  
  // Knowledge Base Routes
  {
    path: '/knowledge',
    element: KnowledgeBase,
    isProtected: true,
  },
  {
    path: '/knowledge/:id',
    element: KnowledgeDetail,
    isProtected: true,
  },
  
  // Token & Settings Routes
  {
    path: '/tokens',
    element: TokenUsage,
    isProtected: true,
  },
  {
    path: '/settings',
    element: Settings,
    isProtected: true,
  },
  {
    path: '/profile',
    element: Profile,
    isProtected: true,
  },
];