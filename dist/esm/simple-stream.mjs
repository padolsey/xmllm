import XMLStream from './XMLStream.mjs';
export function stream(prompt) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return new XMLStream([['req', prompt]], options);
}
export function simple(prompt) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  // Return the XMLStream instance directly
  return stream(prompt, options);
}

// Add a new method to XMLStream class to get final value