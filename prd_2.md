**FreshCart — Product Requirements Document**

**Project type:** Single Page Application (SPA) teaching project for the Integration course
**Tech stack:** Python, Django, Django REST Framework, SQLite 3, React, JavaScript, Vite
**Version:** 1.0
**Status:** Ready to build

---

**1. What We Are Building**

FreshCart is an online grocery store. A customer can browse grocery products, search them, filter them by category and rating, sort them by price, open one product, put products in a cart, choose a delivery time, and place an order. A vendor can add their own products, edit them, delete them, see the orders that contain their products, and see a small dashboard of their sales.

The app has two halves that run at the same time on one laptop:

| Half | What it is | Port |
| --- | --- | --- |
| backend | Django + Django REST Framework, data kept in SQLite 3 | 8000 |
| frontend | React app served by Vite | 3000 |

This project exists so an instructor can teach the seven Integration sessions on it, in order, from the first session to the last. Every screen in the app is there because one session needs it. Nothing extra is in the app.

**Why a grocery store.** The course's reference project is a shop that sells products. FreshCart is also a shop, so every step the instructor teaches carries over word for word. Only the words on the screen change: the members-only products are called Deals of the Day, the seller is called a vendor, and every product carries a pack size such as 1 kg or 500 g.

---

**2. Who Uses It**

| User | What they can do |
| --- | --- |
| Visitor (not logged in) | Browse products, search, filter, sort, open a product. Cannot see the Deals of the Day. Cannot use a cart. |
| Customer (logged in) | Everything a visitor can do, plus Deals of the Day, cart, checkout with a delivery time, and their own order list. |
| Vendor (logged in) | Everything a customer can do, plus add, edit and delete their own products, move their order rows forward, and see their dashboard. |

There is one important rule. **The server decides what a person may see, not React.** Hiding a button in React is a courtesy. The lock is always in the Django view.

---

**3. Technology We Use**

Backend packages, in `backend/requirements.txt`:

```text
Django
djangorestframework
django-filter
djangorestframework-simplejwt
django-cors-headers
```

Frontend packages, in `frontend/package.json`:

| Package | Version | Why we need it |
| --- | --- | --- |
| react | 19.0.0 | the UI |
| react-dom | 19.0.0 | draws React into the page |
| react-router | 7.4.0 | moves between screens without a page reload |
| js-cookie | 3.0.5 | saves the two tokens in cookies |
| react-icons | 5.5.0 | small icons |
| react-spinners | 0.15.0 | the loading spinner |
| vite | 6.2.0 | runs and builds the frontend |

`frontend/vite.config.js` must set the port, or the whole course breaks:

```js
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  build: {
    outDir: 'build',
  },
  plugins: [react()],
})
```

**The port rule for the whole project: backend on 8000, frontend on 3000.** Always start the backend with `python3 manage.py runserver 8000`. Two servers cannot share one port, and the session on CORS depends on these two numbers being different.

---

**4. Folder Structure**

```text
FreshCart/
├─ backend/
│  ├─ manage.py
│  ├─ requirements.txt
│  ├─ db.sqlite3
│  ├─ freshcart/             the Django project settings
│  │  ├─ settings.py
│  │  ├─ urls.py
│  │  ├─ asgi.py
│  │  └─ wsgi.py
│  ├─ users/                 register, login, logout
│  ├─ products/              the grocery catalogue
│  ├─ cart/                  the cart
│  ├─ orders/                checkout and orders
│  └─ vendor/                vendor product list, vendor orders, dashboard
└─ frontend/
   ├─ index.html
   ├─ package.json
   ├─ vite.config.js
   ├─ .env                   never committed
   ├─ .gitignore             must contain .env
   ├─ public/
   │  └─ mock/products.json  starter data, deleted in Session 1
   └─ src/
      ├─ main.jsx
      ├─ App.jsx
      ├─ api.js              the one place that talks to the server
      ├─ format.js           money and date helpers
      ├─ index.css
      ├─ App.css
      ├─ context/
      │  ├─ CartContext.js
      │  └─ UserContext.js
      └─ components/
         ├─ Home/
         ├─ Header/
         ├─ LoginForm/
         ├─ RegisterForm/
         ├─ ProtectedRoute/
         ├─ Products/
         ├─ AllProductsSection/
         ├─ DealsSection/
         ├─ FiltersGroup/
         ├─ ProductsHeader/
         ├─ ProductCard/
         ├─ ProductItemDetails/
         ├─ SimilarProductItem/
         ├─ Cart/
         ├─ CartListView/
         ├─ CartItem/
         ├─ CartSummary/
         ├─ EmptyCartView/
         ├─ Checkout/
         ├─ MyOrders/
         ├─ OrderDetails/
         ├─ VendorLayout/
         ├─ VendorDashboard/
         ├─ MyProducts/
         ├─ ProductForm/
         ├─ VendorProductsBar/
         ├─ VendorOrders/
         ├─ Profile/
         └─ NotFound/
```

Every component folder holds two files: `index.jsx` and `index.css`.

---

**5. How to Set Up and Run**

Open two terminals. One is for the backend, one is for the frontend. Leave both running.

Terminal 1, the backend, on Mac and Linux:

```bash
cd backend
python3 -m venv env
source env/bin/activate
pip3 install -r requirements.txt
python3 manage.py migrate
python3 manage.py seed_products
python3 manage.py runserver 8000
```

Terminal 1, the backend, on Windows:

```bash
cd backend
python -m venv env
env\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_products
python manage.py runserver 8000
```

Terminal 2, the frontend:

```bash
cd frontend
npm install
npm run dev
```

Then create `frontend/.env` with one line:

```text
VITE_API_BASE_URL=http://localhost:8000
```

