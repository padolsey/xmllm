# Raw XML Streaming

When working without a schema, you use CSS selectors to extract elements from the XML stream. This requires explicitly guiding the LLM's output format in your prompt.

## Basic Selection

```javascript
import { stream } from 'xmllm';

// 1. Guide the XML format in your prompt
const thoughts = stream(`
  Share three deep thoughts about programming.
  Format each thought as: <thought>your thought here</thought>
`);

// 2. Select and process elements
for await (const thought of thoughts
  .select('thought')    // Find <thought> elements
  .text()              // Get text content
) {
  console.log(thought);
  // "Programming is poetry in motion"
  // "Bugs are just unexpected features"
  // "Code is never finished, only abandoned"
}
```

## Working with Elements

Raw elements have several properties:

```javascript
const elements = stream('List items')
  .select('item')
  .map(element => ({
    text: element.$$text,         // Text content
    attributes: element.$$attr,    // Attribute object
    isClosed: element.$$tagclosed, // Is tag complete?
    name: element.$$tagname,      // Tag name
    children: element.$$children  // Child elements
  }));
```

## Handling Partial Content

Without a schema, you need to explicitly handle partial elements:

```javascript
const colors = stream('List colors')
  .select('color')
  .map(element => {
    if (!element.$$tagclosed) {
      return `Still typing: ${element.$$text}...`;
    }
    return `Complete: ${element.$$text}`;
  });

// You might see:
// "Still typing: re..."
// "Complete: red"
// "Still typing: blu..."
// "Complete: blue"
```

## CSS Selectors

The selector engine supports standard CSS selectors:

```javascript
// Basic tag selection
.select('item')

// Nested elements
.select('list > item')

// With attributes
.select('item[type="important"]')

// Multiple selectors
.select('warning, error')

// Complex paths
.select('results > category[type="main"] > item')
```

## Transforming Elements

Common transformation patterns:

```javascript
// 1. Extract text with optional transform
stream('List items')
  .select('item')
  .text(str => str.toUpperCase());

// 2. Access text and attributes together
stream('List scores')
  .select('score')
  .map(({$$text, $$attr}) => ({
    value: parseInt($$text),
    type: $$attr.type
  }));

// 3. Process child elements
stream('Get nested data')
  .select('item')
  .map(element => ({
    title: element.title?.[0]?.$$text,
    tags: element.tags?.[0].tag?.map(t => t.$$text) || []
  }));
```

## Ensuring Complete Elements

Use closedOnly() to filter for complete elements:

```javascript
// Without closedOnly() - see partial updates
const stream1 = stream('List items')
  .select('item')
  .text();
// Might see: "app", "appl", "apple"

// With closedOnly() - only complete elements
const stream2 = stream('List items')
  .select('item')
  .closedOnly()
  .text();
// Only sees: "apple"
```

## Collecting Results

Different ways to handle raw streams:

```javascript
// 1. Process everything
for await (const el of stream('List items').select('item')) {
  console.log(el.$$text);
}

// 2. Get first complete element
const first = await stream('List items')
  .select('item')
  .closedOnly()
  .first();

// 3. Wait for all elements
const all = await stream('List items')
  .select('item')
  .closedOnly()
  .all();

// 4. Get last n elements
const lastTwo = await stream('List items')
  .select('item')
  .closedOnly()
  .last(2);
```

## Guiding LLM Output

Since there's no schema to guide the AI, you need to be explicit about the XML structure:

```javascript
// Good prompt - clear structure guidance
const good = stream(`
  List three colors. 
  Format each color as: <color type="primary|secondary">name</color>
`);

// Bad prompt - unclear structure
const bad = stream('List three colors with XML tags');

// Using system prompt for consistent format
const better = stream('List three colors', {
  system: `
    Always format colors as:
    <color type="primary|secondary">name</color>
  `
});
```

## Error Handling

Handle malformed XML gracefully:

```javascript
const items = stream('List items')
  .select('item')
  .map(element => {
    try {
      // Try to process element
      return processElement(element);
    } catch (error) {
      if (!element.$$tagclosed) {
        return null; // Skip partial elements
      }
      console.warn('Failed to process:', element);
      return fallbackProcess(element);
    }
  })
  .filter(Boolean); // Remove nulls
```

## Complex Selection

Working with deeply nested elements:

```javascript
const data = stream(`
  Get user data. Format as:
  <user type="admin|regular">
    <name>user name</name>
    <roles>
      <role level="1-5">role name</role>
    </roles>
  </user>
`);

// Get all roles across users
const roles = data
  .select('user > roles > role')
  .map(role => ({
    name: role.$$text,
    level: parseInt(role.$$attr.level),
    user: role.parentElement.parentElement.name[0].$$text
  }));

// Get users with specific roles
const admins = data
  .select('user[type="admin"]')
  .map(user => user.name[0].$$text);
``` 