let scene;
let sceneEnCours = 1;
let choix = null;
let textLiaison = "";
let tcp = []; //Table des Coups Portés
let allDescription = "";
let speak = true;
let toggleAnimationText = false;
let audioBackground;
let audioCombat;
let audioDeath;

const decorUrl = "url('../images/decor/";

const urlJSON = "./data/data.json";

async function fetchInfo() {
    fetch(urlJSON)
        .then(response => response.json())
        .then(data => 
            {
                scene = data.Scene;
                main();
            }
        )
        .catch(error => console.log(error));
}

// -----------------------------------------------------------------------------

function majDecor(decorName) {

    let decor = document.querySelector(".top");
    let nextDecor = document.querySelector("." + decorName);
    if(nextDecor) {
        nextDecor.classList.toggle("top");
        nextDecor.classList.toggle("transparent");
    } else {
        console.log(`Impossible de trouver décor ${decorName}`)
    }
    if( decor ) {
        decor.classList.toggle("top");
        decor.classList.toggle("transparent");
    }
}

function capitalizeFirstLetter(string) {
    if( string ) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
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
    if (old < maLife) {
        for (let i = 1; i <= old; i++) {
            s += "<i class='heart fa fa-heart'></i>";
        }
        s += "<span id='blink1'>";
        for (let i = old + 1; i <= maLife; i++) {
            s += "<i class='heart fa fa-heart'></i>";
        }
        s += "</span>";
        s += "<span id='blink2' style='display:none'>";
        for (let i = old + 1; i <= maLife; i++) {
            s += "<i class='heart fa fa-heart-o'></i>";
        }
        s += "</span>";
        for (let i = maLife + 1; i <= maxLife; i++) {
            s += "<i class='heart fa fa-heart-o'></i>";
        }
    }
    //Perte de PdV
    if (old > maLife) {
        for (let i = 1; i <= maLife; i++) {
            s += "<i class='heart fa fa-heart'></i>";
        }
        s += "<span id='blink1'>";
        for (let i = maLife + 1; i <= old; i++) {
            s += "<i class='heart fa fa-heart-o'></i>";
        }
        s += "</span>";
        s += "<span id='blink2' style='display:none'>";
        for (let i = maLife + 1; i <= old; i++) {
            s += "<i class='heart fa fa-heart'></i>";
        }
        s += "</span>";
        for (let i = old + 1; i <= maxLife; i++) {
            s += "<i class='heart fa fa-heart-o'></i>";
        }
    }
    if (old != maLife) {
        //lifeDisplay.innerHTML = "<div aria_label='" + life + " points de vie.'>" + s + "</div>";
        lifeDisplay.innerHTML = "<div>" + s + "</div>";
        blink(300, 800);
    }
}

function changeLifePoint(changeLife) {
    //console.log("Mise a jour des point de vie -> " + changeLife);
    changeLife = parseInt(changeLife);

    const oldLife = maLife;

    maLife += changeLife;

    maLife = maLife > maxLife ? maxLife : maLife;
    maLife = maLife < 0 ? 0 : maLife;

    displayLife(oldLife);
}

// -----------------------------------------------------------------------------------------------------------
function majUnChoix(num) {
    const choix = document.getElementById('choix' + (num + 1));
    choix.textContent = scene[sceneEnCours].Choix[num].Texte;
    //Choix soumis à condition(s) ? Elles doivent toutes être true
    let conditions = scene[sceneEnCours].Choix[num].Conditions;
    let result = true;
    if( conditions ) {
        for(  let c = 0; c < conditions.length; c += 2) {
            let fn = scene[sceneEnCours].Choix[num].Conditions[c];
            let args = scene[sceneEnCours].Choix[num].Conditions[c + 1];
            console.log(`Fn=${fn}\nargs=${args}`);
            result = fnCall(fn, args) && result;
        }
    }
    if( result ) {
        choix.visibility = "visible";
        choix.hidden = false;    
    } else {
        choix.visibility = "hidden"; 
        choix.hidden = true;
    }
}

