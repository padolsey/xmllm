# Idio Syntax

Idio is a configurable grammar that can be used instead of the default xml. Its primary goal is to avoid conflicts between structural markers and the actual content being generated - particularly useful when your LLM needs to generate content containing markup, code, or other special characters. Such things would mess with xmllm's default XML, and that's why Idio exists.

# Enabling Idio

To use Idio syntax, you need to configure it globally:

```javascript
import { configure } from 'xmllm';

// Enable Idio parsing globally
configure({
  globalParser: 'idio'
});
```

Once configured, the xmllm stream interface works exactly the same - the underlying syntax is abstracted away:

```javascript
const result = await stream('List colors', {
  schema: { colors: Array(String) }
});

// Behind the scenes, the LLM generates:
// ⁂START(colors)
//   ⁂START(color)Blue⁂END(color)
//   ⁂START(color)Red⁂END(color)
// ⁂END(colors)

// But you just get back:
// { colors: ['Blue', 'Red'] }
```

# Default Syntax

By default, Idio uses the sextile character (⁂) as the primary mark of its node delimiters:

```
⁂START(element)content⁂END(element)
```

The sextile was chosen because it:
- Rarely appears in normal content
- Has historical use as a text boundary marker
- Is consistently tokenized by LLMs
- Has minimal associations with programming or markup

# Configuration

You can customize how Idio marks up content by configuring its components:

```javascript
configure({
  globalParser: 'idio',
  idioSymbols: {
    tagPrefix: '⁂',      // Starts any tag
    closePrefix: '⁂',    // Starts a closing tag
    openBrace: 'START(', // Wraps element name in opening tag
    closeBrace: 'END(',  // Wraps element name in closing tag 
    braceSuffix: ')'     // Ends both opening/closing tags
  }
});

// You can also update configuration partially:
configure({
  idioSymbols: {
    tagPrefix: '@',
    closePrefix: '@'
  }
});
```

# Attributes and Nesting

Attributes use a $ prefix (converted to @ internally):
```
⁂START($type)value⁂END($type)
```

You can nest elements to create hierarchies:
```
⁂START(root)
  ⁂START(child)content⁂END(child)
  ⁂START(child)more content⁂END(child)
⁂END(root)
```

# Alternative Syntax Examples

You can create different styles of markup:

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

Markdown-inspired:
```javascript
configure({
  idioSymbols: {
    tagPrefix: '#',
    closePrefix: '£',
    openBrace: '[',
    closeBrace: '[/',
    braceSuffix: ']'
  }
});

// Results in:
// #[element] content £[/element]
```

The choice of syntax depends on your content - choose markers that won't conflict with what your LLM needs to generate. 