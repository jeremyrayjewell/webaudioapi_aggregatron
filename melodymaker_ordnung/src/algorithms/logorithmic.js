// algorithms.js
import { SCALES } from "../scales.js";


/**
 * 1) Binary Search Data
 */
export function getBinarySearchData(scale, target) {
    let notes = [];
    let steps = [];
    
    let left = 0;
    let right = scale.length - 1;
    let foundIndex = -1; // We'll store the found index here (if any)
  
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
  
      // For demonstration, we record each step and the value checked
      steps.push(`BinarySearch: left=${left}, right=${right}, mid=${mid}`);
      notes.push(scale[mid]);
  
      if (scale[mid] === target) {
        // We found the target
        foundIndex = mid;
        break;
      } else if (scale[mid] < target) {
        // Target is in the upper half
        left = mid + 1;
      } else {
        // Target is in the lower half
        right = mid - 1;
      }
    }
  
    return { notes, steps, foundIndex };
  }
  
  /**
   * 2) Exponentiation by Squaring (O(log n))
   *    Computes large powers of a number efficiently using indices of the scale array.
   */
  export function getExponentiationBySquaringData(scale, exponent) {
    let notes = [];
    let steps = [];
  
    if (!scale) {
      throw new Error(`Scale not found`);
    }
  
    function exponentiationBySquaring(index, n) {
      if (n === 0) {
        steps.push(`Base case: scale[${index}]^0 = 1`);
        return 1;
      }
      if (n < 0) {
        steps.push(`Negative exponent: scale[${index}]^${n} = 1 / scale[${index}]^${-n}`);
        return 1 / exponentiationBySquaring(index, -n);
      }
      if (n % 2 === 0) {
        steps.push(`Even exponent: scale[${index}]^${n} = (scale[${index}]^${n / 2})^2`);
        const halfPower = exponentiationBySquaring(index, n / 2);
        notes.push(scale[index]);
        steps.push(`Intermediate result: (scale[${index}]^${n / 2})^2 = ${halfPower * halfPower}`);
        notes.push(halfPower * halfPower);
        return halfPower * halfPower;
      } else {
        steps.push(`Odd exponent: scale[${index}]^${n} = scale[${index}] * scale[${index}]^${n - 1}`);
        const reducedPower = exponentiationBySquaring(index, n - 1);
        notes.push(scale[index]);
        steps.push(`Intermediate result: scale[${index}] * scale[${index}]^${n - 1} = ${scale[index] * reducedPower}`);
        notes.push(scale[index] * reducedPower);
        return scale[index] * reducedPower;
      }
    }
  
    const index = Math.floor(Math.random() * scale.length);
    const result = exponentiationBySquaring(index, exponent);
    steps.push(`Result: scale[${index}]^${exponent} = ${result}`);
    notes.push(result);
  
    return { notes, steps };
  }

  
  /**
   * 3) Logarithmic Division Data
   */
  export function getLogDivData(scale) {
    let notes = [];
    let steps = [];
    const baseDuration = 600;
    let current = baseDuration;
    let scaleIndex = 0;
  
    while (current >= 50) {
      steps.push(`Log Div: duration=${current}, nextNoteIndex=${scaleIndex}`);
      notes.push(scale[scaleIndex]);
      scaleIndex = (scaleIndex + 1) % scale.length;
      current = Math.floor(current / 2);
    }
  
    return { notes, steps };
  }
  
  /**
   * 4) Iterative Log Data
   */
  export function getIterativeLogData(scale) {
    let notes = [];
    let steps = [];
    const numIterations = 8;
  
    for (let i = 1; i <= numIterations; i++) {
      const note = scale[i % scale.length];
      steps.push(`IterativeLog: iteration #${i} => freq ${note.toFixed(2)}`);
      notes.push(note);
    }
    return { notes, steps };
  }
  
  /**
   * 5) Extra Pattern Data
   */
  export function getExtraLogData(scale) {
    let notes = [];
    let steps = [];
  
    for (let i = 0; i < 5; i++) {
      const randIdx = Math.floor(Math.random() * scale.length);
      const freq = scale[randIdx];
      steps.push(`Extra: randomPick #${i + 1} => freq ${freq.toFixed(2)}`);
      notes.push(freq);
    }
    return { notes, steps };
  }
  

  