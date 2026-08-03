import { useEffect, useRef } from 'react'
import { BoxPanel, DockPanel, Widget } from '@lumino/widgets'
import { MessageLoop } from '@lumino/messaging'
import './LuminoDockPanel.css'

// Fraction of a split area a collapsed panel is allowed to keep. Small enough
// that only its ~36px tab strip shows; siblings take the rest.
const COLLAPSED_FRACTION = 0.0001

export default function LuminoDockPanel({ panels, onPanelReady }) {
  const containerRef = useRef(null)
  const dockRef = useRef(null)
  const boxRef = useRef(null)
  const widgetRefsRef = useRef({})
  const contentDivsRef = useRef({})
  // Layout snapshot taken the first time a panel is minimized, so restore can
  // return split fractions to their pre-collapse values.
  const savedSizesRef = useRef({})
  // Points at applyCollapse so the per-widget minimize button (created in the
  // PanelWidget constructor) can invoke it once defined below.
  const collapseCallbackRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current

    const dock = new DockPanel({ spacing: 6 })
    dock.id = 'dock'
    dockRef.current = dock

    class PanelWidget extends Widget {
      constructor(id, title) {
        super({ node: document.createElement('div') })
        this.id = id
        this.title.label = title
        // Not closable — we provide a minimize (collapse) control instead of
        // Lumino's destructive close.
        this.title.closable = false
        this.addClass('lumino-panel-widget')
        this.node.style.display = 'flex'
        this.node.style.flexDirection = 'column'
        this.node.style.overflow = 'hidden'
        this.node.style.position = 'relative'

        // Minimize/restore button pinned to the panel's top-right corner.
        // Stays visible even when the body is collapsed.
        const minBtn = document.createElement('button')
        minBtn.type = 'button'
        minBtn.className = 'lumino-panel-minbtn'
        minBtn.title = 'Minimize panel'
        minBtn.setAttribute('aria-label', 'Minimize panel')
        minBtn.textContent = '—'
        minBtn.addEventListener('click', (e) => {
          e.stopPropagation()
          this._collapsed = !this._collapsed
          minBtn.textContent = this._collapsed ? '▢' : '—'
          minBtn.title = this._collapsed ? 'Restore panel' : 'Minimize panel'
          collapseCallbackRef.current?.(id, this._collapsed)
        })
        this.node.appendChild(minBtn)
        this._collapsed = false

        const contentDiv = document.createElement('div')
        contentDiv.style.flex = '1'
        contentDiv.style.overflow = 'auto'
        contentDiv.style.display = 'flex'
        contentDiv.style.flexDirection = 'column'
        contentDiv.setAttribute('data-panel-id', id)
        this.node.appendChild(contentDiv)
        contentDivsRef.current[id] = contentDiv
      }
    }

    // Create and add all widgets
    panels.forEach((panelConfig, index) => {
      const widget = new PanelWidget(panelConfig.id, panelConfig.title)
      widgetRefsRef.current[panelConfig.id] = widget

      if (index === 0) {
        dock.addWidget(widget)
      } else {
        const refWidget = widgetRefsRef.current[panels[0].id]
        dock.addWidget(widget, {
          mode: panelConfig.dockMode || 'split-right',
          ref: refWidget,
        })
      }
    })

    // Use BoxPanel to manage dock sizing
    const box = new BoxPanel({ direction: 'top-to-bottom', spacing: 0 })
    box.id = 'lumino-box'
    box.addWidget(dock)
    BoxPanel.setStretch(dock, 1)
    boxRef.current = box

    Widget.attach(box, container)

    const fit = () => {
      const rect = container.getBoundingClientRect()
      const w = Math.max(0, Math.round(rect.width))
      const h = Math.max(0, Math.round(rect.height))
      if (w === 0 || h === 0) return
      box.node.style.position = 'absolute'
      box.node.style.top = '0'
      box.node.style.left = '0'
      box.node.style.width = w + 'px'
      box.node.style.height = h + 'px'
      MessageLoop.sendMessage(box, new Widget.ResizeMessage(w, h))
      box.update()
    }

    const resizeObserver = new ResizeObserver(fit)
    resizeObserver.observe(container)
    const raf = requestAnimationFrame(fit)

    // ── Minimize / restore ────────────────────────────────────────────
    // Walk the saveLayout() config tree, find the split-area that directly
    // contains the tab-area holding `widget`, and rewrite that child's size
    // fraction. This collapses the panel in place; siblings absorb the space.
    const findWidgetSplit = (node, widget) => {
      if (!node || node.type !== 'split-area') return null
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i]
        if (
          child.type === 'tab-area' &&
          child.widgets.some((w) => w === widget)
        ) {
          return { split: node, index: i }
        }
        const nested = findWidgetSplit(child, widget)
        if (nested) return nested
      }
      return null
    }

    const applyCollapse = (id, collapsed) => {
      const widget = widgetRefsRef.current[id]
      const contentDiv = contentDivsRef.current[id]
      if (!widget || !contentDiv) return

      // Toggle body visibility (leaves the ~36px tab strip visible)
      contentDiv.style.display = collapsed ? 'none' : 'flex'

      const config = dock.saveLayout()
      const hit = findWidgetSplit(config.main, widget)
      if (!hit) {
        // Panel isn't in a split (it's the only area) — nothing to reclaim.
        box.update()
        return
      }
      const { split, index } = hit

      if (collapsed) {
        // Remember the pre-collapse fractions once
        if (!savedSizesRef.current[id]) {
          savedSizesRef.current[id] = split.sizes.slice()
        }
        const others = split.sizes.length - 1
        const remaining = 1 - COLLAPSED_FRACTION
        split.sizes = split.sizes.map((_, i) =>
          i === index ? COLLAPSED_FRACTION : remaining / others
        )
      } else {
        const saved = savedSizesRef.current[id]
        if (saved && saved.length === split.sizes.length) {
          split.sizes = saved.slice()
        }
        delete savedSizesRef.current[id]
      }

      dock.restoreLayout(config)
      fit()
    }

    // Wire the ref so per-widget minimize buttons can call applyCollapse
    collapseCallbackRef.current = applyCollapse

    // Expose the collapse API + panel divs to the parent
    if (onPanelReady) {
      onPanelReady(contentDivsRef.current, { applyCollapse })
    }

    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      try {
        box.dispose()
      } catch (e) {
        // Already disposed
      }
    }
  }, [panels.length, onPanelReady])

  return <div ref={containerRef} className="lumino-dock-container" />
}
