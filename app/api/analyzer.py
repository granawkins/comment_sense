import re, sys, json
import spacy
import time
from spacytextblob.spacytextblob import SpacyTextBlob


class Analyzer():

    def __init__(self, env, database):
        self.env = env
        self.db = database
        self.nlp = spacy.load('en_core_web_trf')
        self.nlp.add_pipe('spacytextblob')
        
    def clean(self, dirty):
        clean = dirty.lower().strip()
        clean = re.sub("(\'s)", "", clean)
        clean = re.sub(r'<.*?( \/)*>', '', clean)
        return clean

    def stream(self, n, progress, comment_pipeline, topics_pipeline, initialized, aborted):
        try:
            analyzed = 0
            wait_time = 1
            killswitch = 0
            while (analyzed < n) & (not aborted.is_set()):
                if killswitch > 10:
                    aborted.set()
                    raise NameError('Killswitch Engaged!!')
                t1 = time.time()
                # comments = comment_pipeline.get()
                comments = []
                qsize = comment_pipeline.qsize()
                for _ in range(qsize):
                    comments.extend(comment_pipeline.get())
                if len(comments) > 0:
                    killswitch = 0
                    analyzed_comments = self.analyze(comments)
                    analyzed += len(analyzed_comments)
                    progress['analyzed'] = analyzed
                    topics_pipeline.put(analyzed_comments)
                    # print(f'Analyzed {len(analyzed_comments)} comments in {time.time() - t2}s')
                elif initialized.is_set():
                    killswitch += 1
                time_left = t1 + wait_time - time.time()
                time.sleep(max(0, time_left))
        except:
            print("Analyzer aborted:", sys.exc_info()[0])
            aborted.set()

    def analyze(self, comments):
        results = []
        for c in comments:
            doc = self.nlp(c['text'])
            c['sentiment'] = doc._.polarity
            topics = []
            ents = []
            for ent in doc.ents:
                ent_text = self.clean(ent.text)
                ents.append(ent_text)
                topics.append((ent_text, ent.start, ent.end, ent.label_))
            for chunk in doc.noun_chunks:
                start, end = chunk.start, chunk.end
                for token in chunk:
                    if not token.is_stop:
                        break
                    start += 1 # Remove stop words from start
                span = doc[start:end]
                span_text = self.clean(span.text)
                if (not span) | (span_text in ents) | (span_text == ""):
                    pass; # Avoid duplicates
                topics.append((span_text, span.start, span.end, 'NOUN_CHUNK'))
            c['topics'] = json.dumps(topics)
            self.db.add_comment(c)
            results.append({
                'id': c['id'], 
                'likes': c['likes'], 
                'sentiment': c['sentiment'], 
                'topics': c['topics']})
        return results