# FreshCart — Connecting a React Shop to a Django Server

<Section>

## Concepts In Focus

<IndexList>
<IndexItem href="2-two-programs-talking-to-each-other">Two Programs Talking to Each Other</IndexItem>
<IndexItem href="5-what-we-are-building">What We Are Building: FreshCart</IndexItem>
<IndexItem href="10-how-the-browser-asks-the-server">How the Browser Asks the Server</IndexItem>
<IndexItem href="16-who-is-allowed-to-do-what">Who Is Allowed to Do What</IndexItem>
<IndexItem href="20-where-the-data-lives">Where the Data Lives</IndexItem>
<IndexItem href="27-the-screens-we-build">The Screens We Build</IndexItem>
<IndexItem href="30-the-one-file-that-talks-to-the-server">The One File That Talks to the Server</IndexItem>
<IndexItem href="35-things-that-look-wrong-but-are-right">Things That Look Wrong but Are Right</IndexItem>
<IndexItem href="38-our-seven-sessions">Our Seven Sessions</IndexItem>
<IndexItem href="43-how-to-run-the-project">How to Run the Project</IndexItem>
</IndexList>

---
</Section>



<Section id="2-two-programs-talking-to-each-other">

## Two Programs Talking to Each Other

Think of a grocery shop with a counter.

You stand at the counter. You cannot walk into the godown and pick stock off the shelves yourself. You ask the shopkeeper, and the shopkeeper brings the packet to you.

The godown has the goods. You have the counter. The shopkeeper carries messages between the two.

</Section>

<Section id="3-two-programs-talking-to-each-other">

Our app works exactly the same way.

| Grocery shop | Our app |
|---|---|
| You at the counter | The React app running in the browser |
| The price board you read | The screen you see |
| Your request to the shopkeeper | The request that travels over the network |
| The godown and its keeper | The Django server |
| The racks inside the godown | The database (SQLite) |
| The slip you both read | JSON — plain text both sides understand |

</Section>

<Section id="4-two-programs-talking-to-each-other">

One rule from the shop is worth remembering.

**The godown decides what you get, not the price board.**

If the board hides an item, a clever customer can still ask for it. Only the person holding the stock can truly refuse.

In our app this means: **the server decides what a person may see, not React.** Hiding a button in React is only politeness. The real lock is always in the Django code.

</Section>

<Section id="5-what-we-are-building">

## What We Are Building: FreshCart

FreshCart is an online grocery store.

A **customer** can browse products, search them, filter them by category and rating, sort them by price, open one product, put products in a cart, choose a delivery time, and place an order.

A **vendor** can add their own products, edit them, delete them, see the orders that contain their products, and see a small dashboard of their sales.

</Section>

<Section id="6-what-we-are-building">

Three kinds of people use FreshCart.

| User | What they can do |
|---|---|
| Visitor (not logged in) | Browse, search, filter, sort, open a product. No Deals of the Day. No cart. |
| Customer (logged in) | Everything a visitor can do, plus Deals of the Day, cart, checkout with a delivery time, and their own orders |
| Vendor (logged in) | Everything a customer can do, plus add, edit and delete their own products, move their order rows forward, and see a dashboard |

**Deals of the Day** are products only logged-in people may see. They are our "members only" shelf.

Every product also carries a **pack size** such as `1 kg`, `500 g` or `1 L`, and an old price (`mrp`) shown with a line through it.

</Section>

<Section id="7-the-two-halves-of-the-app">

## The Two Halves of the App

The project is not one program. It is two programs that run at the same time on one laptop.

| Half | What it is | Port |
|---|---|---|
| backend | Django + Django REST Framework, data kept in SQLite 3 | 8000 |
| frontend | React app served by Vite | 3000 |

A **port** is like a door number on the same building. One laptop, two doors, two programs.

</Section>

<Section id="8-the-two-halves-of-the-app">

Two things follow from this, and both matter all through the course.

