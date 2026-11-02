"use strict";

const bakeryProducts = [
  {
    id: "country-loaf",
    name: "Country Loaf",
    category: "Bread",
    price: "$6–$12"
  },
  {
    id: "multigrain",
    name: "Multigrain Bread",
    category: "Bread",
    price: "$6–$12"
  },
  {
    id: "croissants",
    name: "Croissants",
    category: "Pastry",
    price: "$3–$7 each"
  },
  {
    id: "cookies-muffins",
    name: "Cookies and Muffins",
    category: "Pastry",
    price: "$3–$7 each"
  },
  {
    id: "celebration-cake",
    name: "Celebration Cake",
    category: "Cake",
    price: "$30–$75+"
  },
  {
    id: "signature-loaf",
    name: "North Star Signature Loaf",
    category: "Bread",
    price: "Contact for availability"
  }
];

const FAVORITES_KEY = "northStarBakeryFavorites";

document.addEventListener("DOMContentLoaded", initializeWebsite);

function initializeWebsite() {
  initializeFavorites();
  initializeContactForm();
}

/* -----------------------------
   Favorites feature
----------------------------- */

function initializeFavorites() {
  const favoritesSection = document.querySelector("#favorites-section");

  if (!favoritesSection) {
    return;
  }

  const favoriteButtons = document.querySelectorAll(".favorite-btn");

  favoriteButtons.forEach(function (button) {
    button.addEventListener("click", handleFavoriteClick);
  });

  renderFavorites();
  updateFavoriteButtons();
}

