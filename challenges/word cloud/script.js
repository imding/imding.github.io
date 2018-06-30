let c;
window.onload = () => {
    c = new CloudMatchChallenge(ChallengeType.SequentialSelect);
    c.set().content = ['Triassic', 'Jurassic', 'Cretaceous'];
    c.set().prompt = 'select dinosaur era in historic order';
  
    //   var c = new CloudMatchChallenge(ChallengeType.GroupSelect);
    //   c.set().categoryContent = [
    //     ['hurricane', 'tsumanic', 'earthquake', 'landslide'],
    //     ['river', 'mountain', 'ocean', 'volcano'],
    //     ['ulannbaator', 'timbaktu', 'madagascar', 'tokyo'],
    //   ];
    //   c.set().cardsInOrder = false;
    //   c.set().prompts = [
    //     'natrual disaster',
    //     'geographical feature',
    //     'location',
    //   ];
  
    //   var c = new CloudMatchChallenge(ChallengeType.PairMatch);
    //   c.set().pairs = [
    //     ['copper', 'bronze'],
    //     ['zinc', 'brass'],
    //     ['iron', 'steel'],
    //     ['gold', 'electrum'],
    //   ];
    //   c.set().prompt = 'match element & alloy';
  
  
    //   var c = new CloudMatchChallenge(ChallengeType.SingleGroupSelect);
    //   c.set().selectableGroup = ['bird', 'man', 'mall', 'burger', 'beard', 'failure', 'chair'];
    //   c.set().decoyGroup = ['red', 'hurriedly', 'spitting', 'fought', 'them'];
    //   c.set().prompt = 'find the nouns';
  
    c.set().winMessage = 'well done, congrats!';
    c.start();
  };