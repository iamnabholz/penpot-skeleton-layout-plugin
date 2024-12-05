import "./style.css";

// get the current theme from the URL
const searchParams = new URLSearchParams(window.location.search);
document.body.dataset.theme = searchParams.get("theme") ?? "light";

// Get all preview lines
const previewLines = document.querySelectorAll(".preview-line");

// Add event listener to checkbox
const checkbox = document.querySelector<HTMLInputElement>(
  '[data-handler="keep-text"]',
);
checkbox?.addEventListener("change", (e) => {
  const isChecked = (e.target as HTMLInputElement).checked;

  // Update preview lines classes based on checkbox state
  previewLines.forEach((line) => {
    if (isChecked) {
      line.classList.add("keep-text");
    } else {
      line.classList.remove("keep-text");
    }
  });
});
document
  .querySelector("[data-handler='transform']")
  ?.addEventListener("click", () => {
    // send message to plugin.ts
    const checkbox = document.querySelector(
      "[data-handler='keep-text']",
    ) as HTMLInputElement;
    parent.postMessage({ msg: "transform", value: checkbox.checked }, "*");
  });

// Listen plugin.ts messages
window.addEventListener("message", (event) => {
  if (event.data.source === "penpot") {
    document.body.dataset.theme = event.data.theme;
  }
});
