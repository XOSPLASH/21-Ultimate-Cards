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
    let enemyScore = getRandomCardValue(); 
    let maxScore = 21;
    let enemyMaxScore = 21;
    let isPlayerTurn = true;
    let playerHasDrawn = false;
    let enemyExtraTurn = false;
    let playerUsedSpecial = false; 
    let enemyUsedSpecial = false; 

    displayAnonymousCard(enemySpecialCards, enemyScore);

    drawCardButton.addEventListener("click", () => {
        if (!isPlayerTurn || playerHasDrawn) return;

        let card = drawCard();
        playerScore += card.value || 0;
        playerCount.textContent = `${playerScore}/${maxScore}`;

        addCardToPlayer(card);

        if (card.type === "special") {
            playerMessage.textContent = `Special card ${card.name} drawn!`;
        }

        playerHasDrawn = true;
        endTurn();
    });

    keepButton.addEventListener("click", () => {
        if (!isPlayerTurn) return;
        endTurn();
    });

    function drawCard() {
        const specialCards = ["plus-two", "max-24", "extra-turn"];
        let isSpecial = Math.random() < 0.2;

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
                    playerScore += 2;
                    playerCount.textContent = `${playerScore}/${maxScore}`;
                    playerMessage.textContent = "Special card +2 activated!";
                    break;
                case "max-24":
                    maxScore = 24;
                    enemyMaxScore = 24;
                    playerCount.textContent = `${playerScore}/${maxScore}`;
                    enemyCount.textContent = `${enemyScore}/${enemyMaxScore}`;
                    playerMessage.textContent = "Special card Max 24 activated!";
                    break;
                case "extra-turn":
                    isPlayerTurn = true;
                    playerMessage.textContent = "Special card Extra Turn activated!";
                    break;
                default:
                    playerMessage.textContent = `Unknown special card ${name} activated!`;
                    break;
            }
        } else {
            enemyUsedSpecial = true;

            switch (name) {
                case "plus-two":
                    enemyScore += 2;
                    enemyCount.textContent = `${enemyScore}/${enemyMaxScore}`;
                    enemyMessage.textContent = "Special card +2 activated!";
                    break;
                case "max-24":
                    maxScore = 24;
                    enemyMaxScore = 24;
                    playerCount.textContent = `${playerScore}/${maxScore}`;
                    enemyCount.textContent = `${enemyScore}/${enemyMaxScore}`;
                    enemyMessage.textContent = "Special card Max 24 activated!";
                    break;
                case "extra-turn":
                    enemyExtraTurn = true;
                    enemyMessage.textContent = "Special card Extra Turn activated!";
                    break;
                default:
                    enemyMessage.textContent = `Unknown special card ${name} activated!`;
                    break;
            }
        }

        showSpecialEffect(name, draggableArea);
    }

    function endTurn() {
        if (isPlayerTurn) {
            isPlayerTurn = false;
            playerHasDrawn = false;
            playerUsedSpecial = false;
            enemyTurn();
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

    function displayAnonymousCard(container, value) {
        let cardImg = document.createElement("img");
        cardImg.src = `anonymous.png`;
        cardImg.alt = `Anonymous Card`;
        cardImg.className = 'card';
        cardImg.dataset.value = value;
        container.appendChild(cardImg);
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
