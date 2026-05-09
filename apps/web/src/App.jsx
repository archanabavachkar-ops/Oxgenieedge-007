
import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { CartProvider } from '@/contexts/CartContext.jsx';
import { CrmRoleProvider } from '@/contexts/CrmRoleContext.jsx';
import { ThemeProvider } from '@/contexts/ThemeContext.jsx';

import ProtectedRoute from './components/ProtectedRoute.jsx';
import CrmProtectedRoute from './components/CrmProtectedRoute.jsx';
import ProtectedAgentRoute from './components/ProtectedAgentRoute.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import ScrollToTopButton from './components/ScrollToTopButton.jsx';
import FloatingAIAssistant from './components/FloatingAIAssistant.jsx';
import { Toaster } from './components/ui/sonner.jsx';
import AnimatedPage from './components/AnimatedPage.jsx';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js';
import ShortcutsHelpDialog from './components/ShortcutsHelpDialog.jsx';

// Public Pages
import HomePage from './pages/HomePage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import PricingPage from './pages/PricingPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import IndustriesPage from './pages/IndustriesPage.jsx';
import FaqPage from './pages/FaqPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import TermsOfServicePage from './pages/TermsOfServicePage.jsx';
import DataDeletionPage from './pages/DataDeletionPage.jsx';
import PartnerApplicationPage from './pages/PartnerApplicationPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// New Dropdown Pages
import AIChiefOfStaffPage from './pages/solutions/AIChiefOfStaffPage.jsx';
import AILeadManagementPage from './pages/solutions/AILeadManagementPage.jsx';
import CRMSystemPage from './pages/platform/CRMSystemPage.jsx';
import AIAssistantPage from './pages/platform/AIAssistantPage.jsx';
import PartnerPortalPage from './pages/platform/PartnerPortalPage.jsx';
import IntegrationsPage from './pages/resources/IntegrationsPage.jsx';
import HelpCenterPage from './pages/resources/HelpCenterPage.jsx';

// Auth Pages
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';

// Admin Management Pages
import UserManagementPage from './pages/UserManagementPage.jsx';

// CRM Pages
import LeadsPage from './pages/crm/LeadsPage.jsx';
import CrmContactsPage from './pages/crm/ContactsPage.jsx';
import CustomersPage from './pages/crm/CustomersPage.jsx';
import DealsPage from './pages/crm/DealsPage.jsx';
import TaskDashboardPage from './pages/crm/TaskDashboardPage.jsx';
import InteractionsPage from './pages/crm/InteractionsPage.jsx';
import ReportsPage from './pages/crm/ReportsPage.jsx';
import IntegrationsMainPage from './pages/crm/IntegrationsMainPage.jsx';
import CrmDashboardPage from './pages/crm/CrmDashboardPage.jsx';
import AgentPerformancePage from './pages/crm/AgentPerformancePage.jsx';
import EscalationsPage from './pages/crm/EscalationsPage.jsx';
import AutomationRulesPage from './pages/crm/AutomationRulesPage.jsx';
import ScoringPage from './pages/crm/ScoringPage.jsx';
import NotificationsPage from './pages/crm/NotificationsPage.jsx';
import SettingsPage from './pages/crm/SettingsPage.jsx';

// Lazy Loaded Protected Pages
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboard.jsx'));
const CallCentrePage = lazy(() => import('./pages/call-centre/CallCentreMainPage.jsx'));

// Internal Tools
const TestingChecklistPage = lazy(() => import('./pages/TestingChecklistPage.jsx'));

