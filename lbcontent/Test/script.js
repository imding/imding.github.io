var expLogs = [{
    name: 'Living plant',
    hypothesis: 'Plants need water and sunlight to live',
    toggle: ['yes'],
    variable: 'time of day; number times the plats gets watered',
    method: 'I will leave a plant in the sun and water it twice a day for a week, and then put it in the shade and water it only once every 3 days, I will also take a photo of the plant each day and compare them.',
    conclusion: 'Through this experiment I learned that the plan is more healthy in the first week.',
    id: 1,
}];
var currentLogID = 0;
var passThisStep = false;

// Set up Framework7
var app = new Framework7({
    // App root element
    root: '#app',
    // App Name
    name: 'Science Experimental Log',
    // App id
    id: 'education.bsd.sciencelog',
    // Theme: 'ios' for iOS, 'md' for Android (Material)
    theme: 'md',
    // Add default routes
    routes: [
        {
            path: '/newexperiment/',
            content: `
                <!-- Other Page, "data-name" contains page name -->
                <div data-name="newexp" class="page">
                    <!-- Top Navbar -->
                    <div class="navbar">
                        <div class="navbar-inner">
                            <div class="title">New Experimental Log</div>
                        </div>
                    </div>
                    <!-- Scrollable page content -->
                    <div class="page-content">
                        <form class="list" id="my-form">
                            <ul>
                                <li>
                                    <div class="item-content item-input">
                                        <div class="item-inner">
                                            <div class="item-title item-label">Experimental Name</div>
                                            <div class="item-input-wrap">
                                                <input type="text" name="name" placeholder="What do you want to find out?" />
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="item-content item-input">
                                        <div class="item-inner">
                                            <div class="item-title item-label">
                                                Hypothesis
                                                <span class="float-right">
                                                    Were you right?
                                                    <label class="checkbox">
                                                        <input type="checkbox" name="toggle">
                                                        <i class="icon icon-checkbox"></i>
                                                    </label>
                                                </span>
                                            </div>
                                            <div class="item-input-wrap">
                                                <textarea name="hypothesis" placeholder="What is your hypothesis?"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="item-content item-input">
                                        <div class="item-inner">
                                            <div class="item-title item-label">Variables</div>
                                            <div class="item-input-wrap">
                                                <textarea name="variable" placeholder="What could you change?"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="item-content item-input">
                                        <div class="item-inner">
                                            <div class="item-title item-label">Method</div>
                                            <div class="item-input-wrap">
                                                <textarea name="method" placeholder="How do you plan to carry out the experiment?"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="item-content item-input">
                                        <div class="item-inner">
                                            <div class="item-title item-label">Conclusion</div>
                                            <div class="item-input-wrap">
                                                <textarea name="conclusion" placeholder="What did you learn from this experiment?"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </form>
                        <div class="block">
                            <div class="row">
                                <a href="#" id="saveExp" class="col button button-raised button-fill button-round back">Save Experiment</a>
                                <a href="#" class="col button button-raised button-outline button-round back" >Back</a>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        {
            path: '/log/:id',
            content: `
                <!-- Other Page, "data-name" contains page name -->
                <div data-name="viewexp" class="page">
                    <!-- Top Navbar -->
                    <div class="navbar">
                        <div class="navbar-inner">
                            <div class="title">View Experiment Log</div>
                        </div>
                    </div>
                    <!-- Scrollable page content -->
                    <div class="page-content">
                        <form class="list" id="my-form">
                            <ul>
                                <li>
                                    <div class="item-content item-input">
                                        <div class="item-inner">
                                            <div class="item-title item-label">Experimental Name</div>
                                            <div class="item-input-wrap">
                                                <input type="text" id="logName" name="name" placeholder="What do you want to find out?">
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="item-content item-input">
                                        <div class="item-inner">
                                            <div class="item-title item-label">
                                                Hypothesis
                                                <span class="float-right">
                                                    Were you right?
                                                    <label class="checkbox">
                                                        <input id="logResult" type="checkbox" name="toggle" value="yes">
                                                        <i class="toggle-icon"></i>
                                                    </label>
                                                </span>
                                            </div>
                                            <div class="item-input-wrap">
                                                <textarea id="logHypothesis" name="hypothesis" placeholder="What are your hypothesis?"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="item-content item-input">
                                        <div class="item-inner">
                                            <div class="item-title item-label">Variables</div>
                                            <div class="item-input-wrap">
                                                <textarea id="logVariable" name="variable" placeholder="What could you change?"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="item-content item-input">
                                        <div class="item-inner">
                                            <div class="item-title item-label">Method</div>
                                            <div class="item-input-wrap">
                                                <textarea id="logMethod" name="method" placeholder="How do you plan to carry out the experiment?"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="item-content item-input">
                                        <div class="item-inner">
                                            <div class="item-title item-label">Conclusion</div>
                                            <div class="item-input-wrap">
                                                <textarea id="logConclusion" name="conclusion" placeholder="Describe your project..."></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </form>
                        <div class="block">
                            <a href="#" class="col button button-large button-raised button-outline button-round back" >Back</a>
                        </div>
                    </div>
                </div>
            `,
            on: {
                pageBeforeIn: function (event, page) {
                    // do something before page gets into the view
                    //console.log(page.route.params.id);
                    currentLogID = page.route.params.id;
                    var log = expLogs[currentLogID - 1];
                    
                    // initial value
                    document.getElementById('logName').value = log.name;
                    document.getElementById('logHypothesis').innerHTML = log.hypothesis;
                    document.getElementById('logVariable').innerHTML = log.variable;
                    document.getElementById('logMethod').innerHTML = log.method;
                    document.getElementById('logConclusion').innerHTML = log.conclusion;
                    if (log.toggle.length > 0) {
                        document.getElementById('logResult').checked = true;
                    }

                    // update log on input change
                    document.getElementById('logName').addEventListener('input', updateName);
                    document.getElementById('logHypothesis').addEventListener('input', updateHypothesis);
                    document.getElementById('logMethod').addEventListener('input', updateMethod);
                    document.getElementById('logVariable').addEventListener('input', updateVariable);
                    document.getElementById('logResult').addEventListener('change', updateResult);
                    document.getElementById('logConclusion').addEventListener('input', updateConclusion);
                },
            }
        },
    ],
});


function updateName() {
    var log = expLogs[currentLogID - 1];
    log.name = this.value;
}

function updateHypothesis() {
    var log = expLogs[currentLogID - 1];
    log.hypothesis = this.value;
}

function updateVariable() {
    var log = expLogs[currentLogID - 1];
    log.variable = this.value;
}

function updateMethod() {
    var log = expLogs[currentLogID - 1];
    log.method = this.value;
}

function updateResult() {
    var log = expLogs[currentLogID - 1];
    if (document.getElementById('logResult').checked) {
        log.toggle = ['yes'];
    }
    else {
        log.toggle = [];
    }
}

function updateConclusion() {
    var log = expLogs[currentLogID - 1];
    log.conclusion = this.value;
}

var $$ = Dom7;

app.on('pageInit', function(page) {
    if (page.name == 'home') {
        displayExperimentalLog();
    }
});

app.on('pageAfterIn', function(page) {
    if (page.name == 'home') {
        displayExperimentalLog();
    }
    else if (page.name == 'newexp') {
        $$('#saveExp').on('click', getFormData);
    }
});


// Initialize the app by adding the main view:
var mainView = app.views.create('.view-main');

function getFormData() {
    var formData = app.form.convertToData('#my-form');
    
    formData.id = expLogs.length + 1;
    expLogs.push(formData);
  
    passThisStep = true;
}


function displayExperimentalLog() {
    // clear previous list
    document.getElementById('log-list').innerHTML = '';

    // loop through every log and append it to #log-list
    expLogs.map(log => {
        var logLi = document.createElement('li');
        var anchorLink = document.createElement('a');
        anchorLink.className = 'item-link item-content';
        anchorLink.href = '/log/' + log.id;
        logLi.appendChild(anchorLink);

        var itemInnerDiv = document.createElement('div');
        itemInnerDiv.className = 'item-inner';
        anchorLink.appendChild(itemInnerDiv);

        var itemTitleRowDiv = document.createElement('div');
        itemTitleRowDiv.className = 'item-title-row';
        itemInnerDiv.appendChild(itemTitleRowDiv);

        var itemTitleDiv = document.createElement('div');
        itemTitleDiv.className = 'item-title';
        itemTitleDiv.innerHTML = log.name;
        itemTitleRowDiv.appendChild(itemTitleDiv);

        var itemAfterDiv = document.createElement('div');
        itemAfterDiv.className = 'item-after';
        itemAfterDiv.innerHTML = log.toggle.length > 0 ? 'Success' : 'Fail';
        itemTitleRowDiv.appendChild(itemAfterDiv);

        var itemSubtitleDiv = document.createElement('div');
        itemSubtitleDiv.className = 'item-subtitle';
        itemSubtitleDiv.innerHTML = log.variable;
        itemInnerDiv.appendChild(itemSubtitleDiv);

        var itemTextDiv = document.createElement('div');
        itemTextDiv.className = 'item-text';
        itemTextDiv.innerHTML = log.conclusion;
        itemInnerDiv.appendChild(itemTextDiv);

        document.getElementById('log-list').appendChild(logLi);
    });
}