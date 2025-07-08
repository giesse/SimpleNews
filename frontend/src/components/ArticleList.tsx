'use client';

import { useEffect, useState, useMemo } from 'react';
import { getArticles } from '@/lib/api';
import { Article, Category } from '@/lib/types';
import ArticleCard from './ArticleCard';
import LoadingIndicator from './LoadingIndicator';

// Create a component for the filter bar
function FilterBar({
  categories,
  selectedCategory,
  onCategoryChange,
  showReadArticles,
  onShowReadChange,
}: {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  showReadArticles: boolean;
  onShowReadChange: (show: boolean) => void;
}) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
      {/* Category filter */}
      <div className="flex-1">
        <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id.toString()}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Read/Unread filter */}
      <div className="flex-1">
        <label htmlFor="read-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Article Status
        </label>
        <select
          id="read-filter"
          value={showReadArticles ? 'all' : 'unread'}
          onChange={(e) => onShowReadChange(e.target.value === 'all')}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="all">Show All</option>
          <option value="unread">Unread Only</option>
        </select>
      </div>
    </div>
  );
}

export default function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [readArticleIds, setReadArticleIds] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showReadArticles, setShowReadArticles] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract unique categories from all articles
  const allCategories = useMemo(() => {
    const categoriesMap = new Map<number, Category>();
    
    articles.forEach(article => {
      if (article.categories) {
        article.categories.forEach(category => {
          categoriesMap.set(category.id, category);
        });
      }
    });
    
    return Array.from(categoriesMap.values());
  }, [articles]);

  // Handle marking an article as read/unread
  const handleReadStatusChange = (articleId: number, isRead: boolean) => {
    setReadArticleIds(prev => {
      const newSet = new Set(prev);
      if (isRead) {
        newSet.add(articleId);
      } else {
        newSet.delete(articleId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    async function loadArticles() {
      try {
        setLoading(true);
        
        // Use the API with server-side filtering
        const data = await getArticles({
          category_id: selectedCategory || undefined,
          read: showReadArticles ? undefined : false,
        });
        
        setArticles(data);
        
        // Update read status in local state based on server data
        const newReadArticleIds = new Set<number>();
        data.forEach(article => {
          if (article.read) {
            newReadArticleIds.add(article.id);
          }
        });
        setReadArticleIds(newReadArticleIds);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    }
    
    loadArticles();
    // Re-fetch when filters change or when coming back to the component
  }, [selectedCategory, showReadArticles]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingIndicator size="large" message="Loading your personalized news feed..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md my-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading articles</h3>
            <div className="mt-1 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="bg-white border rounded-lg p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No articles found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adding some news sources to get started with your personalized feed.
        </p>
      </div>
    );
  }

  return (
    <div>
      <FilterBar
        categories={allCategories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        showReadArticles={showReadArticles}
        onShowReadChange={setShowReadArticles}
      />

      {articles.length === 0 ? (
        <div className="bg-gray-50 border rounded-lg p-6 text-center">
          <p className="text-gray-600">No articles match your current filters.</p>
          <button 
            onClick={() => {
              setSelectedCategory('');
              setShowReadArticles(true);
            }}
            className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <ArticleCard 
              key={article.id} 
              article={article} 
              isRead={readArticleIds.has(article.id)}
              onReadStatusChange={(isRead) => handleReadStatusChange(article.id, isRead)}
            />
          ))}
        </div>
      )}
    </div>
  );
}