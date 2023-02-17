// Linear interpolation
const lerp = (a, b, n) => (1 - n) * a + n * b;

const getMousePos = (e) => {
  return {
    x: e.clientX,
    y: e.clientY,
  };
};

const getHeight = (el) => {
  const computedStyle = getComputedStyle(el);

  let elementHeight = el.clientHeight;
  elementHeight -=
    parseFloat(computedStyle.paddingTop) +
    parseFloat(computedStyle.paddingBottom);
  return elementHeight;
};

export { lerp, getMousePos, getHeight };
