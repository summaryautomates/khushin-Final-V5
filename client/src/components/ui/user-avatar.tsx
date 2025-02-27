import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "@/types"
import { useState } from "react"

interface UserAvatarProps {
  user?: {
    name?: string
    image?: string
  }
  className?: string
  useLighter?: boolean
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false)
  const fallbackLetter = user?.name?.charAt(0) || "U"

  return (
    <Avatar className={className}>
      {!imageError && (
        <AvatarImage 
          src="/lighter-icon.svg"
          alt="Lighter Icon" 
          onError={() => setImageError(true)}
          className="bg-[#FF0000]" 
        />
      )}
      <AvatarFallback className="bg-red-100 text-red-600">
        {fallbackLetter}
      </AvatarFallback>
    </Avatar>
  )
}