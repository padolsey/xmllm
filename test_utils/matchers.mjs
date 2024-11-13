import { Node } from '../src/IncomingXMLParserSelectorEngine.mjs';

expect.extend({
  toBeNode(received, expected) {
    if (!(received.__isNodeObj__)) {
      return {
        pass: false,
        message: () => `Expected ${JSON.stringify(received)} to be a Node instance`
      };
    }
    
    const pass = this.equals(
      {$attr: received.$attr, $text: received.$text, $closed: received.$closed, $key: received.$key},
      {$attr: expected.$attr, $text: expected.$text, $closed: expected.$closed, $key: expected.$key}
    );

    return {
      pass,
      message: () => `Expected Node ${JSON.stringify(received)} to match ${JSON.stringify(expected)}`
    };
  },
  
  toMatchNodeData(received, expected) {
    const nodeData = received instanceof Node ? 
      {$attr: received.$attr, $text: received.$text, $key: received.$key} :
      received;
      
    return {
      pass: this.equals(nodeData, expected),
      message: () => `Expected node data ${JSON.stringify(nodeData)} to match ${JSON.stringify(expected)}`
    };
  }
}); 