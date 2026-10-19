# Workspace Rule: Universele Kennis-Tijdlijn (Bookshelf)

Wanneer er gewerkt wordt in dit Bookshelf-project, gelden de volgende vaste afspraken en werkmethoden (zie ook `PROJECT_INSTRUCTIONS.md` in de root):

1. **Chronologische Tijdlijn als Primaire Structuur:**
   - Dit project is een Universele Geschiedenistijdlijn (van Oerknal tot Toekomst).
   - Boeken (zoals *Sapiens*, *Het begin van alles*, etc.) zijn bronnen die gekoppeld worden aan tijdlijnpunten in `js/timeline-data.js`.

2. **Nieuwe Kennis Inpassen:**
   - Identificeer het tijdperk / tijdvak van de aangeleverde kennis.
   - Voeg de kennis toe aan een bestaande mijlpaal in `timelineData` (onder `sources: [...]`) of voeg een nieuwe chronologische mijlpaal in.
   - Zorg voor het vaste schema: `bookId`, `bookTitle`, `author`, `chapterNumber`, `chapterTitle`, `kernboodschap`, `inhoud`, `voorbeeld`, `takeaways`.
   - Registreer nieuwe boeken in de array `registeredBooks`.

3. **Technologie & Design:**
   - Puur Vanilla HTML, CSS en JavaScript (geen externe build tools of node dependencies vereist om de site te draaien).
   - Altijd responsive blijven voor alle schermformaten.
   - Na wijzigingen altijd `node -c js/timeline-data.js` en `node -c js/app.js` draaien ter verificatie.

