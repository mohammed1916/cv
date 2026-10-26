// Reuse existing widgets so changing layout never recreates React portal content.
export function createFocusedLayout(widgets) {
  const code = widgets.find(widget => widget.id === 'code') || widgets.find(widget => widget.id === 'editor');
  if (!code) return null;
  const playground = code.id === 'editor';
  const timeline = playground && widgets.find(widget => widget.id === 'timeline');
  const configuration = playground && widgets.find(widget => widget.id === 'configuration');
  const visuals = widgets.filter(widget => widget !== code && widget !== timeline && widget !== configuration);
  if (!visuals.length) return null;
  const preview = visuals.find(widget => ['preview', 'visualization', 'canvas', 'array'].includes(widget.id));
  if (preview) visuals.splice(0, 0, ...visuals.splice(visuals.indexOf(preview), 1));
  const main = {
    type: 'split-area', orientation: 'horizontal', sizes: [0.58, 0.42], children: [
      { type: 'tab-area', widgets: visuals, currentIndex: 0 },
      { type: 'tab-area', widgets: configuration ? [code, configuration] : [code], currentIndex: 0 },
    ],
  };
  return { main: timeline ? {
    type: 'split-area', orientation: 'vertical', sizes: [0.78, 0.22],
    children: [main, { type: 'tab-area', widgets: [timeline], currentIndex: 0 }],
  } : main };
}
