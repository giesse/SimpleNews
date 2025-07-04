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
}

export interface Source {
  id: number;
  name: string;
  url: string;
  last_scraped_at: string | null;
}