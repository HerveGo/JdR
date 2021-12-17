let scene;
let sceneEnCours = 1;
let sceneApresCombat = 0;
const maxLife = 20;
let maForce = 10;
let life = maxLife;
let saLife = null;
let choix = null;
let textLiaison = "";
let tcp = []; //Table des Coups Portés
let allDescription = "";
let speak = true;
let toggleAnimationText = false;


const decorUrl = "url('../images/decor/";

const urlJSON = "./data/data.json";

async function fetchInfo() {
    fetch(urlJSON)
        .then(response => response.json())
        .then(data => 
            {
                scene = data.Scene;
                main()
            }
        )
        .catch(error => console.log(error));
}

// -----------------------------------------------------------------------------

function majDecor(decorName) {
    console.log("Url du décor en cours de chargement -> " + (decorUrl + decorName + "')"))

    let decor = document.querySelector(".top");
    let nextDecor = document.querySelector("." + decorName);

    nextDecor.classList.toggle("top");
    nextDecor.classList.toggle("transparent");

    decor.classList.toggle("top");
    decor.classList.toggle("transparent");
}


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// blink "on" state
function show() {
    document.getElementById("blink2").style.display = "none";
    document.getElementById("blink1").style.display = "inline";
}
// blink "off" state
function hide() {
    document.getElementById("blink1").style.display = "none";
    document.getElementById("blink2").style.display = "inline";
}

//Effet de clignotement, delay en millisecondes, pendant duration secondes
function blink(delay, duration) {
    for (let i = 0; i < duration; i += delay) {
        setTimeout("hide()", i);
        setTimeout("show()", i + delay / 2);
    }
}

//Crée la barre de points de vie.
//Fait clignoter les points gagnés ou perdus.
function displayLife(old) {
    lifeDisplay = document.getElementById("life");
    let s = "";
    //Gain de PdV
    if (old < life) {
        for (let i = 1; i <= old; i++) {
            s += "<i class='heart fa fa-heart'></i>";
        }
        s += "<span id='blink1'>";
        for (let i = old + 1; i <= life; i++) {
            s += "<i class='heart fa fa-heart'></i>";
        }
        s += "</span>";
        s += "<span id='blink2' style='display:none'>";
        for (let i = old + 1; i <= life; i++) {
            s += "<i class='heart fa fa-heart-o'></i>";
        }
        s += "</span>";
        for (let i = life + 1; i <= maxLife; i++) {
            s += "<i class='heart fa fa-heart-o'></i>";
        }
    }
    //Perte de PdV
    if (old > life) {
        for (let i = 1; i <= life; i++) {
            s += "<i class='heart fa fa-heart'></i>";
        }
        s += "<span id='blink1'>";
        for (let i = life + 1; i <= old; i++) {
            s += "<i class='heart fa fa-heart-o'></i>";
        }
        s += "</span>";
        s += "<span id='blink2' style='display:none'>";
        for (let i = life + 1; i <= old; i++) {
            s += "<i class='heart fa fa-heart'></i>";
        }
        s += "</span>";
        for (let i = old + 1; i < maxLife; i++) {
            s += "<i class='heart fa fa-heart-o'></i>";
        }
    }
    if (old != life) {
        lifeDisplay.innerHTML = "<div aria_label='" + life + " points de vie.'>" + s + "</div>";
        //lifeDisplay.innerHTML = "<div aria_label='" + life + " points de vie.'>" + s + "<button class='info'>Inventaire</button></div>";
        blink(300, 800);
    }
}

function changeLifePoint(changeLife) {
    console.log("Mise a jour des point de vie -> " + changeLife);
    changeLife = parseInt(changeLife);

    const oldLife = life;

    life += changeLife;

    life = life > maxLife ? maxLife : life;
    life = life < 0 ? 0 : life;

    displayLife(oldLife);
}

// -----------------------------------------------------------------------------------------------------------
function majUnChoix(num) {
    console.log("Mise à jour du choix " + (num + 1));

    const choix = document.getElementById('choix' + (num + 1));
    choix.textContent = scene[sceneEnCours].Choix[num].Texte;

    choix.visibility = "visible";
    choix.hidden = false;
    console.log("Choix " + (num + 1) + " mis à jour!");
    console.log("");
}

