export function getAccessElementData(scale, numNotes) {
  let notes = [];
  let steps = [];

  if (scale.length === 0) {
    steps.push("AccessElement: Scale is empty, no elements to access.");
    return { notes, steps };
  }

  for (let i = 0; i < numNotes; i++) {
    const index = Math.floor(Math.random() * scale.length);
    const element = scale[index];
    steps.push(`AccessElement: Randomly accessed element at index ${index} is ${element.toFixed(2)} Hz`);
    notes.push(element);
  }

  return { notes, steps };
}

/**
 * 2) Check Even/Odd (O(1))
 *    Checks if a randomly selected element in the array is even or odd.
 */
export function getCheckEvenOddData(scale, numNotes, selectEven) {
  let notes = [];
  let steps = [];

  if (scale.length === 0) {
    steps.push("CheckEvenOdd: Scale is empty, no elements to check.");
    return { notes, steps };
  }

  for (let i = 0; i < numNotes; i++) {
    const index = Math.floor(Math.random() * scale.length);
    const element = scale[index];
    const isEven = element % 2 === 0;
    const matchesCriteria = (selectEven && isEven) || (!selectEven && !isEven);

    if (matchesCriteria) {
      steps.push(`CheckEvenOdd: Randomly selected element at index ${index} is ${element.toFixed(2)} Hz and is ${isEven ? "even" : "odd"}`);
      notes.push(element);
    } else {
      steps.push(`CheckEvenOdd: Randomly selected element at index ${index} is ${element.toFixed(2)} Hz and is ${isEven ? "even" : "odd"} - Silent rest added`);
      notes.push(null); // Representing silent rest with null
    }
  }

  return { notes, steps };
}

/**
 * 3) Return First Element (O(1))
 *    Returns the first element of the array.
 */
export function getFirstElementData(scale) {
  let notes = [];
  let steps = [];

  if (scale.length === 0) {
    steps.push("FirstElement: Scale is empty, no elements to return.");
    return { notes, steps };
  }

  const element = scale[0];
  steps.push(`FirstElement: The first element is ${element.toFixed(2)} Hz`);
  notes.push(element);

  return { notes, steps };
}