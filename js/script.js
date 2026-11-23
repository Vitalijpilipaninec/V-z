/* ==========================================================================
   Témahét 2026 – az oldal kis interaktív részei

   1. Mobil menü
   2. Aktív menüpont görgetéskor
   3. Csepp alakú mérők (a 36%-os nyitó csepp és a vállalások cseppje)
   4. Fülek (a megoldásoknál és a vizes kihívásoknál)
   5. Vállalások: pipák számolása és mentése
   6. Visszaszámláló a plakátversenyhez
   ========================================================================== */

(function () {
  "use strict";

  var mozgasNelkul = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  /* 1. Mobil menü --------------------------------------------------------- */

  var menuGomb = document.querySelector(".menu-gomb");
  var menu = document.getElementById("fomenu");

  function menuBezar() {
    menuGomb.setAttribute("aria-expanded", "false");
    menu.classList.remove("nyitva");
  }

  menuGomb.addEventListener("click", function () {
    var nyitva = menuGomb.getAttribute("aria-expanded") === "true";
    menuGomb.setAttribute("aria-expanded", String(!nyitva));
    menu.classList.toggle("nyitva", !nyitva);
  });

  // ha a menüben valamelyik pontra kattintunk, a menü bezárul
  menu.addEventListener("click", function (esemeny) {
    if (esemeny.target.closest("a")) {
      menuBezar();
    }
  });

  document.addEventListener("keydown", function (esemeny) {
    if (esemeny.key === "Escape" && menu.classList.contains("nyitva")) {
      menuBezar();
      menuGomb.focus();
    }
  });


  /* 2. Aktív menüpont görgetéskor ----------------------------------------- */

  var menupontok = menu.querySelectorAll("a");

  if ("IntersectionObserver" in window) {
    var figyelo = new IntersectionObserver(function (bejegyzesek) {
      bejegyzesek.forEach(function (bejegyzes) {
        if (!bejegyzes.isIntersecting) {
          return;
        }
        menupontok.forEach(function (pont) {
          if (pont.getAttribute("href") === "#" + bejegyzes.target.id) {
            pont.setAttribute("aria-current", "true");
          } else {
            pont.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    ["valosag", "viz", "megoldas", "kihivasok", "plakatverseny"].forEach(function (azonosito) {
      var szakasz = document.getElementById(azonosito);
      if (szakasz) {
        figyelo.observe(szakasz);
      }
    });
  }


  /* 3. Csepp alakú mérők -------------------------------------------------- */
  /* A csepp alja szélesebb, mint a teteje, ezért a 36%-hoz nem a magasság
     36%-áig kell feltölteni, hanem addig, amíg a csepp TERÜLETÉNEK 36%-a
     megtelik. Ehhez vékony vízszintes szeletekre bontjuk a cseppet.

     A csepp alakja (lásd az index.html-ben): teteje a (50,0) pont, felső
     része egy Bézier-görbe, alja egy 34 sugarú félkör, középpontja (50,64). */

  function bezierY(t) {
    var m = 1 - t;
    return 3 * m * t * t * 38 + t * t * t * 64;
  }

  function bezierX(t) {
    var m = 1 - t;
    return 50 * m * m * m + 3 * m * m * t * 50 + 3 * m * t * t * 84 + t * t * t * 84;
  }

  // a csepp fél szélessége adott magasságban (y: 0 = csúcs, 98 = alja)
  function felSzelesseg(y) {
    if (y >= 64) {
      var d = y - 64;
      return Math.sqrt(Math.max(0, 34 * 34 - d * d));
    }
    // a Bézier-görbén megkeressük azt a t-t, ahol a görbe éppen y magasan jár
    var also = 0;
    var felso = 1;
    for (var i = 0; i < 30; i++) {
      var t = (also + felso) / 2;
      if (bezierY(t) < y) {
        also = t;
      } else {
        felso = t;
      }
    }
    return bezierX((also + felso) / 2) - 50;
  }

  // alulról felfelé összeadjuk a szeletek területét
  var LEPES = 0.5;
  var szeletek = [];
  var teljesTerulet = 0;
  for (var y = 98; y > 0; y -= LEPES) {
    teljesTerulet += 2 * felSzelesseg(y - LEPES / 2) * LEPES;
    szeletek.push({ y: y - LEPES, terulet: teljesTerulet });
  }

  // arány (0–1) → a vízfelszín magassága a csepp tetejétől
  function vizszint(arany) {
    if (arany <= 0) {
      return 100;
    }
    if (arany >= 1) {
      return -4;
    }
    var cel = arany * teljesTerulet;
    for (var i = 0; i < szeletek.length; i++) {
      if (szeletek[i].terulet >= cel) {
        return szeletek[i].y;
      }
    }
    return -4;
  }

  function meroBeallit(viz, arany) {
    viz.style.setProperty("--szint", vizszint(arany).toFixed(2));
    var hullam = viz.querySelector(".mero-hullam");
    if (hullam && !mozgasNelkul) {
      // a hullám animációját újraindítjuk
      hullam.classList.remove("hullamzik");
      void hullam.getBoundingClientRect();
      hullam.classList.add("hullamzik");
    }
  }

  // a nyitó csepp betöltéskor üresről 36%-ig telik
  var nyitoViz = document.querySelector(".nyito-mero .mero-viz");
  if (nyitoViz) {
    var nyitoArany = parseFloat(nyitoViz.getAttribute("data-arany"));
    if (mozgasNelkul) {
      nyitoViz.style.setProperty("--szint", vizszint(nyitoArany).toFixed(2));
    } else {
      nyitoViz.classList.add("azonnal");
      nyitoViz.style.setProperty("--szint", "100");
      void nyitoViz.getBoundingClientRect();
      nyitoViz.classList.remove("azonnal");
      window.requestAnimationFrame(function () {
        meroBeallit(nyitoViz, nyitoArany);
      });
    }
  }


  /* 4. Fülek (a megoldásoknál és a vizes kihívásoknál) -------------------- */
  /* Minden fülsor (role="tablist") külön működik: csak a saját fülei
     között vált, és csak a saját paneljeit mutatja vagy rejti el. */

  Array.prototype.forEach.call(document.querySelectorAll('[role="tablist"]'), function (fulsor) {
    var fulek = Array.prototype.slice.call(fulsor.querySelectorAll('[role="tab"]'));

    function fulValt(ujFul, fokuszal) {
      fulek.forEach(function (ful) {
        var aktiv = ful === ujFul;
        ful.setAttribute("aria-selected", String(aktiv));
        ful.tabIndex = aktiv ? 0 : -1;
        document.getElementById(ful.getAttribute("aria-controls")).hidden = !aktiv;
      });
      if (fokuszal) {
        ujFul.focus();
      }
    }

    fulek.forEach(function (ful, index) {
      ful.addEventListener("click", function () {
        fulValt(ful, false);
      });

      // billentyűzettel is váltható: nyilak, Home, End
      ful.addEventListener("keydown", function (esemeny) {
        var uj = null;
        if (esemeny.key === "ArrowRight") {
          uj = fulek[(index + 1) % fulek.length];
        } else if (esemeny.key === "ArrowLeft") {
          uj = fulek[(index - 1 + fulek.length) % fulek.length];
        } else if (esemeny.key === "Home") {
          uj = fulek[0];
        } else if (esemeny.key === "End") {
          uj = fulek[fulek.length - 1];
        }
        if (uj) {
          esemeny.preventDefault();
          fulValt(uj, true);
        }
      });
    });
  });


  /* 5. Vállalások --------------------------------------------------------- */

  var TAROLO_KULCS = "temahet2026-vallalasok";
  var pipak = Array.prototype.slice.call(document.querySelectorAll('input[name="vallalas"]'));
  var vallalasViz = document.querySelector(".vallalas-mero .mero-viz");
  var darabElem = document.getElementById("vallalas-db");
  var osszesElem = document.getElementById("vallalas-ossz");
  var uzenetElem = document.getElementById("vallalas-uzenet");
  var torlesGomb = document.getElementById("vallalas-torles");

  // a böngésző megjegyzi a pipákat (ha engedi) – ha nem, akkor sincs baj
  function betolt() {
    try {
      var mentett = JSON.parse(window.localStorage.getItem(TAROLO_KULCS) || "[]");
      pipak.forEach(function (pipa) {
        pipa.checked = mentett.indexOf(pipa.value) !== -1;
      });
    } catch (hiba) {
      /* nincs mentés – üres listával indulunk */
    }
  }

  function ment() {
    try {
      var bepipalt = pipak.filter(function (pipa) { return pipa.checked; })
        .map(function (pipa) { return pipa.value; });
      window.localStorage.setItem(TAROLO_KULCS, JSON.stringify(bepipalt));
    } catch (hiba) {
      /* nem tudtuk menteni – a pipák így is működnek */
    }
  }

  function frissit() {
    var osszes = pipak.length;
    var darab = pipak.filter(function (pipa) { return pipa.checked; }).length;
    var arany = osszes ? darab / osszes : 0;

    darabElem.textContent = darab;
    osszesElem.textContent = osszes;
    torlesGomb.hidden = darab === 0;
    meroBeallit(vallalasViz, arany);

    if (darab === 0) {
      uzenetElem.textContent = "Pipálj ki egyet, és indul a csepp!";
    } else if (darab === osszes) {
      uzenetElem.textContent = "Tele a csepp! Köszönjük a vállalásaidat.";
    } else if (arany >= 0.5) {
      uzenetElem.textContent = "Már félig tele a csepp, csak így tovább!";
    } else {
      uzenetElem.textContent = "Jó kezdet! Minden pipával telik a csepp.";
    }
  }

  if (pipak.length && vallalasViz) {
    betolt();
    frissit();

    pipak.forEach(function (pipa) {
      pipa.addEventListener("change", function () {
        frissit();
        ment();
      });
    });

    torlesGomb.addEventListener("click", function () {
      pipak.forEach(function (pipa) {
        pipa.checked = false;
      });
      frissit();
      ment();
    });
  }


  /* 6. Visszaszámláló a plakátversenyhez ---------------------------------- */

  var szamlalo = document.getElementById("visszaszamlalo");

  if (szamlalo) {
    var ma = new Date();
    ma.setHours(0, 0, 0, 0);

    // vigyázat: a hónapokat 0-tól számolja a JavaScript (10 = november, 11 = december)
    var hatarido = new Date(2026, 10, 26);
    var temahetKezdete = new Date(2026, 10, 30);
    var temahetVege = new Date(2026, 11, 4);
    var EGY_NAP = 24 * 60 * 60 * 1000;
    var hatraVan = Math.round((hatarido - ma) / EGY_NAP);

    if (hatraVan > 1) {
      szamlalo.textContent = "Még " + hatraVan + " nap van a leadásig (november 26.).";
    } else if (hatraVan === 1) {
      szamlalo.textContent = "Holnap van a leadási határidő!";
    } else if (hatraVan === 0) {
      szamlalo.textContent = "Ma van a leadás utolsó napja!";
    } else if (ma < temahetKezdete) {
      szamlalo.textContent = "A leadás lezárult. A témahét november 30-án kezdődik.";
    } else if (ma <= temahetVege) {
      szamlalo.textContent = "A leadás lezárult, most zajlik a témahét.";
    } else {
      szamlalo.textContent = "A témahét véget ért. Köszönjük a pályaműveket!";
    }
  }
})();
