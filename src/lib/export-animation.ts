import type { Animation } from "@/types/animations";

export function generateCSS(animations: Animation[], duration: number): string {
  let css = "";

  animations.forEach((animation) => {
    const elementSelector = animation.element;
    const keyframesName = `animation_${elementSelector.replace(/[^a-zA-Z0-9]/g, "_")}`;

    // Generar la regla @keyframes
    css += `@keyframes ${keyframesName} {\n`;
    animation.keyframes.forEach((keyframe) => {
      const percentage = (keyframe.time / duration) * 100;
      css += `  ${percentage.toFixed(2)}% {\n`;
      Object.entries(keyframe.properties).forEach(([property, value]) => {
        css += `    ${property}: ${value};\n`;
      });
      css += `  }\n`;
    });
    css += `}\n\n`;

    // Generar la regla de animación para el elemento
    css += `.${elementSelector} {\n`;
    css += `  animation: ${keyframesName} ${duration / 1000}s linear infinite;\n`;
    css += `}\n\n`;
  });

  return css;
}

