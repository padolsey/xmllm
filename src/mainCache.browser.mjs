// Browser-safe version - all cache operations are no-ops
export const stats = { hits: 0, misses: 0 };
export const configure = () => {};
export const get = () => null;
export const set = (_, value) => value;
export const del = () => {};
export const setLogger = () => {};
export const resetConfig = () => {};
export const _reset = () => {};
export const getDefaultConfig = () => ({});
