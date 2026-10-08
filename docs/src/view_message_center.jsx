/* Frontend-only message center */

function MessageCenterView() {
  const [activeChat, setActiveChat] = React.useState('angestellte');
  const [targetGroup, setTargetGroup] = React.useState('angestellte');
  const [uploadFlow, setUploadFlow] = React.useState(null);
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
            <div>{uploads.map(([icon,title,sub]) => <button key={title} onClick={() => setUploadFlow(title)}><Icon name={icon} size={19} /><span><strong>{title}</strong><small>{sub}</small></span><Icon name="chevR" size={16} /></button>)}</div>
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
      {uploadFlow && <DocumentSubmissionFlow kind={uploadFlow} onClose={() => setUploadFlow(null)} />}
    </div>
  );
}

MessageCenterView = function MessageCenterView({ role = localStorage.getItem('jq_role') || 'admin' }) {
  const isEmployee = role === 'employee';
  const [activeChat, setActiveChat] = React.useState(isEmployee ? 'admin' : 'angestellte');
  const [targetGroup, setTargetGroup] = React.useState(isEmployee ? 'admin' : 'angestellte');
  const [uploadFlow, setUploadFlow] = React.useState(null);
  const adminChats = [
    { id:'angestellte', name:'Angestellte', preview:'Neue Arbeitskleidung ab naechster Woche...', time:'09:24', unread:8, members:23, tone:'blue', mode:'Antworten erlaubt', status:'Gruppe - 23 Mitglieder', sent:'Guten Morgen zusammen, ab naechster Woche gibt es neue Arbeitskleidung. Weitere Infos folgen.', replyName:'Julia Meier', replyInitial:'JM', reply:'Wann bekommen wir die genau?', reply2Name:'Markus Weber', reply2Initial:'MW', reply2:'Alles klar, danke.', answer:'Die Ausgabe ist am Montag um 08:00 Uhr im Lager.', read:'18 gelesen - 14 bestaetigt - 5 ungelesen' },
    { id:'gewerbliche', name:'Gewerbliche Mitarbeiter', preview:'Baustelle Nordhorn: Uhrzeiten wurden angepasst...', time:'08:18', unread:3, members:38, tone:'green', mode:'Antworten erlaubt', status:'Gruppe - 38 Mitglieder', sent:'Kurze Info: Die Startzeit auf der Baustelle Nordhorn ist morgen 07:00 Uhr.', replyName:'Dirk Juergens', replyInitial:'DJ', reply:'Ist die Verkehrssicherung dann schon vor Ort?', reply2Name:'Tobias Nowak', reply2Initial:'TN', reply2:'Ich gebe das an mein Team weiter.', answer:'Ja, Verkehrssicherung ist ab 06:30 Uhr eingeplant.', read:'31 gelesen - 26 bestaetigt - 7 offen' },
    { id:'geschaeftsfuehrer', name:'Geschaeftsfuehrer', preview:'Bericht fuer das naechste Meeting ist fertig...', time:'Gestern', unread:0, members:5, tone:'purple', mode:'Nur Fuehrungskraefte', status:'Gruppe - 5 Mitglieder', sent:'Der Bericht fuer das naechste Meeting ist fertig und liegt in der Ablage.', replyName:'Christian Janning', replyInitial:'CJ', reply:'Bitte noch die offenen HSE-Punkte markieren.', reply2Name:'Michael Janning', reply2Initial:'MJ', reply2:'Danke, schaue ich mir an.', answer:'Erledigt, die Markierungen sind im Bericht sichtbar.', read:'5 gelesen - 5 bestaetigt' },
    { id:'azubis', name:'Azubis', preview:'Azubi-Workshop am Freitag - nicht vergessen...', time:'Gestern', unread:1, members:6, tone:'orange', mode:'Antworten erlaubt', status:'Gruppe - 6 Mitglieder', sent:'Am Freitag findet der Azubi-Workshop um 09:00 Uhr im Schulungsraum statt.', replyName:'Lena Brandt', replyInitial:'LB', reply:'Sollen wir Arbeitskleidung mitbringen?', reply2Name:'Ali Yilmaz', reply2Initial:'AY', reply2:'Bin dabei.', answer:'Ja, bitte Arbeitskleidung und Sicherheitsschuhe mitbringen.', read:'4 gelesen - 2 offen' },
  ];
  const employeeChats = [
    { id:'admin', name:'An Admin', preview:'Ihre Anfrage zur Fuehrerscheinkontrolle ist eingegangen.', time:'09:18', unread:1, members:1, tone:'orange', mode:'Antworten erlaubt', status:'Ticket - In Bearbeitung', sent:'Hallo, ich habe eine Frage zu meinen Unterlagen. Welche Dokumente werden fuer meine Fuehrerscheinkontrolle benoetigt?', replyName:'Administration', replyInitial:'AD', reply:'Bitte laden Sie Vorder- und Rueckseite hoch. Der Status bleibt zunaechst "In Pruefung".', reply2Name:'Rahim Ahangarzadeh', reply2Initial:'RA', reply2:'Danke, ich lade die Dateien heute hoch.', answer:'Vielen Dank. Wir melden uns, falls eine Rueckfrage entsteht.', document:'1 neues Dokument' },
    { id:'gewerbliche', name:'Gewerbliche Mitarbeiter', preview:'Neue Arbeitskleidung ab naechster Woche...', time:'08:40', unread:2, members:38, tone:'green', mode:'Nur Lesen', status:'Meine Gruppe - 38 Mitglieder', sent:'Ab naechster Woche gibt es neue Arbeitskleidung. Die Ausgabe erfolgt im Lager.', replyName:'Lager', replyInitial:'LA', reply:'Die Ausgabe ist Montag und Dienstag von 08:00 bis 11:00 Uhr moeglich.', reply2Name:'Markus Brinker', reply2Initial:'MB', reply2:'Gelesen.', answer:'Bitte bestaetigen Sie den Erhalt bei der Ausgabe.', document:'neue Info' },
    { id:'baustelle-nordhorn', name:'Baustelle Nordhorn', preview:'Alarmplan und Baustellenaushang aktualisiert.', time:'Gestern', unread:0, members:10, tone:'blue', mode:'Antworten erlaubt', status:'Eigene Baustellengruppe', sent:'Der Alarmplan wurde aktualisiert. Bitte pruefen Sie die neue Version.', replyName:'Alexander Petersen', replyInitial:'AP', reply:'Alle Mitarbeiter bitte vor Arbeitsbeginn kurz lesen.', reply2Name:'Dimitri Beck', reply2Initial:'DB', reply2:'Erledigt.', answer:'Danke fuer die Rueckmeldung.', document:'2 neue Dokumente' },
    { id:'tiefbau', name:'Janning Tiefbau GmbH', preview:'Jahresunterweisung bitte bis Ende des Monats erledigen.', time:'Mo.', unread:0, members:12, tone:'yellow', mode:'Antwort nur an Admin', status:'Meine Firma', sent:'Bitte die Jahresunterweisung bis Ende des Monats abschliessen.', replyName:'Administration', replyInitial:'AD', reply:'Bei Fragen bitte direkt an Admin schreiben.', reply2Name:'Dimitri Beck', reply2Initial:'DB', reply2:'Verstanden.', answer:'Vielen Dank.', document:'' },
  ];
  const chats = isEmployee ? employeeChats : adminChats;
  const active = chats.find(chat => chat.id === activeChat) || chats[0];
  const uploads = [
    ['doc', 'Meine Zertifikate', 'Zertifikate und Qualifikationen'],
    ['flag', 'Meine Unterweisungen', 'Teilnahmebescheinigungen'],
    ['shield', 'Meine Untersuchungsvorsorge', 'Vorsorgenachweise'],
    ['doc', 'Meine Stellenbeschreibung', 'Aktuelle Stellenbeschreibung'],
    ['users', 'Mein Fuehrerschein', 'Fuehrerschein und Nachweise'],
    ['settings', 'Meine Geraeteberechtigungen', 'Einweisungen und Beauftragungen'],
    ['check', 'Meine Pruefberechtigungen', 'Befaehigungen und Nachweise'],
    ['doc', 'Sonstiges Dokument', 'weitere freigegebene Unterlagen'],
  ];
  const adminSubmissions = [
    ['doc', '3 neue Zertifikate', 'Status: neu eingereicht'],
    ['users', '1 Fuehrerschein zur Pruefung', 'Rueckseite fehlt'],
    ['shield', '2 Vorsorgebescheinigungen', 'vertraulich'],
    ['flag', '4 Unterweisungsnachweise', 'in Pruefung'],
  ];
  const title = isEmployee ? 'Nachrichtenzentrale' : 'Nachrichtenzentrale - Administration';
  const subtitle = isEmployee
    ? 'Ihre Nachrichten, Gruppen und eingereichten Dokumente.'
    : 'Nachrichten, Gruppenkommunikation und Dokumentenpruefungen verwalten.';

  return (
    <div className={'message-center message-center--groups ' + (isEmployee ? 'message-center--employee' : 'message-center--admin')}>
      <header className="message-center__heading">
        <div><h1>{title}</h1><p>{subtitle}</p></div>
        <div className="message-center__actions">
          {isEmployee ? (
            <>
              <button className="btn btn--ghost"><Icon name="plus" size={15} />Neue Nachricht</button>
              <button className="btn btn--primary" onClick={() => setActiveChat('admin')}><Icon name="mail" size={15} />An Admin schreiben</button>
              <button className="btn btn--ghost"><Icon name="settings" size={15} /></button>
            </>
          ) : (
            <>
              <button className="btn btn--primary"><Icon name="plus" size={15} />Nachricht erstellen</button>
              <button className="btn btn--ghost"><Icon name="users" size={15} />Gruppe erstellen</button>
              <button className="btn btn--ghost"><Icon name="filter" size={15} />Filter</button>
              <button className="btn btn--ghost"><Icon name="settings" size={15} /></button>
            </>
          )}
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
            {isEmployee ? (
              <>
                <button><Icon name="mail" size={18} />Nachrichten an mich</button>
                <button><Icon name="users" size={18} />Meine Gruppen</button>
                <button onClick={() => setActiveChat('admin')}><Icon name="users" size={18} />An Admin</button>
              </>
            ) : (
              <>
                <button><Icon name="flag" size={18} />Offene Anfragen<span>6</span></button>
                <button><Icon name="mail" size={18} />An Admin<span>4</span></button>
                <button><Icon name="chevR" size={18} />Gesendet</button>
                <button><Icon name="doc" size={18} />Entwuerfe</button>
                <button><Icon name="users" size={18} />Gruppen</button>
              </>
            )}
            <button><Icon name="clock" size={18} />Archiv</button>
          </nav>
          {!isEmployee && (
            <div className="message-admin-filters">
              {['ungelesen', 'offen', 'mit Dokument', 'dringend', 'heute', 'nicht beantwortet', 'erledigt'].map(item => <button key={item}>{item}</button>)}
            </div>
          )}
          <h3>Unterhaltungen</h3>
          <div className="message-chat-list">
            {chats.map(chat => (
              <button key={chat.id} className={activeChat === chat.id ? 'is-active' : ''} onClick={() => setActiveChat(chat.id)}>
                <span className={'message-avatar is-' + chat.tone}><Icon name="users" size={18} /></span>
                <span className="message-chat-copy"><strong>{chat.name}</strong><small>{chat.preview}</small>{chat.document && <em>{chat.document}</em>}</span>
                <span className="message-chat-meta"><small>{chat.time}</small>{chat.unread ? <b>{chat.unread}</b> : <i>0</i>}</span>
              </button>
            ))}
          </div>
          <button className="message-archive"><Icon name="mail" size={17} />Zum Archiv<Icon name="chevR" size={14} /></button>
        </aside>

        <section className="message-panel message-conversation">
          <header>
            <span className={'message-avatar is-' + active.tone}><Icon name="users" size={19} /></span>
            <div><h2>{active.name}</h2><p>{active.status || `Gruppe - ${active.members} Mitglieder`}</p></div>
            <button title="Unterhaltung suchen"><Icon name="search" size={18} /></button>
            <button className="message-menu-dots" title="Mehr Optionen">...</button>
          </header>
          <div className="message-thread">
            <div className="message-day-chip">Heute</div>
            <div className="message-bubble is-own is-group-own">{active.sent}<small>09:14 <b>OK</b></small></div>
            <div className="message-reply"><span className="message-person">{active.replyInitial}</span><div className="message-bubble"><strong className="message-author">{active.replyName}</strong>{active.reply}<small>09:16</small></div></div>
            <div className="message-bubble is-own is-group-own">{active.answer}<small>09:17 <b>OK</b></small></div>
            <div className="message-reply"><span className="message-person">{active.reply2Initial}</span><div className="message-bubble"><strong className="message-author">{active.reply2Name}</strong>{active.reply2}<small>09:18</small></div></div>
            {!isEmployee && active.read && <button className="message-read-status"><Icon name="check" size={13} />{active.read}</button>}
            <div className="message-group-lock"><Icon name="shield" size={13} />{active.mode === 'Nur Lesen' ? 'Nur Administratoren duerfen Nachrichten senden.' : active.mode === 'Antwort nur an Admin' ? 'Antworten gehen nur an den Admin.' : active.mode || 'Antworten erlaubt'}</div>
          </div>
          {active.mode === 'Nur Lesen' ? (
            <footer className="message-compose message-compose--locked">
              <Icon name="shield" size={16} /><strong>Nur Lesen</strong><span>Fuer diese Informationsgruppe duerfen nur Administratoren schreiben.</span>
            </footer>
          ) : (
            <footer className="message-compose">
              <button title="Dokument anhaengen"><Icon name="link" size={18} /></button>
              <div><textarea placeholder={active.mode === 'Antwort nur an Admin' ? 'Antwort an Admin schreiben...' : `Nachricht an ${active.name} schreiben...`} /><small>{active.mode || 'Antworten erlaubt'}</small></div>
              <button title="Senden"><Icon name="chevR" size={18} /></button>
            </footer>
          )}
        </section>

        <aside className="message-center__right">
          <section className="message-panel message-upload">
            {isEmployee ? (
              <>
                <header><div><h2>Dokumente hochladen</h2><p>Waehlen Sie die passende Kategorie aus. Status nach Upload: In Pruefung.</p></div><span><Icon name="upload" size={18} /></span></header>
                <div>{uploads.map(([icon,title,sub]) => <button key={title} onClick={() => setUploadFlow(title)}><Icon name={icon} size={19} /><span><strong>{title}</strong><small>{sub}</small></span><Icon name="chevR" size={16} /></button>)}</div>
              </>
            ) : (
              <>
                <header><div><h2>Eingereichte Dokumente</h2><p>Neue Einreichungen, Rueckfragen und Freigaben pruefen.</p></div><span><Icon name="upload" size={18} /></span></header>
                <div>{adminSubmissions.map(([icon,title,sub]) => <button key={title}><Icon name={icon} size={19} /><span><strong>{title}</strong><small>{sub}</small></span><Icon name="chevR" size={16} /></button>)}</div>
              </>
            )}
          </section>
          <section className="message-panel message-help">
            <header><h2>Schnellhilfe</h2><span>?</span></header>
            {isEmployee ? (
              <>
                <div><Icon name="doc" size={18} /><p><strong>Dateien als PDF oder JPG hochladen</strong><small>Achten Sie auf gute Lesbarkeit der Dokumente.</small></p></div>
                <div><Icon name="mail" size={18} /><p><strong>Bei Fragen direkt Admin anschreiben</strong><small>Nutzen Sie "An Admin schreiben" fuer Rueckfragen.</small></p></div>
                <div><Icon name="clock" size={18} /><p><strong>Bearbeitungsstatus ansehen</strong><small>Nach Upload steht der Eintrag auf "In Pruefung".</small></p></div>
              </>
            ) : (
              <>
                <div><Icon name="flag" size={18} /><p><strong>Offene Anfragen bearbeiten</strong><small>Nach Status und Dringlichkeit filtern.</small></p></div>
                <div><Icon name="doc" size={18} /><p><strong>Dokumente pruefen</strong><small>Freigeben, ablehnen oder Rueckfrage senden.</small></p></div>
                <div><Icon name="users" size={18} /><p><strong>Gruppen verwalten</strong><small>Mitglieder, Schreibrechte und Lesestatus pruefen.</small></p></div>
              </>
            )}
            <button>Alle Hinweise anzeigen <Icon name="chevR" size={14} /></button>
          </section>
        </aside>
      </div>

      {isEmployee ? (
        <section className="message-group-send message-panel message-new-personal">
          <header><h2>Neue Nachricht</h2><p>Sie koennen nur berechtigte Empfaenger auswaehlen.</p></header>
          <div className="message-group-options">
            {[
              ['admin', 'An Admin schreiben', 'Zertifikat, Fuehrerschein, Baustelle oder sonstige Anfrage.', 'orange'],
              ['bauleiter', 'An eigenen Bauleiter', 'Rueckfrage zur Baustelle oder Einsatzplanung.', 'blue'],
              ['gruppe', 'An eigene Gruppe', 'Nur wenn Antworten erlaubt sind.', 'green'],
              ['kontakt', 'An bekannte Kontaktperson', 'Direkte Rueckfrage an freigegebenen Kontakt.', 'yellow'],
            ].map(([id, name, sub, tone]) => (
              <button key={id} className={targetGroup === id ? 'is-active' : ''} onClick={() => setTargetGroup(id)}>
                <span className={'message-avatar is-' + tone}><Icon name="mail" size={18} /></span>
                <span><strong>{name}</strong><small>{sub}</small></span>
                <i />
              </button>
            ))}
          </div>
          <footer><button className="btn btn--primary">Nachricht vorbereiten</button><button className="btn btn--ghost"><Icon name="chevR" size={15} /></button></footer>
        </section>
      ) : (
        <section className="message-group-send message-panel">
          <header><h2>Nachricht an Gruppe senden</h2><p>Zielgruppe waehlen, Nachricht erstellen und Versandart festlegen.</p></header>
          <div className="message-group-options">
            {[...chats, {id:'firma',name:'Firma',tone:'yellow'}, {id:'abteilung',name:'Abteilung',tone:'blue'}, {id:'baustelle',name:'Baustelle',tone:'green'}, {id:'einzelne',name:'Einzelne Mitarbeiter',tone:'orange'}].map(group => (
              <button key={group.id} className={targetGroup === group.id ? 'is-active' : ''} onClick={() => { setTargetGroup(group.id); if (chats.some(chat => chat.id === group.id)) setActiveChat(group.id); }}>
                <span className={'message-avatar is-' + group.tone}><Icon name="users" size={18} /></span>
                <span><strong>{group.name}</strong><small>Nachricht erstellen, Lesebestaetigung und Antwortrecht steuern.</small></span>
                <i />
              </button>
            ))}
          </div>
          <footer><button className="btn btn--primary">Nachricht erstellen</button><button className="btn btn--ghost"><Icon name="chevR" size={15} /></button></footer>
        </section>
      )}
      {uploadFlow && <DocumentSubmissionFlow kind={uploadFlow} onClose={() => setUploadFlow(null)} />}
    </div>
  );
};