function changeForce(strength) {
    console.log("Changement de force " + strength);
    if (strength != undefined) {
        let x = parseInt(strength);
        maForce += x;
    }
}

//Regarde s'il y a un combat
function clickOption(i) {
    
    console.log("Vous avez cliqué sur un choix qui envoie vers la scène " + scene[sceneEnCours].Choix[i].Vers)
    choix = i; //mémorise le clic
    textLiaison = scene[sceneEnCours].Choix[i].Liaison;

    changeLifePoint(scene[sceneEnCours].Choix[i].PdV);
    //Optionnel dans le JSON pour gérer les points de force.
    changeForce(scene[sceneEnCours].Choix[i].Strength);

    if (life <= 0) {
        life = 0;
        sceneEnCours = 0;
        majScene();
    } else {
        if (scene[sceneEnCours].Choix[i].Combat == undefined) {
            sceneEnCours = scene[sceneEnCours].Choix[i].Vers;
            majScene();
        } else {
            sceneApresCombat = scene[sceneEnCours].Choix[i].Vers;
            ecranCombat();
        }
    }

    //Affiche un écran de combat spécial
    function ecranCombat(vers) {
        let gandalf = document.querySelector("#taler");
        gandalf.hidden = true;


        majDecor("combat");
        saLife = null;
        let x = document.getElementsByTagName("LI");
        for (let i = 0; i < x.length; i++) {
            x[i].hidden = true;
        }
        document.getElementById("histoire").hidden = true;
        let c = document.getElementById("description");
        c.style.display = "flex";
        let b = document.getElementById("btnAttack");
        b.style.display = "block";
        let saForce = parseInt(scene[sceneEnCours].Choix[choix].Force);
        c.innerHTML = textLiaison + " "; //dans ce cas, introduction au combat qui a lieu
        c.innerHTML += "Vous allez combattre contre " + scene[sceneEnCours].Choix[choix].Combat[2] + ".<br>";
        c.innerHTML += "Sa FORCE est de " + saForce + ", la vôtre est de " + maForce + ". ";
        let diff = maForce - saForce;
        if (diff == 0 || diff == -1 || diff == 1) {
            c.innerHTML += "Le combat s'annonce équilibré.<br>";
        }
        if (diff > 1 && diff < 8) {
            c.innerHTML += "Le combat devrait tourner à votre avantage.";
        }
        if (diff > 8) {
            c.innerHTML += "Vous devriez gagner facilement ce combat.";
        }
        if (diff < -1 && diff > -8) {
            c.innerHTML += "Le combat n'est pas gagné d'avance, attention.";
        }
        if (diff < -8) {
            c.innerHTML += "Ce combat s'annonce très difficile !";
        }
        c.innerHTML += "<br>";
    }
}

