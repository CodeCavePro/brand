/**
 * ChatArea — the main workspace surface.
 *
 * Source basis: source_examples/services/heading.astro (the eyebrow-and-lead
 * pair that opens the region), homepage/testimonial.astro (one glow CTA paired
 * with a bordered secondary, copy never repeated), and common/ArticlePreview.vue
 * for the thread's card rhythm.
 *
 * Composes MessageBubble for each entry and mounts InputBar as the composer, so
 * the header, the thread and the composer are one continuous surface rather than
 * three stacked mocks.
 *
 * Rules this component carries:
 *   - The eyebrow opens the region and is the only typographic flourish present.
 *   - Region actions are .btn-tertiary / .btn-text. The single glow in the shell
 *     belongs to the composer's send action.
 */
function ChatArea({ pod, messages, scope, onToggleScope, onSend }) {
  const { MessageBubble, InputBar } = window;
  const thread = React.useRef(null);

  // Keep the newest entry in view without scrollIntoView, which breaks the
  // embedded preview: set scrollTop on the scroll container directly.
  React.useEffect(() => {
    const el = thread.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <main className="kit-main" data-od-id="kit-chat-area">
      <header className="kit-main-head" data-od-id="kit-chat-head">
        <h1 className="eyebrow-lead">
          <span className="lead">{pod.name}</span>
          <span className="eyebrow">{pod.outcome}</span>
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <button type="button" className="btn btn-text">Delivery plan</button>
          <button type="button" className="btn btn-tertiary">Invite engineer</button>
        </div>
      </header>

      <div className="kit-thread" ref={thread} data-od-id="kit-thread">
        <div className="kit-thread-inner">
          {messages.map((entry, i) => (
            <React.Fragment key={entry.id}>
              {(i === 0 || messages[i - 1].day !== entry.day) && (
                <p className="kit-daymark">{entry.day}</p>
              )}
              <MessageBubble
                author={entry.author}
                initials={entry.initials}
                time={entry.time}
                direction={entry.direction}
                body={entry.body}
                bullets={entry.bullets}
                actions={entry.actions}
              />
            </React.Fragment>
          ))}
        </div>
      </div>

      <InputBar scope={scope} onToggleScope={onToggleScope} onSend={onSend} />
    </main>
  );
}

window.ChatArea = ChatArea;
