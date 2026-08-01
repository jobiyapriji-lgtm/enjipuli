# ENJIPULI — Google Stitch Integration Reference

> **Keep this document.** It is the stable contract between the backend/frontend
> logic and the Stitch design output. When Stitch assets arrive, map against the
> IDs, class names, CSS variables, and endpoint shapes listed here.
> Do **not** rename the state variables or element IDs below without updating
> this file too.

---

## 1. Design tokens (CSS variables)

All colours, radii, and shadows are declared in
`src/app/globals.css` inside `:root { … }`.

To apply the Stitch palette, **only override this block**. No component code
changes are needed.

| Token | Current value (dark base) | Stitch will set |
|---|---|---|
| `--color-bg` | `#0f0e1a` | deep indigo/violet base |
| `--color-surface` | `#1a1828` | slightly lighter surface |
| `--color-surface-2` | `#231f35` | card/input background |
| `--color-border` | `#2e2a45` | subtle border |
| `--color-text-primary` | `#f0eeff` | near-white |
| `--color-text-muted` | `#8b88a8` | grey/lavender |
| `--color-text-inverse` | `#0f0e1a` | for text on accent buttons |
| `--color-accent` | `#f5a623` | lime / orange / gold / teal — TBD |
| `--color-accent-hover` | `#e09010` | accent hover state |
| `--color-success` | `#22c55e` | |
| `--color-warning` | `#f59e0b` | |
| `--color-error` | `#ef4444` | |

---

## 2. Screen type variants

Every page `<main>` carries one of two stable class names:

| Class | Pages | Stitch treatment |
|---|---|---|
| `.screen-branding` | Login, Order confirmation | Rich decoration, glow effects, brand colours |
| `.screen-task` | Menu, Checkout, Vendor queue | Task-focused, minimal decoration |

---

## 3. Logo wordmark (SVG) integration

Component: `src/components/LogoWordmark.tsx`

The component shows a **text fallback** (Noto Sans Malayalam) until the Stitch
SVG wordmark arrives. To swap in the SVG:

1. Place the file at `/public/logo-wordmark.svg`
2. Open `LogoWordmark.tsx`
3. Follow the 3-line swap described in the `STITCH_TODO` comment in that file

Props:
- `size` — controls width in pixels
- `light` — `true` for use on dark backgrounds (default)
- `className` — pass-through for Stitch overrides

---

## 4. Font loading

Two font families are loaded via Google Fonts in `globals.css`:
- **Inter** — Latin UI text (all buttons, labels, body)
- **Noto Sans Malayalam** — all `[lang="ml"]` elements

To add Baloo Chettan 2 as well (if Stitch uses it for the tagline):

```css
/* Add to the @import in globals.css */
@import url('https://fonts.googleapis.com/css2?family=Baloo+Chettan+2:wght@400;700&...');
```

Then update `[lang="ml"]` rule in `globals.css`:
```css
[lang="ml"] {
  font-family: 'Baloo Chettan 2', 'Noto Sans Malayalam', sans-serif;
}
```

No other file changes needed.

---

## 5. Stable element IDs (Stitch maps styles to these)

### Student home (`/` → `src/app/page.tsx`)

| Element ID | What it is |
|---|---|
| `student-home` | Root wrapper |
| `menu-page` | `<main>` (class: `screen-task`) |
| `menu-hero` | Heading section |
| `category-tabs` | `<nav>` with category buttons |
| `menu-grid` | CSS grid of MenuItem cards |
| `menu-item-{id}` | Each menu item `<article>` (has `data-sold-out` attribute) |
| `cart-bar` | Floating bottom bar (visible when cart > 0) |
| `cart-drawer-overlay` | Full-screen overlay when cart opens |
| `cart-drawer` | Slide-in cart panel |
| `cart-items` | Scrollable list of cart items |
| `cart-footer` | Total + checkout button area |
| `checkout-btn` | The "Pay with Razorpay" button |
| `checkout-error` | Error message in cart |

### Header (`src/components/Header.tsx`)

| Element ID | What it is |
|---|---|
| `header-root` | Sticky `<header>` |
| `header-logo` | LogoWordmark `<Link>` wrapper |
| `header-cart-btn` | Cart icon button |
| `header-cart-count` | Numeric badge on cart button |
| `header-user-actions` | Nav buttons area (right side) |

