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

Through a bunch of testing ([try the matrix yourself](https://xmllm.j11y.io/model-testing)), I've found that the `@START` and `@END` markers work exceptionally well as a node boundaries. For the prefix marker (`@`) (for strong differentiation from prose), while I initially used the sextile character (`⁂`) (it being both rare, available in trained material and known as a typographic boundary), `@` has proven more reliable.

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
    tagPrefix: '@',      // Starts opening tag
    closePrefix: '@',    // Starts closing tag
    openBrace: 'START(', // Wraps element name in opening tag
    closeBrace: 'END(',  // Wraps element name in closing tag 
    braceSuffix: ')'     // Ends both opening/closing tags
  }
});

// You can also update configuration partially:
configure({
  idioSymbols: {
    tagPrefix: '⁂',
    closePrefix: '⁂'
  }
});
```

# Configurations

While @ and ⁂ are recommended, you can create different styles of markup based on your needs:

Comment-style syntax:
```javascript
configure({
  idioSymbols: {
    tagPrefix: '<!--',
    closePrefix: '<!--/',
    openBrace: '(',
    closeBrace: '(',
    braceSuffix: ')-->'
  }
});

// Results in:
// <!--(element)-->content<!--/(element)-->
```

The choice of syntax depends on your specific needs. Consider:

- What characters might appear in your generated content
- How reliably your chosen LLM handles different delimiters
- Whether you need human-readable output for debugging

If the recommended delimiters aren't working well, experiment with different symbols or patterns that are semantically related to concepts of delimiting or boundaries/hierarchies. The key is finding markers that your LLM can reliably generate while avoiding conflicts with your content.