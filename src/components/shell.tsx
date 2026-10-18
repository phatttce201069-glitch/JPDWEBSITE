import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { bindStudySync } from "@/lib/study/sync";
import { useStudy } from "@/lib/study/store";

const LINKS = [
  { to: "/kana" as const, label: "Chữ", search: { script: "hiragana" as const, row: "", mode: "chart" as const, at: 0 } },
  { to: "/words" as const, label: "Từ", search: { lesson: "", mode: "list" as const, at: 0 } },
  { to: "/grammar" as const, label: "Ngữ pháp", search: { lesson: "", point: "", drill: false } },
  { to: "/exam" as const, label: "Đề", search: { course: "" as const, bai: "" } },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    if (import.meta.env.DEV) return bindStudySync();
    void Promise.resolve(useStudy.persist.rehydrate()).then(() => {
      useStudy.getState().setHydrated(true);
    });
  }, []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4 sm:px-5">
          <Link to="/" className="display shrink-0 text-2xl tracking-tight text-ink">
            Sumi
          </Link>
          <nav className="flex items-center gap-0.5" aria-label="Mục học">
            {LINKS.map((link) => {
              const active = path === link.to || path.startsWith(`${link.to}/`);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  search={link.search}
                  className={
                    active
                      ? "rounded-md bg-ink px-2 py-2 text-sm font-medium whitespace-nowrap text-paper sm:px-3"
                      : "rounded-md px-2 py-2 text-sm font-medium whitespace-nowrap text-stone hover:text-ink sm:px-3"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-5 py-8 pb-36">{children}</main>
    </div>
  );
}
