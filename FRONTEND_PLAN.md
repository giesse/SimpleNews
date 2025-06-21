# Plan: Frontend Development for Personalized News Aggregator

This document outlines the plan for developing the frontend of the News Aggregator application. The primary goal is to create a user-friendly interface that displays personalized news articles, allows user interaction, and leverages the capabilities of the backend services.

## 1. Core Principles

*   **User-Centric Design**: Prioritize a clean, intuitive, and responsive user experience.
*   **Modularity**: Develop reusable React components for UI elements to ensure consistency and maintainability.
*   **Performance**: Optimize for fast loading times and smooth interactions, leveraging Next.js features like server-side rendering (SSR) or static site generation (SSG) where appropriate.
*   **Type Safety**: Utilize TypeScript to catch errors early, improve code quality, and enhance developer experience.
*   **Accessibility**: Ensure the application is accessible to users with diverse needs.

## 2. Key Features

The frontend will support the following core functionalities:

*   **Article Display**: Show a list of news articles, including their title, summary, and categories.
*   **Personalization Input**: Allow users to define and refine their "interest prompt" to personalize their news feed.
*   **User Interactions**: Enable users to "like" or "dislike" articles, and potentially ask questions about specific articles.
*   **Navigation**: Implement clear navigation to different sections (e.g., home feed, settings).

## 3. Technology Stack

*   **Framework**: Next.js (React)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS (already installed and configured for rapid development and utility-first approach)
*   **State Management**: React Context API or a lightweight library (e.g., Zustand, Jotai) for global state.
*   **Data Fetching**: `fetch` API or a library like `SWR` / `React Query` for efficient data fetching and caching.
*   **Testing**: Jest and React Testing Library (already configured).

## 4. Architecture

The frontend will be a Next.js application interacting with the FastAPI backend via HTTP API calls.

```mermaid
graph TD
    subgraph Frontend
        A[Next.js UI Components]
        B[Pages/Routes]
        C[API Client (Data Fetching)]
    end

    subgraph Backend
        D[FastAPI API Server]
    end

    A -- Renders --> B
    B -- Calls --> C
    C -- HTTP API Calls --> D
    D -- Returns JSON Data --> C
    C -- Provides Data To --> B
    B -- Passes Data To --> A
```

**Component Interaction Flow:**

1.  **User Request**: A user navigates to a page (e.g., `/`).
2.  **Page Component**: The Next.js page component (e.g., `src/app/page.tsx`) initiates data fetching.
3.  **API Client**: An API client (e.g., a utility function or hook) makes an HTTP GET request to the FastAPI backend (e.g., `/articles`).
4.  **Backend Response**: The FastAPI server processes the request, fetches data from the database, and returns JSON data (e.g., a list of articles).
5.  **Data Display**: The API client receives the JSON data, and the Next.js page component renders the `UI Components` to display the articles.
6.  **User Interaction**: When a user interacts (e.g., clicks "like"), the UI component triggers an API call (e.g., a POST request to `/articles/{id}/like`) via the API client.

## 5. Implementation Steps

The frontend development will proceed in phases:

### Phase 1: Basic Setup and Article Display

1.  **Confirm Boilerplate**: Verify the existing Next.js boilerplate and ensure Jest/React Testing Library are correctly configured.
2.  **Global Styles**: Define basic global styles (e.g., `src/app/globals.css`) and integrate a styling framework (e.g., Tailwind CSS).
3.  **API Client**: Create a simple API client (e.g., `src/lib/api.ts`) to handle HTTP requests to the backend.
4.  **Article List Page**:
    *   Create a page component (e.g., `src/app/page.tsx`) to fetch and display a list of articles from the backend.
    *   Design and implement a reusable `ArticleCard` component to display individual article details (title, summary, categories).
    *   Implement basic error handling and loading states.

### Phase 2: User Interaction and Personalization

1.  **Interest Prompt Input**:
    *   Create a UI component (e.g., `src/components/InterestPromptForm.tsx`) for users to input and update their interest prompt.
    *   Integrate this component into a dedicated settings page or a prominent section of the home page.
    *   Implement API calls to send the prompt to the backend.
2.  **Like/Dislike Functionality**:
    *   Add "like" and "dislike" buttons to the `ArticleCard` component.
    *   Implement API calls to record user interactions with the backend.
    *   Provide visual feedback for user interactions.

### Phase 3: Advanced Features (Future Considerations)

*   **Search/Filter**: Implement functionality to search articles by keywords or filter by categories.
*   **Pagination/Infinite Scroll**: Optimize article loading for large datasets.
*   **User Authentication**: Integrate user login/registration if required.
*   **Real-time Updates**: Explore WebSockets for instant updates on new articles.

## 6. Testing Strategy

*   **Unit Tests**: Use Jest to test individual functions and small, isolated components (e.g., utility functions, pure components).
*   **Component Tests**: Use React Testing Library to test React components, focusing on user interactions and rendered output, ensuring they behave as expected.
*   **Integration Tests**: Test the interaction between components and the API client to ensure data flows correctly.
*   **End-to-End Tests**: (Future consideration) Use tools like Playwright or Cypress for full user flow testing.

## 7. Styling Framework

**Tailwind CSS** has been chosen and is already installed and configured. It provides a utility-first approach that allows for highly customizable designs directly in the JSX, reducing the need for separate CSS files and promoting component-level styling.

*   **Usage**: Apply utility classes directly to components.