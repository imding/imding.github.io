window.onload = () => {
    var c = new CrosswordChallenge();
    
    // shuffle input array *content.words*
    c.shuffleWords = true;
    
    // highlight correct input real-time
    c.easyMode = true;
    
    // reveal random number of letter in the puzzle
    c.randomLetterFill = false;
    
    // show list of all words in the puzzle
    c.wordBankEnabled = false;
    
    c.content = {
      words: [
        'variable',
        'string',
        'number',
        'boolean',
        'array',
        'object',
        'function',
        'conditional',
        'framerate',
      ],
      hints: [
        'memory of the computer',
        'things inside speech marks',
        'you can count on it',
        'yes and no',
        'list of many things',
        'person.name',
        'write it once, do it many times',
        'ask the computer a question',
        'fps',
      ],
    };
    
    c.start();
  };
  
  
  // ====================== //
  // ==== improvements ==== //
  // ====================== //
  
  // var c = new Challenge();
  // c.options.showOptions;
  // c.content.guide;
  
  // challengeType: [type1, type2]
  // categoryContent[type1 only]: 2d array