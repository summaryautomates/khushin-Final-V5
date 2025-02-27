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

export function UserAvatar({ user, className, useLighter = false }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false)

  // Get the first letter of the user's name for fallback
  const fallbackLetter = user?.name?.charAt(0) || "U"

  return (
    <Avatar className={className}>
      {!imageError && (useLighter || !user?.image) ? (
        <AvatarImage 
          src="/lighter-icon.png"  // Using the default lighter icon
          alt="Lighter Icon" 
          onError={() => setImageError(true)} 
          className="object-contain p-1 bg-gradient-to-br from-orange-400/80 to-orange-600/80"
        />
      ) : user?.image ? (
        <AvatarImage 
          src={user.image} 
          alt={user.name || "User"} 
          onError={() => setImageError(true)} 
        />
      ) : null}
      <AvatarFallback className="bg-orange-500/20 text-orange-600">
        {fallbackLetter}
      </AvatarFallback>
    </Avatar>
  )
}