| Point | Why |
|---|---|
| You need two terminals | One runs Django, one runs Vite. Both stay open the whole time. |
| The two numbers must stay 8000 and 3000 | Two programs cannot share one door. And the browser treats port 3000 and port 8000 as two different places — that is the whole reason CORS exists in Session 1. |

Always start the backend with `python manage.py runserver 8000`.

</Section>

<Section id="9-the-tools-we-use">

## The Tools We Use

Backend, listed in `backend/requirements.txt`:

| Package | What it gives us |
|---|---|
| Django | the web framework and the database layer |
| djangorestframework | turns Django into a server that answers with JSON |
| django-filter | filtering by category, brand, rating |
| djangorestframework-simplejwt | login tokens |
| django-cors-headers | lets port 3000 talk to port 8000 |

Frontend, listed in `frontend/package.json`: `react`, `react-dom`, `react-router` (moving between screens), `js-cookie` (saving tokens), `react-icons`, `react-spinners`, and `vite` (runs the frontend).

</Section>

<Section id="10-how-the-browser-asks-the-server">

## How the Browser Asks the Server

Every request is two things put together: **what you want to do**, and **where**.

```text
GET  http://localhost:8000/api/products/
 ↑            ↑                  ↑
 |            |                  └── the path: which shelf
 |            └── the address of the server
 └── the method: what you want to do
```

A full path like this is called an **endpoint**. FreshCart has 21 of them.

</Section>

<Section id="11-how-the-browser-asks-the-server">

There are only four methods in this whole project.

| Method | Plain meaning | Example in FreshCart |
|---|---|---|
| GET | give me something | `GET /api/products/` — the product list |
| POST | here is something new, save it | `POST /api/cart/add/` — put a product in the cart |
| PATCH | change one part of something | `PATCH /api/cart/items/4/` — set that row's quantity |
| DELETE | remove it | `DELETE /api/cart/items/4/` — take the row out |

</Section>

<Section id="12-asking-with-extra-details">

## Asking with Extra Details

Extra details go at the end of the path after a `?`, joined by `&`.

```text
/api/products/?category=Beverages&ordering=-price&page=2
```

| Name | What it does |
|---|---|
| page | which page |
| page_size | how many on one page, most 100 |
| category | exact match on the category word |
| brand | exact match on the brand |
| search | looks in the title **and** the brand |
| ordering | sorting. `price` is cheapest first, `-price` is dearest first |
| rating | `rating=4` means 4 and up, not exactly 4 |
| is_deal | the Deals of the Day, needs a login |

</Section>

<Section id="13-what-comes-back-json">

## What Comes Back: JSON

The server never sends a web page. It sends **JSON** — plain text arranged in names and values, which JavaScript can read straight away.

```json
{
  "id": 9,
  "title": "Tomatoes",
  "brand": "Farm Fresh",
  "unit": "1 kg",
  "category": "Fruits & Vegetables",
  "price": "38.00",
  "mrp": "45.00",
  "imageUrl": "https://picsum.photos/seed/item9/300/300",
  "rating": 4.5,
  "total_reviews": 618,
  "availability": "In Stock",
  "is_deal": true
}
```

`mrp` is only there to be shown with a line through it. Nothing on the server works anything out from it.

</Section>

<Section id="14-the-list-is-wrapped">

## The List Is Wrapped

When you ask for many products, the answer is **not** a plain list. It is a box with the list inside it.

```json
{
  "count": 54,
  "total_pages": 11,
  "next": "http://localhost:8000/api/products/?page=2",
  "previous": null,
  "results": [ { "id": 9, "title": "Tomatoes" } ]
}
```

The products are inside `results`. So in React you write `data.results`, not `data`.

This is called **pagination** — the server sends one page at a time instead of all 54 products at once. Our page size is 5.

</Section>

<Section id="15-status-codes">

## Status Codes — the Server's Short Reply

Every answer also carries a number that says how it went.

