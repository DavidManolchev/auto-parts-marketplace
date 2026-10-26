# APM – your auto parts marketplace

**React – Exam Project · Functional Guide**

Live site: [https://auto-parts-marketplace-blush.vercel.app/](https://auto-parts-marketplace-blush.vercel.app/)

---

## 1. Project Overview

**Application name:** APM – your auto parts marketplace

**Category / topic:** E-commerce marketplace (classified listings)

**Main purpose:** APM lets people buy and sell car parts and fluids. A visitor can search the catalog, narrow it down to parts that fit their make, model and year, and open a listing to see photos, specs and comments. A registered user can publish their own listings with photos, manage them, contact sellers, and like and comment on other listings. It solves the problem of finding the right part for a specific car from private sellers in one place.

**Tech stack:** React 19, Vite, react-router-dom 7, Supabase (Postgres via REST, Auth, Storage), plain JavaScript and external CSS.

---

## 2. User Access & Permissions

### Guest (not authenticated)

- **Available pages / routes:** `/` (home), `/parts` and `/fluids` (catalog), `/listings/:id` (details), `/login`, `/signup`, and the 404 page.
- **Public data shown:** all listings with photos, price, condition, fitment and seller name and city; like counts and comments on the details page.
- **Not available:** the seller's email (the button says "Log in to contact seller"), liking, commenting, and the pages for selling and managing listings.

### Authenticated user

- **Main sections / pages:** everything a guest can see, plus `/sell` (create a listing), `/my-listings` (your listings) and `/listings/:id/edit` (edit a listing). The Login and Signup pages are hidden from logged-in users.
- **Details pages:** the seller's email can be revealed and copied; the user can like the listing and post comments. The owner of a listing sees Edit and Delete buttons instead of the contact button.
- **Create / Edit / Delete actions:** a user creates listings and comments, edits and deletes only their own listings, and deletes only their own comments. This is enforced in the UI and again by database Row Level Security.

---

## 3. Authentication & Session Handling

### Authentication flow

1. **App load:** `AppProviders` (in `store.jsx`) mounts and subscribes to `supabase.auth.onAuthStateChange` in a `useEffect`. Until the first event arrives, `loading` is `true` and the route guards show "Loading…" so nobody is wrongly redirected.
2. **Status check:** the listener stores the Supabase session in state. `AuthCtx` exposes `user` (`id`, `email`, `name`), which is `null` for guests.
3. **Register / login:** `signUp` sends the name as user metadata and creates the account. If email confirmation is required, a "Check your email" panel is shown; a database trigger creates the matching `profiles` row. `logIn` calls `signInWithPassword`. After success the listener updates the session and `GuestView` redirects to the page the user came from (`state.from`) or to `/`.
4. **Logout:** the Header navigates to `/` and calls `supabase.auth.signOut()`. The listener clears the session, so private pages redirect to `/login` and the UI switches back to the guest view.

### Session persistence

- **Storage:** Supabase's client keeps the session (and refreshes its token) in the browser's `localStorage`, and the app shares it through the **Context API** (`AuthCtx`).
- **Auto-login after refresh:** on reload, `onAuthStateChange` fires with the stored session, so the user is signed in again without typing credentials. The listings also reload when the user changes.

---

## 4. Routing Structure

### Route guards logic

Two layout routes in `App.jsx` split the routes using `<Outlet />`:

- `GuestView` wraps `/login` and `/signup`. A logged-in user is redirected away (to `state.from` or `/`).
- `LoggedUserView` wraps `/sell`, `/listings/:id/edit` and `/my-listings`. A guest is redirected to `/login`, and the original path is passed in `state.from` so they return to it after logging in.

### Main routes

| Path | Page | Access |
|---|---|---|
| `/` | Home: fitment finder and latest offers | Everyone |
| `/parts`, `/fluids` | Catalog (the `Browse` page with `kind="part"` or `"fluid"`) | Everyone |
| `/listings/:id` | Details, likes and comments | Everyone (writing needs login) |
| `/login`, `/signup` | Authentication | Guests only |
| `/sell` | Create a listing | Logged-in users |
| `/listings/:id/edit` | Edit a listing (owner only) | Logged-in users |
| `/my-listings` | Your listings with edit and delete | Logged-in users |
| `*` | Not found | Everyone |

### Nested & parameterized routes

- **Nested routing:** two pathless layout routes (`GuestView`, `LoggedUserView`) with child routes, as above.
- **URL parameters:** `/listings/:id` (details) and `/listings/:id/edit` (edit), read with `useParams`. The catalog also keeps its search (`make`, `model`, `year`, `q`) in the query string with `useSearchParams`, so searches from the home page carry over and can be shared.

---

## 5. List → Details Flow

### Catalog / list page (`/parts`, `/fluids`)

- **Data displayed:** a grid of listing cards with a photo (click to cycle through photos), title, part number or spec, fitment, seller and city, price and a condition badge.
- **Interaction:** search by name or number, the make / model / year finder (parts only), category chips, condition checkboxes and a price range. The result count updates live, and an empty state explains when nothing matches.

### Details page (`/listings/:id`)

- **Navigation:** the card title is a `<Link to={`/listings/${l.id}`}>`. After saving or deleting, the app uses `useNavigate` to go to `/my-listings` with a notice.
- **Route parameter:** `id` is read with `useParams` and used to find the listing in the listings context. The page shows a photo gallery, price, category, condition, part number, fitment, seller, date, the contact or edit/delete actions, and the likes and comments.
- **Missing listing:** an unknown or deleted `id` shows a "Listing not found" panel instead of crashing.

---

## 6. Data Source & Backend

**Backend type:** a real remote backend on **Supabase** (backend as a service):

- **PostgreSQL through the REST API** (`@supabase/supabase-js` / PostgREST) for data
- **Supabase Auth** for registration, login and sessions
- **Supabase Storage** (`listing-images` bucket) for photos
- **Row Level Security** on every table, so the database itself enforces who can read and change what

| Table | Purpose |
|---|---|
| `profiles` | One row per user (name, contact email), created by a trigger on signup |
| `listings` | Parts and fluids: title, code, category, condition, price, city, fitment (`jsonb`), photo paths, owner |
| `comments` | Comments on a listing |
| `likes` | One row per user per listing |

---

## 7. Data Operations (CRUD)

The main collection is `listings`. All calls are in `store.jsx`.

### Create (POST)
The **Sell** form (`/sell`) calls `addListing`. It uploads the photos to Storage, then inserts the row (the owner is set by the database from the logged-in user) and adds the new listing to the context. The user is sent to My listings with a "Listed: …" notice. If the insert fails, the uploaded photos are removed again.

### Read (GET)
`reload` fetches all listings (newest first, with the seller's email from `profiles`) when the app loads and when the user changes. Home shows the latest five, the catalog filters the list, Details finds one by `id`, and My listings filters by `owner === user.id`. Comments and likes of a listing are loaded by the `useActivity` hook.

### Update (PUT/PATCH)
The author opens **Edit** (`/listings/:id/edit`), which reuses the Sell form pre-filled. `updateListing` uploads new photos, updates the row, deletes removed photos from Storage, and replaces the listing in the context, so every page shows the new data immediately. Non-owners get "Listing not found", and the database rejects the update anyway.

### Delete
The author clicks **Delete** on My listings or on the details page, and confirms in an inline "Delete this listing?" box. `deleteListing` checks ownership, deletes the row (and checks that a row was really removed), removes its photos from Storage, and filters it out of the context. The user lands on My listings with a "Deleted: …" notice. Users can also delete their own comments and remove their own likes.

---

## 8. Forms & Validation

### Forms used

1. **Login** and 2. **Signup**
3. **Sell / Edit listing** (one component for both)
4. **Fitment finder** (Home and parts catalog) and 5. **Catalog filters** (search, category, condition, price)
6. **Comment form** on the details page

### Validation rules

- **Password (Signup):** required and at least 8 characters. **Email:** required and must contain `@`. **Name:** required.
- **Price (Sell):** required, a number of at least 0, and rounded to two decimals. **Title:** required (the database allows at most 120 characters).
- **Photos (Sell):** at most 4, only JPG, PNG or WebP, each up to 5 MB, with a message when files are rejected.
- **Comment:** cannot be empty after trimming, and is limited to 500 characters with a live counter.
- **Price range (catalog):** shows an error when the minimum is higher than the maximum.

All inputs are controlled components with React synthetic events (`onChange`, `onSubmit`). The photo input is the only uncontrolled one, because browsers don't allow setting a file input's value.

---

## 9. React-Specific Techniques

### Hooks & component lifecycle

- **Hooks used:** `useState` (forms, UI state), `useEffect` (auth subscription, loading data, cleanup), `useMemo` (photo preview URLs), `useCallback` (`reload`), `useContext` (through `useAuth` and `useListings`), and the router hooks `useParams`, `useNavigate`, `useLocation` and `useSearchParams`.
- **Custom hook:** `useActivity(listingId, user)` loads and changes the comments and likes of one listing.
- **Mount / update / unmount example:** in `useActivity`, the effect fetches comments and likes **on mount**, fetches again **on update** when the listing, the user or a retry counter changes, and its cleanup function sets a `cancelled` flag **on unmount** so a late response is ignored. In the same way, the auth effect in `store.jsx` subscribes on mount and unsubscribes on unmount, and `Sell` revokes its preview object URLs when the files change or the form closes.

### Context API

- **`AuthCtx`:** `user`, `loading`, `signUp`, `logIn`, `logout`. Used by the Header, route guards, the Auth pages, listing cards, Details, My listings, Edit, `ContactSeller` and `Activity`.
- **`ListingsCtx`:** `listings`, `status`, `reload`, `addListing`, `updateListing`, `deleteListing`. Used by Home, Browse, Details, My listings, Edit, Sell, `ListingsStatus` and `DeleteListing`.

### Component styling

External CSS files, with design tokens as CSS variables: a global `styles.css` plus `cards.css`, `details.css`, `delete.css` and `activity.css`, imported by the components that use them. Fonts (Barlow Condensed and IBM Plex Sans) come from Google Fonts, and layouts are responsive with CSS grid and flexbox.

---

## 10. Typical User Flow

1. A visitor opens the home page, picks Toyota → Corolla → 2015 in the finder and searches for "brake disc".
2. The catalog shows matching parts. They filter by condition and price, and open a listing to see its photos and fitment.
3. They click "Log in to contact seller", sign up, and are returned to the same listing. They reveal the seller's email, like the listing and leave a comment.
4. They click "Sell an item", fill in the form with photos and publish it, then see it under My listings, where they can edit or delete it.

---

## 11. Error & Edge Case Handling

- **Authentication errors:** wrong credentials, an existing email or weak password show the message in the form (`role="alert"`); the button is disabled while the request runs. Guests that open a private URL are redirected to `/login` and back afterwards.
- **Network or data errors:** if listings fail to load, a message with a "Try again" button is shown instead of the page. The same applies to comments and likes. Failed saves, deletes, likes and comments show a clear message and keep the user's input, and no raw errors reach the screen.
- **Empty or missing data:** "No offers yet", "Nothing matches these filters", "You have no listings yet" and "No comments yet" states; a "Listing not found" panel for unknown or foreign `id`s; a 404 page for unknown routes; and a placeholder instead of a photo when a listing has none.

---

## Getting started

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in your project URL and anon (publishable) key. Never use the `service_role` key in the app.
3. In Supabase → SQL Editor, run in this order: `supabase/schema.sql`, `supabase/add_images.sql`, `supabase/interactions.sql`.
4. `npm run dev` to start, `npm run build` for production, `npm run lint` to check the code.

## Project structure

```
src/
  main.jsx            entry: BrowserRouter + AppProviders
  App.jsx             route table and guards
  store.jsx           Auth and Listings contexts (all listing API calls)
  supabase.js         Supabase client
  data.js             lookup lists (makes, categories, conditions) and fitment helpers
  components/         Header, Finder, ListingCard, ListingsStatus,
                      ContactSeller, DeleteListing, Activity
  pages/              Home, Browse, Details, Auth, Sell, EditListing, MyListings, NotFound
  views/              GuestView, LoggedUserView (route guards)
  hooks/              useActivity
  *.css               styles.css, cards.css, details.css, delete.css, activity.css
supabase/             schema.sql, add_images.sql, interactions.sql
vercel.json           rewrites every path to index.html (deep links on refresh)
```

## Security notes

The UI hides actions a user can't perform, but the database is the real protection. Row Level Security lets anyone read, and lets only the owner insert, update or delete their own rows. Seller emails live in `profiles`, which only logged-in users can read, and users can only upload to or delete from their own folder in Storage. The key in the front end is Supabase's publishable key, which is designed to be public.

## Deployment

Deployed on Vercel with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set as environment variables (redeploy after changing them). In Supabase → Authentication → URL Configuration, the Site URL is the live address and it is also listed in the Redirect URLs.
