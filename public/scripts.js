const socket = io('/')

const newPeer = new Peer()
const _nameSpecifier = "123d12dasf12fsc112casc"
const _mssgSpecifier = "c59c8fce0a27c8334570c8de425caf08"
const _terminator = "I am Using This String For Terminating The Send Protocol"
const myDiv = document.createElement('div')
let testFile
var myId

let qrDiv = document.getElementById("qrDiv")
let qrImg = document.getElementById("qrImg")
qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.href}`


document.getElementById("roomDiv").addEventListener('click', () => {
    qrDiv.classList.toggle('invisible')
})
document.getElementById("qrDiv").addEventListener('click', () => {
    qrDiv.classList.toggle('invisible')
})

newPeer.on('open', id => {  //Creating the New Peer ID
    socket.emit('join-room', ROOM_ID, id) //Telling the room to join 
    myId = id
    $('#urID').text(id)
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
                if (data.dataType === "Message Sending Channel") {
                    alert(data.data)
                }
                else if (data.dataType === "HeaderName of Sending File") {
                    headerInfo.push(data)
                }
                else if (data.dataType === _terminator) {
                    sortedChunks = fileChunks.sort((a, b) => {
                        return parseInt(a.dataOrder) - parseInt(b.dataOrder)
                    })
                    console.log(sortedChunks)
                    for (i in sortedChunks) {
                        sortedData.push(sortedChunks[i].data)
                    }
                    console.log(sortedData)
                    const file = new Blob(sortedData);
                    console.log('Received', file);
                    download(file, headerInfo[headerInfo.length - 1].name, headerInfo[headerInfo.length - 1].type)
                    //Removing Data of the headerInfo and fileChunks
                }
                else {
                    fileChunks.push(data); // Keep appending various file chunks 
                }
            } catch (e) {
                console.log(e + 'Error')
            }
        })
    })
})

socket.on('add-others', otherId => {
    const otherDiv = document.createElement('div')
    addingDiv(otherDiv, otherId)

})
socket.on('user-connected', (userID, sId) => {
    console.log("User " + userID + " joined the room")
    const newDiv = document.createElement('div')
    addingDiv(newDiv, userID)

    socket.emit('myId-send', myId, sId)
})

socket.on('user-disconnected', removeId => {
    $("#" + removeId).remove()
})

function addingDiv(div, id) {
    div.classList.add('text-center','cursor-pointer', 'm-auto','py-3','px-4', 'rounded-full','bg-indigo-300','animate-popIn')
    div.innerHTML = "<strong>User</strong> <br/>" + id
    div.setAttribute("id", id) 
    div.setAttribute("title", id)
    const fs = document.createElement('input')
    fs.type = "file"

    div.addEventListener('click', () => { //Left Click EventListener
        fs.click()
        let n = 0
        fs.addEventListener('change', () => {
            const conn = newPeer.connect(id)
            conn.on('open', () => {
                const file = fs.files[0]
                conn.send({
                    dataType: "HeaderName of Sending File",
                    name: file.name,
                    type: file.type
                })
                file.arrayBuffer()
                    .then(buffer => {
                        /**
                         * A chunkSize (in Bytes) is set here
                         * I have it set to 15KB
                         */
                        const chunkSize = 15 * 1024;

                        // Keep chunking, and sending the chunks to the other peer
                        while (buffer.byteLength) {
                            const chunk = buffer.slice(0, chunkSize);
                            buffer = buffer.slice(chunkSize, buffer.byteLength);
                            // Sending Chunks!
                            conn.send({
                                dataOrder: n++
                                , data: chunk
                            });
                        }

                        // End message to signal that all chunks have been sent
                        conn.send({
                            dataType: _terminator
                        });
                    })
            })
        })
    })
    div.addEventListener('contextmenu', (rc) => {
        rc.preventDefault()
        const conn = newPeer.connect(id)
        let mssg = prompt('Send Message')
        if (mssg != null) {
            conn.on('open', () => {
                conn.send({
                    dataType: 'Message Sending Channel',
                    data: mssg
                })
            })
        }
    })
    document.getElementById('MainGrid').append(div)
}