//Appelée quand on clique sur le bouton attaque
function attack() {
    let c = document.getElementById("description");
    c.innerHTML += "<br>";
    let diff = 0;
    if (saLife == null) {
        saLife = parseInt(scene[sceneEnCours].Choix[choix].Endurance);
    }
    let saForce = parseInt(scene[sceneEnCours].Choix[choix].Force);
    let dice = Math.floor(Math.random() * 10);
    if (maForce != saForce) {
        diff = Math.floor((maForce - saForce) / 2 + 6); //colonne du tableau tcp
        if (diff < 0) { diff = 0; }
        if (diff > 12) { diff = 12; }
    } else {
        diff = 6; //colonne 7 au milieu en cas d'égalité stricte
    }
    switch (dice) {
        case 0:
        case 1:
            c.innerHTML += "La chance vous abandonne";
            break;
        case 2:
        case 3:
            c.innerHTML += "La chance ne vous sourit pas";
            break;
        case 4:
        case 5:
            c.innerHTML += "Vous vous en sortez assez bien";
            break;
        case 6:
        case 7:
            c.innerHTML += "La chance vous sourit";
            break;
        case 8:
        case 9:
            c.innerHTML += "La chance est avec vous";
            break;
    }
    let saPerte = tcp[dice][diff][0];
    c.innerHTML += ", " + scene[sceneEnCours].Choix[choix].Combat[1];
    if (saPerte == 0) {
        c.innerHTML += " ne perd aucun points de vie.<br>";
    } else {
        c.innerHTML += " perd " + saPerte + " points de vie sous vos coups.<br>";
    }
    saLife -= saPerte;
    let maPerte = tcp[dice][diff][1];
    if (maPerte == 0) {
        c.innerHTML += "Vous ne perdez aucun points de vie dans l'échange.";
    } else {
        c.innerHTML += "Vous perdez " + maPerte + " points de vie dans l'échange.";
    }
    let oldLife = life;
    life -= maPerte;
    if (life <= 0) {
        life = 0;
        displayLife(oldLife);
        textLiaison = scene[sceneEnCours].Choix[choix].TexteMort;
        sceneEnCours = 0;
        quitteCombat();
    } else {
        displayLife(oldLife);
        if (saLife <= 0) {
            saLife = 0;
            textLiaison = textLiaison = scene[sceneEnCours].Choix[choix].TexteVictoire;
            sceneEnCours = sceneApresCombat; //va à la scène prévue
            quitteCombat();
        } else {
            c.innerHTML += "<br>" + capitalizeFirstLetter(scene[sceneEnCours].Choix[choix].Combat[1]);
            c.innerHTML += " a encore " + saLife + " points de vie.<br>";
        }
    }
    console.log("dice=" + dice);
    console.log("diff=" + diff);
    console.log("il perd=" + tcp[dice][diff][0]);
    console.log("je perds=" + tcp[dice][diff][1]);
}

function quitteCombat() {
    saLife = null;
    let x = document.getElementsByTagName("LI");
    for (let i = 0; i < x.length; i++) {
        x[i].hidden = false;
    }
    document.getElementById("histoire").hidden = false;
    let c = document.getElementById("description");
    c.style.display = "none";
    let b = document.getElementById("btnAttack");
    b.style.display = "none";
    majScene();

    let gandalf = document.querySelector("#taler");
    gandalf.hidden = false;
}

function majFullChoix() {
    console.log("Mise à jour de tous les choix en cours ...");
    console.log("");

    let nbChoix = scene[sceneEnCours].Choix.length;

    // Change le texte de tous les choix
    for (i = 0; i < nbChoix; i++) {
        majUnChoix(i);
    }

    // Cache les éléments de la liste si il n'y a pas de choix pour la scène en cours
    for (i = nbChoix+1; i < 4; i++) {
        const choix = document.getElementById('choix' + i);
        console.log("cache le choix "+i);
        choix.innerHTML = "";
        choix.visibility = "hidden";
        choix.hidden = true;
    }
}
// -----------------------------------------------------------------------------------------------------------

function majScene() {
    console.log("Mise en place de la scène -> " + sceneEnCours);

    hideChoices();

    taler();

    if (scene[sceneEnCours].Decor != "") {
        majDecor(scene[sceneEnCours].Decor);
    }

    const histoire = document.getElementById("content");
    // histoire.innerHTML = textLiaison + (textLiaison != "" ? "<br /><br />" : "") + scene[sceneEnCours].Description;

    allDescription = textLiaison + (textLiaison != "" ? "<br /><br />" : "") + scene[sceneEnCours].Description;
    initText();
    animationText();

    majFullChoix();
}

//Charge les images de fond
function loadImg() {
    let d = document.querySelector(".decor");
    console.log(d);
    let s = "";
    let c = "";
    for (scn = 0; scn < scene.length; scn++) {
        if (scene[scn].Decor != "") {
            if (scene[scn].Decor === "foret") {
                c = " top";
            } else {
                c = " transparent";
            }
            s += '<img class="' + scene[scn].Decor + c + '" src="./images/decor/' + scene[scn].Decor + '.jpg" />';
        }
    }
    s += '<img class="combat transparent" src="./images/decor/combat.jpg" />';
    d.innerHTML = s;
}

function displayChoices(){
    let choix = document.querySelector('#choix');
    choix.style.visibility = "visible";
}

function hideChoices(){
    let choix = document.querySelector('#choix');
    choix.style.visibility = "hidden";
}


