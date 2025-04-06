import { Skeleton } from "@/components/ui/skeleton"

export function ProductSkeleton() {
  return (
    <div className="w-full border border-zinc-800/50 rounded-lg overflow-hidden bg-gradient-to-b from-zinc-900 to-black">
      {/* Image area */}
      <Skeleton variant="rectangular" className="h-[300px] w-full" />
      
      {/* Content area */}
      <div className="p-7 space-y-5">
        {/* Rating */}
        <div className="flex justify-center gap-1.5">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((_, index) => (
              <Skeleton key={index} variant="circular" className="h-4 w-4" />
            ))}
          </div>
        </div>
        
        {/* Title */}
        <div className="flex flex-col items-center gap-2">
          <Skeleton variant="text" className="w-3/4 h-5 mx-auto" />
          <Skeleton variant="text" className="w-2/3 h-5 mx-auto" />
        </div>
        
        {/* Description */}
        <div className="flex flex-col items-center gap-1.5">
          <Skeleton variant="text" className="w-5/6 h-4 mx-auto" />
          <Skeleton variant="text" className="w-4/6 h-4 mx-auto" />
        </div>
        
        {/* Price */}
        <div className="flex flex-col items-center gap-2 pt-1">
          <Skeleton variant="text" className="w-16 h-3 mx-auto" />
          <Skeleton variant="text" className="w-24 h-6 mx-auto" />
        </div>
        
        {/* Add to cart button */}
        <div className="pt-5">
          <Skeleton variant="rectangular" className="h-14 w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}
