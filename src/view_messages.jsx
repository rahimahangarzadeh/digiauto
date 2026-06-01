/* Nachrichten-Zentrale - Teams-like two column chat */

const MESSAGE_CHATS = [
  {
    id: 'chat-upload',
    name: 'Markus Brinker',
    initials: 'MB',
    role: 'Mitarbeiter',
    company: 'Janning Tiefbau GmbH',
    type: 'Dokument hochladen',
    status: 'Neu',
    unread: 1,
    preview: 'SCC_Dok016_Brinker.pdf hochgeladen',
    action: 'Dokument prüfen',
    target: 'wartungsliste',
    messages: [
      { from: 'Markus Brinker', side: 'them', time: 'Heute 08:55', text: 'Hallo, ich habe mein neues SCC-Zertifikat hochgeladen.' },
      { from: 'Markus Brinker', side: 'them', time: 'Heute 08:56', text: 'Datei: SCC_Dok016_Brinker.pdf' },
      { from: 'Admin', side: 'me', time: 'Heute 09:03', text: 'Danke, ich prüfe das Dokument und gebe es frei, wenn alles passt.' },
    ],
  },
  {
    id: 'chat-admin',
    name: 'Markus Brinker',
    initials: 'MB',
    role: 'Mitarbeiter',
    company: 'Janning Tiefbau GmbH',
    type: 'Nachricht an Admin',
    status: 'Offen',
    unread: 0,
    preview: 'Bitte Zertifikat prüfen',
    action: 'Mitarbeiterprofil öffnen',
    target: 'employees',
    messages: [
      { from: 'Markus Brinker', side: 'them', time: 'Heute 09:12', text: 'Kannst du bitte prüfen, ob mein SCC-Zertifikat für die Baustelle Nordhorn reicht?' },
      { from: 'Admin', side: 'me', time: 'Heute 09:20', text: 'Ja, ich schaue es mir an und melde mich gleich.' },
    ],
  },
  {
    id: 'chat-training-request',
    name: 'Oliver Lammers',
    initials: 'OL',
    role: 'Mitarbeiter',
    company: 'Janning Tiefbau GmbH',
    type: 'Schulungsanfrage',
    status: 'Offen',
    unread: 1,
    preview: 'PSAgA Auffrischung im Mai',
    action: 'Schulung planen',
    target: 'calendar',
    messages: [
      { from: 'Oliver Lammers', side: 'them', time: 'Heute 10:40', text: 'Ich brauche eine Auffrischung für PSA gegen Absturz.' },
      { from: 'Oliver Lammers', side: 'them', time: 'Heute 10:41', text: 'Wenn möglich bitte noch im Mai, weil ich ab Juni auf Höhe arbeite.' },
    ],
  },
  {
    id: 'chat-training-signup',
    name: 'Stefan Müller',
    initials: 'SM',
    role: 'Bauleiter',
    company: 'Janning Rohrbau GmbH',
    type: 'Schulungsanmeldung',
    status: 'In Bearbeitung',
    unread: 0,
    preview: '6 Mitarbeiter für SCC 016 anmelden',
    action: 'Termin erstellen',
    target: 'calendar',
    messages: [
      { from: 'Stefan Müller', side: 'them', time: 'Gestern 15:18', text: 'Bitte 6 gewerbliche Mitarbeiter aus Rohrbau für SCC 016 anmelden.' },
      { from: 'Stefan Müller', side: 'them', time: 'Gestern 15:19', text: 'Nächster freier DEKRA-Termin wäre gut.' },
      { from: 'Admin', side: 'me', time: 'Gestern 16:02', text: 'Ich prüfe freie Termine und Teilnehmer.' },
    ],
  },
  {
    id: 'chat-job',
    name: 'Guido Rolfes',
    initials: 'GR',
    role: 'Bauleiter',
    company: 'Janning Tiefbau GmbH',
    type: 'Stellenanzeige',
    status: 'Neu',
    unread: 2,
    preview: 'Neue Stellenbeschreibung Polier Tiefbau',
    action: 'Stellenbeschreibung öffnen',
    target: 'stellenbeschreibungen',
    messages: [
      { from: 'Guido Rolfes', side: 'them', time: '01.05. 11:05', text: 'Für die neue Kolonne brauchen wir eine Stellenbeschreibung Polier Tiefbau.' },
      { from: 'Guido Rolfes', side: 'them', time: '01.05. 11:06', text: 'Aufgaben: Baustellenkoordination, Einweisung, Dokumentation.' },
    ],
  },
];

