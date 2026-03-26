"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type Props = {
  width: number;
  height: number;
  className?: string;
  alt?: string;
};

export function Logo({ width, height, className, alt = "Skill Shope" }: Props) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const check = () => {
      const t = document.documentElement.getAttribute("data-theme");
      setTheme(t === "light" ? "light" : "dark");
    };
    check();

    // Watch for theme changes
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return (
    <Image
      src={theme === "light" ? "/logo-light.svg" : "/logo-dark.svg"}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}
