import { useEffect, useRef } from 'react'
import { BoxPanel, DockPanel, Widget } from '@lumino/widgets'
import { MessageLoop } from '@lumino/messaging'
import './LuminoDockPanel.css'

export default function LuminoDockPanel({ panels, onPanelReady }) {
  const containerRef = useRef(null)
  const dockRef = useRef(null)
  const boxRef = useRef(null)
  const widgetRefsRef = useRef({})
  const contentDivsRef = useRef({})

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current

    const dock = new DockPanel({ spacing: 4 })
    dock.id = 'dock'
    dockRef.current = dock

    class PanelWidget extends Widget {
      constructor(id, title) {
        super({ node: document.createElement('div') })
        this.id = id
        this.title.label = title
        this.title.closable = true
        this.addClass('lumino-panel-widget')
        this.node.style.display = 'flex'
        this.node.style.flexDirection = 'column'
        this.node.style.overflow = 'hidden'

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

    // Attach to the container (must already be in the DOM)
    Widget.attach(box, container)

    // Explicitly size the box node to the container's measured box, then tell
    // Lumino its exact size. Lumino's BoxLayout only stretches absolutely-
    // positioned children if the host widget node itself has a concrete size;
    // relying on CSS alone leaves it at min-height (4px) here because our
    // ancestors use min-height (not a definite height).
    const fit = () => {
      const rect = container.getBoundingClientRect()
      const w = Math.max(0, Math.round(rect.width))
      const h = Math.max(0, Math.round(rect.height))
      console.log('[Lumino] container measured:', w, 'x', h)
      if (w === 0 || h === 0) return
      box.node.style.position = 'absolute'
      box.node.style.top = '0'
      box.node.style.left = '0'
      box.node.style.width = w + 'px'
      box.node.style.height = h + 'px'
      // Give Lumino the exact size so its layout engine computes real child sizes
      MessageLoop.sendMessage(box, new Widget.ResizeMessage(w, h))
      box.update()
    }

    const resizeObserver = new ResizeObserver(fit)
    resizeObserver.observe(container)

    // Kick an initial fit on the next frame in case the observer is late
    const raf = requestAnimationFrame(fit)

    // Notify parent that panels are ready
    if (onPanelReady) {
      onPanelReady(contentDivsRef.current)
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
