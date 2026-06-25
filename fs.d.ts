// Type declarations for the `xmllm/fs` subpath.
// In Node this re-exports the real fs.promises and path; in the browser it is a
// no-op shim with the same surface.

export declare const promises: typeof import('fs').promises;
export declare const path: typeof import('path');
