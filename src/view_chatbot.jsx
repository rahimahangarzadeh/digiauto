function ChatbotView({ activeCompany, role }) {
  const firstName = window.demoIdentityForRole ? window.demoIdentityForRole(role).firstName : 'Rahim';
  const [query, setQuery] = React.useState('');

  const prompts = [
    'Welche Mitarbeiter haben ablaufende Zertifikate?',
    'Welche Unterweisungen fehlen bei Markus Brinker?',
    'Welche Schulungen laufen in den nächsten 30 Tagen ab?',
    'Welche Mitarbeiter haben keine gültige Erste-Hilfe-Schulung?',
    'Welche Mitarbeiter haben offene Unterweisungen?',
    'Welche Mitarbeiter sind auf der Baustelle Nordhorn eingetragen?',
    'Welche Audits sind bald fällig?',
    'Welche Mitarbeiter haben eine gültige Führerscheinkontrolle?',
    'Welche Geräteführer dürfen Radlader fahren?',
    'Welche Termine sind diese Woche geplant?',
    'Welche Zertifikate sind abgelaufen?',
  ];

  const submit = () => {
    if (!query.trim()) return;
  };

  return (
    <div className="chatbot-page chatbot-page--home">
      <section className="chatbot-home">
        <header className="chatbot-home__hero">
          <img src="assets/janning-logo-sechseck.png" alt="Janning Group" />
          <h2>Hallo, {firstName}</h2>
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

        <div className="chatbot-home__prompts" aria-label="Beispielfragen">
          {prompts.map(prompt => (
            <button key={prompt} type="button" onClick={() => setQuery(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { ChatbotView });
