let chart, legend, sel;
const da = '\n\u21d3\n';	// down arrow 
const tips = {
	// add priorities for each member
	Danny: `Danny's priorities`,
	Ding: `JS focused content dev${da}Content debug${da}Platform dev${da}...`,
	Eva: `Eva's priorities`,
	Gabo: `Gabo's priorities`,
	JT: `JT's priorities`,
	Karan: `Karan's priorities`,
	Mike: `Mike's priorities`,
	Mo: `Mo's priorities`,
	Sam: `Sam's priorities`,
};
const localData = [
	"2018-03-26,Week 13,,,,,,,,,,,,,,,,,,,",
	"Karan,,2.2,2.4,1.7,1,0,2.8,2.2,1.9,3.7,3.4,1,2.9,0.7,2.9,2.2,,,,31",
	"Mike,,1.3,3.6,0.1,2.6,2.1,3.5,0.5,2.8,2.8,0.7,0.4,1.9,1.1,1.6,2.3,2,1,2,27.3",
	"Gabo,,2.8,0.6,0.7,2.7,1.6,1.2,3.1,2.1,3,3.8,3.8,3.8,0.1,0.3,2.6,,,,32.2",
	"Sam,,1.6,3.8,0.2,0.3,1.3,3.8,3.3,3.4,1.4,3.9,0,0.6,1.4,0.9,1.5,,,,27.4",
	"Danny,,2.6,3.2,3.2,2.3,3.6,1.4,0.3,3.9,1.2,2.7,3.4,2.3,2.9,1.9,1.2,,,,36.1",
	"JT,,3.5,2.3,3.8,0.7,0.3,1.2,0.6,2.4,3,1.2,3.1,0.6,3.2,2.7,1.8,,,32,30.4",
	"Ding,,1.2,0,3.9,2.3,1.8,3.4,3.1,1.2,3.8,0.8,0.4,2.3,0.7,1.4,1.3,1,12,,27.6",
	"Eva,,0.6,0.7,2.1,3.5,3.9,3.4,0.9,2.6,0.2,3.8,0.6,1.2,1.7,1.2,1.1,,,,27.5",
	"Mo,,3.7,1.9,1.8,1.4,2.6,3,2.2,2.2,2.7,1.6,2.4,0.2,1.1,3.4,2.8,1,,,33",
	",,,,,,,,,,,,,,,,,,,,",
	"2018-03-19,Week 12,,,,,,,,,,,,,,,,,,,",
	"Karan,,1.9,2.3,1.3,1.2,3,3.7,2,3.9,3.6,0.5,1.7,0.6,3,4,1.4,,,,34.1",
	"Mike,,2.1,3.6,1.8,2.2,3.2,3.3,1.9,0.7,3.8,0.5,2,2,0.7,2.2,2.7,2,1,2,32.7",
	"Gabo,,1.8,0.3,0.7,1.1,1.2,2.8,0.6,3.4,2.5,0.1,0.8,3.3,1.7,3.3,3.8,,,,27.4",
	"Sam,,0.1,3.1,1.5,1.2,1.5,1.3,2.5,3.2,0.8,1.9,2.6,0.5,2,2.4,0.9,,,,25.5",
	"Danny,,3.3,1.4,0.2,3.9,1.9,2.4,3.8,1.9,2.9,3.7,1.9,1.7,1.1,2.5,0.8,,,,33.4",
	"JT,,0,0.7,0.2,2.6,0.3,0.7,0.4,2.7,1.8,0.8,0.6,0.2,1.4,3.5,0.2,,,32,16.1",
	"Ding,,0.7,3.3,1.7,0.8,2.4,2.8,1.2,3.6,2.7,0.3,3.4,1.8,1.3,0.3,0.9,1,12,,27.2",
	"Eva,,3.3,1.6,1.2,1.1,1.9,1.6,1.7,2.2,0.7,3.1,0.6,2.5,0.3,1.7,0.7,,,,24.2",
	"Mo,,0.4,1.8,2.7,2.9,3.8,4,0.8,4,3.8,2.5,2,2,1.7,2.7,0.3,1,,,35.4",
	",,,,,,,,,,,,,,,,,,,,",
	"2018-03-12,Week 11,,,,,,,,,,,,,,,,,,,",
	"Karan,,1.5,3.2,1.3,3.1,1.3,1,2.8,3.3,2.5,1.5,1.2,1.6,2.3,2.6,1.4,,,,30.6",
	"Mike,,3,3.3,0.8,0.8,1.6,0.4,3.2,2.1,0.8,0.4,2.4,2.4,2.2,0.3,1.3,2,1,2,25",
	"Gabo,,0.6,3.5,1.3,3,3.3,0.7,1.6,1,1.1,1.8,2.3,0.3,3.1,1.4,0.8,,,,25.8",
	"Sam,,1.2,0.9,2.7,2.7,1.6,1.4,2.3,0.6,1.7,0.3,2.5,0.8,1.2,2,2.1,,,,24",
	"Danny,,0.7,3.7,0.5,0.3,3.6,0.9,1.4,3.4,2,3,2.5,3.7,1.4,3.3,0.2,,,,30.6",
	"JT,,1.1,0.6,3.4,2.7,1.2,1.8,1.5,0.7,3,1.4,2,0.3,2.8,3.6,0,,,32,26.1",
	"Ding,,2.1,3,1.8,0.7,1.5,1.5,2.8,1.7,0.6,2.7,1.4,0.4,2.8,3.2,3.3,1,12,,29.5",
	"Eva,,2,2.5,2.8,1.6,3.5,0.3,2.1,3.8,0.5,0.4,0.9,2.4,2.6,0.4,3,,,,28.8",
	"Mo,,0.3,0.2,1.8,1,0.7,2.5,0.8,1.3,3.7,2.4,2.4,0.5,3.8,0.7,0.8,1,,,22.9",
	",,,,,,,,,,,,,,,,,,,,",
	"2018-03-05,Week 10,,,,,,,,,,,,,,,,,,,",
	"Karan,,1.8,2.8,1.7,0.2,0.9,1.6,2.2,1.8,2.7,3.9,3.7,3.3,3.9,3.7,0.9,,,,35.1",
	"Mike,,0,1.4,0.3,2.6,3.2,0.7,3.3,3.5,2.9,3.4,1.8,0.7,2.7,0.2,0.9,2,1,2,27.6",
	"Gabo,,1.2,3.3,1.6,2.7,0.1,1.7,0.6,2.6,0.6,3.3,0.5,3.2,2.9,3.4,3.2,,,,30.9",
	"Sam,,0.4,1.6,1.9,2.3,3.4,3.5,1.2,1.4,3.9,1.2,1.1,1.4,0.8,0.8,0.9,,,,25.8",
	"Danny,,3.5,3.8,2.4,3.4,3.2,3.9,3.2,3.5,0.6,3.3,3.1,3.4,1.8,2.1,2.5,,,,43.7",
	"JT,,3.9,1.9,3.6,2.3,2.3,3,3,2.9,2.8,1.1,1.6,3.5,1.2,2.8,3.7,,,32,39.6",
	"Ding,,0.5,0.2,0.8,3.5,1.5,3.7,0.2,4,2.3,1.9,1.2,3.6,2,2.9,3.1,1,12,,31.4",
	"Eva,,3.7,3.3,1.6,2,1.1,3.7,3.3,0.8,1,2.2,2.7,0.9,1.9,1.1,1,,,,30.3",
	"Mo,,3.3,3.8,2.4,2.8,1.5,1.2,3.4,0.9,3.7,1.1,0.5,1.3,1.7,3.2,2.5,1,,,33.3",
	",,,,,,,,,,,,,,,,,,,,",
	"2018-02-26,Week 09,,,,,,,,,,,,,,,,,,,",
	"Karan,,0.8,3,3.6,3.3,0.3,2.7,1.5,1.5,0.6,3.3,3.6,2.4,1.9,1.9,1.6,,,,32",
	"Mike,,1.2,3.5,3.8,2.3,2,2.8,0.4,0.4,1.3,1.2,1.9,2.3,2.4,0.4,0.5,2,1,2,26.4",
	"Gabo,,0.9,1.6,1.3,0.6,1.4,3,1.9,2.7,2.4,2.1,0.9,2.5,0.9,3,3.2,,,,28.4",
	"Sam,,3.1,1,0.4,3.9,2.1,0.5,2,2.3,3.6,3.3,3.4,2,3.6,2.7,0.8,,,,34.7",
	"Danny,,1.1,1.1,2.2,2.3,3.6,2.2,0.7,3,0.1,3.1,1.6,0.8,2,0.8,3.3,,,,27.9",
	"JT,,3.2,1.9,2.2,3.5,2.3,0.8,1.7,0.9,1.3,0.8,0.8,1.6,3,0.4,1.3,,,32,25.7",
	"Ding,,4,2.1,1.8,3.3,3.7,0.7,0.4,3.4,0.7,1.3,0,3.5,1.2,3.4,0.5,1,12,,30",
	"Eva,,1.6,1.9,0.1,0.5,2.5,0.8,1,3.4,0.9,2.8,2.7,1,3,2.3,2.1,,,,26.6",
	"Mo,,3.5,2.9,4,1.5,0.3,1.9,2.4,3,0.9,1.5,2.3,1.6,1.7,0.2,2.8,1,,,30.5"
];

