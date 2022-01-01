/* dans ul
<li>
    <input type="checkbox" id="item1" name="item" value="3">
    <label for="item1"><span>POTION DE GUERISON</span><span class="alignRight">3&nbsp;po</span><br></label>
</li>
*/

const prixTotal = document.getElementById("prix");
let intPrix = 0;

let listeChalkboard = [
    ["potion de guérison","POTION DE GUERISON","3"],
    ["contrôle des plantes","POTION DE CONTROLE DES PLANTES","2"],
    ["tranquillité", "POTION DE TRANQUILLITE","3"],
    ["contrôle des insectes", "POTION DE CONTROLE DES INSECTES", "2"],
    ["antipoison", "POTION ANTIPOISON", "2"],
    ["eau bénite", "EAU BENITE", "3"],
    ["anneau de lumière", "ANNEAU DE LUMIERE", "3"],
    ["bottes à bondir", "BOTTES A BONDIR", "2"],
    ["corde magique", "CORDE MAGIQUE", "3"],
    ["filet de capture", "FILET DE CAPTURE", "3"],
    ["brassard de puissance", "BRASSARD DE PUISSANCE", "3"],
    ["gant d'adresse", "GANT D'ADRESSE AU LANCER", "2"],
    ["perche à sonder", "PERCHE A SONDER", "2"],
    ["gousses d'ail", "GOUSSES D'AIL", "3"],
    ["bandeau de concentration", "BANDEAU DE CONCENTRATION", "3"],
    ["capsules de feu", "CAPSULES DE FEU", "3"],
    ["filtres à nez", "FILTRES A NEZ", "3"]
];

/**
 * Remplit l'ardoise avec les objets et les prix.
 * Ajoute un écouteur d'évènement sur toutes les checkbox items,
 * qui met à jour le prix à chaque fois qu'on coche/décoche une case.
 */
function fillChalkboard() {
    const ul = document.getElementById("listeMagie");
    let s = "";
    for( let i = 0; i < listeChalkboard.length; i++ ) {
        let nom = listeChalkboard[i][0];
        let label = listeChalkboard[i][1];
        let prix = listeChalkboard[i][2];
        let li = '<li>';
        li += `<input type="checkbox" id="item${i}" name="items" value="${prix}">`;
        li += `<label for="item${i}"><span>${label}</span><span class="alignRight">${prix} po</span><br></label>`;
        li += '</li>';
        s += li;
    }
    ul.innerHTML = s;
    // Select all checkboxes with the name 'settings' using querySelectorAll.
    const checkboxes = document.querySelectorAll("input[type=checkbox][name=items]");
    let enabledSettings = [];

    // Use Array.forEach to add an event listener to each checkbox.
    checkboxes.forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            let somme = 0;
            enabledSettings = 
                Array.from(checkboxes) // Convert checkboxes to an array to use filter and map.
                .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                .map(i => parseInt( i.value ) ) // Use Array.map to extract only the checkbox values from the array of objects.
            if ( enabledSettings.length !== 0 ) somme = enabledSettings.reduce( (a, b) => a + b );
            prixTotal.innerHTML = somme;
            intPrix = somme;
        })
    });
}

/**
 * Ajoute dans l'inventaire les objets achetés (nom en minuscule)
 */
function buyItems() {
    if ( intPrix > gold ) {
        showModal(0);
    } else {
        const checkboxes = document.querySelectorAll("input[type=checkbox][name=items]");
        checkboxes.forEach( (checkbox, index) => {
            if( checkbox.checked ) inventory.push(listeChalkboard[index][0]);
        });
        gold -= intPrix;
        startGame();
    }
}