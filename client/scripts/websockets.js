$(function () {
    // Firefox special case
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // websockets not supported by the browser
    $('#no-websockets').hide();
    if (!window.WebSocket) {
        $('#messages').hide();
        $('#new-message').hide();
        $('#info').hide();
        $('#no-websockets').show();
        return;
    }

    // open connection
    var connection = new WebSocket('ws://127.0.0.1:8081');

    connection.onopen = function () {
        console.log('Web socket open');
    };

    // handle errors
    connection.onerror = function (error) {
        $('#messages').html('A connection problem occurred');
    };

    // handle incoming message from the Node.js server
    connection.onmessage = function (message) {
        // parse the JSON
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('Invalid JSON', message.data);
            return;
        }

        switch (json.type) {
            case 'allMessages':
                for (var i = 0; i < json.data.length; i++) {
                    addMessage(json.data[i].id, json.data[i].text, new Date(json.data[i].time));
                }
                break;
            case 'newMessage':
                addMessage(json.data.id, json.data.text, new Date(json.data.time));
                break;
            default:
                console.log('Invalid message type', json.type);
        }
    };

    // send message when enter key is pressed
    $('#message').keydown(function (event) {
        if (event.keyCode === 13) {
            if ($(this).val()) {
                connection.send($(this).val());
                $(this).val('');
            }
        }
    });

    // add a message to the list
    function addMessage(id, message, dateTime) {
        $('#messages').prepend('<b>Message</b>: \'' + message + '\' (<b>Received:</b> ' + dateTime.toUTCString()
            + ', remote address ' + id + ')<br/>');
    }
});