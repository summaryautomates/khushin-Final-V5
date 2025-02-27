import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User } from "@/types"

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
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{
          backgroundColor: '#FF0000',
          borderRadius: '50%'
        }}
      >
        <div 
          className="h-[70%] w-[30%] relative"
          style={{
            backgroundColor: '#FF0000',
            borderRadius: '1px'
          }}
        >
          {/* Lighter body shadow effect */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.1) 100%)'
            }}
          />
          {/* Cap part */}
          <div 
            className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-[60%] h-[2px] rounded-sm"
            style={{
              backgroundColor: '#E60000'
            }}
          />
        </div>
      </div>
      <AvatarFallback className="bg-red-100 text-red-600">
        {fallbackLetter}
      </AvatarFallback>
    </Avatar>
  )
}