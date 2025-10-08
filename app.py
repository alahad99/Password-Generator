from flask import Flask, render_template, jsonify, request
import string, secrets

app = Flask(__name__)

def gen_password(length=16, lower=True, upper=True, digits=True, symbols=True):
    chars = ""
    if lower:
        chars += string.ascii_lowercase
    if upper:
        chars += string.ascii_uppercase
    if digits:
        chars += string.digits
    if symbols:
        chars += "!@#$%^&*()-_=+[]{};:,.<>?/"

    if not chars:
        return None
    
    return ''.join(secrets.choice(chars) for _ in range(length))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    try:
        data = request.get_json(silent=True)  # silent=True দিলে JSON না পেলে None রিটার্ন করে
        if not data:
            return jsonify({'error': 'Invalid or empty JSON body'}), 400
        
        length = int(data.get('length', 16))
        lower = bool(data.get('lower', True))
        upper = bool(data.get('upper', True))
        digits = bool(data.get('digits', True))
        symbols = bool(data.get('symbols', True))

        password = gen_password(length, lower, upper, digits, symbols)
        if not password:
            return jsonify({'error': 'No character set selected!'}), 400

        return jsonify({'password': password})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
