import ArticleList from '@/components/ArticleList';

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Personalized News Feed</h1>
      <ArticleList />
    </main>
  );
}
