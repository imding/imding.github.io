class SortingChallenge extends Challenge {
    constructor() {
        super();
        
        this.config = {
            parent: document.body,
            targets: [],
            decoys: [],
            shuffle: false,
            speed: 1,
            levels: 1,
            interval: 0,
            inputFont: 'Monospace',
            blockFont: 'Monospace',
            bannerFont: 'Arial',
            objective: 'Type the falling words EXACTLY as it\'s shown.',
            praise: 'Well done! You scored #SCORE#/#TOTAL# points in #TIME#.',
        };
    }
}