import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Article, Category, Source } from '@/lib/types';
import { ScrapeJob } from '@/lib/api';

// Test data factories
export function createTestArticle(overrides = {}): Article {
  return {
    id: 1,
    title: 'Test Article Title',
    url: 'https://example.com/article',
    summary: 'This is a test summary of the article content.',
    created_at: '2025-06-01T12:00:00Z',
    categories: [
      { id: 1, name: 'Technology' },
      { id: 2, name: 'News' }
    ],
    ...overrides
  };
}

export function createTestSource(overrides = {}): Source {
  return {
    id: 1,
    name: 'Test Source',
    url: 'https://example.com',
    last_scraped_at: null,
    ...overrides
  };
}

export function createTestCategory(overrides = {}): Category {
  return {
    id: 1,
    name: 'Technology',
    ...overrides
  };
}

export function createTestScrapeJob(overrides = {}): ScrapeJob {
  return {
    id: 'job-123',
    status: 'in_progress',
    progress: 0.5,
    message: 'Scraping in progress',
    created_at: '2025-06-01T12:00:00Z',
    ...overrides
  };
}

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };