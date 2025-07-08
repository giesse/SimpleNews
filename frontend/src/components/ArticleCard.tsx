'use client';

import { useState } from 'react';
import { Article } from '@/lib/types';
import { markArticleAsRead } from '@/lib/api';

interface ArticleCardProps {
  article: Article;
  isRead?: boolean;
  onReadStatusChange?: (isRead: boolean) => void;
}

export default function ArticleCard({ article, isRead = false, onReadStatusChange }: ArticleCardProps) {
  // Format the date more nicely
  const formattedDate = new Date(article.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const toggleReadStatus = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (onReadStatusChange) {
      const newReadStatus = !isRead;
      
      // Update local state immediately for responsive UI
      onReadStatusChange(newReadStatus);
      
      try {
        setIsUpdating(true);
        // Call API to persist the change
        await markArticleAsRead(article.id, newReadStatus);
      } catch (error) {
        console.error('Failed to update read status:', error);
        // Revert the UI state if the API call fails
        onReadStatusChange(isRead);
        alert('Failed to update article status. Please try again.');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <div className={`
      bg-white border rounded-lg shadow-sm p-5 mb-4 transition-all duration-200
      ${isRead ? 'opacity-75' : 'opacity-100'}
    `}>
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-xl font-bold text-gray-800 mb-2 flex-grow">{article.title}</h2>
        <button
          onClick={toggleReadStatus}
          disabled={isUpdating}
          className={`
            ml-3 px-3 py-1 rounded-full text-xs font-medium transition-colors
            ${isUpdating ? 'bg-gray-100 text-gray-400 cursor-wait' :
              isRead
                ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }
          `}
        >
          {isUpdating ? 'Updating...' : isRead ? 'Mark Unread' : 'Mark Read'}
        </button>
      </div>

      {/* Summary section */}
      {article.summary && (
        <p className="text-gray-600 mb-4 leading-relaxed">{article.summary}</p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-3 border-t border-gray-100">
        {/* Date and category tags */}
        <div className="flex flex-wrap items-center mb-2 sm:mb-0">
          <span className="text-sm text-gray-500 mr-3">
            {formattedDate}
          </span>
          
          <div className="flex flex-wrap" data-testid="category-container">
            {article.categories && article.categories.map((category) => (
              <span
                key={category.id}
                className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700 mr-2 mb-2"
              >
                {category.name}
              </span>
            ))}
          </div>
        </div>

        {/* Link to original article */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm mt-2 sm:mt-0"
          style={{ display: 'inline-flex', alignItems: 'center' }}
        >
          Read Original
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="article-external-link-icon h-4 w-4 ml-1"
            style={{ height: '1rem !important', width: '1rem !important', minWidth: '1rem !important', maxWidth: '1rem !important', flexShrink: 0 }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
            />
          </svg>
        </a>
      </div>
    </div>
  );
}