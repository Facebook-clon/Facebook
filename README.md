# مشاكل لاحظتها في المستند اللي بعتّه

1. **مفيش كود سيرفر (Backend) خالص في المستند.** القسم 4 فيه كود الموبايل بس (React Native)، وقسم 2 و5 بيتكلموا عن Express و Supabase لكن مفيش سطر كود واحد للسيرفر أو حتى SQL لإنشاء الجداول. ده أهم حاجة ناقصة، فعملتلك سيرفر كامل شغال (شايفه في الملفات).

2. **`storageService.js` بيستخدم `atob()`** — الدالة دي مش موجودة في React Native أصلاً (هي خاصة بالمتصفح). لازم تستخدم `Buffer.from(base64, 'base64')` بدلها، أو مكتبة `base64-arraybuffer`.

3. **`FeedScreen.js` فيه Race Condition في `handleLike`**: المتغير `previousPosts` بيتحدد جوه الـ callback بتاع `setPosts`، ولو الـ API call فشل قبل ما React ينفذ الـ callback، هيرجع `undefined` بدل البيانات القديمة. الأصح تاخد نسخة من `posts` قبل ما تستدعي `setPosts`.

4. **مفيش Endpoint لتسجيل الدخول/التسجيل** في المستند رغم ذكر Supabase Auth — السيرفر اللي عملته بيفترض إن تسجيل الدخول بيتم مباشرة عبر Supabase Auth من التطبيق نفسه، والتوكن ده اللي بيتبعت بعدين للسيرفر في الـ Authorization header.

5. **الرفع المباشر للصور من الموبايل لـ Supabase باستخدام anon key** يحتاج سياسات RLS دقيقة على الـ Storage bucket، غير موضحة في المستند — لازم تتظبط من لوحة تحكم Supabase.

---

# ملفات السيرفر اللي عملتها

```
server/
├── index.js                     # نقطة تشغيل السيرفر
├── package.json
├── .env.example                 # انسخه لـ .env وحط بياناتك
├── schema.sql                   # أوامر SQL لإنشاء الجداول (ناقصة في مستندك)
└── src/
    ├── supabaseClient.js
    ├── middleware/auth.js       # يتحقق من التوكن الجاي من التطبيق
    └── routes/
        ├── posts.js             # GET/POST /api/posts + like
        ├── comments.js          # GET/POST /api/posts/:id/comments
        └── notifications.js
```

## طريقة التشغيل محليًا

```bash
cd server
npm install
cp .env.example .env
# افتح .env وحط SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY من لوحة تحكم Supabase
npm start
```

السيرفر هيشتغل على `http://localhost:4000`.

## قبل التشغيل، لازم:

1. تنفذ محتوى `schema.sql` في SQL Editor بتاع Supabase مشروعك.
2. تعمل Storage Buckets باسم `avatars` و `post-images` وتخليهم Public.
3. تفعّل Email/Password (أو أي طريقة) في Supabase Auth.

## النشر على Render

1. ادفع الفولدر ده لمستودع GitHub.
2. من Render: New -> Web Service -> اربط المستودع.
3. Start Command: `npm start`.
4. ضيف Environment Variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NODE_ENV=production`.
