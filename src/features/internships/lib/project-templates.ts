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
];

export function getProjectTemplate(key: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find((t) => t.key === key);
}
