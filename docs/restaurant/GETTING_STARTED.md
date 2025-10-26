# 🎯 GETTING STARTED - FoodFast Development

> **Bạn là developer mới join team?** Đọc file này trước (5 phút)

---

## ⚡ TL;DR (Too Long, Didn't Read)

```bash
# 1. Clone repo
git clone https://github.com/phatle224/sgu_cnpm_foodfast.git
cd sgu_cnpm_foodfast

# 2. Đọc docs (20 phút)
Read: docs/README.md → docs/DEVELOPMENT_ROADMAP.md

# 3. Setup database (Day 1-2)
Read: docs/database/APPWRITE_SETUP_GUIDE.md
Create: 16 Appwrite collections

# 4. Pick issue (Day 3+)
Read: docs/GITHUB_ISSUES.md
Choose: Issue #1, #7, #15, or #23
Code: git checkout -b feature/[issue-number]-description

# 5. Track progress
Update: docs/PROJECT_TRACKER.md daily
```

---

## 🎯 Mục tiêu của dự án

**FoodFast** = Uber Eats + Drone Delivery

Xây dựng nền tảng giao đồ ăn với:
- 📱 Mobile app cho khách hàng
- 🏪 Web portal cho nhà hàng
- 🎛️ Admin dashboard
- 🚁 Drone delivery simulation (60 giây)

**Tech**: React Native + Next.js + Appwrite + TypeScript

---

## 📊 Tình trạng hiện tại

| Phần | Tiến độ | Ghi chú |
|------|---------|---------|
| Mobile App | 70% | ✅ Auth, Menu, Cart đã xong |
| Admin Dashboard | 40% | ✅ Basic dashboard đã có |
| Restaurant Portal | 0% | 🔴 Chưa bắt đầu |
| Database | 37% | 🟡 6/16 collections |
| **Overall** | **30%** | 🔴 Cần hoàn thành 70% còn lại |

---

## 🚀 Bắt đầu như thế nào?

### Step 1: Đọc documentation (30 phút)

**Thứ tự đọc**:
1. ✅ `docs/README.md` (5 min) - Overview tất cả docs
2. ✅ `docs/PROJECT_REQUIREMENTS_vi.md` (15 min) - Hiểu project là gì
3. ✅ `docs/DEVELOPMENT_ROADMAP.md` (10 min) - Biết phải làm gì

**Tóm tắt nhanh**:
- Project có 4 phases, 6 tuần
- Bắt đầu từ Phase 0: Database (quan trọng nhất)
- Sau đó chia team làm Mobile/Portal/Admin song song

---

### Step 2: Setup môi trường (1-2 giờ)

#### A. Tools cần thiết:
```bash
# Node.js 18+
node --version  # Check version

# Package manager
npm --version

# Git
git --version

# Code editor: VS Code (recommended)
```

#### B. Clone repo:
```bash
git clone https://github.com/phatle224/sgu_cnpm_foodfast.git
cd sgu_cnpm_foodfast
```

#### C. Install dependencies:
```bash
# Mobile app
cd mobile
npm install

# Admin dashboard
cd ../admin
npm install

# Back to root
cd ..
```

#### D. Appwrite account:
- Đăng ký tại: https://cloud.appwrite.io
- Tạo project mới: "FoodFast"
- Copy project ID, endpoint vào `.env`

---

### Step 3: Setup Database (Day 1-2) ⚠️ QUAN TRỌNG NHẤT

**Tại sao quan trọng?**
- Database chưa xong → Không code được gì cả
- Issue #6 block tất cả features
- Phải làm trước tiên

**Hướng dẫn chi tiết**:
```bash
# 1. Đọc setup guide
cat docs/database/APPWRITE_SETUP_GUIDE.md

# 2. Open ERD diagram để hiểu structure
open docs/database/foodfast-database-erd-simple.drawio
# (Mở tại https://app.diagrams.net)

# 3. Tạo collections theo thứ tự priority
```

**Priority order**:
1. 🔴 **Phase 1** (4-6h): restaurants, order_items, payments (CRITICAL)
2. 🟠 **Phase 2** (3-4h): reviews, notifications (HIGH)
3. 🟡 **Phase 3** (3-4h): drones, drone_events (MEDIUM)
4. 🟢 **Phase 4** (2-3h): promotions, user_vouchers, audit_logs (LOW)

