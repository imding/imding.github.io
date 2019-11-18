declare module "*.png" {
    const content: string;
    export default content;
}

type SingleType = 'code' | 'interactive' | 'text';
type SingleMode = 'new_contents' | 'modify' | 'no_change';

interface DiffEditorConfig {
    tab?: Tab,
    onFail?: () => any,
    onSuccess?: () => any,
}

interface StepType {
    code: 'code',
    interactive: 'interactive',
    text: 'text'
}

interface FileMode {
    newContents: 'new_contents',
    modify: 'modify',
    noChange: 'no_change'
}

interface Tab extends HTMLElement {
    name: string,
    type: string,
}

interface MissionJson {
    'missionUuid': string,
    'settings': {
        'revision': string,
        'level': number,
        'title': string,
        'description': string,
        'duration': null,
        'type': 'project',
        'status': 'private' | 'exclusive',
        'resources': Array<string>,
        'searchable': boolean,
        'recommended': boolean,
        'tags': Array<string>,
        'missionName': string,
        'majorRevision': number,
        'minorRevision': number,
        'changeInfo': string,
        'objectivesVersion': number,
        'authorName': string,
        'authorId': string,
        'ownerId': string,
        'ownerName': string,
        'ownerEmail': string,
        'lastModified': string,
        'atEnd': 'export',
        'cardImage': string,
        'cardLinks': Array<string>,
        'webOutput': boolean,
        'mobileView': {
            'mobileViewEnabled': boolean
        },
        'bodyLocking': boolean,
        'consoleType': null,
        'codeUnlocked': boolean,
        'missionVideo': string,
        'sandboxDefault': boolean,
        'serialControls': boolean,
        'imageUploadOnHtml': boolean
    },
    'steps': StepJsonWithID | {}
}

interface StepJsonWithID {
    [stepID: string]: StepJson
}

interface StepJson {
    'title': string,
    'type': 'code' | 'interactive' | 'text',
    'content': {
        'instructions': string,
    },
    'deleted': boolean,
    'stepId': string,
    'majorRevision': number,
    'minorRevision': number,
    'orderNo': number,
    'refMissionUuid': null,
    'files': FileJson | {},
    'tests': TestJsonWithID | {},
    // custom properties
    'model': {},
}

interface FileJson {
    [fileName: string]: {
        'contents': string,
        'mode': 'new_contents' | 'modify',
        'answers': Array<string>,
        //  custom properties
        'transformedContents': string
    }
}

interface TestJsonWithID {
    [testID: string]: TestJson
}

interface TestJson {
    'title': string,
    'stepId': string,
    'testId': string,
    'orderNo': number,
    'testFunction': string,
    'failureMessage': string
}

interface MissionJsonOverride {
    'missionUuid'?: string,
    'settings'?: {
        'revision'?: string,
        'level'?: number,
        'title'?: string,
        'description'?: string,
        'duration'?: null,
        'type'?: 'project',
        'status'?: 'private' | 'exclusive',
        'resources'?: Array<string>,
        'searchable'?: boolean,
        'recommended'?: boolean,
        'tags'?: Array<string>,
        'missionName'?: string,
        'majorRevision'?: number,
        'minorRevision'?: number,
        'changeInfo'?: string,
        'objectivesVersion'?: number,
        'authorName'?: string,
        'authorId'?: string,
        'ownerId'?: string,
        'ownerName'?: string,
        'ownerEmail'?: string,
        'lastModified'?: string,
        'atEnd'?: 'export',
        'cardImage'?: string,
        'cardLinks'?: Array<string>,
        'webOutput'?: boolean,
        'mobileView'?: {
            'mobileViewEnabled'?: boolean
        },
        'bodyLocking'?: boolean,
        'consoleType'?: null,
        'codeUnlocked'?: boolean,
        'missionVideo'?: string,
        'sandboxDefault'?: boolean,
        'serialControls'?: boolean,
        'imageUploadOnHtml'?: boolean
    },
    'steps'?: StepJson | {}
}

interface StepJsonOverride {
    'title'?: string,
    'type'?: 'code' | 'interactive' | 'text',
    'content'?: {
        'instructions'?: string,
        'startTab'?: string,
        'text'?: string,
    },
    'deleted'?: boolean,
    'stepId'?: string,
    'majorRevision'?: number,
    'minorRevision'?: number,
    'orderNo'?: number,
    'refMissionUuid'?: null,
    'files'?: FileJson | {},
    'tests'?: TestJson | {}
}