function taler() {
    const imgOne = document.getElementById('one');
    let changement = 1;
    speak = true;

    setInterval(function boucheD() {
        if (speak == true) {

            if (changement == 1) {
                imgOne.setAttribute("src", "./images/taler/bouche2-removebg-preview.png")
                changement = 2;

            }
            else if (changement == 2) {
                imgOne.setAttribute("src", "./images/taler/bouche3-removebg-preview.png")
                changement = 3;
            }
            else {
                imgOne.setAttribute("src", "./images/taler/bouche1-removebg-preview.png")
                changement = 1;
            }
        }
    }, 150);

    // setTimeout(function tempsDeParole() {
    //     speak = false;
    //     imgOne.setAttribute("src", "./images/taler/bouche2-removebg-preview.png")
    // }, 2500);

}

function stopTalking(){
    const imgOne = document.getElementById('one');
    speak = false;
    imgOne.setAttribute("src", "./images/taler/bouche2-removebg-preview.png");
}

function initText() {
    let t = document.getElementById("content");
    let s = "";
    let isTag = false;
    for (let i = 0; i < allDescription.length; i++) {
        if (allDescription[i] == "<") {
            isTag = true;
        }
        if (!isTag) {
            s += "<span id='letter" + i + "' class='invisible'>" + allDescription[i] + "</span>";
        } else {
            s += allDescription[i];
        }
        if (allDescription[i] == ">") {
            isTag = false;
        }
    }
    t.innerHTML = s;
}

function animationText() {
    // EFFET MACHINE A ECRIRE
    let str = allDescription;
    let i = 0;
    let letter;
    toggleAnimationText = false;

    (function type() {
        if ((i === str.length) || (toggleAnimationText)) {
            document.getElementById("content").innerHTML = allDescription;
            displayChoices();
            stopTalking();
            
            return;
        }

        letter = document.getElementById("letter"+i);
        if( letter ) {
            letter.classList.toggle("invisible");
        }
        i++;
        
        setTimeout(type, 30);
    }());
}

function stopAnimationText(){
    toggleAnimationText = true;
    const histoire = document.getElementById("content");
    histoire.innerHTML = allDescription;
    stopTalking();
}

fetchInfo();

function main() {
    //tcp[d10][diff force][0 ennemi, 1 héros]
    //diff force = (force héros - force ennemi)/2 + 6
    tcp = [
        [[0, 100], [0, 100], [0, 8], [0, 6], [1, 6], [2, 5], [3, 5], [4, 5], [5, 4], [6, 4], [7, 4], [8, 3], [9, 3]],
        [[0, 100], [0, 8], [0, 7], [1, 6], [2, 5], [3, 5], [4, 4], [5, 4], [6, 3], [7, 3], [8, 3], [9, 3], [10, 2]],
        [[0, 8], [0, 7], [1, 6], [2, 5], [3, 4], [4, 4], [5, 4], [6, 3], [7, 3], [8, 3], [9, 2], [10, 2], [11, 2]],
        [[0, 8], [1, 7], [2, 6], [3, 5], [4, 4], [5, 4], [6, 3], [6, 3], [7, 3], [8, 2], [10, 2], [11, 2], [12, 2]],
        [[1, 7], [2, 6], [3, 5], [4, 4], [5, 4], [6, 3], [7, 2], [8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [14, 1]],
        [[2, 6], [3, 6], [4, 5], [5, 4], [6, 3], [7, 2], [8, 2], [9, 2], [10, 2], [11, 1], [12, 1], [14, 1], [16, 1]],
        [[3, 5], [4, 5], [5, 5], [6, 3], [7, 2], [8, 2], [9, 1], [10, 1], [11, 1], [12, 0], [14, 0], [16, 0], [18, 0]],
        [[4, 4], [5, 4], [6, 2], [7, 2], [8, 1], [9, 1], [10, 0], [11, 0], [12, 0], [14, 0], [16, 0], [18, 0], [100, 0]],
        [[5, 3], [6, 3], [7, 2], [8, 0], [9, 0], [10, 0], [11, 0], [11, 0], [12, 0], [14, 0], [16, 0], [18, 0], [100, 0]],
        [[6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [14, 0], [16, 0], [18, 0], [100, 0], [100, 0], [100, 0]],
    ];
    loadImg();
    displayLife(0);
    majScene();
}