function MessagesView({ setNav }) {
  const visibleMessageChats = MESSAGE_CHATS.filter(chat => chat.id !== 'chat-upload');
  const [chats, setChats] = React.useState(visibleMessageChats);
  const [selectedId, setSelectedId] = React.useState(visibleMessageChats[0].id);
  const [filter, setFilter] = React.useState('all');
  const [draft, setDraft] = React.useState('');

  const visibleChats = chats.filter((chat) => {
    if (filter === 'unread') return chat.unread > 0;
    if (filter === 'bauleiter') return chat.role === 'Bauleiter';
    if (filter === 'mitarbeiter') return chat.role === 'Mitarbeiter';
    return true;
  });
  const selected = chats.find((chat) => chat.id === selectedId) || visibleChats[0] || chats[0];

  const selectChat = (id) => {
    setSelectedId(id);
    setChats((current) => current.map((chat) => chat.id === id ? { ...chat, unread: 0 } : chat));
  };

  const sendMessage = () => {
    if (!draft.trim()) return;
    setChats((current) => current.map((chat) => chat.id === selected.id ? {
      ...chat,
      status: chat.status === 'Neu' ? 'In Bearbeitung' : chat.status,
      messages: [...chat.messages, { from: 'Admin', side: 'me', time: 'gerade eben', text: draft.trim() }],
      preview: draft.trim(),
    } : chat));
    setDraft('');
  };

  const openAction = () => {
    if (setNav && selected.target) setNav(selected.target);
  };

  return (
    <div className="teams-page">
      <aside className="teams-left">
        <div className="teams-left__head">
          <h1>Chat</h1>
          <div>
            <button title="Suchen"><Icon name="search" size={18} /></button>
            <button title="Neue Nachricht"><Icon name="plus" size={18} /></button>
          </div>
        </div>

        <div className="teams-pills">
          <button className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')}>Chats</button>
          <button className={filter === 'unread' ? 'is-active' : ''} onClick={() => setFilter('unread')}>Ungelesen</button>
          <button className={filter === 'mitarbeiter' ? 'is-active' : ''} onClick={() => setFilter('mitarbeiter')}>Mitarbeiter</button>
          <button className={filter === 'bauleiter' ? 'is-active' : ''} onClick={() => setFilter('bauleiter')}>Bauleiter</button>
        </div>

        <div className="teams-section-title">Chats</div>
        <div className="teams-chat-list">
          {visibleChats.map((chat) => (
            <button key={chat.id} className={`teams-chat-row ${chat.id === selected.id ? 'is-active' : ''}`} onClick={() => selectChat(chat.id)}>
              <span className={`teams-avatar teams-avatar--${chat.role === 'Bauleiter' ? 'lead' : 'staff'}`}>{chat.initials}</span>
              <span className="teams-chat-row__main">
                <strong>{chat.name}</strong>
                <small>{chat.type} · {chat.preview}</small>
              </span>
              {chat.unread > 0 && <span className="teams-unread">{chat.unread}</span>}
            </button>
          ))}
        </div>

        <div className="teams-section-title">Teams und Kanäle</div>
        <div className="teams-team">
          <span>JT</span>
          <strong>Janning Tiefbau GmbH</strong>
        </div>
      </aside>

      <section className="teams-chat">
        <header className="teams-chat__head">
          <div className="teams-chat__person">
            <span className="teams-avatar teams-avatar--large">{selected.initials}</span>
            <div>
              <h2>{selected.name}</h2>
              <p>{selected.role} · {selected.company}</p>
            </div>
          </div>
          <nav className="teams-tabs">
            <button className="is-active">Chat</button>
            <button>{selected.type}</button>
            <button>{selected.status}</button>
          </nav>
          <div className="teams-tools">
            <button title="Anrufen"><Icon name="phone" size={18} /></button>
            <button title="Aktion ausführen" onClick={openAction}>{selected.action}</button>
          </div>
        </header>

        <main className="teams-messages">
          <div className="teams-day">Heute</div>
          {selected.messages.map((message, index) => (
            <div key={index} className={`teams-message ${message.side === 'me' ? 'is-me' : 'is-them'}`}>
              {message.side !== 'me' && <span className="teams-avatar">{selected.initials}</span>}
              <div>
                <div className="teams-message__meta">{message.side === 'me' ? message.time : `${message.from} · ${message.time}`}</div>
                <div className="teams-bubble">{message.text}</div>
              </div>
            </div>
          ))}
        </main>

        <footer className="teams-compose">
          <textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Nachricht eingeben" rows={1} />
          <button title="Datei"><Icon name="upload" size={18} /></button>
          <button title="Senden" onClick={sendMessage}><Icon name="plus" size={20} /></button>
        </footer>
      </section>
    </div>
  );
}

Object.assign(window, { MessagesView });
