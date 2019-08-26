
import { uuidv4 } from '../utils/Handy';

export function newStepJson(override) {
    return Object.assign({
        'title': 'Untitled',
        'type': 'code',
        'content': {
            'instructions': '',
            'startTab': 'index.html'
        },
        'deleted': false,
        'stepId': (Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - 1)) + 1).toString(),
        'majorRevision': 1,
        'minorRevision': 0,
        'orderNo': 0,
        'refMissionUuid': null,
        'files': {},
        'tests': {}
    }, override);
}

export function userDetails() {
    return {
        'aun': {
            'name': 'Pongsit Kittisoranun',
            'id': 'e1c2751b-1e62-40f7-9b26-2dea77ee9332',
            'email': 'pk@bsd.education',
        },
        'siuling': {

            'id': '1315b022-3715-4e54-aa31-e917c53fb0be',
            'name': 'Siuling Ding',
            'email': 'sd@bsd.education',
        }
    };
}

export function newMissionJson(override) {
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