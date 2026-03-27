export function* chunkEvents(eventIterator, chunkSize = 16) {
  let notes = [];
  let steps = [];
  let events = [];

  for (const event of eventIterator) {
    events.push(event);

    if (event.step) {
      steps.push(event.step);
    }
    if ("note" in event) {
      notes.push(event.note);
    }

    if (events.length >= chunkSize || notes.length >= chunkSize || steps.length >= chunkSize) {
      yield { notes, steps, events };
      notes = [];
      steps = [];
      events = [];
    }
  }

  if (events.length > 0 || notes.length > 0 || steps.length > 0) {
    yield { notes, steps, events };
  }
}
