# GitHub Issues Quick Copy - FoodFast

> **Copy-paste these into GitHub Issues tab**  
> Format: Markdown ready for GitHub

---

## 🔴 PHASE 0: DATABASE FOUNDATION

Copy từng issue dưới đây vào GitHub:

---

### Issue #1

**Title**: `[DB] Create Critical Collections (restaurants, order_items, payments)`

**Labels**: `db`, `p0-critical`, `phase-0`

**Description**:
```markdown
## 🎯 Objective
Tạo 3 collections quan trọng nhất: restaurants, order_items, payments

## 📋 Acceptance Criteria
- [ ] Collection `restaurants` created với 15 attributes
- [ ] Collection `order_items` created với 7 attributes  
- [ ] Collection `payments` created với 9 attributes
- [ ] Indexes created cho tất cả
- [ ] Permissions configured
- [ ] Can create/read/update documents successfully

## 🔗 Dependencies
**Depends On**: None (Start immediately)  
**Blocks**: #2, #15, #16, ALL FEATURES

## 📚 Documentation
- Schema: `docs/database/DATABASE_SCHEMA.md` Sections 2.1, 2.3, 2.4
- Setup: `docs/database/APPWRITE_SETUP_GUIDE.md` Phase 1

## ⏱️ Estimated Time
4-6 hours

## ✅ Definition of Done
- [ ] Code implemented
- [ ] Tested in Appwrite Console
- [ ] Documentation updated
- [ ] Config files ready for update
```

**Assignees**: [Backend Team]

---

### Issue #2

**Title**: `[DB] Update Existing Collections (menu, orders)`

**Labels**: `db`, `p0-critical`, `phase-0`

**Description**:
```markdown
## 🎯 Objective
Update menu và orders collections để tương thích với restaurants

## 📋 Acceptance Criteria
- [ ] `menu`: Added restaurantId, isAvailable, stock
- [ ] `orders`: Added restaurantId, paymentStatus, paymentMethod, droneId
- [ ] Indexes updated
- [ ] Existing data migrated (if any)
- [ ] Test queries work

## 🔗 Dependencies
**Depends On**: #1  
**Blocks**: #11, #17

## 📚 Documentation
- Schema: `docs/database/DATABASE_SCHEMA.md` Sections 1.3, 1.6

## ⏱️ Estimated Time
2-3 hours
```

---

### Issue #3-6

*(Tương tự format, copy từ `docs/GITHUB_ISSUES.md` lines 170-350)*

---

## 🏗️ PHASE 1: RESTAURANT PORTAL

### Issue #7

**Title**: `[Portal] Setup Next.js Restaurant Portal Project`

**Labels**: `portal`, `p0-critical`, `phase-1`, `setup`

**Description**:
```markdown
## 🎯 Objective
Tạo Next.js project mới cho Restaurant Portal

## 📋 Acceptance Criteria
- [ ] Next.js 14 project created in `/restaurant-portal`
- [ ] TypeScript, TailwindCSS configured
- [ ] Appwrite SDK installed
- [ ] Basic layout created
- [ ] Can run `npm run dev`

## 🔗 Dependencies
**Depends On**: #6  
**Blocks**: #8-14

## 📚 Documentation
- Similar structure: `admin/` directory
- Requirements: `docs/PROJECT_REQUIREMENTS_vi.md` Section 4.3

## ⏱️ Estimated Time
6-8 hours

## 💡 Tech Stack
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Appwrite SDK
```

---

## 📋 Full Issues List

**Total**: 40 issues across 4 phases

### Phase 0 (6 issues):
- #1: Create Critical Collections (4-6h)
- #2: Update Existing Collections (2-3h)
- #3: Create High Priority Collections (3-4h)
- #4: Create Medium Priority Collections (3-4h)
- #5: Create Low Priority Collections (2-3h)
- #6: Update Appwrite Config (1-2h)

### Phase 1 (8 issues):
- #7: Setup Restaurant Portal (6-8h)
- #8: Authentication (8-10h)
- #9: Onboarding Flow (12-15h)
- #10: Menu Management (15-20h)
- #11: Order Dashboard (12-15h)
- #12: Profile Settings (8-10h)
- #13: Analytics Dashboard (10-12h)
- #14: Image Upload (6-8h)

### Phase 2 (8 issues):
- #15: Restaurant Selection (10-12h)
- #16: VNPay Payment (15-20h)
- #17: Order Tracking (15-18h)
- #18: Drone Visualization (12-15h)
- #19: Push Notifications (10-12h)
- #20: Review System (8-10h)
- #21: Voucher System (10-12h)
- #22: Fix Cart Bug (4-6h)

