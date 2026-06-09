/* Frontend-only message center */

function MessageCenterView() {
  const [activeChat, setActiveChat] = React.useState('angestellte');
  const [targetGroup, setTargetGroup] = React.useState('angestellte');
  const chats = [
    { id:'angestellte', name:'Angestellte', preview:'Neue Arbeitskleidung ab naechster Woche...', time:'09:24', unread:8, members:23, tone:'blue', sent:'Guten Morgen zusammen, ab naechster Woche gibt es neue Arbeitskleidung. Weitere Infos folgen.', replyName:'Julia Meier', replyInitial:'JM', reply:'Wann bekommen wir die genau?', reply2Name:'Markus Weber', reply2Initial:'MW', reply2:'Alles klar, danke.', answer:'Die Ausgabe ist am Montag um 08:00 Uhr im Lager.' },
    { id:'gewerbliche', name:'Gewerbliche Mitarbeiter', preview:'Baustelle Nordhorn: Uhrzeiten wurden angepasst...', time:'08:18', unread:3, members:38, tone:'green', sent:'Kurze Info: Die Startzeit auf der Baustelle Nordhorn ist morgen 07:00 Uhr.', replyName:'Dirk Juergens', replyInitial:'DJ', reply:'Ist die Verkehrssicherung dann schon vor Ort?', reply2Name:'Tobias Nowak', reply2Initial:'TN', reply2:'Ich gebe das an mein Team weiter.', answer:'Ja, Verkehrssicherung ist ab 06:30 Uhr eingeplant.' },
    { id:'geschaeftsfuehrer', name:'Geschäftsführer', preview:'Bericht fuer das naechste Meeting ist fertig...', time:'Gestern', unread:0, members:5, tone:'purple', sent:'Der Bericht fuer das naechste Meeting ist fertig und liegt in der Ablage.', replyName:'Christian Janning', replyInitial:'CJ', reply:'Bitte noch die offenen HSE-Punkte markieren.', reply2Name:'Michael Janning', reply2Initial:'MJ', reply2:'Danke, schaue ich mir an.', answer:'Erledigt, die Markierungen sind im Bericht sichtbar.' },
    { id:'azubis', name:'Azubis', preview:'Azubi-Workshop am Freitag - nicht vergessen...', time:'Gestern', unread:1, members:6, tone:'orange', sent:'Am Freitag findet der Azubi-Workshop um 09:00 Uhr im Schulungsraum statt.', replyName:'Lena Brandt', replyInitial:'LB', reply:'Sollen wir Arbeitskleidung mitbringen?', reply2Name:'Ali Yilmaz', reply2Initial:'AY', reply2:'Bin dabei.', answer:'Ja, bitte Arbeitskleidung und Sicherheitsschuhe mitbringen.' },
  ];
  const active = chats.find(chat => chat.id === activeChat) || chats[0];
  const uploads = [
    ['doc', 'Meine Zertifikate', 'Zertifikate und Qualifikationen'],
    ['flag', 'Meine Unterweisungen', 'Teilnahmebescheinigungen'],
    ['shield', 'Meine Untersuchungsvorsorge', 'Vorsorgenachweise'],
    ['doc', 'Meine Stellenbeschreibung', 'Aktuelle Stellenbeschreibung'],
    ['users', 'Mein Führerschein', 'Führerschein und Nachweise'],
  ];

  return (
    <div className="message-center message-center--groups">
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
                <span className={'message-avatar is-' + chat.tone}><Icon name="users" size={18} /></span>
                <span className="message-chat-copy"><strong>{chat.name}</strong><small>{chat.preview}</small></span>
                <span className="message-chat-meta"><small>{chat.time}</small>{chat.unread ? <b>{chat.unread}</b> : <i>0</i>}</span>
              </button>
            ))}
          </div>
          <button className="message-archive"><Icon name="mail" size={17} />Zum Archiv<Icon name="chevR" size={14} /></button>
        </aside>

        <section className="message-panel message-conversation">
          <header>
            <span className={'message-avatar is-' + active.tone}><Icon name="users" size={19} /></span>
            <div><h2>{active.name}</h2><p>Gruppe · {active.members} Mitglieder</p></div>
            <button title="Unterhaltung suchen"><Icon name="search" size={18} /></button>
            <button className="message-menu-dots" title="Mehr Optionen">⋮</button>
          </header>

          <div className="message-thread">
            <div className="message-day-chip">Heute</div>
            <div className="message-bubble is-own is-group-own">
              {active.sent}
              <small>09:14 <b>✓✓</b></small>
            </div>
            <div className="message-reply">
              <span className="message-person">{active.replyInitial}</span>
              <div className="message-bubble">
                <strong className="message-author">{active.replyName}</strong>
                {active.reply}
                <small>09:16</small>
              </div>
            </div>
            <div className="message-bubble is-own is-group-own">
              {active.answer}
              <small>09:17 <b>✓✓</b></small>
            </div>
            <div className="message-reply">
              <span className="message-person">{active.reply2Initial}</span>
              <div className="message-bubble">
                <strong className="message-author">{active.reply2Name}</strong>
                {active.reply2}
                <small>09:18</small>
              </div>
            </div>
            <div className="message-group-lock"><Icon name="shield" size={13} />Nur Gruppenmitglieder können Nachrichten senden</div>
          </div>

          <footer className="message-compose">
            <button title="Dokument anhängen"><Icon name="link" size={18} /></button>
            <div><textarea placeholder={`Nachricht an ${active.name} schreiben...`} /><small>Nur Gruppenmitglieder können Nachrichten senden</small></div>
            <button title="Senden"><Icon name="chevR" size={18} /></button>
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
            <button>Alle Hinweise anzeigen <Icon name="chevR" size={14} /></button>
          </section>
        </aside>
      </div>

      <section className="message-group-send message-panel">
        <header><h2>Nachricht an Gruppe senden</h2><p>Wählen Sie eine Zielgruppe aus, um eine Nachricht zu senden.</p></header>
        <div className="message-group-options">
          {chats.map(group => (
            <button key={group.id} className={targetGroup === group.id ? 'is-active' : ''} onClick={() => { setTargetGroup(group.id); setActiveChat(group.id); }}>
              <span className={'message-avatar is-' + group.tone}><Icon name="users" size={18} /></span>
              <span><strong>{group.name}</strong><small>Nachricht an alle {group.name === 'Azubis' ? 'Auszubildenden' : group.name} senden.</small></span>
              <i />
            </button>
          ))}
        </div>
        <footer><button className="btn btn--primary">Nachricht erstellen</button><button className="btn btn--ghost"><Icon name="chevR" size={15} /></button></footer>
      </section>
    </div>
  );
}

window.MessageCenterView = MessageCenterView;
