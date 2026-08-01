// ======= 1. DONNÉES DU MENU =======
const plats = [

 {
    id: "b1",
    nom: "Le Classique",
    desc: "Bœuf grillé, cheddar, salade, oignons, sauce maison",
    prix: 2500,
    category: "burgers",
    image: "images/Classique.jpeg"
  },

  {
    id: "b2",
    nom: "Poulet Burger",
    desc: "Poulet mariné, oignons confits, citron, moutarde",
    prix: 2800,
    category: "burgers",
    image: "images/poulet-burger.jpeg"
  },

  {
    id: "b3",
    nom: "Double Cheese",
    desc: "Double steak, double cheddar, pickles, sauce burger",
    prix: 3200,
    category: "burgers",
    image: "images/double-cheese.jpeg"
  },

  {
    id: "p1",
    nom: "Margherita",
    desc: "Sauce tomate, mozzarella, basilic",
    prix: 4500,
    category: "pizzas",
    image: "images/margherita.jpeg"
  },

  {
    id: "p2",
    nom: "Pepperoni Piquante",
    desc: "Pepperoni, piment doux, mozzarella fondue",
    prix: 5000,
    category: "pizzas",
    image: "images/pepperoni.jpeg"
  },

  {
    id: "p3",
    nom: "4 Fromages",
    desc: "Mozzarella, gorgonzola, chèvre, parmesan",
    prix: 5500,
    category: "pizzas",
    image: "images/4 fromages.jpeg"
  },

  {
    id: "d1",
    nom: "Bissap Frais",
    desc: "Hibiscus infusé maison",
    prix: 800,
    category: "boissons",
    image: "images/bissap frais.jpeg"
  },

  {
    id: "d2",
    nom: "Jus de Bouye",
    desc: "Pain de singe, lait, sucre",
    prix: 1000,
    category: "boissons",
    image: "images/bouye.jpeg"
  },

  {
    id: "d3",
    nom: "Soda 33cl",
    desc: "Coca, Fanta ou Sprite",
    prix: 750,
    category: "boissons",
    image: "images/Soda.jpeg"
  }

];
const NUMERO_WHATSAPP = "221772746217"; // remplace par le vrai numéro du resto (indicatif inclus, sans le +)
const NOM_TABLE = "04"; // à remplacer dynamiquement si le QR code encode un numéro de table

document.getElementById("tableChip").textContent = "TABLE " + NOM_TABLE;

// ======= 2. AFFICHAGE DES PLATS =======
const labels = { burgers:"Burgers", pizzas:"Pizzas", boissons:"Boissons" };
const menuSection = document.getElementById("menuSection");
const panier = {}; // { id: quantite }

function formatPrix(n){
  return n.toLocaleString("fr-FR") + " F CFA";
}

function construireMenu(){
  menuSection.innerHTML = "";
  const categories = ["burgers","pizzas","boissons"];

  categories.forEach(cat => {
    const platsCat = plats.filter(p => p.category === cat);

    const heading = document.createElement("div");
    heading.className = "cat-heading";
    heading.dataset.category = cat;
    heading.innerHTML = `${labels[cat]} <span class="cat-count">${platsCat.length}</span>`;
    menuSection.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "grid";
    grid.dataset.category = cat;

    platsCat.forEach(plat => {
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.category = plat.category;
      card.innerHTML = `
    <div class="card-photo">
        <img src="${plat.image}" alt="${plat.nom}">
    </div>

    <h3>${plat.nom}</h3>

    <div class="desc">${plat.desc}</div>

    <div class="card-footer">
        <span class="price-tag">${formatPrix(plat.prix)}</span>

        <div class="stepper">
            <button type="button" data-action="moins" data-id="${plat.id}">−</button>
            <span class="qty" id="qty-${plat.id}">0</span>
            <button type="button" data-action="plus" data-id="${plat.id}">+</button>
        </div>
    </div>
`;
      grid.appendChild(card);
    });

    menuSection.appendChild(grid);
  });
}

construireMenu();

// ======= 3. FILTRAGE PAR CATÉGORIE =======
const filterBar = document.getElementById("filterBar");

filterBar.addEventListener("click", (e) => {
  const btn = e.target.closest(".pill");
  if(!btn) return;

  filterBar.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
  btn.classList.add("active");

  const filtre = btn.dataset.filter;

  document.querySelectorAll(".cat-heading, .grid").forEach(el => {
    const visible = (filtre === "tous") || (el.dataset.category === filtre);
    el.classList.toggle("hidden", !visible);
  });
});

// ======= 4. PANIER + BOUTON WHATSAPP =======
menuSection.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if(!btn) return;

  const id = btn.dataset.id;
  const actuel = panier[id] || 0;

  if(btn.dataset.action === "plus"){
    panier[id] = actuel + 1;
  } else {
    panier[id] = Math.max(0, actuel - 1);
  }

  document.getElementById("qty-" + id).textContent = panier[id];
  mettreAJourCommande();
});

function mettreAJourCommande(){
  let totalArticles = 0;
  let totalPrix = 0;
  const lignes = [];

  plats.forEach(plat => {
    const qte = panier[plat.id] || 0;
    if(qte > 0){
      totalArticles += qte;
      totalPrix += qte * plat.prix;
      lignes.push(`- ${qte} x ${plat.nom} (${formatPrix(plat.prix * qte)})`);
    }
  });

  document.getElementById("orderSummary").innerHTML =
    `${totalArticles} article${totalArticles > 1 ? "s" : ""}<br><strong>${formatPrix(totalPrix)}</strong>`;

  // Construction du message WhatsApp pré-rempli
  let message = `Bonjour Teranga Snack 👋\nJe voudrais commander (Table ${NOM_TABLE}) :\n`;
  message += lignes.length ? lignes.join("\n") : "- (à préciser)";
  message += `\n\nTotal : ${formatPrix(totalPrix)}`;

  const lien = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`;
  document.getElementById("waBtn").setAttribute("href", lien);
}

mettreAJourCommande(); // initialise le bouton avec un message par défaut