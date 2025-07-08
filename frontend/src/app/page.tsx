'use client';

import { useState } from 'react';
import ArticleList from '@/components/ArticleList';
import SourcesModal from '@/components/SourcesModal';

export default function Home() {
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Personalized News Feed</h1>
        <button 
          onClick={() => setIsSourcesModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Manage Sources
        </button>
      </div>
      
      <ArticleList />
      
      <SourcesModal 
        isOpen={isSourcesModalOpen} 
        onClose={() => setIsSourcesModalOpen(false)} 
      />
    </main>
  );
}
