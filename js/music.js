// let audioBackground;
// let audioCombat;
// let audioDeath;
// let soundAttack;
// let soundHit;
// let soundMiss;
let audios = new Map();
let sounds = new Map();

let soundSilent = false;

/**
 * Le toggle se fait uniquement dans story.component, donc on revient sur la musique background.
 */
function toggleSound() {
    let icon = document.getElementById("soundIcon");
    soundSilent = !soundSilent;
    if(soundSilent) {
        pauseAudios();
        icon.classList.replace("fa-volume-up", "fa-volume-off");
    } else {
        playAudio("background");
        icon.classList.replace("fa-volume-off", "fa-volume-up")
    }
}

/**
 * Initialise les musiques sans les jouer.
 */
function musicInit() {
    audios.set("background", {music: new Audio("../sounds/background.mp3"), canPlay: false});
    attachEvent(audios, "background");
    audios.set("fight", {music: new Audio("../sounds/fight.mp3"), canPlay: false});
    attachEvent(audios, "fight");
    audios.set("death", {music: new Audio( "../sounds/death.mp3"), canPlay: false});
    attachEvent(audios, "death");
    
    sounds.set("hit", {music: new Audio("../sounds/hit.mp3"), canPlay: false});
    attachEvent(sounds, "hit");
    sounds.set("miss", {music: new Audio("../sounds/miss.mp3"), canPlay: false});
    attachEvent(sounds, "miss");
    sounds.set("sword", {music: new Audio("../sounds/sword.mp3"), canPlay: false});
    attachEvent(sounds, "sword");
    sounds.set("opponent", {music: new Audio("../sounds/.mp3"), canPlay: false});
    attachEvent(sounds, "opponent");
}

/**
 * Renseigne canPlay à true s'il est possible de démarre la lecture de la musique / bruitage
 * @param {Map<string,{music:HTMLAudioElement,canPlay:boolean}>} audiosOrSounds la Map audios ou sounds
 * @param {string} music 
 */
function attachEvent(audiosOrSounds, music) {
    let aos = audiosOrSounds.get(music);
    aos.music.addEventListener("canplaythrough", event => {
        console.log("canPlay "+aos.music.src);
        aos.canPlay = true;
        if( music === "opponent" ) aos.music.play(); //lance dès que possible le bruit opponent
    });
}

/**
 * Met en pause toutes les musiques en cours, et lance celle passée en paramètre.
 * @param {string} music "background" | "fight" | "death"
 * @returns void
 */
function playAudio(music) {
    if( soundSilent ) return;
    console.log(`%c music to play ${music}`,"color:blue");
    for( let [key, audio] of audios ) {
        if( key != music ) {
            audio.music.pause();
        } else {
            if( audio.canPlay ) {
                //console.log(`playing ${audio.music.src}`);
                audio.music.loop = true;
                audio.music.play();
            }
        }
    }
}

/**
 * Met en pause toutes les musiques
 */
function pauseAudios() {
    for( let audio of audios.values() ) {
        audio.music.pause();
    }
}

/**
 * Lance un bruitage sans arrêter les autres musiques
 * @param {string} sound "hit" | "miss" | "sword" | "opponent"
 */
function playSound(sound, monster = "") {
    if(!soundSilent) {
        let bruit = sounds.get(sound);
        if( sound === "opponent" ) {
            console.log(`bruit.music.load("../sounds/${monster}.mp3");`);
            bruit.music.src = `../sounds/${monster}.mp3`;
            bruit.music.load(); //the event will trigger play for opponent
        } else if( bruit.canPlay ) {
            bruit.music.loop = false;
            bruit.music.play();
        }
    }
}

