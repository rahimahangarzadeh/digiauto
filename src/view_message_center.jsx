/* Frontend-only message center */

function MessageCenterView() {
  const [activeChat, setActiveChat] = React.useState('admin');
  const chats = [
    { id:'admin', initial:'A', name:'Nachricht an Admin', preview:'Hallo, ich habe eine Frage zu den Unterlagen ...', time:'09:14', unread:1, tone:'beige' },
    { id:'personal', initial:'P', name:'Personalabteilung', preview:'Vielen Dank für Ihre Nachricht.', time:'Gestern', tone:'yellow' },
    { id:'safety', initial:'S', name:'Sicherheitsteam', preview:'Unterweisung Brandschutz - Teilnahme bestätigt.', time:'Di.', tone:'green' },
  ];
  const uploads = [
    ['doc', 'Meine Zertifikate', 'Zertifikate und Qualifikationen'],
    ['flag', 'Meine Unterweisungen', 'Teilnahmebescheinigungen'],
    ['shield', 'Meine Untersuchungsvorsorge', 'Vorsorgenachweise'],
    ['doc', 'Meine Stellenbeschreibung', 'Aktuelle Stellenbeschreibung'],
    ['users', 'Mein Führerschein', 'Führerschein und Nachweise'],
  ];

  return (
    <div className="message-center">
      <header className="message-center__heading">
        <div>
          <h1>Nachrichtenzentrale</h1>
          <p>Ihre zentrale Anlaufstelle für Nachrichten und den Austausch von Dokumenten.</p>
        </div>
      </header>

      <div className="message-center__grid">
        <aside className="message-panel message-inbox">
          <div className="message-search-row">
            <label className="message-search"><Icon name="search" size={18} /><input placeholder="Unterhaltungen suchen..." /></label>
            <button title="Unterhaltungen filtern"><Icon name="filter" size={18} /></button>
          </div>

          <nav className="message-folders">
            <button className="is-active"><Icon name="mail" size={18} /><strong>Posteingang</strong><span>2</span></button>
            <button><Icon name="users" size={18} />An Admin</button>
            <button><Icon name="clock" size={18} />Archiv</button>
          </nav>

          <h3>Unterhaltungen</h3>
          <div className="message-chat-list">
            {chats.map(chat => (
              <button key={chat.id} className={activeChat === chat.id ? 'is-active' : ''} onClick={() => setActiveChat(chat.id)}>
                <span className={'message-avatar is-' + chat.tone}>{chat.initial}</span>
                <span className="message-chat-copy"><strong>{chat.name}</strong><small>{chat.preview}</small></span>
                <span className="message-chat-meta"><small>{chat.time}</small>{chat.unread ? <b>{chat.unread}</b> : null}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="message-panel message-conversation">
          <header>
            <span className="message-avatar is-beige">A</span>
            <div><h2>Nachricht an Admin</h2><p>Admin hat vollständigen Verlauf</p></div>
            <button className="message-menu-dots" title="Mehr Optionen">⋮</button>
          </header>

          <div className="message-thread">
            <div className="message-day-chip">Heute</div>
            <div className="message-bubble is-own">
              Hallo, ich habe eine Frage zu den Unterlagen, die ich hochladen soll. Welche Dokumente werden für meine Unterlagen benötigt?
              <small>09:14 <b>✓✓</b></small>
            </div>
            <div className="message-reply">
              <span className="message-person"><Icon name="users" size={17} /></span>
              <div className="message-bubble">
                Hallo! Für deine Unterlagen benötigen wir deine Zertifikate, Unterweisungen und - falls vorhanden - die Untersuchungsvorsorge. Details findest du in den Upload-Kategorien rechts.
                <small>09:16</small>
              </div>
            </div>
            <div className="message-bubble is-own">
              Super, vielen Dank! Kann ich die Nachweise als PDF oder Bilddatei hochladen?
              <small>09:17 <b>✓✓</b></small>
            </div>
            <div className="message-reply">
              <span className="message-person"><Icon name="users" size={17} /></span>
              <div className="message-bubble">
                Ja, bitte lade die Dateien als PDF oder JPG hoch. Bei weiteren Fragen melde dich jederzeit.
                <small>09:18</small>
              </div>
            </div>
          </div>

          <footer className="message-compose">
            <button title="Dokument anhängen"><Icon name="link" size={18} /></button>
            <div><textarea placeholder="Nachricht schreiben..." /><small>Drücken Sie Enter zum Senden</small></div>
            <button className="is-primary">Senden</button>
          </footer>
        </section>

        <aside className="message-center__right">
          <section className="message-panel message-upload">
            <header><div><h2>Dokumente hochladen</h2><p>Wählen Sie die passende Kategorie aus.</p></div><span><Icon name="upload" size={18} /></span></header>
            <div>{uploads.map(([icon,title,sub]) => <button key={title}><Icon name={icon} size={19} /><span><strong>{title}</strong><small>{sub}</small></span><Icon name="chevR" size={16} /></button>)}</div>
          </section>

          <section className="message-panel message-help">
            <header><h2>Schnellhilfe</h2><span>?</span></header>
            <div><Icon name="doc" size={18} /><p><strong>Dateien als PDF oder JPG hochladen</strong><small>Achten Sie auf gute Lesbarkeit der Dokumente.</small></p></div>
            <div><Icon name="mail" size={18} /><p><strong>Bei Fragen direkt Admin anschreiben</strong><small>Wir helfen schnell und unkompliziert.</small></p></div>
          </section>
        </aside>
      </div>
    </div>
  );
}

window.MessageCenterView = MessageCenterView;
