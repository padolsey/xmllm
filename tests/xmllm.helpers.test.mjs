import xmllm from '../src/xmllm.mjs';

describe('xmllm transformer helpers', () => {
  test('text helper handles text transformations', async () => {
    const stream = xmllm(({ prompt, text }) => [
      prompt(
        'Test prompt',
        {
          message: {
            title: text(s => s.toUpperCase()),
            content: text(s => s.trim())
          }
        },
        null, // mapper
        '<message><title>hello world</title><content> trim me </content></message>'
      )
    ]);

    const results = await stream.all();
    expect(results[0]).toEqual({
      message: {
        title: 'HELLO WORLD',
        content: 'trim me'
      }
    });
  });

  test('withAttrs helper combines text and attributes', async () => {
    const stream = xmllm(({ prompt, withAttrs }) => [
      prompt(
        'Test prompt',
        {
          product: {
            price: withAttrs((text, attrs) => ({
              amount: Number(text),
              currency: attrs.currency
            }))
          }
        },
        null,
        '<product><price currency="USD">42.99</price></product>'
      )
    ]);

    const results = await stream.all();
    expect(results[0]).toEqual({
      product: {
        price: {
          amount: 42.99,
          currency: 'USD'
        }
      }
    });
  });

  test('whenClosed helper only transforms closed elements', async () => {
    const stream = xmllm(({ prompt, whenClosed }) => [
      prompt(
        'Test prompt',
        {
          status: whenClosed(text => `Complete: ${text}`)
        },
        null,
        '<status>Loading'  // First chunk, unclosed
      )
    ]);

    let results = await stream.all();
    expect(results[0]).toEqual({
      status: undefined  // Undefined because element not closed
    });

    // Second chunk with closing tag
    const stream2 = xmllm(({ prompt, whenClosed }) => [
      prompt(
        'Test prompt',
        {
          status: whenClosed(({$$text: text}) => `Complete: ${text}`)
        },
        null,
        '<status>Loading</status>'
      )
    ]);

    results = await stream2.all();
    expect(results[0]).toEqual({
      status: 'Complete: Loading'  // Now transforms because element is closed
    });
  });

  test('helpers can be combined', async () => {
    const stream = xmllm(({ prompt, text, whenClosed, withAttrs }) => [
      prompt(
        'Test prompt',
        {
          item: {
            // Transform text only
            title: text(s => s.toUpperCase()),
            
            // Wait for closing and include attributes
            price: whenClosed(
              withAttrs((text, attrs) => ({
                amount: Number(text),
                currency: attrs.currency,
                final: true
              }))
            )
          }
        },
        null,
        '<item><title>Product</title><price currency="EUR">99.99</price></item>'
      )
    ]);

    const results = await stream.all();
    expect(results[0]).toEqual({
      item: {
        title: 'PRODUCT',
        price: {
          amount: 99.99,
          currency: 'EUR',
          final: true
        }
      }
    });
  });
}); 