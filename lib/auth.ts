import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import { supabaseAdmin } from '@/lib/supabase'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false

      try {
        // Check if user exists in Supabase
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('id, plan')
          .eq('email', user.email)
          .single()

        if (!existingUser) {
          // Create new user
          const { error } = await supabaseAdmin.from('users').insert({
            email: user.email,
            name: user.name,
            auth_provider: account?.provider,
          })

          if (error) {
            console.error('Error creating user:', error)
            return false
          }
        }

        return true
      } catch (error) {
        console.error('SignIn callback error:', error)
        return false
      }
    },

    async jwt({ token, user }) {
      if (user?.email) {
        // Fetch user from Supabase to get id and plan
        const { data: dbUser } = await supabaseAdmin
          .from('users')
          .select('id, plan, status')
          .eq('email', user.email)
          .single()

        if (dbUser) {
          token.userId = dbUser.id
          token.plan = dbUser.plan
          token.status = dbUser.status
        }
      }
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string
        session.user.plan = token.plan as string
        session.user.status = token.status as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})

// Augment NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      plan: string
      status: string
    }
  }
}
