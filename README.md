# Sportbootführerschein — YouTube Lernvideos

Dieses Projekt erstellt Lernvideos für deutsche Bootsführerscheine und Funkzeugnisse, die auf YouTube veröffentlicht werden. Zielgruppe sind die ca. 100.000 Menschen pro Jahr, die in Deutschland einen oder mehrere Sportbootführerscheine ablegen.

---

## Zertifikate

### SBF See — Sportbootführerschein See
- Grundlizenz für motorisierte Boote auf dem Meer (Küstengewässer)
- Fragebogen mit mehreren hundert Fragen, je 4 Antwortmöglichkeiten (a ist immer richtig)
- **Start dieses Projekts:** SBF See als erstes Zertifikat

### SBF Binnen — Sportbootführerschein Binnen
- Grundlizenz für Binnengewässer (Flüsse, Seen, Kanäle)
- Der Fragebogen enthält Fragen, die nach Kategorie unterschieden werden:
  - **Basis:** Alle Kandidaten
  - **Motor:** Zusätzlich für Motorboote
  - **Segel:** Zusätzlich für Segelboote
- Bitte beim Verarbeiten des PDFs die Kategorie (Basis/Motor/Segel) aus dem Text extrahieren

### SKS — Sportküstenschifferschein
- Erweiterte Segelschein für Küstengewässer bis 12 sm offshore
- Aufbauend auf SBF See

### SRC — Short Range Certificate
- UKW-Sprechfunkzeugnis für den Seefunk
- Pflicht für Boote mit fest eingebauter UKW-Funkanlage auf dem Meer
- Fragen zu GMDSS, Notfallkommunikation, Kanaländerungen etc.

### UBI — UKW-Sprechfunkzeugnis für Binnen
- Entsprechung zum SRC für Binnengewässer
- Einfachere Anforderungen als SRC

### FKN — Fachkundenachweis Pyrotechnik
- Nachweis für den Umgang mit Signalmitteln (Seenotsignalmittel / Pyrotechnik)
- Pflicht für das Mitführen und Verwenden von Leuchtraketen, Handfackeln etc.

---

## Ziel und Konzept

### Warum dieses Projekt?
Auf YouTube gibt es kaum hochwertiges deutschsprachiges Lernmaterial für Sportbootführerscheine. Die meisten Kandidaten lernen mit PDFs oder Lern-Apps — ohne Erklärungen, warum eine Antwort richtig ist. Dieses Projekt schließt diese Lücke.

### Videoformat
- **Plattform:** YouTube (16:9, 1920×1080)
- **Sprache:** Deutsch (erste Phase); langfristig ggf. auch Englisch für internationale Lernende
- **Länge:** Ca. 5–15 Minuten pro Video (je nach Anzahl der Fragen im Themenblock)
- **Struktur pro Video:**
  1. Kurze Einführung in das Thema des Blocks
  2. Für jede Frage:
     - Frage + alle 4 Antworten anzeigen (Reihenfolge ggf. zufällig)
     - Pause zum Nachdenken
     - Richtige Antwort aufdecken
     - Erklärung: Warum ist das die richtige Antwort?
     - Warum sind die anderen Antworten falsch?
     - Merkhilfe / Eselsbrücke wenn vorhanden
     - Verwandtes Wissen (Kontext, Praxis)
  3. Zusammenfassung des Themenblocks

### Narration
- Zusammenhängende, natürliche Sprache zwischen den Fragen
- Kein Vorlesen der Fragen ohne Kontext — erklärender Stil wie ein guter Lehrer
- Stimme: OpenAI TTS (deutsch, natürlich klingend)

---

## Inhaltliche Aufbereitung

### Copyright-Hinweis
Die offiziellen Fragenkataloge (DMYV/DSV) sind urheberrechtlich geschützt. Originaltexte dürfen **nicht** 1:1 übernommen oder nur minimal verändert werden. Stattdessen: Jede Frage wird inhaltlich verstanden und vollständig neu formuliert — didaktisch besser als das Original.

### Standard-Prompt für Inhaltserstellung (ChatGPT / Claude)

Für jede Frage wird dieser Prompt verwendet, der gleichzeitig Neuformulierung und Erklärskript produziert:

```
Du bist Experte für didaktische Aufbereitung von Lerninhalten im Bereich Sportbootführerschein (SBF See).

Deine Aufgabe ist es, aus einer originalen Prüfungsfrage eine rechtssichere, neu formulierte Version sowie ein hochwertiges YouTube-Lernskript zu erstellen.

WICHTIG:
- Du darfst den Originaltext NICHT übernehmen oder nur minimal verändern
- Du musst die Frage INHALTLICH verstehen und KOMPLETT neu formulieren
- Die Antwortmöglichkeiten müssen ebenfalls eigenständig formuliert werden
- Die richtige Antwort bleibt inhaltlich identisch, aber sprachlich neu
- Keine erkennbaren Kopien oder nahen Paraphrasen

[Originale Frage mit Antworten hier einfügen]

OUTPUT-STRUKTUR:

## 1. Neue Prüfungsfrage (umformuliert)
Formuliere eine neue, natürliche Frage aus der Perspektive einer realen Situation.

## 2. Antwortoptionen
Erstelle 4 Antwortmöglichkeiten:
- genau eine ist korrekt
- drei sind realistisch, aber falsch
- keine Kopie der Originalantworten

## 3. Richtige Antwort

## 4. YouTube-Erklärung (Skriptfähig, gesprochen)
Schreibe eine zusammenhängende Erklärung:
- Einstieg (Situation greifbar machen)
- Auflösung + Begründung
- Warum die anderen Optionen falsch sind

## 5. Merkhilfe

## 6. Zusatzwissen (1–3 kurze Punkte, praxisnah)

TONALITÄT: klar, kompetent, wie ein guter Ausbilder – nicht trocken, nicht zu locker.
```

