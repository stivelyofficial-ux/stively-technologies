/**
 * Ready-made internship projects an admin can assign to a track in one
 * click (instead of retyping the brief and the task list every time). Plain
 * data - no server-only imports - so scripts and server actions can share it.
 *
 * Tasks carry no deadlines: interns work at their own pace and the only
 * deadline is the end date of their internship. Admins add optional
 * "add-on feature" tasks on top of a project from the admin track page.
 */
export interface ProjectTemplateTask {
  title: string;
  description: string;
}

export interface ProjectTemplateDetails {
  client: string;
  role: string;
  reportsTo: string;
  stipend: string;
  stack: string[];
}

export interface ProjectTemplate {
  key: string;
  title: string;
  /** Short description shown on the project card. */
  brief: string;
  /** The full requirements, shown behind "Full project brief". */
  instructions: string;
  details: ProjectTemplateDetails;
  tasks: ProjectTemplateTask[];
}

const STIVELYSHOP_BRIEF =
  "Build a fast, responsive storefront for a fashion brand: home page, product listing with search, filters and sorting, product detail, cart and checkout - powered by a public REST API and deployed on Vercel. A production-style app, not a collection of static pages.";

const STIVELYSHOP_REQUIREMENTS = `Core user flow
Home -> Product Listing -> Search / Filter / Sort -> Product Details -> Add to Cart -> Cart -> Checkout -> Order Confirmation.

Required features
1. Home page: hero section, featured products, categories, best sellers, promotional section, responsive navbar, mobile navigation, footer.
2. Product listing (products come from an API, never hardcoded): product cards, search, category filter, price filter, rating filter, sort by price and rating, pagination or load-more, loading / empty / error states.
3. Product details: image, name, price, discount, rating, description, sizes/variants, quantity selector, add to cart, related products.
4. Cart (real state): add/remove, increase/decrease quantity, subtotal, discount, delivery charge, final total, empty-cart state, persists after a page refresh.
5. Checkout (no real payment gateway): name, email, phone, address, city, state, pincode, order summary, payment-method selection, validation, then an "Order Successfully Placed" screen with an order ID.
6. Responsive design on mobile, tablet and desktop - mandatory.
7. React architecture: reusable components (ProductCard, Button, Input, Modal), React Router, proper state management, custom hooks where appropriate, a clean folder structure, no giant single component.
8. API integration (public/mock REST API): GET products, GET product/:id, GET categories - handle loading, success, empty, error and retry.

Real-developer requirements
- Git workflow: GitHub repository with meaningful commits and feature branches (feature/home-page, feature/product-listing, feature/product-details, feature/cart, feature/checkout), merged through Pull Requests.
- Performance: optimised images, lazy loading where appropriate, avoid unnecessary re-renders, check Lighthouse.
- Accessibility: semantic HTML, proper labels, keyboard-accessible controls, alt text, visible focus states, reasonable colour contrast.

Final deliverables
- GitHub repository (README.md, src/, public/, package.json).
- Live deployment on Vercel or Netlify.
- README with: overview, features, tech stack, install steps, API used, screenshots, live demo, repository link, challenges faced, future improvements.
- A 5-10 minute demo video: architecture, components, state management, API integration, cart logic, bugs you hit and how you solved them.

There are no per-task submissions: build at your own pace, then submit the finished project once under "Final submission".`;

const RESTAURANT_BRIEF =
  "Kesar Kitchen, a family restaurant in Jaipur, takes most of its bookings over the phone and has no website. Build them a modern restaurant website with the menu, food photos, prices and contact details, plus a WhatsApp reservation flow, and a simple admin dashboard where the owner manages menu items, updates prices, tracks orders and views revenue. Deployed on Vercel.";

