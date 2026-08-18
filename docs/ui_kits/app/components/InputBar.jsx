/**
 * InputBar — the composer.
 *
 * Source basis: source_examples/common/InputText.vue and TextField.vue (64px
 * control, 8px radius, bold 14px label seated absolutely above the value, focus
 * drawn as a violet halo with outline:none), common/Checkbox.vue (the chip form
 * used for scoping), and common/GlowButton.vue for the send action.
 *
 * Two rules are visible here:
 *   1. Focus is a halo, never an outline — --shadow-input-focus replaces the
 *      browser ring on text controls, while non-input controls keep the global
 *      2px :focus-visible ring.
 *   2. One primary per action. The send button is the form's only glow; every
 *      other affordance in the bar is a .btn-text or a chip.
 */
function InputBar({ scope, onToggleScope, onSend }) {
  const [value, setValue] = React.useState('');
  const canSend = value.trim().length > 0;

  const submit = (event) => {
    event.preventDefault();
    if (!canSend) return;
    onSend(value.trim());
    setValue('');
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) submit(event);
  };

  return (
    <form className="kit-composer" onSubmit={submit} data-od-id="kit-composer">
      <div className="kit-composer-inner">
        <div className="field">
          <label htmlFor="kit-composer-input">Message the delivery pod</label>
          <textarea
            id="kit-composer-input"
            value={value}
            placeholder="Even a few words could make our consultation more constructive."
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>

        <div className="kit-composer-row">
          {scope.map((item) => (
            <label className="checkbox chip" key={item.id}>
              <input
                type="checkbox"
                checked={item.on}
                onChange={() => onToggleScope(item.id)}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>

        <div className="kit-composer-row">
          <span className="kit-hint">
            <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to send
          </span>
          <span className="kit-spacer" />
          <button type="button" className="btn btn-text">Attach brief</button>
          <window.GlowButton type="submit" disabled={!canSend}>
            Send to pod
          </window.GlowButton>
        </div>
      </div>
    </form>
  );
}

window.InputBar = InputBar;
