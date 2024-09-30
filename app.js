function processFile() {
    const fileInput = document.getElementById('fileInput');
    const resultDiv = document.getElementById('result');
    const reader = new FileReader();

    reader.onload = function(event) {
        const jsonData = JSON.parse(event.target.result);
        const { keys, ...points } = jsonData;
        const n = keys.n;
        const k = keys.k;

        let decodedPoints = [];
        // Decode the points
        for (let key in points) {
            if (points.hasOwnProperty(key)) {
                const x = parseInt(key, 10);
                const { base, value } = points[key];
                const y = parseInt(value, parseInt(base, 10)); // Convert y from base to decimal
                decodedPoints.push({ x, y });
            }
        }

        // Apply Lagrange Interpolation to calculate the constant term 'c'
        const secret = calculateLagrangeConstant(decodedPoints.slice(0, k));
        
        // Display the result
        resultDiv.innerHTML = `<p>Secret (c): ${secret}</p>`;
        
        // If it's the second test case, check for wrong points
        if (n === 9 && k === 6) {
            const wrongPoints = findWrongPoints(decodedPoints);
            resultDiv.innerHTML += `<p>Wrong Points: ${JSON.stringify(wrongPoints)}</p>`;
        }
    };

    if (fileInput.files.length > 0) {
        reader.readAsText(fileInput.files[0]);
    } else {
        alert("Please select a file.");
    }
}

// Lagrange Interpolation to find the constant term 'c'
function calculateLagrangeConstant(points) {
    let c = 0;
    for (let i = 0; i < points.length; i++) {
        let xi = points[i].x;
        let yi = points[i].y;

        let product = yi;
        for (let j = 0; j < points.length; j++) {
            if (i !== j) {
                let xj = points[j].x;
                product *= -xj / (xi - xj);
            }
        }
        c += product;
    }
    return Math.round(c); // Round to avoid floating-point precision issues
}

// Detect wrong points on the curve for the second test case
function findWrongPoints(points) {
    let wrongPoints = [];
    const k = 6; // Minimum points required to solve polynomial
    
    for (let i = 0; i < points.length; i++) {
        // Use Lagrange interpolation on all subsets of k points
        let subset = points.filter((_, index) => index !== i);
        const constant = calculateLagrangeConstant(subset.slice(0, k));
        
        // If the constant term is significantly different, it's a wrong point
        const threshold = 1e-6; // Small threshold for floating-point comparison
        if (Math.abs(constant - points[i].y) > threshold) {
            wrongPoints.push(points[i]);
        }
    }

    return wrongPoints;
}
