from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import yt_dlp
import os
import uuid
import tempfile

app = Flask(__name__)
CORS(app, origins="*")  # allow React frontend to communicate

# Add rate limiter: 1 request per minute per IP
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["1 per minute"]
)

@app.route('/api/download', methods=['POST'])
@limiter.limit("1 per minute")  # Optional: per-route limit
def download_video():
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    try:
        temp_dir = tempfile.gettempdir()
        filename = f"{uuid.uuid4()}.mp4"
        filepath = os.path.join(temp_dir, filename)

        ydl_opts = {
            'format': 'bestvideo+bestaudio/best',
            'outtmpl': filepath,
            'merge_output_format': 'mp4',
            'quiet': True
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        return send_file(filepath, as_attachment=True, download_name=filename)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)
