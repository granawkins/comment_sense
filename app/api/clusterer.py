import html, sys, time, json
from collections import Counter
from itertools import combinations

class Clusterer():

    def __init__(self, video_data, db):
        self.db = db
        self.video_data = video_data
        self.all_topics = db.comment_topics(video_data['id'])

    def stream(self, n, progress, topics_pipeline, initialized, aborted):
        try:
            wait_time = 1
            killswitch = 0
            while (self.video_data['n_analyzed'] < n) & (not aborted.is_set()):
                if killswitch > 100:
                    aborted.set()
                    raise NameError('Killswitch Engaged!!')
                t1 = time.time()
                if not topics_pipeline.empty():
                    killswitch = 0
                    # Update clustered topics
                    self.all_topics.extend(topics_pipeline.get())
                    new_topics = cluster(self.all_topics)
                    topics_data = [{
                        'token': token,
                        'toks': toks,
                        'score': n,
                        'likes': likes,
                        'sentiment': sentiment,
                        'type': label,
                        'comments': commentIds
                    } for (token, toks, label, n, likes, sentiment, commentIds) in new_topics]
                    self.video_data['n_analyzed'] = len(self.all_topics)
                    self.video_data['topics'] = json.dumps(topics_data)

                    # Return newest
                    progress['topics'] = self.video_data['topics']
                    progress['clustered'] = self.video_data['n_analyzed']
                elif initialized.is_set():
                    killswitch += 1
                time_left = t1 + wait_time - time.time()
                time.sleep(max(0, time_left))
        except:
            print("Clusterer aborted:", sys.exc_info()[0])
            aborted.set()
        finally:
            self.db.add_video(self.video_data)

def cluster(comment_topics, n_topics=200, user_subs=[], user_labs=[]):
    # 1. Cluster comment topics
    clustered = {} # by token
    for c in comment_topics:
        if ('topics' not in c.keys()):
            pass
        topics = json.loads(c['topics'])
        for token, start, end, label in topics:
            edge = (c['id'], token, label, c['likes'], c['sentiment'])
            if token in clustered.keys():
                clustered[token].append(edge)
            else:
                clustered[token] = [edge] # Sort by token

    named_entities = []
    noun_chunks = []
    frequency = {}
    for token in clustered:# {...token: [...(id, label, likes, sentiment)]}
        t = clustered[token]
        n = len(t)
        if label in user_labs:
            label = user_labs[label]
        else:
            all_labels = [lab for (i, tok, lab, lik, s) in t]
            label = Counter(all_labels).most_common(1)[0][0]
        edges = [(i, tok, lik, s) for (i, tok, lab, lik, s) in clustered[token]]
        if label == 'NOUN_CHUNK':
            noun_chunks.append((token, label, edges))
            frequency[token] = len(edges)
        else:
            named_entities.append((token, label, edges))
            frequency[token] = len(edges)

    # 2. Parse named entities
    subs = {}
    subbed = {}
    def add(token, label, edges):
        if token in subbed.keys():
            new_edges = subbed[token][1] + edges
            subbed[token] = (label, new_edges)
        else:
            subbed[token] = (label, edges)

    named_entity_longest = sorted(named_entities, key=lambda e: len(e[0]), reverse=True)
    for token, label, edges in named_entity_longest:
        used = False
        if token in user_subs:
            repl = user_subs[token]
            subs[token] = repl
            add(repl, label, edges)
            used = True
        elif label == 'PERSON':
            included = [(key, frequency[key]) for key in subbed.keys() if token in key]
            if len(included) > 0:
                (repl, freq) = sorted(included, key=lambda i: i[1], reverse=True)[0]
                collision = freq / frequency[token]
                if (freq > 2) & (collision > 0.3):
                    subs[token] = repl if not repl in subs.keys() else subs[repl]
                    add(subs[token], label, edges)
                    used = True
        elif label in ['CARDINAL', 'TIME', 'QUANTITY']:
            used = True # Remove
        if used == False:
            add(token, label, edges)


    # 3. Parse Noun Chunks
    ngrams = {}
    noun_chunks_longest = sorted(noun_chunks, key=lambda e: len(e[0]), reverse=True)
    for element in noun_chunks_longest:
        cleaned = html.unescape(element[0])

        # Search all permutations of words
        words = cleaned.split(" ")
        local_ngrams = []
        max_n = 4
        for n in range(max(len(words), max_n)):
            local_ngrams += [list(x) for x in combinations(words, n)]

        used = False
        for n in local_ngrams:
            cleaned = " ".join(n).strip()
            if (cleaned not in subbed.keys()) & (cleaned not in user_subs) & (cleaned != ""):
                if cleaned in ngrams:
                    ngrams[cleaned].append(element)
                    used = True
        if (not used) & (cleaned != ""):
            if cleaned in subbed.keys():
                add(cleaned, subbed[cleaned][0], element[2])
            else:
                ngrams[cleaned] = [element]
    ngrams_by_length = sorted([(n, len(ngrams[n]), ngrams[n]) for n in ngrams], key=lambda i : len(i[0]), reverse=True)

    ng_clust = {}
    ngram_subs = {}
    for token, freq, edges in ngrams_by_length:
        included = [(c, len(ngrams[c])) for c in ng_clust if token in c]

        if len(included) == 0:
            ng_clust[token] = ngrams[token]
        else:
            # most similar !== most frequent
            most_similar = sorted(included, key=lambda i: i[1], reverse=True)[0]

            if (most_similar[1] > 2) & (most_similar[1] > len(ngrams[token])*0.6):
                ngram_subs[token] = most_similar[0]
                ng_clust[most_similar[0]] += ngrams[token]
            else:
                ng_clust[token] = ngrams[token]

    ng_topics = [(n, ng_clust[n][0][1], len(ng_clust[n][0][2]), ng_clust[n][0][2]) for n in ng_clust]
    noun_chunks_sorted = sorted(ng_topics, key=lambda t : t[2], reverse=True)

    named_entities_subbed = []
    for token in subbed:
        (label, edges) = subbed[token]
        named_entities_subbed.append((token, label, len(edges), edges))
    named_entities_sorted = sorted(named_entities_subbed, key=lambda c: c[2], reverse=True)

    # 4. Combile lists, calculate stats
    all_ents = named_entities_sorted[:n_topics] + noun_chunks_sorted[:n_topics]
    all_parsed = []
    for (token, label, n, edges) in all_ents:
        commentIds = []
        toks = []
        all_likes = 0
        all_sentiment = {'pos': 0, 'neg': 0, 'neu': 0}
        for (commentId, tok, likes, sentiment) in edges:
            if commentId not in commentIds:
                commentIds.append(commentId)
                toks.append(tok)
                all_likes += int(likes)
                if sentiment > 0:
                    all_sentiment['pos'] += 1
                elif sentiment < 0:
                    all_sentiment['neg'] += 1
                else:
                    all_sentiment['neu'] += 1
        toks_reduced = list(set(toks))
        commentIds_reduced = list(set(commentIds))
        n = len(commentIds_reduced)
        all_parsed.append((token, toks_reduced, label, n, all_likes, all_sentiment, commentIds_reduced))
    all_sorted = sorted(all_parsed, key=lambda e: e[3], reverse=True)

    return all_sorted[:n_topics]
