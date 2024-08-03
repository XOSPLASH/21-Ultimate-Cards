document.addEventListener("DOMContentLoaded", () => {
    const drawCardButton = document.getElementById("draw-card");
    const keepButton = document.getElementById("keep");
    const playerCount = document.getElementById("player-count");
    const playerNumberCards = document.getElementById("player-number-cards");
    const playerSpecialCards = document.getElementById("player-special-cards");
    const playerMessage = document.getElementById("player-message");
    const enemyCount = document.getElementById("enemy-count");
    const enemySpecialCards = document.getElementById("enemy-special-cards");
    const enemyNumberCards = document.getElementById("enemy-number-cards");
    const enemyMessage = document.getElementById("enemy-message");
    const draggableArea = document.getElementById("draggable-area");

    let playerScore = 0;
    let enemyScore = getRandomCardValue(); // Initialize enemy score with a random card value
    let maxScore = 21; // Default max score for the player
    let enemyMaxScore = 21; // Default max score for the enemy
    let isPlayerTurn = true; // Track whose turn it is
    let playerHasDrawn = false; // Track if the player has drawn a card
    let enemyExtraTurn = false; // Track if the enemy has an extra turn

    // Display the anonymous card for the enemy with a random value
    displayAnonymousCard(enemySpecialCards, enemyScore);

    drawCardButton.addEventListener("click", () => {
        if (!isPlayerTurn || playerHasDrawn) return; // Ensure only the player's turn and only draw once per turn

        // Draw a card logic for the player
        let card = drawCard();
        playerScore += card.value || 0; // Add value to player score, if not special
        playerCount.textContent = `${playerScore}/${maxScore}`;

        // Add card to player's cards display
        addCardToPlayer(card);

        // If the card is a special card, display a message
        if (card.type === "special") {
            playerMessage.textContent = `Special card ${card.name} drawn!`;
        }

        playerHasDrawn = true; // Mark that the player has drawn a card
    });

    keepButton.addEventListener("click", () => {
        if (!isPlayerTurn) return; // Ensure only the player's turn can keep cards
        
        // End player's turn and reset the draw status
        endTurn();
    });

    function drawCard() {
        const specialCards = ["plus-two", "max-24", "extra-turn"]; // Define special cards
        let isSpecial = Math.random() < 0.2; // 20% chance for a special card

        if (isSpecial) {
            let cardName = specialCards[Math.floor(Math.random() * specialCards.length)];
            return {
                name: cardName,
                type: "special"
            };
        } else {
            let cardValue = Math.floor(Math.random() * 6) + 1; // Random card value between 1 and 6
            return {
                value: cardValue,
                type: "number"
            };
        }
    }

    function addCardToPlayer(card) {
        let cardImg = document.createElement("img");

        if (card.type === "special") {
            cardImg.src = `${card.name}.png`; // e.g., 'cards/special-max-24.png'
            cardImg.alt = card.name; // e.g., 'max-24'
            cardImg.className = 'card special';
        } else {
            cardImg.src = `${card.value}.png`; // e.g., 'cards/1.png'
            cardImg.alt = `Card ${card.value}`;
            cardImg.className = 'card';
        }

        cardImg.draggable = true;
        cardImg.addEventListener('dragstart', handleDragStart);
        cardImg.addEventListener('dragend', handleDragEnd);

        if (card.type === "number") {
            playerNumberCards.appendChild(cardImg);
        } else {
            playerSpecialCards.appendChild(cardImg);
        }
    }

    function addCardToEnemy(card) {
        let cardImg = document.createElement("img");

        if (card.type === "special") {
            cardImg.src = `${card.name}.png`; // e.g., 'cards/special-max-24.png'
            cardImg.alt = card.name; // e.g., 'max-24'
            cardImg.className = 'card special';
        } else {
            cardImg.src = `${card.value}.png`; // e.g., 'cards/1.png'
            cardImg.alt = `Card ${card.value}`;
            cardImg.className = 'card';
        }

        if (card.type === "number") {
            enemyNumberCards.appendChild(cardImg);
        } else {
            enemySpecialCards.appendChild(cardImg);
        }
    }

    function applySpecialCardEffects(name, isPlayer = true) {
        if (isPlayer) {
            switch (name) {
                case "plus-two":
                    playerScore += 2;
                    playerCount.textContent = `${playerScore}/${maxScore}`;
                    playerMessage.textContent = "Special card +2 activated!";
                    break;
                case "max-24":
                    maxScore = 24; // Set the new maximum score for the player
                    enemyMaxScore = 24; // Set the new maximum score for the enemy
                    playerCount.textContent = `${playerScore}/${maxScore}`;
                    playerMessage.textContent = "Special card Max 24 activated!";
                    enemyCount.textContent = `${enemyScore}/${enemyMaxScore}`;
                    enemyMessage.textContent = "Special card Max 24 activated!";
                    break;
                case "extra-turn":
                    isPlayerTurn = true; // Grant an extra turn
                    playerMessage.textContent = "Special card Extra Turn activated!";
                    break;
                default:
                    playerMessage.textContent = `Unknown special card ${name} activated!`;
                    break;
            }
        } else {
            switch (name) {
                case "plus-two":
                    enemyScore += 2;
                    enemyCount.textContent = `${enemyScore}/${enemyMaxScore}`;
                    enemyMessage.textContent = "Special card +2 activated!";
                    break;
                case "max-24":
                    maxScore = 24; // Set the new maximum score for the player
                    enemyMaxScore = 24; // Set the new maximum score for the enemy
                    playerCount.textContent = `${playerScore}/${maxScore}`;
                    playerMessage.textContent = "Special card Max 24 activated!";
                    enemyCount.textContent = `${enemyScore}/${enemyMaxScore}`;
                    enemyMessage.textContent = "Special card Max 24 activated!";
                    break;
                case "extra-turn":
                    enemyExtraTurn = true; // Track that enemy has an extra turn
                    enemyMessage.textContent = "Special card Extra Turn activated!";
                    break;
                default:
                    enemyMessage.textContent = `Unknown special card ${name} activated!`;
                    break;
            }
        }
    }

    function endTurn() {
        if (isPlayerTurn) {
            isPlayerTurn = false;
            playerHasDrawn = false; // Reset the draw status for the next turn
            enemyTurn();
        }
    }

    function enemyTurn() {
        // Enemy draws a card
        let card = drawCard();
        
        if (card.type === "special") {
            applySpecialCardEffects(card.name, false);
        } else {
            enemyScore += card.value;
            enemyCount.textContent = `${enemyScore}/${enemyMaxScore}`;
            addCardToEnemy(card);
        }

        // Decide whether to continue the enemy turn or switch back to the player
        if (enemyExtraTurn) {
            enemyExtraTurn = false; // Reset extra turn tracker
            setTimeout(() => { // Add a delay for visual clarity
                enemyTurn(); // Enemy takes another turn
            }, 1000);
        } else {
            isPlayerTurn = true;
            playerMessage.textContent = "Your turn!";
        }
    }

    function getRandomCardValue() {
        return Math.floor(Math.random() * 6) + 1; // Random value between 1 and 6
    }

    function displayAnonymousCard(container, value) {
        let cardImg = document.createElement("img");
        cardImg.src = `anonymous.png`; // Anonymous card image
        cardImg.alt = `Anonymous Card`;
        cardImg.className = 'card';
        cardImg.dataset.value = value; // Store the actual value in a data attribute
        container.appendChild(cardImg);
    }

    // Drag and drop functionality
    function handleDragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.alt);
        event.target.classList.add('dragging');
    }

    function handleDragEnd(event) {
        event.target.classList.remove('dragging');
    }

    draggableArea.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    draggableArea.addEventListener('drop', (event) => {
        event.preventDefault();
        const cardName = event.dataTransfer.getData('text/plain');
        const card = Array.from(playerSpecialCards.children).find(img => img.alt === cardName);

        if (card) {
            // Apply the special card effect
            applySpecialCardEffects(cardName);
            // Optionally remove the card after activation
            card.remove();
        }
    });
});
