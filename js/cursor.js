import { lerp, getMousePos } from "./utils.js";

let mouse = { x: 0, y: 0 };
window.addEventListener("mousemove", (ev) => (mouse = getMousePos(ev)));

export class Cursor {
  constructor(el) {
    this.DOM = { el: el };
    this.DOM.lines = this.DOM.el.children;
    [this.DOM.lineHorizontal, this.DOM.lineVertical] = this.DOM.lines;

    // hide initially
    gsap.set(this.DOM.lines, { opacity: 0 });

    this.renderedStyles = {
      tx: { previous: 0, current: 0, amt: 0.15 },
      ty: { previous: 0, current: 0, amt: 0.15 },
    };

    // on first mousemove fade in the lines and start the requestAnimationFrame rendering function
    this.onMouseMoveEv = () => {
      this.renderedStyles.tx.previous = this.renderedStyles.tx.current =
        mouse.x;
      this.renderedStyles.ty.previous = this.renderedStyles.ty.previous =
        mouse.y;
      gsap.to(this.DOM.lines, {
        duration: 0.9,
        ease: "Power3.easeOut",
        opacity: 1,
      });
      requestAnimationFrame(() => this.render());
      window.removeEventListener("mousemove", this.onMouseMoveEv);
    };

    window.addEventListener("mousemove", this.onMouseMoveEv);

    this.filterId = {
      x: "#filter-noise-x",
      y: "#filter-noise-y",
    };

    this.DOM.feTurbulence = {
      x: document.querySelector(`${this.filterId.x} > feTurbulence`),
      y: document.querySelector(`${this.filterId.y} > feTurbulence`),
    };

    this.primitiveValues = { turbulence: 0 };
    this.createNoiseTimeline();
  }

  enter() {
    this.tl.restart();
  }

  leave() {
    this.tl.progress(1).kill();
  }

  createNoiseTimeline() {
    this.tl = gsap
      .timeline({
        paused: true,
        onStart: () => {
          this.DOM.lineHorizontal.style.filter = `url(${this.filterId.x}`;
          this.DOM.lineVertical.style.filter = `url(${this.filterId.y}`;
        },
        onUpdate: () => {
          this.DOM.feTurbulence.x.setAttribute(
            "baseFrequency",
            this.primitiveValues.turbulence
          );
          this.DOM.feTurbulence.y.setAttribute(
            "baseFrequency",
            this.primitiveValues.turbulence
          );
        },
        onComplete: () => {
          // remove the filters once the animation completes
          this.DOM.lineHorizontal.style.filter =
            this.DOM.lineVertical.style.filter = "none";
        },
      })
      .to(this.primitiveValues, {
        duration: 0.5,
        ease: "power1",
        startAt: { turbulence: 1 },
        turbulence: 0,
      });
  }

  render() {
    this.renderedStyles["tx"].current = mouse.x;
    this.renderedStyles["ty"].current = mouse.y;
    // use linear interpolation to delay the translation animation
    for (const key in this.renderedStyles) {
      this.renderedStyles[key].previous = lerp(
        this.renderedStyles[key].previous,
        this.renderedStyles[key].current,
        this.renderedStyles[key].amt
      );
    }

    gsap.set(this.DOM.lineVertical, { x: this.renderedStyles["tx"].previous });
    gsap.set(this.DOM.lineHorizontal, {
      y: this.renderedStyles["ty"].previous,
    });
    // loop this until the end of time
    requestAnimationFrame(() => this.render());
  }
}
