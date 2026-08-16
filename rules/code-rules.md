# Shared Inventory — Code Rules (за код ревю)

Vanilla JS PWA + Firebase/Firestore (жив прод). Кратък правилник — дълбочината е в ralph
structure reference-а.

1. **firebaseConfig не се пипа; нови Firestore колекции/докове = само с изрично решение** —
   иначе блокер. Приложението е в продукция, играе се на живо.
2. **Тест никога не докосва реален Firestore** — само моковете (vitest alias) = иначе блокер.
3. **Фича логика = модул** (`modules/<име>.js`); app.js е фасада — нов export минава през нея.
4. **Echo guard патърнът е задължителен** за нови snapshot listeners (saving флаг, който
   игнорира входящи snapshots при in-flight write) — липсата му = важно (губени данни).
5. **HTML инжекция**: потребителски низ в innerHTML само през esc() = иначе блокер.
6. **CDN imports остават** (без bundler, без npm firebase пакет).
7. Променено поведение без обновени unit спекове = важно; e2e fixtures не се пипат.
