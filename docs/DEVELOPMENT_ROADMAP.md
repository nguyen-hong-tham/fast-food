# FoodFast Development Roadmap

> **Ngày cập nhật**: October 17, 2025  
> **Mục tiêu**: Hoàn thiện nền tảng giao đồ ăn với drone delivery từ base code hiện tại

## 🎯 Tổng quan chiến lược

### Tình trạng hiện tại (Current State)
| Component | Completion | Collections/Features |
|-----------|------------|---------------------|
| **Mobile App** | 70% | ✅ Auth, Menu Browse, Cart, Order History<br>❌ Restaurant Selection, Payment, Real-time Tracking |
| **Admin Dashboard** | 40% | ✅ Login, Dashboard, Basic Management<br>❌ Restaurant Approval, Drone Management, Analytics |
| **Restaurant Portal** | 0% | ❌ Chưa có gì |
| **Database** | 37% | ✅ 6/16 collections<br>❌ 10 collections cần tạo mới |
| **Backend APIs** | 30% | ✅ Basic CRUD<br>❌ Payment, Drone, Notifications |

### Mục tiêu (Goal State)
- ✅ 16/16 database collections hoàn chỉnh
- ✅ Restaurant Portal 100% functional
- ✅ Mobile App 100% với real-time tracking
- ✅ Admin Dashboard với drone simulation
- ✅ VNPay payment integration
- ✅ Push notifications & real-time updates

---

## 📊 Development Phases

### ⚡ PHASE 0: Database Foundation (Week 1 - CRITICAL)
**Mục tiêu**: Thiết lập nền tảng database hoàn chỉnh  
**Thời gian ước tính**: 12-16 giờ  
**Dependencies**: Không có - Bắt đầu ngay

#### Priorities:
1. **🔴 P0 - Critical (4-6h)**: restaurants, order_items, payments
2. **🟠 P1 - High (3-4h)**: reviews, notifications  
3. **🟡 P2 - Medium (3-4h)**: drones, drone_events
4. **🟢 P3 - Low (2-3h)**: promotions, user_vouchers, audit_logs

**Issues cần tạo**:
- [ ] #1: [DB] Create Critical Collections (restaurants, order_items, payments)
- [ ] #2: [DB] Update Existing Collections (menu, orders)
- [ ] #3: [DB] Create High Priority Collections (reviews, notifications)
- [ ] #4: [DB] Create Medium Priority Collections (drones, drone_events)
- [ ] #5: [DB] Create Low Priority Collections (promotions, vouchers, audit)
- [ ] #6: [DB] Update Appwrite Config in All Apps

**Deliverables**:
- ✅ 16/16 collections created in Appwrite
- ✅ All indexes configured
- ✅ Permissions set correctly
- ✅ Config files updated (mobile + admin)
- ✅ Seed data scripts ready

---

### 🏗️ PHASE 1: Restaurant Portal MVP (Week 2-3)
**Mục tiêu**: Xây dựng web portal cho nhà hàng  
**Thời gian ước tính**: 60-80 giờ  
**Dependencies**: Phase 0 hoàn tất

#### Issues:
- [ ] #7: [Portal] Setup Next.js Restaurant Portal Project
- [ ] #8: [Portal] Implement Authentication & Role Management
- [ ] #9: [Portal] Create Restaurant Onboarding Flow
- [ ] #10: [Portal] Build Menu Management (CRUD + Categories)
- [ ] #11: [Portal] Implement Order Management Dashboard
- [ ] #12: [Portal] Add Restaurant Profile & Settings
- [ ] #13: [Portal] Create Analytics Dashboard (Revenue, Best Sellers)
- [ ] #14: [Portal] Implement Image Upload for Menu Items

**Deliverables**:
- ✅ Restaurant registration & approval flow
- ✅ Complete menu management system
- ✅ Real-time order dashboard
- ✅ Business analytics

---

### 📱 PHASE 2: Mobile App Enhancement (Week 3-4)
**Mục tiêu**: Nâng cấp mobile app lên 100%  
**Thời gian ước tính**: 40-50 giờ  
**Dependencies**: Phase 0 hoàn tất, Phase 1 partial

#### Issues:
- [ ] #15: [Mobile] Integrate Restaurant Selection
- [ ] #16: [Mobile] Implement VNPay Payment Integration
- [ ] #17: [Mobile] Add Real-time Order Tracking with Map
- [ ] #18: [Mobile] Implement Drone Simulation Visualization
- [ ] #19: [Mobile] Add Push Notifications (FCM)
- [ ] #20: [Mobile] Create Review & Rating System
- [ ] #21: [Mobile] Implement Voucher/Promotion System
- [ ] #22: [Mobile] Fix Cart Multi-Restaurant Issue