### Phase 3 (8 issues):
- #23: Restaurant Approval (10-12h)
- #24: Drone Management (12-15h)
- #25: Drone Simulation (12-15h)
- #26: Order Monitoring (8-10h)
- #27: Analytics (12-15h)
- #28: User Management (8-10h)
- #29: Audit Logs (6-8h)
- #30: Notifications Broadcast (8-10h)

### Phase 4 (10 issues):
- #31: VNPay Webhook (8-10h)
- #32: Order Automation (6-8h)
- #33: Email Notifications (8-10h)
- #34: Payment Refund (6-8h)
- #35: WebSocket (10-12h)
- #36: E2E Testing Customer (8-10h)
- #37: E2E Testing Restaurant (8-10h)
- #38: Performance Testing (6-8h)
- #39: API Documentation (6-8h)
- #40: User Guides (8-10h)

**Total Estimated**: 350-450 hours (6-8 weeks with team of 5-6)

---

## 🏷️ Labels to Create

Create these labels in GitHub:

### By Phase:
- `phase-0` - Database Foundation (Blue)
- `phase-1` - Restaurant Portal (Green)
- `phase-2` - Mobile Enhancement (Purple)
- `phase-3` - Admin Enhancement (Orange)
- `phase-4` - Integration (Red)

### By Priority:
- `p0-critical` - Must have, blocking (Red)
- `p1-high` - Should have (Orange)
- `p2-medium` - Nice to have (Yellow)
- `p3-low` - Future (Gray)

### By Component:
- `db` - Database/Appwrite (Blue)
- `mobile` - React Native (Purple)
- `portal` - Restaurant Portal (Green)
- `admin` - Admin Dashboard (Orange)
- `backend` - API/Functions (Red)

### By Type:
- `enhancement` - New feature (Green)
- `bug` - Bug fix (Red)
- `documentation` - Documentation (Blue)
- `setup` - Project setup (Gray)
- `testing` - Testing (Yellow)

---

## 🎯 Milestones to Create

### Milestone 1: Database Ready
- **Due**: Week 1 (Oct 24, 2025)
- **Issues**: #1-6
- **Description**: All 16 collections created, config updated

### Milestone 2: Restaurant Portal Live
- **Due**: Week 3 (Nov 7, 2025)
- **Issues**: #7-14
- **Description**: Portal deployed, restaurants can manage menu

### Milestone 3: Mobile App v2.0
- **Due**: Week 4 (Nov 14, 2025)
- **Issues**: #15-22
- **Description**: Payment, tracking, notifications working

### Milestone 4: Admin Enhanced
- **Due**: Week 5 (Nov 21, 2025)
- **Issues**: #23-30
- **Description**: Full admin features, drone management

### Milestone 5: Production Ready
- **Due**: Week 6 (Nov 28, 2025)
- **Issues**: #31-40
- **Description**: All testing done, docs complete

---

## 📊 GitHub Projects Setup

### Board Columns:
1. **📋 Backlog** - All issues not started
2. **🎯 To Do** - Sprint backlog (this week)
3. **🔨 In Progress** - Currently working
4. **👀 Review** - PR submitted, waiting review
5. **✅ Done** - Merged, completed

### Automation Rules:
- Issue opened → Backlog
- Issue assigned → To Do
- PR created → Review
- PR merged → Done

---

## 🔄 Workflow

### Create Issue:
1. Go to GitHub Issues tab
2. Click "New Issue"
3. Copy template from above
4. Fill in details
5. Add labels, milestone, assignee
6. Submit

### Work on Issue:
```bash
git checkout -b feature/[issue-number]-description
# Code...
git commit -m "feat: #[issue] - Description"
git push origin feature/[issue-number]-description
# Create PR, reference issue #[number]
```

### Close Issue:
- PR merged → Issue auto-closes (if "Closes #[number]" in PR)
- Or manually close với comment "Completed in PR #[pr-number]"

---

## 📋 Issue Template (Generic)

```markdown
## 🎯 Objective
[Brief description]

## 📋 Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## 🔗 Dependencies
**Depends On**: #[issue]  
**Blocks**: #[issue]

## 📚 Documentation
- [Link to docs]

## ⏱️ Estimated Time
X-Y hours

## 💡 Implementation Notes
[Code snippets, technical details]

## 🧪 Testing Checklist
- [ ] Unit tests pass
- [ ] Manual testing done
- [ ] Tested on multiple devices/browsers

## ✅ Definition of Done
- [ ] Code implemented
- [ ] Tests written
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Merged to main
```

