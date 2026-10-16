import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import TopAnnouncementBar from './components/TopAnnouncementBar';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import TopBrandsSection from './components/TopBrandsSection';
import CollectionByBrandsSection from './components/CollectionByBrandsSection';
import WhyUsLightBanner from './components/WhyUsLightBanner';
import DarkFeaturedSection from './components/DarkFeaturedSection';
import UnmatchedExperienceSection from './components/UnmatchedExperienceSection';
import KeepBrowsingSection from './components/KeepBrowsingSection';
import CustomerReviewsProofSection from './components/CustomerReviewsProofSection';
import WhyUsDarkBanner from './components/WhyUsDarkBanner';
import BrandCatalog from './components/BrandCatalog';
import SwissEngineeringSection from './components/SwissEngineeringSection';
import Footer from './components/Footer';

// Modals and Drawers (Full E-Commerce Sales Funnel)
import ProductQuickViewModal from './components/ProductQuickViewModal';
import CartDrawer from './components/CartDrawer';
import OnePageCheckout from './components/OnePageCheckout';
import OrderTrackingModal from './components/OrderTrackingModal';
import AntiScamNoticeModal from './components/AntiScamNoticeModal';
import AdminDashboard from './components/admin/AdminDashboard';
import ProductDetailPage from './components/product/ProductDetailPage';
import BrandCatalogPage from './components/brand/BrandCatalogPage';

function StorefrontContent() {
  const {
    route,
    detailProduct,
    findProductBySlug,
    navigateToHome
  } = useStore();

  const isProductPage = route?.page === 'product';
  const isBrandPage = route?.page === 'brands';
  const activeProduct = detailProduct || (route?.slug ? findProductBySlug(route.slug) : null);

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans selection:bg-[#008A38] selection:text-white">
      {/* Top Sticky Announcement / Multi-currency Bar */}
      <TopAnnouncementBar />

      {/* 1. Desk Navbar (Figma Node 2066:1968) */}
      <Navbar />

      {/* Dynamic Main Content: Dedicated Product Detail Page OR Brand Catalog Page OR Storefront Landing Page */}
      {isProductPage ? (
        <main className="flex-1">
          <ProductDetailPage
            product={activeProduct}
            onBackToHome={navigateToHome}
          />
        </main>
      ) : isBrandPage ? (
        <main className="flex-1">
          <BrandCatalogPage onBackToHome={navigateToHome} />
        </main>
      ) : (
        /* Main Storefront Content */
        <main className="flex-1">
          {/* 2. Hero Section (Retained 100% current per user directive) */}
          <HeroSection />

          {/* 3. Top Brands Grid (Figma Node 2046:327) */}
          <TopBrandsSection />

          {/* 4. Collection by Brands: Rolex & Omega Grids (Figma Node 2066:2004) */}
          <CollectionByBrandsSection />

          {/* 5. Why Us Over Others - Light Banner (Figma Node 2044:36) */}
          <WhyUsLightBanner />

          {/* 6. Dark Best Sellers / Featured Section (Figma Node 2086:4535) */}
          <DarkFeaturedSection />

          {/* 7. An Unmatched Experience - 4 Benefit Cards & Green CTA (Figma Node 2049:437) */}
          <UnmatchedExperienceSection />

          {/* 8. Keep Browsing Showcase (Figma Node 2057:1719) */}
          <KeepBrowsingSection />

          {/* 9. What our customers say about us - WhatsApp Proofs (Figma Node 2027:2458) */}
          <CustomerReviewsProofSection />

          {/* 10. Why Us Over Others - Dark Macro Banner (Figma Node 2030:2943) */}
          <WhyUsDarkBanner />

          {/* 11. Full Interactive Filterable Brand Catalog */}
          <div id="catalog-section">
            <BrandCatalog />
          </div>

          {/* 12. Swiss Engineering Calibre Teardown */}
          <div id="swiss-engineering">
            <SwissEngineeringSection />
          </div>
        </main>
      )}

      {/* 13. Luxury Footer (Figma Node 2021:628) */}
      <Footer />

      {/* Full E-Commerce Funnel Modals & Drawers */}
      <ProductQuickViewModal />
      <CartDrawer />
      <OnePageCheckout />
      <OrderTrackingModal />
      <AntiScamNoticeModal />
      {import.meta.env.VITE_PROTOTYPE_MODE !== 'true' && <AdminDashboard />}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <StorefrontContent />
    </StoreProvider>
  );
}