| Code | Meaning | Where we see it |
|---|---|---|
| 200 | fine, here it is | reading anything |
| 201 | made and saved | register, add to cart, place order |
| 204 | done, and there is nothing to send back | DELETE |
| 205 | done, clear your side | logout |
| 400 | you sent something wrong | empty cart at checkout |
| 401 | I do not know who you are | no token, or a broken token |
| 403 | I know who you are, and you may not | editing somebody else's product |
| 404 | no such thing here | somebody else's order id |

</Section>

<Section id="16-who-is-allowed-to-do-what">

## Who Is Allowed to Do What

When you log in, the server sends back two long strings called **tokens**.

```json
{"refresh": "eyJhbGciOiJIUzI1NiIs…", "access": "eyJhbGciOiJIUzI1NiIs…"}
```

A token is proof of who you are. HTTP forgets you after every request, so you must show your proof again with each one.

</Section>

<Section id="17-the-two-tokens">

## The Two Tokens

Think of a cinema.

| Cinema | Our app |
|---|---|
| The ticket you show at the hall door, every time | the **access** token — sent with every request |
| The stamp on your hand that proves you paid | the **refresh** token — kept safe, used to end the session |

We save both in cookies with `js-cookie`, so a page reload does not log you out.

Logout sends the **refresh** token to the server. The server blacklists it, and answers 205. The session is now over on the server too, not just in the browser.

</Section>

<Section id="18-how-the-token-travels">

## How the Token Travels

The access token rides along in a header called `Authorization`.

```text
Authorization: Bearer eyJhbGciOiJIUzI1NiIs…
```

We never write this by hand in a screen. One helper called `apiFetch` adds it for us. More on that shortly.

</Section>

<Section id="19-registering-is-not-logging-in">

## Registering Is Not Logging In

`POST /api/users/register/` answers 201 with only a message:

```json
{"message": "Account created!"}
```

There is **no token in that answer**. Making an account does not log you in. After a successful register, send the person to `/login`.

And note the two shapes an error can take:

| Where | Shape |
|---|---|
| Login failure | `{"detail": "No active account found with the given credentials"}` |
| Register failure | `{"username": ["A user with that username already exists."]}` |

One error reader in React has to cope with both.

</Section>

<Section id="20-where-the-data-lives">

## Where the Data Lives

The backend is split into five small apps. Each one owns its own tables.

| App | What it holds |
|---|---|
| users | register, login, logout |
| products | the catalogue |
| cart | the cart |
| orders | checkout and orders |
| vendor | vendor product list, vendor orders, dashboard |

</Section>

<Section id="21-the-user-table">

## The User Table

We use Django's own user with one extra column.

| Field | Notes |
|---|---|
| username | unique, the name used to log in |
| email | optional |
| password | Django hashes it — we never write hashing code |
| user_type | `customer` or `vendor`, default `customer` |

</Section>

<Section id="22-the-product-table">

## The Product Table

| Field | Notes |
|---|---|
| title, brand | both needed |
| unit | the pack size, such as `1 kg`, shown next to the title |
| category | Fruits & Vegetables, Dairy & Bakery, Snacks & Packaged Food, Beverages, Household Care |
| price | decimal, so money never rounds badly |
| mrp | the old price, only for display |
| imageUrl | the picture address |
| rating, total_reviews | seeded numbers, read only |
| availability | `In Stock` or `Out of Stock` |
| is_deal | true or false — the members-only flag |
| vendor | the owner. Taken from the token, never sent by React |

</Section>

<Section id="23-the-cart-tables">

## The Cart Tables

One person has one `Cart`. A `Cart` holds many `CartItem` rows. One row is one product and a quantity.

`GET /api/cart/` answers the whole cart:

```json
{
  "id": 1,
  "items": [
    {"id": 4, "product": 8, "product_title": "Tomatoes",
     "product_unit": "1 kg", "product_price": "38.00", "quantity": 4}
  ],
  "total_items": 4,
  "total_price": "152.00"
}
```

