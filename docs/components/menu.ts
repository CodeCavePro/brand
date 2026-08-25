/* The documentation site's menu, in one place.
 *
 * WHY THIS FILE EXISTS. The main menu used to be four items written inline in
 * DsNav.astro, and the sub-nav was seven anchors written inline in
 * brand-kit.astro whose own comment said "no other page has it". So there was
 * one bar defined in the component that renders it and one bar defined in the
 * single page that happened to want it, which is exactly the arrangement that
 * makes "the menu is the same everywhere" unverifiable -- there was no `menu`
 * to compare a page against.
 *
 * THE RULE THE TWO TIERS FOLLOW, and they are not the same rule:
 *
 *   MAIN is layout-owned. DocPage renders it on every page and a page cannot
 *   add, remove or reorder an item -- there is no prop for it, deliberately.
 *   The only thing a page contributes is which item is current, and that is a
 *   name from this file rather than a string of its own.
 *
 *   SUB is section-owned. It changes per section by design: inside the kitchen
 *   sink it is in-page anchors, inside the examples it is sibling pages. What
 *   it may not do is vary per PAGE within one section, which is what keeps it a
 *   navigation bar rather than a table of contents.
 *
 * Hrefs are root-relative-to-docs and get `up` prefixed by the renderer, not
 * written with `../` here. A page still has to open from disk -- that is how the
 * artifact wrappers are reviewed -- so absolute paths are not an option, and
 * baking the depth into this file would mean a second copy per level.
 */

export interface MenuItem {
  /** Stable id. `current` is matched on this, so labels stay free to change. */
  name: string;
  label: string;
  /** Relative to the docs root; the renderer prefixes `up`. */
  href: string;
}

/** The main menu. Three items, because there are three surfaces.
 *
 *  In reading order rather than any order of importance: the guides say what
 *  the rules ARE, the kitchen sink shows a part, the examples show the parts
 *  composed. A reader who follows the bar left to right goes from prose to
 *  specimen to deliverable.
 *
 *  BrandNav splits its items around the centred wordmark. With three that is
 *  two left and one right, which is arithmetic rather than a layout decision
 *  taken here. */
export const MAIN: MenuItem[] = [
  {
    name: 'guides',
    label: 'Guides',
    href: 'guides/index.html',
  },
  {
    name: 'kitchen-sink',
    label: 'Kitchen sink',
    href: 'kitchen-sink/index.html',
  },
  {
    name: 'examples',
    label: 'Examples',
    href: 'examples/index.html',
  },
];

/** Sections that carry a second bar without being a MAIN item.
 *
 *  Exactly one: `home`. The wordmark is its menu entry -- BrandNav's logo links
 *  there -- so putting it in MAIN as well would give the home page two entries
 *  in the same bar. It still needs a second tier, because the brand narrative
 *  moved onto it and that page is long. */
export const UNLISTED = ['home'];

/** The second bar, keyed by the section it sits under.
 *
 *  Every key must be a MAIN `name` or listed in UNLISTED; assertMenu() below
 *  fails the build if one is neither, because a sub-nav under a section that
 *  does not exist renders as a bar nothing can reach. */
export const SUB: Record<string, MenuItem[]> = {
  home: [
    { name: 'logo', label: 'Logo', href: 'index.html#logo' },
    { name: 'palette', label: 'Palette', href: 'index.html#palette' },
    { name: 'type', label: 'Typography', href: 'index.html#type' },
    { name: 'components', label: 'Components', href: 'index.html#components' },
    { name: 'voice', label: 'Voice', href: 'index.html#voice' },
    { name: 'posture', label: 'Layout posture', href: 'index.html#posture' },
  ],
  'kitchen-sink': [
    { name: 'tokens', label: 'Tokens & assets', href: 'kitchen-sink/index.html#tokens' },
    { name: 'css', label: 'CSS components', href: 'kitchen-sink/index.html#css-components' },
    /* Sits between the two halves it compares, because that is where a reader
       crosses from `<button class="btn">` to `<Button>` and needs to know why
       both exist. Scrolling past it is how it was missed before it was written. */
    { name: 'two-deliveries', label: 'CSS vs Vue', href: 'kitchen-sink/index.html#two-deliveries' },
    { name: 'primitives', label: 'Primitives', href: 'kitchen-sink/index.html#primitives' },
    { name: 'content', label: 'Content', href: 'kitchen-sink/index.html#content' },
    { name: 'compositions', label: 'Compositions', href: 'kitchen-sink/index.html#compositions' },
    { name: 'findings', label: 'Findings', href: 'kitchen-sink/index.html#findings' },
  ],
  /* Sibling pages, like examples/ and unlike kitchen-sink/. The order is the
     collection's reading order and has to stay in step with GUIDES in
     content.config.ts -- check:links asserts the two agree in both directions,
     which is what makes a slug rename fail here rather than in a browser. */
  guides: [
    { name: 'brand-guide', label: 'Brand guide', href: 'guides/brand-guide.html' },
    { name: 'design-rules', label: 'Design rules', href: 'guides/design-rules.html' },
    { name: 'using-the-kit', label: 'Using the kit', href: 'guides/using-the-kit.html' },
    { name: 'skill-definition', label: 'Skill definition', href: 'guides/skill-definition.html' },
  ],
  examples: [
    { name: 'deck', label: 'Deck', href: 'examples/deck.html' },
    { name: 'poster', label: 'Poster', href: 'examples/poster.html' },
    { name: 'email', label: 'Email', href: 'examples/email.html' },
    { name: 'newsletter', label: 'Newsletter', href: 'examples/newsletter.html' },
    { name: 'landing', label: 'Landing', href: 'examples/landing.html' },
    { name: 'form', label: 'Form', href: 'examples/form.html' },
  ],
};

/** Every SUB key names a MAIN item, and no two items share a name.
 *
 *  Called from DsNav so it runs during every build rather than in a check
 *  somebody has to remember to wire up. Cheap enough to run per page. */
export function assertMenu(): void {
  const names = MAIN.map((i) => i.name);
  const dupes = names.filter((n, i) => names.indexOf(n) !== i);
  if (dupes.length) {
    throw new Error(`menu.ts: duplicate MAIN name(s): ${dupes.join(', ')}`);
  }
  const known = [...names, ...UNLISTED];
  for (const key of Object.keys(SUB)) {
    if (!known.includes(key)) {
      throw new Error(
        `menu.ts: SUB["${key}"] is neither a MAIN item nor in UNLISTED.\n` +
          `Known sections: ${known.join(', ')}`,
      );
    }
  }
}
