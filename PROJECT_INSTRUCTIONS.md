# Instructies & Werkwijze: Universele Kennis-Tijdlijn (Bookshelf)

Dit document bevat de vaste architectuur, ontwerpprincipes en de stapsgewijze werkwijze voor het onderhouden en uitbreiden van dit project. Lees dit document bij elke nieuwe taak of toevoeging van kennis.

---

## 1. Projectfilosofie & Doel

- **Tijdlijn als Ruggengraat:** Het project is géén simpele verzameling boeksamenvattingen, maar een **Universele Historische Kennis-Tijdlijn** van 13,5 miljard jaar geschiedenis (van de Oerknal tot de Toekomst).
- **Multi-Source Perspectieven:** Boeken (zoals *Sapiens* van Harari, *Het begin van alles* van Graeber & Wengrow, enz.) zijn **bronnen** die inhaken op specifieke historische tijdperken en mijlpalen.
- **Synthese en Contrast:** Door meerdere boeken aan hetzelfde tijdlijnpunt te koppelen, kunnen verschillende theorieën (bijvoorbeeld over de aard van jager-verzamelaars of het ontstaan van landbouw) direct naast elkaar worden vergeleken.

---

## 2. Bestandsstructuur & Navigatie-architectuur

- [index.html](file:///c:/Users/spuya/Desktop/Apps/bookshelf/index.html): De visuele structuur met 3 hoofdweergaven (*views*):
  - `#home-view`: De **Landingspagina** die het project, de twee zuilen en de tijdlijnfilosofie introduceert.
  - `#world-timeline`: De **Universele Geschiedenistijdlijn** ("To get to know the world") met zoekbalk, filters en 20 chronologische mijlpalen.
  - `#myself-view`: De sectie **Zelfkennis & Psychologie** ("To get to know myself").
- [css/styles.css](file:///c:/Users/spuya/Desktop/Apps/bookshelf/css/styles.css): Responsieve styling (mobile-first), zwarte navigatie met witte knoppen en vinkjes, landingspagina-kaarten, gelaagde schaduwen, tijdlijn-as en multi-source kaarten.
- [js/timeline-data.js](file:///c:/Users/spuya/Desktop/Apps/bookshelf/js/timeline-data.js): De centrale database met `timelineData` (de chronologische mijlpalen en gekoppelde bronnen), `timelinePeriods` (tijdperken) en `registeredBooks` (geregistreerde boeken).
- [js/app.js](file:///c:/Users/spuya/Desktop/Apps/bookshelf/js/app.js): Dynamische renderlogica, router voor het schakelen tussen de 3 views, open-/dichtklappen van analyses per bron, live zoeken en filteren.


---

## 3. Stappenplan voor het Toevoegen van Nieuwe Kennis

Wanneer de gebruiker nieuwe tekst, notities of hoofdstukken aanlevert (via de chat of via een notitiebestand):

### Stap 1: Bepaal de Chronologische Plaatsing
1. Identificeer het tijdvak en thema van de tekst (bijv. *~12.000 v.Chr., overgang naar landbouw*).
2. Controleer in `timelineData` of er al een passende mijlpaal bestaat:
   - **Bestaande mijlpaal:** Voeg het boek toe aan de `sources`-array van die mijlpaal. Zo ontstaat een multi-source vergelijking.
   - **Nieuwe mijlpaal nodig:** Voeg een nieuw object toe aan `timelineData` op de juiste chronologische plek (let op `chronologicalOrder` en het juiste `periodId`).

### Stap 2: Structureer de Bron-Gegevens
Elke bron binnen de `sources`-array moet voldoen aan dit vaste schema:
```javascript
{
  bookId: "unieke-id-zonder-spaties", // bijv. "het-begin-van-alles"
  bookTitle: "Titel van het boek",
  author: "Naam van de auteur(s)",
  chapterNumber: 1, // optioneel
  chapterTitle: "Hoofdstuktitel of thematitel",
  kernboodschap: "1 of 2 krachtige zinnen die de essentie samenvatten.",
  inhoud: [
    "Alinea 1 met uitgebreide diepgang en argumentatie...",
    "Alinea 2...",
    "Alinea 3..."
  ],
  voorbeeld: "Het meest sprekende historische of antropologische voorbeeld uit deze tekst.",
  takeaways: [
    "Belangrijkste inzicht 1",
    "Belangrijkste inzicht 2",
    "Belangrijkste inzicht 3"
  ]
}
```

### Stap 3: Registreer het Boek in `registeredBooks`
Als het boek nog niet eerder voorkwam, voeg het toe aan de array `registeredBooks` in `js/timeline-data.js`:
```javascript
{ id: "het-begin-van-alles", title: "Het begin van alles (Graeber & Wengrow)" }
```
Hierdoor verschijnt het boek automatisch in het dropdown-filter van de applicatie.

### Stap 4: Verifieer & Test
1. Voer altijd een syntax-check uit:
   ```powershell
   node -c js/timeline-data.js
   node -c js/app.js
   ```
2. Controleer of de chronologische volgorde klopt en of de filteropties blijven functioneren.

---

## 4. Vaste Ontwerp- & Codeconventies

- **Taal:** De interface, labels, samenvattingen en documentatie zijn in het **Nederlands**. Code-variabelen, CSS-klassen en HTML-attributen blijven in het **Engels**.
- **Puur Vanilla:** Geen externe frameworks of build-tools (geen npm, geen Webpack). De app moet direct functioneren door [index.html](file:///c:/Users/spuya/Desktop/Apps/bookshelf/index.html) in een willekeurige browser te openen.
- **Responsiveness:** Elk nieuw element moet responsive zijn en er zowel op mobiel (<480px), tablet als desktop perfect uitzien.
- **Styling Identiteit:** Handhaaf de strakke zwart-wit vormgeving met zachte schaduwen, ronde hoeken (`border-radius: 8px` tot `12px`) en het herkenbare vinkje-symbool (`✓`).

