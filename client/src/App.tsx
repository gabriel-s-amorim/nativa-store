import AuthHashRouter from "@/components/auth/AuthHashRouter";
import PixelRouteTracker from "@/components/analytics/PixelRouteTracker";
import StorePageViewTracker from "@/components/analytics/StorePageViewTracker";
import AccessibilityToolbar from "@/components/accessibility/AccessibilityToolbar";
import SkipLink from "@/components/accessibility/SkipLink";
import VLibrasWidget from "@/components/accessibility/VLibrasWidget";
import { Spinner } from "@/components/ui/spinner";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { CustomerAuthProvider } from "@/contexts/CustomerAuthContext";
import NotFound from "@/pages/NotFound";
import CategoryPage from "@/pages/CategoryPage";
import { lazy, Suspense } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CustomerLogin from "./pages/auth/CustomerLogin";
import CustomerRegister from "./pages/auth/CustomerRegister";
import CustomerAccount from "./pages/auth/CustomerAccount";
import CustomerForgotPassword from "./pages/auth/CustomerForgotPassword";
import CustomerResetPassword from "./pages/auth/CustomerResetPassword";
import CustomerVerifyEmail from "./pages/auth/CustomerVerifyEmail";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { StoreDiscoveryProvider } from "./contexts/StoreDiscoveryContext";
import CartDrawer from "./components/cart/CartDrawer";
import StoreSearch from "./components/search/StoreSearch";
import QuickView from "./components/product/QuickView";
import ScrollToTop from "./components/ScrollToTop";
import WhatsAppFloatingButton from "./components/WhatsAppFloatingButton";

// Lazy: o painel admin (e a lib de planilhas usada na importação em massa) só é
// carregado quando alguém acessa /admin — não pesa o bundle da loja pública.
const AdminRouter = lazy(() => import("./pages/admin/AdminRouter"));
// Lazy: PDP + Fancybox/galeria ficam fora do bundle da home e demais rotas.
const ProductPage = lazy(() => import("./pages/ProductPage"));
// Lazy: SDK do Mercado Pago (@mercadopago/sdk-react) só no checkout.
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
// Lazy: Quiz (e framer-motion do QuizCuradoria) só em /quiz — não na PDP.
const QuizPage = lazy(() => import("./pages/QuizPage"));
const StoreHome = () => <Home />;

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center admin-login-bg">
      <Spinner className="size-8 text-[#475569]" />
    </div>
  );
}

function StorePageFallback() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      style={{ background: "#F5F0E8" }}
      role="status"
      aria-label="Carregando página"
    >
      <Spinner className="size-8 text-[#C4522A]/50" />
    </div>
  );
}

function ProductPageRoute() {
  return (
    <Suspense fallback={<StorePageFallback />}>
      <ProductPage />
    </Suspense>
  );
}

function CheckoutPageRoute() {
  return (
    <Suspense fallback={<StorePageFallback />}>
      <CheckoutPage />
    </Suspense>
  );
}

function QuizPageRoute() {
  return (
    <Suspense fallback={<StorePageFallback />}>
      <QuizPage />
    </Suspense>
  );
}

function Router() {
  const [location] = useLocation();

  // Verificação manual (em vez de <Route path="/admin/:rest*">): o padrão de wildcard do
  // wouter exige pelo menos um segmento após a barra, então não bate com "/admin" sozinho.
  if (location === "/admin" || location.startsWith("/admin/")) {
    return (
      <Suspense fallback={<AdminFallback />}>
        <AdminRouter />
      </Suspense>
    );
  }

  return (
    <Switch>
      <Route path={"/"} component={StoreHome} />
      <Route path={"/categoria/:slug"} component={CategoryPage} />
      <Route path={"/entrar"} component={CustomerLogin} />
      <Route path={"/cadastro"} component={CustomerRegister} />
      <Route path={"/recuperar-senha"} component={CustomerForgotPassword} />
      <Route path={"/redefinir-senha"} component={CustomerResetPassword} />
      <Route path={"/verificar-email"} component={CustomerVerifyEmail} />
      <Route path={"/conta"} component={CustomerAccount} />
      <Route path={"/carrinho"} component={CartPage} />
      <Route path={"/checkout"} component={CheckoutPageRoute} />
      <Route path={"/favoritos"} component={WishlistPage} />
      <Route path={"/quiz"} component={QuizPageRoute} />
      <Route path={"/produto/:slug"} component={ProductPageRoute} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <AccessibilityProvider>
          <CustomerAuthProvider>
            <WishlistProvider>
              <CartProvider>
                <StoreDiscoveryProvider>
                  <AuthHashRouter />
                  <TooltipProvider>
                    <SkipLink />
                    <Toaster />
                    <StorePageViewTracker />
                    <PixelRouteTracker />
                    <ScrollToTop />
                    <CartDrawer />
                    <StoreSearch />
                    <QuickView />
                    <WhatsAppFloatingButton />
                    <AccessibilityToolbar />
                    <VLibrasWidget />
                    <div id="conteudo" tabIndex={-1}>
                      <Router />
                    </div>
                  </TooltipProvider>
                </StoreDiscoveryProvider>
              </CartProvider>
            </WishlistProvider>
          </CustomerAuthProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
