
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
  
  // Get the first letter of the user's name
  const fallbackLetter = user?.name?.charAt(0) || "U"
  
  return (
    <Avatar className={className}>
      {!imageError && (useLighter ? (
        <AvatarImage 
          src="/images/lighter-icon.png" 
          alt="Lighter Icon" 
          onError={() => setImageError(true)} 
        />
      ) : user?.image ? (
        <AvatarImage 
          src={user.image} 
          alt={user.name || "User"} 
          onError={() => setImageError(true)} 
        />
      ) : null)}
      <AvatarFallback>{fallbackLetter}</AvatarFallback>
    </Avatar>
  )
}
