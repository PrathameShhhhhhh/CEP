
let contentCache = null;
fetch('content.json')
	.then(res => res.json())
	.then(content => {
		contentCache = content;
		document.title = content.title;
		document.getElementById('pageTitle').textContent = content.title;
		document.getElementById('mainTitle').textContent = content.title;
		document.getElementById('labelBloodGroup').textContent = content.labels.blood_group + ':';
		document.getElementById('submitBtn').textContent = content.labels.submit;

		// Populate all blood group selects
		const bloodGroupSelect = document.getElementById('blood_group');
		const bloodGroup1 = document.getElementById('blood_group1');
		const bloodGroup2 = document.getElementById('blood_group2');
		const options = '<option value="">Select</option>' +
			content.blood_groups.map(bg => `<option value="${bg}">${bg}</option>`).join('');
		if (bloodGroupSelect) bloodGroupSelect.innerHTML = options;
		if (bloodGroup1) bloodGroup1.innerHTML = options;
		if (bloodGroup2) bloodGroup2.innerHTML = options;
	});

// Operation choice logic
const infoBtn = document.getElementById('infoBtn');
const compareBtn = document.getElementById('compareBtn');
const singleFields = document.getElementById('singleGroupFields');
const compareFields = document.getElementById('compareGroupFields');

infoBtn.addEventListener('click', () => {
	infoBtn.classList.add('selected');
	compareBtn.classList.remove('selected');
	singleFields.style.display = '';
	compareFields.style.display = 'none';
});
compareBtn.addEventListener('click', () => {
	compareBtn.classList.add('selected');
	infoBtn.classList.remove('selected');
	singleFields.style.display = 'none';
	compareFields.style.display = '';
});

// Dialog/modal logic
const dialog = document.getElementById('dialog');
const dialogResult = document.getElementById('result');
const closeDialog = document.getElementById('closeDialog');
closeDialog.onclick = () => { dialog.style.display = 'none'; };
window.onclick = (e) => { if (e.target === dialog) dialog.style.display = 'none'; };

document.getElementById('bloodForm').addEventListener('submit', async function(e) {
		e.preventDefault();
		let html = '';
		if (infoBtn.classList.contains('selected')) {
				// Single blood group info
				const blood_group = document.getElementById('blood_group').value;
				if (!blood_group) {
						dialogResult.innerHTML = `<span class='error'>Please select a blood group.</span>`;
						dialog.style.display = 'flex';
						return;
				}
				dialogResult.innerHTML = 'Checking...';
				dialog.style.display = 'flex';
				try {
						const response = await fetch('http://127.0.0.1:5000/api/bloodinfo', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({ blood_group })
						});
						const data = await response.json();
						const content = contentCache || await fetch('content.json').then(r => r.json());
						if (data.error) {
								html = `<span class='error'>${content.labels.error}: ${data.error}</span>`;
						} else {
								html = `
										<h2>${content.labels.result}</h2>
										<p><strong>${content.labels.blood_group}:</strong> ${data.blood_group}</p>
										<p><strong>${content.labels.description}:</strong> ${data.description}</p>
										<p><strong>${content.labels.can_donate_to}:</strong> ${data.can_donate_to.join(', ')}</p>
										<p><strong>${content.labels.can_receive_from}:</strong> ${data.can_receive_from.join(', ')}</p>
								`;
						}
				} catch (err) {
						const content = contentCache || await fetch('content.json').then(r => r.json());
						html = `<span class='error'>${content.labels.error}: Error connecting to server.</span>`;
				}
		} else {
				// Compare two blood groups
				const bg1 = document.getElementById('blood_group1').value;
				const bg2 = document.getElementById('blood_group2').value;
				if (!bg1 || !bg2) {
						dialogResult.innerHTML = `<span class='error'>Please select both blood groups.</span>`;
						dialog.style.display = 'flex';
						return;
				}
				dialogResult.innerHTML = 'Comparing...';
				dialog.style.display = 'flex';
				try {
						const [res1, res2] = await Promise.all([
								fetch('http://127.0.0.1:5000/api/bloodinfo', {
										method: 'POST',
										headers: { 'Content-Type': 'application/json' },
										body: JSON.stringify({ blood_group: bg1 })
								}),
								fetch('http://127.0.0.1:5000/api/bloodinfo', {
										method: 'POST',
										headers: { 'Content-Type': 'application/json' },
										body: JSON.stringify({ blood_group: bg2 })
								})
						]);
						const [data1, data2] = await Promise.all([res1.json(), res2.json()]);
						const content = contentCache || await fetch('content.json').then(r => r.json());
						if (data1.error || data2.error) {
								html = `<span class='error'>${content.labels.error}: ${data1.error || data2.error}</span>`;
						} else {
								html = `
								<h2>Comparison Result</h2>
								<div class="compare-table">
									<div class="compare-col">
										<h3>${data1.blood_group}</h3>
										<p><strong>${content.labels.description}:</strong> ${data1.description}</p>
										<p><strong>${content.labels.can_donate_to}:</strong> ${data1.can_donate_to.join(', ')}</p>
										<p><strong>${content.labels.can_receive_from}:</strong> ${data1.can_receive_from.join(', ')}</p>
									</div>
									<div class="compare-col">
										<h3>${data2.blood_group}</h3>
										<p><strong>${content.labels.description}:</strong> ${data2.description}</p>
										<p><strong>${content.labels.can_donate_to}:</strong> ${data2.can_donate_to.join(', ')}</p>
										<p><strong>${content.labels.can_receive_from}:</strong> ${data2.can_receive_from.join(', ')}</p>
									</div>
								</div>
								`;
						}
				} catch (err) {
						const content = contentCache || await fetch('content.json').then(r => r.json());
						html = `<span class='error'>${content.labels.error}: Error connecting to server.</span>`;
				}
		}
		dialogResult.innerHTML = html;
		dialog.style.display = 'flex';
});