</Section>

<Section id="24-two-ids-in-one-row">

## Two Ids in One Row

Look at that row again. It carries **two different numbers**.

| In the answer | What it is | Which request needs it |
|---|---|---|
| `"id": 4` | the row's own id | `PATCH /api/cart/items/4/`, `DELETE /api/cart/items/4/` |
| `"product": 8` | the product's id | `POST /api/cart/add/` with `{"product": 8}` |

Sending the wrong one is the most common cart bug. Keep them apart the moment the data enters React.

Also remember: **PATCH sets the quantity, it does not add to it.** Send the number you want the row to end up with.

</Section>

<Section id="25-the-order-tables">

## The Order Tables

At checkout the browser sends only three things: the payment method, the delivery time, and the address.

```json
{"payment_method": "COD",
 "delivery_slot": "MORNING",
 "address": {"full_name": "Priya R", "phone": "9876543210",
             "address": "12 Park Street", "city": "Hyderabad",
             "state": "Telangana", "pincode": "500001"}}
```

**Do not send the cart and do not send the total.** The server already has the cart, and a total sent by the browser can be edited by the browser.

`delivery_slot` is just a saved word — Morning 7 to 10, Afternoon 12 to 3, or Evening 5 to 8. Nothing in the project schedules anything from it.

</Section>

<Section id="26-why-an-order-copies-the-product">

## Why an Order Copies the Product

When the order is saved, each row **copies** the product's title, brand, pack size, picture and price instead of only linking to the product.

| If we only linked | Because we copy |
|---|---|
| Changing a price next week would quietly rewrite an old bill | An old order keeps the price that was actually paid |
| Deleting a product would empty an order somebody already placed | The order row still shows what was bought |

In a grocery store prices move often, so this rule earns its keep fast.

An order can hold products from more than one vendor, so the order moves at the pace of its slowest row: every row delivered means the order is delivered, and only then is `is_paid` true for a COD order.

</Section>

<Section id="27-the-screens-we-build">

## The Screens We Build

| Path | Screen | Who can open it |
|---|---|---|
| / | Home | anyone |
| /login, /register | Login, Register | anyone |
| /products | Product list with the deals strip on top | anyone |
| /products/:id | One product | anyone, deals need a login |
| /cart, /checkout | Cart, Checkout | logged in only |
| /orders, /orders/:id | My Orders, One order | logged in only |
| /vendor | Dashboard | logged in only |
| /vendor/products | My Products | logged in only |
| /vendor/products/new, /vendor/products/:id/edit | Add Product, Edit Product | logged in only |
| /vendor/orders | Vendor Orders | logged in only |
| anything else | Not Found | anyone |

</Section>

<Section id="28-what-each-screen-shows">

## What Each Screen Shows

| Screen | On the screen |
|---|---|
| Product list | the Deals of the Day strip on top, a filter panel with categories, brands and ratings, a search box, a sort dropdown, a grid of cards each showing the pack size and both prices, and Previous and Next |
| One product | picture, title, brand, pack size, price with the old price struck through, rating, reviews, availability, description, a quantity box, ADD TO CART, and a few similar products |
| Cart | one row per product with a plus, a minus and Remove, plus the total and a Checkout button |
| Checkout | six address boxes, COD or CARD, a delivery time of Morning, Afternoon or Evening, what is in the cart, the total, Place Order |
| My Orders | one card per order with the number, date, status, total, item count, and View Details |
| One order | the items with their status, the address, the delivery time, the payment details, and Cancel when `can_cancel` is true |

</Section>

<Section id="29-what-each-screen-shows">

| Screen | On the screen |
|---|---|
| My Products | a search box, an Add Product button, one row per product with Edit and Delete, and page controls |
| Add and Edit Product | title, brand, pack size, category, price, old price, image address, availability, description, deal yes or no, and Save |
| Vendor Orders | one row per item you sold, with the order number, the product, the quantity, the amount, the status, and a button that moves it forward |
| Dashboard | four number cards, a "still to pack" strip, a seven-bar chart of the last seven days, a top products panel, and an items-by-status panel |

