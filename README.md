
# SaudiMart - B2B E-commerce Platform

SaudiMart is a modern B2B e-commerce platform designed to connect buyers and sellers in Saudi Arabia. It's built with Next.js, React, ShadCN UI components, Tailwind CSS, and Genkit for AI-powered features.

## Key Features Implemented (Frontend Structure)

### 1. Core Platform
- **Landing Page:** Engaging hero section, category showcases, feature highlights, and testimonials.
- **Product Discovery:**
    - **Product Listing Page:** With comprehensive filtering (category, price, MOQ, availability, ratings) and sorting options.
    - **Product Detail Page:** Detailed product information, image carousel, specifications, variant selection, and options to send inquiries or add to a quote cart.
- **Quote Cart:** Allows users to add products for quotation, update quantities, remove items, and submit a quote request. Includes MOQ alerts.

### 2. Authentication
- **User Login:** Secure login for buyers and sellers.
- **User Signup:** Separate registration flows for buyers and sellers, including role selection.
- **Forgot Password:** Functionality for users to reset their passwords via email.

### 3. Buyer Dashboard
- **Dashboard Overview:** Summary of key activities.
- **My Enquiries:** Track sent enquiries and their statuses.
- **My Addresses:** Manage multiple shipping addresses.
- **Notifications:** View important updates and messages.
- *Placeholders for: My Orders, Saved Products, Quote Requests.*

### 4. Seller Dashboard
- **Dashboard Overview:** Key metrics and quick actions for sellers.
- **Manage Enquiries:** View and (soon) respond to buyer enquiries.
- **AI-Powered Enquiry Response:** Tool to automatically generate responses to common buyer questions.
- **Warehouse Management:** Manage warehouse locations.
- **Shipping Settings:** Configure shipping methods and preferences.
- **Notifications:** Stay updated on new enquiries, orders, etc.
- *Placeholders for: Product Management, Order Management, Analytics.*

### 5. Admin Panel
- **Central Dashboard:** Overview of platform activity.
- **User Management:** Approve and manage buyer and seller accounts.
- **Category Management:** Add, edit, and organize product categories.
- **Product Moderation:** Review and approve/reject product listings.
- **Enquiry & Quote Monitoring:** Oversee communication flow.
- **Reports Dashboard:** View key platform metrics (sales, users, etc.).

### 6. UI & General
- **Responsive Design:** Adapts to various screen sizes.
- **Light/Dark Mode:** Theme toggle for user preference.
- **Toast Notifications:** In-app alerts for important actions.
- **Consistent UI/UX:** Built with ShadCN UI components and Tailwind CSS, following defined design tokens (Poppins for headlines, PT Sans for body, specific color scheme).

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
