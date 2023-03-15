const winDistCtx = document.getElementById('win-dist-bar');
const winLossCtx = document.getElementById("win-loss-pie");
const avgDistHistCtx = document.getElementById("avg-distance-history");
Chart.defaults.color = "#fff"
Chart.defaults.borderColor = "#555";
loadSave();


new Chart(winDistCtx, {
  type: "bar",
  data: {
    labels: [1, 2, 3, 4, 5, 6],
    datasets: [{
      label: "# of Wins in x Guesses",
      data: Object.values(gData.win_dist),
      backgroundColor: "#1E90FF77",
      borderColor: "#1E90FFFF",
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      x: {
        title: {
          display: true,
          text: "# of Guesses"
        }
      },
      y: {
        title: {
          display: true,
          text: "# of Wins"
        },
        beginAtZero: true
      }
    }
  }
});

new Chart(winLossCtx, {
  type: "doughnut",
  data: {
    labels: ["Wins", "Losses"],
    datasets: [{
      data: [gData.wins, gData.plays - gData.wins],
      backgroundColor: [
          "#31DE37FF",
          "#DE3131FF"
      ]
    }]
  },
});

let daysAgo = [];
let totalDays = Math.round((new Date(getDateString().replace(/-/g,"/")) - new Date(gData.start_date.replace(/-/g, "/"))) / (24 * 60 * 60 * 1000))
for (let i = Math.min(totalDays, 14); i >= 0; i--)
  daysAgo.push(i + " Days Ago");

new Chart(avgDistHistCtx, {
  type: "line",
  data: {
    labels: daysAgo,
    datasets: [{
      label: "Average Distance Over Time",
      data: [...gData.avg_distance_hist],
      fill: false,
      borderColor: "#1E90FFFF",
      tension: 0.2,
    }]
  },
  options: {
    scales: {
      y: {
        title: {
          display: true,
          text: "Distance (m)"
        }
      }
    }
  }
});

$("#plays-value").html(gData.plays);
$("#wins-value").html(gData.wins);
$("#winp-value").html(Math.round((gData.wins / gData.plays) * 100));
$("#hard-mode-value").html(gData.hard_mode ? "On" : "Off");
$("#streak-value").html(gData.streak);
$("#mstreak-value").html(gData.max_streak);
$("#avg-dist-value").html(gData.avg_distance);
$("#avg-guesses-value").html(
    Math.round(((gData.win_dist[1] + (gData.win_dist[2] * 2) + (gData.win_dist[3] * 3) + (gData.win_dist[4] * 4) +
            (gData.win_dist[5] * 5) + (gData.win_dist[6] * 6)) / gData.wins) * 100) / 100
);
$("#fplay-value").html(new Date(gData.start_date.replace(/-/g, "/")).toLocaleDateString());
$("#lplay-value").html(gData.last_play ? new Date(gData.last_play.replace(/-/g, "/")).toLocaleDateString() : "None");
