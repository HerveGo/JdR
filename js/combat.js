let opponent = 0; //adversaire en cours
let nbOpponents = 0; //nb d'adversaires
let saLife = []; //points de vie des adversaires
let saForce = []; //force de chaque adversaire
let sceneApresCombat = 0; //scène à afficher après le combat
let sceneFuite = 0; //scène en cas de fuite

let saPerte = 0; //perte de vie en combat (pour usage chance)
let maPerte = 0;

//Renvoie un résultat entre 0 et 9
function rollDice10() {
    return Math.floor(Math.random() * 10);
}

//Renvoie un résultat entre 1 et 6
function rollDice6() {
    return Math.floor(Math.random() * 5) + 1;
}

//Cache ou affiche les choix
//Utilisez cette fonction pour éviter le décalage quand les choix sont révélés
function choixHidden(h) {
    let x = document.getElementsByTagName("li");
    for (let i = 0; i < x.length; i++) {
        x[i].hidden = h;
    }
    document.getElementById("histoire").hidden = h;
    document.getElementById("backpack").hidden = h;
}

//Affiche un écran de combat spécial
function ecranCombat() {
    hideElementsById(true, "taler", "choix", "histoire", "backpack");
    hideElementsById(false, "combat");
    let sFuite = "";
    //let gandalf = document.querySelector("#taler");
    //gandalf.hidden = true;

    majDecor("combat");
    saLife = [];
    //choixHidden(true);
    let c = document.getElementById("description");
    c.style.display = "flex";
    let b = document.getElementById("btnAttack");
    b.style.display = "block";
    b = document.getElementById("btnFlee");
    if( scene[sceneEnCours].Choix[choix].Fuir != undefined ) {
        sFuite = "Si vous décidez à un moment ou à un autre de fuir, vous prendrez un coup pour prix de votre couardise."
        sceneFuite = parseInt(scene[sceneEnCours].Choix[choix].Fuir);
        b.style.display = "block";
    } else {
        b.style.display = "none";
    }
    b = document.getElementById("btnChance");
    b.style.display = "block";
    b.disabled = ( maChance <= 0 );
    //Récupère le nombre d'adversaires
    opponent = 0;
    nbOpponents = scene[sceneEnCours].Choix[choix].Force.length;
    saForce = [];
    let pluriel = nbOpponents > 1 ? "s" : "";
    let saLeur = nbOpponents > 1 ? "leur" : "sa";
    c.innerHTML = ""; 
    c.innerHTML += textLiaison + " "; //dans ce cas, introduction au combat qui a lieu
    c.innerHTML += `Vous allez combattre contre ${nbOpponents} adversaire${pluriel}.<br>`;
    c.innerHTML += `A chaque tour de combat, cliquez sur le bouton "Attaque" jusqu'à ${saLeur} mort (ou la vôtre). ${sFuite}Vous pouvez également (pour 1 point de chance) <em>tenter votre chance</em> pour améliorer l'issue d'une attaque... ou l'aggraver.<br>`;
    for( i = 0; i < nbOpponents; i++ ) {
        saForce[i] = parseInt(scene[sceneEnCours].Choix[choix].Force[i]);
        saLife[i] = parseInt(scene[sceneEnCours].Choix[choix].Endurance[i]);
        let multi = ( nbOpponents > 1 ) ? " " + (i + 1) : "";
        c.innerHTML += `<span class='stats'>${scene[sceneEnCours].Choix[choix].Combat[0].toUpperCase() + multi} : FORCE ${saForce[i]}, ENDURANCE ${saLife[i]}</span><br>`;
    }
    c.innerHTML += `<span class='stats'>VOUS : FORCE ${maForce}, ENDURANCE ${maLife}, CHANCE ${maChance}</span><br>`;
    c.innerHTML += "<br>";
}

//En cas de fuite (les 2 points perdus peuvent nous faire mourir)
function flee() {
    rollCombat(true);
    sceneEnCours = (maLife > 0) ? sceneFuite : 0;
    quitteCombat();
}

//Passe à l'adversaire suivant encore en vie
//Renvoie faux si c'est impossible (ils sont tous morts).
function nextOpponent() {
    if( tousMorts() ) {
        return false;
    } else {
        do {
            opponent++;
            if( opponent >= nbOpponents ) {
                opponent = 0;
            }
        } while( saLife[opponent] <= 0 );
        return true;
    }
}

//Renvoie vrai si tous les adversaires sont morts
function tousMorts() {
    for( let i = 0; i < nbOpponents; i++ ) {
        if( saLife[i] > 0 ) return false;
    }
    return true;
}

