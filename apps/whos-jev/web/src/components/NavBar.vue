<script setup lang="ts">
import { visual } from "../lib/store";
import { theme, toggleTheme } from "../lib/theme";
</script>

<template>
  <nav class="nav">
    <RouterLink class="brand" to="/"><span>Who's <b>Jev</b>?</span></RouterLink>
    <span class="spacer"></span>
    <RouterLink class="navlink" to="/jev">What is Jev</RouterLink>
    <label class="toggle" :class="{ on: visual }">
      <input v-model="visual" type="checkbox" />
      <span class="track"><span class="knob"></span></span>
      <span class="toggle-text">Visual</span>
    </label>
    <button class="theme-btn" type="button" :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleTheme">
      <svg v-if="theme === 'dark'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </button>
  </nav>
</template>
