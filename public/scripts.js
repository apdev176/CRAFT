const socket = io('/')
const newPeer = new Peer()
const _nameSpecifier = "123d12dasf12fsc112casc"
const _mssgSpecifier = "c59c8fce0a27c8334570c8de425caf08"
const _terminator = "I am Using This String For Terminating The Send Protocol"
const myDiv = document.createElement('div')

var myId

let qrDiv = document.getElementById("qrDiv")
let qrImg = document.getElementById("qrImg")
qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.href}`


document.getElementById("roomDiv").addEventListener('click', () => {
    qrDiv.classList.toggle('hidden')
})
document.getElementById("qrDiv").addEventListener('click', () => {
    qrDiv.classList.toggle('hidden')
})

newPeer.on('open', id => {  //Creating the New Peer ID
    _urName = randomUsername
    socket.emit('join-room', ROOM_ID, id,_urName) //Telling the room to join 
    myId = id
    $('#urID').text(_urName)
})

//Recieving Messages on Peer Connection

newPeer.on('connection', conn => {
    const headerInfo = []
    const fileChunks = []
    let sortedChunks = []
    const sortedData = []
    conn.on('open', () => {
        conn.on('data', data => {
            try {
                if (conn.label === "messageChannel") {
                    alert(conn.peer + " says " + data.data)
                }
                else if (conn.label === "dataChannel") {
                    if (data.dataType === "HeaderName of Sending File") {
                        headerInfo.push(data)
                    }
                    else if (data.dataType === _terminator) {
                        sortedChunks = fileChunks.sort((a, b) => {
                            return parseInt(a.dataOrder) - parseInt(b.dataOrder)
                        })
                        for (i in sortedChunks) {
                            sortedData.push(sortedChunks[i].data)
                        }
                        const file = new Blob(sortedData);
                        console.log('Received', file);
                        if (confirm(`User ${conn.peer} sent ${headerInfo[headerInfo.length - 1].name} `)) {
                            download(file, headerInfo[headerInfo.length - 1].name, headerInfo[headerInfo.length - 1].type)
                        }

                        //Removing Data from arrays
                        headerInfo.length = 0
                        fileChunks.length = 0
                        sortedChunks.length = 0
                        sortedData.length = 0
                    }
                    else {
                        fileChunks.push(data); // Keep appending various file chunks 
                    }
                }
            } catch (e) {
                console.log(e + 'Error')
            }
        })
    })
})

socket.on('add-others', (otherId,otherName) => {
    const otherDiv = document.createElement('div')
    addingDiv(otherDiv, otherId,otherName)

})
socket.on('user-connected', (userID, sId,userName) => {
    console.log("User " + userID + " joined the room")
    const newDiv = document.createElement('div')
    addingDiv(newDiv, userID,userName)
    socket.emit('myId-send', myId, sId,_urName)
})

socket.on('user-disconnected', removeId => {
    $("#" + removeId).remove()
})

function addingDiv(div, id,userName) {
    div.classList.add('text-center', 'select-none','capitalize', 'cursor-pointer', 'm-auto', 'py-3', 'px-5', 'rounded-full', 'bg-indigo-300', 'animate-popIn')
    div.innerHTML = "<strong>User</strong> <br/>" + userName
    div.setAttribute("id", id)
    div.setAttribute("title", id)
    const fs = document.createElement('input')
    fs.type = "file"

    div.addEventListener('click', () => { //Left Click EventListener
        console.log('Div Clicked')
        console.log(fs.files)
        fs.click()
        console.log('input Clicked')
    })
    fs.addEventListener('change', (fse) => {
            let n = 0
            console.log("Selecting Files")
            const conn = newPeer.connect(id, { label: 'dataChannel', reliable: 'true' })
            conn.on('open', () => {
                const file = fs.files[0]
                console.log("Sending fileInfo")
                conn.send({
                    dataType: "HeaderName of Sending File",
                    name: file.name,
                    type: file.type
                })

                file.arrayBuffer()
                    .then(buffer => {
                        /**
                          A chunkSize (in Bytes) is set here
                          I have it set to 15KB
                         */
                        const chunkSize = 15 * 1024;
                        console.log("Chunking file")
                        // Keep chunking, and sending the chunks to the other peer
                        while (buffer.byteLength) {
                            const chunk = buffer.slice(0, chunkSize);
                            buffer = buffer.slice(chunkSize, buffer.byteLength);
                            // Sending Chunks!
                            conn.send({ dataOrder: n++, data: chunk });
                        }

                        // End message to signal that all chunks have been sent
                        conn.send({ dataType: _terminator });
                        console.log("File Sent")

                        //Clearing data
                        fs.value = ''
                    })
            })
        
    })

    div.addEventListener('contextmenu', (rc) => {
        rc.preventDefault()
        const conn = newPeer.connect(id, { label: 'messageChannel' })
        let mssg = prompt('Send Message')
        if (mssg != null) {
            conn.on('open', () => {
                conn.send({
                    dataType: 'Message Sending Channel',
                    data: mssg,
                    dataConnectType: conn.label
                })
            })
        }
    })
    document.getElementById('MainGrid').append(div)
}