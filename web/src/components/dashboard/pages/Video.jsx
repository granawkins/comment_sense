import { useState, useEffect, createContext } from 'react'
import { useParams } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogActions from '@material-ui/core/DialogActions'

import { postData, thousands_separator } from '../../utils/helpers'
import VideoPlayer from "./VideoPlayer.jsx"
import Topics from "./Topics.jsx"
import LoadingCircle from '../../utils/LoadingCircle'
import ErrorPage from '../../utils/ErrorPage'
import ActionControl from './ActionControl'

const styles = (theme) => ({
    ...theme.typography,
    root: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexWrap: 'nowrap',
        margin: '0',
        paddingTop: '10px',
    },
})

const Video = ({user, channel, classes}) => {

    const { videoId } = useParams()
    const [video, setVideo] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [hasError, setHasError] = useState(false)

    // On load, get video data from database and youtube
    useEffect(() => {
        setIsLoading(true)
        try {
            fetch(`/api/video/${videoId}`)
                // const data = {
                //   error: String,
                //   videoData: {
                //     channel_id: "UCtinbF-Q-fVthA0qrFQTgXQ"
                //     channel_title: "CaseyNeistat"
                //     created: "Fri, 06 Aug 2021 18:57:48 GMT"
                //     db_comments: 441
                //     dislikes: "1301"
                //     id: "TXLUafBNjnc"
                //     labels: null
                //     last_refresh: "2021-08-07 20:01:39.093248"
                //     last_scan: "2021-08-07 15:40:25.671196"
                //     likes: "60557"
                //     next_page_token: "QURTSl9pME0yLU54V1RkWm1KVXd5ZXJGYnk0OGp6cDVHSnpLbWt4Rmw0VU1HQ0NjM0haVThteXZraEZZTk4ydXZfX0Y2SnhOQzg3RXhyY2QyaFVheGM0S3JQSWJVdHhTMFh6SE8xOTdmckpOMGVUWW5zVTZQR0pPaXllQ1FQclMxem5rQnMzMk1kRnpVa19CWHV6SzhMSHMwSWlxU3JfWFc4Mmpoclc2SUZGZjNTY01WdzktVmY0dl9VNnVwdlNFV21FZXdzekVMbVFDVDJneEQtUENycG1oc0V0SlRKMHc2VWRhNWJKdjR5TjFqN1lKMzROMlgwcmdGazA2NU9UN3VmSzNqbEdSRTFsZm1OQndIM2ViNnVvaU4zZ0pkN1JxaGVWQWRRbF9vWFFWNzFOZ0M0V3VWeHlyUHJCR2Z2dkNpX0V5NGhrRmNpdDJTSDlCVmlnbDd6YTc4eUp6cVVGNXFiMDFWM1lsRTRpVld4bUZ3N2ZVX0JHZU5wLUtNcFBmU3VuLXUtbmFOZVBwMFVxcEhyQ1ZvbXF2akJKRWU5anpGdV9tVHhuaGNJTnprNUhpY1dYbGtzTENVV0cyNjE5S0NCVV9CWTQtMGJzZ05BdWZ4QnpBUGJOSDJZN1ZoeGh5WGhjTS1rdFkwZkNXVEtON1AtNWZaM0hXNDF1OWN3Y2QwQ2J0ZkhwbFpiTjJJMVB4bkk4V0NrTjNrV1lvanJtbWpxWmZ5bEdxcFoybXBqR2VDZWd6Q19EOVRSbmJqM1kwaUlYU0s5Rl91ZXBRV0dMVVg1VzZEVkhJSjRaTkRfRFpUNFd3WjNkM2dIaGRMdHB0YjVRU3RFYldqVnhrcVZELWNNTXpBNVVpbXdUNUhKbTl5SkdsYTdFZzd5LThpbkQ2VUd4MjRkY0p0NmVlVzFwQV93Qjlkb0tIaGVZSmJwM3FaRmhxS0hBS1p4OHh1YW5QSGtRRkhINXFkZVNZWDZQUWJrQ21uWFRUU01rdVFKdk8zcEFXb3p1bzU5UkNvWkVYbm0wNUV1Qy1UbUkxcHNTMGtrNERvbFNJamx1eXpwcEcxaVV5QmJ1eHVsWTZFSkpOX2J3ZVdEdTFsT3Ftbm9lOWxFNTA4UXQwRmdOakJRZ2RQZjM3UWdWU0RmdU1vMlRPUXZGdnFPbjVtaWdUVEtuSXdBVFZlQmtUdmZwOUxlejh0TTkxcThwcmNNLVotN3J0N3ktVWVuM3QyeXoxdFpHWnoyV2VjQUVlcDBzdFNrZDdRWnBPdnNkMk9sclRKbTlLTHpyUE9WT09UVVowaTlIX2xuUFlxU2VtY20tNkxYM3Z6RnpkYlVzVk14QWdaR0JXdjhsZFFBZE1TTklOdTZwZV9JZE5NTkkzRXFkYmlETTg4SldFaU1HRmpmVzZsRnJuQURtLTROYnhtbi1iRVc1VDhHRHM5R2szTy1ybk85T0JWRFJ6U2VrSUNybXhGTVlielZZVzRtdndmc1NtVXFjemprWGhTRHp1YjJxVEs0elpTZjNlVzNGU2V1OUQ2eGRxY2ZlcUFZTkVqcTdwU3gxM19FNndTTTBOejBPam1DRkNpQzMtMUt2OGUwb1ZKZzZHemZuTmY2MjZOS05TZ2xJWXlSZDdYdw=="
                //     published: "26 October, 2020"
                //     thumbnail: "https://i.ytimg.com/vi/TXLUafBNjnc/mqdefault.jpg"
                //     title: "the SURPRISE of her life!!!"
                //     total_comments: "2875"
                // }}
                .then(res => res.json())
                .then(data => {
                    if (!data.video_data) {
                        console.log("No video data.")
                    } else {
                        console.log(`Video page initializing to ${data.video_data.total_comments}`)
                        setVideo(data.video_data)
                    }
                    setIsLoading(false)
                })
        }
        catch(e) {
            console.log(`Error fetching video: ${e}`)
            setHasError(true)
            setIsLoading(false)
        }
    }, [])

    // Get new comments from youtube, analyze all, then re-cluster
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const analyze = async (maxComments=100, resetToken=false) => {
        setIsAnalyzing(true)
        const request_data = {
            user,
            videoId,
            maxComments,
            resetToken,
        }
        console.log(request_data)
        postData('/api/analyze_comments', request_data).then(data => {
            if (data.error) {
                setHasError(true)
                setIsAnalyzing(false)
                console.log(`Error analyzing videos: ${data.error}`)
            } else if (data.video) {
                console.log(`Analyze function updating to ${data.video.total_comments}`)
                setVideo({...video, ...data.video})
                setIsAnalyzing(false)
            }
        })
    }

    // Create a popup menu with details/options for analyze
    const [actionOpen, setActionOpen] = useState(false)

    const [placeholder, setPlaceholder] = useState("")
    useEffect(() => {
        if (isLoading) {
            setPlaceholder(<LoadingCircle />)
        } else if (hasError) {
            setPlaceholder(<ErrorPage />)
        } else {
            setPlaceholder("")
        }
    }, [isLoading, hasError])

    return(
        <div className={classes.root}>
            {isLoading || hasError
                ? placeholder
                : <>
                    <VideoPlayer video={video} />
                    <Topics
                        user={user}
                        page='video'
                        video={video}
                        analyze={() => setActionOpen(true)}
                        grayout={isAnalyzing}
                    />
                    <ActionControl
                        // isOpen, handleClose, actionTitle, remaining, quota, verb, actionLabel, action
                        isOpen={actionOpen}
                        handleClose={() => setActionOpen(false)}
                        actionTitle="Analyze Comments"
                        remaining={video ? video.total_comments - video.db_comments : 0}
                        quota={user.quota}
                        verb="Analyze"
                        actionLabel="ANALYZE NOW"
                        action={analyze}
                    />
                </>
            }
        </div>
    )
}

export default withStyles(styles)(Video)
