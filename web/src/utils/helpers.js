// ref: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch 
const postData = async (url, data) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    console.log(response)
    return response.json()
}

export {postData}
