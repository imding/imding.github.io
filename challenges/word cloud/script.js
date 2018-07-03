let c;
window.onload = () => {
  // c = new CloudMatchChallenge(ChallengeType.SequentialSelect);
  // c.set().content = ['Triassic', 'Jurassic', 'Cretaceous'];
  // c.set().prompt = 'select dinosaur era in historic order';

  // c = new CloudMatchChallenge(ChallengeType.GroupSelect);
  // c.set().cardsInOrder = false;
  // c.set().categoryContent = [
  //   ['hurricane', 'tsumanic', 'earthquake', 'landslide'],
  //   ['river', 'mountain', 'ocean', 'volcano'],
  //   ['ulannbaator', 'timbaktu', 'madagascar', 'tokyo'],
  // ];
  // c.set().prompts = [
  //   'natrual disaster',
  //   'geographical feature',
  //   'location',
  // ];

  // c = new CloudMatchChallenge(ChallengeType.PairMatch);
  // c.set().pairs = [
  //   ['copper', 'bronze'],
  //   ['zinc', 'brass'],
  //   ['iron', 'steel'],
  //   ['gold', 'electrum'],
  // ];
  // c.set().prompt = 'match element & alloy';

  // c = new CloudMatchChallenge(ChallengeType.SingleGroupSelect);
  // c.set().selectableGroup = ['\'hello\'', '"keep calm"', '"$349"', '\'72 days\'', '"!!!"', '3 + \'four\''];
  // c.set().decoyGroup = ['string', 'false', 'var name;', 'words', 'sentences'];
  // c.set().prompt = 'Find the strings!';

  // c = new CloudMatchChallenge(ChallengeType.SingleGroupSelect);
  // c.set().selectableGroup = ['-1', '3.1415', '90 / 12', '3', '12 + 9', '0 * 999', '-99 - 0.78'];
  // c.set().decoyGroup = ['3 + " apples"', 'var number;', 'pi', '1 to 10', 'huge number!'];
  // c.set().prompt = 'Find the numbers!';

  c = new CloudMatchChallenge(ChallengeType.SingleGroupSelect);
  c.set().selectableGroup = ['3 > 3', '9 - 9 >= 0', 'true', 'false', 'true == false', '0 != false', '"three" == 3'];
  c.set().decoyGroup = ['birdsCanFly', 'True', 'False', '0', '1', 'Yes', 'No'];
  c.set().prompt = 'Find the Booleans!';

  c.set().showScore = true;
  c.set().winMessage = 'Well done, you correctly matched everything!';
  c.start();
};