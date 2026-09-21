/* Flödesdata för kapitel 1.
   Skrivs ut av exportskriptet i R. Ändra inte för hand.

   TVÅ SLAGS TAL, som aldrig får blandas ihop:

   "arsskifte"  Vårt eget mått. Personer folkbokförda i Göteborg
                31/12 2024 jämfört med var samma personer var
                folkbokförda 31/12 2025. En person som bytt adress
                två gånger och landat där hon började räknas som
                kvarboende.
                Källa: individdatabasen P1336 (SCB).

   "under_aret" Officiell befolkningsstatistik. Registrerade
                händelser under kalenderåret 2025. En person kan
                ha flyttat flera gånger och räknas då flera gånger.
                Källa: Göteborgs Stads statistikdatabas.

   Filen är JavaScript i stället för JSON så att rapporten fungerar
   även när man öppnar den utan webbserver. */

window.DATA_FLODE = {
  "schema_version": 1,
  "serieperiod": "2013–2025",
  "kallor": {
    "arsskifte": "Individdatabasen P1336 (SCB), bearbetning Göteborgs Stad",
    "under_aret": "Göteborgs Stads statistikdatabas",
    "bostader": "Göteborgs Stads lägenhetsregister och hushållsstatistik"
  },
  "uppdaterad": "2026-09-10",
  "period": { "fran": 2024, "till": 2025 },

  "befolkning": { "start": 608996, "slut": 613284, "forandring": 4288 },

  "utflode": [
    { "id": "samma",   "text": "Kvar i samma bostad",                  "antal": 506076, "andel": 83.1, "farg": "turkos" },
    { "id": "inom",    "text": "Bytt bostad inom staden",              "antal": 69284,  "andel": 11.37, "farg": "gul" },
    { "id": "gr",      "text": "Flyttat till övriga Göteborgsregionen","antal": 10319,  "andel": 1.69, "farg": "rosa" },
    { "id": "sverige", "text": "Flyttat till övriga Sverige",          "antal": 12412,  "andel": 2.04, "farg": "lila" },
    { "id": "bort",    "text": "Utvandrat eller avlidit",              "antal": 10910,  "andel": 1.79, "farg": "rod" }
  ],

  "inflode": [
    { "id": "fodda",     "text": "Nollåringar, födda under året",           "antal": 6739,  "andel": 1.10, "farg": "gron" },
    { "id": "in_gr",     "text": "Inflyttade från övriga Göteborgsregionen","antal": 8389,  "andel": 1.37, "farg": "rosa" },
    { "id": "in_sverige","text": "Inflyttade från övriga Sverige",          "antal": 15159, "andel": 2.47, "farg": "lila" },
    { "id": "in_utland", "text": "Invandrade eller tidigare ej folkbokförda","antal": 7637, "andel": 1.25, "farg": "rod" }
  ],

  /* Registrerat under kalenderåret 2025. Jämförs med vårt mått för
     att visa hur mycket rörelse som inte syns mellan två årsskiften. */
  "under_aret": {
    "fodda": 6875,
    "avlidna": 4126,
    "flytt_inom_gbg": 73020,
    "in_gr": 10100,
    "ut_gr": 12092,
    "in_riket": 18260,
    "ut_riket": 15498,
    "invandring": 7933,
    "utvandring": 7185
  },

  "bostader": {
    "lagenhetsregister": 312429,
    "bostadshushall": 298122
  },

  "datakontroller": [
    {
      "id": "utflode_summa",
      "status": "varning",
      "avvikelse": 5,
      "text": "Delposterna i flyttmatrisen summerar till fem fler än startpopulationen. Avvikelsen påverkar inte redovisningen med en decimal men ska utredas före publicering."
    }
  ]
};