Two rules about this file. Only names that start with `VITE_` reach the app, and the app reads them as `import.meta.env.VITE_API_BASE_URL`. The file is read once when the server starts, so **restart Vite after you change it**. Also add `.env` to `.gitignore` so it is never committed.

Checkpoint: the React app opens at `http://localhost:3000` and Django answers at `http://localhost:8000`.

---

**6. Demo Accounts**

The seed command creates these two accounts. The passwords are the same on purpose, so nobody loses time in class.

| Username | Password | Type | What it is for |
| --- | --- | --- | --- |
| Priya | secret123 | vendor | owns all 54 seeded products, used for every vendor screen |
| Arjun | secret123 | customer | a plain buyer, used to show what a vendor screen refuses |

Two usernames are already taken, `Priya` and `Arjun`. The registration session needs that: a fresh name proves the happy path and a taken name proves the error path.

---

**7. Seed Data**

The seed command is `python3 manage.py seed_products`. It creates the two accounts and 54 grocery products, all owned by Priya.

| Category | How many products |
| --- | --- |
| Fruits & Vegetables | 15 |
| Dairy & Bakery | 14 |
| Snacks & Packaged Food | 13 |
| Beverages | 12 |
| Household Care | 0 |
| **Total** | **54** |

**Household Care is empty on purpose.** When a student clicks it and sees nothing, that is the data talking, not a broken filter. The instructor uses this to prove the difference between a wrong answer and an empty answer.

Six of the 54 products are Deals of the Day. Their ids are **9, 11, 18, 20, 42 and 50**, and they are spread across the four categories that have products.

Field values the seed uses:

| Field | What the seed puts in it |
| --- | --- |
| title | a real grocery name, such as Tomatoes or Toned Milk |
| brand | a real-sounding brand, some repeated so a brand search returns more than one product |
| unit | the pack size as text, such as `1 kg`, `500 g`, `1 L`, `6 pcs` |
| price | a number between 15 and 899 |
| mrp | the price before the discount, always the same as or higher than `price` |
| imageUrl | `https://picsum.photos/seed/item<id>/300/300` |
| rating | a number between 3.0 and 5.0 |
| total_reviews | a number between 20 and 900 |
| category | one of the four categories that have products |
| availability | `In Stock`, or `Out of Stock` on four products |
| description | two or three sentences |
| is_deal | true on the six ids above, false on the rest |
| vendor | Priya |

The command also accepts `python3 manage.py seed_products --with-orders`. That adds six finished orders spread over the last seven days, in different states, so the vendor dashboard and the seven-bar chart have something to draw on day one. Without the flag the dashboard shows zeros until somebody checks out, which is also correct.

The command must be safe to run twice. Run it again and it clears the seeded rows first, then writes them fresh.

---

**8. Database Tables**

**users — the User table**

We use a custom user model, set in settings as `AUTH_USER_MODEL`. It is Django's own user with one extra column.

| Field | Type | Notes |
| --- | --- | --- |
| id | number, automatic | |
| username | text, unique | the name used to log in |
| email | text | optional, Django stores an empty text if it is missing |
| password | text | Django hashes it, we never write hashing code |
| user_type | text | either `customer` or `vendor`, default `customer` |

**products — the Product table**

| Field | Type | Notes |
| --- | --- | --- |
| id | number, automatic | |
| title | text, up to 255 | needed |
| brand | text, up to 255 | needed |
| unit | text, up to 50 | the pack size, such as `1 kg`, shown next to the title |
| category | text, up to 100 | Fruits & Vegetables, Dairy & Bakery, Snacks & Packaged Food, Beverages, Household Care |
| price | decimal, 10 digits, 2 decimals | what the customer pays |
| mrp | decimal, 10 digits, 2 decimals | the price before the discount, shown with a line through it |
| imageUrl | web address | **spelled in camelCase on purpose, see section 13** |
| rating | float | default 0.0 |
| total_reviews | number | default 0 |
| description | long text | can be empty |
| availability | text, up to 50 | `In Stock` or `Out of Stock`, default `In Stock` |
| is_deal | true or false | default false, this is the members-only flag |
| vendor | link to User | the owner, deleting the user deletes the products |

`mrp` is only there to be shown on the card. Nothing on the server works anything out from it.

**cart — the Cart and CartItem tables**

| Table | Field | Type | Notes |
| --- | --- | --- | --- |
| Cart | user | one-to-one link to User | one cart per person |
| Cart | created_at | date and time | set when it is made |
| CartItem | cart | link to Cart | |
| CartItem | product | link to Product | |
| CartItem | quantity | positive number | default 1 |

Cart also answers two worked-out values: `total_items` adds up the quantities, and `total_price` adds up each row's `subtotal`. A CartItem's `subtotal` is its product price times its quantity.

**orders — the Order, OrderItem and Address tables**

| Table | Field | Type | Notes |
| --- | --- | --- | --- |
| Order | user | link to User | who bought |
| Order | placed_at | date and time | set when it is made |
| Order | status | text | `placed`, `shipped`, `delivered`, `cancelled`, default `placed` |
| Order | payment_method | text | `COD` or `CARD`, default `COD` |
| Order | delivery_slot | text | `MORNING`, `AFTERNOON` or `EVENING`, default `MORNING` |
| Order | is_paid | true or false | true straight away for CARD, true on delivery for COD |
| Order | total | decimal | the amount actually charged, saved not worked out later |
| Order | shipping | decimal | 0.00 in this project |
| OrderItem | order | link to Order | |
| OrderItem | product | link to Product, may be empty | emptied, not deleted, if the product is removed later |
| OrderItem | vendor | link to User, may be empty | every dashboard number is counted off this column |
| OrderItem | title, brand, unit, image_url, price | copies of the product's values | copied at checkout time |
| OrderItem | quantity | positive number | |
| OrderItem | status | text | same four words as Order, default `placed` |
| Address | order | one-to-one link to Order | one order, one address |
| Address | full_name, phone, address, city, state, pincode | text | the six boxes on the checkout form |

