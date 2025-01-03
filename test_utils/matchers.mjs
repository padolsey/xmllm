import { Node } from '../src/parsers/IncomingXMLParserSelectorEngine.mjs';

expect.extend({
  toBeNode(received, expected) {
    if (!(received.__isNodeObj__)) {
      return {
        pass: false,
        message: () => `Expected ${JSON.stringify(received)} to be a Node instance`
      };
    }
    
    const pass = this.equals(
      {$$attr: received.$$attr, $$text: received.$$text, $$tagclosed: received.$$tagclosed, $$tagkey: received.$$tagkey},
      {$$attr: expected.$$attr, $$text: expected.$$text, $$tagclosed: expected.$$tagclosed, $$tagkey: expected.$$tagkey}
    );

    return {
      pass,
      message: () => `Expected Node ${JSON.stringify(received)} to match ${JSON.stringify(expected)}`
    };
  },
  
  toMatchNodeData(received, expected) {
    const nodeData = received instanceof Node ? 
      {$$attr: received.$$attr, $$text: received.$$text, $$tagkey: received.$$tagkey} :
      received;
      
    return {
      pass: this.equals(nodeData, expected),
      message: () => `Expected node data ${JSON.stringify(nodeData)} to match ${JSON.stringify(expected)}`
    };
  }
}); 