# Type System

xmllm provides a rich type system for transforming XML into structured data. Each type supports methods for defaults, transformations, and hints.

## Available Types

```javascript
import { types } from 'xmllm';

// String types
types.string("hint")  // or types.str("hint")
types.string()        // without hint

// Number types
types.number("hint")  // or types.num("hint")
types.number()        // without hint

// Boolean types
types.boolean("hint") // or types.bool("hint")
types.boolean()       // without hint

// Raw type (preserves CDATA)
types.raw("hint")     // Raw content type

// Enum type
types.enum("Status", ["ACTIVE", "PENDING", "CLOSED"])
types.enum(["ACTIVE", "PENDING", "CLOSED"]) // hint is optional

// Array type
types.items(types.string("Item hint"))
types.items({ name: types.string() })
```

## Type Methods

Each type supports the following methods:

```javascript
const schema = {
  // withDefault() - Sets default value if parsing fails or element missing
  name: types.string()
    .withDefault("Anonymous"),

  // withTransform() - Transform the parsed value
  age: types.number()
    .withTransform(n => Math.floor(n)),

  // withHint() - Add or modify hint for AI
  status: types.string()
    .withHint("Current user status"),

  // Chaining is supported
  score: types.number("Score 0-100")
    .withDefault(0)
    .withTransform(n => Math.min(100, Math.max(0, n)))
};
```

## Type Parsing Behavior

Each type has specific parsing rules:

```javascript
// String type - Trims whitespace
types.string()  // "  hello  " -> "hello"

// Number type - Finds first number pattern
types.number()  // "Price: $42.50" -> 42.50
                // "4.5/5 stars" -> 4.5
                // "-3.2 degrees" -> -3.2
                // ".75 percent" -> 0.75

// Boolean type - Smart truthiness
types.boolean() // "true", "yes", "1" -> true
                // "false", "no", "0" -> false
                // "" -> false (or default)

// Raw type - Preserves content exactly
types.raw()     // Preserves whitespace, CDATA, etc.

// Enum type - Flexible case-insensitive matching
types.enum([
  "ACTIVE",
  "PENDING"
]) // Matches flexibly:
   // "active", "ACTIVE", "Active" -> "ACTIVE"
   // "status: pending" -> "PENDING"
   // "is-pending" -> "PENDING"
   // Invalid matches use default or are excluded
```

## ItemsType

The `items()` type supports both item-level and array-level transformations:

```javascript
const schema = {
  // Basic array with item-level transforms
  numbers: types.items(
    types.number()
      .withTransform(n => n * 2)  // Applied to each number
  ),

  // Array with array-level transform
  scores: types.items(types.number())
    .withTransform(arr => {
      // Transform can include validation logic
      const validScores = arr.filter(n => n >= 0 && n <= 100);
      return validScores.sort((a, b) => b - a);
    })
    .withDefault([]),  // Default if missing

  // Complex nested structure
  users: types.items({
    name: types.string("User's name"),
    scores: types.items(types.number("Score"))
      .withTransform(scores => scores.sort((a, b) => b - a))
  })
  .withTransform(users => users.sort((a, b) => a.name.localeCompare(b.name)))
};
```

### ItemsType Default Values

The `withDefault()` method on ItemsType works differently from other types:

```javascript
const schema = {
  // Array-level default (used if element missing or empty)
  colors: types.items(types.string())
    .withDefault(['red', 'blue']),

  // Item-level default (used for invalid/missing items)
  numbers: types.items(
    types.number().withDefault(0)
  ),

  // Both levels of defaults
  scores: types.items(
    types.number()
      .withDefault(0)         // For invalid individual scores
  )
  .withDefault([50, 50, 50])  // For missing/invalid array
};
```

### ItemsType Scaffold Generation

The ItemsType generates scaffolds to guide the AI in producing correctly structured arrays:

```javascript
const schema = {
  // Simple array
  colors: types.items(types.string("A color name")),
  // Generates:
  // <colors>
  //   <item>{String: A color name}</item>
  //   <item>{String: A color name}</item>
  //   /*etc.*/
  // </colors>

  // Complex items
  users: types.items({
    name: types.string("User's name"),
    age: types.number("User's age"),
    $role: types.string("User role")  // Attribute
  })
  // Generates:
  // <users>
  //   <item role="{String: User role}">
  //     <name>{String: User's name}</name>
  //     <age>{Number: User's age}</age>
  //   </item>
  //   <item role="{String: User role}">
  //     /*etc.*/
  //   </item>
  // </users>
};
```

## Type Composition

Types can be composed to create complex structures:

```javascript
const schema = {
  // Nested objects
  user: {
    profile: {
      name: types.string(),
      age: types.number()
    },
    
    // Arrays of primitives
    tags: types.items(types.string()),
    
    // Arrays of objects
    posts: types.items({
      title: types.string(),
      likes: types.number(),
      tags: types.items(types.string())
    }),
    
    // With attributes
    status: {
      $type: types.string(),     // Attribute
      $$text: types.string(),    // Content
      $timestamp: types.number() // Another attribute
    }
  }
};
``` 