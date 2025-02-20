import { Skeleton } from "@/components/ui/skeleton"

export function ProductSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton variant="rectangular" className="h-[200px] w-full" />
      <Skeleton variant="text" className="w-2/3" />
      <Skeleton variant="text" className="w-1/2" />
      <div className="flex items-center gap-4 mt-4">
        <Skeleton variant="circular" className="h-10 w-10" />
        <Skeleton variant="text" className="w-24" />
      </div>
    </div>
  )
}
