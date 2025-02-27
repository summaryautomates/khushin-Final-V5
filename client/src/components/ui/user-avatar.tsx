import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface UserAvatarProps {
  user?: {
    name?: string
  }
  className?: string
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  const fallbackLetter = user?.name?.charAt(0) || "U"

  return (
    <Avatar className={className}>
      <div className="w-full h-full bg-[#FF0000] rounded-full flex items-center justify-center p-2">
        {/* Simple lighter shape */}
        <div className="w-[40%] h-[75%] bg-[#E60000] rounded-[1px] relative">
          {/* Top cap */}
          <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-[70%] h-[3px] bg-[#E60000] rounded-[1px]" />
        </div>
      </div>
      <AvatarFallback className="bg-red-100 text-red-600">
        {fallbackLetter}
      </AvatarFallback>
    </Avatar>
  )
}