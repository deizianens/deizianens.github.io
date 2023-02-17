import { RepeatTextScrollFx } from "./repeatTextScrollFx.js";
import { Cursor } from "./cursor.js";
import { Title } from "./title.js";

const splitting = Splitting();

document.querySelectorAll("[data-text-rep]").forEach((textEl) => {
  new RepeatTextScrollFx(textEl);
});

document.body.classList.remove("loading");

const cursor = new Cursor(document.querySelector(".cursor"));

[...document.querySelectorAll("h2")].forEach((el) => new Title(el));
[...document.querySelectorAll("h2")].forEach((link) => {
  link.addEventListener("mouseenter", () => cursor.enter());
  link.addEventListener("mouseleave", () => cursor.leave());
});
