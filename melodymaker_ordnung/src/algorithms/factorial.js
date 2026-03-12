function* chunkEvents(eventIterator, chunkSize = 16) {
    let notes = [];
    let steps = [];

    for (const event of eventIterator) {
        if (event.step) steps.push(event.step);
        if ("note" in event) notes.push(event.note);

        if (notes.length >= chunkSize || steps.length >= chunkSize) {
            yield { notes, steps };
            notes = [];
            steps = [];
        }
    }

    if (notes.length > 0 || steps.length > 0) {
        yield { notes, steps };
    }
}

function* travelingSalesmanEvents(scale) {
    const maxCities = 6;
    const n = Math.min(scale.length, maxCities);
    const workingScale = scale.slice(0, n);

    if (n < 2) {
        yield {
            note: null,
            step: "TravelingSalesman: Need at least 2 frequencies to create a route.",
        };
        return;
    }

    const distances = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            distances[i][j] = Math.abs(workingScale[i] - workingScale[j]);
        }
    }

    let minPath = Infinity;
    let bestRoute = [];

    function* search(route, visited, currentLength) {
        if (route.length === n) {
            const totalLength = currentLength + distances[route[route.length - 1]][route[0]];
            for (const cityIndex of route) {
                yield { note: workingScale[cityIndex] };
            }
            yield { note: workingScale[route[0]] };

            if (totalLength < minPath) {
                minPath = totalLength;
                bestRoute = [...route];
                yield {
                    note: null,
                    step: `New best route found! Length: ${totalLength.toFixed(2)}`,
                };
            }
            return;
        }

        for (let nextCity = 0; nextCity < n; nextCity++) {
            if (visited[nextCity]) continue;

            const newLength =
                route.length === 0
                    ? 0
                    : currentLength + distances[route[route.length - 1]][nextCity];

            if (newLength >= minPath) continue;

            visited[nextCity] = true;
            route.push(nextCity);
            yield {
                note: workingScale[nextCity],
                step: `Visiting city ${nextCity} (${workingScale[nextCity].toFixed(2)} Hz)`,
            };
            yield* search(route, visited, newLength);
            route.pop();
            visited[nextCity] = false;
        }
    }

    const visited = Array(n).fill(false);
    yield* search([], visited, 0);

    if (bestRoute.length > 0) {
        yield {
            note: null,
            step: `Final best route found with length: ${minPath.toFixed(2)}`,
        };
        for (const cityIndex of bestRoute) {
            yield {
                note: null,
                step: `City ${cityIndex}: ${workingScale[cityIndex].toFixed(2)} Hz`,
            };
        }
    } else {
        yield { note: null, step: "No route found." };
        for (const freq of workingScale) {
            yield { note: freq };
        }
    }
}

export function getTravelingSalesmanData(scale) {
    return {
        notes: [],
        steps: [],
        stream: chunkEvents(travelingSalesmanEvents(scale)),
    };
}
