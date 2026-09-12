# تطبيق الموبايل — نسخة من فيسبوك

## الأخطاء اللي اتصلحت هنا

1. **`atob()`** كانت مستخدمة في `storageService.js` لرفع الصور، ودي مش شغالة في React Native. اتبدلت بمكتبة `base64-arraybuffer`.
2. **Race condition** في `FeedScreen.js` (`handleLike`) — دلوقتي بناخد نسخة من البيانات القديمة قبل أي تعديل.
3. **مفيش شاشة تسجيل دخول** كانت موجودة أصلاً — ضفت `AuthScreen.js` كاملة (تسجيل / دخول عبر Supabase Auth).
4. **الرابط (`API_URL`)** في `api.js` بقى يشاور على سيرفرك الفعلي:
   `https://facebook-production-f363.up.railway.app/api`

## خطوة لازم تعملها بنفسك قبل التشغيل

في ملف `app.json`، غيّر السطر:
```
"SUPABASE_ANON_KEY": "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE"
```
لمفتاح الـ **Publishable key** (اللي شكله `sb_publis...`) من نفس صفحة API Keys في Supabase — **مش** الـ secret key.

---

## طريقة التشغيل من الموبايل (من غير كمبيوتر)

بما إنك شغال بالكامل من التليفون، أسهل طريقة هي **Expo Snack**:

1. حمّل تطبيق **Expo Go** من Google Play.
2. افتح المتصفح وروح على: **snack.expo.dev**
3. سجّل دخول بحساب Expo (أو اعمل واحد سريع بالإيميل).
4. من قائمة الملفات في Snack، امسح الملفات الافتراضية واعمل نفس هيكل الملفات اللي عندك هنا:
   - `App.js`
   - `src/api/api.js`
   - `src/services/storageService.js`
   - `src/screens/AuthScreen.js`
   - `src/screens/FeedScreen.js`
   - `src/screens/CommentsScreen.js`
   - `src/screens/CreatePostScreen.js`
5. من إعدادات الـ Snack (أيقونة الترس)، ضيف الـ Dependencies المذكورة في `package.json`.
6. هيظهرلك QR Code — افتح تطبيق **Expo Go** في موبايلك وامسحه، والتطبيق هيشتغل مباشرة على جهازك.

## لو عايز تطبيق حقيقي (APK) تقدر تنزّله وتوزّعه

ده محتاج خطوة إضافية اسمها **EAS Build**، وممكن تتم من نفس موقع expo.dev من غير كمبيوتر (بس محتاجة شوية إعداد إضافي). قولّي لو عايز نوصل للمرحلة دي بعد ما تتأكد إن التطبيق شغال صح على Expo Go.
