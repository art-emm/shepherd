import { isString } from './type-check';
import Tether from 'tether';

const ATTACHMENT = {
  bottom: 'top center',
  'bottom center': 'top center',
  'bottom left': 'top right',
  'bottom right': 'top left',
  center: 'middle center',
  left: 'middle right',
  middle: 'middle center',
  'middle center': 'middle center',
  'middle left': 'middle right',
  'middle right': 'middle left',
  right: 'middle left',
  top: 'bottom center',
  'top center': 'bottom center',
  'top left': 'bottom right',
  'top right': 'bottom left'
};

/**
 * Ensure class prefix ends in `-`
 * @param {string} prefix The prefix to prepend to the class names generated by nano-css
 * @return {string} The prefix ending in `-`
 */
export function normalizePrefix(prefix) {
  if (!isString(prefix) || prefix === '') {
    return '';
  }

  return prefix.charAt(prefix.length - 1) !== '-' ? `${prefix}-` : prefix;
}

/**
 * Checks if options.attachTo.element is a string, and if so, tries to find the element
 * @param {Step} step The step instance
 * @returns {{element, on}}
 * `element` is a qualified HTML Element
 * `on` is a string position value
 */
export function parseAttachTo(step) {
  const options = step.options.attachTo || {};
  const returnOpts = Object.assign({}, options);

  if (Array.isArray(options.element)) {
    const elements = [];
    options.element.forEach((element) => {
      elements.push(document.querySelector(element));
    });
    returnOpts.element = elements;
  }
  if (isString(options.element)) {
    // Can't override the element in user opts reference because we can't
    // guarantee that the element will exist in the future.
    try {
      returnOpts.element = document.querySelector(options.element);
    } catch(e) {
      // TODO
    }
    if (!returnOpts.element) {
      console.error(
        `The element for this Shepherd step was not found ${options.element}`
      );
    }
  }

  return returnOpts;
}

/**
 * Determines options for the tooltip and initializes
 * `step.tooltip` as a Tether instance.
 * @param {Step} step The step instance
 */
export function setupTooltip(step) {
  if (step.tooltip) {
    step.tooltip.destroy();
  }

  const attachToOpts = parseAttachTo(step);
  const tetherOptions = getTetherOptions(attachToOpts, step);

  step.tooltip = new Tether(tetherOptions);
  step.target = attachToOpts.element;
}

/**
 * Create a unique id for steps, tours, modals, etc
 * @return {string}
 */
export function uuid() {
  let d = Date.now();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/**
 * Gets the `Tether` options from a set of base `attachTo` options
 * @param attachToOptions
 * @param {Step} step The step instance
 * @return {Object}
 * @private
 */
export function getTetherOptions(attachToOptions, step) {
  let tetherOptions = {
    classPrefix: 'shepherd',
    constraints: [
      {
        to: 'scrollParent',
        attachment: 'together',
        pin: ['left', 'right', 'top']
      },
      {
        to: 'window',
        attachment: 'together'
      }
    ]
  };
  let target = document.body;

  if (
    !attachToOptions.element ||
    (Array.isArray(attachToOptions.element) &&
      attachToOptions.element.length > 1) ||
    !attachToOptions.on
  ) {
    tetherOptions.attachment = 'middle center';
    tetherOptions.targetModifier = 'visible';
  } else {
    tetherOptions.attachment =
      ATTACHMENT[attachToOptions.on] || ATTACHMENT.right;
    target = attachToOptions.element;
  }

  tetherOptions.element = step.el;
  tetherOptions.target = target;

  if (step.options.tetherOptions) {
    if (step.options.tetherOptions.constraints) {
      tetherOptions.constraints = step.options.tetherOptions.constraints;
    }

    tetherOptions.classes = {
      ...tetherOptions.classes,
      ...step.options.tetherOptions.classes
    };

    tetherOptions.optimizations = {
      ...tetherOptions.optimizations,
      ...step.options.tetherOptions.optimizations
    };

    tetherOptions = {
      ...tetherOptions,
      ...step.options.tetherOptions
    };
  }

  return tetherOptions;
}
