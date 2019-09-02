declare module "*.png" {
    const content: string;
    export default content;
}

interface Tab extends HTMLElement {
    name: string,
    type: string,
    fullName: string
}

interface Step {
    
}

interface StepList {

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
    'steps': StepJson | {}
}


interface StepJson {
    [stepID: string]: {
        'title': string,
        'type': 'code' | 'interactive' | 'text',
        'content': {
            'instructions': string,
            'startTab': string
        },
        'deleted': boolean,
        'stepId': string,
        'majorRevision': number,
        'minorRevision': number,
        'orderNo': number,
        'refMissionUuid': null,
        'files': FileJson | {},
        'tests': TestJson | {}
    }
}

interface FileJson {
    [fileName: string]: {
        'contents': string,
        'mode': string,
        'answers': Array<string>
    }
}

interface TestJson {
    [testID: string]: {
        'title': string,
        'stepId': string,
        'testId': string,
        'orderNo': number,
        'testFunction': string,
        'failureMessage': string
    }
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
        'startTab'?: string
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