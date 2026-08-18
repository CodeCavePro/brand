/* SiteHeader — the app shell's top chrome.
 *
 * Sources: source_examples/header/desktop-menu.vue (structure and geometry)
 *          source_examples/header/menu.ts (nav data, verbatim)
 *          source_examples/header/mobile-menu.vue (the drawer)
 *
 * Two structural facts worth preserving: the lockup is absolutely centred
 * (three ghost links left, two right — menu.slice(0,3) / slice(3,5)), and the
 * last item carries a live-status dot. The dropdown opens on hover in
 * production; this version also opens on focus and closes on Escape, because a
 * hover-only mega-menu is unreachable by keyboard.
 */

function SiteHeader() {
  const { ServicesDropdown } = window;
  const [open, setOpen] = React.useState(false);
  const wrap = React.useRef(null);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const left = [{ name: 'Services' }, { name: 'Workflow' }, { name: 'Projects' }];
  const right = [{ name: 'Insights' }, { name: 'Contact us', dot: true }];

  return (
    <header className="kit-header" data-od-id="kit-site-header">
      <div className="page-container">
        <nav className="kit-nav" aria-label="Primary">
          <ul>
            {left.map((item) =>
              item.name === 'Services' ? (
                <li key={item.name}
                    className="kit-dropdown"
                    ref={wrap}
                    onMouseEnter={() => setOpen(true)}
                    onMouseLeave={() => setOpen(false)}>
                  <button className="btn btn-ghost"
                          aria-expanded={open}
                          aria-haspopup="true"
                          aria-controls="kit-services-panel"
                          onFocus={() => setOpen(true)}
                          onClick={() => setOpen((v) => !v)}
                          style={open ? { color: 'var(--color-hovered)' } : undefined}
                          data-od-id="kit-nav-services">
                    {item.name}
                  </button>
                  {open && <ServicesDropdown id="kit-services-panel" />}
                </li>
              ) : (
                <li key={item.name}>
                  <a className="btn btn-ghost" href={`#${item.name.toLowerCase()}`}>{item.name}</a>
                </li>
              )
            )}
          </ul>

          {/* Real preserved file — the production inline header lockup. */}
          <a className="kit-logo" href="#top" aria-label="CODECAVE — home" data-od-id="kit-header-logo">
            <img src="../../build/logo.svg" alt="CODECAVE" />
          </a>

          <ul>
            {right.map((item) => (
              <li key={item.name} className={item.dot ? 'kit-dot-item' : undefined}>
                <a className="btn btn-ghost"
                   href={`#${item.name.replace(/\s+/g, '-').toLowerCase()}`}
                   style={item.dot ? { paddingRight: '1.75rem' } : undefined}>
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

Object.assign(window, { SiteHeader });
