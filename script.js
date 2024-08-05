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

    let specialChance = 0.5;
    let playerScore = 0;
    let enemyScore = getRandomCardValue();
    let playerMaxScore = 21;
    let enemyMaxScore = 21;
    let roundNumber = 1;
    let maxRounds = 5;
    let isPlayerTurn = true;
    let playerHasDrawn = false;
    let enemyExtraTurn = false;
    let playerUsedSpecial = false;
    let enemyUsedSpecial = false;
    let playerExtraTurn = false;

    drawCardButton.addEventListener("click", () => {
        if (!isPlayerTurn || playerHasDrawn) return;

        let card = drawCard();
        playerScore += card.value || 0;
        playerCount.textContent = `${playerScore}/${playerMaxScore}`;

        addCardToPlayer(card);

        if (card.type === "special") {
            playerMessage.textContent = `Special card ${card.name} drawn!`;

            if (card.name === "extra-turn") {
                playerExtraTurn = true;
            }
        }

        playerHasDrawn = true;
        endTurn();
    });

    keepButton.addEventListener("click", () => {
        if (!isPlayerTurn) return;
        endTurn();
    });

    function drawCard() {
        const specialCards = ["plus-two", "max-24", "extra-turn", "remove-last-card"];
        let isSpecial = Math.random() < specialChance;

        if (isSpecial) {
            let cardName = specialCards[Math.floor(Math.random() * specialCards.length)];
            return { name: cardName, type: "special" };
        } else {
            let cardValue = Math.floor(Math.random() * 6) + 1;
            return { value: cardValue, type: "number" };
        }
    }

    function addCardToPlayer(card) {
        let cardImg = document.createElement("img");

        if (card.type === "special") {
            cardImg.src = `${card.name}.png`;
            cardImg.alt = card.name;
            cardImg.className = 'card special';
        } else {
            cardImg.src = `${card.value}.png`;
            cardImg.alt = `Card ${card.value}`;
            cardImg.className = 'card';
        }

        cardImg.draggable = true;
        cardImg.addEventListener('dragstart', handleDragStart);
        cardImg.addEventListener('dragend', handleDragEnd);

        cardImg.addEventListener('mouseenter', () => showSpecialEffect(card.name, cardImg));
        cardImg.addEventListener('mouseleave', () => hideSpecialEffect(cardImg));

        if (card.type === "number") {
            playerNumberCards.appendChild(cardImg);
        } else {
            playerSpecialCards.appendChild(cardImg);
        }
    }

    function addCardToEnemy(card) {
        let cardImg = document.createElement("img");

        if (card.type === "special") {
            cardImg.src = `${card.name}.png`;
            cardImg.alt = card.name;
            cardImg.className = 'card special';
        } else {
            cardImg.src = `${card.value}.png`;
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
            playerUsedSpecial = true;

            switch (name) {
                case "plus-two":
                    addCardToDeck({ value: 2, type: "number" }, playerNumberCards);
                    playerMessage.textContent = "Special card +2 activated! A 2 card has been added to your deck.";
                    break;
                case "max-24":
                    playerMaxScore = 24;
                    enemyMaxScore = 24;
                    playerCount.textContent = `${playerScore}/${playerMaxScore}`;
                    enemyCount.textContent = `${enemyScore}/${enemyMaxScore}`;
                    playerMessage.textContent = "Special card Max 24 activated!";
                    break;
                case "extra-turn":
                    playerExtraTurn = true;
                    playerUsedSpecial = false;
                    playerMessage.textContent = "Special card Extra Turn activated!";
                    break;
                case "remove-last-card":
                    removeLastCardFromDeck(enemySpecialCards, enemyNumberCards, false);
                    playerMessage.textContent = "Special card Remove Last Card activated!";
                    break;
                default:
                    playerMessage.textContent = `Unknown special card ${name} activated!`;
                    break;
            }
        } else {
            enemyUsedSpecial = true;

            switch (name) {
                case "plus-two":
                    addCardToDeck({ value: 2, type: "number" }, enemyNumberCards);
                    enemyMessage.textContent = "Special card +2 activated! A 2 card has been added to your deck.";
                    break;
                case "max-24":
                    playerMaxScore = 24;
                    enemyMaxScore = 24;
                    playerCount.textContent = `${playerScore}/${playerMaxScore}`;
                    enemyCount.textContent = `${enemyScore}/${enemyMaxScore}`;
                    enemyMessage.textContent = "Special card Max 24 activated!";
                    break;
                case "extra-turn":
                    enemyExtraTurn = true;
                    enemyMessage.textContent = "Special card Extra Turn activated!";
                    break;
                case "remove-last-card":
                    removeLastCardFromDeck(playerSpecialCards, playerNumberCards, true);
                    enemyMessage.textContent = "Special card Remove Last Card activated!";
                    break;
                default:
                    enemyMessage.textContent = `Unknown special card ${name} activated!`;
                    break;
            }

            showSpecialEffect(name, draggableArea);
        }
    }

    function addCardToDeck(card, deckElement) {
        let cardImg = document.createElement("img");
        cardImg.src = `${card.value}.png`;
        cardImg.alt = `Card ${card.value}`;
        cardImg.className = 'card';
        
        // Add the card to the appropriate deck
        deckElement.appendChild(cardImg);
    }

    function removeLastCardFromDeck(specialDeck, numberDeck, isPlayer) {
        let lastCard = specialDeck.lastElementChild || numberDeck.lastElementChild;
        if (lastCard) {
            let cardValue = parseInt(lastCard.alt.split(' ')[1]) || 0;
            if (isPlayer) {
                // Enemy is using the card, remove a card from the player's deck
                playerScore -= cardValue;
                playerCount.textContent = `${playerScore}/${playerMaxScore}`;
            } else {
                // Player is using the card, remove a card from the enemy's deck
                enemyScore -= cardValue;
                enemyCount.textContent = `${enemyScore}/${enemyMaxScore}`;
            }
            lastCard.remove();
        }
    }

    function endTurn() {
        if (isPlayerTurn) {
            isPlayerTurn = false;
            playerHasDrawn = false;
            playerUsedSpecial = false;
            playerExtraTurn = false; // Reset extra turn flag
            enemyTurn();
        } else if (playerExtraTurn) {
            playerExtraTurn = false; // Reset extra turn flag
            isPlayerTurn = true;
            playerMessage.textContent = "Your extra turn! You can use another special card.";
        }
    }

    function enemyTurn() {
        let card = drawCard();
        
        if (card.type === "special" && !enemyUsedSpecial) {
            applySpecialCardEffects(card.name, false);
        } else {
            enemyScore += card.value;
            enemyCount.textContent = `${enemyScore}/${enemyMaxScore}`;
            addCardToEnemy(card);
        }

        if (enemyExtraTurn) {
            enemyExtraTurn = false;
            setTimeout(() => {
                enemyTurn();
            }, 1000);
        } else {
            isPlayerTurn = true;
            playerMessage.textContent = "Your turn!";
        }

        enemyUsedSpecial = false;
    }

    function getRandomCardValue() {
        return Math.floor(Math.random() * 6) + 1;
    }

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
        if (!isPlayerTurn || playerUsedSpecial) return;

        const cardName = event.dataTransfer.getData('text/plain');
        const card = Array.from(playerSpecialCards.children).find(img => img.alt === cardName);

        if (card) {
            applySpecialCardEffects(cardName);
            card.remove();
        }
    });

    function showSpecialEffect(name, targetElement) {
        const effect = document.createElement('div');
        effect.className = 'special-effect';
        effect.style.left = `${targetElement.offsetLeft}px`;
        effect.style.top = `${targetElement.offsetTop}px`;
        document.body.appendChild(effect);
        setTimeout(() => {
            effect.remove();
        }, 500);
    }

    function hideSpecialEffect(targetElement) {
        // Implementation to remove special effect visuals
        // if they persist after mouse leave
    }
});
