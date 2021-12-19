let maxLife = 20; //nb maximum de points de vie
let maxForce = 10;
let maxChance = 12;
let maForce = 10; //force du joueur
let maChance = 0;
let life = maxLife; //points de vie actuels
let gold = 50;
let inventory = ["épée"];
let potion = ["soin"];
let bijoux = [];
let food = 5;

//Appel de la fonction définie par "Rule" dans le json.
//Exemple si function maFonction(arg1, arg2);
// fnCall("maFonction", "arg1", "arg2");
function fnCall(fn, ...args) {
    let func = (typeof fn =="string") ? window[fn] : fn;
    if (typeof func == "function") func(...args);
    else throw new Error(`${fn} is Not a function!`);
}

//Initialise les statistiques initiales du joueur
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