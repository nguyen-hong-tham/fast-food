# 📚 FoodFast Project Documentation Hub

> **Tất cả tài liệu và hướng dẫn cho dự án FoodFast**  
> **Last Updated**: October 17, 2025

---

## 🎯 Quick Navigation

### 🚀 Bắt đầu nhanh (START HERE)

**Bạn là Developer mới?** → Đọc theo thứ tự:

1. **[PROJECT_REQUIREMENTS_vi.md](./PROJECT_REQUIREMENTS_vi.md)** - Hiểu project là gì
2. **[DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md)** - Biết phải làm gì
3. **[database/README.md](./database/README.md)** - Setup database trước tiên
4. **[GITHUB_ISSUES.md](./GITHUB_ISSUES.md)** - Pick một issue để làm
5. **[PROJECT_TRACKER.md](./PROJECT_TRACKER.md)** - Track tiến độ

---

## 📁 Cấu trúc tài liệu

```
docs/
├── 📄 PROJECT_REQUIREMENTS_vi.md    # Requirements đầy đủ (Vietnamese)
├── 🗺️  DEVELOPMENT_ROADMAP.md       # Roadmap 6 tuần, 4 phases
├── 🎫 GITHUB_ISSUES.md              # 40 GitHub issues template
├── 📊 PROJECT_TRACKER.md            # Progress tracking & checklist
├── 📖 README.md                     # File này - Documentation hub
│
├── 📂 database/                     # 🔥 QUAN TRỌNG NHẤT - Đọc đầu tiên
│   ├── DATABASE_SCHEMA.md           # Schema chi tiết 16 collections
│   ├── APPWRITE_SETUP_GUIDE.md     # Hướng dẫn setup từng bước
│   ├── QUICK_REFERENCE.md          # Cheat sheet nhanh
│   ├── foodfast-database-erd-simple.drawio  # ERD diagram
│   └── README.md                    # Database docs hub
│
├── 📂 diagrams/                     # DrawIO diagrams
│   ├── Fastfood-Deli.drawio        # System architecture
│   ├── Fastfood-Deli_Component-Diagram.drawio
│   └── Fastfood-Deli_Deployment-Diagram.drawio
│
├── 📂 admin/                        # Admin dashboard docs (empty)
└── 📂 mobile/                       # Mobile app docs (empty)
```

---

## 📖 Document Descriptions

### 1️⃣ PROJECT_REQUIREMENTS_vi.md
**Mục đích**: Requirements đầy đủ của dự án  
**Đọc khi nào**: Trước khi bắt đầu bất cứ việc gì  
**Nội dung**:
- Tầm nhìn & mục tiêu
- 3 personas: Customer, Restaurant, Admin
- 4 modules chính: Mobile App, Restaurant Portal, Admin Dashboard, Drone System
- Tech stack: React Native, Next.js, Appwrite
- 9 phases development (tuần 1-9)

**Highlights**:
- 📱 Mobile App: Browse, Order, Track, Review
- 🏪 Restaurant Portal: Menu management, Order dashboard, Analytics
- 🎛️ Admin Dashboard: Approve restaurants, Manage drones, System analytics
- 🚁 Drone System: 60-second simulation, Real-time tracking

---

### 2️⃣ DEVELOPMENT_ROADMAP.md
**Mục đích**: Lộ trình development chi tiết 6 tuần  
**Đọc khi nào**: Sau khi đọc requirements, để biết phải làm gì  
**Nội dung**:
- **Phase 0** (Week 1): Database Foundation - 6 issues, 12-16h
- **Phase 1** (Week 2-3): Restaurant Portal MVP - 8 issues, 60-80h
- **Phase 2** (Week 3-4): Mobile Enhancement - 8 issues, 40-50h
- **Phase 3** (Week 4-5): Admin Enhancement - 8 issues, 50-60h
- **Phase 4** (Week 5-6): Integration & Polish - 10 issues, 30-40h

**Highlights**:
- ✅ Current state analysis (70% Mobile, 40% Admin, 0% Portal)
- 📊 4 sprints planning
- 🎯 Success metrics (API < 500ms, Payment > 97%)
- 🔗 Dependencies graph
- 👥 Team assignments suggestion

---

### 3️⃣ GITHUB_ISSUES.md
**Mục đích**: Template cho tất cả 40 GitHub issues  
**Đọc khi nào**: Khi muốn tạo issues trên GitHub  
**Nội dung**:
- 40 issues chi tiết với:
  - Description đầy đủ
  - Acceptance criteria
  - Code templates
  - Estimated time
  - Dependencies
  - Documentation references

