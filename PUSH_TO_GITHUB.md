# Инструкция по отправке проекта в репозиторий GitHub «rabota-tj»

Проект уже инициализирован как Git-репозиторий (`branch main`), все файлы зафиксированы в коммите.

---

### Вариант 1. Отправка через терминал (HTTPS)

1. Замените `<ВАШ_GITHUB_ЛОГИН>` на ваш логин на GitHub (например, `treydertj72`):
```bash
git remote add origin https://github.com/<ВАШ_GITHUB_ЛОГИН>/rabota-tj.git
```

2. Отправьте ветку `main` в репозиторий:
```bash
git push -u origin main
```

*(Если репозиторий на GitHub был создан с начальным файлом README.md или лицензией, используйте флаг перезаписи:* `git push -u origin main --force`*)*.

---

### Вариант 2. Отправка через SSH (если у вас настроен SSH-ключ на GitHub)

```bash
git remote add origin git@github.com:<ВАШ_GITHUB_ЛОГИН>/rabota-tj.git
git push -u origin main
```

---

### Что включено в коммит:
- Полный код фронтенда React 19 + TypeScript + Vite.
- Все 10 стран СНГ с регионами, городами и валютами.
- Сервер Express (`server.ts`) с защитой административных прав (`/api/admin/verify`, `/api/admin/action`).
- Полная схема базы данных для Supabase (`supabase_schema.sql`) с триггером защиты от самовольного назначения прав администратора.
- Мультиязычность (Русский, Тоҷикӣ, Қазақша).
- Файлы для SEO и рекламы (`robots.txt`, `sitemap.xml`, `ads.txt`).
