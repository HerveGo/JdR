let scene;
let sceneEnCours = 1;
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

    //loadImg();

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
        for (let i = old + 1; i <= maxLife; i++) {
            s += "<i class='heart fa fa-heart-o'></i>";
        }
    }
    if (old != life) {
        //lifeDisplay.innerHTML = "<div aria_label='" + life + " points de vie.'>" + s + "</div>";
        lifeDisplay.innerHTML = "<div>" + s + "</div>";
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
    const choix = document.getElementById('choix' + (num + 1));
    choix.textContent = scene[sceneEnCours].Choix[num].Texte;

    choix.visibility = "visible";
    choix.hidden = false;
}

function changeForce(strength) {
    if (strength != undefined) {
        let x = parseInt(strength);
        maForce += x;
    }
}

//Regarde s'il y a un combat
function clickOption(i) {
    
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
}

function majFullChoix() {
    let nbChoix = scene[sceneEnCours].Choix.length;

    // Change le texte de tous les choix
    for ( let i = 0; i < nbChoix; i++ ) {
        majUnChoix( i );
    }

    // Cache les éléments de la liste si il n'y a pas de choix pour la scène en cours
    for ( let i = nbChoix + 1; i < 4; i++ ) {
        const choix = document.getElementById('choix' + i);
        choix.innerHTML = "";
        choix.visibility = "hidden";
        choix.hidden = true;
    }
}
// -----------------------------------------------------------------------------------------------------------

function majScene() {

    hideChoices();

    taler();

    if (scene[sceneEnCours].Decor != "") {
        majDecor(scene[sceneEnCours].Decor);
    }

    const histoire = document.getElementById("content");
    // histoire.innerHTML = textLiaison + (textLiaison != "" ? "<br /><br />" : "") + scene[sceneEnCours].Description;

    allDescription = textLiaison + (textLiaison != "" ? "<br>" : "") + scene[sceneEnCours].Description;
    initText();
    animationText();

    majFullChoix();
}

//Charge les images de fond
function loadImg() {
    let d = document.querySelector(".decor");
    
    let s = "";
    let c = "";
    for (scn = 0; scn < scene.length; scn++) {
        if (scene[scn].Decor != "") {
            if (scene[scn].Decor === "foret") {
                c = " top";
            } else {
                c = " transparent";
            }
            s += `<img class="${scene[scn].Decor + c}" src="./images/decor/${scene[scn].Decor}.jpg" />`;
        }
    }
    s += `<img class="combat transparent" src="./images/decor/combat.jpg" />`;
    s += `<img class="inventaire transparent" src="./images/decor/inventaire.jpg" />`;
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
    initStats();
    displayLife(0);
    majScene();
}
