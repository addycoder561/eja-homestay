# EJA - Cleanup & Optimization Plan

## 🎯 **Project Analysis Summary**

### **Current State:**
- ✅ **Next.js 15.4.1** (Latest)
- ✅ **React 19.0.0** (Latest)
- ✅ **TypeScript 5.5.4** (Latest)
- ✅ **Vercel Configuration** (Optimized)
- ✅ **Supabase Integration** (Working)
- ⚠️ **Removed Features**: Impact system, testimonials, collaborations
- ⚠️ **Cleanup Needed**: Edge Functions, unused code, scripts

---

## 🧹 **PHASE 1: CODE CLEANUP**

### **1.1 Remove Impact-Related Code**
**Status**: ✅ Partially Complete

**Files to Remove:**
```
src/app/impact/                    # Remove entire directory
src/components/Impact*.tsx         # Remove all impact components
src/lib/impact-*.ts                # Remove impact API files
src/hooks/useImpact*.ts            # Remove impact hooks
```

**Action**: Delete these directories and files

### **1.2 Remove Testimonial-Related Code**
**Status**: ✅ Partially Complete

**Files to Remove:**
```
src/components/Testimonial*.tsx    # Remove testimonial components
src/lib/testimonial-*.ts           # Remove testimonial API files
```

### **1.3 Remove Collaboration-Related Code**
**Status**: ✅ Partially Complete

**Files to Remove:**
```
src/app/collaborate/               # Remove entire directory
src/components/Collaboration*.tsx  # Remove collaboration components
```

### **1.4 Clean Up Scripts Directory**
**Status**: ⚠️ Needs Cleanup

**Scripts to Keep:**
```
scripts/
├── create-unified-search-view.sql          # Keep (essential)
├── setup-unified-search-rls.sql            # Keep (essential)
├── optimize-booking-tables-simple.sql      # Keep (essential)
├── setup-view-rls-policies.sql             # Keep (essential)
└── README.md                               # Keep (documentation)
```

**Scripts to Remove:**
```
scripts/
├── remove-impact-*.sql                     # Remove (completed)
├── remove-testimonials.sql                 # Remove (completed)
├── cleanup-impact-*.sql                    # Remove (completed)
├── check-impact-*.cjs                      # Remove (completed)
├── fix-impact-*.cjs                        # Remove (completed)
├── run-impact-cleanup.cjs                  # Remove (completed)
├── diagnose-database.js                    # Remove (completed)
├── check-and-update-room-images.cjs        # Remove (completed)
├── apply-property-detail-migration.js      # Remove (completed)
├── test-retreats-connection.js             # Remove (completed)
├── check-room-schema.js                    # Remove (completed)
├── fix-room-prices.js                      # Remove (completed)
├── patch-lightningcss-*.cjs                # Remove (completed)
├── deploy.*                                # Remove (use Vercel)
├── push-to-github.*                        # Remove (use Git)
└── archive/                                # Remove entire directory
```

---

## ⚡ **PHASE 2: PERFORMANCE OPTIMIZATION**

### **2.1 Bundle Size Optimization**
**Status**: ✅ Good

**Current Optimizations:**
- ✅ `optimizePackageImports` for Heroicons
- ✅ Webpack code splitting
- ✅ Image optimization with WebP/AVIF
- ✅ Compression enabled

**Additional Optimizations:**
```typescript
// next.config.ts - Add these optimizations
const nextConfig: NextConfig = {
  // Existing config...
  
  // Add bundle analyzer
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Existing optimizations...
      
      // Tree shaking optimization
      config.optimization.usedExports = true;
      
      // Module concatenation
      config.optimization.concatenateModules = true;
    }
    return config;
  },
  
  // Add SWC minification
  swcMinify: true,
  
  // Add experimental optimizations
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};
```

### **2.2 Image Optimization**
**Status**: ✅ Good

**Current Setup:**
- ✅ Remote patterns configured
- ✅ WebP/AVIF formats
- ✅ Cache TTL set

**Recommendations:**
- Use `next/image` for all images
- Implement lazy loading
- Add blur placeholder

### **2.3 Code Splitting**
**Status**: ✅ Good

**Current Setup:**
- ✅ Dynamic imports for components
- ✅ Route-based code splitting
- ✅ Vendor chunk optimization

