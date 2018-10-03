var config = {
type: 'doughnut',
data: {
	
	datasets: [{
		data: [20, 40, 40],
		backgroundColor: ['#24bc98','#236825','#f69040'],
		borderColor: [
			'rgba(255,255,255,0.5)',
			'rgba(255,255,255,0.5)',
			'rgba(255,255,255,0.5)',
			'rgba(255,255,255,0.5)',
			'rgba(255,255,255,0.5)',
		],
		borderWidth: 1,
		label: 'Dataset 1'
	}],
	labels: [
		'Marketing',
		'Expansion',
		'Infrastructure'
	]
},
options: {
	responsive: true,
	legend: {
	  display: false,
	},
	title: {
	  display: false,
	  text: 'Token Allocation'
	},
	pieceLabel: {
		render: 'percentage',
		fontColor: ['#24bc98','#236825','#f69040'],
		fontSize: 14,
		fontStyle: 'bold',
		position: 'inside',
		precision: 1
	},
	animation: {
	  animateScale: true,
	  animateRotate: true
	}
}
};

var config2 = {
type: 'doughnut',
data: {
	
	datasets: [{
		data: [39, 21, 20, 11.5, 5, 2.5, 1],
		backgroundColor: ['#24bc98','#236825','#f69040','#0eadc9','#f17776','#5b5da8','#ffea00'],
		borderColor: [
			'rgba(255,255,255,0.5)',
			'rgba(255,255,255,0.5)',
			'rgba(255,255,255,0.5)',
			'rgba(255,255,255,0.5)',
			'rgba(255,255,255,0.5)',
			'rgba(255,255,255,0.5)',
			'rgba(255,255,255,0.5)',
		],
		borderWidth: 0,
		label: 'Dataset 1'
	}],
	labels: [
		'Crowdsales',
		'Reserves',
		'Proof of Devotion Pool',
		'Team / Management',
		'Market Acquisition & Expansion',
		'Bounty and Marketing',
		'Advisors'
	]
},
options: {
	responsive: true,
	legend: {
	  display: false,
	},
	title: {
	  display: false,
	  text: 'Token Distribution'
	},
	pieceLabel: {
		render: 'percentage',
		fontColor: ['#24bc98','#236825','#f69040','#0eadc9','#f17776','#5b5da8','#ffea00'],
		fontSize: 14,
		fontStyle: 'bold',
		position: 'inside',
		precision: 1
	},
	animation: {
	  animateScale: true,
	  animateRotate: true
	}
	
}
};

window.onload = function() {
var ctx = document.getElementById('token_sale').getContext('2d');
window.myPie = new Chart(ctx, config);
var ctx2 = document.getElementById('token_dist').getContext('2d');
window.myPie = new Chart(ctx2, config2);
};