**How to use**:
1. Copy từng issue vào GitHub
2. Assign labels: `phase-X`, `pX-priority`, `mobile/portal/admin/db`
3. Link dependencies
4. Assign to team members

**Example Issues**:
- #1: Create Critical Collections (4-6h)
- #7: Setup Restaurant Portal (6-8h)
- #16: VNPay Payment Integration (15-20h)
- #25: Drone Simulation Engine (12-15h)

---

### 4️⃣ PROJECT_TRACKER.md
**Mục đích**: Track tiến độ realtime  
**Đọc khi nào**: Hàng ngày để update progress  
**Nội dung**:
- 📊 Quick status overview (0/40 issues)
- ✅ Checklist cho từng phase
- 👥 Team velocity tracking
- 🔥 Critical path (những issue block tất cả)
- 📈 Weekly progress report template
- 🏆 5 milestones với target dates

**How to use**:
1. Mỗi ngày: Update issue status (Not Started → In Progress → Done)
2. Mỗi tuần: Fill weekly progress report
3. Mỗi sprint: Review milestones

**Daily Standup Template**:
- Yesterday: What I did
- Today: What I'll do
- Blockers: Any issues

---

### 5️⃣ database/DATABASE_SCHEMA.md
**Mục đích**: Schema chi tiết tất cả 16 collections  
**Đọc khi nào**: Trước khi tạo collections trong Appwrite  
**Nội dung**:
- **Section 1**: 6 existing collections cần update
- **Section 2**: 10 new collections cần tạo
- **Section 3**: Relationships giữa collections
- **Section 4**: Indexes strategy
- **Section 5**: Permission rules

**16 Collections**:
1. User ✅ (existing - need update)
2. restaurants 🆕 (CRITICAL)
3. menu ✅ (need update)
4. categories ✅
5. customizations ✅
6. menu_customizations ✅
7. orders ✅ (need update)
8. order_items 🆕 (CRITICAL)
9. payments 🆕 (CRITICAL)
10. drones 🆕
11. drone_events 🆕
12. reviews 🆕
13. promotions 🆕
14. user_vouchers 🆕
15. notifications 🆕
16. audit_logs 🆕

---

### 6️⃣ database/APPWRITE_SETUP_GUIDE.md
**Mục đích**: Hướng dẫn setup Appwrite từng bước  
**Đọc khi nào**: Khi thực sự tạo collections (Day 1)  
**Nội dung**:
- **Phase 1** (4-6h): restaurants, order_items, payments
- **Phase 2** (3-4h): reviews, notifications
- **Phase 3** (3-4h): drones, drone_events
- **Phase 4** (2-3h): promotions, vouchers, audit_logs

**Mỗi collection có**:
- Attribute definitions với code snippets
- Index creation commands
- Permission setup
- Validation rules
- Test data examples

**Example**:
```typescript
// Step 1: Create restaurants collection
await databases.createCollection(
  databaseId, 
  'restaurants', 
  'restaurants'
);

// Step 2: Create attributes
await databases.createStringAttribute(
  databaseId, 
  'restaurants', 
  'name', 
  255, 
  true
);
// ... more attributes
```

---

### 7️⃣ database/QUICK_REFERENCE.md
**Mục đích**: Cheat sheet tra cứu nhanh  
**Đọc khi nào**: Khi cần lookup nhanh attribute/relationship  
**Nội dung**:
- Summary table tất cả collections
- Key attributes list
- Relationship cheat sheet
- Common queries
- Setup timeline (12-16h breakdown)
- Phase-based checklists

**Use cases**:
- "Menu có field nào?" → Check table
- "Restaurant relate với collection nào?" → Check relationships
- "Phase 1 làm bao lâu?" → Check timeline

---

### 8️⃣ database/foodfast-database-erd-simple.drawio
**Mục đích**: ERD diagram để visualize database  
**Đọc khi nào**: Để hiểu tổng quan relationships  
**Nội dung**:
- 16 collection boxes với attributes
- Relationship arrows (1:1, 1:many)
- Color coding (Green=Existing, Orange=New, Yellow=Update, Red=Critical)
- Legend và summary

**How to use**:
1. Open tại: https://app.diagrams.net
2. File → Open → Choose `foodfast-database-erd-simple.drawio`
3. Zoom để xem chi tiết
4. Export as PNG/PDF nếu cần

---

## 🎯 Workflow Suggestions

### Cho Backend/Database Team:

**Week 1**: Setup Database
```bash
Day 1: Read database docs → Setup Appwrite
Day 2: Create Phase 1 collections (restaurants, order_items, payments)
Day 3: Create Phase 2 collections (reviews, notifications)
Day 4: Create Phase 3 collections (drones, drone_events)
Day 5: Create Phase 4 collections (promotions, vouchers, audit_logs)
Day 6: Update configs, test, seed data
Day 7: Code review, documentation
```

