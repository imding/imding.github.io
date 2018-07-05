window.onload = () => {
    var c = new CrosswordChallenge();
    
    // shuffle input array *content.words*
    c.shuffleWords = true;
    
    // highlight correct input real-time
    c.easyMode = true;
    
    // reveal random number of letter in the puzzle
    c.randomLetterFill = true;
    
    // show list of all words in the puzzle
    c.wordBankEnabled = false;
    
    c.content = {
      words: [
        'apple',
        'microsoft',
        'tesla',
        'amazon',
        'oracle',
        'google',
        'netflix',
        'facebook',
      ],
      hints: [
        'an _ a day',
        'small and squishy',
        'electric inventor',
        'large rain forest',
        'visionary sphere',
        '_ it!',
        '_ and chill',
        'add me as a friend',
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