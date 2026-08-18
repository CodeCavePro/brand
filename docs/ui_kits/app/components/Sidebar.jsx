/**
 * Sidebar — the workspace's primary navigation.
 *
 * Source basis: source_examples/header/desktop-menu.vue (ghost-variant nav
 * items, the centred lockup, and the live-status dot that production pins to the
 * last item), header/services-list.vue (the 12px-radius icon tile on the
 * tertiary surface), and common/Button.vue for the variants used here.
 *
 * The lockup is a real preserved file — build/logo.svg, lifted byte-for-byte
 * from codecave.pro/src/assets/images/logo.svg. It is outlined vector artwork,
 * never re-typed by hand.
 *
 * Rules this component carries:
 *   - Selected state is the raised surface plus a bold label, never a violet
 *     fill: violet lives on edges and marks.
 *   - Hover raises contrast (#E8E6F0 -> #B19AFE). Nothing dims on hover.
 *   - The only primary action in the whole shell sits at the bottom of this
 *     rail, so no other surface may render a second glow button.
 */
function Sidebar({ sections, activeSection, onNavigate, onNewBrief }) {
  return (
    <aside className="kit-sidebar" data-od-id="kit-sidebar">
      <a className="kit-brand" href="#top" aria-label="CODECAVE — workspace home" data-od-id="kit-sidebar-brand">
        <img src="../../build/logo.svg" alt="CODECAVE" height="20" />
      </a>

      <nav className="kit-nav" aria-label="Workspace">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            className="kit-navitem"
            aria-current={section.id === activeSection ? 'page' : undefined}
            onClick={() => onNavigate(section.id)}
            data-od-id={`kit-nav-${section.id}`}
          >
            <span className="kit-tile" aria-hidden="true">{section.glyph}</span>
            <span style={{ flex: 1 }}>{section.label}</span>
            {section.count > 0 && <span className="kit-count">{section.count}</span>}
            {section.live && <span className="kit-dot" role="status" aria-label="Live" />}
          </button>
        ))}
      </nav>

      <div className="kit-sidebar-foot">
        <hr className="divider" />
        <p style={{
          margin: 0,
          color: 'var(--color-body-secondary-lighter)',
          fontSize: 'var(--text-caption)',
          lineHeight: 'var(--leading-caption)',
        }}>
          Scope, milestones and outcomes upfront. We are ready to sign an NDA —
          your idea stays yours.
        </p>
        <button type="button" className="btn btn-tertiary" onClick={onNewBrief} data-od-id="kit-sidebar-new-brief">
          New brief
        </button>
      </div>
    </aside>
  );
}

window.Sidebar = Sidebar;