Use the same four status words everywhere, coloured the same way: **placed, shipped, delivered, cancelled**.

</Section>

<Section id="30-the-one-file-that-talks-to-the-server">

## The One File That Talks to the Server

`src/api.js` is the only file in the whole app that knows where the server is. Every request goes through it.

```js
import Cookies from 'js-cookie'

export const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const apiUrl = path => `${BASE_URL}${path}`

const ACCESS_TOKEN_KEY = 'jwt_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export const getAccessToken = () => Cookies.get(ACCESS_TOKEN_KEY)
export const getRefreshToken = () => Cookies.get(REFRESH_TOKEN_KEY)
```

</Section>

<Section id="31-the-one-file-that-talks-to-the-server">

```js
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

</Section>

<Section id="32-what-each-helper-does">

## What Each Helper Does

| Helper | Its one job |
|---|---|
| `BASE_URL` | reads the server address out of `.env` |
| `apiUrl(path)` | glues the address in front of `/api/products/` |
| `getAccessToken`, `getRefreshToken` | read a token out of a cookie |
| `saveTokens`, `clearTokens` | write both cookies, or remove both |
| `apiFetch` | adds the address, adds the JSON header, adds the token |

Two rules for the whole project:

- **No screen calls `fetch` directly.** Everything goes through `apiFetch`.
- **No screen reads a cookie by name.** Everything goes through the four token helpers.

</Section>

<Section id="33-why-apifetch-checks-for-a-token">

## Why apiFetch Checks for a Token

Look closely at this line:

```js
if (token !== undefined) {
  headers.Authorization = `Bearer ${token}`
}
```

Without that check, a visitor who is not logged in would send the word `undefined` as their token.

| What is sent | How the server reads it |
|---|---|
| no `Authorization` header at all | a visitor — fine, show the public products |
| `Authorization: Bearer undefined` | a broken token — refuse with 401 |

Skip the check and the public product list breaks for everyone who is not logged in.

</Section>

<Section id="34-the-env-file">

## The .env File

The server address is never typed inside a screen. It lives in one line in `frontend/.env`:

```text
VITE_API_BASE_URL=http://localhost:8000
```

| Rule | Why |
|---|---|
| The name must start with `VITE_` | Vite only passes those through to the app |
| Read it as `import.meta.env.VITE_API_BASE_URL` | that is Vite's way of handing it over |
| Restart Vite after changing it | the file is read once, when the server starts |
| Put `.env` in `.gitignore` | it is a settings file, never committed |

Tomorrow the server moves to a real address. Then one line changes, and not one screen is touched.

</Section>

<Section id="35-things-that-look-wrong-but-are-right">

## Things That Look Wrong but Are Right

Some things in FreshCart look like mistakes. They are not. Each one is a lesson. **Do not "fix" them.**

| The thing | What it teaches |
|---|---|
| The product list is wrapped in `results` | a paged answer is not a plain list |
| The picture field is `imageUrl` in camelCase, next to `is_deal` and `total_reviews` in snake_case | read the actual answer, do not guess the pattern |
| The vendor product list renames it to `image_url` | the server can rename a field on the way out |
| Page size is 5, and there are exactly 6 deals | you must discover `page_size`, or the sixth one silently disappears |

</Section>

<Section id="36-things-that-look-wrong-but-are-right">

| The thing | What it teaches |
|---|---|
| Login errors use `detail`, register errors use the field name | one error reader must cope with both shapes |
| The category filter matches the word, not a number | the label a user reads and the value the server reads are two different things |
| Sorting uses `ordering=-price`, not a word we invented | the minus sign means "biggest first" |
| Search is one name that covers title and brand | one name can search two columns |
| A wrong name like `nonsense=xyz` is quietly ignored and returns all 54 | a typo in a query name fails silently — the hardest bug to spot |
| Household Care has zero products | an empty answer and a broken filter look the same on screen, but they are not |
| Registering returns a message and no token | making an account is not logging in |
| DELETE answers 204 with no body | an empty answer is the correct answer |

</Section>

<Section id="37-money-arrives-as-text">

## Money Arrives as Text

Prices come back with quotes around them: `"54.00"`, not `54`.

That is on purpose. A plain decimal number in JavaScript can round money in ways you do not notice until a bill is wrong.

But text does not add up:

```text
'54.00' + 100   →  "54.00100"      ← two pieces of text joined
Number('54.00') + 100   →  154     ← a real sum
```

So turn the price into a number **once**, when it enters React, and keep it a number from then on.

</Section>

<Section id="38-our-seven-sessions">

## Our Seven Sessions

We do not build FreshCart from an empty folder. The app already exists, and each session repairs one part of it. Each session starts where the one before it finished.

| Session | What we connect |
|---|---|
| 1 | Client, server and CORS |
| 2 | Login and logout |
| 3 | Deals of the Day and the product details page |
| 4 | Filters, sort and search |
| 5 | The cart |
| 6 | Registration |
| 7 | Your turn: selling, orders and the dashboard |

</Section>

<Section id="39-sessions-1-and-2">

## Sessions 1 and 2

**Session 1 — Client, Server and CORS**

The product list is coming from a file inside the frontend, `public/mock/products.json`. Postman proves Django already works, but the browser blocks the same request. We install `django-cors-headers`, allow `http://localhost:3000`, create `.env` and `api.js`, read `results` instead of a plain list, and delete the mock file.

