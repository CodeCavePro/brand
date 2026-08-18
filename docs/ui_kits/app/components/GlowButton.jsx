/**
 * GlowButton — the single primary action.
 *
 * Source: source_examples/common/GlowButton.vue
 *   h-11 px-6 py-1 rounded-full bg-primary-210, label in primary-670 bold,
 *   box-shadow 0 0 64px #7A58FFA8, 0 0 16px #4F22FFA6, 0 0 4px 2px #5B34FA,
 *   a:active { transform: scale(0.98) }.
 *
 * Three light sources, all reproduced here:
 *   1. the static halo (box-shadow, in .btn-glow);
 *   2. a blurred highlight travelling under the fill, resting at 20% / 50%;
 *   3. two edge blooms 8px outside each end, cross-faded from pointer X across
 *      the outer 10% of the width — hence the .btn-glow-field wrapper, since
 *      the pill is overflow:hidden and would clip them.
 *
 * The fill itself never changes colour. There is no hover background state.
 *
 * Production drives 2 and 3 with gsap.quickTo (duration 0.5, power2.out; leave
 * tween duration 1, delay 1). GSAP is not loaded here, so the same values are
 * written into CSS custom properties and the edge cross-fade rides the
 * wrapper's own opacity transition.
 *
 * Rule this component enforces: at most ONE per action. If you find yourself
 * rendering two in a viewport, one of them is a .btn-tertiary.
 */
function GlowButton({ children, onClick, type = 'button', disabled = false }) {
  const fieldRef = React.useRef(null);
  const btnRef = React.useRef(null);

  // Matches the edgeZone constant in GlowButton.vue.
  const EDGE_ZONE = 0.1;

  const track = (event) => {
    const field = fieldRef.current;
    const btn = btnRef.current;
    if (!field || !btn) return;
    const box = btn.getBoundingClientRect();
    const percentX = (event.clientX - box.left) / box.width;
    btn.style.setProperty('--glow-x', `${percentX * 100}%`);

    let left = 0;
    let right = 0;
    if (percentX < EDGE_ZONE) left = 1 - percentX / EDGE_ZONE;
    else if (percentX > 1 - EDGE_ZONE) right = (percentX - (1 - EDGE_ZONE)) / EDGE_ZONE;
    field.style.setProperty('--edge-left', left);
    field.style.setProperty('--edge-right', right);
  };

  const reset = () => {
    const field = fieldRef.current;
    const btn = btnRef.current;
    if (btn) btn.style.removeProperty('--glow-x');
    if (field) {
      field.style.removeProperty('--edge-left');
      field.style.removeProperty('--edge-right');
    }
  };

  return (
    <span className="btn-glow-field" ref={fieldRef} onMouseMove={track} onMouseLeave={reset}>
      <button
        ref={btnRef}
        type={type}
        className="btn btn-glow"
        onClick={onClick}
        disabled={disabled}
        data-od-id="kit-glow-button"
      >
        <span>{children}</span>
      </button>
    </span>
  );
}

window.GlowButton = GlowButton;
