function invariant(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isPlainObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function isValidNoteValue(value) {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function validateStringArray(value, label) {
  invariant(Array.isArray(value), `${label} must be an array.`);
  value.forEach((item, index) => {
    invariant(
      typeof item === "string",
      `${label}[${index}] must be a string.`
    );
  });
}

export function validateAlgorithmMetaShape(meta) {
  invariant(isPlainObject(meta), "Algorithm metadata must be an object.");

  [
    "id",
    "tab",
    "buttonLabel",
    "description",
    "setupName",
  ].forEach((fieldName) => {
    invariant(
      typeof meta[fieldName] === "string" && meta[fieldName].trim() !== "",
      `Algorithm metadata field "${fieldName}" must be a non-empty string.`
    );
  });

  invariant(
    typeof meta.highlightLine === "function",
    `Algorithm "${meta.id}" must provide a highlightLine function.`
  );

  const pseudocode = meta.pseudocode;
  invariant(
    Array.isArray(pseudocode) || typeof pseudocode === "function",
    `Algorithm "${meta.id}" pseudocode must be an array or function.`
  );
  if (Array.isArray(pseudocode)) {
    validateStringArray(pseudocode, `Algorithm "${meta.id}" pseudocode`);
  }

  const source = meta.source;
  invariant(
    Array.isArray(source) || typeof source === "function",
    `Algorithm "${meta.id}" source must be an array or function.`
  );
  if (Array.isArray(source)) {
    validateStringArray(source, `Algorithm "${meta.id}" source`);
  }

  invariant(
    isPlainObject(meta.rigor),
    `Algorithm "${meta.id}" must provide rigor metadata.`
  );
  invariant(
    typeof meta.rigor.claimType === "string" && meta.rigor.claimType.trim() !== "",
    `Algorithm "${meta.id}" rigor.claimType must be a non-empty string.`
  );
  invariant(
    typeof meta.rigor.growthClass === "string" && meta.rigor.growthClass.trim() !== "",
    `Algorithm "${meta.id}" rigor.growthClass must be a non-empty string.`
  );
  invariant(
    typeof meta.rigor.bounded === "boolean",
    `Algorithm "${meta.id}" rigor.bounded must be a boolean.`
  );
  invariant(
    meta.rigor.bounds === null || isPlainObject(meta.rigor.bounds),
    `Algorithm "${meta.id}" rigor.bounds must be null or an object.`
  );

  invariant(
    isPlainObject(meta.representation),
    `Algorithm "${meta.id}" must provide representation metadata.`
  );
  invariant(
    typeof meta.representation.noteStrategy === "string" &&
      meta.representation.noteStrategy.trim() !== "",
    `Algorithm "${meta.id}" representation.noteStrategy must be a non-empty string.`
  );
  invariant(
    typeof meta.representation.traceStrategy === "string" &&
      meta.representation.traceStrategy.trim() !== "",
    `Algorithm "${meta.id}" representation.traceStrategy must be a non-empty string.`
  );
}

export function validateAlgorithmChunkShape(chunk, algorithmId = "unknown") {
  invariant(
    isPlainObject(chunk),
    `Algorithm "${algorithmId}" stream chunk must be an object.`
  );

  if (chunk.notes !== undefined) {
    invariant(
      Array.isArray(chunk.notes),
      `Algorithm "${algorithmId}" stream chunk notes must be an array.`
    );
    chunk.notes.forEach((note, index) => {
      invariant(
        isValidNoteValue(note),
        `Algorithm "${algorithmId}" stream chunk note at index ${index} must be a finite number or null.`
      );
    });
  }

  if (chunk.steps !== undefined) {
    validateStringArray(
      chunk.steps,
      `Algorithm "${algorithmId}" stream chunk steps`
    );
  }

  if (chunk.events !== undefined) {
    invariant(
      Array.isArray(chunk.events),
      `Algorithm "${algorithmId}" stream chunk events must be an array.`
    );
    chunk.events.forEach((event, index) => {
      invariant(
        isPlainObject(event),
        `Algorithm "${algorithmId}" stream chunk event at index ${index} must be an object.`
      );
      if (event.note !== undefined) {
        invariant(
          isValidNoteValue(event.note),
          `Algorithm "${algorithmId}" stream chunk event note at index ${index} must be a finite number or null.`
        );
      }
      if (event.step !== undefined) {
        invariant(
          typeof event.step === "string",
          `Algorithm "${algorithmId}" stream chunk event step at index ${index} must be a string.`
        );
      }
    });
  }
}

export function validateAlgorithmDataShape(result, algorithmId = "unknown") {
  invariant(
    isPlainObject(result),
    `Algorithm "${algorithmId}" must return an object.`
  );

  invariant(
    Array.isArray(result.notes),
    `Algorithm "${algorithmId}" result.notes must be an array.`
  );
  result.notes.forEach((note, index) => {
    invariant(
      isValidNoteValue(note),
      `Algorithm "${algorithmId}" result note at index ${index} must be a finite number or null.`
    );
  });

  validateStringArray(result.steps, `Algorithm "${algorithmId}" result.steps`);

  if (result.stream !== undefined && result.stream !== null) {
    invariant(
      typeof result.stream.next === "function",
      `Algorithm "${algorithmId}" result.stream must be an iterator.`
    );
  }
}

export function validateAlgorithmEntryShape(entry) {
  invariant(isPlainObject(entry), "Algorithm entry must be an object.");
  invariant(
    typeof entry.id === "string" && entry.id.trim() !== "",
    "Algorithm entry id must be a non-empty string."
  );
  validateAlgorithmMetaShape(entry.meta);
  invariant(
    entry.meta.id === entry.id,
    `Algorithm entry "${entry.id}" must match metadata id "${entry.meta.id}".`
  );
  invariant(
    typeof entry.implementationName === "string" &&
      entry.implementationName.trim() !== "",
    `Algorithm "${entry.id}" must declare implementationName.`
  );
  invariant(
    typeof entry.implementationFile === "string" &&
      entry.implementationFile.trim() !== "",
    `Algorithm "${entry.id}" must declare implementationFile.`
  );
  invariant(
    typeof entry.verificationStatus === "string" &&
      entry.verificationStatus.trim() !== "",
    `Algorithm "${entry.id}" must declare verificationStatus.`
  );
  invariant(
    typeof entry.verificationNote === "string" &&
      entry.verificationNote.trim() !== "",
    `Algorithm "${entry.id}" must declare verificationNote.`
  );
  invariant(
    typeof entry.run === "function",
    `Algorithm "${entry.id}" must declare a run function.`
  );
}