function AppContent() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useKeyboardShortcuts(
    () => {
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]');
      if (searchInput) searchInput.focus();
    },
    () => setIsHelpOpen(true)
  );

  return (
    <>
      <ScrollToTop />
      <ScrollToTopButton />
      <FloatingAIAssistant />
      <ShortcutsHelpDialog isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <Toaster position="top-center" />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
            Loading...
          </div>
        }
      >
        <Routes>

          {/* ================= PUBLIC ROUTES ================= */}

          <Route path="/" element={<AnimatedPage><HomePage /></AnimatedPage>} />
          <Route path="/landing-page" element={<AnimatedPage><LandingPage /></AnimatedPage>} />
          <Route path="/about" element={<AnimatedPage><AboutPage /></AnimatedPage>} />
          <Route path="/contact" element={<AnimatedPage><ContactPage /></AnimatedPage>} />
          <Route path="/pricing" element={<AnimatedPage><PricingPage /></AnimatedPage>} />
          <Route path="/services" element={<AnimatedPage><ServicesPage /></AnimatedPage>} />
          <Route path="/products" element={<AnimatedPage><ProductsPage /></AnimatedPage>} />
          <Route path="/industries" element={<AnimatedPage><IndustriesPage /></AnimatedPage>} />
          <Route path="/faq" element={<AnimatedPage><FaqPage /></AnimatedPage>} />
          <Route path="/privacy" element={<AnimatedPage><PrivacyPage /></AnimatedPage>} />
          <Route path="/terms" element={<AnimatedPage><TermsOfServicePage /></AnimatedPage>} />
          <Route path="/data-deletion-request" element={<AnimatedPage><DataDeletionPage /></AnimatedPage>} />
          <Route path="/partner-application" element={<AnimatedPage><PartnerApplicationPage /></AnimatedPage>} />

          {/* ================= SOLUTIONS ================= */}

          <Route
            path="/solutions/ai-chief-of-staff"
            element={<AnimatedPage><AIChiefOfStaffPage /></AnimatedPage>}
          />

          <Route
            path="/solutions/ai-lead-management"
            element={<AnimatedPage><AILeadManagementPage /></AnimatedPage>}
          />

          {/* ================= PLATFORM ================= */}

          <Route
            path="/platform/crm-system"
            element={<AnimatedPage><CRMSystemPage /></AnimatedPage>}
          />

          <Route
            path="/platform/ai-assistant"
            element={<AnimatedPage><AIAssistantPage /></AnimatedPage>}
          />

          <Route
            path="/platform/partner-portal"
            element={<AnimatedPage><PartnerPortalPage /></AnimatedPage>}
          />

          {/* ================= RESOURCES ================= */}

          <Route
            path="/resources/integrations"
            element={<AnimatedPage><IntegrationsPage /></AnimatedPage>}
          />

          <Route
            path="/resources/help-center"
            element={<AnimatedPage><HelpCenterPage /></AnimatedPage>}
          />

          {/* ================= AUTH ================= */}

          <Route
            path="/login"
            element={<AnimatedPage><LoginPage /></AnimatedPage>}
          />

          <Route
            path="/signup"
            element={<AnimatedPage><SignupPage /></AnimatedPage>}
          />

          <Route
            path="/forgot-password"
            element={<AnimatedPage><ForgotPasswordPage /></AnimatedPage>}
          />

          <Route
            path="/admin/login"
            element={<AnimatedPage><AdminLoginPage /></AnimatedPage>}
          />

          {/* ================= PUBLIC USER DASHBOARD ================= */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <DashboardPage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />

          {/* ================= ADMIN DASHBOARD ================= */}

          <Route
            path="/admin/dashboard"
            element={
              <CrmProtectedRoute>
                <AnimatedPage>
                  <AdminDashboardPage />
                </AnimatedPage>
              </CrmProtectedRoute>
            }
          />

          {/* ================= ADMIN USERS ================= */}

          <Route
            path="/admin/users"
            element={
              <CrmProtectedRoute allowedRoles={['admin', 'ceo']}>
                <AnimatedPage><UserManagementPage /></AnimatedPage>
              </CrmProtectedRoute>
            }
          />

          {/* ================= CRM ROUTES ================= */}

          <Route path="/admin/crm/dashboard" element={<CrmProtectedRoute><AnimatedPage><CrmDashboardPage /></AnimatedPage></CrmProtectedRoute>} />
          <Route path="/admin/crm/leads" element={<CrmProtectedRoute><AnimatedPage><LeadsPage /></AnimatedPage></CrmProtectedRoute>} />
          <Route path="/admin/crm/contacts" element={<CrmProtectedRoute><AnimatedPage><CrmContactsPage /></AnimatedPage></CrmProtectedRoute>} />
          <Route path="/admin/crm/customers" element={<CrmProtectedRoute><AnimatedPage><CustomersPage /></AnimatedPage></CrmProtectedRoute>} />
          <Route path="/admin/crm/deals" element={<CrmProtectedRoute><AnimatedPage><DealsPage /></AnimatedPage></CrmProtectedRoute>} />
          <Route path="/admin/crm/tasks" element={<CrmProtectedRoute><AnimatedPage><TaskDashboardPage /></AnimatedPage></CrmProtectedRoute>} />
          <Route path="/admin/crm/interactions" element={<CrmProtectedRoute><AnimatedPage><InteractionsPage /></AnimatedPage></CrmProtectedRoute>} />
          <Route path="/admin/crm/reports" element={<CrmProtectedRoute><AnimatedPage><ReportsPage /></AnimatedPage></CrmProtectedRoute>} />
          <Route path="/admin/crm/integrations" element={<CrmProtectedRoute><AnimatedPage><IntegrationsMainPage /></AnimatedPage></CrmProtectedRoute>} />
          <Route path="/admin/crm/agents" element={<CrmProtectedRoute><AnimatedPage><AgentPerformancePage /></AnimatedPage></CrmProtectedRoute>} />
          <Route path="/admin/crm/escalations" element={<CrmProtectedRoute><AnimatedPage><EscalationsPage /></AnimatedPage></CrmProtectedRoute>} />
          <Route path="/admin/crm/automations" element={<CrmProtectedRoute><AnimatedPage><AutomationRulesPage /></AnimatedPage></CrmProtectedRoute>} />
          <Route path="/admin/crm/scoring" element={<CrmProtectedRoute><AnimatedPage><ScoringPage /></AnimatedPage></CrmProtectedRoute>} />
          <Route path="/admin/crm/notifications" element={<CrmProtectedRoute><AnimatedPage><NotificationsPage /></AnimatedPage></CrmProtectedRoute>} />
          <Route path="/admin/crm/settings" element={<CrmProtectedRoute><AnimatedPage><SettingsPage /></AnimatedPage></CrmProtectedRoute>} />

          {/* Legacy CRM Catch-all */}
          <Route
            path="/crm/*"
            element={
              <CrmProtectedRoute>
                <AnimatedPage>
                  <CrmDashboardPage />
                </AnimatedPage>
              </CrmProtectedRoute>
            }
          />

          {/* ================= ADMIN CATCH-ALL ================= */}

          <Route
            path="/admin/*"
            element={
              <CrmProtectedRoute>
                <AnimatedPage>
                  <AdminDashboardPage />
                </AnimatedPage>
              </CrmProtectedRoute>
            }
          />

          {/* ================= CALL CENTRE ================= */}

          <Route
            path="/call-centre/*"
            element={
              <CrmProtectedRoute>
                <AnimatedPage>
                  <CallCentrePage />
                </AnimatedPage>
              </CrmProtectedRoute>
            }
          />
          
          {/* ================= INTERNAL TOOLS ================= */}
          <Route
            path="/testing-checklist"
            element={
              <AnimatedPage>
                <TestingChecklistPage />
              </AnimatedPage>
            }
          />

          {/* ================= REDIRECT ================= */}

          <Route
            path="/home"
            element={<Navigate to="/" replace />}
          />

          {/* ================= 404 ================= */}

          <Route
            path="/404"
            element={<AnimatedPage><NotFoundPage /></AnimatedPage>}
          />

          <Route
            path="*"
            element={<AnimatedPage><NotFoundPage /></AnimatedPage>}
          />

        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <CrmRoleProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </CrmRoleProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
