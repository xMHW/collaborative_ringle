import fetch from 'isomorphic-unfetch'

export function ApiHelper(url, jwtToken = null, method = 'GET', body = null){
    if (url.includes('undefined')){
        return
    }
    let bearer = null
    if (jwtToken){
        bearer = 'Bearer ' + jwtToken 
    }
    let header = null
    if (body) {
        header = {
            method: method,
            headers: {
                'Authorization': bearer,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }
    } else{
        header = {
            method: method,
            headers: {
                'Authorization': bearer,
                'COntent-Type': 'application/json'
            },
        }
    }
    return fetch(url, header)
        .then(res => res.json())
        .then((result) => {
            return result
        }, (error) => ({
            success: false,
            error
        }))
}



