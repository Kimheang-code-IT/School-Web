import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
// Removed performance monitoring for cleaner development
import { CartProvider } from './context/CartContext.jsx';
import { UIProvider, useUI } from './context/UIContext.jsx';
import { TranslationProvider } from './hooks/useTranslation.jsx';

// ErrorBoundary must be regular import (not lazy) to catch errors from lazy-loaded components
import ErrorBoundary from './components/ErrorBoundary.jsx';
import GlobalErrorHandler from './components/GlobalErrorHandler.jsx';

// Lazy load components for better performance
const ResponsiveHeader = lazy(() => import('./components/ResponsiveHeader.jsx'));
const Footer = lazy(() => import('./components/Footer.jsx'));

const ScrollToTop = lazy(() => import('./components/ScrollToTop.jsx'));

// Lazy load pages
const Home = lazy(() => import('./pages/Home.jsx'));
const Shop = lazy(() => import('./pages/Shop.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation.jsx'));
const Courses = lazy(() => import('./pages/Courses.jsx'));
const CourseDetail = lazy(() => import('./pages/CourseDetail.jsx'));
const RegistrationDrawer = lazy(() => import('./components/RegistrationDrawer.jsx'));

// Registration wrapper component
const RegistrationWrapper = () => {
  const { isRegistrationOpen, setIsRegistrationOpen } = useUI();
  return <RegistrationDrawer isOpen={isRegistrationOpen} onClose={() => setIsRegistrationOpen(false)} triggerRef={null} />;
};
const EnrollmentConfirmation = lazy(() => import('./pages/EnrollmentConfirmation.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

// QueryClient removed since we're not using API calls

// Component to conditionally render footer
const ConditionalFooter = () => {
  const location = useLocation();
  
  // Pages where footer should be hidden
  const hideFooterPages = ['/shop', '/courses', '/products', '/order-confirmation', '/enrollment-confirmation'];
  const shouldHideFooter = hideFooterPages.some(page => location.pathname.startsWith(page));
  
  if (shouldHideFooter) {
    return null;
  }
  
  return (
    <Suspense key="footer" fallback={<div className="h-32 bg-gray-100 animate-pulse"></div>}>
      <Footer />
    </Suspense>
  );
};

function App() {
  return (
    <ErrorBoundary>
        <CartProvider>
          <UIProvider>
            <TranslationProvider>
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
            <div className="min-h-screen flex flex-col">
              <Suspense key="header" fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>}>
                <ResponsiveHeader />
              </Suspense>
              <main className="flex-grow">
                <Suspense key="main" fallback={<div className="flex items-center justify-center min-h-96"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div></div>}>
                  <Routes>
                  <Route path="/" element={<Home />} />
                  
                  {/* E-commerce routes */}
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/products/:slug" element={<ProductDetail />} />
                  <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                  
                  {/* School routes */}
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/courses/:slug" element={<CourseDetail />} />
                  <Route path="/enrollment-confirmation/:enrollmentId" element={<EnrollmentConfirmation />} />
                  <Route path="/enrollment-confirmation" element={<EnrollmentConfirmation />} />
                  
                  {/* Other routes */}
                  <Route path="/contact" element={<Contact />} />
                  
                  {/* 404 route - must be last */}
                  <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <ConditionalFooter />
              <Suspense key="registration" fallback={null}>
                <RegistrationWrapper />
              </Suspense>
              <Suspense key="scrollToTop" fallback={null}>
                <ScrollToTop />
              </Suspense>
              <GlobalErrorHandler />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 1000,
                  closeButton: true,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </div>
              </Router>
            </TranslationProvider>
          </UIProvider>
        </CartProvider>
    </ErrorBoundary>
  );
}

export default App;

