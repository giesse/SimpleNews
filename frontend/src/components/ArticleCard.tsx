import { Article } from '@/lib/types';

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h2 className="text-xl font-bold mb-2">{article.title}</h2>
      <p className="text-gray-700 mb-4">{article.summary}</p>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {new Date(article.created_at).toLocaleDateString()}
        </div>
        <div className="flex">
          {article.categories && article.categories.map((category) => (
            <span
              key={category.id}
              className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2"
            >
              {category.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}