*Checkpoint:* the product list comes from Django, and the Network tab shows a request to port 8000.

**Session 2 — Login and Logout**

We add the token helpers and `apiFetch` to `api.js`, call the login endpoint, save both tokens, read the failure message from `detail`, and make logout send the refresh token **first** and clear the cookies only after the answer comes back.

*Checkpoint:* logging in puts two cookies in DevTools; logging out gives a 205 and empties them.

</Section>

<Section id="40-sessions-3-and-4">

## Sessions 3 and 4

**Session 3 — Deals of the Day and the Details Page**

Backend first: one small function says who sees what, and the views swap `queryset` for `get_queryset`, because `queryset` is worked out once when Django starts and cannot know who is asking, while `get_queryset` runs on every request. Then the strip calls `/api/products/?is_deal=true&page_size=6` and the details page calls `/api/products/<id>/`.

*Checkpoint:* six deals appear when logged in. Break the token in DevTools and the same request answers 401.

**Session 4 — Filters, Sort and Search**

Every request already answers 200 and the screen still says no products found, because the frontend is sending names Django does not use. We send the category word instead of a number, use `-price` for sorting, rename `sort_by` to `ordering` and `title_search` to `search`, and split the search box into "what is being typed" and "what was submitted".

*Checkpoint:* typing sends no requests, Enter sends exactly one, and Household Care correctly shows nothing.

</Section>

<Section id="41-sessions-5-and-6">

## Sessions 5 and 6

**Session 5 — The Cart**

The cart lives in one React array, so a reload loses it. All the work is in `App.jsx`: add `formatCartItem` (keep the row id and the product id apart, turn the price into a number), add `getCart`, and make add, remove and update call the server and then call `getCart()` again. No component below `App` changes.

*Checkpoint:* reload and the cart is still there; a second tab matches; a different person has their own empty cart.

**Session 6 — Registration**

All the work is in `RegisterForm/index.jsx`: send the four fields Django wants (`confirmPassword` is not one of them), branch on `response.ok`, go to `/login` on success, and write a small `getErrorMessage` that handles both error shapes. The two passwords are compared in the browser, and that is the one rule in the whole project that never reaches the server.