// load spreadsheet data
function loadData() {
	console.clear();
	
	// comment out line 76 - 78 to load data from google sheet
	const resource = parse(localData);
	plotChart(resource);
	return;

    // url of the spread sheet
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZ6WKFexYSFuNXZPAcaxJ1HQZhCdFzQxU5VH2NdZzZrwL0h0APPJPVGeZVh0715pzfx7AODQfGv9bO/pub?gid=943698712&single=true&output=csv';
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            const result = xhr.responseText.split(/\r?\n/);
            result.splice(0, 2);
            const resource = parse(result);
            plotChart(resource);
        }
    };
    xhr.open("GET", url, true);
    xhr.send();
}

function parse(data) {
    let i, m, a = 0.6, d = {week: []};
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
            //console.log(`Reading data for the ${d.week[i].nth} week, commencing ${d.week[i].commencing}`);
            return;
        }

        m = row.match(/^\w+/);
        if (m) {
			if (!legend.hasOwnProperty(m[0])) legend[m[0]] = {};

            switch (m[0]) {
                // members not given a colour here will be dark grey
                case 'Danny': 	legend[m[0]].colour = `rgba(125, 119, 120, ${a})`; break;
				case 'Ding': 	legend[m[0]].colour = `rgba(159, 182, 205, ${a})`; break;
                case 'Eva': 	legend[m[0]].colour = `rgba(188, 148, 246, ${a})`; break;
                case 'Gabo': 	legend[m[0]].colour = `rgba(159, 225, 231, ${a})`; break;
				case 'JT': 		legend[m[0]].colour = `rgba(230, 124, 115, ${a})`; break;
                case 'Karan': 	legend[m[0]].colour = `rgba(255, 246, 143, ${a})`; break;
				case 'Mike': 	legend[m[0]].colour = `rgba(97, 60, 162, ${a})`; break;
				case 'Mo': 		legend[m[0]].colour = `rgba(29, 209, 51, ${a})`; break;
                case 'Sam': 	legend[m[0]].colour = `rgba(179, 238, 58, ${a})`; break;
                default: 		legend[m[0]].colour = `rgba(0, 0, 0, ${a})`;
			}

            // length + 2 due to names take up two columns
            row = row.slice(m[0].length + 2).split(/,/);
            row.forEach((num, j) => {
                row[j] = num ? Number(num) : 0;
            });

            d.week[i][m[0]] = {
                name: m[0],
                teaching: sum(row, 3, 1, 15),
                dev: sum(row, 3, 2, 15),
                review: sum(row, 3, 3, 15),
                misc: row[row.length - 3],
                leave: row[row.length - 2],
                weekly: row[row.length - 1],
            }

			d.week[i].data.datasets[0].data.push(d.week[i][m[0]].weekly);
            d.week[i].data.datasets[0].backgroundColor.push(legend[m[0]].colour);
            d.week[i].data.labels.push(d.week[i][m[0]].name);
			d.week[i].used += d.week[i][m[0]].weekly;
            d.week[i].members++;

            return;
        }

        m = row.match(/^,+$/);
        if (m) {
            //console.log('=====');
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
	Object.keys(legend).sort().forEach(name => {
		const card = document.createElement('div');
		card.className = 'card';
		card.textContent = name;
		card.style.background = legend[name].colour;
		card.style.opacity = '0.3';

		card.onclick = function() {
			this.selected = !this.selected;
			this.style.opacity = this.selected ? '1' : '0.3';
			filterByMember(resource.week, name, this.selected);
		};

		card.onmouseenter = function() {
			tooltip.style.opacity = '1';
			tooltip.textContent = tips[name];
		};

		card.onmouseleave = function() {
			tooltip.style.opacity = '0';
		};
		
		legend[name].card = card;
		legendBox.appendChild(legend[name].card);
	});

    resource.week.forEach((w, i) => {
        if (!w) return;

		const canvas = document.createElement('canvas');
		canvas.style.display = 'inline-block';
        // size of each chart
        setSize(canvas, 180, 200);
        chartBox.appendChild(canvas);

        canvas.onclick = function() {
          	this.selected = !this.selected;
			this.style.borderWidth = this.selected ? '2px' : '0';
			sel.chart.used += (this.selected ? w.used : -w.used);
			sel.chart.count += (this.selected ? 1 : -1);

			if (sel.chart.count) {
				const o = round((sel.chart.used / (sel.chart.count * w.members * 40)) * 100, 1);				
				info.textContent = `Overall Capacity: ${o}%`;
			}
			else {
				info.textContent = 'Click to select specific week(s)';
			}
        };

        chart.push(new Chart(canvas.getContext('2d'), {
            type: 'polarArea',
            data: w.data,
            options: {
				responsive: false,
				animation: {
					duration: 250,
				},
                title: {
                    display: true,
                    text: `${w.nth} | ${w.commencing} | ${round((w.used / (w.members * 40)) * 100, 1)}%`,
                  	fontColor: 'black',
                },
                legend: {
                    display: false,
                },
            },
        }));
    });
}

