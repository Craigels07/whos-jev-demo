import { ref } from "vue";

export type Theme = "light" | "dark";

/** Same key and rule as the inline script in index.html, which sets data-theme before first paint. */
const KEY = "whosjev.theme";

/** The inline script already resolved the theme; read it back so both agree, even when storage is blocked. */
function initial(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export const theme = ref<Theme>(initial());

export function toggleTheme(): void {
  theme.value = theme.value === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = theme.value;
  try {
    localStorage.setItem(KEY, theme.value);
  } catch {
    /* storage blocked: the toggle still works for this page */
  }
}

export const heroSrc = (slug: string): string => `/heroes/${slug}${theme.value === "dark" ? "-dark" : ""}.svg`;
