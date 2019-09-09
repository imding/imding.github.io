
import { uuidv4 } from './Handy';

interface TestConfig {
    name: string,
    type: string,
    stepId: string,
    testId: string,
    orderNo: number,
    editableIndex: number,
    answer: string
}

interface FileConfig {
    contents: string,
    mode:  'new_contents' | 'modify',
    answers: [] | Array<string>
}

export function newTestJson(cfg: TestConfig) {
    const { name, type, stepId, testId, orderNo, editableIndex, answer } = cfg;

    return {
        'title': `On <strong>${type.toUpperCase()} line ##LINE('${name}.${type.toLowerCase()}','KEY')##</strong>, OBJECTIVE.`,
        'stepId': stepId,
        'testId': testId || (Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - 1)) + 1).toString(),
        'orderNo': orderNo,
        'testFunction': `pass.if.${type.toLowerCase()}.editable(${editableIndex}).equivalent(\`${answer}\`);`,
        'failureMessage': ''
    };
}

export function newFileJson(override: FileConfig) {
    return Object.assign({
        'contents': '',
        'mode': 'new_contents',
        'answers': []
    }, override);
}

export function newStepJson(override: StepJsonOverride) {
    return Object.assign({
        'title': 'Untitled',
        'type': 'code',
        'content': {
            'instructions': '',
        },
        'deleted': false,
        'stepId': (Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - 1)) + 1).toString(),
        'majorRevision': 1,
        'minorRevision': 0,
        'orderNo': 0,
        'refMissionUuid': null,
        'files': {},
        'tests': {},
        //  custome properties
        'model': {}
    }, override);
}

export function userDetails() {
    return {
        'aun': {
            'id': 'e1c2751b-1e62-40f7-9b26-2dea77ee9332',
            'name': 'Pongsit Kittisoranun',
            'email': 'pk@bsd.education',
        },
        'siuling': {
            'id': '1315b022-3715-4e54-aa31-e917c53fb0be',
            'name': 'Siuling Ding',
            'email': 'sd@bsd.education',
        }
    };
}

export function newMissionJson(override: MissionJsonOverride) {
    return Object.assign({
        'missionUuid': uuidv4(),
        'settings': {
            'revision': '(1,0)',
            'level': 1,
            'title': 'Untitled',
            'description': '',
            'duration': null,
            'type': 'project',
            'status': 'private',
            'resources': [],
            'searchable': true,
            'recommended': false,
            'tags': [],
            'missionName': 'untitled',
            'majorRevision': 1,
            'minorRevision': 0,
            'changeInfo': '',
            'objectivesVersion': 2,
            'authorName': '',
            'authorId': '',
            'ownerId': '',
            'ownerName': '',
            'ownerEmail': '',
            'lastModified': '',
            'atEnd': 'export',
            'cardImage': '/resources/project cards/project_placeholder.png',
            'cardLinks': [],
            'webOutput': true,
            'mobileView': {
                'mobileViewEnabled': false
            },
            'bodyLocking': false,
            'consoleType': null,
            'codeUnlocked': false,
            'missionVideo': '',
            'sandboxDefault': false,
            'serialControls': false,
            'imageUploadOnHtml': false
        },
        'steps': {}
    }, override);
}