**Checklist**:
- [ ] Read `database/APPWRITE_SETUP_GUIDE.md`
- [ ] Open ERD diagram
- [ ] Create collections (follow guide)
- [ ] Update `mobile/lib/appwrite.ts`
- [ ] Update `admin/src/lib/appwrite.ts`
- [ ] Test CRUD operations
- [ ] Create seed scripts

---

### Cho Frontend - Restaurant Portal Team:

**Week 2-3**: Build Portal
```bash
Day 1-2: Setup Next.js project (#7)
Day 3-4: Authentication (#8)
Day 5-7: Onboarding flow (#9)
Week 2: Menu management (#10)
Week 3: Order dashboard (#11), Settings (#12)
```

**Checklist**:
- [ ] Read `GITHUB_ISSUES.md` #7-14
- [ ] Clone admin dashboard structure
- [ ] Setup Appwrite SDK
- [ ] Implement each feature
- [ ] Test with real data

---

### Cho Frontend - Mobile Team:

**Week 3-4**: Enhance Mobile
```bash
Day 1-2: Restaurant selection (#15)
Day 3-5: VNPay payment (#16)
Week 2: Real-time tracking (#17)
Week 2: Drone visualization (#18)
Ongoing: Push notifications (#19), Reviews (#20)
```

**Checklist**:
- [ ] Read `GITHUB_ISSUES.md` #15-22
- [ ] Update Appwrite config
- [ ] Implement each feature
- [ ] Test on iOS + Android

---

### Cho Admin Dashboard Team:

**Week 4-5**: Admin Features
```bash
Week 1: Restaurant approval (#23), Drone management (#24)
Week 2: Simulation (#25), Monitoring (#26), Analytics (#27)
Ongoing: User mgmt (#28), Audit logs (#29), Notifications (#30)
```

---

### Cho QA/Testing Team:

**Week 5-6**: Testing & Polish
```bash
Week 1: E2E testing (#36, #37)
Week 2: Performance testing (#38)
Ongoing: Bug fixes, documentation (#39, #40)
```

---

## 🔍 FAQ - Câu hỏi thường gặp

### Q: Tôi nên bắt đầu từ đâu?
**A**: 
1. Đọc `PROJECT_REQUIREMENTS_vi.md` (30 min)
2. Đọc `DEVELOPMENT_ROADMAP.md` (20 min)
3. Đọc `database/README.md` (15 min)
4. Pick issue từ `GITHUB_ISSUES.md`
5. Start coding!

---

### Q: Database setup mất bao lâu?
**A**: 12-16 giờ total:
- Phase 1 (Critical): 4-6h
- Phase 2 (High): 3-4h
- Phase 3 (Medium): 3-4h
- Phase 4 (Low): 2-3h

Chi tiết xem: `database/QUICK_REFERENCE.md` Section 3

---

### Q: Phải tạo collections theo thứ tự nào?
**A**: Theo dependencies:
1. **#1**: restaurants, order_items, payments (CRITICAL - không có không làm được gì)
2. **#2**: Update menu, orders (cần restaurantId)
3. **#3**: reviews, notifications (high priority)
4. **#4**: drones, drone_events
5. **#5**: promotions, vouchers, audit_logs

Xem dependency graph tại: `DEVELOPMENT_ROADMAP.md` Section "Dependencies Graph"

---

### Q: Issue nào block tất cả development?
**A**: 
- **#6** - Update Appwrite Config → BLOCKS ALL
- **#1** - Create Critical Collections → BLOCKS #2, #15, #16
- **#7** - Setup Restaurant Portal → BLOCKS #8-14

Xem critical path tại: `PROJECT_TRACKER.md` Section "Critical Path"

---

### Q: Làm sao biết issue đã hoàn thành?
**A**: Check "Definition of Done" trong mỗi issue:
- [ ] Code implemented
- [ ] Tests written
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Merged to main

---

### Q: Tech stack là gì?
**A**:
- **Mobile**: React Native (Expo SDK 50+), TypeScript, NativeWind (TailwindCSS)
- **Web**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Appwrite (Auth, Database, Storage, Functions)
- **Maps**: Google Maps / Mapbox
- **Payment**: VNPay
- **Notifications**: Firebase Cloud Messaging (FCM)

---

### Q: Appwrite config ở đâu?
**A**:
- Mobile: `mobile/lib/appwrite.ts`
- Admin: `admin/src/lib/appwrite.ts`
- Restaurant Portal: `restaurant-portal/lib/appwrite.ts` (sẽ tạo)

