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
        'condition',
      ],
      hints: [
        'you store information in a ___',
        'things inside speech marks',
        'quanity or amount',
        '1 and 0',
        'list of many things',
        'something you can see and touch',
        'write it once, do it many times',
        'if (you are happy) {clap your hands}',
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