**Deliverables**:
- ✅ Full ordering flow with payment
- ✅ Real-time tracking với countdown 60s
- ✅ Push notifications cho order updates
- ✅ Review system

---

### 🎛️ PHASE 3: Admin Dashboard Enhancement (Week 4-5)
**Mục tiêu**: Hoàn thiện admin dashboard  
**Thời gian ước tính**: 50-60 giờ  
**Dependencies**: Phase 0, 1, 2 hoàn tất

#### Issues:
- [ ] #23: [Admin] Implement Restaurant Approval System
- [ ] #24: [Admin] Build Drone Fleet Management
- [ ] #25: [Admin] Create Drone Simulation Engine
- [ ] #26: [Admin] Add System-wide Order Monitoring
- [ ] #27: [Admin] Implement Analytics Dashboard (GMV, KPIs)
- [ ] #28: [Admin] Add User Management (Ban, Reset Password)
- [ ] #29: [Admin] Create Audit Logs Viewer
- [ ] #30: [Admin] Implement Notification Broadcast System

**Deliverables**:
- ✅ Restaurant approval workflow
- ✅ Drone management & simulation
- ✅ Comprehensive analytics
- ✅ System monitoring tools

---

### 🔗 PHASE 4: Integration & Polish (Week 5-6)
**Mục tiêu**: Tích hợp các hệ thống và hoàn thiện  
**Thời gian ước tính**: 30-40 giờ  
**Dependencies**: All previous phases

#### Issues:
- [ ] #31: [Backend] Implement VNPay Webhook Handler
- [ ] #32: [Backend] Create Order Status Automation
- [ ] #33: [Backend] Build Email Notification System
- [ ] #34: [Backend] Implement Payment Refund Flow
- [ ] #35: [Backend] Add Real-time WebSocket for Drone Updates
- [ ] #36: [Testing] End-to-End Testing (Customer Flow)
- [ ] #37: [Testing] End-to-End Testing (Restaurant Flow)
- [ ] #38: [Testing] Performance Testing & Optimization
- [ ] #39: [Docs] API Documentation
- [ ] #40: [Docs] User Guides (Customer, Restaurant, Admin)

**Deliverables**:
- ✅ Fully integrated system
- ✅ Automated workflows
- ✅ Complete testing coverage
- ✅ Production-ready documentation

---

## 📋 Issue Labels & Conventions

### Labels:
- `db` - Database/Appwrite related
- `mobile` - React Native app
- `portal` - Restaurant Portal (Next.js)
- `admin` - Admin Dashboard
- `backend` - API/Functions
- `p0-critical` - Must have (blocking)
- `p1-high` - Should have
- `p2-medium` - Nice to have
- `p3-low` - Future enhancement
- `bug` - Bug fix
- `enhancement` - New feature
- `documentation` - Documentation

### Branch naming:
- `feature/[issue-number]-short-description`
- `bugfix/[issue-number]-short-description`
- `db/[issue-number]-collection-name`

**Examples**:
- `db/1-create-critical-collections`
- `feature/7-restaurant-portal-setup`
- `feature/15-mobile-restaurant-selection`

---

## 🎯 Sprint Planning (2-week sprints)

### Sprint 1 (Week 1-2): Foundation
- Phase 0: Database Foundation ✅ 100%
- Phase 1: Restaurant Portal ⏳ 50%

### Sprint 2 (Week 3-4): Core Features
- Phase 1: Restaurant Portal ✅ 100%
- Phase 2: Mobile Enhancement ⏳ 70%

### Sprint 3 (Week 5-6): Integration
- Phase 2: Mobile Enhancement ✅ 100%
- Phase 3: Admin Enhancement ⏳ 80%
- Phase 4: Integration ⏳ 50%

### Sprint 4 (Week 7): Polish & Deploy
- Phase 3: Admin Enhancement ✅ 100%
- Phase 4: Integration ✅ 100%
- Production deployment

---

## 📈 Success Metrics

### Technical KPIs:
- [ ] API response time < 500ms (p95)
- [ ] App crash rate < 0.1%
- [ ] Payment success rate > 97%
- [ ] Real-time update latency < 2s
- [ ] Test coverage > 80%

