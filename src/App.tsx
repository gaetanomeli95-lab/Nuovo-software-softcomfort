import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/features/auth/AuthContext';
import { RedirectIfAuthed, RequireAdmin, RequireAuth } from '@/app/guards';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { HomePage } from '@/features/home/HomePage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { SellingBillsPage } from '@/features/selling-bills/SellingBillsPage';
import { SellingBillDetailPage } from '@/features/selling-bills/SellingBillDetailPage';
import { SellingBillPrintPage } from '@/features/selling-bills/SellingBillPrintPage';
import { DepositsPage } from '@/features/deposits/DepositsPage';
import { ChecksPage } from '@/features/checks/ChecksPage';
import { ProvisionsPage } from '@/features/provisions/ProvisionsPage';
import { PendingPage } from '@/features/pending/PendingPage';
import { InventoryPage } from '@/features/inventory/InventoryPage';
import { BuyingBillsPage } from '@/features/buying-bills/BuyingBillsPage';
import { BuyingBillDetailPage } from '@/features/buying-bills/BuyingBillDetailPage';
import { ComingSoon } from '@/components/common/ComingSoon';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <AuthProvider>
          <BrowserRouter>
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
                <Route path="vendite" element={<SellingBillsPage />} />
                <Route path="vendite/:uuid" element={<SellingBillDetailPage />} />
                <Route path="ordini" element={<PendingPage />} />
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
                      <ComingSoon title="Amministrazione" />
                    </RequireAdmin>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
        <Toaster position="bottom-right" richColors closeButton />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
