# 🚨 CSP COMPLIANCE CHECKLIST - MANDATORY BEFORE DEPLOYMENT 🚨

## ⚠️ NEVER USE THESE IN ANY CODE:
- ❌ `eval()`
- ❌ `new Function()`
- ❌ `setTimeout(string, ...)`
- ❌ `setInterval(string, ...)`
- ❌ `dangerouslySetInnerHTML` with scripts
- ❌ Inline `<script>` tags in JSX/TSX
- ❌ `window.eval`
- ❌ `Function()` constructor
- ❌ Any dynamic code execution

## ✅ ALWAYS CHECK BEFORE ADDING:
1. **Third-party libraries**: Test for CSP violations before installing
2. **Dynamic imports**: Use static imports when possible
3. **String templates**: Avoid in script contexts
4. **Debug code**: Remove all eval-based debugging before deployment
5. **Source maps**: Keep disabled in production

## 🔧 CSP CONFIGURATION:
- Headers configured in `vercel.json` and `middleware.ts`
- NO meta CSP tags in HTML
- NO inline scripts in layout.tsx
- Source maps disabled in next.config.ts

## 🧪 TESTING:
Before any deployment:
1. Build locally: `npm run build`
2. Test in production mode: `npm run start`
3. Check browser console for CSP violations
4. Verify no eval errors in deployment logs

## 📋 FILES TO MONITOR:
- `src/app/layout.tsx` - NO dangerouslySetInnerHTML scripts
- `next.config.ts` - devtool: false, no eval
- `vercel.json` - CSP headers only
- `middleware.ts` - CSP headers only

## 🚫 BANNED PATTERNS:
```javascript
// NEVER DO THIS:
eval('some code')
new Function('return something')
setTimeout('alert("bad")', 1000)
dangerouslySetInnerHTML={{ __html: '<script>...' }}
window.eval(code)

// DO THIS INSTEAD:
// Use proper React patterns, static imports, useEffect, etc.
```

## 🎯 REMEMBER:
**If you get CSP errors again, it means someone violated this checklist!**
**Check git history to find what was added and remove the violating code.**
