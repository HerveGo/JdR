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

let decorActuel = "foret"; //mémorise le décor au cas où

// Get the modal
let modal = document.getElementsByClassName("modal");
let modalBody = document.getElementById("myModalBody");
let modalHeader = document.getElementById("myModalHeader");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close");

// When the user clicks on <span> (x), close the modal
for( let i = 0; i < span.length; i++) {
    span[i].addEventListener( 'click', () => closeModal(i) );
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = (event) => {
    Array.from(modal).forEach((item,index) => { if(event.target == item) closeModal(index) } );
}

function closeModal(i) {
    modal[i].style.display = "none";
}

function showModal(i) {
    modal[i].style.display = "block";
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
 * @param string[] vers scène en cas de succès/échec
 */
function tentezVotreChance(vers) {
    if( tenterChance() ) {
        return vers[0];
    } else {
        return vers[1];
    }
}
function testezVotreForce(vers) {
    let dice = rollDice6() + rollDice6();
    if( dice <= maForce ) {
        return vers[0];
    } else {
        return vers[1];
    }
}
function resetPlayer() {
    inventory = ["épée","armure de cuir","lanterne"];
    mesPotions = [];
    mesBijoux = [];
    gold = 30;
    maFood = 10;
    maLife = maxLife;
    maForce = maxForce;
    maChance = maxChance;
    audioDeath.pause();
    window.location.reload();
}

function changeOr(coins) {
    gold += parseInt(coins);
    if(  gold < 0 ) gold = 0;
}

function changeForce(strength) {
    maForce += parseInt( strength );
    if( maForce > maxForce) maForce = maxForce;
    if( maForce < 1 ) maForce = 1;
}
function changeMaxForce(strength) {
    maxForce += parseInt( strength );
    maForce += parseInt( strength );
}

function changeChance(chance) {
    maChance += parseInt(chance);
    if( maChance > maxChance) maChance = maxChance;
    if( maChance < 0 ) maChance = 0;
}

function changeLife(life) {
    let oldLife = maLife;
    maLife += parseInt(life);
    if( maLife > maxLife ) maLife = maxLife;
    if( maLife <= 0 ) maLife = 0;
    displayLife(oldLife);
}

function changeFood(rations) {
    maFood += parseInt(rations);
    if( maFood < 0 ) maFood = 0;
}

function eatFood() {
    if(  maFood > 0) {
        maFood--;
        maLife += 4;
        if( maLife > maxLife ) maLife = maxLife;
    }
}

function gainObjects(items) {
    inventory.push(items);
}
/**
 * Remplace un objet dans l'inventaire par un autre.
 * @param {string[]} items tableau contenant en 0 l'objet à remplacer, et en 1 le nouvel objet.
 */
function replaceObject(items) {
    let index = inventory.indexOf(items[0]);
    if( index > -1 ) {
        inventory[index] = items[1];
    }
}
function looseObjects(items) {
    items.forEach( item => {
        let index = inventory.indexOf(item);
        if( index > -1 ) {
            inventory.splice(index, 1);
        }
    })
}
//Donne num objets au hasard, mais pas les trois premiers.
/**
 * Donne num objets de l'inventaire au hasard (à l'exclusion des 3 premiers)
 * @param {string[]} num le nombre d'objets à donner
 */
function giveObjects(num) {
    let n = parseInt(num[0]); //rules are always arrays
    let hasard = [...inventory.slice(3)]; //true copy on one level (sufficient)
    let lost = [];
    removeItemOnce(hasard,"manche du marteau"); //évite de donner le marteau
    if( n > hasard.length ) n = hasard.length //pour éviter une boucle infinie
    while ( n > 0 ) {
        rnd = Math.floor(Math.random()*hasard.length);
        if( hasard[rnd] != "" ) {
            n--;
            lost.push(hasard[rnd]);
            removeItemOnce(inventory, hasard[rnd]);
            hasard[rnd] = "";
        }
    }
    textLiaison = `Vous perdez ${lost.join(",")}.` + textLiaison;
}
function gainPotions(potions) {
    mesPotions = mesPotions.concat( potions );
}

function gainJewels(jewels) {
    mesBijoux = mesBijoux.concat( jewels );
}
function looseJewels(jewels) {
    jewels.forEach(item => {
        let index = mesBijoux.indexOf(item);
        if( index > -1 ) {
            mesBijoux.splice(index, 1);
        }
    })
}
function briserCoffre(vers) {
    let dice = rollDice6() + rollDice6();
    console.log("test force " + dice);
    if( dice <= maForce ) {
        return parseInt(vers[0]); //gagne
    } else {
        changeLife("-1");
        return (life = 0) ? 0 : parseInt(vers[1]); //perd
    }
}
/**
 * Perte d'un nombre de points de vie égal à n d6
 * @param ["number"] numDice le nombre de d6 de vie perdus
 */
function looseLifeD6(numDice) {
    let sumDice = 0;
    for( let i = 0; i < parseInt(numDice[0]); i++ ) {
        sumDice += rollDice6();
    }
    console.log(`Lance ${numDice}d6 : loose life ${-sumDice}`);
    changeLife(-sumDice);
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
        if( !document.getElementsByClassName("top")[0] ) decorActuel = document.getElementsByClassName("top")[0];
        majDecor("inventaire");
        //choixHidden(true);
        // document.getElementById("backpack").hidden = false;
        document.getElementById("backpackImg").src = "./images/close.png";
        document.getElementById("backpackImg").alt = "Fermer l'inventaire";
        hideElementsById(true, "gandalf", "life", "container", "choix", "histoire");
        hideElementsById(false, "inventaire", "stats", "cadre", "statsLarge", "backpack");
    } else {
        let decor = scene[sceneEnCours].Decor;
        if( !decor ) decor = decorActuel;
        majDecor(decor);
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
    s = `<a onclick="eat()">RATIONS</a><a onclick="eat()"><b>${maFood}</b></a>`;
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

/**
 * Manger une ration (s'il en reste) fait regagner 4 points de vie.
 */
function eat() {
    modalHeader.innerHTML = '<img alt="" src="images/jambon.png">Manger une ration';
    if( maLife == maxLife ) {
        modalBody.innerHTML = "<p>Vos points de vie sont au maximum&nbsp;!</p><p>Il est inutile de manger une ration pour l'instant.</p>";
        showModal(1);
    } else if ( maFood == 0 ) {
        modalBody.innerHTML = "<p>Vous n'avez plus rien à manger&nbsp;!</p><p>Il ne vous reste plus qu'à écouter votre ventre gargouiller.</p>";
        showModal(1);
    } else {
        maFood--;
        changeLife("4");
        modalBody.innerHTML = "<p>Vous prenez un moment pour manger une de vos rations</p><p>Ce repas sommaire vous fait regagner 4 points de vie.</p>";
        showModal(1);
    }
}

/**
 * Boire une potion (si autorisé)
 * @param {"vigueur" | "fiole de vie" | "puissance" | "fortune" } typePotion 
 */
function drinkPotion(typePotion){
    modalHeader.innerHTML = '<img alt="" src="images/potion.png">Boire une potion';
    switch( typePotion ) {
        case "vigueur":
            if( maLife == maxLife ) {
                modalBody.innerHTML = "<p>Vos points de vie sont au maximum&nbsp;!</p><p>Il est inutile de boire cette potion pour l'instant.</p>";
                showModal(1);
            } else {
                maLife = maxLife;
                displayLife(0);
                mesPotions = removeItemOnce(mesPotions, typePotion);
                modalBody.innerHTML = "<p>La potion restaure votre endurance à son maximum.</p><p>Vos blessures guéries, vous reprenez l'aventure avec confiance.</p>";
                showModal(1);
            }
            break;
        case "fiole de vie":
            if( maLife == maxLife ) {
                modalBody.innerHTML = "<p>Vos points de vie sont au maximum&nbsp;!</p><p>Il est inutile de boire cette potion pour l'instant.</p>";
                showModal(1);
            } else {
                let oldLife = maLife;
                changeLife("4");
                displayLife(oldLife);
                mesPotions = removeItemOnce(mesPotions, typePotion);
                modalBody.innerHTML = "<p>La fiole vous fait regagner 4 points de vie.</p><p>Vos blessures guéries, vous reprenez l'aventure avec confiance.</p>";
                showModal(1);
            }
            break;
        case "puissance":
            if( maForce == maxForce ) {
                modalBody.innerHTML = "<p>Votre force est à son maximum&nbsp;!</p><p>Il est inutile de boire cette potion pour l'instant.</p>";
                modal.style.display = "block";
            } else {
                modalBody.innerHTML ="<p>La potion restaure votre force à son maximum.</p><p>Vos combats futurs s'annoncent sous de meilleurs auspices.";
                maForce = maxForce;
                mesPotions = removeItemOnce(mesPotions, typePotion);
                showModal(1);
            }
            break;
        case "fortune":
            modalBody.innerHTML = "<p>La potion augmente votre chance maximale de 1.</p><p>Tous vos points de chance sont restaurés.</p>";
            maxChance++;
            maChance = maxChance;
            mesPotions = removeItemOnce(mesPotions, typePotion);
            showModal(1);
            break;
        case "potion rouge":
            modalBody.innerHTML = "<p>La potion vous remplit d'une énergie incroyable&nbsp;!</p><p>Votre force maximale augmente de 2, et tous vos points de force sont restaurés.</p>"
            maxForce += 2;
            maForce = maxForce;
            mesPotions = removeItemOnce(mesPotions, typePotion);
            showModal(1);
            break;
        default:
            throw new Error("Erreur, type de potion inconnue.");
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