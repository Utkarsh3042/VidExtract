from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import yt_dlp
import os
import uuid
import tempfile

app = Flask(__name__)
CORS(app, origins="*")  # allow React frontend to communicate

@app.route('/api/download', methods=['POST'])
def download_video():
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    try:
        temp_dir = tempfile.gettempdir()
        outtmpl = os.path.join(temp_dir, '%(title)s.%(ext)s')

        ydl_opts = {
            'format': 'bestvideo+bestaudio/best',
            'outtmpl': outtmpl,
            'merge_output_format': 'mp4',
            'quiet': True
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            result = ydl.extract_info(url, download=True)
            # Get the actual filename
            filename = ydl.prepare_filename(result)
            # If merged, extension might be .mp4
            if 'requested_downloads' in result:
                ext = result['ext']
                filename = filename.rsplit('.', 1)[0] + '.' + ext

        return send_file(filename, as_attachment=True, download_name=os.path.basename(filename))

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)
