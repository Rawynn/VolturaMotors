# Voltura Motors – Projekt Frontendowy

Interaktywna strona prezentująca gamę modeli samochodów Voltura Motors.  
Zbudowana w **HTML5, SCSS, Bootstrap 5, JavaScript (ESM)**.



## Demo (lokalne)

Uruchom po prostu `index.html` w przeglądarce  
lub użyj lokalnego serwera typu **Live Server**, **http-server**, **Vite preview**.



## Wymagania systemowe

- Node.js **18+** (zalecane **20 LTS**)
- npm **9+**



## Instalacja

W katalogu projektu uruchom:

```bash
npm install
```



## Kompilacja SCSS → CSS
Tryb watch:
```bash
npm run sass
```
Build produkcyjny:
```bash
npm run sass:build
```

Plik wynikowy znajduje się w:
```bash
dist/css/main.css
```



## Lintery

#### ESLint (JavaScript)
Sprawdzenie:
```bash
npm run lint:js
```

Automatyczna naprawa:
```bash
npm run lint:js:fix
```

#

#### Stylelint (SCSS)
Sprawdzenie:
```bash
npm run lint:styles
```

Automatyczna naprawa:
```bash
npm run lint:styles:fix
```

#

#### Całość (JS + SCSS):
```bash
npm run lint
```

## Layout i UX

- Max szerokość contentu: 1200px

- Max szerokość modalu: 1120px

- Odstępy między sekcjami: 40px

- Tła sekcji full width, content ograniczony kontenerem

- Komponentowa struktura SCSS (zgodnie z dobrymi praktykami)

- A11y:

  - aria-labels

  - aria-expanded

  - role="radio"

  - aria-live dla komunikatów

  - Semantyczne tagi HTML5
