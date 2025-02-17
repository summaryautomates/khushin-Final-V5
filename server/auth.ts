
import { Auth } from "@auth/core"
import Google from "@auth/core/providers/google"
import type { AuthConfig } from "@auth/core/types"

export const authConfig: AuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub
      }
      return session
    },
  },
}

export const authHandler = Auth(authConfig)
