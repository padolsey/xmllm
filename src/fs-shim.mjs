// Browser-safe shim for fs operations
export const promises = {
  async mkdir() { return; },
  async writeFile() { return; },
  async readFile() { return null; },
  async rename() { return; }
};

// Browser-safe path shim
export const path = {
  join(...args) { return args.join('/'); },
  dirname(p) { return p.split('/').slice(0, -1).join('/'); }
}; 