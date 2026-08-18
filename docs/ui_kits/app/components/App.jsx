/**
 * App — the shell that composes the workspace into one product surface.
 *
 * WHAT THIS IS. The captured source is a marketing and lead-generation website,
 * not an application, so this kit does not claim to reproduce an existing
 * CODECAVE screen. It is the design system APPLIED to a denser surface — an
 * internal delivery workspace — to prove the tokens survive contact with real
 * product density: a persistent rail, a scrolling thread, a composer, selection
 * and unread states, and a form inside a scroll container.
 *
 * Everything visual still comes from ../../colors_and_type.css. Domain content is
 * first-party: the six pods are the six services from source_examples/header/
 * menu.ts, titled by outcome exactly as the site titles them.
 *
 * Composition: Sidebar + AssistantsList + ChatArea (which mounts MessageBubble
 * and InputBar). Three columns collapse to two at 75rem and one at 48rem.
 */
function App() {
  const { Sidebar, AssistantsList, ChatArea } = window;

  const sections = [
    { id: 'pods',      label: 'Delivery pods', glyph: '◱', count: 6, live: false },
    { id: 'briefs',    label: 'Briefs',        glyph: '✎', count: 2, live: false },
    { id: 'warranty',  label: 'Warranty',      glyph: '◷', count: 0, live: false },
    { id: 'consults',  label: 'Consultations', glyph: '✆', count: 0, live: true  },
  ];

  /* The six services from header/menu.ts, verbatim in name and outcome. */
  const pods = [
    {
      id: 'devops', glyph: '☁', name: 'Cloud & DevOps',
      outcome: 'Optimize costs. Protect your Data',
      summary: 'Cost review returned; awaiting your call on the migration window.',
      updated: '12 minutes ago', unread: 2,
    },
    {
      id: 'ecommerce', glyph: '⛬', name: 'E-Commerce',
      outcome: 'Maximize revenue, dominate Markets',
      summary: 'Checkout rebuild scoped into three milestones.',
      updated: 'Today, 09:20', unread: 1,
    },
    {
      id: 'autodesk', glyph: '⧉', name: 'Autodesk plugins',
      outcome: '10x efficiency with custom Plugins',
      summary: 'Revit add-in signed and shipped to the pilot team.',
      updated: 'Yesterday', unread: 0,
    },
    {
      id: 'automation', glyph: '⚡', name: 'Automation & AI',
      outcome: 'Leverage virtual Workforce',
      summary: 'Two workflows queued for review before we automate them.',
      updated: 'Yesterday', unread: 1,
    },
    {
      id: 'hubspot', glyph: '⛁', name: 'HubSpot',
      outcome: 'Aggregate data from all your Tools',
      summary: 'Pipeline mapping agreed; ETL contract drafted.',
      updated: '2 days ago', unread: 0,
    },
    {
      id: 'arvr', glyph: '◲', name: 'AR & VR',
      outcome: 'Stunning visualisations for your business',
      summary: 'Configurator prototype ready for a walkthrough.',
      updated: '3 days ago', unread: 0,
    },
  ];

  const threads = {
    devops: [
      {
        id: 'd1', day: 'Monday', author: 'Yaroslav Zhmayev', initials: 'YZ',
        time: '09:14', direction: 'in',
        body: [
          'We finished the cost review on your staging cluster. Nothing here needs a rewrite — the spend is concentrated in three places, and two of them are configuration rather than architecture.',
        ],
        bullets: [
          'Idle node pools kept warm outside business hours',
          'Snapshot retention set indefinitely on non-production volumes',
          'Egress from the reporting job, which can move next to the data',
        ],
        actions: ['Open the cost review', 'Book the walkthrough'],
      },
      {
        id: 'd2', day: 'Monday', author: 'You', initials: 'AC',
        time: '11:02', direction: 'out',
        body: [
          'Useful, thank you. The retention setting is news to us. What does the migration window look like if we take all three?',
        ],
      },
      {
        id: 'd3', day: 'Today', author: 'Yaroslav Zhmayev', initials: 'YZ',
        time: '08:47', direction: 'in',
        body: [
          'Scope, milestones and outcomes are in the plan below. The first two changes are reversible and need no downtime. The third moves a job, so we would take a maintenance window — a weekday evening is enough.',
          'The warranty period starts when the last milestone signs off, and we are ready to sign an NDA before you send us any infrastructure detail. Your idea stays yours.',
        ],
        actions: ['Review the plan', 'Sign the NDA'],
      },
    ],
    ecommerce: [
      {
        id: 'e1', day: 'Today', author: 'Delivery pod', initials: 'CC',
        time: '09:20', direction: 'in',
        body: [
          'Checkout rebuild is scoped into three milestones, each independently shippable. We would rather you could stop after the first than commit to all three up front.',
        ],
        bullets: [
          'Milestone 1 — payment step, one page, no address re-entry',
          'Milestone 2 — saved carts and returning-customer flow',
          'Milestone 3 — tax and shipping rules moved out of the template',
        ],
        actions: ['Open the scope'],
      },
    ],
    autodesk: [
      {
        id: 'a1', day: 'Yesterday', author: 'Delivery pod', initials: 'CC',
        time: '16:30', direction: 'in',
        body: [
          'The Revit add-in is signed and installed for the pilot team. Warranty is open, so send anything that looks wrong straight here rather than filing it internally.',
        ],
        actions: ['Installation notes'],
      },
    ],
    automation: [
      {
        id: 'n1', day: 'Yesterday', author: 'Delivery pod', initials: 'CC',
        time: '14:05', direction: 'in',
        body: [
          'Two workflows are queued. Before automating either, we want to watch them run once with your team — automation applied to a process nobody agrees on just makes the disagreement faster.',
        ],
        actions: ['Pick a session'],
      },
    ],
    hubspot: [
      {
        id: 'h1', day: '2 days ago', author: 'Delivery pod', initials: 'CC',
        time: '10:40', direction: 'in',
        body: [
          'Pipeline mapping is agreed and the ETL contract is drafted. One open question: deals closed before the migration — do they come across with their original owners, or all to a single archive owner?',
        ],
        actions: ['Answer in the brief'],
      },
    ],
    arvr: [
      {
        id: 'r1', day: '3 days ago', author: 'Delivery pod', initials: 'CC',
        time: '11:15', direction: 'in',
        body: [
          'The configurator prototype runs in the browser on a mid-range phone. Worth a walkthrough before we decide how far the material library should go.',
        ],
        actions: ['Book a walkthrough'],
      },
    ],
  };

  const [activeSection, setActiveSection] = React.useState('pods');
  const [activeId, setActiveId] = React.useState('devops');
  const [extra, setExtra] = React.useState({});
  const [scope, setScope] = React.useState([
    { id: 'nda',      label: 'Under NDA',        on: true  },
    { id: 'estimate', label: 'Needs estimate',   on: false },
    { id: 'urgent',   label: 'Blocking delivery', on: false },
  ]);

  const activePod = pods.find((p) => p.id === activeId) || pods[0];
  const messages = (threads[activeId] || []).concat(extra[activeId] || []);

  const toggleScope = (id) =>
    setScope((prev) => prev.map((s) => (s.id === id ? { ...s, on: !s.on } : s)));

  const send = (text) => {
    const now = new Date();
    const entry = {
      id: `sent-${activeId}-${now.getTime()}`,
      day: 'Today',
      author: 'You',
      initials: 'AC',
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      direction: 'out',
      body: [text],
    };
    setExtra((prev) => ({ ...prev, [activeId]: (prev[activeId] || []).concat(entry) }));
  };

  return (
    <div className="kit-shell" data-od-id="kit-shell">
      <Sidebar
        sections={sections}
        activeSection={activeSection}
        onNavigate={setActiveSection}
        onNewBrief={() => setActiveSection('briefs')}
      />
      <AssistantsList pods={pods} activeId={activeId} onSelect={setActiveId} />
      <ChatArea
        pod={activePod}
        messages={messages}
        scope={scope}
        onToggleScope={toggleScope}
        onSend={send}
      />
    </div>
  );
}

window.App = App;
