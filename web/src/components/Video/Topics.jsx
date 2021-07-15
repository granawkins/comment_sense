import { useState, useEffect } from 'react'
import TopicCard from './TopicCard.jsx'
import LoadingCircle from '../../utils/LoadingCircle.js'

const Topics = ({topics, loading}) => {

    const [topicsFeed, setTopicsFeed] = useState([])

    useEffect(() => {
        if (!topics || topics.length === 0) {
            setTopicsFeed([])
        } else {
            let topicsParsed = JSON.parse(topics)
            if (topicsParsed.length === 0) {
                setTopicsFeed([])
            } else {
                let max = topicsParsed[0].score
                let newTopics = topicsParsed.map(t => <TopicCard topic={t} max={max} key={t.token} />)
                setTopicsFeed(newTopics)
            }
        }
    }, [topics])

    return (
        <>
            {loading
                ? <LoadingCircle />
                : <div>{topicsFeed}</div>
            }
        </>
    )
}

export default Topics