**Sau khi xong database**:
```bash
# Update config files
# mobile/lib/appwrite.ts
# admin/src/lib/appwrite.ts

# Test với seed data
cd mobile
npx ts-node lib/seed.ts
```

---

### Step 4: Pick an Issue (Day 3+)

**Đọc issue list**:
```bash
cat docs/GITHUB_ISSUES.md
```

**Issues tốt để bắt đầu** (cho người mới):

**Backend Team**:
- ✅ Issue #1: Create Critical Collections (4-6h) - Dễ
- ✅ Issue #2: Update Existing Collections (2-3h) - Dễ

**Frontend Team (Mobile)**:
- ✅ Issue #22: Fix Cart Multi-Restaurant Bug (4-6h) - Dễ
- ⚠️ Issue #15: Restaurant Selection (10-12h) - Trung bình
- ⚠️ Issue #20: Review System (8-10h) - Trung bình

**Frontend Team (Web)**:
- ⚠️ Issue #7: Setup Restaurant Portal (6-8h) - Trung bình
- 🔥 Issue #10: Menu Management (15-20h) - Khó

**Quy trình**:
```bash
# 1. Pick issue từ GitHub
# 2. Assign cho mình
# 3. Create branch
git checkout -b feature/[issue-number]-description

# Example:
git checkout -b feature/1-create-critical-collections

# 4. Code
# 5. Test
# 6. Commit
git add .
git commit -m "feat: #1 - Created restaurants, order_items, payments collections"

# 7. Push
git push origin feature/1-create-critical-collections

# 8. Create PR on GitHub
# 9. Request review
# 10. Merge after approval
```

---

### Step 5: Daily Workflow

**Mỗi ngày**:
```bash
# Morning (9:00 AM)
1. Daily standup (15 min)
   - Yesterday: What I did
   - Today: What I'll do
   - Blockers: Any problems

# During day
2. Code code code
3. Update PROJECT_TRACKER.md (mark progress)
4. Ask questions in team chat

# End of day (6:00 PM)
5. Commit & push code
6. Update issue status on GitHub
7. Fill timesheet (if any)
```

**Tools**:
- GitHub: Issues, PR, Projects
- Slack/Discord: Team chat
- VS Code: Code editor
- Draw.io: View ERD diagram
- Appwrite Console: Database management

---

## 📚 Tài liệu tham khảo

### Documentation (trong repo):
- `docs/README.md` - Documentation hub
- `docs/DEVELOPMENT_ROADMAP.md` - Roadmap 6 tuần
- `docs/GITHUB_ISSUES.md` - 40 issues template
- `docs/PROJECT_TRACKER.md` - Track progress
- `docs/database/DATABASE_SCHEMA.md` - Database schema chi tiết
- `docs/database/APPWRITE_SETUP_GUIDE.md` - Setup từng bước

