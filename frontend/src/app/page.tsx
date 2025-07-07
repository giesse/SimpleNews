import ArticleList from '@/components/ArticleList';

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Personalized News Feed</h1>
        <a href="/sources" className="text-blue-500 hover:underline">Edit Sources</a>
      </div>
      <ArticleList />
    </main>
  );
}