function filterByMember(w, m, toggle) {
	sel.member.count += (toggle ? 1 : -1);
	// modify each chart
	chart.forEach(c => {
		// i = nth week
		let i = c.options.title.text.match(/^\d+/)[0];
		// if name card selection is non-zero
		if (sel.member.count) {
			// toggle on
			if (toggle) {
				if (c.data.labels.includes(m)) {
					// remove all data from chart
					c.data.datasets[0].data = [];
					c.data.datasets[0].backgroundColor = [];
					c.data.labels = [];
					sel.member.used[i] = 0;
				}
				c.data.datasets[0].data.push(w[i][m].weekly);
				c.data.datasets[0].backgroundColor.push(legend[m].colour);
				c.data.labels.push(m);

				sel.member.used[i] += w[i][m].weekly;
			}
			// toggle off
			else {
				const j = c.data.labels.indexOf(m);
				c.data.datasets[0].data.splice(j, 1);
				c.data.datasets[0].backgroundColor.splice(j, 1);
				c.data.labels.splice(j, 1);
				
				sel.member.used[i] -= w[i][m].weekly;
			}
			// update capacity percentage based on filter selection
			c.options.title.text = c.options.title.text.replace(/\d+(\.\d+)?%/, `${round(((sel.member.used[i]) / (sel.member.count * 40)) * 100, 1)}%`);
		}
		else {
			// add data for all members to chart
			Object.keys(w[i]).forEach(name => {
				if (w[i][name].hasOwnProperty('name') && name !== m) {
					c.data.datasets[0].data.push(w[i][name].weekly);
					c.data.datasets[0].backgroundColor.push(legend[name].colour);
					c.data.labels.push(name);
				}
			});
			// show capacity percentage for entire team
			c.options.title.text = c.options.title.text.replace(/\d+(\.\d+)?%/, `${round((w[i].used / (w[i].members * 40)) * 100, 1)}%`);
		}
		c.update();
	});
}

