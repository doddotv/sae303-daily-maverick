// Mes données : ce que dépense une personne par semaine, en pence
// Je les ai recopiées depuis mon tableur (feuille Donnees_nettoyees)
let categories = ["Milk & dairy", "Cheese", "Fresh meat", "Other meat products", "Fish", "Eggs", "Fats & oils",
    "Potatoes", "Vegetables", "Fruit", "Bread", "Cakes & biscuits", "Soft drinks", "Confectionery"];

let depenses = {
    "2015/16": [174.7, 79.8, 136.4, 458.3, 131.8, 28.3, 52.1, 123.4, 234.8, 236.9, 111.2, 145.4, 91.6, 113.9],
    "2019/20": [184.0, 92.1, 128.7, 509.9, 146.5, 32.4, 58.1, 128.4, 264.4, 261.3, 126.0, 166.1, 110.6, 131.9],
    "2021/22": [182.1, 96.7, 119.8, 475.7, 143.9, 30.5, 54.6, 119.5, 258.7, 265.2, 113.0, 178.5, 118.9, 133.4],
    "2023/24": [212.0, 110.7, 135.6, 556.8, 150.7, 42.8, 69.9, 147.1, 294.9, 283.1, 135.3, 202.3, 140.6, 143.3],
    "2024/25": [218.1, 115.7, 153.7, 573.9, 153.8, 52.8, 74.2, 154.7, 310.6, 311.8, 135.8, 208.2, 135.5, 154.7]
};

// Les variables que je réutilise dans plusieurs fonctions
let graphique;          // mon graphique Chart.js
let annee = "2021/22";  // l'année choisie dans le menu (2021/22 au départ)
let enPourcent = true;  // true = le graphique est en %, false = en pence


// Mon graphique Chart.js (niveaux 1 et 2)

// Calcule de combien un aliment a augmenté en % entre l'année choisie et 2024/25
// i c'est le numéro de l'aliment (0 = Milk & dairy, 5 = Eggs...)
// Même formule que dans mon tableur, et Math.round arrondit le résultat
function evolution(i) {
    return Math.round((depenses["2024/25"][i] / depenses[annee][i] - 1) * 100);
}

// Appelée au chargement et à chaque fois qu'on change l'année ou l'unité :
// elle met les barres en % ou en pence, change le titre de l'axe puis redessine le graphique
function mettreAJour() {
    if (enPourcent) {
        // je calcule le % de chaque aliment avec ma fonction evolution() et je le range dans une liste
        let evolutions = [];
        for (let i = 0; i < categories.length; i++) {
            evolutions.push(evolution(i));
        }

        // je range une copie de la liste du plus grand au plus petit (slice fait la copie, sort trie)
        // comme ça tri[3] c'est la 4e plus grosse hausse (on compte à partir de 0)
        let tri = evolutions.slice().sort(function (a, b) { return b - a; });

        // les 4 plus grosses hausses en rouge, les autres en gris, pour qu'on les voie tout de suite
        let couleurs = [];
        for (let i = 0; i < evolutions.length; i++) {
            if (evolutions[i] >= tri[3]) {
                couleurs.push("#C8102E");
            } else {
                couleurs.push("#9E9E9E");
            }
        }

        // J'ai demandé de l'aide à l'IA pour ces 2 lignes. Je lui ai demandé :
        // "Avec Chart.js, comment je change les données et le titre de l'axe du bas
        // quand je passe mon graphique en pourcentage ?"
        // La 1re ligne remplace les barres par les % (avec mes couleurs rouge et gris),
        // la 2e change le titre de l'axe du bas pour dire qu'on est en %.
        graphique.data.datasets = [{ label: "% change from " + annee + " to 2024/25", data: evolutions, backgroundColor: couleurs }];
        graphique.options.scales.x.title.text = "% change in spending from " + annee + " to 2024/25";
    } else {
        // en pence : 2 barres par aliment, l'année choisie en gris et 2024/25 en rouge
        graphique.data.datasets = [
            { label: annee, data: depenses[annee], backgroundColor: "#9E9E9E" },
            { label: "2024/25", data: depenses["2024/25"], backgroundColor: "#C8102E" }
        ];
        graphique.options.scales.x.title.text = "Pence per person per week (100p = £1)";
    }

    // update() redessine le graphique : les barres glissent de l'ancienne valeur à la nouvelle
    graphique.update();
}