*Checkpoint:* a fresh name gives a 201; Priya's name shows the taken-username message; two different passwords send zero requests.

</Section>

<Section id="42-session-7">

## Session 7 — Your Turn

Nobody can buy and nobody can sell yet. This session is yours to build.

Before writing code, answer four questions for every screen: **what is on the screen, what data does it need, where does that data live, and which endpoint returns it.**

| Part | Screens | Endpoints |
|---|---|---|
| 1 My Products | List, Add, Edit, Delete | 18, 6, 7 with 8, 9 |
| 2 Orders | Checkout, One order, My Orders | 15, 16, 14, 17 |
| 3 Vendor Orders | the rows you have to pack | 19, 20 |
| 4 Dashboard | Overview | 21 |

Build the dashboard **last** — it can only count orders that already exist.

</Section>

<Section id="43-how-to-run-the-project">

## How to Run the Project

Open two terminals and leave both running.

Terminal 1 — the backend, on Windows:

```bash
cd backend
python -m venv env
env\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_products
python manage.py runserver 8000
```

On Mac and Linux the only differences are `python3`, `pip3`, and `source env/bin/activate`.

</Section>

<Section id="44-how-to-run-the-project">

Terminal 2 — the frontend:

```bash
cd frontend
npm install
npm run dev
```

Then create `frontend/.env` with one line:

```text
VITE_API_BASE_URL=http://localhost:8000
```

*Checkpoint:* React opens at `http://localhost:3000` and Django answers at `http://localhost:8000`.

</Section>

<Section id="45-demo-accounts-and-seed-data">

## Demo Accounts and Seed Data

`python manage.py seed_products` creates two accounts and 54 grocery products, all owned by Priya. It is safe to run twice.

| Username | Password | Type | What it is for |
|---|---|---|---|
| Priya | secret123 | vendor | owns all 54 products, used for every vendor screen |
| Arjun | secret123 | customer | a plain buyer, used to show what a vendor screen refuses |

| Category | Products |
|---|---|
| Fruits & Vegetables | 15 |
| Dairy & Bakery | 14 |
| Snacks & Packaged Food | 13 |
| Beverages | 12 |
| Household Care | **0, on purpose** |
| Total | 54 |

Six products are Deals of the Day: ids **9, 11, 18, 20, 42 and 50**.

Add `--with-orders` to the command and you also get six finished orders spread over the last seven days, so the dashboard and its chart have something to draw.

</Section>

<Section id="46-a-quick-check-before-you-say-it-works">

## A Quick Check Before You Say It Works

| # | Check |
|---|---|
| 1 | Both servers run, and the list shows 54 products across 11 pages |
| 2 | Not logged in, the deals strip shows the log-in banner and its request answered 401 |
| 3 | Priya and secret123 puts two cookies in DevTools; logout gives 205 and empties them |
| 4 | Beverages filters, Household Care is empty, Price High-Low sorts, Enter sends exactly one request |
| 5 | Reload keeps the cart, and a different person has their own empty cart |
| 6 | Arjun trying to change Priya's product answers 403 |
| 7 | Place Order gives 201, empties the cart, saves the delivery time, and opens the new order |
| 8 | Marking every row delivered turns the customer's order badge to delivered on its own |
| 9 | The chart draws seven bars, including days with nothing on them |
| 10 | No file anywhere contains a typed-out `http://localhost:8000` except `.env` |

</Section>

<Section id="47-key-takeaways">

## Key Takeaways

| # | Main Topic |
|---|---|
| 1 | Two Programs Talking to Each Other |
| 2 | What We Are Building: FreshCart |
| 3 | How the Browser Asks the Server |
| 4 | Who Is Allowed to Do What |
| 5 | Where the Data Lives |
| 6 | The Screens We Build |
| 7 | The One File That Talks to the Server |
| 8 | Things That Look Wrong but Are Right |
| 9 | Our Seven Sessions |
| 10 | How to Run the Project |

</Section>
