export const configureDelay = (delay, feedback, delayTime, feedbackGain) => {
  delay.delayTime.value = Math.min(5.0, Math.max(0, delayTime));
  feedback.gain.value = Math.min(0.9, Math.max(0, feedbackGain));
  delay.connect(feedback);
  feedback.connect(delay);
};