Aus dem Output werden dann befüllt:
- `question`: Abschnitt 1
- `answers[0-3]`: Abschnitt 2
- `body`: Abschnitte 5+6 als Bullet-Points
- `script`: Abschnitt 4 (fließender Text für TTS)

### Themengruppenbildung (SBF See — Beispiel-Themenblöcke)
Alle Fragen werden thematisch gruppiert, z. B.:
- Pflichten des Schiffsführers / Verantwortung
- Kollisionsverhütungsregeln (KVR) — Ausweichregeln
- Kollisionsverhütungsregeln — Lichterführung
- Kollisionsverhütungsregeln — Schallsignale
- Seezeichen / Betonnung
- Navigation & Seekarten
- Gezeitenrechnung
- Wetterkunde
- Sicherheitsausrüstung
- Motorenkunde / Technik
- Umweltschutz & Recht

---

## Technologie-Pipeline

Die Video-Produktionspipeline basiert auf dem Stack aus dem `stage-buddy`-Projekt und wird für YouTube (16:9) adaptiert.

### Stack
| Komponente | Tool | Zweck |
|------------|------|-------|
| Video-Komposition | [Remotion](https://www.remotion.dev/) | Programmierte Videoerstellung in React/TypeScript |
| Sprachausgabe | OpenAI TTS (`tts-1-hd`) | Deutsche Narration |
| Hintergrundbilder | OpenAI `gpt-image-1` | Schematische Erklärbilder |
| Videoclips (optional) | fal.ai Kling | Animierte Szenen |
| Skripterstellung | Claude / ChatGPT | Erklärungstexte generieren |

### Visuelles Konzept & Farbschema

Statt Stock-Video oder KI-generierter Clips steht **schematische Erklärvisualisierung** im Vordergrund:
- Einfache, klare Grafiken (Seekarten-Stil, Kompassrosen, Schiffssymbole, Pfeile)
- Text-Overlays: Frage → Antwortoptionen → Auflösung → Erklärung
- Headlines und Bullet-Listen für Kontextwissen
- Animierte Übergänge zwischen Fragen

**Farbschema (marineblau-freundlich, modern):**
- Primär: `#0A2342` (tiefes Marineblau)
- Akzent: `#1E90FF` (helles Ozeanblau)
- Highlight: `#F5A623` (warmgelb / Sonnenlicht auf Wasser)
- Hintergrund: `#F0F4F8` (helles Grau-Blau)
- Text: `#FFFFFF` auf dunklem Hintergrund, `#0A2342` auf hellem
- Erfolg/Richtig: `#2ECC71` (Grün)
- Falsch: `#E74C3C` (Rot, dezent)

### Pipeline-Schritte (geplant)

```
1. PDF → Fragen extrahieren (manuell oder per Script)
2. Fragen in Themengruppen einteilen
3. Pro Themengruppe: Erklärungstexte generieren (LLM-Prompt)
4. Skript zusammenstellen (Einleitung + Fragen + Zusammenfassung)
5. YAML Story-Datei erstellen
6. gen:audio → Deutsche TTS-Narration
7. gen:images → Schematische Erklärgrafiken (optional: KI)
8. Remotion → Video rendern
9. Review (Mensch) vor Upload
10. YouTube-Upload
```

### Projektstruktur (geplant)

```
sportbootfuehrerschein/
├── docs/                    # Original-PDFs der Fragebücher
│   ├── SBF See.pdf
│   ├── SBF Binnen.pdf
│   ├── SKS.pdf
│   ├── SRC.pdf
│   ├── UBI.pdf
│   └── FKN.pdf
├── content/                 # Aufbereiteter Inhalt (strukturiert)
│   ├── sbf-see/
│   │   ├── questions.json   # Alle Fragen mit Antworten
│   │   └── groups/          # Themengruppen mit Erklärungen
│   ├── sbf-binnen/
│   ├── sks/
│   ├── src/
│   ├── ubi/
│   └── fkn/
├── remotion/                # Video-Produktionspipeline
│   ├── src/
│   ├── stories/             # YAML-Definitionen pro Video
│   ├── scripts/             # Generierungsscripts
│   └── public/              # Generierte Assets
└── README.md
```

---

## Fahrplan (Roadmap)

### Phase 1 — SBF See (aktuell)
- [x] Projektstruktur + README anlegen
- [ ] SBF See Fragen aus PDF extrahieren
- [ ] Fragen in Themengruppen einteilen
- [ ] Erstes Themenblock-Skript erstellen (Schiffsführerpflichten / Grundlagen)
- [ ] Remotion-Setup (16:9 YouTube-Komposition)
- [ ] Erstes Video rendern und reviewen
- [ ] Iteration und Feinschliff
- [ ] Upload erste SBF-See-Playlist

### Phase 2 — Weitere Zertifikate
- [ ] SBF Binnen
- [ ] SKS
- [ ] SRC
- [ ] UBI
- [ ] FKN

### Phase 3 — Englische Version (langfristig)
- [ ] Erklärvideos für englischsprachige Lernende, die die deutschen Fragen verstehen möchten
- [ ] Zweisprachige Untertitel

---

## Hinweise zur Qualitätssicherung

- **Jedes generierte Video wird vor dem Upload reviewed** — kein automatischer Publish
- Fachliche Korrektheit hat Vorrang vor Produktionsgeschwindigkeit
- Quelldokumente (offizielle Fragenkataloge) sind in `docs/` abgelegt
- Bei Unsicherheit über fachliche Inhalte: Querverweis auf offizielle Lernmaterialien des DMYV / ADAC Sportschiffahrt
