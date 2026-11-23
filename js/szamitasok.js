/* ==========================================================================
   JS – Vizes kihívások: a számítások
   Minden feladathoz egy függvény tartozik. A függvény megkapja a feladat
   adatait, és egy objektumban adja vissza az összes részeredményt.
   Ezeket a függvényeket a böngésző konzoljában is kipróbálhatod, például:
       csepegoCsap(2, 0.25, 30, 365, 950)
   ========================================================================== */

"use strict";

/* 1. feladat – A csepegő csap
   cseppIdokoz:   ennyi másodpercenként esik le egy csepp (s)
   cseppTerfogat: egy csepp térfogata (ml)
   honapNapjai:   egy hónap hány napos
   evNapjai:      egy év hány napos
   vizdij:        víz- és csatornadíj együtt (Ft/m³) */
function csepegoCsap(cseppIdokoz, cseppTerfogat, honapNapjai, evNapjai, vizdij) {
  const napiMasodperc = 24 * 60 * 60;                    // 86 400 s
  const napiCseppek = napiMasodperc / cseppIdokoz;
  const napiMl = napiCseppek * cseppTerfogat;
  const napiLiter = napiMl / 1000;                        // 1 liter = 1000 ml
  const haviLiter = napiLiter * honapNapjai;
  const haviM3 = haviLiter / 1000;                        // 1 m³ = 1000 liter
  const eviLiter = napiLiter * evNapjai;
  const eviM3 = eviLiter / 1000;
  const eviKoltseg = eviM3 * vizdij;
  return { napiMasodperc, napiCseppek, napiMl, napiLiter, haviLiter, haviM3, eviLiter, eviM3, eviKoltseg };
}

/* 2. feladat – A láthatatlan vízlábnyom
   A kosár tartalma darabban / kilogrammban / csomagban, mellette az,
   hogy egységenként mennyi víz kell az előállításához (liter). */
function vizlabnyom(farmerDb, farmerLiter, husKg, husLiterKg, kaveCsomag, cseszePerCsomag, kaveLiterCsesze, csaladFo, literFoNap) {
  const farmerViz = farmerDb * farmerLiter;
  const husViz = husKg * husLiterKg;
  const cseszek = kaveCsomag * cseszePerCsomag;
  const kaveViz = cseszek * kaveLiterCsesze;
  const osszesViz = farmerViz + husViz + kaveViz;
  const csaladNapi = csaladFo * literFoNap;
  const napok = osszesViz / csaladNapi;
  const teljesNapok = Math.floor(napok);                  // csak a teljes napok számítanak
  return { farmerViz, husViz, cseszek, kaveViz, osszesViz, csaladNapi, napok, teljesNapok };
}

/* 3. feladat – Vízveszteség a hálózatban
   fogyasztas:      amennyi vizet a fogyasztók megkapnak havonta (m³)
   vesztesegElotte: a kitermelt víz hány százaléka szivárog el most
   vesztesegUtana:  hány százalék a felújítás után */
function halozatiVeszteseg(fogyasztas, vesztesegElotte, vesztesegUtana) {
  // Ha a víz 25%-a elszivárog, akkor csak 75%-a ér el a fogyasztókhoz:
  // kitermelt · 0,75 = fogyasztás  →  kitermelt = fogyasztás : 0,75
  const megmaradElotte = 1 - vesztesegElotte / 100;
  const kitermelesElotte = fogyasztas / megmaradElotte;
  const elszivarog = kitermelesElotte - fogyasztas;
  const megmaradUtana = 1 - vesztesegUtana / 100;
  const kitermelesUtana = fogyasztas / megmaradUtana;
  const csokkenesSzazalek = (kitermelesElotte - kitermelesUtana) / kitermelesElotte * 100;
  return { megmaradElotte, kitermelesElotte, elszivarog, megmaradUtana, kitermelesUtana, csokkenesSzazalek };
}

/* 4. feladat – A szürkevíz hasznosítása
   fo, alkalomPerFo:  hányan vannak, és naponta hányszor öblít egy ember
   regiTartaly:       a régi tartály literje öblítésenként
   ujTartaly:         a kétgombos tartály átlagos literje öblítésenként
   szurkevizArany:    az öblítővíz hány százalékát váltja ki a szürkevíz
   literFoNap:        egy ember teljes napi vízfogyasztása (liter)
   napok:             a hónap napjainak száma */
function szurkeviz(fo, alkalomPerFo, regiTartaly, ujTartaly, szurkevizArany, literFoNap, napok) {
  const napiOblites = fo * alkalomPerFo;
  const regiNapi = napiOblites * regiTartaly;
  const regiHavi = regiNapi * napok;
  const regiHaviM3 = regiHavi / 1000;
  const napiOsszes = fo * literFoNap;
  const oblitesSzazalek = regiNapi / napiOsszes * 100;
  const ujHavi = napiOblites * ujTartaly * napok;
  const ivovizHavi = ujHavi * (1 - szurkevizArany / 100);
  const csokkenesSzazalek = (regiHavi - ivovizHavi) / regiHavi * 100;
  return { napiOblites, regiNapi, regiHavi, regiHaviM3, napiOsszes, oblitesSzazalek, ujHavi, ivovizHavi, csokkenesSzazalek };
}

/* 5. feladat – Hagyományos és csepegtető öntözés
   terulet:          a fóliasátor területe (m²)
   literPerM2:       alkalmanként négyzetméterenként kijuttatott víz (liter)
   alkalomPerHet:    hetente hányszor öntöznek
   hetek:            a hónap hány hetes
   megtakaritas:     a csepegtető öntözés megtakarítása (%) */
function ontozes(terulet, literPerM2, alkalomPerHet, hetek, megtakaritas) {
  const alkalmankent = terulet * literPerM2;
  const hetente = alkalmankent * alkalomPerHet;
  const haviLiter = hetente * hetek;
  const haviM3 = haviLiter / 1000;
  const megtakaritottLiter = haviLiter * megtakaritas / 100;
  return { alkalmankent, hetente, haviLiter, haviM3, megtakaritottLiter };
}

/* 6. feladat – A fogmosás
   nyitottCsap:     ennyi liter folyik el, ha végig nyitva a csap
   elzartCsap:      ennyi liter fogy, ha csak öblítéskor nyitod meg
   fogmosasPerNap:  naponta hányszor mosol fogat */
function fogmosas(nyitottCsap, elzartCsap, fogmosasPerNap) {
  const egyAlkalom = nyitottCsap - elzartCsap;
  const napiMegtakaritas = egyAlkalom * fogmosasPerNap;
  const kevesebbSzazalek = egyAlkalom / nyitottCsap * 100;
  return { egyAlkalom, napiMegtakaritas, kevesebbSzazalek };
}

// Node.js-ben (például teszteléshez) is be lehessen tölteni ezt a fájlt.
if (typeof module !== "undefined") {
  module.exports = { csepegoCsap, vizlabnyom, halozatiVeszteseg, szurkeviz, ontozes, fogmosas };
}