---

### Q: Làm thế nào để test local?
**A**:
```bash
# Mobile
cd mobile
npm install
npm start

# Admin Dashboard
cd admin
npm install
npm run dev

# Restaurant Portal (sau khi tạo)
cd restaurant-portal
npm install
npm run dev
```

---

### Q: Seed data ở đâu?
**A**:
- `mobile/lib/seed.ts` - Full seed với relationships
- `mobile/lib/seed-simple.ts` - Simple seed
- Run: `npx ts-node mobile/lib/seed.ts`

Sau khi setup collections mới, cần update seed scripts.

---

### Q: Làm sao track progress?
**A**:
1. **Daily**: Update `PROJECT_TRACKER.md` checklist
2. **Weekly**: Fill weekly progress report
3. **Sprint**: Review milestones

Tool gợi ý: GitHub Projects, Trello, Jira

---

### Q: Cần help với issue nào đó?
**A**:
1. Đọc "Documentation Reference" trong issue
2. Check code examples trong `GITHUB_ISSUES.md`
3. Xem similar code trong existing apps (admin, mobile)
4. Ask team trong daily standup

---

## 📚 External Resources

### Appwrite
- [Appwrite Docs](https://appwrite.io/docs)
- [Appwrite Console](https://cloud.appwrite.io)
- [Appwrite React Native SDK](https://appwrite.io/docs/getting-started-for-react-native)

### React Native
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [NativeWind](https://www.nativewind.dev/)

### Next.js
- [Next.js Docs](https://nextjs.org/docs)
- [TailwindCSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org/)

### Payment
- [VNPay Docs](https://sandbox.vnpayment.vn/apis/docs/)

### Maps
- [Google Maps React Native](https://github.com/react-native-maps/react-native-maps)
- [Mapbox](https://docs.mapbox.com/)

---

## 🎓 Learning Path

**Nếu bạn mới với tech stack này**:

### Week 0 (Preparation):
- [ ] TypeScript basics (8h)
- [ ] React basics (8h)
- [ ] Appwrite quickstart (4h)
- [ ] Read all docs trong `docs/` (4h)

### Week 1 (Database):
- [ ] Appwrite Database tutorial
- [ ] Practice CRUD operations
- [ ] Work on Issue #1-6

### Week 2+ (Features):
- [ ] Learn on the job
- [ ] Pair programming với senior
- [ ] Code review to learn

**Resources**:
- TypeScript: https://www.typescriptlang.org/docs/
- React: https://react.dev/learn
- Appwrite: https://appwrite.io/docs/quick-starts

---

## 🚀 Quick Commands

### Git Workflow:
```bash
# Start new feature
git checkout main
git pull origin main
git checkout -b feature/7-restaurant-portal-setup

# After coding
git add .
git commit -m "feat: #7 - Setup Restaurant Portal project structure"
git push origin feature/7-restaurant-portal-setup

# Create PR on GitHub
```

### Branch Naming:
- `feature/[issue-number]-description`
- `bugfix/[issue-number]-description`
- `db/[issue-number]-collection-name`

### Commit Messages:
- `feat: #7 - Add restaurant portal auth`
- `fix: #22 - Fix cart multi-restaurant bug`
- `docs: Update database schema`
- `test: Add E2E tests for order flow`

---

## 🎯 Success Criteria

**Khi nào thì project hoàn thành?**

### Technical:
- [ ] All 40 issues completed ✅
- [ ] All tests pass ✅
- [ ] API response < 500ms p95 ✅
- [ ] Payment success rate > 97% ✅
- [ ] App crash rate < 0.1% ✅

### Business:
- [ ] Customer can browse, order, pay, track ✅
- [ ] Restaurant can manage menu, accept orders ✅
- [ ] Admin can approve restaurants, manage drones ✅
- [ ] Drone simulation works smoothly ✅

### Documentation:
- [ ] All code documented ✅
- [ ] API docs complete ✅
- [ ] User guides ready ✅

---

## 🎉 Next Steps

**Ready to start?**

1. ✅ Read this file - DONE!
2. → Read `PROJECT_REQUIREMENTS_vi.md`
3. → Read `DEVELOPMENT_ROADMAP.md`
4. → Read `database/APPWRITE_SETUP_GUIDE.md`
5. → Pick Issue #1 or #7
6. → Start coding!

**Need more details?** Check specific docs above.

**Have questions?** Ask in team chat or daily standup.

**Good luck! 🚀**

---

**Documentation maintained by**: FoodFast Development Team  
**Last Updated**: October 17, 2025  
**Version**: 1.0.0
