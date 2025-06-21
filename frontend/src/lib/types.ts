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