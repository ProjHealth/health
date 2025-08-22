from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from textblob import TextBlob
import numpy as np

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    notes = data.get('notes', [])
    moods = data.get('moods', [])
    if not notes:
        return jsonify({'error': 'No notes provided'}), 400

    # Sentiment analysis
    sentiments = [TextBlob(note).sentiment.polarity for note in notes]
    avg_sentiment = float(np.mean(sentiments)) if sentiments else 0

    # Mood distribution
    mood_counts = {}
    for m in moods:
        mood_counts[m] = mood_counts.get(m, 0) + 1

    # Clustering notes (optional, for fun)
    if len(notes) > 1:
        vectorizer = TfidfVectorizer(stop_words='english')
        X = vectorizer.fit_transform(notes)
        n_clusters = min(3, len(notes))
        kmeans = KMeans(n_clusters=n_clusters, random_state=0, n_init=10)
        labels = kmeans.fit_predict(X)
    else:
        labels = [0] * len(notes)

    return jsonify({
        'average_sentiment': avg_sentiment,
        'mood_distribution': mood_counts,
        'note_clusters': labels,
        'sentiments': sentiments
    })

if __name__ == '__main__':
    app.run(port=8000, debug=True)
