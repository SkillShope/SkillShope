"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export function Logo({
  className,
  width = 180,
  height = 58,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const html = document.documentElement;
    const update = () => {
      const attr = html.getAttribute("data-theme");
      const stored = localStorage.getItem("roughinhub-theme");
      setTheme(attr || stored || "dark");
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return (
    <Image
      src={theme === "light" ? "/logo-light.png" : "/logo-dark.png"}
      alt="RoughInHub"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
