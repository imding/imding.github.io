const result = [
	"2018-03-19,Week 12,,,,,,,,,,,,,,,,,,,,,",
	"Karan,,2,,1,,3,0.5,2,3,,,3,,,,3,2,,1,2.5,,21",
	"Gabo,,2,,,,,2,,,,2,,3,,,,,,2,,,9",
	"Sam,,,,1,,,,,,,,,,,,3,,,,,,4",
	"Danny,,,,,,,3,,,,,,,,,,,,2,,,5",
	"JT,,,,,,,,,,2,,,,,,1,,,2,,,5",
	"Eva,,,,1,,,,,,,,,,,,,,,,,,1",
	"Mo,,,,1,,,1,,,,,,2,,,,,,,,,4",
	",,,,,,,,,,,,,,,,,,,,,,",
	"2018-03-12,Week 11,,,,,,,,,,,,,,,,,,,,,",
	"Karan,,,,1,,,,,,,,,,,,3,,,,,,4",
	"Gabo,,,,,,,2,,,,,,3,,,,,,2,,,7",
	"Sam,,,,1,,,,,,,,,,,,3,,1,,,,5",
	"Danny,,,,,,,3,,,,,,,,,,1,,2,,,6",
	"JT,,,,,,,,,,2,,,,,,1,,,2,,,5",
	"Eva,,,,1,,,,,,,,3,,,,,,,,,,4",
	"Mo,,,,1,,,1,,,,,,2,,,2,,,,,,6",
	",,,,,,,,,,,,,,,,,,,,,,",
	"2018-03-05,Week 10,,,,,,,,,,,,,,,,,,,,,",
	"Karan,,,,1,,,1,,,2,,,,,,3,,2,,,,9",
	"Gabo,,,,,,,2,,,,2,,3,1,,,,,2,,,10",
	"Sam,,,,1,,,,,,,,,,,,3,,,,,16,20",
	"Danny,,,,,,,3,,,,,,,,,,,,2,,,5",
	"JT,,,,,,,,,,2,,,,,,1,,,2,,,5",
	"Eva,,,,1,,,,,,,,,,,,,,,,,,1",
	"Mo,,,,1,,,1,,,,,,2,,,,,,,,,4"
];

const chart = [];

function parse(data) {
	let i, m, a = 0.6, d = { week: [] };
	const err = data.some(row => {
		m = row.match(/^(\d{4})-(\d{2})-(\d{2}),Week\s(\d{2})/);
		if (m) {
			i = Number(m[4]);
			d.week[i] = {
				members: 0,
				used: 0,
				date: new Date(`${m[2]} ${m[3]}, ${m[1]}`),
				nth: rank(i),
				data: {
					datasets: [{
						data: [],
						backgroundColor: [],
					}],
					labels: [],
				},
			};
			d.week[i].commencing = d.week[i].date.toString().slice(4, 10);
			console.log(`Reading data for the ${d.week[i].nth} week, commencing ${d.week[i].commencing}`);
			return;
		}

		m = row.match(/^\w+/);
		if (m) {
			let c;
			switch (m[0]) {
				case 'Gabo': c = `rgba(40, 53, 147, ${a})`; break;
				case 'Karan': c = `rgba(255, 255, 0, ${a})`; break;
				case 'Sam': c = `rgba(25, 71, 105, ${a})`; break;
				case 'Danny': c = `rgba(103, 103, 104, ${a})`; break;
				default: c = `rgba(0, 0, 0, ${a})`;
			}
			
			// length + 2 due to names take up two columns
			row = row.slice(m[0].length + 2).split(/,/);
			row.forEach((num, j) => {
				row[j] = num ? Number(num) : 0;
			});
			
			d.week[i][m[0]] = {
				name: m[0],
				color: c,
				teaching: sum(row, 3, 1, 18),
				dev: sum(row, 3, 2, 18),
				review: sum(row, 3, 3, 18),
				misc: row[row.length - 3],
				leave: row[row.length - 2],
				weekly: row[row.length - 1],
			}

			d.week[i].data.datasets[0].data.push(d.week[i][m[0]].weekly);
			d.week[i].data.datasets[0].backgroundColor.push(d.week[i][m[0]].color);
			d.week[i].data.labels.push(d.week[i][m[0]].name);
			d.week[i].used += d.week[i][m[0]].weekly;
			d.week[i].members++;
			
			return;
		}
		
		m = row.match(/^,+$/);
		if (m) {
			console.log('=====');
			return;
		}
		
		return true;
	});
	
	if (err) {
		const msg = "Parse failed. Make sure the spreadsheet follows the formatting guidelines.";
		info.textContent = msg;
		throw new Error(msg);
	}
	return d;
}

// chart.js stuff
function plotChart(resource) {
	resource.week.forEach((w, i) => {
		if (!w) return;

		const canvas = document.createElement('canvas');
		setSize(canvas, 200, 230);

		document.body.appendChild(canvas);

		chart.push(new Chart(canvas.getContext('2d'), {
			type: 'polarArea',
			data: w.data,
			options: {
				responsive: false,
				title: {
					display: true,
					text: `${w.nth} Week | ${w.commencing} | ${Math.round((w.used / (w.members * 40)) * 100)}%`,
				},
				legend: {
					display: false,
				},
			},
		}));
	});
}

// utility
function setSize(e, w, h) {
	e.style.width = `${w}px`;
	e.style.height = `${h}px`;
}

function setPos(e, l, t) {
	e.style.left = `${l}px`;
	e.style.top = `${t}px`;
}

function lastOf(arr) {
	return arr[arr.length - 1];
}

function rank(n) {
	return n > 0 ?
		n + (/1$/.test(n) && n != 11 ? 'st' : /2$/.test(n) && n != 12 ? 'nd' : /3$/.test(n) && n != 13 ? 'rd' : 'th') :
		n;
}

function sum(arr, every = 1, start = 0, end = arr.length) {
	if (start < 0 || end > arr.length) {
		const msg = 'Can not sum up array due to invalid index range.';
		info.textContent = msg;
		throw new Error(msg);
	}
	let sum = 0;
	arr = arr.slice(Math.max(start - 1), end);
	arr.filter((n, i) => i % every === 0).forEach(n => sum += n);
	return sum;
}

window.onload = function() { 
	const resource = parse(result);
	plotChart(resource);
};