### Order confirmation (`/order/[id]` → `src/app/order/[id]/page.tsx`)

| Element ID | What it is |
|---|---|
| `order-confirmation-page` | Root wrapper |
| `order-ticket` | Token + QR card (class: `screen-branding`) |
| `order-token` | Token number display |
| `order-qr` | QR code `<img>` wrapper |
| `order-status-tracker` | Status step list |
| `order-status-badge` | Current status text (has `class="status-{STATUS}"`) |
| `order-receipt` | Itemised receipt section |

### Vendor queue (`/vendor/queue` → `src/app/vendor/queue/page.tsx`)

| Element ID | What it is |
|---|---|
| `vendor-queue-page` | Root wrapper |
| `vendor-header` | Sticky top nav bar |
| `kanban-board` | `<main>` Kanban grid |
| `kanban-col-paid` | "New / Paid" column |
| `kanban-col-preparing` | "Preparing" column |
| `kanban-col-ready` | "Ready" column |
| `kanban-col-delivered` | "Delivered today" column |
| `order-card-{id}` | Each order card in queue |

### Login pages

| Element ID | What it is |
|---|---|
| `student-login-page` | `<main>` (class: `screen-branding`) |
| `login-card` | Login form card |
| `login-logo` | LogoWordmark wrapper |
| `login-email` | Email `<input>` |
| `login-submit` | Submit button |
| `login-error` | Error `<div>` |
| `vendor-login-page` | `<main>` (class: `screen-branding`) |

---

## 6. Stable API contract (do not rename these)

| Endpoint | Method | Payload | Response |
|---|---|---|---|
| `/api/menu` | GET | — | `MenuItem[]` with `id`, `name`, `price`, `category`, `description`, `isSoldOut`, `netAvailable` |
| `/api/checkout` | POST | `{ items: [{menuItemId, quantity}] }` | `{ orderId, razorpayOrderId, amount, currency, key }` |
| `/api/payment/verify` | POST | `{ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }` | `{ success, orderId, token, status }` |
| `/api/orders/[id]` | GET | — | Full order with `token`, `qrSecret`, `status`, `items[]` |
| `/api/orders` | GET | `?mode=queue` for vendor | Array of orders |
| `/api/vendor/status` | POST | `{ orderId, status }` | Updated order |
| `/api/vendor/deliver` | POST | `{ orderId, qrSecret }` or `{ token }` | `{ success, alreadyDelivered, message, order }` |
| `/api/stock` | POST | `{ menuItemId, quantityAvailable, isActive? }` | `{ success }` |

---

## 7. Stable state variables (do not rename in page.tsx)

| Variable | Type | Page | Purpose |
|---|---|---|---|
| `cart` | `CartItem[]` | `page.tsx` | Cart contents |
| `setCart` | setter | `page.tsx` | Update cart |
| `handleCheckout` | `async fn` | `page.tsx` | Opens Razorpay + verifies payment |
| `selectedCategory` | `string` | `page.tsx` | Category filter |
| `menuItems` | `MenuItem[]` | `page.tsx` | Full menu from API |
| `orders` | `Order[]` | vendor pages | Queue data |
| `fetchQueue` | `async fn` | `vendor/queue/page.tsx` | Refetch queue |
| `advanceStatus` | `fn(id, status)` | `vendor/queue/page.tsx` | Advance kanban card |

---

## 8. Order status class names (for styling per-status)

Status badges on orders carry `class="status-{STATUS}"`:

```
status-PENDING_PAYMENT   status-PAID   status-PREPARING
status-READY   status-DELIVERED   status-EXPIRED   status-CANCELLED
```

---

## 9. Quick start (run locally)

```bash
# Install dependencies
npm install

# Push schema to SQLite dev db
npx prisma db push

# Seed sample menu items + vendor account
npx tsx prisma/seed.ts

# Start dev server
npm run dev
```

Vendor login: `vendor@enjipuli.com`  
Student login: any email (no domain restriction in dev)

Razorpay keys in `.env` — swap `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
for live keys to go from test to production.