//Regarde s'il y a un combat
function clickOption(i) {
    
    let changeVers;
    
    choix = i; //mémorise le clic
    textLiaison = scene[sceneEnCours].Choix[i].Liaison;
    
    let pdv = scene[sceneEnCours].Choix[i].PdV;
    if( pdv ) changeLifePoint(pdv);
    //Optionnel dans le JSON pour gérer les pertes ou gains liés au choix.
    let rules = scene[sceneEnCours].Choix[i].Rules;
    if( rules ) {
        for(  let r = 0; r < rules.length; r += 2) {
            let fn = scene[sceneEnCours].Choix[i].Rules[r];
            let args = scene[sceneEnCours].Choix[i].Rules[r + 1];
            console.log(`Fn=${fn}\nargs=${args}`);
            changeVers = fnCall(fn, args);
        }
    }
    //Tentez votre chance peut changer la scène de destination
    if( !changeVers ) changeVers = scene[sceneEnCours].Choix[i].Vers;
    if (maLife <= 0) {
        maLife = 0;
        sceneEnCours = 0;
        majScene();
    } else {
        if (scene[sceneEnCours].Choix[i].Combat == undefined) {
            //console.log("vers "+changeVers);
            sceneEnCours = parseInt( changeVers );
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
        const c = document.getElementById('choix' + i);
        c.innerHTML = "";
        c.visibility = "hidden";
        c.hidden = true;
    }
}

//------------------------------- CONDITIONS -------------------------------
//Certains choix peuvent être soumis à une condition, et ne pas apparaître !
function minOr(min) {
    return gold >= parseInt(min);
}

// -----------------------------------------------------------------------------------------------------------

function majScene() {

    //Si mort
    if( sceneEnCours == 0 ) {
        audioBackground.pause();
        audioCombat.pause();
        audioDeath.play();
    }

    hideChoices();

    taler();

    if (scene[sceneEnCours].Decor != "") {
        majDecor(scene[sceneEnCours].Decor);
    }

    //const histoire = document.getElementById("content");
    // histoire.innerHTML = textLiaison + (textLiaison != "" ? "<br /><br />" : "") + scene[sceneEnCours].Description;

    allDescription = textLiaison + (textLiaison != "" ? "<br>" : "") + scene[sceneEnCours].Description;
    //Optionnel dans le JSON pour gérer les pertes ou gains dans la scène.
    let rules = scene[sceneEnCours].Rules;
    if( rules ) {
        for(  let r = 0; r < rules.length; r += 2) {
            let fn = scene[sceneEnCours].Rules[r];
            let args = scene[sceneEnCours].Rules[r + 1];
            console.log(`Fn=${fn}\nargs=${args}`);
            fnCall(fn, args);
        }
    }
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
    choicesReveal();
}

function choicesReveal() {
    //Fait apparaître les choix l'un après l'autre après displayChoices pour que
    //la transition CSS soit effectuée par la classe fadeIn
    for( let i = 1; i <= 3; i++ ) {
        let c = document.getElementById("choix" + i);
        if( !c.hidden ) {
            window.setTimeout( () => {
            c.style.visibility = "visible";
            c.classList.add("fadeIn");} , (i-1)*100);
        }
    }
}

function hideChoices(){
    let choix = document.querySelector('#choix');
    choix.style.visibility = "hidden";
    for( let i = 1; i <= 3; i++ ) {
        let c = document.getElementById("choix" + i);
        c.style.visibility = "hidden";
        c.style.hidden = true;
        c.classList.remove("fadeIn");
    }
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
    hideElementsById(true, "gandalf", "life", "container", "histoire", "choix", "combat");
    document.getElementById("container").style.height = "0vh";
    sRules = sRules.replace("$maForce", maForce);
    sRules = sRules.replace("$maLife", maLife);
    sRules = sRules.replace("$maChance", maChance);
    document.getElementById("texteRules").innerHTML = sRules;
    document.getElementById("texteIntro").innerHTML = sIntro;
    //Commence à charger le fichier audo mais sans le jouer
    audioBackground = new Audio( "../sounds/background.mp3" );
}

//Appel depuis l'écran des règles du jeu, affiche l'introduction
function intro() {
    mesPotionsInitiales = Array.from(mesPotions); //mémorise les potions de départ
    hideElementsById(true,"rules");
    window.scrollTo(0, 0);
    hideElementsById(false,"introduction");
}

//Appel depuis l'écran d'introduction, démarre l'aventure
function startGame() {
    hideElementsById(false, "gandalf", "life", "container", "histoire", "choix", "decor", "backpack");
    hideElementsById(true, "introduction", "combat");
    document.getElementById("container").style.height = "85vh";
    audioCombat = new Audio( "./sounds/combat.mp3" );
    audioCombat.loop = true;
    audioDeath = new Audio( "./sounds/death.mp3" );
    audioDeath.loop = true;
    // audioBackground.addEventListener("canplay", event => {
    //     audioBackground.loop = true;
    //     audioBackground.play();
    //   });
    audioBackground.loop = true;
    audioBackground.play();
    displayLife(0);
    majScene();
}
