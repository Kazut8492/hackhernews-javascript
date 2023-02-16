var idx = 0
var timer_id
var currentLatestPostID

async function fetchNewStories() {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/newstories.json`)
    const stories = await response.json()
    return stories
}
async function fetchItem(id) {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
    const item = await response.json()
    return item
}
async function fetchNewestItem() {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/maxitem.json`)
    const newestItem = await response.json()
    return newestItem
}
async function fetchNewestJobs() {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/jobstories.json`)
    const newestJobs = await response.json()
    return newestJobs
}
if (idx < 1) {
    writer()
}
window.addEventListener("scroll", function () {
    if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 1) {
        writer()
    }
});
async function writer() {
    var items = await fetchNewStories().then(json => {
        return json
    })
    items = [...items, ...await fetchNewestJobs().then(json => {
        return json
    })]
    items = items.sort(function (a, b) { return b - a })
    currentLatestPostID = items[0]
    for (var story = 0; story < 10; story++) {
        fetchItem(items[idx]).then(json => {
            const body = document.getElementById('body')
            if (json.deleted != true) {
                const div = document.createElement('div')
                const titly = document.createElement('h3')
                const time = document.createElement('div')
                const user = document.createElement('div')
                const text = document.createElement('p')
                const link = document.createElement('a')
                link.classList.add('link')
                text.classList.add('text')
                div.classList.add(json.id, json.type)
                titly.classList.add('title')
                titly.innerHTML += json.title
                time.classList.add('topRow', 'time')
                user.classList.add('topRow', 'user')
                div.appendChild(time)
                div.appendChild(user)
                div.appendChild(titly)
                user.innerHTML += `${json.by}<br>`
                time.innerHTML += `${new Date(json.time * 1000).toLocaleTimeString("et-EE")}`
                if (json.text != undefined) {
                    div.appendChild(text)
                    text.innerHTML += (json.text)
                } else {
                    div.appendChild(link)
                    link.innerHTML += `<a href="${json.url}">${json.url}</a>`
                }
                body.insertBefore(div, document.querySelector('footer'))
                if (json.kids != null) { ///-----------------------------------------------------------------Only error of this sort or algorithm overall is if we scroll and comments are added at the exact same time, the sort breaks for the last added item. overall great.
                    var sortedComments = [...json.kids]
                    sortedComments.sort(function (a, b) { return a - b })
                    commentWriter(sortedComments, 0, div.offsetWidth)
                }
            }
        })
        idx++
    }
}
async function commentWriter(sortedComments, layer, w) {
    for (var kid in sortedComments) { ///---------------------------------------------------------this here should be a recursion, so we could get comments to comments as well, maybe even make it look a little like in reddit.
        fetchItem(sortedComments[kid]).then(kids => {
            if (kids.deleted != true) {
                var commentKid = document.createElement('div')
                commentKid.classList.add('commentKid', `layer${layer}`)
                var kid = document.createElement('div')
                const time = document.createElement('div')
                const user = document.createElement('div')
                const text = document.createElement('p')
                const link = document.createElement('a')
                link.classList.add('link')
                text.classList.add('text')
                time.classList.add('topRow', 'time')
                user.classList.add('topRow', 'user')
                kid.classList.add(kids.id, 'commentary')
                user.innerHTML += `${kids.by}<br>`
                time.innerHTML += `${new Date(kids.time * 1000).toLocaleTimeString("et-EE")}`
                kid.appendChild(time)
                kid.appendChild(user)
                if (kids.text != undefined) {
                    kid.appendChild(text)
                    text.innerHTML += (kids.text)
                }
                kid.appendChild(text)
                if (layer > 0) {
                    commentKid.style.borderLeft = '2px solid red'
                }
                if (layer > 0) {
                    commentKid.style.marginLeft = 'auto'
                    commentKid.style.marginRight = 0
                } else {
                    commentKid.style.margin = 'auto'
                }
                commentKid.style.width = `${w - w / 20}px`
                kid.style.marginLeft = 'auto'
                kid.style.marginRight = 0
                commentKid.appendChild(kid)
                document.getElementsByClassName(kids.parent)[0].after(commentKid)
                if (kids.kids != null) {
                    var sortedComments = [...kids.kids]
                    sortedComments.sort(function (a, b) { return a - b })
                    commentWriter(sortedComments, layer + 1, kid.offsetWidth)
                }
            }
        })
    }
}
async function checkUpdate() {
    timer_id = setInterval(async () => {
        var items = await fetchNewStories().then(json => {
            return json
        })
        items = [...items, ...await fetchNewestJobs().then(json => {
            return json
        })]
        items = items.sort(function (a, b) { return b - a })
        if (items[0] != currentLatestPostID) {
            currentLatestPostID = items[0]
            console.log('new post call')
            myAlertBottom()
        }
    }, 5000)
}
checkUpdate()
function reload() {
    location.reload()
}
function myAlertBottom() {
    $(".myAlert-bottom").show();
    setTimeout(function () {
        $(".myAlert-bottom").hide();
    }, 5000);
}