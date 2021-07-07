import { useState, useEffect } from 'react'
import TopicCard from './TopicCard.jsx'

const Topics = ({topics}) => {

    const [topicsFeed, setTopicsFeed] = useState([])

    useEffect(() => {
        if (typeof(topics) === 'string') {
            topics = JSON.parse(topics)
        }
        if (!topics) {
            setTopicsFeed("")
        }
        else {
            if (topics.length === 0) {
                setTopicsFeed("")
            }
            else {
                let max = topics[0].score
                let newTopics = topics.map(t => <TopicCard topic={t} max={max} key={t.token} />)
                setTopicsFeed(newTopics)
            }
        }
    }, [topics])

    return (
        <div>{topicsFeed}</div>
    )
}

export default Topics