const RESTAURANT_REQUIREMENTS = `About the client
Kesar Kitchen is a 60-seat multi-cuisine family restaurant in Jaipur. The owner takes reservations and orders over the phone and wants to be found online, show the menu with real prices, and take table requests on WhatsApp. They also want one place to update the menu and see how the day is going. You are the frontend developer; the owner and staff are not technical, so everything must be clear and easy.

Part 1 - Customer website
1. Home: hero with the restaurant name, a short tagline, "Reserve on WhatsApp" and "View menu" buttons, today's opening hours, signature dishes, a short about section, customer reviews and a footer with address, phone and map link.
2. Menu page: categories (starters, mains, breads, rice, desserts, drinks), dish cards with image, name, description, price, veg / non-veg marker and a "chef's special" badge. Category tabs, a search box and a veg-only filter. Prices and dishes come from your menu data, not hardcoded into the markup.
3. Gallery: food and restaurant photos in a responsive grid with a lightbox.
4. WhatsApp reservations: a reservation form (name, phone, date, time, number of guests, special request) with validation. On submit, open WhatsApp with a ready-made message to the restaurant's number (wa.me link) summarising the booking. Add a floating WhatsApp button on every page.
5. Contact: phone, address, opening hours, embedded map and a click-to-call button.
6. Responsive on mobile, tablet and desktop. Most customers will open this from a phone.

Part 2 - Admin dashboard (staff only)
1. Login screen (simple demo login, no real backend).
2. Menu management: list, add, edit and delete menu items (name, category, price, description, image URL, veg / non-veg, available / sold out). Changes must appear on the customer menu page.
3. Price updates: edit a price inline; show the old and new price in a confirmation message.
4. Orders: a table of orders with order ID, items, total, status (New, Preparing, Ready, Delivered, Cancelled), time and customer name. Change status from a dropdown, filter by status and search by order ID or customer.
5. Revenue: cards for today's revenue, this week, this month and total orders, plus a simple chart of revenue by day and a list of the best-selling dishes. All numbers are calculated from the orders data, never typed in.
6. Empty, loading and error states, and a confirmation before deleting anything.

Data and state
- There is no real backend. Use a mock data file for the menu and orders, and persist changes in localStorage so menu edits, price changes and order status updates survive a refresh. Write the data layer so a real API could replace it later.
- Keep the data realistic and consistent: the same dishes and prices on the website, the orders and the revenue figures.

Real-developer requirements
- Architecture: React with reusable components (MenuCard, CategoryTabs, ReservationForm, DataTable, StatCard, Modal, Button), routing for the public site and the dashboard, custom hooks for data and localStorage, a clean folder structure, no giant single component.
- Git workflow: a GitHub repository with meaningful commits and feature branches (feature/home, feature/menu, feature/reservation, feature/admin-menu, feature/admin-orders, feature/admin-revenue), merged through Pull Requests.
- Performance: optimised images, lazy loading below the fold, a good Lighthouse score.
- Accessibility: semantic HTML, labelled form fields, keyboard-accessible controls, alt text, visible focus states and readable contrast.

Final deliverables
- GitHub repository with src/, public/, package.json and a clear README.
- Live deployment on Vercel.
- README with overview, features, tech stack, install steps, screenshots, live demo link, repository link, challenges faced and future improvements.
- A 5-10 minute demo video: the customer website, a WhatsApp reservation, then the dashboard (edit a menu item, change a price, update an order, show revenue), and the bugs you hit and how you fixed them.
There are no per-task submissions: build at your own pace, then submit the finished project once under "Final submission".`;

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    key: "stivelyshop-frontend",
    title: "StivelyShop - E-commerce Frontend",
    brief: STIVELYSHOP_BRIEF,
    instructions: STIVELYSHOP_REQUIREMENTS,
    details: {
      client: "StivelyShop (Fashion / Lifestyle e-commerce)",
      role: "Frontend Developer Intern",
      reportsTo: "Project Lead, Stively",
      stipend: "₹3,000 on successful delivery",
      stack: ["React.js", "JavaScript", "Tailwind CSS", "REST API", "Git / GitHub", "Vercel"],
    },
    tasks: [
      {
        title: "Project setup",
        description:
          "React project, GitHub repository, folder structure, routing, basic layout and a first README.",
      },
      {
        title: "Home page",
        description:
          "Responsive navbar with mobile navigation, hero section, categories, featured products, best sellers, promotional section and footer.",
      },
      {
        title: "Product listing",
        description:
          "API integration, reusable product cards, search, category / price / rating filters, sorting, pagination or load-more, and loading / empty / error states.",
      },
      {
        title: "Product details",
        description:
          "Dynamic product route with image, price, discount, rating, description, sizes/variants, quantity selector, add to cart and related products.",
      },
      {
        title: "Cart",
        description:
          "Real cart state: add/remove, quantity updates, subtotal, discount, delivery charge, final total, empty state and persistence after refresh.",
      },
      {
        title: "Checkout",
        description:
          "Checkout form with validation, order summary, payment-method selection, place order, and an order confirmation screen with an order ID.",
      },
      {
        title: "QA and polish",
        description:
          "Test on mobile, tablet and desktop, a broken API, empty results, empty cart, invalid form, refresh and navigation. Fix what you find.",
      },
      {
        title: "Deployment and documentation",
        description:
          "Production deployment, finished README with screenshots, GitHub cleanup, Lighthouse report and your demo video.",
      },
    ],
  },
  {
    key: "restaurant-website-dashboard",
    title: "Kesar Kitchen - Restaurant Website & Admin Dashboard",
    brief: RESTAURANT_BRIEF,
    instructions: RESTAURANT_REQUIREMENTS,
    details: {
      client: "Kesar Kitchen (Family restaurant, Jaipur)",
      role: "Frontend Developer Intern",
      reportsTo: "Project Lead, Stively",
      stipend: "₹3,000 on successful delivery",
      stack: ["HTML", "CSS", "JavaScript", "React.js", "Git / GitHub", "Vercel"],
    },
    tasks: [
      {
        title: "Project setup",
        description:
          "React project, GitHub repository, folder structure, routing for the public site and the dashboard, the mock menu and orders data, and a first README.",
      },
      {
        title: "Design system and layout",
        description:
          "Colours, fonts and spacing for a warm restaurant brand, reusable Button, Card and Input components, responsive navbar with mobile menu, and footer.",
      },
      {
        title: "Home page",
        description:
          "Hero with Reserve on WhatsApp and View menu buttons, opening hours, signature dishes, about section, customer reviews and address footer.",
      },
      {
        title: "Menu page",
        description:
          "Dish cards with image, price, description and veg / non-veg marker, category tabs, search and a veg-only filter, all driven by the menu data.",
      },
      {
        title: "Gallery and contact",
        description:
          "Responsive photo gallery with a lightbox, and a contact page with phone, address, hours, embedded map and a click-to-call button.",
      },
      {
        title: "WhatsApp reservations",
        description:
          "Reservation form with validation that opens WhatsApp with a ready-made booking message, plus a floating WhatsApp button on every page.",
      },
      {
        title: "Dashboard login and layout",
        description:
          "Demo login screen, protected dashboard routes, sidebar and top bar, and a clean dashboard layout that works on tablet and desktop.",
      },
      {
        title: "Menu management",
        description:
          "List, add, edit and delete menu items with category, price, image, veg / non-veg and available / sold out. Changes must show on the customer menu.",
      },
      {
        title: "Price updates",
        description:
          "Inline price editing with validation and a confirmation message showing the old and new price, saved so it survives a refresh.",
      },
      {
        title: "Order tracking",
        description:
          "Orders table with status dropdown (New, Preparing, Ready, Delivered, Cancelled), filter by status, search by order ID or customer, and an order details view.",
      },
      {
        title: "Revenue dashboard",
        description:
          "Today, week and month revenue cards, total orders, a revenue-by-day chart and best-selling dishes, all calculated from the orders data.",
      },
      {
        title: "Data persistence and states",
        description:
          "localStorage persistence behind a small data layer, plus loading, empty, error and delete-confirmation states across the site and dashboard.",
      },
      {
        title: "Responsive design and accessibility",
        description:
          "Test and fix mobile, tablet and desktop. Semantic HTML, labelled forms, keyboard navigation, visible focus states, alt text and readable contrast.",
      },
      {
        title: "QA and polish",
        description:
          "Test every page and flow: empty menu, invalid reservation, refresh after edits, long dish names, small screens. Fix what you find and check Lighthouse.",
      },
      {
        title: "Deployment and documentation",
        description:
          "Production deployment on Vercel, finished README with screenshots, GitHub cleanup with merged pull requests, and your demo video.",
      },
    ],
  },
];

export function getProjectTemplate(key: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find((t) => t.key === key);
}
