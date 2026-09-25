import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/features/auth/AuthContext';
import { RedirectIfAuthed, RequireAdmin, RequireAuth } from '@/app/guards';
import { AppLayout } from '@/components/layout/AppLayout';

const LoginPage = lazy(() => import('@/features/auth/LoginPage').then((module) => ({ default: module.LoginPage })));
const HomePage = lazy(() => import('@/features/home/HomePage').then((module) => ({ default: module.HomePage })));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const SellingBillsPage = lazy(() => import('@/features/selling-bills/SellingBillsPage').then((module) => ({ default: module.SellingBillsPage })));
const NewSellingBillPage = lazy(() => import('@/features/selling-bills/NewSellingBillPage').then((module) => ({ default: module.NewSellingBillPage })));
const SellingBillDetailPage = lazy(() => import('@/features/selling-bills/SellingBillDetailPage').then((module) => ({ default: module.SellingBillDetailPage })));
const SellingBillPrintPage = lazy(() => import('@/features/selling-bills/SellingBillPrintPage').then((module) => ({ default: module.SellingBillPrintPage })));
const DeliveryPlanningPage = lazy(() => import('@/features/selling-bills/DeliveryPlanningPage').then((module) => ({ default: module.DeliveryPlanningPage })));
const DepositsPage = lazy(() => import('@/features/deposits/DepositsPage').then((module) => ({ default: module.DepositsPage })));
const ChecksPage = lazy(() => import('@/features/checks/ChecksPage').then((module) => ({ default: module.ChecksPage })));
const ProvisionsPage = lazy(() => import('@/features/provisions/ProvisionsPage').then((module) => ({ default: module.ProvisionsPage })));
const PendingPage = lazy(() => import('@/features/pending/PendingPage').then((module) => ({ default: module.PendingPage })));
const InventoryPage = lazy(() => import('@/features/inventory/InventoryPage').then((module) => ({ default: module.InventoryPage })));
const BuyingBillsPage = lazy(() => import('@/features/buying-bills/BuyingBillsPage').then((module) => ({ default: module.BuyingBillsPage })));
const BuyingBillDetailPage = lazy(() => import('@/features/buying-bills/BuyingBillDetailPage').then((module) => ({ default: module.BuyingBillDetailPage })));
const AdministrationPage = lazy(() => import('@/features/admin/AdministrationPage').then((module) => ({ default: module.AdministrationPage })));
const DirectoriesPage = lazy(() => import('@/features/directories/DirectoriesPage').then((module) => ({ default: module.DirectoriesPage })));
const OperationsPage = lazy(() => import('@/features/operations/OperationsPage').then((module) => ({ default: module.OperationsPage })));
const GlobalSearchPage = lazy(() => import('@/features/search/GlobalSearchPage').then((module) => ({ default: module.GlobalSearchPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function RouteFallback() {
  return (
    <div className="grid min-h-[42vh] place-items-center" role="status" aria-live="polite">
      <div className="flex items-center gap-3 rounded-2xl border border-[#ddd5cc] bg-[#fffefd] px-5 py-4 text-sm font-semibold text-[#615751] shadow-[0_12px_34px_rgba(67,51,42,0.08)]">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d2c7bd] border-t-[#f20f1f]" />
        Apertura sezione…
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route
                  path="/login"
                  element={
                    <RedirectIfAuthed>
                      <LoginPage />
                    </RedirectIfAuthed>
                  }
                />
                <Route
                  path="/vendite/:uuid/stampa"
                  element={
                    <RequireAuth>
                      <SellingBillPrintPage />
                    </RequireAuth>
                  }
                />
                <Route
                  element={
                    <RequireAuth>
                      <AppLayout />
                    </RequireAuth>
                  }
                >
                  <Route index element={<HomePage />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="attivita" element={<OperationsPage />} />
                  <Route path="cerca" element={<GlobalSearchPage />} />
                  <Route path="vendite" element={<SellingBillsPage />} />
                  <Route path="vendite/nuova" element={<NewSellingBillPage />} />
                  <Route path="vendite/:uuid" element={<SellingBillDetailPage />} />
                  <Route path="consegne" element={<DeliveryPlanningPage />} />
                  <Route path="ordini" element={<PendingPage />} />
                  <Route path="anagrafiche" element={<DirectoriesPage />} />
                  <Route path="acquisti" element={<BuyingBillsPage />} />
                  <Route path="acquisti/:uuid" element={<BuyingBillDetailPage />} />
                  <Route path="magazzino" element={<InventoryPage />} />
                  <Route path="acconti" element={<DepositsPage />} />
                  <Route path="assegni" element={<ChecksPage />} />
                  <Route path="provvigioni" element={<ProvisionsPage />} />
                  <Route
                    path="amministrazione"
                    element={
                      <RequireAdmin>
                        <AdministrationPage />
                      </RequireAdmin>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
        <Toaster position="bottom-right" richColors closeButton />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
