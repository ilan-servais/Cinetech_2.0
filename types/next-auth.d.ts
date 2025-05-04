import NextAuth from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id. */
      id: string
      /** The user's name. */
      name?: string | null
      /** The user's email address. */
      email?: string | null
      /** The user's image. */
      image?: string | null
      /** The user's username. */
      username?: string
      /** The user's display name. */
      displayName?: string
    }
  }
}
