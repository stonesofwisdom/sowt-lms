import React from "react";
import logo from "../assets/logo.png";
import { C } from "../theme";

export function Logo({ height = 34 }) {
  return <img src={logo} alt="Stones of Wisdom Tutors" style={{ height }} />;
}
export function Header({ eyebrow, title }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: C.red }}>{eyebrow}</div>
      <h1 className="mt-1 text-2xl md:text-3xl font-extrabold tracking-tight">{title}</h1>
    </div>
  );
}
export function Spinner({ light }) {
  return <span className="inline-block h-4 w-4 rounded-full border-2 animate-spin" style={{ borderColor: light ? "rgba(255,255,255,.5)" : "rgba(99,102,241,.4)", borderTopColor: light ? "#fff" : C.blue }} />;
}
export function Loading() {
  return <div className="fade-in grid place-items-center py-20" style={{ color: C.muted }}><Spinner /><div className="mt-3 text-sm">Loading…</div></div>;
}
