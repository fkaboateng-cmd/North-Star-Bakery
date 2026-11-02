"use strict";

const FAVORITES_KEY = "northStarBakeryFavorites";
const CUSTOMER_KEY = "northStarBakeryCustomer";

function readStoredArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch (error) {
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function updateFavoritesSummary(favorites) {
  const count = document.querySelector("#favorite-count");
  const list = document.querySelector("#favorite-list");
  if (!count || !list) return;

  count.textContent = String(favorites.length);
  list.textContent = favorites.length
    ? favorites.join(", ")
    : "No favorites selected yet.";
}

function toggleFavorite(productName, button) {
  const favorites = readStoredArray(FAVORITES_KEY);
  const index = favorites.indexOf(productName);

  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push(productName);
  }

  saveFavorites(favorites);
  updateFavoriteButton(button, favorites.includes(productName));
  updateFavoritesSummary(favorites);
}

function updateFavoriteButton(button, isFavorite) {
  button.classList.toggle("is-favorite", isFavorite);
  button.setAttribute("aria-pressed", String(isFavorite));
  button.textContent = isFavorite ? "Remove favorite" : "Save as favorite";
}

function initializeFavorites() {
  const productCards = document.querySelectorAll("#product-choices .card");
  if (!productCards.length) return;

  const favorites = readStoredArray(FAVORITES_KEY);
  productCards.forEach((card) => {
    const heading = card.querySelector("h3");
    const button = card.querySelector(".favorite-btn");
    if (!heading || !button) return;

    const productName = heading.textContent.trim();
    updateFavoriteButton(button, favorites.includes(productName));
    button.addEventListener("click", () => toggleFavorite(productName, button));
  });

  updateFavoritesSummary(favorites);
}

function showFieldError(field, message) {
  const error = document.querySelector(`#${field.id}-error`);
  field.classList.toggle("input-error", Boolean(message));
  field.setAttribute("aria-invalid", String(Boolean(message)));
  if (error) error.textContent = message;
}

function validateRequired(field, label) {
  const isValid = field.value.trim().length > 0;
  showFieldError(field, isValid ? "" : `${label} is required.`);
  return isValid;
}

function validateEmail(field) {
  const value = field.value.trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  showFieldError(field, isValid ? "" : "Enter a valid email address, such as name@example.com.");
  return isValid;
}

function validateDetails(field) {
  const value = field.value.trim();
  const isValid = value.length >= 10;
  showFieldError(field, isValid ? "" : "Please enter at least 10 characters so we can understand your request.");
  return isValid;
}

function saveCustomer(name, email) {
  localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ name, email }));
}

function loadCustomer() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMER_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function initializeFormValidation() {
  const form = document.querySelector("#inquiry-form");
  if (!form) return;

  const name = document.querySelector("#name");
  const email = document.querySelector("#email");
  const pickupDate = document.querySelector("#pickup-date");
  const requestType = document.querySelector("#request-type");
  const details = document.querySelector("#details");
  const status = document.querySelector("#form-status");

  const savedCustomer = loadCustomer();
  if (savedCustomer.name) name.value = savedCustomer.name;
  if (savedCustomer.email) email.value = savedCustomer.email;

  [name, email, pickupDate, requestType, details].forEach((field) => {
    field.addEventListener("input", () => {
      if (field === email) validateEmail(email);
      else if (field === details) validateDetails(details);
      else validateRequired(field, field.labels[0].textContent.replace("*", "").trim());
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const checks = [
      validateRequired(name, "Name"),
      validateEmail(email),
      validateRequired(pickupDate, "Preferred pickup date"),
      validateRequired(requestType, "Request type"),
      validateDetails(details)
    ];

    if (checks.every(Boolean)) {
      saveCustomer(name.value.trim(), email.value.trim());
      status.textContent = "Your information is valid. This sample form is ready to be connected to a form processor.";
      status.className = "form-status success";
    } else {
      status.textContent = "Please correct the highlighted fields before submitting.";
      status.className = "form-status error";
      form.querySelector("[aria-invalid='true']")?.focus();
    }
  });
}

function initializePage() {
  initializeFavorites();
  initializeFormValidation();
}

document.addEventListener("DOMContentLoaded", initializePage);
