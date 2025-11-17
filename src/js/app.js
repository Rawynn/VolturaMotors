// app.js
// Logika strony Voltura – vanilla JS (ESM)

const selectors = {
  carsList: document.querySelector("#cars-list"),
  carsEmptyState: document.querySelector("#cars-empty-state"),
  filtersForm: document.querySelector(".voltura-cars__filters"),
  filterButton: document.querySelector("#filter-submit"),
  modalElement: document.querySelector("#carDetailsModal"),
  modalTitle: document.querySelector("#carDetailsTitle"),
  modalGallery: document.querySelector("#modal-gallery"),
  modalVersions: document.querySelector("#modal-versions"),
  modalColors: document.querySelector("#modal-colors"),
  modalAddons: document.querySelector("#modal-addons"),
  modalPrice: document.querySelector("#modal-price"),
  modalFeatures: document.querySelector("#modal-features"),
  modalFindSales: document.querySelector("#modal-find-sales"),
  modalFindDealer: document.querySelector("#modal-find-dealer"),
};

const state = {
  cars: [],
  filteredCars: [],
  activeCar: null,
  activeConfig: {
    versionId: null,
    colorId: null,
    addons: new Set(),
  },
};

let modalInstance = null;

document.addEventListener("DOMContentLoaded", async () => {
  await loadCars();
  setupFiltering();
  setupModal();
});

// ------------------
// Ładowanie danych
// ------------------

async function loadCars() {
  try {
    // ważne: index.html jest w root, więc JSON jest w ./src/...
    const response = await fetch("./src/assets/data/cars.json");
    state.cars = await response.json();
    state.filteredCars = [...state.cars];
    renderCars();
  } catch (error) {
    console.error("Błąd podczas ładowania danych samochodów:", error);
    selectors.carsEmptyState.textContent =
      "Nie udało się załadować danych samochodów.";
    selectors.carsEmptyState.hidden = false;
  }
}

// ------------------
// FILTROWANIE
// ------------------

function setupFiltering() {
  const { filtersForm, filterButton } = selectors;

  filtersForm.addEventListener("change", applyFilters);
  filterButton.addEventListener("click", applyFilters);
}

function applyFilters(event) {
  event?.preventDefault();

  const formData = new FormData(selectors.filtersForm);
  const bodyType = formData.get("bodyType") || "";
  const drivetrain = formData.get("drivetrain") || "";
  const priceMin = Number(formData.get("priceMin") || 0);
  const priceMax = Number(formData.get("priceMax") || Number.MAX_SAFE_INTEGER);

  state.filteredCars = state.cars.filter((car) => {
    const matchesBody =
      !bodyType || car.bodyType.toLowerCase() === bodyType.toLowerCase();
    const matchesDrive =
      !drivetrain || car.drivetrain.toLowerCase() === drivetrain.toLowerCase();

    const price = car.basePrice;
    const matchesPrice = price >= priceMin && price <= priceMax;

    return matchesBody && matchesDrive && matchesPrice;
  });

  renderCars();
}

// ------------------
// LISTA KART
// ------------------

function renderCars() {
  const { carsList, carsEmptyState } = selectors;

  carsList.innerHTML = "";

  if (!state.filteredCars.length) {
    carsEmptyState.hidden = false;
    return;
  }

  carsEmptyState.hidden = true;

  const fragment = document.createDocumentFragment();

  state.filteredCars.forEach((car) => {
    const card = createCarCard(car);
    fragment.appendChild(card);
  });

  carsList.appendChild(fragment);
}

function createCarCard(car) {
  const card = document.createElement("article");
  card.className = "car-card";
  card.setAttribute("aria-label", `Samochód ${car.name}`);

  const imageWrapper = document.createElement("div");
  imageWrapper.className = "car-card__image-wrapper";

  const img = document.createElement("img");
  img.src = car.heroImage; // heroImage TYLKO do kart
  img.alt = `Samochód ${car.name}`;
  imageWrapper.appendChild(img);

  const body = document.createElement("div");
  body.className = "car-card__body";

  const title = document.createElement("h3");
  title.className = "car-card__title";
  title.textContent = car.name;

  const price = document.createElement("p");
  price.className = "car-card__price";
  price.textContent = `od ${formatPrice(car.basePrice)} zł`;

  const meta = document.createElement("p");
  meta.className = "car-card__meta mb-0";
  meta.textContent = `${car.drivetrain} • ${car.rangeKm}km range`;

  const button = document.createElement("button");
  button.type = "button";
  button.className =
    "voltura__btn voltura__btn--primary voltura__btn--extra-small car-card__cta";
  button.textContent = "Sprawdź";
  button.setAttribute("aria-label", `Sprawdź szczegóły modelu ${car.name}`);
  button.addEventListener("click", () => openCarModal(car));

  body.append(title, price, meta, button);
  card.append(imageWrapper, body);

  return card;
}

// ------------------
// MODAL
// ------------------

function setupModal() {
  modalInstance = new bootstrap.Modal(selectors.modalElement);

  selectors.modalFindSales.addEventListener("click", () =>
    handleSaveConfiguration("sales-points")
  );
  selectors.modalFindDealer.addEventListener("click", () =>
    handleSaveConfiguration("dealer")
  );
}

function openCarModal(car) {
  state.activeCar = {
    ...car,
    gallery: [...car.gallery],
  };

  state.activeConfig = {
    versionId: car.versions[0]?.id ?? null,
    colorId: car.colors[0]?.id ?? null,
    addons: new Set(),
  };

  renderModalContent();

  renderGallery();

  modalInstance.show();
}

