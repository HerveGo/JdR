let audios = new Map();
let sounds = new Map();

let soundSilent = false;

let currentMusic = "background";

/**
 * Le toggle revient sur la musique jouée auparavant.
 */
function toggleSound() {
    let icon = document.getElementById("soundIcon");
    soundSilent = !soundSilent;
    if(soundSilent) {
        pauseAudios();
        icon.classList.replace("fa-volume-up", "fa-volume-off");
    } else {
        playAudio(currentMusic);
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
    sounds.set("backpack-open", {music: new Audio("../sounds/backpack-open.mp3"), canPlay: false});
    attachEvent(sounds, "backpack-open");
    sounds.set("backpack-close", {music: new Audio("../sounds/backpack-close.mp3"), canPlay: false});
    attachEvent(sounds, "backpack-close");
    sounds.set("drink", {music: new Audio("../sounds/drink.mp3"), canPlay: false});
    attachEvent(sounds, "drink");
    sounds.set("eat", {music: new Audio("../sounds/eat.mp3"), canPlay: false});
    attachEvent(sounds, "eat");
    sounds.set("stomach", {music: new Audio("../sounds/stomach.mp3"), canPlay: false});
    attachEvent(sounds, "stomach");
    sounds.set("popup", {music: new Audio("../sounds/popup.mp3"), canPlay: false});
    attachEvent(sounds, "popup");
    sounds.set("opponent", {music: new Audio(), canPlay: false});
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
    currentMusic = music;
    //console.log(`%cplayAudio() currentMusic = ${currentMusic}`,"color:blue");
    if( soundSilent ) return;
    console.log(`%c music to play ${music}`,"color:blue");
    for( let [key, audio] of audios ) {
        if( key != music ) {
            audio.music.pause();
        } else {
            if( audio.canPlay ) {
                audio.music.loop = true;
                audio.music.play();
            }
        }
    }
}

/**
 * Met en pause toutes les musiques.
 */
function pauseAudios() {
    for( let audio of audios.values() ) {
        audio.music.pause();
    }
}

/**
 * Lance un bruitage sans arrêter les autres musiques.
 * Pour opponent, charge le mp3 correspondant au nom de l'adversaire.
 * @param {string} sound "hit" | "miss" | "sword" | "opponent" | "backpack-open/close" | "eat" | "drink" | "stomach" | "popup"
 */
function playSound(sound, monster = "") {
    if(!soundSilent) {
        let bruit = sounds.get(sound);
        if( sound === "opponent" && monster !== "" ) {
            console.log(`bruit.music.load("../sounds/${monster}.mp3");`);
            bruit.music.src = `../sounds/${monster}.mp3`;
            bruit.music.load(); //the event will trigger play for opponent
        } else if( bruit.canPlay ) {
            bruit.music.loop = false;
            bruit.music.play();
        }
    }
}

