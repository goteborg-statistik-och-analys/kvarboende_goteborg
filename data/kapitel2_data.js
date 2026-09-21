/* --------------------------------------------------------------
   Data till kapitel 2, "Är det här normalt?".
   Källa: flyttmatris_aldersgrupper.xlsx, flikarna T1_1ar_andel och
   T4_in_andel, gruppen "Totalt". Andelar i procent.

   kvar_i_goteborg: summan av alla nivåer inom Göteborg (T1), andel
   av föregående års befolkning. Ingen lucka 2019 — även det år då
   lägenhetsnivå saknas fångas av restkategorin "samma basområde,
   lägenhet ej mätbar".

   utflode/inflode: T1 respektive T4. Observera att nämnaren skiljer
   sig: utflödet är andel av förra årets befolkning, inflödet är
   andel av det aktuella årets befolkning. Se metodpanelen.
   -------------------------------------------------------------- */

window.DATA_KAPITEL2 = {
  ar: ["2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023","2024","2025"],

  kvar_i_goteborg: [94.43,94.43,94.46,94.67,94.45,94.56,94.60,94.35,94.03,94.51,94.52,94.21,94.47],
  kvar_spann: { min: 94.03, minAr: "2021", max: 94.67, maxAr: "2016" },
  lamnar_spann: { min: 5.34, minAr: "2016", max: 5.96, maxAr: "2021" },

  /* Kvar i Göteborg uppdelat: samma lägenhet respektive bytt bostad men
     kvar i staden. bytt_inom_staden = kvar_i_goteborg - samma_bostad, precis
     som i kapitel 1. 2019 saknar lägenhetsnivå helt (formatbytet) — värdet
     är null, inte en gissning. Diagrammet bryter linjen vid dataluckan. */
  samma_bostad:     [81.68, 81.49, 82.39, 83.15, 83.23, 83.22, null,  82.06, 81.11, 82.56, 83.10, 82.72, 83.10],
  bytt_inom_staden: [12.75, 12.94, 12.07, 11.52, 11.22, 11.34, null,  12.29, 12.92, 11.95, 11.42, 11.49, 11.37],

  utflode: [
    { id: "gr",        farg: "rosa", namn: "Till övriga Göteborgsregionen",
      varden: [1.73,1.84,1.79,1.87,2.00,2.02,1.95,1.96,2.06,1.87,1.69,1.69,1.69] },
    { id: "sverige",   farg: "lila", namn: "Till övriga Sverige",
      varden: [2.12,2.12,2.13,2.04,2.12,2.02,2.05,2.22,2.44,2.15,1.97,2.01,2.04] },
    { id: "utvandrat", farg: "rod",  namn: "Utvandrat eller avlidit",
      varden: [1.72,1.62,1.62,1.43,1.42,1.39,1.39,1.48,1.46,1.46,1.81,2.09,1.79] }
  ],

  inflode: [
    { id: "nyfodda",   farg: "gron", namn: "Nyfödda",
      varden: [1.38,1.38,1.36,1.37,1.30,1.30,1.26,1.23,1.27,1.13,1.11,1.10,1.10] },
    { id: "gr_in",     farg: "rosa", namn: "Från övriga Göteborgsregionen",
      varden: [1.37,1.30,1.30,1.23,1.22,1.24,1.32,1.44,1.48,1.42,1.41,1.36,1.37] },
    { id: "sverige_in",farg: "lila", namn: "Från övriga Sverige",
      varden: [2.49,2.55,2.42,2.31,2.32,2.28,2.24,2.33,2.46,2.52,2.57,2.50,2.47] },
    { id: "invandrade",farg: "rod",  namn: "Invandrade eller tidigare ej folkbokförda",
      varden: [1.60,1.72,1.67,1.85,1.94,1.91,1.78,1.27,1.47,1.89,1.60,1.52,1.25] }
  ],

  kalla: "Individdatabasen P1336, SCB:s MONA-miljö. Flikarna T1_1ar_andel och T4_in_andel.",
  uppdaterad: "10 september 2026"
};
