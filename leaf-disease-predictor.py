from flask import Flask, request, jsonify
from PIL import Image
import numpy as np

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files['image']
    image = Image.open(file.stream).convert('RGB')

    if np.prod(image.size) > 100000:
        result = "Healthy"
    else:
        result = "Diseased"

    return jsonify({"prediction": result})

if __name__ == "__main__":
    app.run(port=5000)
