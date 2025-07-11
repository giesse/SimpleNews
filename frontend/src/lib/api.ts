import { Article, Source } from './types';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function fetcher<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, options);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'An error occurred while fetching data.');
  }

  return response.json();
}

// Articles API
export function getArticles(filters?: { 
  category_id?: number | string; 
  read?: boolean;
  min_score?: number;
}): Promise<Article[]> {
  let url = '/articles/';
  
  if (filters) {
    const params = new URLSearchParams();
    if (filters.category_id) params.append('category_id', filters.category_id.toString());
    if (filters.read !== undefined) params.append('read', filters.read.toString());
    if (filters.min_score !== undefined) params.append('min_score', filters.min_score.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  return fetcher<Article[]>(url);
}

// Note: The backend would need to implement this endpoint
export function markArticleAsRead(id: number, isRead: boolean): Promise<Article> {
  return fetcher<Article>(`/articles/${id}/read-status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ read: isRead }),
  });
}

export function getInterestPrompt(): Promise<{ interest_prompt: string }> {
  return fetcher<{ interest_prompt: string }>('/settings/interest_prompt');
}

export function updateInterestPrompt(prompt: string): Promise<{ interest_prompt: string, message: string }> {
  return fetcher<{ interest_prompt: string, message: string }>('/settings/interest_prompt', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ interest_prompt: prompt }),
  });
}

export function recalculateAllArticleScores(): Promise<{ job_id: string; message: string }> {
  return fetcher<{ job_id: string; message: string }>('/articles/recalculate-scores', {
    method: 'POST',
  });
}

// Sources API
export function getSources(): Promise<Source[]> {
  return fetcher<Source[]>('/sources/');
}

export function createSource(data: { 
  name: string; 
  url: string; 
  scraper_type: string, 
  config: { article_link_selector: string } 
}): Promise<Source> {
  return fetcher<Source>('/sources/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function updateSource(id: number, data: { 
  name?: string; 
  url?: string, 
  scraper_type?: string, 
  config?: { article_link_selector: string } 
}): Promise<Source> {
  return fetcher<Source>(`/sources/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function deleteSource(id: number): Promise<Source> {
  return fetcher<Source>(`/sources/${id}`, {
    method: 'DELETE',
  });
}

// Scraping API
export interface ScrapeJob {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'canceled';
  progress: number;
  message: string;
  total_sources: number;
  processed_sources: number;
  total_articles: number;
  processed_articles: number;
  eta_seconds: number;
}

export function scrapeSource(id: number): Promise<{ job_id: string; message: string }> {
  return fetcher<{ job_id: string; message: string }>(`/sources/${id}/scrape`, {
    method: 'POST',
  });
}

export function getScrapeJobStatus(jobId: string): Promise<ScrapeJob> {
  return fetcher<ScrapeJob>(`/sources/scrape/status/${jobId}`);
}

export function scrapeAllSources(): Promise<{ job_id: string; message: string }> {
  return fetcher<{ job_id: string; message: string }>(`/sources/scrape`, {
    method: 'POST',
  });
}

export function cancelScrapeJob(jobId: string): Promise<{ message: string }> {
  return fetcher<{ message: string }>(`/sources/scrape/cancel/${jobId}`, {
    method: 'POST',
  });
}

export function autodetectSelector(name: string, url: string): Promise<{ selector: string }> {
  return fetcher<{ selector: string }>('/sources/autodetect-selector', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, url }),
  });
}

// Categories API
export function getCategories(): Promise<{ id: number; name: string }[]> {
  return fetcher<{ id: number; name: string }[]>('/categories/');
}