`delivery_slot` is a saved word, exactly like `payment_method`. Nothing in the project schedules anything from it. The three choices shown on the screen are Morning 7 to 10, Afternoon 12 to 3, and Evening 5 to 8.

Two rules here matter more than they look.

**Copy the price onto the order item.** If the order item only linked to the product, then changing a product's price next week would quietly rewrite an order somebody already paid for. In a grocery store prices move often, so this rule earns its keep fast.

**When a product is deleted, the order item keeps its copied title, brand, unit, picture and price.** A product can leave the shop. It must not disappear from a purchase that already happened.

Order also answers three worked-out values: `item_count` adds up the quantities, `can_cancel` is true only while the status is still `placed`, and `thumbnail` is the picture of the first item.

Order has one more job, a method that reads its items and sets its own status from them. An order can hold products from more than one vendor, so the order moves at the pace of the slowest item. If every live item is `delivered` the order is `delivered` and `is_paid` becomes true. If every live item is `shipped` or `delivered` the order is `shipped`. If every item was cancelled the order is `cancelled`. Otherwise the order stays `placed`.

---

**9. API Endpoints**

Every path below starts with the base URL, which is `http://localhost:8000` while we build.

**The full list**

| # | Method | Path | Token needed | What it does |
| --- | --- | --- | --- | --- |
| 1 | POST | /api/users/register/ | no | makes an account |
| 2 | POST | /api/users/login/ | no | returns two tokens |
| 3 | POST | /api/users/logout/ | yes | blacklists the refresh token |
| 4 | GET | /api/products/ | no | the product list, with filters, search, sort and pages |
| 5 | GET | /api/products/?is_deal=true | yes | the Deals of the Day |
| 6 | POST | /api/products/ | yes | adds a product |
| 7 | GET | /api/products/&lt;id&gt;/ | no | one product |
| 8 | PATCH | /api/products/&lt;id&gt;/ | yes | changes a product you own |
| 9 | DELETE | /api/products/&lt;id&gt;/ | yes | deletes a product you own |
| 10 | GET | /api/cart/ | yes | the whole cart |
| 11 | POST | /api/cart/add/ | yes | puts a product in the cart |
| 12 | PATCH | /api/cart/items/&lt;id&gt;/ | yes | sets a row's quantity |
| 13 | DELETE | /api/cart/items/&lt;id&gt;/ | yes | takes a row out |
| 14 | GET | /api/orders/ | yes | your orders, newest first |
| 15 | POST | /api/orders/ | yes | turns the cart into an order |
| 16 | GET | /api/orders/&lt;id&gt;/ | yes | one order |
| 17 | POST | /api/orders/&lt;id&gt;/cancel/ | yes | calls off an order that is still `placed` |
| 18 | GET | /api/vendor/products/ | yes | only your own products, paged and searchable |
| 19 | GET | /api/vendor/orders/ | yes | only your own rows inside other people's orders |
| 20 | PATCH | /api/vendor/orders/items/&lt;id&gt;/ | yes | moves one of your rows forward |
| 21 | GET | /api/vendor/summary/ | yes | every number on the dashboard |

