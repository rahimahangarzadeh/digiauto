# GitHub-Pages-Version

Die veröffentlichbare Kopie der Anwendung liegt im Ordner `docs/`. Die bestehende
Originalanwendung im Projektstamm bleibt unverändert.

## Veröffentlichen

1. Das Repository zu GitHub pushen.
2. Auf GitHub `Settings` → `Pages` öffnen.
3. Unter `Build and deployment` als Quelle `GitHub Actions` auswählen.
4. Den Workflow `GitHub Pages` ausführen lassen oder manuell starten.

Danach ist die App normalerweise unter
`https://<BENUTZERNAME>.github.io/<REPOSITORY>/` erreichbar.

## Lokal testen

Im Projektstamm einen statischen Webserver starten und dann
`http://127.0.0.1:8000/docs/` aufrufen.

## Aktualisieren

Die Dateien in `docs/` sind eine separate Kopie. Bei späteren Änderungen an der
Originalanwendung müssen die Ordner `assets`, `src` und `styles` sowie die Startdatei
erneut nach `docs/` kopiert werden. Die Startdatei heißt dort `index.html`.
