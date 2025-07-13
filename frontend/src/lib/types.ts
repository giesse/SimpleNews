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

export interface Category {
  id: number;
  name: string;
}

export interface Article {
  id: number;
  url: string;
  title: string;
  summary: string;
  created_at: string;
  categories: Category[];
  read?: boolean;
  interest_score?: number;
}

export interface Source {
  id: number;
  name: string;
  url: string;
  scraper_type?: string;
  last_scraped_at: string | null;
}