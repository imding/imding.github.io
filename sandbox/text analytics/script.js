let lexWords, lexSentences, activeLex, activeSort;

function parseWords() {
    const wordCards = [];
    const words = targetText.value
                    /* split text into array of words */
                    .split(/[^\w\d]+/)
                    /* remove empty words */
                    .filter(w => w.trim().length)
                    /* convert words to lowercase and trim spaces */
                    .map(w => w.toLowerCase().trim());
    const wordCount = words.length;
    
    // iterate through words array
    while (words.length) {
        // remove the first item in words array and store it in word
        const word = words.shift();
        // create a word card
        const card = document.createElement('div');
    
        card.count = 1;
        card.className = 'card';
        card.style.backgroundColor = `rgb(${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)})`;
        
        // if the words array includes more of the same word
        if (words.includes(word)) {
            let indexArray = [];
            
            // store positions in words array where word is found
            for (let i in words) {
                if (word == words[i]) {
                    indexArray.unshift(i);
                    card.count++;
                }
            }
            // remove items at those position
            for (let i of indexArray) {
                words.splice(i, 1);
            }
        }
        
        card.innerHTML = `${word}<span class='circle'>${card.count}</span>`;
        wordCards.push(card);
    }

    return {
        cards: wordCards,
        count: wordCount,
    };
}

function parseSentences() {
    const sentenceCards = [];
    const sentences = targetText.value.split(/[.?!]/).filter(s => s.trim().length).map(w => w.toLowerCase().trim());
    const sentenceCount = sentences.length;
    
    while (sentences.length) {
        const sentence = sentences.shift();
        const card = document.createElement('div');
    
        card.count = 1;
        card.className = 'card';
        
        if (sentences.includes(sentence)) {
            let indexArray = [];
            
            for (let i in sentences) {
                if (sentence == sentences[i]) {
                    indexArray.unshift(i);
                    card.count++;
                }
            }
            for (let i of indexArray) {
                sentences.splice(i, 1);
            }
        }
        
        card.innerHTML = `${sentence}<span class='circle'>${card.count}</span>`;
        sentenceCards.push(card);
    }

    return {
        cards: sentenceCards,
        count: sentenceCount,
    };
}

function updateCards(lex) {
    clearCards();
    lex.cards.forEach(card => cardHolder.appendChild(card));
    activeLex = lex;
}

function reverseCards() {
    activeLex.cards.reverse();
    updateCards(activeLex);
}

function clearCards() {
    while (cardHolder.children.length) {
        cardHolder.removeChild(cardHolder.children[0]);
    }
}

function sortCards(method) {
    activeLex.cards.sort(method);
    updateCards(activeLex);
}

window.onload = () => {
    lexWords = parseWords();
    lexSentences = parseSentences();

    viewWords.textContent = `${lexWords.count} Words`;
    viewSentences.textContent = `${lexSentences.count} Sentences`;
    
    viewWords.onclick = () => updateCards(lexWords);
    viewSentences.onclick = () => updateCards(lexSentences);

    sortAlphabet.onclick = () => {
        if (activeSort != 'alphabet') {
            activeSort = 'alphabet';
            sortCards((a, b) => {
                a = a.childNodes[0].data;
                b = b.childNodes[0].data;
    
                return a < b ? -1 : a > b ? 1 : 0;
            });
        }
        else reverseCards();
    };

    sortLength.onclick = () => {
        if (activeSort != 'length') {
            activeSort = 'length';
            sortCards((a, b) => {
                a = a.childNodes[0].data.length;
                b = b.childNodes[0].data.length;
    
                return a < b ? -1 : a > b ? 1 : 0;
            });
        }
        else reverseCards();
    };

    sortFrequency.onclick = () => {
        if (activeSort != 'frequency') {
            activeSort = 'frequency';
            sortCards((a, b) => {
                a = Number(a.childNodes[1].textContent);
                b = Number(b.childNodes[1].textContent);
    
                return a < b ? -1 : a > b ? 1 : 0;
            });
        }
        else reverseCards();
    };
    
    cardHolder.style.height = `${window.innerHeight - 10 - cardHolder.offsetTop}px`;
};