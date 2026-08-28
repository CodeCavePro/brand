export interface MenuItem {
  /** Stable id. `current` is matched on this, so labels stay free to change. */
  name: string;
  label: string;
  /** Relative to the docs root; the renderer prefixes `up`. */
  href: string;
}
