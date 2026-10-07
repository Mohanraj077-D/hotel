# TAJ Hotel App - Frontend

This is the frontend for the TAJ Hotel booking application, built with modern web technologies including React 19 and Vite. It provides a beautiful, user-friendly interface for browsing luxury hotels, making bookings, and managing the hotel collection.

## Technologies Used

- **React 19**: Frontend UI library for building component-driven interfaces.
- **Vite**: Lightning-fast frontend build tool and development server.
- **React Router DOM**: Client-side routing for navigating between pages without reloading.
- **React Helmet Async**: Document head manager for dynamically changing the page title and meta descriptions.
- **CSS**: Custom styling with a focus on modern, premium aesthetics (gold accents, smooth animations, and responsive design).

## Features

- **Explore Collection**: Browse through a curated list of luxury hotels with interactive price sliders and search filters.
- **Booking Flow**: Detailed hotel pages with room selection, date picking, and a seamless booking form.
- **Manage Bookings**: Easily look up an existing booking using a booking ID or phone number, with the ability to cancel reservations.
- **Collection Studio (Admin)**: Add new hotels to the collection, upload hotel images, and delete or edit existing hotel details.

## Getting Started

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Installation
Navigate to the `frondend` directory and install the required dependencies:
```bash
cd frondend
npm install
```

### 3. Environment Setup (Optional)
By default, the Vite server proxies API requests to `http://localhost:5000` where the backend runs. If your backend is hosted elsewhere, you can configure the `VITE_API_URL` environment variable.

### 4. Run the Development Server
Start the frontend development server:
```bash
npm run dev
```
The app will automatically open in your default browser at `http://localhost:5173` (or another available port).

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Starts the local development server.
- `npm run build`: Bundles the app for production into the `dist` folder.
- `npm run preview`: Previews the built production app locally.
- `npm run lint`: Runs ESLint to find and fix code quality issues.
