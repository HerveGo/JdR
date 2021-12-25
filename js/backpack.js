let bInventaire = false; //Etat d'affichage de l'écran d'inventaire
let maxLife = 20; //nb maximum de points de vie
let maxForce = 10;
let maxChance = 12;
let maForce = 10; //force du joueur
let maChance = 0;
let maLife = maxLife; //points de vie actuels
let gold = 30;
let inventory = ["épée","armure de cuir","lanterne"];
let mesPotions = [];
let mesPotionsInitiales = [];
let mesBijoux = [];
let maFood = 10;

// Get the modal
let modal = document.getElementById("myModal");
let modalBody = document.getElementById("myModalBody");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    closeModal();
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}

function closeModal() {
    modal.style.display = "none";
}

//Appel de la fonction définie par "Rule" dans le json.
//Exemple si function maFonction(arg1, arg2);
// fnCall("maFonction", "arg1", "arg2");
function fnCall(fn, ...args) {
    let func = (typeof fn =="string") ? window[fn] : fn;
    if (typeof func == "function") return func(...args);
    else throw new Error(`${fn} is Not a function!`);
}

//--------------------------------- RULES -----------------------------------//
//Attention, le(s) paramètre(s) reçus du Json seront toujours de type string //

/**
 * Change la scène en cours selon le résultat d'un tirage de chance.
 * @param {string} versGagne scène en cas de succès
 * @param {string} versLoose scène en cas de défaite
 */
function tentezVotreChance(vers) {
    if( tenterChance() ) {
        return vers[0];
    } else {
        return vers[1];
    }
}
function resetPlayer() {
    inventory = ["épée","armure de cuir","lanterne"];
    mesPotions = Array.from(mesPotionsInitiales);
    mesBijoux = [];
    gold = 30;
    maFood = 10;
    maLife = maxLife;
    maForce = maxForce;
    maChance = maxChance;
}

function changeOr(coins) {
    gold += parseInt(coins);
    if(  gold < 0 ) gold = 0;
}

function changeForce(strength) {
    maForce += parseInt(strength);
    if( maForce > maxForce) maForce = maxForce;
    if( maForce < 1 ) maForce = 1;
}

function changeChance(chance) {
    maChance += parseInt(chance);
    if( maChance > maxChance) maChance = maxChance;
    if( maChance < 1 ) maChance = 1;
}

function changeRation(rations) {
    maFood += parseInt(rations);
    if( maFood < 0 ) maFood = 0;
}

function eatFood() {
    if(  maFood > 0) {
        maFood--;
        maLife += 2;
        if( maLife > maxLife ) maLife = maxLife;
    }
}

function gainObjects(items) {
    arr = items;
    arr.forEach( item => inventory.push(item) );
}
function looseObjects(items) {
    arr = items;
    arr.forEach(item => {
        if( index > -1 ) {
            inventory.splice(index, 1);
        }
    })
}
function gainPotions(potions) {
    arr = potions;
    arr.forEach( p => mesPotions.push(p) );
}

function gainJewels(jewels) {
    arr = jewels;
    arr.forEach(item => mesBijoux.push(item) );
}
function looseJewels(jewels) {
    arr = jewels;
    arr.forEach(item => {
        if( index > -1 ) {
            mesBijoux.splice(index, 1);
        }
    })
}

/**
 * Initialise les statistiques initiales du joueur(système d6)
 */
function initStats() {
    maxForce = 6 + rollDice6();
    maxLife = 12 + rollDice6() + rollDice6();
    maxChance = rollDice6() + rollDice6();
    maForce = maxForce;
    maLife = maxLife;
    maChance = maxChance
}

/**
 * Teste sa chance, au prix d'un point de chance.
 * Ne pas confondre avec tentezVotreChance() dans les Rules !
 * @returns true si chanceux, false si malchanceux
 */
function tenterChance() {
    if ( maChance <= 0 ) return false;
    let d = rollDice6() + rollDice6();
    return ( d <= --maChance );
}

//Cache ou révèle les éléments nommés
function hideElementsById(hidden, ...args) {
    args.forEach(element => {
        document.getElementById(element).hidden = hidden;
    });
}