function getSavedFavorites() {
  const savedData = localStorage.getItem(FAVORITES_KEY);

  if (!savedData) {
    return [];
  }

  try {
    const parsedData = JSON.parse(savedData);
    return Array.isArray(parsedData) ? parsedData : [];
  } catch (error) {
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function handleFavoriteClick(event) {
  const productId = event.currentTarget.dataset.productId;
  toggleFavorite(productId);
}

function toggleFavorite(productId) {
  const favorites = getSavedFavorites();
  const isAlreadySaved = favorites.includes(productId);

  let updatedFavorites;

  if (isAlreadySaved) {
    updatedFavorites = favorites.filter(function (id) {
      return id !== productId;
    });
  } else {
    updatedFavorites = [...favorites, productId];
  }

  saveFavorites(updatedFavorites);
  renderFavorites();
  updateFavoriteButtons();
}

function getFavoriteProducts() {
  const favoriteIds = getSavedFavorites();

  return bakeryProducts.filter(function (product) {
    return favoriteIds.includes(product.id);
  });
}

function renderFavorites() {
  const favoriteList = document.querySelector("#favorite-list");
  const favoriteCount = document.querySelector("#favorite-count");
  const emptyMessage = document.querySelector("#favorites-empty");
  const clearButton = document.querySelector("#clear-favorites");

  if (!favoriteList || !favoriteCount || !emptyMessage) {
    return;
  }

  const favoriteProducts = getFavoriteProducts();

  favoriteList.innerHTML = "";
  favoriteCount.textContent = favoriteProducts.length;

  if (favoriteProducts.length === 0) {
    emptyMessage.hidden = false;

    if (clearButton) {
      clearButton.hidden = true;
    }

    return;
  }

  emptyMessage.hidden = true;

  if (clearButton) {
    clearButton.hidden = false;
    clearButton.onclick = clearFavorites;
  }

  favoriteProducts.forEach(function (product) {
    const listItem = document.createElement("li");
    listItem.textContent =
      product.name + " | " + product.category + " | " + product.price;

    favoriteList.appendChild(listItem);
  });
}

function updateFavoriteButtons() {
  const favorites = getSavedFavorites();
  const favoriteButtons = document.querySelectorAll(".favorite-btn");

  favoriteButtons.forEach(function (button) {
    const productId = button.dataset.productId;
    const isSaved = favorites.includes(productId);

    button.textContent = isSaved ? "Remove Favorite" : "Save Favorite";
    button.classList.toggle("is-favorite", isSaved);
    button.setAttribute("aria-pressed", String(isSaved));
  });
}

function clearFavorites() {
  localStorage.removeItem(FAVORITES_KEY);
  renderFavorites();
  updateFavoriteButtons();
}

/* -----------------------------
   Contact form and validation
----------------------------- */

function initializeContactForm() {
  const form = document.querySelector("#preorder-form");

  if (!form) {
    return;
  }

  prefillFavoriteProducts(form);
  prefillCustomerInformation(form);

  form.addEventListener("submit", validateContactForm);

  const fields = form.querySelectorAll("input, select, textarea");

  fields.forEach(function (field) {
    field.addEventListener("input", function () {
      clearFieldError(field);
    });

    field.addEventListener("change", function () {
      clearFieldError(field);
    });
  });
}

function prefillFavoriteProducts(form) {
  const detailsField = form.querySelector("#details");

  if (!detailsField || detailsField.value.trim() !== "") {
    return;
  }

  const favoriteProducts = getFavoriteProducts();

  if (favoriteProducts.length === 0) {
    return;
  }

  const productNames = favoriteProducts.map(function (product) {
    return product.name;
  });

  detailsField.value = "I am interested in: " + productNames.join(", ") + ".";
}

function prefillCustomerInformation(form) {
  const nameField = form.querySelector("#name");
  const emailField = form.querySelector("#email");

  const savedName = localStorage.getItem("northStarCustomerName");
  const savedEmail = localStorage.getItem("northStarCustomerEmail");

  if (nameField && savedName) {
    nameField.value = savedName;
  }

  if (emailField && savedEmail) {
    emailField.value = savedEmail;
  }
}

function validateContactForm(event) {
  event.preventDefault();

  const form = event.currentTarget;
  clearAllErrors(form);

  const nameField = form.querySelector("#name");
  const emailField = form.querySelector("#email");
  const pickupDateField = form.querySelector("#pickup-date");
  const requestTypeField = form.querySelector("#request-type");
  const detailsField = form.querySelector("#details");
  const formStatus = form.querySelector("#form-status");

  let formIsValid = true;

  if (nameField.value.trim().length < 2) {
    showFieldError(
      nameField,
      "Please enter a name containing at least two characters."
    );
    formIsValid = false;
  }

  if (!isValidEmail(emailField.value.trim())) {
    showFieldError(
      emailField,
      "Please enter a valid email address, such as name@example.com."
    );
    formIsValid = false;
  }

  if (!pickupDateField.value) {
    showFieldError(
      pickupDateField,
      "Please select your preferred pickup date."
    );
    formIsValid = false;
  } else if (!isFutureOrCurrentDate(pickupDateField.value)) {
    showFieldError(
      pickupDateField,
      "Please choose today or a future pickup date."
    );
    formIsValid = false;
  }

  if (!requestTypeField.value) {
    showFieldError(
      requestTypeField,
      "Please select the type of request."
    );
    formIsValid = false;
  }

  if (detailsField.value.trim().length < 10) {
    showFieldError(
      detailsField,
      "Please provide at least 10 characters describing your request."
    );
    formIsValid = false;
  }

  if (!formIsValid) {
    formStatus.textContent =
      "Please correct the highlighted fields before submitting.";
    formStatus.className = "form-status error-summary";

    const firstInvalidField = form.querySelector("[aria-invalid='true']");

    if (firstInvalidField) {
      firstInvalidField.focus();
    }

    return;
  }

  saveCustomerInformation(nameField.value, emailField.value);

  formStatus.textContent =
    "Your request is valid and ready to be submitted.";
  formStatus.className = "form-status success-message";

  /*
    This sample prevents an actual submission because the form action
    is currently "#". Connect the form to a form processor before using
    form.submit() on a live website.
  */
}

function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

function isFutureOrCurrentDate(dateValue) {
  const selectedDate = new Date(dateValue + "T00:00:00");
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return selectedDate >= today;
}

function saveCustomerInformation(name, email) {
  localStorage.setItem("northStarCustomerName", name.trim());
  localStorage.setItem("northStarCustomerEmail", email.trim());
}

function showFieldError(field, message) {
  const errorElement = document.querySelector("#" + field.id + "-error");

  field.setAttribute("aria-invalid", "true");

  if (errorElement) {
    errorElement.textContent = message;
  }
}

function clearFieldError(field) {
  const errorElement = document.querySelector("#" + field.id + "-error");

  field.removeAttribute("aria-invalid");

  if (errorElement) {
    errorElement.textContent = "";
  }
}

function clearAllErrors(form) {
  const fields = form.querySelectorAll("input, select, textarea");
  const errorMessages = form.querySelectorAll(".field-error");
  const formStatus = form.querySelector("#form-status");

  fields.forEach(function (field) {
    field.removeAttribute("aria-invalid");
  });

  errorMessages.forEach(function (errorMessage) {
    errorMessage.textContent = "";
  });

  if (formStatus) {
    formStatus.textContent = "";
    formStatus.className = "form-status";
  }
}