function DocumentSubmissionFlow({ kind, onClose }) {
  return kind === 'Mein Führerschein' || kind === 'Mein Fuehrerschein'
    ? <LicenseUploadFlow onClose={onClose} />
    : <GenericDocumentSubmission kind={kind} onClose={onClose} />;
}

function GenericDocumentSubmission({ kind, onClose }) {
  const [confirmed, setConfirmed] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const configs = {
    'Meine Zertifikate': {
      tag:'Zertifikate',
      title:'Zertifikat oder Qualifikationsnachweis einreichen',
      subtitle:'Wählen Sie die passende Qualifikation aus und laden Sie den zugehörigen Nachweis hoch.',
      selectLabel:'Zertifikat / Qualifikation aus Liste',
      options:['Erste Hilfe (9 UE)', 'SCC Dok. 016', 'MVAS 99', 'GW 129 Rohrnetzbau', 'Andere Qualifikation'],
      fields:[['Ausstellende Stelle','BiW Bildungszentrum'], ['Ausstellungsdatum','TT.MM.JJJJ'], ['Gültig bis','TT.MM.JJJJ'], ['Zertifikatsnummer','z.B. Z-2026-018']],
      confirm:'Ich bestätige, dass die Angaben vollständig sind und das hochgeladene Dokument zu meiner Qualifikation gehört.',
      uploads:['Zertifikat als PDF oder Foto', 'Vorderseite', 'Rückseite, falls vorhanden', 'weitere Seite oder Anlage'],
      note:'Das Originalzertifikat wurde mir am 12.07.2026 ausgehändigt.',
      submit:'Zertifikat zur Prüfung einreichen',
      status:'In Prüfung',
    },
    'Meine Unterweisungen': {
      tag:'Unterweisungen',
      title:'Teilnahmenachweis für Unterweisung einreichen',
      subtitle:'Wählen Sie die durchgeführte Unterweisung aus und laden Sie den vorhandenen Nachweis hoch.',
      selectLabel:'Unterweisung aus Liste',
      options:['Brandschutzunterweisung', 'Jahresunterweisung Tiefbau', 'Projektbezogene Unterweisung', 'PSA gegen Absturz'],
      fields:[['Datum der Unterweisung','TT.MM.JJJJ'], ['Firma','Janning Tiefbau GmbH'], ['Unterwiesen von','Name'], ['Version der Unterweisung','z.B. 2026-01']],
      confirm:'Ich bestätige, dass ich an dieser Unterweisung teilgenommen und die Inhalte verstanden habe.',
      uploads:['Teilnahmebescheinigung', 'unterschriebene Teilnehmerliste', 'sonstiger Nachweis'],
      note:'Optional: offene Frage oder Hinweis zur Unterweisung.',
      submit:'Teilnahmenachweis einreichen',
      status:'Eingereicht',
    },
    'Meine Untersuchungsvorsorge': {
      tag:'Arbeitsmedizinische Vorsorge',
      title:'Vorsorgebescheinigung einreichen',
      subtitle:'Laden Sie ausschließlich die arbeitsmedizinische Bescheinigung hoch. Medizinische Befunde oder Diagnosen werden nicht benötigt.',
      selectLabel:'Vorsorgeart aus Liste',
      options:['Pflichtvorsorge', 'Angebotsvorsorge', 'Wunschvorsorge', 'Eignungsuntersuchung', 'G26 Atemschutz'],
      fields:[['Untersuchungsdatum','TT.MM.JJJJ'], ['Betriebsarzt / Untersuchungsstelle','Name'], ['Nächster Termin','falls angegeben'], ['Datenschutz','vertraulich']],
      confirm:'Ich bestätige, dass die Datei nur die für den Arbeitgeber vorgesehene Bescheinigung enthält und keine medizinischen Befunde oder Diagnosen.',
      uploads:['Vorsorgebescheinigung als PDF oder Foto', 'weitere Seite'],
      note:'Die Datei ist nur für berechtigte Personen sichtbar.',
      submit:'Bescheinigung geschützt einreichen',
      status:'Vertraulich in Prüfung',
    },
    'Meine Stellenbeschreibung': {
      tag:'Stellenbeschreibung',
      title:'Aktuelle Stellenbeschreibung prüfen und bestätigen',
      subtitle:'Lesen Sie die für Sie freigegebene Stellenbeschreibung und bestätigen Sie den Erhalt.',
      selectLabel:'Freigegebene Stellenbeschreibung',
      options:['Polier Tiefbau · Version 2.1', 'Baumaschinist · Version 1.4', 'Kaufm. Angestellte:r · Version 3.0'],
      fields:[['Position','Polier'], ['Gültig ab','01.06.2026'], ['Freigegeben von','Christian Janning'], ['PDF-Vorschau','Stellenbeschreibung anzeigen']],
      confirm:'Ich habe die Stellenbeschreibung vollständig gelesen und erhalten.',
      uploads:['digital bestätigen', 'unterschriebene PDF hochladen', 'eingescannte Unterschriftsseite hochladen'],
      note:'Ich habe Fragen oder Änderungsbedarf.',
      submit:'Stellenbeschreibung bestätigen',
      status:'Eingereicht',
    },
  };
  const config = configs[kind] || configs['Meine Zertifikate'];
  const modal = (
    <div className="license-flow-backdrop" onClick={onClose}>
      <section className="license-flow document-submit-flow" onClick={event => event.stopPropagation()}>
        <header>
          <div>
            <span>{config.tag}</span>
            <h2>{config.title}</h2>
            <p>{config.subtitle}</p>
          </div>
          <button onClick={onClose} title="Schließen">x</button>
        </header>
        <div className="document-submit-body">
          {submitted && <div className="document-submit-success"><Icon name="check" size={18} /><strong>Ihre Nachweise wurden erfolgreich eingereicht und werden vom Administrator geprüft.</strong><span>Status: {config.status}</span></div>}
          <section className="license-flow-card">
            <h3>1. Dokumentart auswählen</h3>
            <label className="document-submit-field"><span>{config.selectLabel}</span><select>{config.options.map(item => <option key={item}>{item}</option>)}</select></label>
            {kind === 'Meine Zertifikate' && <label className="document-submit-field"><span>Bezeichnung bei freier Eingabe</span><input placeholder="Andere Qualifikation" /></label>}
          </section>
          <section className="license-flow-card">
            <h3>2. Daten prüfen oder ergänzen</h3>
            <div className="document-submit-grid">{config.fields.map(([label, placeholder]) => <label className="document-submit-field" key={label}><span>{label}</span><input placeholder={placeholder} /></label>)}</div>
          </section>
          <section className="license-flow-card">
            <h3>3. Erklärung bestätigen</h3>
            <label className="license-confirm"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} /><span>{config.confirm}</span></label>
          </section>
          <section className="license-flow-card">
            <h3>4. Datei hochladen</h3>
            <div className="license-upload-list">
              {config.uploads.map((item, index) => <button key={item} disabled={!confirmed}><Icon name="upload" size={16} /><span><strong>{item}</strong><small>{index === 0 ? 'fehlt' : 'optional'} · nach Upload: wird geprüft</small></span></button>)}
            </div>
          </section>
          <section className="license-flow-card">
            <h3>5. Bemerkung und Verlauf</h3>
            <textarea className="document-submit-note" placeholder={config.note}></textarea>
            <div className="document-submit-meta"><span>eingereicht am: nach Absenden</span><span>Bearbeitungsstatus: {config.status}</span><span>zuständige Prüfstelle: Administration</span><span>Rückfrage möglich</span><span>Änderungsverlauf wird angezeigt</span></div>
          </section>
        </div>
        <footer>
          <button className="btn btn--ghost" onClick={onClose}>Abbrechen</button>
          <button className="btn btn--primary" disabled={!confirmed} onClick={() => setSubmitted(true)}>{config.submit}</button>
        </footer>
      </section>
    </div>
  );
  if (window.ReactDOM && ReactDOM.createPortal && document.body) return ReactDOM.createPortal(modal, document.body);
  return modal;
}