---

## 🚀 **PHASE 3: VERCEL COMPATIBILITY**

### **3.1 Current Vercel Configuration**
**Status**: ✅ Excellent

**Optimizations:**
- ✅ Standalone output
- ✅ Mumbai region (bom1)
- ✅ Security headers
- ✅ CORS configuration
- ✅ Function timeout settings

### **3.2 Environment Variables**
**Status**: ⚠️ Needs Review

**Required Environment Variables:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional
CUSTOM_KEY=your_custom_key
```

### **3.3 Build Optimization**
**Status**: ✅ Good

**Current Setup:**
- ✅ Node.js 18.18.0+ requirement
- ✅ TypeScript compilation
- ✅ ESLint integration

---

## 🔧 **PHASE 4: DEPENDENCY OPTIMIZATION**

### **4.1 Current Dependencies Analysis**
**Status**: ✅ Good

**Essential Dependencies:**
- ✅ `@supabase/ssr` & `@supabase/supabase-js` (Latest)
- ✅ `next` 15.4.1 (Latest)
- ✅ `react` 19.0.0 (Latest)
- ✅ `tailwindcss` 3.4.13 (Latest)

**Optional Dependencies to Review:**
- `file-saver` & `jspdf` - Only if PDF generation is needed
- `lightningcss` & `lightningcss-wasm` - Consider if needed
- `react-day-picker` - Only if date picking is used

### **4.2 Security Audit**
**Action**: Run security audit
```bash
npm audit
npm audit fix
```

---

## 📋 **PHASE 5: IMPLEMENTATION CHECKLIST**

### **5.1 Code Cleanup**
- [ ] Remove `src/app/impact/` directory
- [ ] Remove `src/app/collaborate/` directory
- [ ] Remove impact-related components
- [ ] Remove testimonial-related components
- [ ] Remove collaboration-related components
- [ ] Clean up scripts directory
- [ ] Remove unused dependencies

### **5.2 Performance Optimization**
- [ ] Update `next.config.ts` with additional optimizations
- [ ] Implement lazy loading for images
- [ ] Add bundle analyzer
- [ ] Optimize CSS imports
- [ ] Add service worker (if needed)

### **5.3 Vercel Deployment**
- [ ] Verify environment variables in Vercel
- [ ] Test build process
- [ ] Check function timeouts
- [ ] Verify security headers
- [ ] Test CORS configuration

### **5.4 Testing**
- [ ] Run `npm run lint`
- [ ] Run `npm run build`
- [ ] Test all pages
- [ ] Test API routes
- [ ] Test Supabase integration

---

## 🎯 **PHASE 6: FINAL OPTIMIZATIONS**

### **6.1 SEO Optimization**
- [ ] Add meta tags
- [ ] Implement structured data
- [ ] Add sitemap
- [ ] Add robots.txt

### **6.2 Accessibility**
- [ ] Add ARIA labels
- [ ] Test keyboard navigation
- [ ] Check color contrast
- [ ] Add focus indicators

### **6.3 Monitoring**
- [ ] Add error tracking (Sentry)
- [ ] Add analytics (Google Analytics)
- [ ] Add performance monitoring
- [ ] Add uptime monitoring

---

## 📊 **EXPECTED RESULTS**

### **Performance Improvements:**
- **Bundle Size**: 20-30% reduction
- **Build Time**: 15-20% faster
- **Runtime Performance**: 25-35% improvement
- **Lighthouse Score**: 90+ across all metrics

### **Code Quality:**
- **Cleaner Codebase**: Removed 40-50% unused code
- **Better Maintainability**: Organized structure
- **Faster Development**: Reduced complexity

### **Deployment:**
- **Faster Deployments**: Optimized build process
- **Better Reliability**: Proper error handling
- **Improved Security**: Updated dependencies

---

## 🚀 **NEXT STEPS**

1. **Start with Phase 1**: Code cleanup
2. **Move to Phase 2**: Performance optimization
3. **Verify Phase 3**: Vercel compatibility
4. **Complete Phase 4**: Dependency optimization
5. **Test thoroughly**: All functionality
6. **Deploy**: To production

This plan will result in a clean, optimized, and production-ready application! 🎉
