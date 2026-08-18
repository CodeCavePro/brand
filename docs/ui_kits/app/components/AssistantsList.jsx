/**
 * AssistantsList — the selectable list rail.
 *
 * Source basis: source_examples/header/services-list.vue (icon tile in a
 * surface-tertiary square, outcome-titled label, supporting line beneath) and
 * header/menu.ts, which is where these six names come from: CODECAVE titles a
 * service by the outcome it produces, never by the technology it uses.
 *
 * Selection is marked with a violet 1px edge plus the raised surface — the
 * system has no "selected fill" because violet never fills a large area.
 */
function AssistantsList({ pods, activeId, onSelect }) {
  const unread = pods.reduce((sum, pod) => sum + pod.unread, 0);

  return (
    <nav className="kit-rail" aria-label="Delivery pods" data-od-id="kit-assistants-list">
      <header className="kit-rail-head">
        <h2 className="eyebrow-lead" style={{ margin: 0 }}>
          <span className="lead">Delivery pods</span>
          <span className="eyebrow">{unread} threads awaiting you</span>
        </h2>
        <div className="field">
          <label htmlFor="kit-pod-filter">Filter</label>
          <input id="kit-pod-filter" type="search" placeholder="Search pods and threads" />
        </div>
      </header>

      <div className="kit-rail-list" role="listbox" aria-label="Delivery pods">
        {pods.map((pod) => (
          <button
            key={pod.id}
            type="button"
            role="option"
            aria-selected={pod.id === activeId}
            className="kit-rail-item"
            onClick={() => onSelect(pod.id)}
          >
            <span className="kit-rail-top">
              <span className="kit-tile" aria-hidden="true">{pod.glyph}</span>
              <span className="kit-rail-name">{pod.name}</span>
              {pod.unread > 0 && <span className="kit-count">{pod.unread}</span>}
            </span>
            <span style={{ color: 'var(--color-body-secondary-lighter)', fontSize: 'var(--text-caption)' }}>
              {pod.summary}
            </span>
            <span style={{ color: 'var(--color-body-secondary)', fontSize: 'var(--text-caption)' }}>
              {pod.updated}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}

window.AssistantsList = AssistantsList;
