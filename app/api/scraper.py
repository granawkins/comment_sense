import time, json, sys
import brotli
from id_hash import hash
from chromedriver_py import binary_path
from seleniumwire import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities


class Scraper():
    def __init__(self, env='desktop', wait_to_load=True):
        self.loaded = False
        try:
            path = binary_path if env == 'desktop' else '/usr/local/bin/chromedriver'
            caps = DesiredCapabilities().CHROME
            if wait_to_load == False:
                caps["pageLoadStrategy"] = "none"   # Do not wait for full page load
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_prefs = {}
            chrome_options.experimental_options["prefs"] = chrome_prefs
            chrome_prefs["profile.default_content_settings"] = {"images": 2}
            self.driver = webdriver.Chrome(
                executable_path=path, 
                desired_capabilities=caps, 
                options=chrome_options)
            self.driver.set_window_size(800, 1000)
            self.loaded = True
        except:
            return False

    def load_video(self, videoId):
        try:
            self.videoId = videoId
            self.driver.get("https://www.youtube.com/watch?v=" + videoId)
            return True
        except:
            return False

    def stream(self, n, progress, comment_pipeline, initialized, aborted):
        try:
            scraped = 0
            last_step = 0
            wait_time = 0.8
            skip = True
            killswitch = 0
            while (scraped < n) & (not aborted.is_set()):
                self.scroll()
                if skip:
                    skip = not skip
                else:
                    comments, this_step = self.step(last_step)
                    last_step = this_step
                    if len(comments) > 0:
                        if not initialized.is_set():
                            initialized.set()
                        killswitch = 0
                        comment_pipeline.put(comments)
                        scraped += len(comments)
                        progress['loaded'] = scraped
                    else:
                        self.scroll(to="back")
                        killswitch += 1
                        if killswitch > 5:
                            aborted.set()
                            raise NameError('Killswitch Engaged!!')
                    skip = not skip
                time.sleep(wait_time)
        except:
            print("Analyzer aborted:", sys.exc_info()[0])
            aborted.set()
        finally:
            self.driver.close()

    def scroll(self, to='bottom'):
        if to == 'start':
            self.driver.execute_script("window.scrollTo(0,360)")
        elif to == 'back':
            self.driver.execute_script("window.scrollTo(0,Math.max(document.documentElement.scrollHeight,document.body.scrollHeight,document.documentElement.clientHeight)-600)")
        elif to == 'bottom':
            self.driver.execute_script("window.scrollTo(0,Math.max(document.documentElement.scrollHeight,document.body.scrollHeight,document.documentElement.clientHeight))")

    def step(self, last_step):
        comment_prefix = 'https://www.youtube.com/comment_service_ajax?action_get_comments'    
        comments = []
        this_step = len(self.driver.requests)
        for request in self.driver.requests[last_step:this_step]:
            if comment_prefix in request.url:
                if request.response:
                    comments.extend(self.scrape_response(request.response.body))
        return comments, this_step

    def scrape_response(self, body):
        results = []
        data = brotli.decompress(body)
        comments=json.loads(data)['response']['continuationContents']['itemSectionContinuation']['contents']
        for c in comments:
            comment = c['commentThreadRenderer']['comment']['commentRenderer']
            edge = {
                "videoId": self.videoId,
                "author": comment['authorText']['simpleText'][:32], 
                "text": comment['contentText']['runs'][0]['text'][:1024], 
                "likes": 0 if not 'voteCount' in comment.keys() else parse_liked(str(comment['voteCount']['simpleText'])), 
                "n_children": 0 if not 'replyCount' in comment.keys() else comment['replyCount']}
            edge['id'] = hash(edge['videoId'], edge['author'], edge['text'])
            results.append(edge)
        return results
    
    def close(self):
        self.driver.close()

    def __exit__(self):
        self.driver.close()

def parse_liked(string):
    if string[-1] == 'K':
        thousands = string[:-1]
        liked = float(thousands) * 1000
        return liked
    else:
        try:
            liked = int(string)
            return liked
        except:
            print("Error parsing likes from ", string)
            return 0