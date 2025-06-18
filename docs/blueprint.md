# **App Name**: SaudiMart

## Core Features:

- Landing Page: Landing page with hero section, dynamic category grid (with featured products), platform feature highlights, buyer & seller benefits, testimonials & success stories, and a footer with company info, links, contact info, and social links.
- Authentication: Authentication pages including Login (with role toggle: buyer/seller), Signup (Buyer/Seller switch, mobile/email verification), Forgot Password (Email/OTP reset), and optional 2FA (OTP-based for high-value accounts).
- Dashboard: Dashboard pages for buyers (My Orders, Saved Products, Enquiries (Sent/Responded), Quote Requests, Notifications (New messages, responses)) and sellers (Product Manager (Add/Edit/Delete Products), View & Respond to Enquiries, Manage Orders (Status updates, Shipment info), Analytics: Product views, enquiry count).
- Product Pages: Product listing page with filters (Category, Price, MOQ, Availability, Ratings) and sort by options (Relevance, Popularity, Price). Product detail page including images (Carousel), specifications, variants, Inquiry Button and Add to Cart (for quotation/cart purposes).
- Cart Page (Quote Cart): Cart page to add, remove, and update quantity.  Submit Quote / Inquiry Flow instead of direct payment. Includes Estimated Delivery Dates and MOQ alerts.
- Enquiry & Quote Management: System for buyers to send detailed enquiry per product/cart and sellers to respond with pricing, lead time, etc.  Includes a quote approval flow where the buyer receives and approves quotes before finalizing, with an option to negotiate. Optional Quote PDF Export.
- Automated Enquiry Response (AI): Generative AI powered tool that uses Gemini / Genkit / OpenAI to generate replies based on product specs, answer FAQs (MOQ, lead time, usage), and suggest similar products.
- Payments Module: Integration with regional payment gateway (e.g. PayTabs, HyperPay).  Supports multiple currencies (SAR, USD), invoice generation, and order status tracking (Paid, Awaiting, Cancelled).
- Address & Shipping Management: Buyer address book (multiple addresses), Seller warehouse management, preferred delivery time, contact details and Shipping method selection (Pickup/Third-party logistics).
- Admin Panel: Admin panel for User Management (Buyer/Seller approvals), Category & Sub-category Management, Product Moderation, Enquiry & Quote Monitoring and Reports Dashboard (Sales, Active users, etc.).
- Theme Toggle: Toggle between light and dark mode and store user preference in local storage or DB.
- UI & Design Tokens: Grid-based layout with 16px base spacing, rounded corners (2xl), and soft shadows.
- Notification System: In-app toasts, notification center (new quotes, messages) and optional push notifications (Web + Email).

## Style Guidelines:

- Primary color: Deep Blue or Emerald.
- Accent color: Gold/Yellow for CTA buttons.
- Light/Dark Modes with Tailwind’s dark: modifier.
- Headline font: Poppins.
- Body font: PT Sans.
- Icons: Lucide / HeroIcons / Tabler Icons.
- Animation: Framer Motion for transitions.