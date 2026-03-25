export default function PostCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 sm:p-4 animate-pulse">
      <div className="flex gap-3">
        <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 mb-2">
            <div className="h-4 w-14 bg-gray-100 dark:bg-gray-800 rounded-md" />
            <div className="h-4 w-10 bg-gray-100 dark:bg-gray-800 rounded-md" />
          </div>
          <div className="h-4 w-4/5 bg-gray-100 dark:bg-gray-800 rounded mb-1.5" />
          <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded mb-1" />
          <div className="h-3 w-2/3 bg-gray-100 dark:bg-gray-800 rounded mb-3" />
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 rounded-full" />
            <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded ml-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function PostListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  )
}
