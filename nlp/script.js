
var suggestions;
var dictionary;

$.get('https://cdn.jsdelivr.net/npm/dictionary-en-us@2.1.1/index.aff', function (affData) {
    $.get('https://cdn.jsdelivr.net/npm/dictionary-en-us@2.1.1/index.dic', function (wordsData) {
        dictionary = new Typo('en_US', affData, wordsData);
        text.addEventListener('input', showSuggestions);
        showSuggestions();
    });
});

function showSuggestions() {
    suggestionList.innerHTML = '';
    suggestions = writeGood(text.innerText);

    suggestions.forEach(suggestion => {
        const item = document.createElement('li');
        item.innerText = suggestion.reason;
        suggestionList.append(item);
    });

    text.innerText.match(/\w+/g).forEach(word => {
        const correct = dictionary.check(word);

        if (correct === false) {
            const suggestion = dictionary.suggest(word);
            const item = document.createElement('li');

            item.innerText = word + ' is incorrect, did you mean: ' + suggestion.join(', ') + '?';
            suggestionList.append(item);
        }
    });
}