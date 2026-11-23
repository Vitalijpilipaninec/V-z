/* ==========================================================================
   Témahét 2026 – JS: Vizes kihívások (a weboldal 5. része)
   1. Segédfüggvények (szám beolvasása, formázás, hibaüzenet)
   2. A hat feladat kiírása
   3. Események: gépelés, „Eredeti számok” gomb, a kód megjelenítése
   A számításokat a szamitasok.js végzi, a fülek váltását a script.js.
   ========================================================================== */

(function () {
  "use strict";

  /* 1. Segédfüggvények ------------------------------------------------------ */

  // Beolvas egy számot egy mezőből. A tizedesvesszőt is elfogadja: "0,25" → 0.25
  function olvas(azonosito) {
    const mezo = document.getElementById(azonosito);
    const szoveg = mezo.value.trim().replace(/\s/g, "").replace(",", ".");
    if (szoveg === "") {
      return NaN;
    }
    return Number(szoveg);
  }

  // Magyar számformátum: 43200 → "43 200", 0.25 → "0,25"
  function sz(szam, tizedes = 2) {
    return szam.toLocaleString("hu-HU", { maximumFractionDigits: tizedes });
  }

  // Megnézi, hogy a feladat minden mezőjében jó szám áll-e.
  // Ha nem, a hibás mezőt pirossal jelöli, és visszaadja a hibaüzenetet.
  function ellenoriz(feladat) {
    const mezok = feladat.querySelectorAll("input");
    let uzenet = "";
    mezok.forEach(function (mezo) {
      const ertek = olvas(mezo.id);
      const nev = feladat.querySelector('label[for="' + mezo.id + '"]').textContent;
      let hibas = false;

      if (Number.isNaN(ertek)) {
        hibas = true;
        if (!uzenet) uzenet = "Írj számot ide: „" + nev + "”.";
      } else if (mezo.dataset.szazalek === "kisebb" && (ertek < 0 || ertek >= 100)) {
        hibas = true;
        if (!uzenet) uzenet = "Itt 0 és 100 közötti szám kell, de a 100 már nem jó: „" + nev + "”.";
      } else if (mezo.dataset.szazalek === "max" && (ertek < 0 || ertek > 100)) {
        hibas = true;
        if (!uzenet) uzenet = "Itt 0 és 100 közötti szám kell: „" + nev + "”.";
      } else if (!mezo.dataset.szazalek && ertek <= 0) {
        hibas = true;
        if (!uzenet) uzenet = "Itt 0-nál nagyobb szám kell: „" + nev + "”.";
      }

      mezo.setAttribute("aria-invalid", hibas ? "true" : "false");
    });
    return uzenet;
  }

  // A feladat válaszait (a, b, c) írja ki, vagy a hibaüzenetet mutatja.
  function kiir(azonosito, valaszok, hiba) {
    const hibaElem = document.getElementById(azonosito + "-hiba");
    const lista = document.querySelector("#" + azonosito + "-eredmeny .valaszok");
    const doboz = document.getElementById(azonosito + "-eredmeny");

    if (hiba) {
      hibaElem.textContent = hiba;
      hibaElem.hidden = false;
      lista.hidden = true;
      doboz.classList.add("hibas");
      return;
    }

    hibaElem.hidden = true;
    lista.hidden = false;
    doboz.classList.remove("hibas");
    const betuk = ["a", "b", "c"];
    valaszok.forEach(function (szoveg, i) {
      document.getElementById(azonosito + "-" + betuk[i]).innerHTML = szoveg;
    });
  }


  /* 2. A hat feladat -------------------------------------------------------- */

  function feladat1() {
    const hiba = ellenoriz(document.getElementById("k1"));
    if (hiba) return kiir("k1", [], hiba);

    const ido = olvas("k1-ido");
    const csepp = olvas("k1-csepp");
    const honap = olvas("k1-honap");
    const ev = olvas("k1-ev");
    const dij = olvas("k1-dij");
    const r = csepegoCsap(ido, csepp, honap, ev, dij);

    kiir("k1", [
      `1 nap = 24 · 60 · 60 = ${sz(r.napiMasodperc)} s → ${sz(r.napiMasodperc)} : ${sz(ido)} = ${sz(r.napiCseppek)} csepp → ` +
        `${sz(r.napiCseppek)} · ${sz(csepp)} ml = ${sz(r.napiMl)} ml = <strong>${sz(r.napiLiter)} liter naponta</strong>`,
      `${sz(r.napiLiter)} l · ${sz(honap)} = ${sz(r.haviLiter)} l = <strong>${sz(r.haviM3, 3)} m³ havonta</strong>`,
      `${sz(r.napiLiter)} l · ${sz(ev)} = ${sz(r.eviLiter)} l = ${sz(r.eviM3, 3)} m³ → ${sz(r.eviM3, 3)} · ${sz(dij)} Ft = ` +
        `${sz(r.eviKoltseg)} Ft ≈ <strong>${sz(Math.round(r.eviKoltseg), 0)} Ft évente</strong>`
    ]);
  }

  function feladat2() {
    const hiba = ellenoriz(document.getElementById("k2"));
    if (hiba) return kiir("k2", [], hiba);

    const farmer = olvas("k2-farmer");
    const farmerL = olvas("k2-farmer-l");
    const hus = olvas("k2-hus");
    const husL = olvas("k2-hus-l");
    const kave = olvas("k2-kave");
    const csesze = olvas("k2-csesze");
    const kaveL = olvas("k2-kave-l");
    const fo = olvas("k2-fo");
    const fejadag = olvas("k2-fejadag");
    const r = vizlabnyom(farmer, farmerL, hus, husL, kave, csesze, kaveL, fo, fejadag);

    kiir("k2", [
      `${sz(farmer)} · ${sz(farmerL)} + ${sz(hus)} · ${sz(husL)} + ${sz(kave)} · ${sz(csesze)} · ${sz(kaveL)} = ` +
        `${sz(r.farmerViz)} + ${sz(r.husViz)} + ${sz(r.kaveViz)} = <strong>${sz(r.osszesViz)} liter</strong>`,
      `${sz(fo)} · ${sz(fejadag)} = ${sz(r.csaladNapi)} l/nap → ${sz(r.osszesViz)} : ${sz(r.csaladNapi)} = ${sz(r.napok)} → ` +
        `<strong>${sz(r.teljesNapok, 0)} teljes nap</strong>`
    ]);
  }

  function feladat3() {
    const hiba = ellenoriz(document.getElementById("k3"));
    if (hiba) return kiir("k3", [], hiba);

    const fogy = olvas("k3-fogy");
    const elotte = olvas("k3-elotte");
    const utana = olvas("k3-utana");
    const r = halozatiVeszteseg(fogy, elotte, utana);

    kiir("k3", [
      `A kitermelt víz ${sz(100 - elotte)}%-a ér el a fogyasztókhoz: ${sz(fogy)} : ${sz(r.megmaradElotte, 4)} = ` +
        `<strong>${sz(r.kitermelesElotte)} m³ kitermelés</strong>, ebből elszivárog ${sz(r.kitermelesElotte)} − ${sz(fogy)} = ` +
        `<strong>${sz(r.elszivarog)} m³</strong>`,
      `${sz(fogy)} : ${sz(r.megmaradUtana, 4)} = ${sz(r.kitermelesUtana)} m³ → ` +
        `(${sz(r.kitermelesElotte)} − ${sz(r.kitermelesUtana)}) : ${sz(r.kitermelesElotte)} · 100 = ` +
        `<strong>${sz(r.csokkenesSzazalek, 1)}%-kal kevesebb</strong>`
    ]);
  }

  function feladat4() {
    const hiba = ellenoriz(document.getElementById("k4"));
    if (hiba) return kiir("k4", [], hiba);

    const fo = olvas("k4-fo");
    const alkalom = olvas("k4-alkalom");
    const regi = olvas("k4-regi");
    const uj = olvas("k4-uj");
    const szurke = olvas("k4-szurke");
    const fejadag = olvas("k4-fejadag");
    const napok = olvas("k4-napok");
    const r = szurkeviz(fo, alkalom, regi, uj, szurke, fejadag, napok);

    kiir("k4", [
      `${sz(fo)} · ${sz(alkalom)} = ${sz(r.napiOblites)} öblítés/nap → ${sz(r.napiOblites)} · ${sz(regi)} l = ${sz(r.regiNapi)} l/nap → ` +
        `${sz(r.regiNapi)} · ${sz(napok)} = <strong>${sz(r.regiHavi)} liter = ${sz(r.regiHaviM3, 3)} m³</strong>`,
      `${sz(r.regiNapi)} : ${sz(r.napiOsszes)} · 100 = <strong>${sz(r.oblitesSzazalek, 1)}%</strong>`,
      `${sz(r.napiOblites)} · ${sz(uj)} l · ${sz(napok)} = ${sz(r.ujHavi)} l → ivóvíz: ${sz(r.ujHavi)} · ${sz(1 - szurke / 100, 4)} = ` +
        `<strong>${sz(r.ivovizHavi)} liter</strong> → (${sz(r.regiHavi)} − ${sz(r.ivovizHavi)}) : ${sz(r.regiHavi)} · 100 = ` +
        `<strong>${sz(r.csokkenesSzazalek, 1)}%-kal kevesebb</strong>`
    ]);
  }

  function feladat5() {
    const hiba = ellenoriz(document.getElementById("k5"));
    if (hiba) return kiir("k5", [], hiba);

    const terulet = olvas("k5-terulet");
    const liter = olvas("k5-liter");
    const alkalom = olvas("k5-alkalom");
    const het = olvas("k5-het");
    const megtakaritas = olvas("k5-megtakaritas");
    const r = ontozes(terulet, liter, alkalom, het, megtakaritas);

    kiir("k5", [
      `${sz(terulet)} · ${sz(liter)} · ${sz(alkalom)} · ${sz(het)} = ${sz(r.haviLiter)} liter = <strong>${sz(r.haviM3, 3)} m³</strong>`,
      `${sz(r.haviLiter)} · ${sz(megtakaritas / 100, 4)} = <strong>${sz(r.megtakaritottLiter)} liter havonta</strong>`
    ]);
  }

  function feladat6() {
    const hiba = ellenoriz(document.getElementById("k6"));
    if (hiba) return kiir("k6", [], hiba);

    const nyitott = olvas("k6-nyitott");
    const elzart = olvas("k6-elzart");
    const db = olvas("k6-db");
    if (elzart > nyitott) {
      return kiir("k6", [], "Az elzárt csappal nem fogyhat több víz, mint a végig nyitottal.");
    }
    const r = fogmosas(nyitott, elzart, db);

    kiir("k6", [
      `(${sz(nyitott)} − ${sz(elzart)}) · ${sz(db)} = ${sz(r.egyAlkalom)} · ${sz(db)} = <strong>${sz(r.napiMegtakaritas)} liter naponta</strong>`,
      `${sz(r.egyAlkalom)} : ${sz(nyitott)} · 100 = <strong>${sz(r.kevesebbSzazalek, 1)}%-kal kevesebb</strong>`
    ]);
  }


  /* 3. Események ------------------------------------------------------------ */

  const feladatok = {
    k1: { szamol: feladat1, fuggveny: csepegoCsap },
    k2: { szamol: feladat2, fuggveny: vizlabnyom },
    k3: { szamol: feladat3, fuggveny: halozatiVeszteseg },
    k4: { szamol: feladat4, fuggveny: szurkeviz },
    k5: { szamol: feladat5, fuggveny: ontozes },
    k6: { szamol: feladat6, fuggveny: fogmosas }
  };

  Object.keys(feladatok).forEach(function (azonosito) {
    const kartya = document.getElementById(azonosito);
    const adat = feladatok[azonosito];

    // gépelés közben azonnal újraszámol
    kartya.querySelectorAll("input").forEach(function (mezo) {
      mezo.addEventListener("input", adat.szamol);
    });

    // „Eredeti számok” gomb: visszaírja a feladat eredeti adatait
    kartya.querySelector(".vissza").addEventListener("click", function () {
      kartya.querySelectorAll("input").forEach(function (mezo) {
        mezo.value = mezo.defaultValue;
      });
      adat.szamol();
    });

    // a kód megjelenítése: a függvény saját szövege
    document.getElementById(azonosito + "-kod").textContent = adat.fuggveny.toString();

    // betöltéskor egyszer kiszámoljuk
    adat.szamol();
  });
})();
