fetch('/log-data')
  .then((res) => res.json())
  .then((data) => {
    const ipLabels = Object.keys(data.ipCounter);

    const ipCounts = Object.values(data.ipCounter);
    const hourLabels = Object.keys(data.hourlyTraffic);
    const hourCounts = Object.values(data.hourlyTraffic);

    new Chart(document.getElementById('ipChart'), {
      type: 'bar',
      data: {
        labels: ipLabels,
        datasets: [{ label: 'IP Occurrences', data: ipCounts }],
      },
    });

    new Chart(document.getElementById('hourChart'), {
      type: 'bar',
      data: {
        labels: hourLabels,
        datasets: [{ label: 'Hourly Traffic', data: hourCounts }],
      },
    });
  });
