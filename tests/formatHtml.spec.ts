import { describe, expect, it } from 'vitest'

import { formatHtml } from '../src/utils/formatHtml'

function format(html: string): string {
  const template = document.createElement('template')
  template.innerHTML = html
  return Array.from(template.content.childNodes)
    .map(node => formatHtml(node))
    .join('\n')
}

describe('formatHtml', () => {
  it('keeps an element with only text on one line', () => {
    expect(format('<div>Text</div>')).toBe('<div>Text</div>')
  })

  it('keeps an empty element on one line', () => {
    expect(format('<div class="a"></div>')).toBe('<div class="a"></div>')
  })

  it('indents nested block elements', () => {
    expect(format('<table><tbody><tr><td>1</td></tr></tbody></table>')).toBe(
      [
        '<table>',
        '  <tbody>',
        '    <tr>',
        '      <td>1</td>',
        '    </tr>',
        '  </tbody>',
        '</table>'
      ].join('\n')
    )
  })

  it('keeps inline elements on the current line', () => {
    expect(format('<div><a>x</a> <b>y</b><input value="z"><br></div>')).toBe(
      '<div><a>x</a> <b>y</b><input value="z"><br></div>'
    )
    expect(format('<ul><li><a href="#">link</a></li></ul>')).toBe(
      '<ul>\n  <li><a href="#">link</a></li>\n</ul>'
    )
  })

  it('treats custom elements as block elements', () => {
    expect(format('<div><my-comp></my-comp></div>')).toBe(
      '<div>\n  <my-comp></my-comp>\n</div>'
    )
  })

  it('puts comments on their own line', () => {
    expect(format('<div><p>a</p><!--v-if--></div>')).toBe(
      '<div>\n  <p>a</p>\n  <!--v-if-->\n</div>'
    )
  })

  it('continues inline content after a block element', () => {
    expect(format('<div><p>a</p>text<b>bold</b></div>')).toBe(
      '<div>\n  <p>a</p>text<b>bold</b>\n</div>'
    )
  })

  it('indents block elements nested in inline elements', () => {
    expect(format('<div><svg><path d="x"></path></svg></div>')).toBe(
      '<div><svg>\n    <path d="x"></path>\n  </svg></div>'
    )
  })

  it('collapses whitespace in text', () => {
    expect(format('<div>  lots   of\n\n spaces  </div>')).toBe(
      '<div> lots of\n  spaces </div>'
    )
    expect(format('<div>\n  text\n</div>')).toBe('<div>\n  text\n</div>')
  })

  it('drops whitespace around block elements', () => {
    expect(format('<div>\n  <p>a</p>\n  <p>b</p>\n</div>')).toBe(
      '<div>\n  <p>a</p>\n  <p>b</p>\n</div>'
    )
  })

  it('keeps the content of unformatted elements as it is', () => {
    expect(format('<div><pre>  a\n   b</pre></div>')).toBe(
      '<div>\n  <pre>  a\n   b</pre>\n</div>'
    )
    expect(format('<div><span>  <div>x</div></span></div>')).toBe(
      '<div><span>  <div>x</div></span></div>'
    )
    expect(format('<div><textarea>  a\n b</textarea></div>')).toBe(
      '<div><textarea>  a\n b</textarea></div>'
    )
  })

  it('formats the content of a template element', () => {
    expect(format('<div><template><p>x</p></template></div>')).toBe(
      '<div><template>\n    <p>x</p>\n  </template></div>'
    )
  })

  it('escapes text and attributes', () => {
    expect(
      format('<div title="a &amp; &quot;b&quot;">&lt;x&gt; &amp;&nbsp;y</div>')
    ).toBe('<div title="a &amp; &quot;b&quot;">&lt;x&gt; &amp;&nbsp;y</div>')
  })

  it('formats text and comment nodes', () => {
    expect(format('  some   text ')).toBe('some text')
    expect(format('<!-- comment -->')).toBe('<!-- comment -->')
  })
})
