"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navGroups } from "@cloaka/shared";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar-surface flex h-full min-h-[760px] w-full flex-col rounded-[30px] p-4 text-white lg:max-w-[300px]">
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
        <div className="text-xs uppercase tracking-[0.18em] text-white/55">Cloaka</div>
        <div className="mt-3 font-[family-name:var(--font-heading)] text-3xl leading-none">
          Payments, made calm.
        </div>
        <p className="mt-3 text-sm leading-6 text-white/68">
          Built for Nigerian SMEs that need trust, speed, and cleaner payment operations.
        </p>
      </div>

      <div className="mt-5 flex-1 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
              {group.label}
            </div>
            <div className="mt-2 space-y-1.5">
              {group.items.map((item) => {
                const active =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-[22px] px-3 py-3 transition ${
                      active
                        ? "bg-white text-[var(--color-sidebar)]"
                        : "bg-white/[0.02] text-white/78 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold">{item.label}</span>
                      {item.badge ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                            active
                              ? "bg-[rgba(37,99,235,0.1)] text-[var(--color-blue)]"
                              : "bg-white/10 text-white/70"
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </div>
                    <p
                      className={`mt-1 text-xs leading-5 ${
                        active ? "text-slate-600" : "text-white/52"
                      }`}
                    >
                      {item.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