// Chart.js appelle cette fonction pour chaque chiffre de l'axe du bas (0, 20, 40...)
// J'ajoute % ou p derrière pour qu'on comprenne tout de suite l'unité
function uniteAxe(valeur) {
    if (enPourcent) {
        return valeur + "%";
    }
    return valeur + "p";
}

// Niveau 1 : le texte de l'infobulle quand on passe la souris sur une barre
// contexte.raw c'est la valeur de la barre, contexte.dataset.label le nom de la série (ex : 2024/25)
function texteInfobulle(contexte) {
    if (enPourcent) {
        return contexte.raw + "%";
    }
    return contexte.dataset.label + ": " + contexte.raw + "p";
}

// Niveau 1 : quand on clique sur une barre, j'écris le détail sous le graphique
// (le clic sur la légende pour cacher une série est déjà fait par Chart.js)
// Chart.js m'envoie le clic et la liste des barres touchées (vide si on clique à côté)
function clicBarre(clic, barres) {
    if (barres.length > 0) {
        let i = barres[0].index;  // le numéro de la barre cliquée
        let signe = "";
        if (evolution(i) > 0) {
            signe = "+";
        }
        document.querySelector("#info").textContent = categories[i] + ": " + depenses[annee][i] + "p in " + annee +
            ", " + depenses["2024/25"][i] + "p in 2024/25 (" + signe + evolution(i) + "%).";
    }
}

// Niveau 2 : quand on choisit une autre année dans le menu
// je récupère la valeur choisie, je la garde dans annee, puis je redessine le graphique
function changerAnnee() {
    annee = document.querySelector("#year").value;
    mettreAJour();
}

// Niveau 2 : le bouton passe des % aux pence, et inversement
// this c'est le bouton cliqué, je change son texte pour le prochain clic
function changerUnite() {
    enPourcent = !enPourcent;  // le ! inverse : true devient false et false devient true
    if (enPourcent) {
        this.textContent = "Show pence per week";
    } else {
        this.textContent = "Show % change";
    }
    mettreAJour();
}


// Tout démarre ici quand la page est chargée
function init() {
    // Niveau 1 : je crée le graphique en barres horizontales
    // il est vide au départ, c'est mettreAJour() qui ajoute les données juste après
    graphique = new Chart(document.querySelector("#myChart"), {
        type: "bar",
        data: { labels: categories, datasets: [] },
        options: {
            indexAxis: "y",                 // barres horizontales pour bien lire les noms
            maintainAspectRatio: false,
            animation: { duration: 1200 },  // les barres glissent en 1,2 seconde
            onClick: clicBarre,             // ma fonction quand on clique sur une barre
            plugins: { tooltip: { callbacks: { label: texteInfobulle } } },  // mon texte d'infobulle
            scales: {
                x: {
                    beginAtZero: true,      // l'axe commence à 0 pour ne pas exagérer les écarts
                    title: { display: true, text: "", color: "#111111", font: { size: 14, weight: "bold" } },
                    ticks: { callback: uniteAxe }
                },
                y: { title: { display: true, text: "Food group", color: "#111111", font: { size: 14, weight: "bold" } } }
            }
        }
    });
    mettreAJour();

    // Niveau 2 : je relie le menu et le bouton à leurs fonctions
    // "change" se déclenche quand on choisit une option, "click" quand on clique
    document.querySelector("#year").addEventListener("change", changerAnnee);
    document.querySelector("#unit").addEventListener("click", changerUnite);
}

// Quand toute la page est chargée, je lance init()
window.addEventListener("load", init);
