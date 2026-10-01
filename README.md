# Subtleflow Mockup Generator (Maket Generator)

> Interactive vector mockup studio for creating and exporting realistic social media scenes with iPhone mockups and floating aesthetic cards with dynamic 360° lighting and shadows.

[![Deploy to GitHub Pages](https://github.com/ch/maket-generator/actions/workflows/deploy.yml/badge.svg)](https://github.com/ch/maket-generator/actions/workflows/deploy.yml)
[![Vite](https://img.shields.io/badge/Vite-8.3.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

* [English Version](#-english-version)
* [Українська версія](#-українська-версія)

---

## 🇬🇧 English Version

### ✨ Features

- **Pure Vector SVG Engine**:
  - Crisp vector rendering of iPhones (with Dynamic Island, status bar, realistic aluminum frame) and social media cards.
  - Native SVG typography (`<text>`) with crisp rendering at any zoom level or screen scale.
  - High-precision vector UI icons (Heart, Comment, Share, Bookmark, Navigation).

- **360° Studio Lighting & Directional Drop Shadows**:
  - Interactive 360° Sun dial to position the studio light source anywhere around the scene.
  - Trigonometric calculation of shadow projection vectors ($dx$, $dy$).
  - Fine-tune distance, blur softness, and shadow opacity, or toggle shadows on/off.

- **Widget Inspector & 360° Rotation**:
  - Clicking any widget on canvas automatically opens its dedicated inspector tab.
  - Exact pixel dimension controls (Width px & Height px) with **100% Locked Aspect Ratio**.
  - Circular 360° rotation knob with degree input and quick step buttons (0°, -5°, +5°, 90°).
  - Canvas position coordinates (X px, Y px) with one-click centering buttons.

- **Interactive Heart (Like / Unlike)**:
  - Toggle like status directly by clicking the heart icon on any widget on the canvas.
  - Inspector controls: switch between ❤️ Liked (`#ED4956` fill) and 🤍 Unliked (minimal outline).
  - Supported across iPhones, Instagram Posts, Stories, and Square widgets.

- **Multiple Widget Types**:
  - 📱 **Smartphone (iPhone)** ($334 \times 686$ px): Realistic iPhone with Dynamic Island and customizable screen photo. Add multiple phones to compare light/dark themes or showcase different screens.
  - 📝 **Instagram Post** ($270 \times 396$ px): Classic post card with profile header, action reactions, and photo content.
  - 📱 **Stories 9:16** ($250 \times 444$ px): Vertical card with branded story gradient ring and reply input.
  - 💬 **Testimonial / Quote** ($280 \times 340$ px): 5 golden stars, quote styling, and editable testimonial text and author.
  - 🔲 **Square 1:1 Photo** ($280 \times 280$ px): Minimalist square card with author badge.

- **Dynamic Layer Management & Add/Delete**:
  - Dynamic layer ordering (Z-Index): Move to Front, Bring Forward, Send Backward, Send to Back.
  - Interactive visual stack list.
  - Add custom widgets with personalized names and widget types.
  - Delete widgets with single-click Undo support.

- **Undo / Redo History & Auto-Save**:
  - Step-by-step history with UI buttons and keyboard shortcuts: `Ctrl+Z` / `Cmd+Z` (Undo) and `Ctrl+Y` / `Ctrl+Shift+Z` (Redo).
  - Intelligent input focus detection (shortcuts won't interfere when typing in form inputs).
  - 60fps smooth manipulation during drags, with history snapshots committed on mouse release or 700ms debounce.
  - Automatic persistence to browser `localStorage` (`maket_generator_autosave_v2`) so work is never lost on refresh.

- **Canvas & Aspect Ratio Presets**:
  - Responsive canvas presets: 1:1 Square, 4:5 Portrait, 5:4 Landscape, 16:9 Widescreen, 9:16 Stories/Reels, 16:11 Studio Reference, and Custom px.
  - Instant 100% full-screen responsive auto-fit.
  - Background styling: solid colors, custom studio linear gradients, and radial gradients.

- **Preset System & JSON Import/Export**:
  - Save named custom presets locally in browser.
  - Clone and duplicate existing presets.
  - Export and import presets as lightweight `.json` files (configuration only, keeping files tiny).

- **Ultra High-Resolution Export**:
  - Vector `.svg` export (resolution-independent, perfect for Figma or Adobe Illustrator).
  - High-DPI `.png` and `.jpeg` rendering at 1x, 2x, and 4x UHD resolutions (up to $6400 \times 4400$ px).
  - One-click Copy Image to Clipboard.

- **100% Static & Serverless**:
  - Pure client-side application (zero backend, zero database, zero external dependencies required).
  - Ready to be served on GitHub Pages, Vercel, Cloudflare Pages, Netlify, or any static hosting/CDN.

---

### 🚀 Getting Started

```bash
# 1. Clone the repository
git clone git@github.com-ptitkov:ch/maket-generator.git
cd maket-generator

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build for production
npm run build
```

The compiled static assets will be in the `dist/` directory.

---

### 🌐 Deployment

Because this project is a 100% static Single Page Application (SPA), deployment is instant and free:

- **GitHub Pages (Automated via GitHub Actions)**:
  1. Open your repository on GitHub.
  2. Navigate to **Settings** ➔ **Pages**.
  3. Under **Build and deployment** ➔ **Source**, select **GitHub Actions**.
  4. Pushing to `main` will automatically build and publish your site!

- **Vercel**:
  1. Go to [vercel.com](https://vercel.com) and import the repository.
  2. Click **Deploy** (Vite settings are detected automatically).

- **Cloudflare Pages**:
  1. Go to Cloudflare Dashboard ➔ Workers & Pages ➔ Create Application ➔ Pages.
  2. Build command: `npm run build`, Output directory: `dist`.

- **Any Static Web Server (Nginx, Apache, Caddy, S3)**:
  - Copy the contents of the `dist/` folder to your web root (`public_html` or `/var/www/html`).

---

### 🛠️ Tech Stack

- **React 19**
- **TypeScript 7**
- **Vite 8**
- **Tailwind CSS v4**
- **Lucide React**

---
---

## 🇺🇦 Українська версія

### ✨ Можливості та функції

- **Чистий векторний SVG рушій (Pure Vector Engine)**:
  - Векторні телефони iPhone (з Dynamic Island, статус-баром iOS, алюмінієвою рамкою) та картки постів.
  - Нативна SVG типографіка (`<text>`) без втрати чіткості при будь-якому масштабуванні.
  - Чіткі векторні іконки Instagram UI (сердечко, коментар, поширити, закладка, навігація).

- **Студійне освітлення 360° та динамічні тіні**:
  - Інтерактивна кругла крутилка «Сонечко» ☀️ для розміщення джерела світла у будь-якій точці на 360°.
  - Точний тригонометричний розрахунок зміщення тіней ($dx$, $dy$).
  - Налаштування висоти відриву (відстані), радіуса розмиття (м'якості) та інтенсивності тіні, а також перемикач ВКЛ/ВИКЛ.

- **Інспектор віджетів та поворот 360°**:
  - Автоматичне відкриття меню віджета при кліку по ньому на полотні.
  - Введення точних розмірів у пікселях (Ширина px та Висота px) зі **100% збереженням пропорцій**.
  - Кругла крутилка повороту на 360° з полем введення градусів та кнопками швидкого кроку (0°, -5°, +5°, 90°).
  - Координати позиції на холсті (X px, Y px) з кнопками швидкого центрування.

- **Налаштування сердечка (Лайкнуто чи ні)**:
  - Перемикання лайка безпосередньо кліком по сердечку на будь-якому віджеті на сцені.
  - Керування в інспекторі: перемикання між ❤️ Лайкнуто (червона заливка `#ED4956`) та 🤍 Без лайка (контурний стиль).
  - Підтримується на телефонах, Instagram постах, Stories та квадратних віджетах.

- **Різноманітні типи віджетів**:
  - 📱 **Смартфон (iPhone)** ($334 \times 686$ px): Реалістичний мокап iPhone з Dynamic Island та власним фото екрану. Можливість додавати кілька телефонів на одну сцену (для світлої/темної теми тощо).
  - 📝 **Instagram Пост** ($270 \times 396$ px): Класична картка з шапкою профілю, реакціями та фотографією.
  - 📱 **Stories 9:16** ($250 \times 444$ px): Вертикальна сторіс-картка з фірмовим градієнтним обідком та полем для швидкої відповіді.
  - 💬 **Відгук / Цитата** ($280 \times 340$ px): 5 золотих зірок, лапки цитати, текст відгуку та автор (з можливістю швидкого редагування в панелі).
  - 🔲 **Квадратне фото 1:1** ($280 \times 280$ px): Мінімалістична квадратна фото-картка.

- **Керування шарами та додавання/видалення віджетів**:
  - Порядок накладання (Z-Index): На самий верх, Вище на 1 шар, Нижче на 1 шар, На самий низ.
  - Візуальний список поточної стопки шарів.
  - Модальне вікно створення віджетів з вибором назви та типу.
  - Видалення віджетів з можливістю скасування через Undo.

- **Історія змін (Undo / Redo) та Автозбереження**:
  - Кнопки скасування/повторення в шапці та гарячі клавіші: `Ctrl+Z` / `Cmd+Z` (Назад) та `Ctrl+Y` / `Ctrl+Shift+Z` (Вперед).
  - Розумне ігнорування гарячих клавіш при введенні тексту в полях `<input>` або `<textarea>`.
  - Плавні 60fps під час перетягування та фіксація кроку історії при відпусканні миші або через дебаунс (700 мс).
  - Автоматичне збереження в браузері (`localStorage`), завдяки чому при перезавантаженні сторінки всі налаштування та віджети відновлюються.

- **Налаштування холста та пропорцій**:
  - Пресети співвідношення сторін: 1:1, 4:5, 5:4, 16:9, 9:16, Еталон (16:11) та Власний розмір.
  - Автоматичне масштабування під 100% доступного простору екрану.
  - Налаштування фону: суцільні кольори, плавні студійні градієнти, довільний color picker.

- **Система пресетів та імпорт/експорт JSON**:
  - Збереження іменованих пресетів у браузері.
  - Клонування/дублювання налаштувань.
  - Експорт та імпорт пресетів у легкі `.json` файли.

- **Експорт надвисокої чіткості**:
  - Векторний `.svg` файл (без втрати якості, готовий для Figma чи Illustrator).
  - Растрові `.png` та `.jpeg` з роздільною здатністю 1x, 2x та 4x UHD (до $6400 \times 4400$ px).
  - Копіювання готового зображення в буфер обміну в 1 клік.

- **100% Статичний сайт без бекенду**:
  - Усі операції виконуються виключно у браузері клієнта.
  - Готовий до безкоштовного хостингу на GitHub Pages, Vercel, Cloudflare Pages тощо.

---

### 🚀 Запуск проєкту

```bash
# Встановлення залежностей
npm install

# Запуск dev сервера
npm run dev

# Збірка проекту для production
npm run build
```

Зібрані статичні файли розташовані у директорії `dist/`.

---

### 🛠️ Стек технологій

- **React 19**
- **TypeScript 7**
- **Vite 8**
- **Tailwind CSS v4**
- **Lucide React**
