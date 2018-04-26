const alice = `Alice sits drowsily by a riverbank, bored by the book her older sister reads to her. Out of nowhere, a White Rabbit runs past her, fretting that he will be late. The Rabbit pulls a watch out of his waistcoat pocket and runs across the field and down a hole. Alice impulsively follows the Rabbit and tumbles down the deep hole that resembles a well, falling slowly for a long time. As she floats down, she notices that the sides of the well are covered with cupboards and shelves. She plucks a marmalade jar from one of the shelves. The jar is empty, so Alice sets it down on another shelf. With nothing else to do, she speaks aloud to herself, wondering how far she has fallen and if she might fall right through to the other side of the earth. She continues to speak aloud, daydreaming about her cat Dinah. In the midst of imagining a conversation the two of them might have, she abruptly lands. Unhurt, Alice gets up and catches sight of the White Rabbit as he vanishes around a corner.

Alice approaches a long corridor lined by doors. The doors are all locked, so Alice tests them with a key that she finds on a glass table. After searching around, Alice discovers a small door behind a curtain. She tests the key again and finds that it opens up to a passage and a garden. Since the door is much too small for Alice to squeeze through, she ventures back to the table with the hope that she might find something there that would help her. A bottle marked “DRINK ME” sits on the table. Alice drinks the contents of the bottle after inspecting it to be sure it does not contain poison. Alice immediately shrinks, and though she can now fit through the door, she realizes she has left the key on the tabletop high above her. She alternately cries and scolds herself for crying before catching sight of a small cake with the words “EAT ME” underneath the table. Alice eats the cake with the hope that it will change her size, but becomes disappointed when nothing happens.`;

const syllables = x => {
    const subSyl = [
        /cial/,
        /tia/,
        /cius/,
        /cious/,
        /giu/,
        /ion/,
        /iou/,
        /sia$/,
        /.ely$/,
        /sed$/,
    ];

    const addSyl = [
        /ia/,
        /riet/,
        /dien/,
        /iu/,
        /io/,
        /ii/,
        /[aeiouym]bl$/,
        /[aeiou]{3}/,
        /^mc/,
        /ism$/, // -isms
        /([^aeiouy])\1l$/,
        /[^l]lien/,
        /^coa[dglx]./,
        /[^gq]ua[^auieo]/,
        /dnt$/,
    ];

    const xx = x.toLowerCase().replace(/'/g, '').replace(/e\b/g, '');
    const scrugg = xx.split(/[^aeiouy]+/).filter(Boolean); // '-' should be perhaps added?

    return (undefined === x || null === x || '' === x) ? 0 :
        (1 === xx.length) ? 1 :
            subSyl.map(r => (xx.match(r) || []).length).reduce((a, b) => a - b) +
            addSyl.map(r => (xx.match(r) || []).length).reduce((a, b) => a + b) +
            scrugg.length - ((scrugg.length > 0 && '' === scrugg[0]) ? 1 : 0) +
            xx.split(/\b/).map(x => x.trim()).filter(Boolean).filter(x => !x.match(/[.,'!?]/g)).map(x => x.match(/[aeiouy]/) ? 0 : 1).reduce((a, b) => a + b);

};

const words = x => (x.split(/\s+/) || ['']).length;
const sentences = x => (x.split('. ') || ['']).length;
const syllablesPerWord = x => syllables(x) / words(x);
const wordsPerSentence = x => words(x) / sentences(x);

// const rate = x => 206.835 - 1.015 * wordsPerSentence(x) - 84.6 * syllablesPerWord(x);
function grade(x) {
    return 0.39 * wordsPerSentence(x) + 11.8 * syllablesPerWord(x) - 15.59;
}

function rank(n) {
    return n > 0 ?
        n + (/1$/.test(n) && n != 11 ? 'st' : /2$/.test(n) && n != 12 ? 'nd' : /3$/.test(n) && n != 13 ? 'rd' : 'th') :
        n;
}

window.onload = () => {
    text.value = alice;
    submit.onclick = () => {
        const input = text.value.trim();
        info.textContent = input ? `${rank(Math.ceil(Math.max(grade(input), 0)))} Grade` : 'Input is empty.';
    };
};