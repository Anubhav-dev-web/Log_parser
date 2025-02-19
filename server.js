const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.static('public')); // Serve frontend files

const logRegex =
  /(?<ip>\S+) - - \[(?<timestamp>\d{2}\/\w{3}\/\d{4}:(?<hour>\d{2}):\d{2}:\d{2})/;

function parseLogFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('Log file not found:', filePath);
    return { ipCounter: {}, hourlyTraffic: {} };
  }

  const logData = fs.readFileSync(filePath, 'utf-8');
  const lines = logData.split('\n');

  let ipCounter = {};
  let hourlyTraffic = {};

  for (let line of lines) {
    const match = line.match(logRegex);
    if (match) {
      const ip = match.groups.ip;
      const hour = match.groups.hour;

      ipCounter[ip] = (ipCounter[ip] || 0) + 1;
      hourlyTraffic[hour] = (hourlyTraffic[hour] || 0) + 1;
    }
  }

  return { ipCounter, hourlyTraffic };
}

// Function to get top contributors
function getTopContributors(data, percentage) {
  const total = Object.values(data).reduce((sum, val) => sum + val, 0); // Total traffic
  const threshold = total * (percentage / 100); // Percentage threshold

  // Sort in descending order
  const sortedEntries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  let cumulative = 0;
  let topContributors = [];

  for (let [key, count] of sortedEntries) {
    cumulative += count;
    topContributors.push({ key, count });
    if (cumulative >= threshold) break; // Stop when we reach threshold
  }

  return topContributors;
}

// API Route
app.get('/log-data', (req, res) => {
  const logFilePath = 'logs/server.log'; // Ensure correct path
  const { ipCounter, hourlyTraffic } = parseLogFile(logFilePath);

  // Calculate Top 85% IPs
  const topIPs = getTopContributors(ipCounter, 85);
  // Calculate Top 70% Hours
  const topHours = getTopContributors(hourlyTraffic, 70);
  console.log('\n IP Addresses and Occurrences (Full Data):');
  console.log(ipCounter);

  console.log('\n Hourly Traffic (Full Data):');
  console.log(hourlyTraffic);

  console.log('\n Top 85% IPs contributing to traffic:');
  console.log(topIPs);

  console.log('\n Top 70% Hours contributing to traffic:');
  console.log(topHours);
  res.json({ ipCounter, hourlyTraffic, topIPs, topHours });
});

// Start server
app.listen(3000, () => console.log('Server running at http://localhost:3000'));