function renderModalContent() {
  const { modalTitle, modalVersions, modalColors, modalAddons, modalFeatures } =
    selectors;

  if (!state.activeCar) {
    return;
  }

  const car = state.activeCar;

  modalTitle.textContent = `${car.name} - Szczegóły modelu`;

  // WERSJE
  modalVersions.innerHTML = "";
  car.versions.forEach((version) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "voltura__btn voltura__btn--small";
    btn.textContent = version.label;
    btn.dataset.versionId = version.id;

    const isActive = version.id === state.activeConfig.versionId;
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    if (isActive) {
      btn.classList.add("active");
    }

    btn.addEventListener("click", () => {
      state.activeConfig.versionId = version.id;
      renderModalContent();
    });

    modalVersions.appendChild(btn);
  });

  // KOLORY
  modalColors.innerHTML = "";
  car.colors.forEach((color) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "voltura-modal__color-swatch position-relative";
    btn.style.backgroundColor = color.hex;
    btn.dataset.colorId = color.id;

    const isSelected = color.id === state.activeConfig.colorId;
    btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
    if (isSelected) {
      btn.classList.add("is-selected");
    }

    const hiddenLabel = document.createElement("span");
    hiddenLabel.textContent = color.label;
    btn.appendChild(hiddenLabel);

    btn.addEventListener("click", () => {
      state.activeConfig.colorId = color.id;
      renderModalContent();
    });

    modalColors.appendChild(btn);
  });

  // DODATKI
  modalAddons.innerHTML = "";
  car.addons.forEach((addon) => {
    const isSelected = state.activeConfig.addons.has(addon.id);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "voltura__btn voltura__btn--small";
    btn.dataset.addonId = addon.id;
    btn.textContent = addon.label;
    btn.setAttribute("aria-pressed", isSelected ? "true" : "false");

    if (isSelected) {
      btn.classList.add("active");
    }

    btn.addEventListener("click", () => {
      toggleAddon(addon.id);
      renderModalContent();
    });

    modalAddons.appendChild(btn);
  });

  // CECHY
  modalFeatures.innerHTML = "";
  car.features.forEach((feature) => {
    const dt = document.createElement("span");
    dt.className = "feature-label text-label text-gray";
    dt.textContent = feature.label;

    const dd = document.createElement("span");
    dd.className = "feature-value text-label";
    dd.textContent = feature.value;

    modalFeatures.append(dt, dd);
  });

  // CENA
  const price = calculateCurrentPrice();
  selectors.modalPrice.textContent = `${formatPrice(price)} zł`;
}

// ------------------
// GALERIA (main + miniatury)
// ------------------

function renderGallery() {
  const { modalGallery } = selectors;
  const car = state.activeCar;
  if (!car) return;

  modalGallery.innerHTML = "";

  car.gallery.forEach((src, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "voltura-modal__gallery-item";
    if (index === 0) {
      btn.classList.add("is-main"); // pierwszy – duży
    }

    const img = document.createElement("img");
    img.src = src;
    img.alt = `Zdjęcie modelu ${car.name}`;
    btn.appendChild(img);

    btn.addEventListener("click", () => {
      // jeśli klikamy już główny – nic nie rób
      if (btn.classList.contains("is-main")) return;

      // przesuń kliknięty element na początek kontenera
      modalGallery.prepend(btn);

      // pierwszy element w flexie = główne zdjęcie
      modalGallery
        .querySelectorAll(".voltura-modal__gallery-item")
        .forEach((item, idx) => {
          item.classList.toggle("is-main", idx === 0);
        });
    });

    modalGallery.appendChild(btn);
  });
}

// ------------------
// KONFIGURACJA – cena, dodatki
// ------------------

function toggleAddon(addonId) {
  if (state.activeConfig.addons.has(addonId)) {
    state.activeConfig.addons.delete(addonId);
  } else {
    state.activeConfig.addons.add(addonId);
  }
}

function calculateCurrentPrice() {
  const car = state.activeCar;
  if (!car) {
    return 0;
  }

  let price = car.basePrice;

  const version = car.versions.find(
    (v) => v.id === state.activeConfig.versionId
  );
  if (version) {
    price += version.priceDelta;
  }

  car.addons.forEach((addon) => {
    if (state.activeConfig.addons.has(addon.id)) {
      price += addon.priceDelta;
    }
  });

  return price;
}

// ------------------
// LocalStorage
// ------------------

const STORAGE_KEY = "volturaSelections";

/**
 * Zapisuje konfigurację do localStorage i loguje ją w konsoli.
 * @param {"sales-points" | "dealer"} source
 */
function handleSaveConfiguration(source) {
  if (!state.activeCar) {
    return;
  }

  const price = calculateCurrentPrice();
  const car = state.activeCar;

  const version =
    car.versions.find((v) => v.id === state.activeConfig.versionId) ?? null;
  const color =
    car.colors.find((c) => c.id === state.activeConfig.colorId) ?? null;

  const addons = car.addons.filter((addon) =>
    state.activeConfig.addons.has(addon.id)
  );

  const payload = {
    timestamp: new Date().toISOString(),
    source,
    modelId: car.id,
    modelName: car.name,
    version: version
      ? { id: version.id, label: version.label }
      : { id: null, label: null },
    color: color
      ? { id: color.id, label: color.label }
      : { id: null, label: null },
    addons: addons.map((a) => ({ id: a.id, label: a.label })),
    price,
  };

  const existingRaw = localStorage.getItem(STORAGE_KEY);
  const existing = existingRaw ? JSON.parse(existingRaw) : [];

  existing.push(payload);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

  console.log("Zapisana konfiguracja Voltura:", payload);
  modalInstance.hide();
}

// ------------------
// HELPERY
// ------------------

function formatPrice(value) {
  return value.toLocaleString("pl-PL");
}
