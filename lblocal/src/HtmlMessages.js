// The function genarates messages for HTML only
function generateMessages(types) {
  let message;

  switch (types) {
    case 'mismatchedTag': message = {
        // Expected ${expected tag} after ${prev tag} but found ${value tag}.
      message: (...param) => `Expected ${param[0]} after ${param[1]} but found ${param[2]}.`
    };
      break;

    case 'tagWithoutPrev': message = {
        // Expected ${expected tag} but found ${value tag}.
      message: (...param) => `Expected ${param[0]} but found ${param[1]}.`
    };
      break;

    case 'attrValueDiff': message = {
        // Expected attribute "${expt attribute name}" value to ${message}.
      message: (...param) => `Expected attribute "${param[0]}" value to ${param[1]}.`
    };
      break;

    case 'mismatchedAttr': message = {
        // Failed to find attribute ${expected attribute} in tag ${expected Tag}.
      message: (...param) => `Failed to find attribute "${param[0]}" in tag ${param[1]}.`
    };
      break;

    case 'mismatchedTextType': message = {
        // Expected ${expected type} inside tag ${prev tag} but found ${value tag}.
      message: (...param) => `Expected ${param[0]} inside ${param[1]} but found ${param[2]}.`
    };
      break;

    case 'failedFind': message = {
        // Failed to find ${expected tag} after ${prev tag} ${parent node if there is}.
      message: (...param) => `Failed to find ${param[0]} after ${param[1]} ${param[2] ? 'in tag ' + param[2]: ''}.`
    };
      break;

    case 'mismatchedContent': message = {
        // Expected content in ${expected tag} to ${message}.
      message: (...param) => `Expected content in ${param[0]} to ${param[1]}.`
    };
      break;

    case 'emptyLearnerCode': message = {
      message: (...param) => `Expected ${param[0]} but found nothing.`
    };
      break;

    case 'unexptAttr': message = {
      message: (...param) => `Unexpected attribute "${param[0]}" in ${param[1]}`
    };
      break;

    case 'unexptTag': message = {
      message: (...param) => `Unexpected ${param[0]}`
    };
      break;

    case 'unexptText': message = {
      message: (...param) => `Unexpected text "${param[0]}"`
    };
      break;

    default: message = {
      message: (...param) => 'Something went wrong.'
    };
      break;
  }

  return message;
}

export default generateMessages;