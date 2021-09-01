import hashlib

def hash(videoId, author, text):
    string = str(videoId) + str(author) + str(text)
    full_hash = hashlib.md5(string.encode()).hexdigest()
    return full_hash[:16]