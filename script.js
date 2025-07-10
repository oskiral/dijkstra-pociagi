const citiesEl = document.getElementById("cities");
const btn = document.getElementById("send-btn");
const outEl = document.getElementById("output");

const connections = [
    ["Bydgoszcz", "Toruń"],
    ["Bydgoszcz", "Gdańsk"],
    ["Gdańsk", "Łódź"],
    ["Toruń", "Łódź"],
    ["Łódź", "Wrocław"],
    ["Łódź", "Warszawa"],
    ["Warszawa", "Katowice"],
    ["Wrocław", "Katowice"],
    ["Katowice", "Łódź"],
    ["Toruń", "Gdańsk"]
];


function createForm() {
    connections.forEach(conn => {
        const name = `${conn[0]}-${conn[1]}`;
        let temp = document.createElement("div");
        temp.classList.add("input-box");
        let titleTemp = document.createElement("label");
        titleTemp.setAttribute("for", `${name}-input`);
        let inputTemp = document.createElement("input");
        inputTemp.id = `${name}-input`;
        inputTemp.setAttribute("type", "number");
        let minCount = document.createElement("span");
        minCount.classList.add("min-abs");
        minCount.innerHTML = "(minuty)";
        // let buttonTemp = document.createElement("button");
        temp.appendChild(titleTemp)
        temp.appendChild(inputTemp);
        temp.appendChild(minCount);
        // temp.appendChild(buttonTemp);
        citiesEl.appendChild(temp);
        titleTemp.innerHTML = name;
    })
}

function getDistances() {
    let distances = [];
    const inputs = document.querySelectorAll("input");
    inputs.forEach(inp => {
        const val = inp.value.trim();
        if (val === "" || isNaN(val)) {
            alert(`Uzupełnij pole: ${inp.id}`);
            return null;
        }
        // const name = `${inp[0]}-${inp[1]}`;

        const num = parseFloat(inp.value);
        const id = inp.id;

        const connection = id.slice(0, id.length-6)
        

        distances.push({[connection]: num});
    })
    console.log(distances);
    return distances;
}

function buildGraph(edgesArray) {
    const graph = {};

    for (const edge of edgesArray) {
        const [connKey, distance] = Object.entries(edge)[0]; 

        const [from, to] = connKey.split("-");
    
       
        if (!graph[from]) graph[from] = []; 
        if (!graph[to]) graph[to] = [];

        graph[from].push({ node: to, weight: distance });
        graph[to].push({ node: from, weight: distance });
    }

    return graph;
}

function dijkstra(graph, start, end) {
    const distances = {};
    const previous = {};
    const queue = new Set(Object.keys(graph));

    for (const node of queue) {
        distances[node] = Infinity;
        previous[node] = null;
    }
    distances[start] = 0;

    while (queue.size > 0) {
        const current = [...queue].reduce((a, b) =>
            distances[a] < distances[b] ? a : b
        );

        queue.delete(current);

        for (const neighbor of graph[current]) {
            const alt = distances[current] + neighbor.weight;
            if (alt < distances[neighbor.node]) {
                distances[neighbor.node] = alt;
                previous[neighbor.node] = current;
            }
        }
    }

    const path = [];
    let u = end;
    while (u) {
        path.unshift(u);
        u = previous[u];
    }

    return {
        distance: distances[end],
        path: distances[end] !== Infinity ? path : null
    };
}

function generateRandomDistances(min = 30, max = 350) {
    const inputs = document.querySelectorAll("#cities input[type='number']");
    inputs.forEach(input => {
        const randomDistance = Math.floor(Math.random() * (max - min + 1)) + min;
        input.value = randomDistance;
    });
}

function main() {
    createForm();
    
    document.getElementById("generate-btn").addEventListener("click", () => {
        generateRandomDistances();
    });
    
    btn.addEventListener("click", () => {
        const distances = getDistances();
        if (!distances) return;
        const graph = buildGraph(distances);
        
        const start = document.getElementById("start").value;
        const end = document.getElementById("end").value;
        
        const result = dijkstra(graph, start, end);
        
        if (result.path) {
            const pathHTML = result.path
                .map(city => `<span class="city-box">${city}</span>`)
                .join('<i class="fa-solid fa-arrow-right arrow-icon"></i>');

            const totalMinutes = result.distance;
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;

            let readableTime = '';
            if (hours > 0) {
                readableTime += `${hours}h `;
            }
            readableTime += `${minutes}min`;

            outEl.innerHTML = `
                <div class="output-path">${pathHTML}</div>
                <div class="output-time">⏱️ Czas przejazdu: <strong>${totalMinutes} min</strong> (${readableTime})</div>
            `;
        } else {
            outEl.innerHTML = `
                <div class="output-time" style="color: #DC143C;">❌ Nie znaleziono trasy</div>
            `;
        }

    });
}
main();