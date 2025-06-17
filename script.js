document.addEventListener('DOMContentLoaded', () => {
    const dataContainer = document.getElementById('data-container');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
  
    // Fallback JSON data (your sample)
    const fallbackData = {
      "6-LDSA1": {
        "lastDetected": "2025-06-05 02:36:24.246000+00:00",
        "lastDetected_min_dist": 4.651663444398523,
        "strikesWithin": []
      },
      "6-LDSA2": {
        "lastDetected": "2025-06-05 02:36:24.246000+00:00",
        "lastDetected_min_dist": 4.116199188432731,
        "strikesWithin": []
      },
      "6-DS6": {
        "lastDetected": "2025-06-05 02:36:24.246000+00:00",
        "lastDetected_min_dist": 3.8820941788139582,
        "strikesWithin": []
      }
    };
  
    // Function to calculate time since last detection
    const getTimeSince = (strikes) => {
      if (!strikes || strikes.length === 0) return '>24hrs';
      
      const sortedStrikes = strikes.sort((a, b) => new Date(b) - new Date(a));
      const latestStrike = new Date(sortedStrikes[0]);
      const now = new Date();
      const diffMs = now - latestStrike;
      const diffMin = Math.round(diffMs / (1000 * 60)); // Minutes
      const diffHr = (diffMs / (1000 * 60 * 60)).toFixed(1); // Hours
  
      return diffMin < 60 ? `${diffMin} min` : `${diffHr} hrs`;
    };
  
    // Function to get last 3 strikes
    const getLastThreeStrikes = (strikes) => {
      if (!strikes || strikes.length === 0) return 'None';
      const sortedStrikes = strikes.sort((a, b) => new Date(b) - new Date(a));
      return sortedStrikes.slice(0, 3).join('<br>');
    };
  
    // Fetch data and render
    const fetchData = () => {
      // Try API with cors-anywhere proxy
      fetch('https://cors-anywhere.herokuapp.com/https://function-web-api.azurewebsites.net/api/web_api')
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch data: ' + response.statusText);
          return response.json();
        })
        .then(data => {
          renderData(data);
        })
        .catch(err => {
          console.error('API fetch error:', err);
          // Fallback to sample data
          renderData(fallbackData);
          loading.classList.add('hidden');
          error.classList.remove('hidden');
          error.textContent = 'Using fallback data due to API error: ' + err.message;
        });
    };
  
    // Render data to DOM
    const renderData = (data) => {
      loading.classList.add('hidden');
      error.classList.add('hidden');
      dataContainer.innerHTML = '';
      dataContainer.className = 'data-grid';
  
      Object.keys(data).forEach(key => {
        const item = data[key];
        const timeSince = getTimeSince(item.strikesWithin);
        const lastThree = getLastThreeStrikes(item.strikesWithin);
  
        const card = `
          <div class="card">
            <h2>${key}</h2>
            <table>
              <thead>
                <tr>
                  <th>Time since last detection</th>
                  <th>Last detected times</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${timeSince}</td>
                  <td>${lastThree}</td>
                </tr>
              </tbody>
            </table>
          </div>`;
        dataContainer.innerHTML += card;
      });
    };
  
    // Initial fetch
    fetchData();
  
    // Refresh every 30 seconds
    setInterval(fetchData, 30 * 1000);
  });