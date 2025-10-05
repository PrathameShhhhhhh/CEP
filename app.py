

# Flask backend for blood group information
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Serve content.json for frontend
@app.route('/content.json')
def serve_content():
	return send_from_directory('.', 'content.json')

# Blood group compatibility and info
BLOOD_GROUPS = {
	"A+": {
		"description": "	• Has A antigens and Rh factor, with anti-B antibodies. \n•	Fairly common: about 30–35% of the world population.\n•	Can receive from A+, A–, O+, O–.\n•	If mixed wrongly → risk of hemolytic reaction, kidney failure, shock.",
		"donate": ["A+", "AB+"],
		"receive": ["A+", "A-", "O+", "O-"]
	},
	"A-": {
		"description": "	• A antigens only, anti-B and anti-Rh antibodies.\n• Less common: about 6–7% globally.\n• Can receive from A–, O–.\n• Wrong transfusion → immune attack on donor cells → anemia, jaundice, clotting issues.",
		"donate": ["A+", "A-", "AB+", "AB-"],
		"receive": ["A-", "O-"]
	},
	"B+": {
		"description": "	• Has B antigens and Rh factor, with anti-A antibodies.\n• Around 8–10% of world population.\n• Can receive from B+, B–, O+, O–.\n• Wrong mix → blood clotting, red cell destruction, organ damage.",
		"donate": ["B+", "AB+"],
		"receive": ["B+", "B-", "O+", "O-"]
	},
	"B-": {
		"description": "	• B antigens only, anti-A and anti-Rh antibodies.\n• Rare: about 1–2% worldwide.\n• Can receive from B–, O–.\n• Wrong mix → acute hemolytic transfusion reaction (AHTR).",
		"donate": ["B+", "B-", "AB+", "AB-"],
		"receive": ["B-", "O-"]
	},
	"AB+": {
		"description": "	• Has A and B antigens plus Rh factor, no antibodies.\n• Rare but significant: 4–5% of world.\n• Universal recipient (can take from all groups).\n• Wrong mix rare, but if occurs → immune complications and transfusion reaction.",
		"donate": ["AB+"],
		"receive": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
	},
	"AB-": {
		"description": "	• A and B antigens, anti-Rh antibodies.\n• Very rare: 0.5–1% globally.\n• Can receive from AB–, A–, B–, O–.\n• Wrong transfusion → rapid red cell destruction → multi-organ failure.",
		"donate": ["AB+", "AB-"],
		"receive": ["A-", "B-", "AB-", "O-"]
	},
	"O+": {
		"description": "	• No A or B antigens, Rh factor present, anti-A and anti-B antibodies.\n• Most common: 37–40% of world.\n• Can donate to all positives, receive from O+ and O–.\n• Wrong mix → life-threatening hemolysis, shock.",
		"donate": ["O+", "A+", "B+", "AB+"],
		"receive": ["O+", "O-"]
	},
	"O-": {
		"description": "	• No A, B, or Rh antigens; has both anti-A, anti-B, and anti-Rh antibodies.\n• Very rare: 1–2% globally, but crucial.\n• Known as universal donor (safe for all groups).\n• Wrong transfusion → severe transfusion reaction and high mortality risk.",
		"donate": ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
		"receive": ["O-"]
	}
}

@app.route("/api/bloodinfo", methods=["POST"])
def blood_info():
	data = request.get_json()
	blood_group = data.get("blood_group", "").upper()
	if blood_group not in BLOOD_GROUPS:
		return jsonify({"error": "Invalid blood group."})
	info = BLOOD_GROUPS[blood_group]
	return jsonify({
		"blood_group": blood_group,
		"description": info["description"],
		"can_donate_to": info["donate"],
		"can_receive_from": info["receive"]
	})

if __name__ == "__main__":
	app.run(debug=True)
