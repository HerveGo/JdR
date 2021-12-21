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

// Get the modal
let modal = document.getElementById("myModal");
let modalBody = document.getElementById("myModalBody");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

//Appel de la fonction définie par "Rule" dans le json.
//Exemple si function maFonction(arg1, arg2);
// fnCall("maFonction", "arg1", "arg2");
function fnCall(fn, ...args) {
    let func = (typeof fn =="string") ? window[fn] : fn;
    if (typeof func == "function") func(...args);
    else throw new Error(`${fn} is Not a function!`);
}

//---------------------------- RULES ---------------------------//
//Attention, le(s) paramètre(s) seront toujours de type string
function changeOr(coins) {
    console.log("Pièces d'or " + coins);
    gold += parseInt(coins);
    if(  gold < 0 ) gold = 0;
}

function changeRation(rations) {
    food += parseInt(rations);
    if( food < 0 ) food = 0;
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

//Rempli l'inventaire avec les informations du joueur
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
    s = `RATIONS<b>${food}</b>`;
    document.getElementById("provisions").innerHTML = s;
    s = "EQUIPEMENT";
    inventory.forEach(item => s += `<span>${item}</span>`);
    document.getElementById("equipement").innerHTML = s;
    s = "BIJOUX<em></em>";
    bijoux.forEach(item => s += `<i>${item}</i> `);
    document.getElementById("bijoux").innerHTML = s;
    s = "POTIONS";
    potions.forEach(item => s += `<a onclick="drinkPotion('${item}')">${item}</a>`);
    document.getElementById("potions").innerHTML = s;
}

//Boire une potion.
function drinkPotion(typePotion){
    switch( typePotion ) {
        case "endurance":
            if( life == maxLife ) {
                modalBody.innerHTML = "<p>Vos points de vie sont au maximum !</p><p>Il est inutile de boire cette potion pour l'instant.</p>";
                modal.style.display = "block";
            } else {
                life = maxLife;
                displayLife(0);
                potions = removeItemOnce(potions, typePotion);
                modalBody.innerHTML = "<p>La potion restaure votre endurance à son maximum.</p><p>Vos blessures guéries, vous reprenez l'aventure avec confiance.</p>";
                modal.style.display = "block";
            }
            break;
        case "force":
            if( maForce == maxForce ) {
                modalBody.innerHTML = "<p>Votre force est à son maximum!</p><p>Il est inutile de boire cette potion pour l'instant.</p>";
                modal.style.display = "block";
            } else {
                modalBody.innerHTML ="<p>La potion restaure votre force à son maximum.</p><p>Vos combats futurs s'annoncent sous de meilleurs auspices.";
                maForce = maxForce;
                potions = removeItemOnce(potions, typePotion);
                modal.style.display = "block";
            }
        case "chance":
            modalBody.innerHTML = "<p>La potion augmente votre chance maximale de 1.</p><p>Tous vos points de chance sont restaurés.</p>";
            maxChance++;
            maChance = maxChance;
            potions = removeItemOnce(potions, typePotion);
            modal.style.display = "block";
    }
    majInventaire();
}

/**
 * Enlève un élément d'un tableau
 * @param Array arr un tableau
 * @param {*} value la valeur à supprimer
 * @returns Arr without the value (if found)
 */
function removeItemOnce(arr, value) {
    let index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }