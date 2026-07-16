import { Widget } from '@lumino/widgets'
import { createRoot } from 'react-dom/client'

export class ReactWidget extends Widget {
  constructor(title, component) {
    super({ node: document.createElement('div') })
    this.component = component
    this.root = null
    this.title.label = title
    this.title.closable = true
    this.addClass('react-widget')
  }

  onAfterAttach() {
    if (!this.root) {
      this.root = createRoot(this.node)
      this.root.render(this.component)
    }
  }

  onBeforeDetach() {
    if (this.root) {
      this.root.unmount()
      this.root = null
    }
  }

  dispose() {
    if (this.root) {
      this.root.unmount()
      this.root = null
    }
    super.dispose()
  }
}
