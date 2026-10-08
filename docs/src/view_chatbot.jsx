function ChatbotView({ activeCompany, role }) {
  const firstName = window.demoIdentityForRole ? window.demoIdentityForRole(role).firstName : 'Rahim';
  const [query, setQuery] = React.useState('');

  const promptGroups = [
    {
      title: 'Personal',
      icon: 'users',
      prompts: [
        'Welche Mitarbeiter haben ablaufende Zertifikate?',
        'Welche Mitarbeiter haben offene Unterweisungen?',
        'Welche Mitarbeiter haben keine gültige Erste-Hilfe-Schulung?',
      ],
    },
    {
      title: 'Dokumente',
      icon: 'doc',
      prompts: [
        'Welche Dokumente fehlen bei Markus Brinker?',
        'Welche Zertifikate sind abgelaufen?',
        'Welche Nachweise sind noch nicht freigegeben?',
      ],
    },
    {
      title: 'Termine',
      icon: 'cal',
      prompts: [
        'Welche Schulungen laufen in den nächsten 30 Tagen ab?',
        'Welche Termine sind diese Woche geplant?',
        'Welche Audits sind bald fällig?',
      ],
    },
    {
      title: 'Baustellen',
      icon: 'building',
      prompts: [
        'Welche Mitarbeiter sind auf der Baustelle Nordhorn eingetragen?',
        'Welche Unterweisungen fehlen für diese Baustelle?',
        'Welche Baustellen haben offene Personal-Prüfungen?',
      ],
    },
  ];

  const quickStarts = [
    {
      title: 'Offene Aufgaben',
      icon: 'check',
      text: 'Offene Unterweisungen, fehlende Dokumente und ablaufende Zertifikate prüfen',
      prompt: 'Welche offenen Aufgaben gibt es aktuell?',
    },
    {
      title: 'Mitarbeiter prüfen',
      icon: 'users',
      text: 'Mitarbeiter suchen und Nachweise auf einen Blick sehen',
      prompt: 'Prüfe bitte die Nachweise von Markus Brinker.',
    },
    {
      title: 'Dokumente finden',
      icon: 'search',
      text: 'Zertifikate, Unterweisungen und Freigaben schnell suchen',
      prompt: 'Welche Dokumente fehlen aktuell?',
    },
    {
      title: 'Termine prüfen',
      icon: 'cal',
      text: 'Nächste Schulungen, Audits und Prüfungen anzeigen',
      prompt: 'Welche Termine sind diese Woche geplant?',
    },
  ];

  const submit = () => {
    if (!query.trim()) return;
  };

  return (
    <div className="chatbot-page chatbot-page--home">
      <section className="chatbot-home">
        <header className="chatbot-home__hero">
          <img src="assets/janning-logo-sechseck.png" alt="Janning Group" />
          <div>
            <h2>Hallo, {firstName}</h2>
            <p>Ich helfe dir bei Zertifikaten, Unterweisungen, Dokumenten, Terminen und offenen Nachweisen.</p>
          </div>
        </header>

        <div className="chatbot-home__composer">
          <textarea
            value={query}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder="Wie kann ich dir heute helfen?"
          />
          <div className="chatbot-home__composer-actions">
            <button type="button" aria-label="Anlage hinzufügen">+</button>
            <div>
              <button type="button" aria-label="Spracheingabe"><Icon name="mic" size={26} /></button>
              <button type="button" aria-label="Voice-Modus" className="chatbot-voice-bars"><span /><span /><span /><span /><span /></button>
            </div>
          </div>
        </div>

        <div className="chatbot-home__prompt-groups" aria-label="Beispielfragen">
          {promptGroups.map(group => (
            <section className="chatbot-home__prompt-group" key={group.title}>
              <div className="chatbot-home__prompt-heading">
                <Icon name={group.icon} size={25} />
                <h3>{group.title}</h3>
              </div>
              <div className="chatbot-home__prompt-list">
                {group.prompts.map(prompt => (
                  <button key={prompt} type="button" onClick={() => setQuery(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="chatbot-home__quickstarts" aria-label="Schnellstart">
          {quickStarts.map(card => (
            <button
              className="chatbot-home__quick-card"
              key={card.title}
              type="button"
              onClick={() => setQuery(card.prompt)}>
              <span className="chatbot-home__quick-icon"><Icon name={card.icon} size={28} /></span>
              <span>
                <strong>{card.title}</strong>
                <small>{card.text}</small>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { ChatbotView });
