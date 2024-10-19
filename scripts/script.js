let map;
        let directionsService;
        let directionsRenderer;
        let savedRoutes = [];

        //This function initializes the map and navigation services and loads any routes saved in memory
        function initMap() {
            map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: 43.8145, lng: -111.7833 }, zoom: 15
            });
            directionsService = new google.maps.DirectionsService();
            directionsRenderer = new google.maps.DirectionsRenderer();
            directionsRenderer.setMap(map);

            loadSavedRoutes();
            getRouteCount();
        }

        //This function initiates the process to save the routes. 
        //It gathers the info together and inputs it into the calculateRoute function
        function calculateAndSaveRoute() {
            const origin = document.getElementById('origin').value;
            const destination = document.getElementById('destination').value;
            const waypointsInput = document.getElementById('waypoints').value;
            const waypoints = waypointsInput.split(',').map((wp) => wp.trim()).filter((wp) => wp);

            if (origin && destination) {
                calculateRoute(origin, waypoints, destination, 0);
            } 
            else {
                alert('Please enter both starting and destination addresses.');
            }
        }

        //This function calculates the route. If the route has any waypoints, it uses recursion to find the path between the starting point, waypoint, and destination.
        function calculateRoute(origin, waypoints, destination) {
            const waypointsArray = waypoints.map(location => ({ location: location, stopover: true }));
        
            const request = {
                origin: origin,
                destination: destination,
                waypoints: waypointsArray,
                travelMode: 'DRIVING',
                optimizeWaypoints: true,
            };
        
            directionsService.route(request, (result, status) => {
                if (status === 'OK') {
                    directionsRenderer.setDirections(result);
                    saveRoute(origin, destination, waypoints);
                    displayOutput(`Route saved from ${origin} to ${destination} with waypoints: ${waypoints.join(', ')}.`);
                } else {
                    alert('Directions request failed due to ' + status);
                }
            });
        }

        //This function saves the route 
        function saveRoute(origin, destination, waypoints) {
            savedRoutes.push({ origin, destination, waypoints });
            saveRoutesToLocalStorage();
            updateNavHistory();
            getRouteCount();
        }

        //This function displays the number of routes saved
        function getRouteCount() {
            const routeCount = savedRoutes.length;
            const outputDiv = document.getElementById('output');
            outputDiv.innerHTML = '';
            displayOutput(`Total saved routes: ${routeCount}`);
        }

        //This function adds routes to the navigation history
        function updateNavHistory() {
            const navHistoryDiv = document.getElementById('navHistory');
            navHistoryDiv.innerHTML = '';

            savedRoutes.forEach((route, index) => {
                const routeElement = document.createElement('div');
                routeElement.className = 'saved-route';
                routeElement.textContent = `${route.origin} -> ${route.destination}`;
                routeElement.onclick = () => displaySavedRoute(route);
                navHistoryDiv.appendChild(routeElement);
            });
        }

        //This function shows a route saved in memory
        function displaySavedRoute(route) {
            const request = {
                origin: route.origin,
                destination: route.destination,
                waypoints: route.waypoints.map(location => ({ location, stopover: true })),
                travelMode: 'DRIVING',
            };

            directionsService.route(request, (result, status) => {
                if (status === 'OK') {
                    directionsRenderer.setDirections(result);
                } 
                else {
                    alert('Directions request failed due to ' + status);
                }
            });
        }

        //This function saves routes to local storage, saving them in case of a refresh
        function saveRoutesToLocalStorage() {
            localStorage.setItem('savedRoutes', JSON.stringify(savedRoutes));
        }

        //This function loads routes from local storage
        function loadSavedRoutes() {
            const storedRoutes = localStorage.getItem('savedRoutes');
            if (storedRoutes) {
                savedRoutes = JSON.parse(storedRoutes);
                updateNavHistory();
            }
        }

        //This function displays output messages
        function displayOutput(message) {
            const outputDiv = document.getElementById('output');
            outputDiv.innerHTML += `<p>${message}</p>`;
            console.log(message); // Log to console as well
        }

        window.onload = initMap;