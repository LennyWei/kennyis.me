export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
      <main className="flex flex-col items-center gap-6 text-center px-6">
        <h1 className="text-5xl font-bold tracking-tight text-black dark:text-white">
          Kenny Liang
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400">
          Portfolio coming soon...
        </p>
        <div className="mt-4 h-1 w-16 bg-zinc-900 dark:bg-zinc-100" />
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          Work in progress
        </p>
      </main>
    </div>
  );
}
