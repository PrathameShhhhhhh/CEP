
let contentCache = null;
// Configure API base URL. If your backend is hosted elsewhere, set API_BASE_URL
// for example: const API_BASE_URL = 'https://your-backend.example.com';
// On GitHub Pages the frontend is served as static files, so the backend won't
// be available at http://127.0.0.1:5000. Default to same origin (''), which
// will make fetch('/api/...') requests — useful if you deploy backend under
// the same domain or use a proxy. The code also contains a client-side
// fallback `CLIENT_BLOOD_GROUPS` so the site works fully static.
const API_BASE_URL = '';

// Client-side fallback data (copied from backend) so GitHub Pages can work
// without a backend. Kept as last-resort; backend responses still preferred.
const CLIENT_BLOOD_GROUPS = {
	"A+": { "description": "• Has A antigens and Rh factor, with anti-B antibodies. \n•	Fairly common: about 30–35% of the world population.\n•	Can receive from A+, A–, O+, O–.\n•	If mixed wrongly → risk of hemolytic reaction, kidney failure, shock.", "donate": ["A+","AB+"], "receive": ["A+","A-","O+","O-"] },
	"A-": { "description": "• A antigens only, anti-B and anti-Rh antibodies.\n• Less common: about 6–7% globally.\n• Can receive from A–, O–.\n• Wrong transfusion → immune attack on donor cells → anemia, jaundice, clotting issues.", "donate": ["A+","A-","AB+","AB-"], "receive": ["A-","O-"] },
	"B+": { "description": "• Has B antigens and Rh factor, with anti-A antibodies.\n• Around 8–10% of world population.\n• Can receive from B+, B–, O+, O–.\n• Wrong mix → blood clotting, red cell destruction, organ damage.", "donate": ["B+","AB+"], "receive": ["B+","B-","O+","O-"] },
	"B-": { "description": "• B antigens only, anti-A and anti-Rh antibodies.\n• Rare: about 1–2% worldwide.\n• Can receive from B–, O–.\n• Wrong mix → acute hemolytic transfusion reaction (AHTR).", "donate": ["B+","B-","AB+","AB-"], "receive": ["B-","O-"] },
	"AB+": { "description": "• Has A and B antigens plus Rh factor, no antibodies.\n• Rare but significant: 4–5% of world.\n• Universal recipient (can take from all groups).\n• Wrong mix rare, but if occurs → immune complications and transfusion reaction.", "donate": ["AB+"], "receive": ["A+","A-","B+","B-","AB+","AB-","O+","O-"] },
	"AB-": { "description": "• A and B antigens, anti-Rh antibodies.\n• Very rare: 0.5–1% globally.\n• Can receive from AB–, A–, B–, O–.\n• Wrong transfusion → rapid red cell destruction → multi-organ failure.", "donate": ["AB+","AB-"], "receive": ["A-","B-","AB-","O-"] },
	"O+": { "description": "• No A or B antigens, Rh factor present, anti-A and anti-B antibodies.\n• Most common: 37–40% of world.\n• Can donate to all positives, receive from O+ and O–.\n• Wrong mix → life-threatening hemolysis, shock.", "donate": ["O+","A+","B+","AB+"], "receive": ["O+","O-"] },
	"O-": { "description": "• No A, B, or Rh antigens; has both anti-A, anti-B, and anti-Rh antibodies.\n• Very rare: 1–2% globally, but crucial.\n• Known as universal donor (safe for all groups).\n• Wrong transfusion → severe transfusion reaction and high mortality risk.", "donate": ["O+","O-","A+","A-","B+","B-","AB+","AB-"], "receive": ["O-"] }
};

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
			const response = await fetch((API_BASE_URL || '') + '/api/bloodinfo', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({ blood_group })
						});
						const data = await response.json();
			// If backend returned an error or is not available, fall back
			// to client-side data.
			let result = data;
			if (!data || data.error) {
			    const fallback = CLIENT_BLOOD_GROUPS[blood_group];
			    if (fallback) {
				result = { blood_group, description: fallback.description, can_donate_to: fallback.donate, can_receive_from: fallback.receive };
			    }
			}
						const content = contentCache || await fetch('content.json').then(r => r.json());
			if (result && result.blood_group) {
				html = `
					<h2>${content.labels.result}</h2>
					<p><strong>${content.labels.blood_group}:</strong> ${result.blood_group}</p>
					<p><strong>${content.labels.description}:</strong> ${result.description}</p>
					<p><strong>${content.labels.can_donate_to}:</strong> ${result.can_donate_to.join(', ')}</p>
					<p><strong>${content.labels.can_receive_from}:</strong> ${result.can_receive_from.join(', ')}</p>
				`;
			} else {
				html = `<span class='error'>${content.labels.error}: ${data && data.error ? data.error : 'No data available.'}</span>`;
			}
				} catch (err) {
						const content = contentCache || await fetch('content.json').then(r => r.json());
			// Try client-side fallback when fetch throws (CORS / network / backend down)
			const fallback = CLIENT_BLOOD_GROUPS[blood_group];
			if (fallback) {
			    html = `
				<h2>${content.labels.result}</h2>
				<p><strong>${content.labels.blood_group}:</strong> ${blood_group}</p>
				<p><strong>${content.labels.description}:</strong> ${fallback.description}</p>
				<p><strong>${content.labels.can_donate_to}:</strong> ${fallback.donate.join(', ')}</p>
				<p><strong>${content.labels.can_receive_from}:</strong> ${fallback.receive.join(', ')}</p>
			    `;
			} else {
			    html = `<span class='error'>${content.labels.error}: Error connecting to server.</span>`;
			}
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
				fetch((API_BASE_URL || '') + '/api/bloodinfo', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ blood_group: bg1 })
				}).catch(() => null),
				fetch((API_BASE_URL || '') + '/api/bloodinfo', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ blood_group: bg2 })
				}).catch(() => null)
			]);
			const maybeJson = async (r, bg) => {
			    if (!r) return { fallback: true, data: CLIENT_BLOOD_GROUPS[bg] ? { blood_group: bg, description: CLIENT_BLOOD_GROUPS[bg].description, can_donate_to: CLIENT_BLOOD_GROUPS[bg].donate, can_receive_from: CLIENT_BLOOD_GROUPS[bg].receive } : null };
			    try {
				const d = await r.json();
				return { fallback: false, data: d };
			    } catch (e) {
				return { fallback: true, data: CLIENT_BLOOD_GROUPS[bg] ? { blood_group: bg, description: CLIENT_BLOOD_GROUPS[bg].description, can_donate_to: CLIENT_BLOOD_GROUPS[bg].donate, can_receive_from: CLIENT_BLOOD_GROUPS[bg].receive } : null };
			    }
			};
			const [{data: data1}, {data: data2}] = await Promise.all([maybeJson(res1, bg1), maybeJson(res2, bg2)]);
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
