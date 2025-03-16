export function getTravelingSalesmanData(scale) {
    let notes = [];
    let steps = [];
    
    // Limit input size to prevent freezing
    const maxCities = 6;
    const n = Math.min(scale.length, maxCities);
    const workingScale = scale.slice(0, n);
    
    if (n < 2) {
        steps.push("TravelingSalesman: Need at least 2 frequencies to create a route.");
        return { notes, steps };
    }

    let minPath = Infinity;
    let bestRoute = [];
    let routeCount = 0;
    const maxRoutes = 100; // Limit total routes checked

    // Pre-calculate distances
    const distances = Array(n).fill().map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            distances[i][j] = Math.abs(workingScale[i] - workingScale[j]);
        }
    }

    function findRoutes(route, visited, currentLength) {
        // Stop if we've checked enough routes
        if (routeCount >= maxRoutes) {
            return;
        }

        // If route is complete, check if it's better than current best
        if (route.length === n) {
            routeCount++;
            const totalLength = currentLength + distances[route[route.length - 1]][route[0]];
            
            // Add frequencies to notes for audio
            route.forEach(cityIndex => {
                notes.push(workingScale[cityIndex]);
            });
            notes.push(workingScale[route[0]]); // Return to start
            
            if (totalLength < minPath) {
                minPath = totalLength;
                bestRoute = [...route];
                steps.push(`New best route found! Length: ${totalLength.toFixed(2)}`);
            }
            return;
        }

        // Try each unvisited city
        for (let nextCity = 0; nextCity < n; nextCity++) {
            if (!visited[nextCity]) {
                const newLength = route.length === 0 ? 
                    0 : currentLength + distances[route[route.length - 1]][nextCity];
                
                // Early pruning if this path is already longer than best
                if (newLength >= minPath) continue;

                visited[nextCity] = true;
                route.push(nextCity);
                
                // Add note for each city we visit
                notes.push(workingScale[nextCity]);
                steps.push(`Visiting city ${nextCity} (${workingScale[nextCity].toFixed(2)} Hz)`);
                
                findRoutes(route, visited, newLength);
                
                route.pop();
                visited[nextCity] = false;
            }
        }
    }

    // Start search
    const visited = Array(n).fill(false);
    findRoutes([], visited, 0);

    // Ensure we have some output even if we hit limits
    if (bestRoute.length > 0) {
        steps.push(`Final best route found with length: ${minPath.toFixed(2)}`);
        bestRoute.forEach((cityIndex, i) => {
            steps.push(`City ${cityIndex}: ${workingScale[cityIndex].toFixed(2)} Hz`);
        });
    } else {
        steps.push("Search stopped due to complexity limits");
        // Add some notes anyway so we have audio output
        workingScale.forEach(freq => notes.push(freq));
    }

    return { notes, steps };
}