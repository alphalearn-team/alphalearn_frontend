"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface NotFoundProps {
  title?: string
  subtitle?: string
}

export default function NotFound({
  title = "404. That's Awkward.",
  subtitle = "We couldn't find this page. Maybe it teleported. Maybe it never existed. Who knows.",
}: NotFoundProps) {
  const router = useRouter()

  useEffect(() => {
    const lockClass = "not-found-lock-scroll"

    // prevent scrolling and restore on cleanup
    document.body.classList.add(lockClass)
    document.documentElement.classList.add(lockClass)

    return () => {
      document.body.classList.remove(lockClass)
      document.documentElement.classList.remove(lockClass)
    }
  }, [])
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[var(--color-background)] via-[var(--color-surface)] to-[var(--color-background)] relative overflow-hidden">
      {/* animated bg */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-[var(--color-primary)] opacity-5 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-[var(--color-accent)] opacity-5 blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full bg-[var(--color-primary)] opacity-3 blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative z-10 max-w-md w-full text-center">
        {/* animated icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* icon */}
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[var(--color-primary)] flex items-center justify-center bg-[var(--color-surface)] shadow-lg hover:shadow-xl transition-shadow duration-300"
              style={{
                boxShadow: `0 0 20px var(--color-primary)30, 0 0 40px var(--color-primary)15`
              }}>
              <span className="material-symbols-outlined text-5xl md:text-6xl text-[var(--color-primary)]"
                style={{
                  animation: "float 3s ease-in-out infinite"
                }}>
                help_outline
              </span>
            </div>

            {/* animated ring */}
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--color-accent)] border-r-[var(--color-accent)]"
              style={{
                animation: "spin 4s linear infinite"
              }}></div>
          </div>
        </div>

        {/* title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--color-text)]">
          {title}
        </h1>

        {/* subtitle */}
        <p className="text-base md:text-lg text-[var(--color-text-secondary)] mb-8 leading-relaxed">
          {subtitle}
        </p>

        {/* action btns */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
          {/* back */}
          <button
            onClick={() => router.back()}
            className="px-6 md:px-8 py-3 md:py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-200 border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white active:scale-95 cursor-pointer"
          >
            Go Back
          </button>

          {/* return home */}
          <Link
            href="/"
            className="px-6 md:px-8 py-3 md:py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-200 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white hover:shadow-lg hover:shadow-[var(--color-primary)]30 active:scale-95 inline-block"
          >
            Return Home
          </Link>
        </div>

        {/* footer text */}
        <p className="text-xs md:text-sm text-[var(--color-text-muted)] mt-8 opacity-75">
          Status: Confused | Pro tip: Maybe try refreshing?
        </p>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