### External Resources:
- [Appwrite Docs](https://appwrite.io/docs) - Backend
- [Expo Docs](https://docs.expo.dev/) - Mobile
- [Next.js Docs](https://nextjs.org/docs) - Web
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Language
- [TailwindCSS](https://tailwindcss.com/docs) - Styling

---

## 🎯 Sprint Planning

### Sprint 1 (Week 1-2): Foundation
**Goal**: Database setup + Restaurant Portal start

**Team assignments**:
- Backend (2-3 người): Issue #1-6 (Database)
- Frontend Web (2-3 người): Issue #7-9 (Portal setup)
- Frontend Mobile (1-2 người): Issue #22 (Bug fix)

**Deliverables**:
- ✅ 16 collections created
- ✅ Config files updated
- ✅ Restaurant Portal có auth & basic structure

---

### Sprint 2 (Week 3-4): Core Features
**Goal**: Restaurant Portal 100% + Mobile 80%

**Team assignments**:
- Frontend Web: Issue #10-14 (Menu, Orders, Analytics)
- Frontend Mobile: Issue #15-18 (Restaurants, Payment, Tracking)
- Backend: Issue #16, #19 (Payment webhook, FCM)

**Deliverables**:
- ✅ Restaurant Portal fully functional
- ✅ Mobile có payment & tracking

---

### Sprint 3 (Week 5-6): Polish & Deploy
**Goal**: Admin 100% + Integration + Testing

**Team assignments**:
- Frontend Admin: Issue #23-30 (Admin features)
- Backend: Issue #31-35 (Integration)
- QA: Issue #36-40 (Testing & Docs)

**Deliverables**:
- ✅ All features complete
- ✅ Testing done
- ✅ Production ready

---

## 🆘 Khi gặp vấn đề

### Q: Code không chạy?
**A**: 
```bash
# Clear cache
cd mobile
npx expo start -c

cd admin
rm -rf .next
npm run dev
```

### Q: Appwrite error "Permission denied"?
**A**: Check permissions trong Appwrite Console:
- Database → Collection → Settings → Permissions
- Thêm "Any" role với Create/Read/Update/Delete

### Q: Import error trong TypeScript?
**A**: 
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Q: Không hiểu issue?
**A**: 
1. Đọc "Documentation Reference" trong issue
2. Xem code examples trong `GITHUB_ISSUES.md`
3. Check similar code trong existing apps
4. Ask team trong Slack/Discord

### Q: Không biết bắt đầu từ đâu?
**A**: 
1. Đọc `docs/README.md` (5 min)
2. Chọn team: Backend / Mobile / Web
3. Pick issue phù hợp với skill level
4. Follow "Step 4" ở trên

---

## 🏆 Success Metrics

**Làm sao biết mình đang làm tốt?**

### Individual:
- [ ] Complete ít nhất 1 issue/tuần
- [ ] Code review pass (ít lỗi)
- [ ] Không bị block quá 1 ngày
- [ ] Hỏi khi cần (đừng ngồi stuck)

### Team:
- [ ] Sprint goal đạt >= 80%
- [ ] Velocity tăng dần qua sprints
- [ ] Ít bugs trong production
- [ ] Documentation up-to-date

---

## 🎓 Learning Resources

**Mới với React Native?**
- Tutorial: https://reactnative.dev/docs/tutorial
- Expo guide: https://docs.expo.dev/tutorial/introduction/
- Time: 2-3 ngày để comfortable

**Mới với Next.js?**
- Tutorial: https://nextjs.org/learn
- App Router: https://nextjs.org/docs/app
- Time: 1-2 ngày

**Mới với Appwrite?**
- Quickstart: https://appwrite.io/docs/quick-starts
- Database: https://appwrite.io/docs/databases
- Time: 4-6 giờ

**Mới với TypeScript?**
- Handbook: https://www.typescriptlang.org/docs/handbook/intro.html
- Time: Học dần trong quá trình code

---

## 🚀 Quick Commands Reference

### Mobile App:
```bash
cd mobile
npm install
npm start           # Start Expo
npm run android     # Run on Android
npm run ios         # Run on iOS
```

### Admin Dashboard:
```bash
cd admin
npm install
npm run dev         # Start Next.js dev server
npm run build       # Build for production
npm run start       # Start production server
```

### Restaurant Portal (sau khi tạo):
```bash
cd restaurant-portal
npm install
npm run dev
```

### Git:
```bash
git status
git add .
git commit -m "feat: #[issue] - Description"
git push origin [branch-name]
git checkout main
git pull origin main
```

---

## 📞 Contact & Support

**Team Lead**: [Tên của bạn]
**Repository**: https://github.com/phatle224/sgu_cnpm_foodfast
**Documentation**: [docs/README.md](./docs/README.md)

**Daily Standup**: 9:00 AM (15 min)
**Sprint Review**: Every 2 weeks
**Retrospective**: End of each sprint

---

## 🎯 Next Steps

**Bạn đã đọc xong file này?** Great! 

**Bước tiếp theo**:

1. ✅ Đọc `docs/README.md` (5 min)
2. ✅ Đọc `docs/DEVELOPMENT_ROADMAP.md` (10 min)
3. ✅ Setup môi trường (1-2h)
4. ✅ Đọc `docs/database/APPWRITE_SETUP_GUIDE.md` (15 min)
5. ✅ Bắt đầu Issue #1 hoặc #7

**Welcome to the team! Let's build FoodFast! 🚀**

---

**Last Updated**: October 17, 2025  
**Author**: FoodFast Development Team