//Affiche ou masque l'écran inventaire
function ecranInventaire() {
    bInventaire = !bInventaire;
    if( bInventaire ) {
        majInventaire();
        majDecor("inventaire");
        //choixHidden(true);
        // document.getElementById("backpack").hidden = false;
        document.getElementById("backpackImg").src = "./images/close.png";
        document.getElementById("backpackImg").alt = "Fermer l'inventaire";
        hideElementsById(true, "gandalf", "life", "container", "choix", "histoire");
        hideElementsById(false, "inventaire", "stats", "cadre", "statsLarge", "backpack");
    } else {
        majDecor(scene[sceneEnCours].Decor);
        //choixHidden(false);
        document.getElementById("backpackImg").src = "./images/backpack.png";
        document.getElementById("backpackImg").alt = "Inventaire";
        hideElementsById(false, "gandalf", "life", "container", "choix", "histoire");
        hideElementsById(true, "inventaire");
        //alert("cache l'inventaire");
    }
}

//Rempli l'inventaire avec les informations du joueur
function majInventaire() {
    let s = `FORCE<em>Total de départ ${maxForce}</em><b>${maForce}</b>`;
    document.getElementById("force2").innerHTML = s;
    document.getElementById("force3").innerHTML = s;
    s = `ENDURANCE<em>Total de départ ${maxLife}</em><b>${maLife}</b>`;
    document.getElementById("endurance2").innerHTML = s;
    document.getElementById("endurance3").innerHTML = s;
    s = `CHANCE<em>Total de départ ${maxChance}</em><b>${maChance}</b>`;
    document.getElementById("chance2").innerHTML = s;
    document.getElementById("chance3").innerHTML = s;
    s = `OR<b>${gold}</b>`;
    document.getElementById("or").innerHTML = s;
    s = `RATIONS<b>${maFood}</b>`;
    document.getElementById("provisions").innerHTML = s;
    s = "EQUIPEMENT";
    inventory.forEach(item => s += `<span>${item}</span>`);
    document.getElementById("equipement").innerHTML = s;
    s = "BIJOUX<em></em>";
    mesBijoux.forEach(item => s += `<i>${item}</i> `);
    document.getElementById("bijoux").innerHTML = s;
    s = "POTIONS";
    mesPotions.forEach(item => s += `<a onclick="drinkPotion('${item}')">${item}</a>`);
    document.getElementById("potions").innerHTML = s;
}

//Boire une potion.
function drinkPotion(typePotion){
    switch( typePotion ) {
        case "vigueur":
            if( maLife == maxLife ) {
                modalBody.innerHTML = "<p>Vos points de vie sont au maximum !</p><p>Il est inutile de boire cette potion pour l'instant.</p>";
                modal.style.display = "block";
            } else {
                maLife = maxLife;
                displayLife(0);
                mesPotions = removeItemOnce(mesPotions, typePotion);
                modalBody.innerHTML = "<p>La potion restaure votre endurance à son maximum.</p><p>Vos blessures guéries, vous reprenez l'aventure avec confiance.</p>";
                modal.style.display = "block";
            }
            break;
        case "puissance":
            if( maForce == maxForce ) {
                modalBody.innerHTML = "<p>Votre force est à son maximum!</p><p>Il est inutile de boire cette potion pour l'instant.</p>";
                modal.style.display = "block";
            } else {
                modalBody.innerHTML ="<p>La potion restaure votre force à son maximum.</p><p>Vos combats futurs s'annoncent sous de meilleurs auspices.";
                maForce = maxForce;
                mesPotions = removeItemOnce(mesPotions, typePotion);
                modal.style.display = "block";
            }
            break;
        case "fortune":
            modalBody.innerHTML = "<p>La potion augmente votre chance maximale de 1.</p><p>Tous vos points de chance sont restaurés.</p>";
            maxChance++;
            maChance = maxChance;
            mesPotions = removeItemOnce(mesPotions, typePotion);
            modal.style.display = "block";
            break;
        case "potion rouge":
            modalBody.innerHTML = "<p>La potion vous remplit d'une énergie incroyable !</p><p>Votre force maximale augmente de 2, et tous vos points de force sont restaurés.</p>"
            maxForce += 2;
            maForce = maxForce;
            mesPotions = removeItemOnce(mesPotions, typePotion);
            modal.style.display = "block";
            break;
        default:
            throw new Error("Erreur, type de potion inconnue");
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