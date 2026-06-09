# promotion-site

Сайт-визитка Alex Shivers.

## Локальный запуск

Откройте `index.html` в браузере или поднимите простой сервер:

```bash
npx serve .
```

## GitHub Pages

1. Создайте **публичный** репозиторий и залейте файлы.
2. **Settings → Pages → Build and deployment → Branch:** `main`, папка `/ (root)`.
3. Сайт будет по адресу: `https://<username>.github.io/<repo>/`

### После публикации

В `index.html` замените относительный `og:image` на полный URL, например:

`https://<username>.github.io/<repo>/assets/og-cover.svg`

Для Telegram лучше сделать PNG 1200×630 и указать его в `og:image`.

## Настройка под себя

| Что | Где |
|-----|-----|
| Ник Telegram | `data-telegram` на кнопке формы, ссылки `t.me/...` |
| Gmail | ссылка в блоке «Контакты» |
| Работы / кейсы | секция `#works` в `index.html` |
| JSON-LD / GitHub | блок `<script type="application/ld+json">` в `<head>` |

## Структура

- `index.html` — разметка
- `styles.css` — стили
- `app.js` — меню, выбор услуги, форма, snap на десктопе
- `assets/fonts/` — локальные шрифты Manrope и Syne
