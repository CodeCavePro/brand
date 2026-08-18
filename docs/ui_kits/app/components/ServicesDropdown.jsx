/* ServicesDropdown — the header's services rail.
 *
 * Sources: source_examples/header/menu.ts (the data, verbatim)
 *          source_examples/header/services-list.vue (the two-column layout)
 *
 * Every service is titled by the OUTCOME, not the stack. That is a voice rule
 * with a layout consequence: each row needs two lines, so the rail is a grid of
 * icon-tile + name + outcome, never a plain link list.
 */

/* Icons are redrawn as inline strokes because the source icons are Vue SFCs
   (assets/icons/*.vue) that were not part of the captured snapshot. They are
   plain geometry, not brand marks — the real brand marks are loaded as files
   from build/ elsewhere in this kit. */
const KitIcon = {
  cloud: (
    <path d="M6.5 18h11a3.5 3.5 0 0 0 .5-6.96A5.5 5.5 0 0 0 7.6 9.2 4 4 0 0 0 6.5 18Z" />
  ),
  cart: (
    <React.Fragment>
      <path d="M3 4h2l2.4 9.6a1 1 0 0 0 1 .8h7.6a1 1 0 0 0 1-.76L19 8H6" />
      <circle cx="9" cy="19" r="1.4" />
      <circle cx="16" cy="19" r="1.4" />
    </React.Fragment>
  ),
  widget: (
    <React.Fragment>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <path d="M17 13.5v7M13.5 17h7" />
    </React.Fragment>
  ),
  lightning: (
    <path d="M13 2 5.5 13.5H11l-1 8.5 8-12h-5.5L13 2Z" />
  ),
  database: (
    <React.Fragment>
      <ellipse cx="12" cy="5.5" rx="7" ry="2.5" />
      <path d="M5 5.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" />
      <path d="M5 11.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" />
    </React.Fragment>
  ),
  panorama: (
    <React.Fragment>
      <path d="M3 6.5c6 1.4 12 1.4 18 0v11c-6-1.4-12-1.4-18 0v-11Z" />
      <circle cx="9" cy="11" r="1.6" />
      <path d="M6 16.5 10.5 12l3.5 3 2-2 2 2.5" />
    </React.Fragment>
  ),
};

function ServiceIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
         stroke="currentColor" strokeWidth="1.5"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {KitIcon[name]}
    </svg>
  );
}

/* Verbatim from header/menu.ts — names, outcome descriptions and order. */
const SERVICES = [
  { icon: 'cloud',     name: 'Cloud & DevOps',    description: 'Optimize costs. Protect your Data' },
  { icon: 'cart',      name: 'E-Commerce',        description: 'Maximize revenue, dominate Markets' },
  { icon: 'widget',    name: 'Autodesk plugins',  description: '10x efficiency with custom Plugins' },
  { icon: 'lightning', name: 'Automation & AI',   description: 'Leverage virtual Workforce' },
  { icon: 'database',  name: 'HubSpot',           description: 'Aggregate data from all your Tools' },
  { icon: 'panorama',  name: 'AR & VR',           description: 'Stunning visualisations for your business' },
];

function ServicesDropdown({ id }) {
  return (
    <div className="kit-dropdown-panel" id={id} role="menu" data-od-id="kit-services-dropdown">
      <div className="kit-dropdown-grid">
        {SERVICES.map((s) => (
          <a key={s.name} className="kit-service-link" href="#services" role="menuitem"
             data-od-id={`kit-service-link-${s.name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '')}`}>
            <span className="kit-icon-tile"><ServiceIcon name={s.icon} /></span>
            <span>
              <span className="name">{s.name}</span>
              <span className="desc">{s.description}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ServicesDropdown, ServiceIcon, SERVICES });
