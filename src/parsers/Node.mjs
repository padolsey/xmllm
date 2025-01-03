export default class Node {

  constructor(name, o) {
    this.length = 0;
    this.__isNodeObj__ = true;
    if (o) {
      this.$$tagkey = o.key;
      this.$$attr = o.attr;
      this.$$text = o.aggregateText || o.text;
      this.$$tagclosed = o.closed;
      this.$$children = o.children || [];
      this.$$tagname = name;

      const { key, attr, text, closed, children, ...rest } = o;
      
      Object.assign(this, rest);
    }
  }
}