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
export function getArticles(): Promise<Article[]> {
  return fetcher<Article[]>('/articles/');
}

export function getSources(): Promise<Source[]> {
  return fetcher<Source[]>('/sources/');
}

export function createSource(data: { name: string; url: string }): Promise<Source> {
  return fetcher<Source>('/sources/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function updateSource(id: number, data: { name?: string; url?: string }): Promise<Source> {
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

export function scrapeSource(id: number): Promise<{ message: string }> {
  return fetcher<{ message: string }>(`/sources/${id}/scrape`, {
    method: 'POST',
  });
}

export function scrapeAllSources(): Promise<{ message: string }> {
  return fetcher<{ message: string }>(`/sources/scrape`, {
    method: 'POST',
  });
}