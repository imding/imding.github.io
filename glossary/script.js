var challengeEvent = (function() {
    function challengeEvent() {
        this.handlers = [];
    }

    challengeEvent.prototype.on = function(eventName, handler) {
        switch (eventName) {
            case 'pass':
                return this.handlers.push(handler);
        }
    };

    challengeEvent.prototype.dispatch = function() {
        this.handlers.forEach(h => setTimeout(h, 0));
    };

    return challengeEvent;
})();

function createChallenge(detail) {
    const obj = {
        wrapper: document.createElement('div'),
        title: document.createElement('h1'),
        head: document.createElement('p'),
        body: document.createElement('div'),
        type: detail.type,
        start,
        event: new challengeEvent(),
    };

    const
        noType = !detail.type || !detail.type.trim(),
        noTitle = !detail.title || !detail.title.trim(),
        noHead = !detail.head || !detail.head.trim();
    
    if (noType || noTitle || noHead) {
        obj.error = new Error(`Please define the challenge ${noType ? 'type' : noTitle ? 'title' : 'head'}.`);
    }
    
    obj.title.textContent = detail.title;
    obj.head.textContent = detail.head;

    let feedback = '';

    switch (detail.type.toLowerCase()) {
        case 'multiple-choice':
            const inputType = (Array.isArray(detail.answer) && detail.answer.length > 1) ? 'checkbox' : 'radio';

            obj.choices = [];
            detail.choices.forEach((c, i) => {
                const
                    wrapper = document.createElement('div'),
                    input = document.createElement('input'),
                    label = document.createElement('div');
                
                input.type = inputType;
                input.name = 'choices';
                input.onclick = () => {
                    const choiceWrapper = Array.from(obj.body.childNodes).filter(e => e.tagName === 'DIV');
                    choiceWrapper.forEach(e => style([e], {border: '1px solid rgba(0, 0, 0, 0)'}));
                    submit.textContent = 'Submit Answer';
                    submit.disabled = false;
                }
                
                label.innerHTML = c;
                label.onclick = () => input.click();
                
                style([input, label], {
                    display: 'inline-block',
                    user_select: 'none',
                    cursor: 'pointer',
                });
                
                style([wrapper], {
                    margin_top: '5px',
                    border_radius: '10px',
                    border: '1px solid rgba(0, 0, 0, 0)',
                });

                wrapper.appendChild(input);
                wrapper.appendChild(label);
                obj.body.appendChild(wrapper);

                // add submit button after last item in detail.choices
                if (i === detail.choices.length - 1) {
                    const submit = document.createElement('button');
                    submit.id = 'submit';
                    submit.textContent = 'Submit Answer';
                    submit.onclick = function() {
                        const
                            inputElements = Array.from(document.getElementsByName('choices')),
                            userAnswer = inputElements.filter(e => e.checked);

                        if (userAnswer.length !== detail.answer.length) {
                            this.textContent = `You picked too ${userAnswer.length > detail.answer.length ? 'many' : 'few'}. Please try again.`;
                            this.disabled = true;
                            return null;
                        }

                        userAnswer.forEach((ua, i) => {
                            const
                                _i = inputElements.indexOf(ua),
                                m1 = detail.answer[i] === _i,
                                m2 = detail.answer.includes(_i);
                            
                            if (m1 || m2) return;
                            this.textContent = 'Almost there. Please try again.';
                            this.disabled = true;
                            style([obj.body.childNodes[_i]], {border: '1px solid indianred'});
                        });

                        if (!this.disabled) obj.event.dispatch();
                    };
                    obj.body.appendChild(document.createElement('hr'));
                    obj.body.appendChild(submit);
                }
            });
            break;
        case 'speed-type':
            break;
        default: obj.error = new Error(`${obj.type} is not a valid challenge type.`);
    }

    function log(msg) {
        obj.feedback = msg;
        console.log(obj.feedback);
    }

    function start() {
        if (obj.error) throw obj.error;
        obj.wrapper.appendChild(obj.title);
        obj.wrapper.appendChild(obj.head);
        obj.wrapper.appendChild(obj.body);
        document.body.appendChild(obj.wrapper);
    };

    return Object.freeze(obj);
}

function style(elemArray, declarations) {
    Object.keys(declarations).forEach(d => {
        elemArray.forEach(e => {
            e.style[d.replace(/_/g, '-')] = declarations[d];
        });
    });
}

function addChallenge() {
    const ch1 = createChallenge({
        type: 'multiple-choice',
        title: 'challenge 1',
        head: 'choose the correct answer:',
        choices: [
            '<p>choice 1</p>',
            '<p>choice 2</p>',
            '<p>choice 3</p>',
            '<p>choice 4</p>',
            '<p>choice 5</p>',
        ],
        answer: [1, 2],
    });

    const ch2 = createChallenge({
        type: 'speed-type',
    });

    ch1.start();
    ch1.event.on('pass', () => {
        
    })
}

window.onload = addChallenge;