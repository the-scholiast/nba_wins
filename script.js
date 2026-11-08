// Team assignments
const playerTeams = {
  justin: [
    "Oklahoma City Thunder",
    "New York Knicks",
    "Houston Rockets",
    "Los Angeles Lakers",
    "Miami Heat",
    "Portland Trail Blazers",
    "Washington Wizards",
    "LA Clippers",
    "Sacramento Kings",
    "Phoenix Suns",
  ],
  khalil: [
    "San Antonio Spurs",
    "Detroit Pistons",
    "Denver Nuggets",
    "Cleveland Cavaliers",
    "Orlando Magic",
    "Chicago Bulls",
    "Milwaukee Bucks",
    "Dallas Mavericks",
    "Utah Jazz",
    "Golden State Warriors",
  ],
  woojin: [
    "Boston Celtics",
    "Philadelphia 76ers",
    "Minnesota Timberwolves",
    "Toronto Raptors",
    "Indiana Pacers",
    "Atlanta Hawks",
    "Charlotte Hornets",
    "Brooklyn Nets",
    "New Orleans Pelicans",
    "Memphis Grizzlies",
  ]
};

const TOTAL_GAMES = 82; // NBA regular season games
const UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

async function getNBAStandings() {
  const loading = document.getElementById('loading');
  const errorDiv = document.getElementById('error');

  try {
    loading.style.display = 'block';
    errorDiv.style.display = 'none';

    const response = await fetch('https://site.api.espn.com/apis/v2/sports/basketball/nba/standings');

    if (!response.ok) {
      throw new Error('Failed to fetch standings');
    }

    const data = await response.json();

    // Collect all team data
    const allTeams = [];

    data.children.forEach(conference => {
      conference.standings.entries.forEach(entry => {
        const wins = parseInt(entry.stats.find(s => s.name === 'wins')?.value || 0);
        const losses = parseInt(entry.stats.find(s => s.name === 'losses')?.value || 0);
        const gamesPlayed = wins + losses;
        const gamesLeft = TOTAL_GAMES - gamesPlayed;

        allTeams.push({
          team: entry.team.displayName,
          wins: wins,
          losses: losses,
          gamesLeft: gamesLeft,
          winPercent: parseFloat(entry.stats.find(s => s.name === 'winPercent')?.value || 0)
        });
      });
    });

    // Display standings for each player
    displayPlayerStandings('justin', allTeams);
    displayPlayerStandings('khalil', allTeams);
    displayPlayerStandings('woojin', allTeams);

    // Save the current timestamp
    localStorage.setItem('lastUpdate', new Date().toISOString());
    updateLastUpdateDisplay();

    loading.style.display = 'none';

  } catch (error) {
    console.error('Error:', error);
    loading.style.display = 'none';
    errorDiv.style.display = 'block';
    errorDiv.textContent = 'Error loading standings. Please try again later.';
  }
}

function displayPlayerStandings(playerName, allTeams) {
  const tbody = document.getElementById(`${playerName}-body`);
  tbody.innerHTML = '';

  // Filter teams for this player
  const playerTeamNames = playerTeams[playerName];
  const playerStandings = allTeams.filter(team =>
    playerTeamNames.includes(team.team)
  );

  // Sort by wins (highest first)
  playerStandings.sort((a, b) => b.wins - a.wins);

  let totalWins = 0;
  let totalLosses = 0;
  let totalGamesLeft = 0;

  // Add rows
  playerStandings.forEach((team, index) => {
    const row = tbody.insertRow();

    row.insertCell(0).textContent = index + 1;
    row.insertCell(1).textContent = team.team;
    row.insertCell(2).textContent = team.wins;
    row.insertCell(3).textContent = team.losses;
    row.insertCell(4).textContent = team.gamesLeft;

    totalWins += team.wins;
    totalLosses += team.losses;
    totalGamesLeft += team.gamesLeft;
  });

  // Update totals
  document.getElementById(`${playerName}-total-wins`).textContent = totalWins;
  document.getElementById(`${playerName}-total-losses`).textContent = totalLosses;
  document.getElementById(`${playerName}-games-left`).textContent = totalGamesLeft;
}

function updateLastUpdateDisplay() {
  const lastUpdate = localStorage.getItem('lastUpdate');
  const updateDisplay = document.getElementById('last-update');

  if (lastUpdate && updateDisplay) {
    const updateDate = new Date(lastUpdate);
    updateDisplay.textContent = `Last updated: ${updateDate.toLocaleString()}`;
  }
}

function checkForDailyUpdate() {
  const lastUpdate = localStorage.getItem('lastUpdate');

  if (!lastUpdate) {
    // First time loading, fetch data
    getNBAStandings();
    return;
  }

  const lastUpdateDate = new Date(lastUpdate);
  const now = new Date();
  const timeSinceUpdate = now - lastUpdateDate;

  // If it's been more than 24 hours, update
  if (timeSinceUpdate >= UPDATE_INTERVAL) {
    console.log('24 hours passed, fetching new data...');
    getNBAStandings();
  } else {
    console.log('Data is still fresh, using cached version');
    updateLastUpdateDisplay();
    // Still fetch to display current data
    getNBAStandings();
  }
}

// Manual refresh button handler
function manualRefresh() {
  console.log('Manual refresh triggered');
  getNBAStandings();
}

// Load standings when page loads
document.addEventListener('DOMContentLoaded', () => {
  checkForDailyUpdate();

  // Set up interval to check every hour if we need to update
  setInterval(checkForDailyUpdate, 60 * 60 * 1000); // Check every hour
});