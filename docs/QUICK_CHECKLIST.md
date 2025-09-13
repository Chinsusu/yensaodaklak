# ⚡ Quick Checklist - Yến Sào Đăk Lăk

## 🚨 Before Any Route Changes

```bash
# 1. Backup current worker
cp src/worker.ts src/worker.ts.backup-$(date +%H%M)

# 2. Check current route order
grep -n "app.get" src/worker.ts
```

## ✅ Route Order Must Be:
1. `/api/*` (APIs)
2. `/admin*` (Admin)  
3. `/product/:slug` (Products)
4. `/media/*` (Images)
5. **`*` (Wildcard) - ALWAYS LAST!**

## 🔧 After Route Changes

```bash
# 1. Check for duplicates
grep -n "app.get.*product\|app.get.*admin" src/worker.ts

# 2. Ensure wildcard is last
tail -10 src/worker.ts | grep -B 5 -A 5 "export default"

# 3. Test deployment
git add . && git commit -m "Route changes" && git push
```

## 🚀 Post-Deployment Tests

```bash
# Wait 3 minutes, then test:
curl -I "https://yensaodaklak.vn/product/yen-chung-hu-70ml"  # Should be 200
curl -I "https://yensaodaklak.vn/admin/"                      # Should be 200
curl -I "https://yensaodaklak.vn/media/products/test.webp"    # Should be 200 or 404
```

## 🆘 If Something Breaks

```bash
# 1. Restore backup
cp src/worker.ts.backup-HHMM src/worker.ts

# 2. Emergency deploy
git add src/worker.ts && git commit -m "Emergency restore" && git push

# 3. Investigate in docs/DEBUGGING_GUIDE.md
```

## 📝 Safe Change Pattern

```bash
# Small changes only!
1. Backup
2. Edit 1 thing  
3. Test
4. Commit
5. Repeat
```

---
**Remember: Wildcard route `app.get("*")` ALWAYS goes last!**
