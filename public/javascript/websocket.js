let address = 'ws://' + window.location.hostname + ':' + window.location.port;
console.log('Address: ' + address);

const socket = new WebSocket(address);

socket.addEventListener('open', function(event) {
    console.log('Connection Opened');
    let message = {type: 'intro'};
    socket.send(JSON.stringify(message));
});

socket.addEventListener('message', function(event){
    console.log('Message from server: ', event.data);
});

socket.addEventListener('output', function(event) {
    console.log('Output received: ', event.data);
});


let submitCode = function () {
    if(editor != null)
    {
        console.log(editor.getValue());
        var code = { type: "code", data: JSON.stringify(editor.getValue()) };
        socket.send(code);
    }

};