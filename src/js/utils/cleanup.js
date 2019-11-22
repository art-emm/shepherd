/**
 * Cleanup the steps and set pointerEvents back to 'auto'
 * @param tour The tour object
 */
export function cleanupSteps(tour) {
  if (tour) {
    const { steps } = tour;

    steps.forEach((step) => {
      if (
        step.options &&
        step.options.canClickTarget === false &&
        step.options.attachTo
      ) {
        if (step.target instanceof HTMLElement) {
          step.target.classList.remove('shepherd-target-click-disabled');
        }
        if (Array.isArray(step.target)) {
          step.target.forEach((el) => {
            el.classList.remove('shepherd-target-click-disabled');
          });
        }
      }
      if (step.notCliCkable) {
        step.notCliCkable.forEach((el) => {
          el = document.querySelector(el);
          el.classList.remove('shepherd-target-click-disabled');
        });
      }
    });
  }
}
