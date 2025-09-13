# 📚 Documentation - Yến Sào Đăk Lăk

## 📋 Files in this directory:

### 🐛 [DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md)
Comprehensive troubleshooting guide covering:
- Route ordering issues (404 errors)
- Image URL problems 
- Cloudflare cache issues
- Build/syntax errors
- Homepage click problems
- Deployment best practices

### ⚡ [QUICK_CHECKLIST.md](./QUICK_CHECKLIST.md)  
Fast reference checklist for:
- Pre-deployment checks
- Route order verification
- Post-deployment testing
- Emergency recovery steps

## 🚨 Most Common Issue: Route Ordering

**The #1 cause of 404 errors is wildcard route placement!**

```typescript
// ❌ WRONG - Wildcard catches everything first
app.get("*", ...)
app.get("/product/:slug", ...)  // Never reached!

// ✅ CORRECT - Specific routes first
app.get("/product/:slug", ...)
app.get("*", ...)  // Wildcard LAST
```

## 🔧 Quick Fix Commands

```bash
# Check route order
grep -n "app.get" src/worker.ts

# Backup before changes  
cp src/worker.ts src/worker.ts.backup-$(date +%H%M)

# Emergency restore
cp src/worker.ts.backup-HHMM src/worker.ts
```

## 📞 Support

For issues not covered in these docs:
1. Check git history for working versions
2. Restore from backup
3. Make small incremental changes
4. Test thoroughly before major deployments

---
*Keep this documentation updated as the project evolves!*
