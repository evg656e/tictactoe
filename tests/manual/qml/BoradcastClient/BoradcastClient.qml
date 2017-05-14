import QtQuick 2.6
import QtQuick.Controls 2.1
import QtQuick.Layouts 1.1
//import QtWebSockets 1.1
import '../../shared/broadcast.js' as Lib

ApplicationWindow {
    visible: true
    width: 720
    height: 500
    title: qsTr('Broadcast Client')

    property var broadcastClient

    function updateStatus(ready) {
        status.text = ready ? qsTr('Connected') : qsTr('Not Connected');
        sendButton.enabled = ready;
    }

    function appendText(text) {
        textArea.append(text)
    }

    GridLayout {
        columns: 2

        Label {
            id: status
            Layout.columnSpan: 2
        }

        TextField {
            id: textField
            implicitWidth: 300
            placeholderText: qsTr('Type Some Text Here')
        }

        Button {
            id: sendButton
            text: qsTr('Send')
            onClicked: broadcastClient.send(textField.text)
//            onClicked: ws.sendTextMessage(textField.text)
        }

        TextArea {
            Layout.columnSpan: 2
            id: textArea
            background: Rectangle {
                implicitWidth: 300
                implicitHeight: 390
                border.color: 'lightgray'
            }
            readOnly: true
        }

        Button {
            id: clearButton
            text: qsTr('Clear')
            onClicked: textArea.clear()
        }
    }

//    WebSocket {
//        id: ws
//        url: 'ws://localhost:8080' // url should be set here or socket won't work
//        active: true
//        onTextMessageReceived: appendText(message)
//    }

    Component.onCompleted: {
        updateStatus(false)
        broadcastClient = new Lib.Broadcast.Client('ws://localhost:8080')
        broadcastClient.readyChanged.subscribe(updateStatus)
        broadcastClient.messageReceived.subscribe(appendText)
//        ws.url = 'ws://localhost:8080' // won't work if url is set here
//        ws.active = true
    }
}
