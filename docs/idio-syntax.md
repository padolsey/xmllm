# Idio Syntax

Idio is a configurable parser that can be used instead of the default XML. Its primary goal is to avoid conflicts between structural markers and the actual content being generated - particularly useful when your LLM needs to generate content containing markup, code, or other special characters. Such things would mess with xmllm's default XML, and that's why Idio exists.

One nice thing about xmllm is that, since it manages the prompting aspect, it can insert rules about the syntax we're expecting from the LLM, including examples of how the schema should be completed.

The first attempts at a non standardized grammar just used literal `START` and `END` boundaries. I soon realized an additional symbol was needed to enforce strong demarkation and avoid conflicts. I ended up with this as the default Idio grammar:

```javascript
@START(person)
  @START(name)John@END(name)
  @START(age)30@END(age)
@END(person)
```

It's verbose, disambiguating, and avoids most everyday conflicts.

# Reminder!

This is all very experimental and is only worth using if **the content you're trying to generate from the LLM may contain XML-like syntax or characters that would mess with the default XML parser**.

# About Delimiters

Through a bunch of testing ([try the matrix yourself](https://xmllm.j11y.io/model-testing)), I've found that the `@START` and `@END` markers work exceptionally well as a node boundaries.

The prefix marker '@' is crucial as it means we can catch potential bounderies before they make it downstream, making it cleaner from a streaming perspective. The default prefix is `@`. While I initially used the sextile character (`⁂`) (it being both rare, available in trained material and known as a typographic boundary), `@` has proven more reliable.

If `@` or `⁂` don't work well for your specific use case, consider trying other boundary or typographic symbols like `$`, `§`, `※`, or `‡`. Different LLMs might respond better to different delimiters. See how to configure them below. 

# Enabling Idio

To use Idio parser and its default syntax, you need to configure it globally:

```javascript
import { configure } from 'xmllm';

configure({
  globalParser: 'idio'
});
```

Once configured, the xmllm stream interface works exactly the same - the underlying syntax is abstracted away from you so you'll not see it unless you're debugging.

```javascript
const result = await stream('List colors', {
  schema: { colors: Array(String) }
});

// Behind the scenes, the LLM generates:
// @START(colors)
//   @START(color)Blue@END(color)
//   @START(color)Red@END(color)
// @END(colors)

// But you just get back:
// { colors: ['Blue', 'Red'] }
```

# Configuration

You can customize the exact grammar the Idio parser uses by configuring it globally:

```javascript
configure({
  globalParser: 'idio',
  idioSymbols: {
    openTagPrefix: '@',  // Starts opening tag
    closeTagPrefix: '@', // Starts closing tag
    tagOpener: 'START(', // Wraps element name in opening tag
    tagCloser: 'END(',   // Wraps element name in closing tag 
    tagSuffix: ')'       // Ends both opening/closing tags
  }
});

// You can also update configuration partially:
configure({
  idioSymbols: {
    openTagPrefix: '⁂',
    closeTagPrefix: '⁂'
  }
});
```


## Syntax Components

Given this example tag:
```
@START(tagname)content@END(tagname)
```

Here's how it maps to configuration properties:

```
@     START(   tagname   )     content   @    END(   tagname   )
|     |        |         |     |        |     |      |         |
|     |        |         |     |        |     |      |         |
|     |        |         |     |        |     |      |         |
[A]   [B]      [C]       [D]   [E]      [F]   [G]    [H]      [I]
```

Where:
- [A] = `openTagPrefix`    - Marks the start of an opening tag
- [B] = `tagOpener`        - Wraps the opening tag name
- [C] = Tag name          - (Not configurable - comes from schema)
- [D] = `tagSuffix`       - Closes both opening and closing tags
- [E] = Content           - (Not configurable - actual content)
- [F] = `closeTagPrefix`  - Marks the start of a closing tag
- [G] = `tagCloser`       - Wraps the closing tag name
- [H] = Tag name          - (Must match opening tag name)
- [I] = `tagSuffix`       - Same as [D]

## Default Configuration
```javascript
{
  openTagPrefix: '@',     // [A]
  tagOpener: 'START(',    // [B]
  tagSuffix: ')',        // [D,I]
  closeTagPrefix: '@',    // [F]
  tagCloser: 'END('      // [G]
}
```

## Disambiguation Rules

For the parser to work unambiguously, either:
1. `openTagPrefix` must differ from `closeTagPrefix`, OR
2. `tagOpener` must differ from `tagCloser`

Examples:
```
// Different prefixes:
#START(tag)content@END(tag)
|                |
openTagPrefix    closeTagPrefix are different

// Same prefixes but different openers:
@START(tag)content@END(tag)
 |               |
 tagOpener       tagCloser are different
```

## Common Mistakes

❌ Ambiguous:
```
@TAG(name)content@TAG(name)    // Can't tell open from close
XXXtestXXXcontentXXXtestXXX    // No way to distinguish tags
```

✅ Unambiguous:
```
@START(name)content@END(name)   // Different openers
#TAG(name)content@TAG(name)     // Different prefixes
```

# Possible Configurations

While the prefixed 'START' and 'END' boundaries are well-tested and recommended, you can create different styles of markup based on your needs:

Comment-style syntax:
```javascript
configure({
  idioSymbols: {
    openTagPrefix: '<!--',
    closeTagPrefix: '<!--/',
    tagOpener: '(',
    tagCloser: '(',
    tagSuffix: ')-->'
  }
});

// This will parse:
// <!--(element)-->content<!--/(element)-->
```

The choice of syntax depends on your specific needs. Consider:

- What characters might appear in your generated content, and thus required disambiguation
- How reliably your chosen LLM handles different delimiters; you'll need to test this
- Whether you need human-readable output for debugging or have other constraints

If the recommended delimiters aren't working well, experiment with different symbols or patterns that are semantically related to concepts of delimiting or boundaries/hierarchies. The key is finding boundary syntax that your LLM can reliably generate while avoiding conflicts with your the content you wish to generate _within_ those boundaries.
