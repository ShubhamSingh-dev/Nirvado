import React from "react"

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return <main className="flex h-screen w-screen items-center justify-center bg-zinc-800">{children}</main>
}

export default AuthLayout