function iniVar() {
	chart = [];
	legend = [];
	sel = {
		member: {count: 0, used: []},
		chart: {count: 0, used: 0},
	};
}

// function reset() {
// 	const canvas = document.getElementsByTagName('canvas');
// 	Array.from(canvas).forEach(c => chartBox.removeChild(c));
// 	Object.keys(legend).forEach(name => legendBox.removeChild(legend[name].card));

// 	iniVar();
// 	selMember = [];
// 	info.textContent = 'Click to select specific week(s)';
// }

// utility
function setSize(e, w, h) {
    e.style.width = `${w}px`;
    e.style.height = `${h}px`;
}

function setPos(e, l, t) {
    e.style.left = `${l}px`;
    e.style.top = `${t}px`;
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

function round(v, decimal = 0, op = Math.round) {
    if (op !== Math.round && op !== Math.ceil && op !== Math.floor) {
        throw new Error(`Invalid operation parametre: ${op}.`);
    }
    else if (!Number.isInteger(decimal) || decimal < 0) {
        throw new Error(`Invalid decimal parametre: ${decimal}.`);
    }

    if (decimal) {
        const mod = Math.pow(10, decimal);
        return op(v * mod) / mod;
    } else {
        return op(v);
    }
}

// events
// btnLoad.onclick = function() {
// 	reset();
//     loadData();
// };

window.onload = function() {
	iniVar();
    loadData();
};

window.onmousemove = function(evt) {
	setPos(tooltip, evt.clientX, evt.clientY);
};//bsd-disable infinite-loop-detection