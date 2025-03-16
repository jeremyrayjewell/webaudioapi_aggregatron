// algorithmsOn.js

/**
 * 1) Linear Search (O(n))
 *    Iterates through the array, comparing each element until we find the target
 *    (in this example, we'll choose the last frequency as the target).
 */
export function getLinearSearchData(scale) {
    let notes = [];
    let steps = [];
  
    if (scale.length === 0) {
      // Edge case: empty scale
      steps.push("LinearSearch: Scale is empty, nothing to search.");
      return { notes, steps };
    }
  
    // Let's define the "target" as the last frequency in the scale
    const target = scale[scale.length - 1];
  
    for (let i = 0; i < scale.length; i++) {
      const freq = scale[i];
      // For visualization
      steps.push(`LinearSearch: i=${i}, freq=${freq.toFixed(2)}`);
  
      // For audio
      notes.push(freq);
  
      if (freq === target) {
        steps.push(`Found target freq=${target.toFixed(2)} at index=${i}`);
        break; // stop once found
      }
    }
  
    return { notes, steps };
  }
  
  /**
   * 2) Sum of Elements (O(n))
   *    Iterates once over the array, summing each element.
   */
  export function getSumOfElementsData(scale) {
    let notes = [];
    let steps = [];
  
    let sum = 0;
    for (let i = 0; i < scale.length; i++) {
      const freq = scale[i];
      sum += freq;
  
      // Show each addition step
      steps.push(
        `Summation: i=${i}, freq=${freq.toFixed(2)}, runningSum=${sum.toFixed(2)}`
      );
  
      // Optionally play each element as we add it
      notes.push(freq);
    }
  
    steps.push(`Final sum = ${sum.toFixed(2)}`);
    return { notes, steps };
  }
  
  /**
   * 3) Find Maximum (O(n))
   *    Iterates once over the array to find the max value.
   */
  export function getFindMaxData(scale) {
    let notes = [];
    let steps = [];
  
    if (scale.length === 0) {
      steps.push("FindMax: Scale is empty, no maximum.");
      return { notes, steps };
    }
  
    let maxVal = scale[0];
    steps.push(`Initialize maxVal=${maxVal.toFixed(2)}`);
  
    // We start checking from index 1
    for (let i = 1; i < scale.length; i++) {
      const current = scale[i];
      steps.push(
        `Compare maxVal=${maxVal.toFixed(2)} with scale[${i}]=${current.toFixed(2)}`
      );
  
      // For audio: play each compared element
      notes.push(current);
  
      if (current > maxVal) {
        maxVal = current;
        steps.push(`New max => ${maxVal.toFixed(2)}`);
      }
    }
  
    steps.push(`Maximum is ${maxVal.toFixed(2)}`);
    return { notes, steps };
  }
  
  /**
   * 4) Count Occurrences (O(n))
   *    Choose a target (for example, the *first* frequency in the scale)
   *    and count how many times it appears.
   */
  export function getCountOccurrencesData(scale) {
    let notes = [];
    let steps = [];
  
    if (scale.length === 0) {
      steps.push("CountOccurrences: Scale is empty, no elements to count.");
      return { notes, steps };
    }
  
    // Let's pick the first frequency as the "target"
    const target = scale[0];
    let count = 0;
  
    for (let i = 0; i < scale.length; i++) {
      const current = scale[i];
      steps.push(`CountOccurrences: i=${i}, freq=${current.toFixed(2)}`);
  
      // For audio: play each element we check
      notes.push(current);
  
      if (current === target) {
        count++;
        steps.push(`Match found => count=${count}`);
      }
    }
  
    steps.push(
      `Total occurrences of ${target.toFixed(2)} => ${count}`
    );
    return { notes, steps };
  }
  