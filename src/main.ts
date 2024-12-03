import "./style.css";

// get the current theme from the URL
const searchParams = new URLSearchParams(window.location.search);
document.body.dataset.theme = searchParams.get("theme") ?? "light";

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
