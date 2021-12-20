let bInventaire = false; //Etat d'affichage de l'écran d'inventaire
let maxLife = 20; //nb maximum de points de vie
let maxForce = 10;
let maxChance = 12;
let maForce = 10; //force du joueur
let maChance = 0;
let life = maxLife; //points de vie actuels
let gold = 30;
let inventory = ["épée","armure de cuir","lanterne"];
let potions = ["endurance","endurance"];
let bijoux = [];
let food = 10;

//Appel de la fonction définie par "Rule" dans le json.
//Exemple si function maFonction(arg1, arg2);
// fnCall("maFonction", "arg1", "arg2");
function fnCall(fn, ...args) {
    let func = (typeof fn =="string") ? window[fn] : fn;
    if (typeof func == "function") func(...args);
    else throw new Error(`${fn} is Not a function!`);
}

//Initialise les statistiques initiales du joueur(système d6)
function initStats() {
    maxForce = 6 + rollDice6();
    maxLife = 12 + rollDice6() + rollDice6();
    maxChance = rollDice6() + rollDice6();
    maForce = maxForce;
    life = maxLife;
    maChance = maxChance
}

//Tentez votre chance au prix d'un point de chance
function tenterChance() {
    if ( maChance <= 0 ) return false;
    let d = rollDice6() + rollDice6();
    console.log("jet de chance " + d + ", maChance " + maChance);
    return ( d <= --maChance );
}

//Cache ou révèle les éléments nommés
function hideElementsById(hidden, ...args) {
    args.forEach(element => {
        document.getElementById(element).hidden = hidden;
    });
}

//Affiche l'écran inventaire
function ecranInventaire() {
    bInventaire = !bInventaire;
    if( bInventaire ) {
        majInventaire();
        majDecor("inventaire");
        choixHidden(true);
        document.getElementById("backpack").hidden = false;
        document.getElementById("backpackImg").src = "./images/close.png";
        document.getElementById("backpackImg").alt = "Fermer l'inventaire";
        hideElementsById(true, "gandalf", "life", "container");
        hideElementsById(false, "inventaire", "stats", "cadre", "statsLarge");
    } else {
        console.log( "Decor =" + scene[sceneEnCours].Decor );
        majDecor(scene[sceneEnCours].Decor);
        choixHidden(false);
        document.getElementById("backpackImg").src = "./images/backpack.png";
        document.getElementById("backpackImg").alt = "Inventaire";
        hideElementsById(false, "gandalf", "life", "container");
        hideElementsById(true, "inventaire");
        //alert("cache l'inventaire");
    }
}

function majInventaire() {
    let s = `FORCE<em>Total de départ ${maxForce}</em><b>${maForce}</b>`;
    document.getElementById("force2").innerHTML = s;
    document.getElementById("force3").innerHTML = s;
    s = `ENDURANCE<em>Total de départ ${maxLife}</em><b>${life}</b>`;
    document.getElementById("endurance2").innerHTML = s;
    document.getElementById("endurance3").innerHTML = s;
    s = `CHANCE<em>Total de départ ${maxChance}</em><b>${maChance}</b>`;
    document.getElementById("chance2").innerHTML = s;
    document.getElementById("chance3").innerHTML = s;
    s = `OR<b>${gold}</b>`;
    document.getElementById("or").innerHTML = s;
    s = `PROVISIONS<b>${food}</b>`;
    document.getElementById("provisions").innerHTML = s;
    s = "EQUIPEMENT";
    inventory.forEach(item => s += `<span>${item}</span>`);
    document.getElementById("equipement").innerHTML = s;
    s = "BIJOUX<em></em>";
    bijoux.forEach(item => s += `<i>${item}</i> `);
    document.getElementById("bijoux").innerHTML = s;
    s = "POTIONS";
    potions.forEach(item => s += `<a onclick="drinkPotion('endurance')">${item}</a>`);
    document.getElementById("potions").innerHTML = s;
}
