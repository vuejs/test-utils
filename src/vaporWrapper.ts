import { type App, nextTick } from 'vue'
import BaseWrapper from './baseWrapper'

/** Experimental DOM mounting. `vm` contains only unwrapped expose() bindings. */
export class VaporWrapper<
  Exposed = Record<string, unknown>,
  Props = Record<string, unknown>
> extends BaseWrapper<Node> {
  private mounted = true

  constructor(
    private readonly app: App,
    readonly vm: Exposed,
    private readonly container: Element,
    private readonly updateProps: (props: Record<string, unknown>) => void
  ) {
    super(container)
    app.onUnmount(() => {
      this.mounted = false
    })
  }

  protected getRootNodes(): Node[] {
    return Array.from(this.container.childNodes)
  }

  protected findAllDOMElements(selector: string): Element[] {
    return Array.from(this.container.querySelectorAll(selector))
  }

  protected getCurrentComponent(): never {
    throw new Error(
      'Ref selectors are not supported for Vapor; use CSS selectors'
    )
  }

  get element(): Node {
    // Vapor anchors are comments in development and empty text nodes in production.
    const roots = this.getRootNodes().filter(
      node =>
        node.nodeType !== Node.COMMENT_NODE &&
        !(node.nodeType === Node.TEXT_NODE && node.nodeValue === '')
    )
    if (roots.length > 1) return this.container
    return roots[0] ?? this.container.firstChild ?? this.container
  }

  findComponent: BaseWrapper<Node>['findComponent'] = () => {
    throw new Error('Component discovery is not supported for Vapor')
  }

  findAllComponents: BaseWrapper<Node>['findAllComponents'] = () => {
    throw new Error('Component discovery is not supported for Vapor')
  }

  setProps(props: Partial<Props>): Promise<void> {
    this.updateProps(props as Record<string, unknown>)
    return nextTick()
  }

  emitted(_event?: string): never {
    throw new Error(
      'emitted is not supported for experimental Vapor mounting yet'
    )
  }

  setData(_data?: Record<string, unknown>): never {
    throw new Error('setData is not supported for Vapor')
  }

  setValue(_value?: unknown): never {
    throw new Error('Use a DOM wrapper to setValue on a Vapor component')
  }

  exists(): boolean {
    return this.mounted
  }

  unmount(): void {
    if (this.mounted) this.app.unmount()
  }
}
