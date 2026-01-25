# Aurora Carousel Block (Gutenberg)

![WordPress](https://img.shields.io/badge/WordPress-6%2B-21759B?logo=wordpress&logoColor=white)
![Gutenberg](https://img.shields.io/badge/Gutenberg-Block%20Editor-0073AA?logo=wordpress&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-7.4%2B-777BB4?logo=php&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript&logoColor=000)
![CSS](https://img.shields.io/badge/CSS-3-1572B6?logo=css3&logoColor=white)

ZIP contains a ready-to-install WordPress plugin.

## English

### Features
- Autoplay (on/off) with delay configuration (ms)
- Animation speed (ms)
- Pause on hover (for autoplay)
- Loop (wrap-around)
- Prev/next arrows
- Pagination dots (clickable)
- Responsive settings per device (Mobile/Tablet/Desktop):
  - `slidesPerView`
  - `spaceBetween` (gap)

### Notes
- No build step required (no npm build). Pure JS/CSS + Gutenberg API.
- Slides are a child block: **Carousel Slide**.
- Each slide can contain any blocks.

### Installation
1. Upload the `aurora-carousel-block` folder to `/wp-content/plugins/`
2. Activate the plugin in the WP admin.
3. In Gutenberg, add the **Aurora Carousel** block.
4. Inside it, add **Carousel Slide** blocks and fill with any content blocks.

### Tests / Verification
- Block registers on `init` and loads: `assets/editor.js`, `assets/frontend.js`, `assets/style.css`, `assets/editor.css`
- Frontend initialization runs on `.wp-block-aurora-carousel` after `DOMContentLoaded`.
- Configuration is saved as `data-*` attributes on the block wrapper.

---

## Polski

### Funkcje
- Autoplay (włącz/wyłącz) + konfiguracja opóźnienia (ms)
- Prędkość animacji (ms)
- Pauza na hover (dla autoplay)
- Loop (zawijanie)
- Strzałki prev/next
- Kropki (pagination) + klikane
- Responsywność osobno dla Mobile/Tablet/Desktop:
  - `slidesPerView`
  - `spaceBetween` (odstęp)

### Ważne
- Nie wymaga budowania (brak npm build). Czysty JS/CSS + API Gutenberga.
- Slajdy są osobnym blokiem child: **Carousel Slide**.
- W każdym slajdzie możesz umieszczać dowolne bloki.

### Instalacja
1. Wgraj katalog `aurora-carousel-block` do `/wp-content/plugins/`
2. Aktywuj wtyczkę w panelu WP.
3. W edytorze Gutenberg dodaj blok **Aurora Carousel**.
4. W środku dodaj **Carousel Slide** i wypełnij dowolnymi blokami.

### Testy / kontrola działania
- Blok rejestruje się w `init` i ładuje: `assets/editor.js`, `assets/frontend.js`, `assets/style.css`, `assets/editor.css`
- Na froncie inicjalizacja jest wykonywana na `.wp-block-aurora-carousel` po `DOMContentLoaded`.
- Dane konfiguracyjne są zapisane jako `data-*` na wrapperze bloku.