### Business KPIs:
- [ ] Restaurant onboarding < 10 minutes
- [ ] Order completion rate > 90%
- [ ] Customer satisfaction > 4.5/5
- [ ] Drone delivery simulation accuracy 100%

---

## 🚀 Quick Start Guide

### For Developers:

**1. Setup Database (Ngày 1)**
```bash
# Đọc hướng dẫn
cat docs/database/APPWRITE_SETUP_GUIDE.md

# Tạo collections theo priority
# P0: restaurants, order_items, payments (4-6h)
# P1: reviews, notifications (3-4h)
# P2: drones, drone_events (3-4h)
# P3: promotions, user_vouchers, audit_logs (2-3h)
```

**2. Update Config (Ngày 2)**
```typescript
// mobile/lib/appwrite.ts
export const appwriteConfig = {
  // ... existing
  restaurantsCollectionId: "restaurants",
  orderItemsCollectionId: "order_items",
  paymentsCollectionId: "payments",
  reviewsCollectionId: "reviews",
  notificationsCollectionId: "notifications",
  dronesCollectionId: "drones",
  droneEventsCollectionId: "drone_events",
  promotionsCollectionId: "promotions",
  userVouchersCollectionId: "user_vouchers",
  auditLogsCollectionId: "audit_logs",
};
```

**3. Start Development (Ngày 3+)**
```bash
# Pick an issue from Phase 1
# Create feature branch
git checkout -b feature/7-restaurant-portal-setup

# Start coding
cd restaurant-portal
npm install
npm run dev
```

---

## 🔄 Dependencies Graph

```
Phase 0 (Database)
    ├── Phase 1 (Restaurant Portal)
    ├── Phase 2 (Mobile Enhancement)
    └── Phase 3 (Admin Enhancement)
         └── Phase 4 (Integration)
```

**Critical Path**:
1. Database Collections (Phase 0) → BLOCKS ALL
2. Restaurant Portal (Phase 1) → BLOCKS Mobile payment flow
3. Mobile Payment (Phase 2) → BLOCKS Full testing
4. Admin Drone Management (Phase 3) → BLOCKS Real-time tracking
5. Integration (Phase 4) → Production ready

---

## 📝 Notes

### Existing Code Reusability:
- ✅ Mobile Auth flow - Reuse for Restaurant/Admin
- ✅ Menu browsing UI - Adapt for Restaurant management
- ✅ Appwrite client setup - Extend with new collections
- ✅ Cart logic - Extend for multi-restaurant support

### Technical Debt to Address:
- ⚠️ Cart only supports single restaurant (Issue #22)
- ⚠️ Orders collection missing restaurantId (Issue #2)
- ⚠️ No error boundary in mobile app
- ⚠️ Admin dashboard lacks role-based access control

### Future Enhancements (Post-MVP):
- 🔮 Advanced drone AI routing
- 🔮 Multi-language support (i18n)
- 🔮 Dark mode
- 🔮 Social login (Google, Facebook)
- 🔮 Advanced analytics (ML predictions)
- 🔮 Restaurant mobile app (React Native)
- 🔮 Customer web app (Next.js)

---

## 👥 Team Assignments (Đề xuất)

### Backend Team (2-3 người):
- Phase 0: Database setup
- Phase 4: Payment integration, webhooks
- Ongoing: API endpoints, functions

### Frontend - Mobile Team (2 người):
- Phase 2: Mobile enhancements
- Integration with new APIs

### Frontend - Web Team (2-3 người):
- Phase 1: Restaurant Portal
- Phase 3: Admin Dashboard enhancements

### DevOps/QA (1 người):
- CI/CD setup
- Phase 4: Testing & deployment

---

## 📞 Support & Resources

**Documentation**:
- Database Schema: `docs/database/DATABASE_SCHEMA.md`
- Appwrite Setup: `docs/database/APPWRITE_SETUP_GUIDE.md`
- Quick Reference: `docs/database/QUICK_REFERENCE.md`
- Project Requirements: `docs/PROJECT_REQUIREMENTS_vi.md`

**Tools**:
- ERD Diagram: `docs/database/foodfast-database-erd-simple.drawio`
- Appwrite Console: https://cloud.appwrite.io
- GitHub Issues: https://github.com/phatle224/sgu_cnpm_foodfast/issues

**Communication**:
- Daily standups: Share progress & blockers
- Sprint planning: Every 2 weeks
- Code review: Required for all PRs
- Documentation: Update as you build

---

**Last Updated**: October 17, 2025  
**Next Review**: After Sprint 1 completion
