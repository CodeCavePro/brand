/**
 * MessageBubble — one entry in the workspace thread.
 *
 * Source basis: source_examples/common/Review.vue (avatar + attributed body on a
 * rounded surface) and common/ArticlePreview.vue (rounded-[2.25rem] card that
 * lifts from surface-secondary to surface-tertiary, never with a shadow).
 *
 * The rule this component carries: a card separates from the page with radius
 * and a 1px #2E2C33 border — never a drop shadow. Only section panels glow, and
 * only upward. Outgoing messages take the raised surface plus a violet edge,
 * because violet in this system lives on edges, not in fills.
 */
function MessageBubble({ author, initials, time, direction = 'in', body, bullets, actions }) {
  const isOut = direction === 'out';

  return (
    <article
      className={`kit-msg ${isOut ? 'kit-msg-out' : ''}`}
      data-od-id={`kit-message-${direction}`}
    >
      <span className="kit-avatar" aria-hidden="true">{initials}</span>
      <div className="kit-msg-body">
        <header className="kit-msg-meta">
          <span className="kit-msg-who">{author}</span>
          <time className="kit-msg-time">{time}</time>
        </header>

        {body.map((paragraph, i) => <p key={i}>{paragraph}</p>)}

        {bullets && bullets.length > 0 && (
          <ul className="kit-msg-list">
            {bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}

        {actions && actions.length > 0 && (
          <footer className="kit-msg-foot">
            {actions.map((action) => (
              <button key={action} type="button" className={`btn ${isOut ? 'btn-text' : 'btn-tertiary'}`}>
                {action}
              </button>
            ))}
          </footer>
        )}
      </div>
    </article>
  );
}

window.MessageBubble = MessageBubble;