//Appelée quand on clique sur le bouton attaque
//Ou sur le bouton Chance
function attack(useChance = false) {
    let c = document.getElementById("description");
    c.innerHTML += "<br>";
    if( useChance ) {
        let chanceux = tenterChance();
        console.log("chanceux "+chanceux);
        if( maChance <= 0 ) document.getElementById("btnChance").disabled = true;
        c.innerHTML += `Vous utilisez un point de chance pour attaquer, il vous en reste ${maChance}.<br>`;
        c.innerHTML += rollCombat( false, chanceux );
    } else {
        c.innerHTML += rollCombat();
    }
    if( maLife > 0 ) {
        //Passe à l'adversaire suivant
        if( !nextOpponent() ) {
            textLiaison = scene[sceneEnCours].Choix[choix].TexteVictoire;
            sceneEnCours = sceneApresCombat; //va à la scène prévue
            quitteCombat();
        } else if( nbOpponents > 1 ) {
            let ladversaire = scene[sceneEnCours].Choix[choix].Combat[1] + indexOpponent();
            c.innerHTML += `<br>> Vous affrontez maintenant <span>${ladversaire}</span>.<br>`;
        }
    } else {
        sceneEnCours = 0;
        quitteCombat();
    }
}

//Selon qu'il y ait un ou plusieurs adversaires
function indexOpponent() {
    if( nbOpponents > 1 ) {
        return " " + (opponent+1);
     } else {
        return "";
     }
}

//Jet de combat, perte de points de vie pour vous ou l'adversaire en cours.
function rollCombat(enFuite = false, appelChance = null) {
    let ladversaire = scene[sceneEnCours].Choix[choix].Combat[1] + indexOpponent();
    let iel = scene[sceneEnCours].Choix[choix].Combat[3];
    let s = "";
    let saForceAtt = rollDice6() + rollDice6() + saForce[opponent];
    let maForceAtt = rollDice6() + rollDice6() + maForce;
    let parChance = "";
    if( appelChance !== null ) {
        parChance = appelChance ? "Quelle chance, " : "Pas de chance, ";
        s += `${parChance}<span>${ladversaire}</span>`;
        if (maForceAtt === saForceAtt) maForceAtt += appelChance ? 1 : -1;
    } else {
        s = `<span>${capitalizeFirstLetter(ladversaire)}</span>`;
    }
    if (maForceAtt == saForceAtt) {
        s += ` et vous esquivez mutuellement vos attaques.`
        saPerte = 0;
        maPerte = 0;
    } else if( maForceAtt > saForceAtt ) {
        saPerte = 2;
        if( appelChance !== null ) {
            saPerte += appelChance ? +2 : -1;
        }
        maPerte = 0;
        saLife[opponent] -= saPerte;
        s += ` perd ${saPerte} points de vie sous vos coups.`;
    } else {
        maPerte = 2;
        if( appelChance != null) {
            maPerte = 0;
        }
        saPerte = 0;
        s = `${parChance}vous ne perdez aucun points de vie contre <span>${ladversaire}</span>.`;
        s = capitalizeFirstLetter(s);
    }
    if( enFuite ) {
        maPerte = 2;
        saPerte = 0;
        textLiaison = "Vous perdez 2 points de vie dans votre fuite.";
    }
    //Gère la perte éventuelle de points de vie
    let oldLife = maLife;
    maLife -= maPerte;    
    if (maLife <= 0) {
        maLife = 0;
        displayLife(oldLife);
        textLiaison = ( enFuite ? "Votre fuite échoue. " : "" ) + scene[sceneEnCours].Choix[choix].TexteMort;
    } else {
        displayLife(oldLife);
        s += ` ${capitalizeFirstLetter(iel)}`;
        if (saLife[opponent] <= 0) {
            saLife[opponent] = 0;
            s += " est mort !<br>";
            return s;
        } else {
            s += ` a encore ${saLife[opponent]} points de vie.<br>`;
            return s;
        }
    }
}

//Masque l'écran de combat et revient à la scène
function quitteCombat() {
    saLife = null;
    hideElementsById(true, "combat");
    hideElementsById(false, "choix", "histoire", "backpack");
    //choixHidden(false);
    // let c = document.getElementById("description");
    // c.style.display = "none";
    // let b = document.getElementById("btnAttack");
    // b.style.display = "none";
    // b = document.getElementById("btnFlee");
    // b.style.display = "none";
    // b = document.getElementById("btnChance");
    // b.style.display = "none";
    majScene();

    let gandalf = document.querySelector("#taler");
    gandalf.hidden = false;
}

//Fais appel à la chance pour réduire ses blessures, ou en infliger plus
function chance() {
    let d = document.getElementById("description")

}
