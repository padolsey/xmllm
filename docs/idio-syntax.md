# Idio Syntax Guide

Idio is an experimental alternative markup syntax supported by xmllm. Its primary purpose is to clearly disambiguate between structural markers and actual content, which is especially important if you want to generate content from the LLM that includes XML/HTML-like special characters as part of their output.

## Why Idio?

When using xmllm's XML parser, you might encounter conflicts if your LLM needs to generate HTML or XML content or anything with conflicting unicode like angle brackets. For example:

```javascript
// With XML parser - this can be problematic:
const result = await stream('Generate an HTML button', {
  schema: { html: String }
});
// The LLM might output:
// <html><button class="primary">Click me</button></html>
// Which conflicts with xmllm's own XML parsing!

// With Idio - clear separation:
const result = await stream('Generate an HTML button', {
  schema: { html: String }
});
// The LLM outputs:
// ⁂START(html)<button class="primary">Click me</button>⁂END(html)
// No ambiguity between structural markers and content
```

The use of an uncommon symbol (default: ⁂) helps ensure that the structural markers don't conflict with the actual content being generated. This is especially valuable when:
- Generating HTML/XML content
- Working with code snippets that might contain angle brackets
- Processing content that might contain XML-like structures

## Basic Syntax

The syntax uses a configurable symbol (default: ⁂) to mark the start and end of tags:

```javascript
⁂START(tagname)content⁂END(tagname)
```

Example with nested tags:
```javascript
⁂START(book)
  ⁂START(title)The Great Gatsby⁂END(title)
  ⁂START(author)F. Scott Fitzgerald⁂END(author)
  ⁂START(chapters)
    ⁂START(chapter)Chapter 1 content...⁂END(chapter)
    ⁂START(chapter)Chapter 2 content...⁂END(chapter)
  ⁂END(chapters)
⁂END(book)
```

## Configuration

### Enabling Idio Syntax

```javascript
import { configure } from 'xmllm';

configure({
  globalParser: 'idio'
});
```

### Customizing the Symbol

You can change the symbol used to mark tags:

```javascript
configure({
  globalParser: 'idio',
  idioSymbol: '@'  // or any other string
});
```

Now tags will look like:
```javascript
@START(tag)content@END(tag)
```

## Limitations and Differences from XML

1. **No Attributes**
   - Idio doesn't support XML-style attributes
   - Schema properties starting with '$' will be treated as regular tag names
   - Example of what NOT to do:
     ```javascript
     const schema = {
       item: {
         $type: String,    // Don't do this with Idio
         $id: Number       // This won't work as expected
       }
     };
     ```

2. **Simpler Parsing**
   - The parser is more straightforward but less feature-rich than XML
   - No support for self-closing tags

## Best Practices

1. **Avoid '$' in Schema Properties**
   - When using Idio, design your schemas without relying on '$' prefixed properties
   - Instead of `$text` or `$attr`, use regular nested properties

2. **Symbol Choice**
   - When customizing the symbol, choose something unlikely to appear in your content
   - Single rare characters like '⁂', '§', or 'µ' work well

## Example Usage

```javascript
import { configure, stream } from 'xmllm';

// Configure for Idio syntax
configure({
  globalParser: 'idio',
  idioSymbol: '§'  // custom symbol
});

// Use with a schema
const result = await stream('List some colors', {
  schema: {
    colors: {
      color: [String]
    }
  }
}).last();

// The LLM might respond with:
// §START(colors)
//   §START(color)Red§END(color)
//   §START(color)Blue§END(color)
//   §START(color)Green§END(color)
// §END(colors)
```

## Error Handling

The Idio parser is designed to be forgiving of common mistakes:

- Unmatched end tags are ignored
- Extra whitespace is preserved
- Partial tags at the end of chunks are handled gracefully

However, it's still important to validate your results, especially when working with LLMs that might not perfectly follow the syntax. 