**1. POST /api/users/register/**

Send:

```json
{"username": "nikhil", "email": "nikhil@example.com",
 "password": "secret123", "user_type": "customer"}
```

Get back, 201 Created:

```json
{"message": "Account created!"}
```

There is no token in that answer. **Making an account does not log you in.** The next step is to send the person to the login screen.

When it fails it answers 400 with the field name as the key:

```json
{"username": ["A user with that username already exists."]}
```

**2. POST /api/users/login/**

Send `{"username": "Priya", "password": "secret123"}`. Get back 200:

```json
{"refresh": "eyJhbGciOiJIUzI1NiIs…", "access": "eyJhbGciOiJIUzI1NiIs…"}
```

Wrong password answers 401:

```json
{"detail": "No active account found with the given credentials"}
```

**3. POST /api/users/logout/**

Send `{"refresh": "<the refresh token>"}`. Get back 205 and an empty body. The refresh token is now blacklisted, so the session is over on the server too.

**4. GET /api/products/**

Query names it understands, and nothing else:

| Name | Example | What it does |
| --- | --- | --- |
| page | page=2 | which page |
| page_size | page_size=6 | how many on the page, most 100 |
| category | category=Beverages | exact match on the category word |
| brand | brand=Amul | exact match on the brand |
| search | search=milk | looks in the title and the brand |
| ordering | ordering=-price | sort, a leading `-` means biggest first |
| rating | rating=4 | 4 and up, not exactly 4 |
| is_deal | is_deal=true | the Deals of the Day, needs a token |

The answer is always wrapped, never a plain list:

```json
{
  "count": 54,
  "total_pages": 11,
  "next": "http://localhost:8000/api/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 9,
      "title": "Toned Milk",
      "brand": "Amul",
      "unit": "1 L",
      "category": "Dairy & Bakery",
      "price": "54.00",
      "mrp": "62.00",
      "imageUrl": "https://picsum.photos/seed/item9/300/300",
      "rating": 4.5,
      "total_reviews": 618,
      "description": "…",
      "availability": "In Stock",
      "is_deal": true
    }
  ]
}
```

Who sees what:

| Who is asking | What comes back |
| --- | --- |
| no token | the 48 products that are not deals |
| a good token | all 54 products |
| no token, and `is_deal=true` was asked for | 401, not an empty list |

**5. POST /api/products/**

Send:

```json
{"title": "Basmati Rice", "brand": "India Gate", "unit": "5 kg",
 "category": "Snacks & Packaged Food", "price": 649, "mrp": 799,
 "imageUrl": "https://…", "availability": "In Stock",
 "description": "…", "is_deal": false}
```

Get back 201 and the whole saved product, including its new `id`.

**Never send the vendor.** The server takes the owner from the token. If React sent it, anybody could add a product in somebody else's name.

**7, 8, 9. One product by id**

`GET` fills the edit form with every field. `PATCH` takes only the fields that changed and leaves the rest exactly as they were, then answers with the updated product. `DELETE` answers **204 with no body at all** — do not try to read an answer, there is none, and the 204 is the only proof it worked.

A vendor may only change or delete a product they own. Somebody else's product answers 403.

**10. GET /api/cart/**

```json
{
  "id": 1,
  "user": 1,
  "created_at": "2026-06-27T08:04:42.305490Z",
  "items": [
    {
      "id": 4,
      "product": 8,
      "product_title": "Tomatoes",
      "product_brand": "Farm Fresh",
      "product_unit": "1 kg",
      "product_price": "38.00",
      "product_image_url": "https://…",
      "quantity": 4
    }
  ],
  "total_items": 4,
  "total_price": "152.00"
}
```

Three things to read carefully here.

**The rows are inside `items`.** The answer is a cart, not a list of rows.

**Every row carries two ids.** `"id": 4` is the row's id, and it is what PATCH and DELETE need. `"product": 8` is the product's id, and it is what POST /api/cart/add/ needs. They are different numbers for the same row.

**The price arrives as text, `"38.00"` with quotes.** That is on purpose, because a plain number would quietly round money. Turn it into a number once, when it enters React, or `'38.00' + 100` will give you `"38.00100"` instead of a sum.

Without a token this answers 401. There is no cart for a visitor.

**11, 12, 13. Changing the cart**

| What | Send | Get back |
| --- | --- | --- |
| POST /api/cart/add/ | `{"product": 8, "quantity": 2}` | 201 |
| PATCH /api/cart/items/4/ | `{"quantity": 5}` | 200 |
| DELETE /api/cart/items/4/ | nothing | 204 |

**PATCH sets the quantity, it does not add to it.** There is no "increase by one" endpoint. Send the number you want the row to end up with.

**15. POST /api/orders/**

Send only these three things:

```json
{
  "payment_method": "COD",
  "delivery_slot": "MORNING",
  "address": {"full_name": "Priya R", "phone": "9876543210",
              "address": "12 Park Street", "city": "Hyderabad",
              "state": "Telangana", "pincode": "500001"}
}
```

**Do not send the cart and do not send the total.** The server already has both, and a total sent by the browser can be edited by the browser.

Get back 201 and the whole order. On the way, the server reads the cart, copies each product's title, brand, unit, picture and price onto an order row, adds up the total, saves the address, and then empties the cart so the same products cannot be bought twice. Either all of that saves or none of it does.

An empty cart answers 400 with `{"detail": "Your cart is empty."}`.

**14, 16. Reading orders**

`GET /api/orders/` answers `{"count": …, "results": [ … ]}` with one entry per order, newest first. Each entry carries `id`, `placed_at`, `status`, `total`, `item_count`, `payment_method`, `delivery_slot`, `is_paid` and `thumbnail`.

`GET /api/orders/<id>/` answers one order with everything on it: `id`, `placed_at`, `status`, `payment_method`, `delivery_slot`, `is_paid`, `total`, `shipping`, `can_cancel`, `address` and `items`.

**A customer must only ever see their own orders.** Asking for somebody else's order id answers 404, not their order.

**17. POST /api/orders/&lt;id&gt;/cancel/**

Send nothing. If the order can still be cancelled it becomes `cancelled`, every item on it becomes `cancelled`, and the updated order comes back. If it cannot, it answers 400 with `{"detail": "This order can no longer be cancelled."}`.

`can_cancel` in the answer and this check are the same rule. The hidden button in React is a courtesy. This line is the lock.

**18. GET /api/vendor/products/**

Understands `page` and `search`. Answers `count`, `total_pages` and `results`, where each result carries `id`, `title`, `brand`, `unit`, `category`, `rating`, `price`, `availability` and `image_url`.

Note the name: this screen uses `image_url` with an underscore, while the shop screens use `imageUrl`. The serializer renames it on the way out. Section 13 explains why that difference is kept.

**Which products come back is decided from the token,** never from a query name the browser could change.

**19, 20. Vendor orders**

`GET /api/vendor/orders/` answers only the rows that belong to the caller. An order can hold two vendors' products, and a vendor never sees what the same customer bought from somebody else. Each row carries `id`, `product`, `title`, `brand`, `unit`, `image_url`, `price`, `quantity`, `subtotal`, `status` and `next_status`.

`next_status` is worked out on the server: a `placed` row may become `shipped`, a `shipped` row may become `delivered`, and anything else answers nothing. A row never goes backwards.

`PATCH /api/vendor/orders/items/<id>/` takes `{"status": "shipped"}`. After it saves, the order re-reads all of its items and sets its own status from them, so the customer's badge can never disagree with the rows behind it.

**21. GET /api/vendor/summary/**

One request fills the whole dashboard:

```json
{
  "revenue": "18450.00",
  "orders": 12,
  "units_sold": 96,
  "products": 54,
  "awaiting_shipment": 5,
  "last_7_days": [{"date": "2026-09-13", "revenue": "0.00"}],
  "by_status": {"placed": 5, "shipped": 3, "delivered": 20, "cancelled": 2},
  "top_products": [{"product": 9, "title": "Toned Milk", "units": 42,
                    "revenue": "2268.00"}]
}
```

Where each number comes from:

| On the screen | How the server works it out |
| --- | --- |
| revenue | price times quantity of your rows, cancelled ones left out |
| orders | how many different orders hold one of your products |
| units_sold | the quantities of your rows, added up |
| products | how many products you have listed |
| awaiting_shipment | your rows still sitting at `placed` |
| last_7_days | your row revenue grouped by day, **always seven entries, empty days included** |
| by_status | how many of your rows are placed, shipped, delivered, cancelled |
| top_products | your rows grouped by product, most units first |

**React adds nothing up.** The numbers arrive finished and the screen prints them. Always draw seven bars, including the empty days, or the chart will have gaps.

---

**10. Frontend Screens**

| Path | Screen | Who can open it |
| --- | --- | --- |
| / | Home | anyone |
| /login | Login | anyone, sent to / if already logged in |
| /register | Register | anyone |
| /products | Product list, with the deals strip on top | anyone |
| /products/:id | One product | anyone, deals need a token |
| /cart | Cart | logged in only |
| /checkout | Checkout | logged in only |
| /orders | My Orders | logged in only |
| /orders/:id | One order | logged in only |
| /vendor | Dashboard overview | logged in only |
| /vendor/products | My Products | logged in only |
| /vendor/products/new | Add Product | logged in only |
| /vendor/products/:id/edit | Edit Product | logged in only |
| /vendor/orders | Vendor Orders | logged in only |
| anything else | Not Found | anyone |

Every screen marked "logged in only" sits behind `ProtectedRoute`, which reads the token through `getAccessToken()` and sends the person to `/login` when there is none.

**What each screen shows**

| Screen | On the screen |
| --- | --- |
| Product list | the Deals of the Day strip on top, a filter panel on the left with categories, brands and a rating list, a search box, a sort dropdown, a grid of product cards each showing the pack size and both prices, and Previous and Next at the bottom |
| One product | the picture, title, brand, pack size, price with the old price struck through, rating, review count, availability, description, a quantity box, an ADD TO CART button, and a few similar products |
| Cart | one row per product with its picture, title, brand, pack size, price, a plus and a minus, and Remove, plus an order total and a Checkout button |
| Checkout | six address boxes, a payment choice of COD or CARD, a delivery time choice of Morning, Afternoon or Evening, what is in the cart, the total, and a Place Order button |
| One order | an "order placed" message, the items with their status, the delivery address, the delivery time, the payment details, and a Cancel button when `can_cancel` is true |
| My Orders | one card per order with the number, date, status word, picture, total, item count, and a View Details link |
| My Products | a search box, an Add Product button, one row per product with Edit and Delete, and page controls |
| Add and Edit Product | title, brand, pack size, category dropdown, price, old price, image web address, availability dropdown, description, deal yes or no, and Save |
| Vendor Orders | one row per item you sold, with the buyer's order number, the product, the quantity, the amount, the status, and a button that moves it to `next_status` |
| Dashboard | four number cards, a "still to pack" strip that links to Vendor Orders, a seven-bar chart of the last seven days, a top products panel, and an items-by-status panel |

Use the same four status words everywhere, coloured the same way on every screen: placed, shipped, delivered, cancelled.

---

**11. The Shared Frontend Files**

**src/api.js** — the only file in the app that knows where the server is. Every request goes through it.

```js
import Cookies from 'js-cookie'

export const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const apiUrl = path => `${BASE_URL}${path}`

const ACCESS_TOKEN_KEY = 'jwt_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export const getAccessToken = () => Cookies.get(ACCESS_TOKEN_KEY)

export const getRefreshToken = () => Cookies.get(REFRESH_TOKEN_KEY)

export const saveTokens = ({access, refresh}) => {
  Cookies.set(ACCESS_TOKEN_KEY, access, {expires: 30})
  Cookies.set(REFRESH_TOKEN_KEY, refresh, {expires: 30})
}

export const clearTokens = () => {
  Cookies.remove(ACCESS_TOKEN_KEY)
  Cookies.remove(REFRESH_TOKEN_KEY)
}

export const apiFetch = (path, options = {}) => {
  const token = getAccessToken()

  const headers = {'Content-Type': 'application/json', ...options.headers}

  if (token !== undefined) {
    headers.Authorization = `Bearer ${token}`
  }

  return fetch(apiUrl(path), {...options, headers})
}
```

`apiFetch` does three jobs: it adds the base URL so callers pass only `/api/products/`, it adds the JSON header, and it adds the token **only when there is one**. That last check matters. A visitor with no token would otherwise send the text `undefined` as their token, and a broken token is refused with 401 while a missing token is fine. Skip the check and the public product list breaks for everyone who is not logged in.

**src/format.js** — two small helpers, so money and dates look the same on every screen. One turns `"54.00"` into `₹54`, and one turns the long date text into something short like `19 Sep 2026`.

**src/context/UserContext.js** and **src/context/CartContext.js** — so the header can show the cart count and the logged-in name without every screen passing them down by hand.

**src/App.jsx** — holds the cart and the five cart functions: `formatCartItem`, `getCart`, `addCartItem`, `deleteCartItem` and `updateCartItemQuantity`. Every one of the last three does its work and then calls `getCart()` again, so the screen never has to guess what the server now holds.

---

**12. The Seven Sessions**

This is the teaching plan. Each session starts from the state the session before it finished in. The starter code for a session is the finished code of the one before, so nothing is ever thrown away.

**Session 1 — Client, Server and CORS**

Starting state: both halves run, but the product list is drawn from `frontend/public/mock/products.json`, a file shipped inside the frontend. The backend has no CORS settings at all.

What the class does:

1. Open the Network tab and see that the products come from a file, not from a server.
2. Prove in Postman that `http://localhost:8000/api/products/` already works.
3. In the browser console on port 3000, run `fetch('http://localhost:8000/api/products/')` and watch the browser block the answer.
4. Read the error phrase by phrase: the origin, the CORS policy, the missing header.
5. Install `django-cors-headers` and make three edits in `settings.py`: add `corsheaders` to `INSTALLED_APPS`, add `corsheaders.middleware.CorsMiddleware` as high as possible in `MIDDLEWARE`, and add `CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]`.
6. Create `frontend/.env`, create `src/api.js` with `BASE_URL` and `apiUrl`, and add `.env` to `.gitignore`.
7. In `AllProductsSection/index.jsx`, swap the mock file for `apiUrl('/api/products/?…')`, and read `fetchedData.results` instead of a plain list.
8. Delete `public/mock/products.json`.

Files touched: `backend/freshcart/settings.py`, `frontend/.env`, `frontend/.gitignore`, `frontend/src/api.js`, `frontend/src/components/AllProductsSection/index.jsx`.

Checkpoint: the product list shows products served by Django, and the Network tab shows the request going to port 8000.

**Session 2 — Login and Logout**

Starting state: products come from Django. The login form still does nothing useful, and logout only deletes a cookie.

What the class does:

1. Test both endpoints in Postman first, so any problem left is on the frontend.
2. Add to `api.js`: the two cookie names, `getAccessToken`, `getRefreshToken`, `saveTokens`, `clearTokens`, and `apiFetch`.
3. In `LoginForm/index.jsx`, call `apiFetch('/api/users/login/')`, save both tokens, and read the failure message from `detail` with a fallback sentence.
4. In `ProtectedRoute/index.jsx`, read the token through `getAccessToken()`.
5. In `Header/index.jsx`, make logout `async`: send the refresh token to `/api/users/logout/` **first**, and clear the tokens only after the answer comes back.

Files touched: `frontend/src/api.js`, `LoginForm/index.jsx`, `ProtectedRoute/index.jsx`, `Header/index.jsx`.

Checkpoint: logging in as Priya puts two cookies in DevTools, and logging out gives a 205, empties both cookies, and lands on `/login`.

**Session 3 — Deals of the Day and the Product Details Page**

Starting state: login works and every request carries the token. The deals strip and the details page still have nothing behind them.

What the class does, on the backend first:

1. Add one function above the views in `products/views.py` that writes the members-only rule down once: an authenticated person gets every product, a visitor gets the products that are not deals.
2. Both the list view and the detail view delete their `queryset` line and use `get_queryset` instead, because `queryset` is worked out once when Django starts and cannot know who is asking, while `get_queryset` runs on every request and has `self.request.user`.
3. Add `DEAL_VALUES = {'true', '1'}` and a `get_permissions` method that returns `[IsAuthenticated()]` when `is_deal` was asked for directly. It is a set, not a comparison with one word, because django-filter accepts more than one spelling of true. Anything that is not a deal request falls through to the default, so the public list stays public.

Then on the frontend:

4. In `DealsSection/index.jsx`, call `apiFetch('/api/products/?is_deal=true&page_size=6')`, read `results`, read `imageUrl`, and read the error from `detail`.
5. In `ProductItemDetails/index.jsx`, call `apiFetch('/api/products/<id>/')` and read `imageUrl`.

Files touched: `backend/products/views.py`, `DealsSection/index.jsx`, `ProductItemDetails/index.jsx`.

Checkpoint: six deals appear when logged in. Break the token value in DevTools and the same request answers 401 and the strip becomes the "log in to see today's deals" banner.

**Session 4 — Filters, Sort and Search**

Starting state: the filter panel sends names Django does not use. Every request answers 200 and the screen still says no products found.

What the class does:

1. In Postman, send each name on its own and read the `count`, so the class sees that the backend was never broken.
2. In `AllProductsSection/index.jsx`, change the category options so the value sent is the category word, not a number. The label the user reads never changes, only the value we send.
3. Change the sort options so the values are `-price` and `price` instead of made-up words.
4. Rename two names in the URL: `sort_by` becomes `ordering`, and `title_search` becomes `search`.
5. Split the search box into two pieces of state: `searchInput` holds what is being typed and `searchQuery` holds what was actually submitted. Put `searchQuery` in the effect's dependency list, build the URL from `searchQuery`, and reset both in `clearFilters`.

Files touched: `frontend/src/components/AllProductsSection/index.jsx`.

Checkpoint: clicking Beverages shows drinks, Price High-Low sorts, typing sends no requests, Enter sends exactly one, and Household Care correctly shows nothing.

**Session 5 — The Cart**

Starting state: the cart lives in one React array. Clicking ADD TO CART sends zero requests, and a reload loses everything.

What the class does, all in `App.jsx`:

1. Add `formatCartItem`, which keeps the row id and the product id apart and turns the price text into a number once, on the way in.
2. Add `getCart`, which reads `/api/cart/` and sets the list from `data.items`.
3. In the loader that already runs on mount, check for a token before calling it, so the login screen does not fire a request that would answer 401.
4. Replace `addCartItem` with a POST to `/api/cart/add/` followed by `getCart()`.
5. Replace `deleteCartItem` with a DELETE to `/api/cart/items/<id>/` followed by `getCart()`.
6. Replace `updateCartItemQuantity` with a PATCH followed by `getCart()`.
7. Leave the increase and decrease functions alone. They already do the arithmetic and hand a final number to the update function, which is exactly what a PATCH that sets a value needs.

Files touched: `frontend/src/App.jsx`. No backend file is touched, and no component below `App` changes.

Checkpoint: reload with a full cart and it is still there, open a second tab and it matches, log out and back in and it survives, log in as a different person and they have their own empty cart.

**Session 6 — Registration**

Starting state: the register page is fully built and its submit function only stops the page from reloading.

What the class does, all in `RegisterForm/index.jsx`:

1. Import `apiFetch` and `useNavigate`.
2. Send the four fields Django wants: username, email, password and `user_type`. `confirmPassword` is not on that list.
3. Read the body with `await response.json()`, then branch on `response.ok`.
4. On success, go to `/login`, because registering does not log anyone in.
5. Write `getErrorMessage(data)` above the component, in five small steps: return `detail` when it is there; otherwise take the first key with `Object.keys(data)[0]`; fall back to a sentence you wrote if there is no key at all; otherwise take the first message in that key's list and join the two into one line.
6. At the very top of the submit function, compare the two password boxes and stop with a `return` when they differ. This is the only rule in the whole project that lives entirely in the browser, and the Network tab stays empty when it fires.

Files touched: `frontend/src/components/RegisterForm/index.jsx`.

Checkpoint: a fresh name gives a 201 and lands on login. Registering as Priya shows the taken-username message. Two different passwords show a message and send zero requests.

**Session 7 — Your Turn: Selling, Orders and the Dashboard**

Starting state: a customer can look and can collect, but nobody can buy and nobody can sell. The 54 products were loaded by the seed command, and not one screen sends a POST to `/api/products/`.

Before writing code, answer the four questions for each screen: what is on the screen, what data does it need, where does that data live, and which API returns it.

Build in this order, and build the dashboard last, because it can only count orders that already exist.

| Part | Screens | Endpoints |
| --- | --- | --- |
| 1 My Products | List, Add, Edit, Delete | 18, 6, 7 with 8, 9 |
| 2 Orders | Checkout, One order, My Orders | 15, 16, 14, 17 |
| 3 Vendor Orders | The rows you have to pack | 19, 20 |
| 4 Dashboard | Overview | 21 |

Files touched: the `orders` and `vendor` Django apps, and the `MyProducts`, `ProductForm`, `Checkout`, `OrderDetails`, `MyOrders`, `VendorOrders`, `VendorLayout` and `VendorDashboard` components.

Checkpoint: a vendor adds a product and sees it in the shop, a customer buys it with a morning delivery time, the vendor marks it shipped and then delivered, the customer's order badge follows along on its own, and the dashboard numbers move.

---

**13. Rules That Must Not Change**

These look like mistakes. They are not. Each one is a lesson the sessions are built around, and **fixing any of them breaks the class**.

| The thing | Why it stays |
| --- | --- |
| The product list answer is wrapped in `results` | teaches that a paged answer is not a plain list |
| The picture column is `imageUrl` in camelCase, next to `is_deal` and `total_reviews` in snake_case | teaches "read the actual answer, do not guess the pattern" |
| The vendor product list renames it to `image_url` | teaches that a serializer can rename a field on the way out |
| The default page size is 5, and there are exactly 6 deals | forces the class to discover `page_size`, because five would silently drop the sixth |
| Login errors use `detail`, register errors use the field name | teaches that one error reader has to cope with both shapes |
| The category filter matches the word, not a number | teaches that the label a user reads and the value the server reads are two different things |
| Sorting uses `ordering=-price`, not a made-up word | same lesson, and teaches what a leading minus means |
| Search is one name that covers title and brand | teaches that one name can search two columns |
| An unknown name like `nonsense=xyz` is quietly ignored and answers all 54 | teaches that a wrong name fails without an error, which is the hardest bug to spot |
| Household Care has zero products | teaches the difference between an empty answer and a broken filter |
| The rating filter is "and up", not exactly equal | teaches that the button says "4 & up" and the lookup has to match the button |
| Money arrives as text like `"54.00"` | teaches why money is never a plain number |
| A cart row carries a row id and a product id | teaches which id each request needs |
| Registering returns only a message, no token | teaches that making an account is not logging in |
| Logout answers 205 and needs the refresh token | teaches which of the two tokens is blacklisted |
| Delete answers 204 with no body | teaches that an empty answer is the correct answer |

---

**14. Testing Checklist**

Run these by hand before calling the project finished. Keep the Network tab open for all of them.

**Setup**

1. Both servers start, one on 8000 and one on 3000.
2. The product list shows 54 products across 11 pages.
3. Stopping the backend makes the product list show its failure view, not a blank screen.

**Visitor, not logged in**

4. The product list opens and shows products.
5. The deals strip shows the log-in banner, and its request answered 401.
6. Asking for `/api/products/?is_deal=true` in Postman with no token answers 401.
7. Opening a deal product by its id answers 404.
8. Opening `/cart` in the address bar sends you to `/login`.

**Logging in**

9. Priya and secret123 lands on the home page and puts two cookies in DevTools.
10. A wrong password shows the message from `detail`, not `undefined`.
11. Logout gives a 205, empties both cookies, and lands on `/login`.
12. After logout, the product list still works, because `apiFetch` sends no token header at all.

**Filters, sort and search**

13. Beverages shows only drinks.
14. Household Care shows an empty list, and that is correct.
15. Price High-Low puts the dearest product first.
16. The 4 and up rating button includes a 4.5-star product.
17. Typing in the search box sends no requests, and Enter sends exactly one.
18. Searching a brand name returns that brand's products.
19. Clear Filters empties the box and brings all 54 back.

**Cart**

20. ADD TO CART gives a 201 and then a fresh GET.
21. Plus and minus give a 200 PATCH, and the total updates.
22. Minus at a quantity of one deletes the row instead.
23. Remove gives a 204.
24. Reload keeps the cart, a second tab matches, and a different person has their own empty cart.

**Registration**

25. A fresh username gives a 201 and lands on `/login`.
26. Registering as Priya shows the taken-username message.
27. An empty form shows a required-field message.
28. Two different passwords show a message and send zero requests.

**Selling**

29. Add Product gives a 201 and the new product appears in My Products and in the shop.
30. A missing required field shows the field's own message and keeps what was typed.
31. Edit fills every box with real values, and saving one field leaves the others alone.
32. Delete asks first, gives a 204, and the row goes after the list is read again.
33. Signing in as Arjun, a customer, and trying to change one of Priya's products answers 403.

**Orders**

34. Place Order gives a 201, empties the cart, and opens the new order.
35. Placing an order with an empty cart answers 400.
36. The delivery time chosen at checkout is the one shown on the order page.
37. My Orders shows the newest order first with the right total and item count.
38. Cancel works while the order is `placed` and the button is gone afterwards.
39. Asking for somebody else's order id answers 404.
40. Deleting a product that was already bought leaves the old order row exactly as it was.

**Vendor orders and dashboard**

41. Vendor Orders shows only Priya's rows.
42. Moving a row to shipped and then delivered works, and it cannot go backwards.
43. When every row is delivered, the customer's order says delivered and `is_paid` is true.
44. The dashboard's four numbers match what was actually sold.
45. The chart always draws seven bars, including days with nothing on them.
46. Cancelling an order takes its amount out of revenue and out of "still to pack".

---

**15. Definition of Done**

The project is finished when all of the following are true.

1. A person can start from nothing and reach a placed order: register, log in, browse, search, filter, open a product, add it to the cart, change the quantity, choose a delivery time, check out, and see the order.
2. A vendor can start from nothing and reach a sale: log in, add a product, see it in the shop, see the order arrive, mark it shipped and delivered, and watch the dashboard change.
3. All 46 checks in section 14 pass.
4. Every one of the 21 endpoints answers the status code written next to it in section 9.
5. Nothing in section 13 has been "fixed".
6. The seed command runs twice in a row without breaking.
7. No file anywhere holds a hardcoded `http://localhost:8000`. The address lives only in `.env`, and only `api.js` reads it.
8. No component anywhere calls `fetch` directly or reads a cookie by name. Everything goes through `apiFetch` and the four token helpers.
9. The backend decides every permission. Removing a button from React never changes what the server allows.
10. The seven sessions in section 12 can each be taught from the state the session before it left behind.

---

**16. What This Project Does Not Include**

These are deliberately left out. Adding any of them takes the project past what the course teaches, and gives students work they have not been prepared for.

1. Real payments. `payment_method` is a saved word, and nothing is charged.
2. Stock counts. `availability` is the text `In Stock` or `Out of Stock`, and buying something never reduces a number.
3. Real delivery scheduling. `delivery_slot` is a saved word, and no slot is ever full or blocked.
4. Delivery charges and minimum order amounts. Shipping stays 0.00.
5. Uploading picture files. A product's picture is a web address typed into a box.
6. Emails, OTPs, live order tracking and password resets.
7. Writing reviews. The rating and review count are seeded numbers, read only.
8. Wishlists, coupons and discount codes. The old price is shown, and nothing works anything out from it.
9. Refreshing the access token when it expires. Tokens last long enough for a class.
10. Hosting, deployment, Docker and build pipelines.
11. Changing the Django admin panel beyond registering the tables.
12. Automated tests. Section 14 is checked by hand.

---

**17. Build Order for an AI Coding Agent**

Follow these steps in order. Do not start a step until the check at the end of the step before it passes.

**Backend**

1. Make the folder, the virtual environment, and install the five packages from section 3. Freeze them into `requirements.txt`.
2. Start the Django project as `freshcart` and create five apps: `users`, `products`, `cart`, `orders`, `vendor`.
3. In `settings.py`: add the apps, add `rest_framework`, `django_filters`, `corsheaders` and `rest_framework_simplejwt.token_blacklist`; put `CorsMiddleware` as high as possible in `MIDDLEWARE`; set `CORS_ALLOWED_ORIGINS` to `http://localhost:3000`; set `AUTH_USER_MODEL` to the users app's model; set the DRF defaults to `AllowAny`, JWT authentication, the page size of 5 and the django-filter backend.
4. Write the five sets of models from section 8, then `makemigrations` and `migrate`.
5. Write `products/management/commands/seed_products.py` from section 7. Run it and confirm 54 products and 2 users exist.
6. Write the serializers, views and urls for `users`, then test all three endpoints in Postman.
7. Write them for `products`, including the pagination class, the filter class with the "and up" rating, the visible-products function and the permission method. Test every row of the table in section 9 item 4.
8. Write them for `cart`, then for `orders`, then for `vendor`. Test each endpoint before moving on.
9. Check every status code in section 9 with a token and without one.

**Frontend**

10. Scaffold with Vite and React, install the six packages from section 3, and set the port to 3000 in `vite.config.js`.
11. Write `src/api.js` exactly as it appears in section 11, create `.env`, and put `.env` in `.gitignore`.
12. Write `format.js`, the two context files, `main.jsx` and the routes in `App.jsx` from section 10.
13. Build the screens in this order, testing each one against a running backend before starting the next: Header, Login, Register, ProtectedRoute, Product list with filters and search, Deals strip, Product details, Cart, Checkout, My Orders, One order, My Products, Add and Edit Product, Vendor Orders, Dashboard, Not Found.
14. Work through all 46 checks in section 14 and fix what fails.
15. Read section 13 again and confirm that nothing on that list was tidied up along the way.
