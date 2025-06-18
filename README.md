
# SaudiMart - B2B E-commerce Platform

SaudiMart is a modern B2B e-commerce platform designed to connect buyers and sellers in Saudi Arabia. It's built with Next.js, React, ShadCN UI components, Tailwind CSS, and Genkit for AI-powered features.

## Key Features Implemented (Frontend Structure)

### 1. Core Platform
- **Landing Page:** Engaging hero section, category showcases, feature highlights, testimonials, and an advertisement banner.
- **Product Discovery:**
    - **Product Listing Page:** With comprehensive filtering (category, price, MOQ, availability, ratings) and sorting options.
    - **Product Detail Page:** Detailed product information, image carousel, specifications, variant selection, and options to send inquiries or add to a quote cart.
- **Quote Cart:** Allows users to add products for quotation, update quantities, remove items, and submit a quote request. Includes MOQ alerts.

### 2. Authentication
- **User Login:** Secure login for buyers and sellers.
- **User Signup:** Separate registration flows for buyers and sellers, including role selection.
- **Forgot Password:** Functionality for users to reset their passwords via email.

### 3. Buyer Dashboard
- **Dashboard Overview:** Summary of key activities and quick links.
- **My Enquiries:** Track sent enquiries and their statuses (list view).
- **My Addresses:** Manage multiple shipping addresses (placeholder UI).
- **Notifications:** View important updates and messages (placeholder list).
- *Placeholders for: My Orders, Saved Products, Quote Requests.*

### 4. Seller Dashboard
- **Dashboard Overview:** Key metrics and quick actions for sellers.
- **Manage Enquiries:** View received enquiries (list view).
- **AI-Powered Enquiry Response:** Tool to automatically generate responses to common buyer questions (Genkit flow implemented).
- **Warehouse Management:** Manage warehouse locations (placeholder UI).
- **Shipping Settings:** Configure shipping methods and preferences (placeholder UI).
- **Notifications:** Stay updated on new enquiries, orders, etc. (placeholder list).
- *Placeholders for: Product Management, Order Management, Analytics.*

### 5. Admin Panel
- **Central Dashboard:** Overview of platform activity.
- **User Management:** Approve and manage buyer and seller accounts (placeholder list & actions).
- **Category Management:** Add, edit, and organize product categories (placeholder list & actions).
- **Product Moderation:** Review and approve/reject product listings (placeholder list & actions).
- **Enquiry & Quote Monitoring:** Oversee communication flow (placeholder list & actions).
- **Reports Dashboard:** View key platform metrics (placeholder UI for sales, users, etc.).

### 6. UI & General
- **Responsive Design:** Adapts to various screen sizes.
- **Light/Dark Mode:** Theme toggle for user preference, saved in local storage.
- **Toast Notifications:** In-app alerts for important actions.
- **Consistent UI/UX:** Built with ShadCN UI components and Tailwind CSS, following defined design tokens (Poppins for headlines, PT Sans for body, specific color scheme).
- **Global Padding:** Consistent container padding for a less "tight" feel.

## Tech Stack
- **Framework:** Next.js (App Router)
- **UI Library:** React
- **Component Library:** ShadCN UI
- **Styling:** Tailwind CSS
- **AI Integration:** Genkit (for Google AI models)
- **Language:** TypeScript

## Getting Started

### Prerequisites
- Node.js (version 18.x or later recommended)
- npm or yarn

### Installation & Running Locally
1.  **Clone the repository (if applicable):**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add any necessary environment variables (e.g., API keys for Genkit/Google AI if you're using them actively).
    ```
    # .env.local
    GOOGLE_API_KEY=your_google_api_key_here
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    This will start the Next.js development server, typically on `http://localhost:9002`.

5.  **Run Genkit (for AI features, in a separate terminal):**
    ```bash
    npm run genkit:dev
    # or
    yarn genkit:dev
    ```
    This starts the Genkit development server, usually on port 3100, allowing your AI flows to be called.

### Building for Production
```bash
npm run build
npm run start
# or
yarn build
yarn start
```

## Project Structure (Simplified)
- `src/app/`: Main application routes (using Next.js App Router).
    - `(auth)/`: Authentication-related pages.
    - `(buyer)/dashboard/`: Buyer-specific dashboard pages.
    - `(seller)/dashboard/`: Seller-specific dashboard pages.
    - `(admin)/`: Admin panel pages.
    - `products/`: Product listing and detail pages.
    - `cart/`: Quote cart page.
- `src/components/`: Reusable UI components.
    - `layout/`: Header, Footer, etc.
    - `landing/`: Components for the landing page.
    - `products/`: Product card, etc.
    - `features/`: Feature-specific components (e.g., AI forms).
    - `ui/`: ShadCN UI components.
- `src/ai/`: Genkit AI flows and configuration.
    - `flows/`: Specific AI task flows.
- `src/lib/`: Utility functions, type definitions.
- `src/hooks/`: Custom React hooks.
- `public/`: Static assets.
- `tailwind.config.ts`: Tailwind CSS configuration.
- `next.config.ts`: Next.js configuration.
- `globals.css`: Global styles and Tailwind directives.

## Future Development / Next Steps

The following areas represent the next logical steps for further development, focusing on frontend gaps and deeper functionality:

### Enquiry & Quote Management (Deeper Dive)
-   **Detailed Enquiry Views:** UI for a buyer to see a specific enquiry and any seller responses.
-   **Seller Response UI:** A form/modal for sellers to respond to specific enquiries (e.g., add pricing, lead time, messages).
-   **Quote Approval Flow:**
    -   UI for buyers to receive, review, and approve/reject quotes.
    -   UI for sellers to track quote statuses.
-   **Negotiation UI:** How buyers and sellers might communicate back and forth on a quote/enquiry (could be a messaging interface within the enquiry/quote view).
-   **Quote PDF Export (Button):** A button in the UI to trigger a PDF export (the actual PDF generation would likely be a backend task).

### Deeper Functionality for Existing Dashboard Placeholders
-   **Buyer Dashboard:** Implementing the UI for "My Orders," "Saved Products," "Quote Requests."
-   **Seller Dashboard:** Implementing the UI for "Product Management" (e.g., add/edit product forms, list of products), "Manage Orders," "Analytics."
-   **Admin Panel:** Making the "Approve," "Edit," "Delete," "Add New" functionalities interactive (likely opening modals or new pages/forms).

### Search & Filtering (Advanced Logic)
-   Implementing the actual search logic for the product search bar.
-   Making the filters on the product listing page fully functional beyond the current dummy filtering.

### Responsiveness & Accessibility (Continuous Refinement)
-   While Tailwind helps, a dedicated pass to test and refine responsiveness on various devices and ensure accessibility best practices are met would be beneficial.

### Backend Integration & Data Persistence (Implied)
-   This is a major step. Currently, most data is dummy data. Connecting all these frontend UIs to a real backend to fetch, create, update, and delete data (users, products, enquiries, orders, etc.) is crucial for a working application.
