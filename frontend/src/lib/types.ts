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