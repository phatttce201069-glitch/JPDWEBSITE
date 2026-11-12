import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { bindStudySync } from "@/lib/study/sync";
import { useStudy } from "@/lib/study/store";

const LINKS = [
  { to: "/kana" as const, label: "Chữ" },
  { to: "/words" as const, label: "Từ" },
  { to: "/grammar" as const, label: "Ngữ pháp" },
  { to: "/reading" as const, label: "Đọc" },
  { to: "/exam" as const, label: "Đề" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const navKey = useRouterState({
    select: (state) => {
      const search = new URLSearchParams(state.location.searchStr);
      search.delete("at");
      return `${state.location.pathname}?${search.toString()}`;
    },
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [navKey]);

  useEffect(() => {
    if (import.meta.env.DEV) return bindStudySync();
    void Promise.resolve(useStudy.persist.rehydrate()).then(() => {
      useStudy.getState().setHydrated(true);
    });
  }, []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-5">
          <Link to="/" className="display shrink-0 text-2xl tracking-tight text-ink">
            Sumi
          </Link>
          <nav className="flex items-center gap-0.5 overflow-x-auto no-scrollbar" aria-label="Mục học">
            {LINKS.map((link) => {
              const active = path === link.to || path.startsWith(`${link.to}/`);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={
                    active
                      ? "rounded-md bg-ink px-2 py-2 text-xs font-medium whitespace-nowrap text-paper sm:px-3 sm:text-sm"
                      : "rounded-md px-2 py-2 text-xs font-medium whitespace-nowrap text-stone hover:text-ink sm:px-3 sm:text-sm"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 py-6 pb-36 sm:px-5 sm:py-8">{children}</main>
    </div>
  );
}