function LicenseUploadFlow({ onClose }) {
  const [accepted, setAccepted] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const code = '569584';
  const uploadItems = [
    ['Führerschein Vorderseite', 'Foto oder PDF hochladen'],
    ['Führerschein Rückseite', 'Foto oder PDF hochladen'],
  ];
  const modal = (
    <div className="license-flow-backdrop" style={{ position:'fixed', inset:0, zIndex:3200, display:'grid', placeItems:'center', background:'rgba(26,24,22,.36)', padding:24 }} onClick={onClose}>
      <section className="license-flow" style={{ width:'min(1080px,96vw)', maxHeight:'94vh', display:'grid', gridTemplateRows:'auto minmax(0,1fr) auto', overflow:'hidden' }} onClick={event => event.stopPropagation()}>
        <header>
          <div>
            <span>SGU_007 · Führerscheinkontrolle</span>
            <h2>Elektronische Fahrerbestätigung</h2>
            <p>Bitte lesen Sie die Hinweise, bestätigen Sie die Erklärung und laden Sie anschließend die Nachweise hoch.</p>
          </div>
          <button onClick={onClose} title="Schließen">x</button>
        </header>

        <div className="license-flow__body">
          <section className="license-flow-card license-flow-card--notice">
            <h3>Bestätigung des Fahrers</h3>
            <p>Der Fahrer bestätigt hiermit,</p>
            <ul className="license-flow-list">
              <li>dass er die in der Fahrerlaubnis vermerkten Auflagen und Beschränkungen beachten wird;</li>
              <li>dass er über die umseitig vermerkten Regelungen aus StVG, StVO und StVZO informiert wurde;</li>
              <li>dass er einen etwaigen Verlust des Führerscheins oder einen Entzug der Fahrerlaubnis unverzüglich beim Fuhrparkverantwortlichen anzeigt.</li>
            </ul>
            <h4>Nachweisdokument für Fahrzeughalter und Fuhrparkverantwortliche</h4>
            <h4>Hinweise zur Halterhaftung und zur Führerscheinkontrolle</h4>
            <p>Die Haftung beim Fahren ohne Fahrerlaubnis bzw. Führerschein liegt beim Fahrzeughalter. Damit ergibt sich seinerseits die Verpflichtung, sicherzustellen, dass der Fahrer einen Führerschein bzw. eine Fahrerlaubnis für das überlassene Fahrzeug besitzt. Nach einem Urteil des BGH (BGH VRS 34, 354) muss diesbezüglich eine halbjährliche Überprüfung stattfinden.</p>
            <p>Legt ein Fahrer trotz mehrmaliger Aufforderung seinen Führerschein nicht zur Kontrolle vor, muss der Halter – in der Regel das Unternehmen vertreten durch die Geschäftsleitung oder den Fuhrparkverantwortlichen – unmittelbar reagieren. Dies kann unter Umständen sogar den Entzug des Dienstwagens zur Folge haben.</p>
            <div className="license-flow-law">
              <strong>Maßgebliche rechtliche Bestimmungen (Auszüge)</strong>
              <span><b>Fahrerlaubnis und Führerschein:</b> Wer auf öffentlichen Straßen ein Kraftfahrzeug führt, bedarf der Erlaubnis der zuständigen Behörde. Die Fahrerlaubnis wird in bestimmten Klassen erteilt und ist durch eine amtliche Bescheinigung nachzuweisen.</span>
              <span><b>§21 StVG - Fahren ohne Fahrerlaubnis:</b> Mit Freiheitsstrafe bis zu einem Jahr oder mit Geldstrafe wird bestraft, wer ein Kraftfahrzeug führt, obwohl er die erforderliche Fahrerlaubnis nicht hat, oder als Halter zulässt, dass jemand ohne erforderliche Fahrerlaubnis fährt.</span>
              <span><b>§11 StVZO - Verantwortung für den Betrieb der Fahrzeuge:</b> Der Halter darf die Inbetriebnahme nicht anordnen oder zulassen, wenn ihm bekannt ist oder bekannt sein muss, dass der Führer nicht zur selbstständigen Leitung geeignet oder das Fahrzeug nicht vorschriftsmäßig ist.</span>
              <span><b>§23 StVO - Sonstige Pflichten von Fahrzeugführenden:</b> Wer ein Fahrzeug führt, ist dafür verantwortlich, dass Sicht, Gehör, Fahrzeug, Ladung und Besetzung vorschriftsmäßig sind und die Verkehrssicherheit nicht leidet. Mobil- oder Autotelefone dürfen während der Fahrt nicht benutzt werden, wenn sie aufgenommen oder gehalten werden müssen.</span>
            </div>
          </section>

          <aside className="license-flow-side">
            {submitted && <section className="document-submit-success"><Icon name="check" size={18} /><strong>Ihre Nachweise wurden erfolgreich eingereicht und werden vom Administrator geprüft.</strong><span>Status: In Prüfung</span></section>}
            <section className="license-flow-card">
              <h3>1. Angaben ergänzen</h3>
              <label className="document-submit-field"><span>Führerscheinklassen</span><input placeholder="z.B. B, BE, C1" /></label>
              <label className="document-submit-field"><span>Ablaufdatum optional</span><input placeholder="TT.MM.JJJJ" /></label>
              <div className="document-submit-meta"><span>Uploadstatus: fehlt</span><span>Status nach Absenden: In Prüfung</span></div>
            </section>
            <section className="license-flow-card">
              <h3>2. Erklärung bestätigen</h3>
              <label className="license-confirm">
                <input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} />
                <span>Ich habe die Hinweise gelesen und bestätige die Fahrer-Erklärung.</span>
              </label>
            </section>

            <section className={'license-flow-code ' + (accepted ? 'is-active' : '')}>
              <span>3. Prüfcode</span>
              <strong>{accepted ? code : '------'}</strong>
            </section>

            <section className="license-flow-card">
              <h3>4. Nachweise hochladen</h3>
              <div className="license-upload-list">
                {uploadItems.map(([title, sub]) => <button key={title} disabled={!accepted}><Icon name="upload" size={16} /><span><strong>{title}</strong><small>{sub} · fehlt</small></span></button>)}
              </div>
            </section>
          </aside>
        </div>

        <footer>
          <button className="btn btn--ghost" onClick={onClose}>Abbrechen</button>
          <button className="btn btn--primary" disabled={!accepted} onClick={() => setSubmitted(true)}>Nachweise zur Prüfung einreichen</button>
        </footer>
      </section>
    </div>
  );
  if (window.ReactDOM && ReactDOM.createPortal && document.body) {
    return ReactDOM.createPortal(modal, document.body);
  }
  return modal;
}

window.MessageCenterView = MessageCenterView;
