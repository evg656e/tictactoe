import QtQuick 2.7
import QtQuick.Controls 2.1
import QtQuick.Layouts 1.3
import QtQuick.Window 2.2
import QtWebSockets 1.1
import 'tictactoeclient.qml.js' as Lib

Window {
    id: window
    visible: true
    width: 360
    height: 520
    title: qsTr('TicTacToe')

    readonly property real level1PointSize: 14
    readonly property real level2PointSize: 14
    readonly property real level3PointSize: 10
    readonly property real level4PointSize: 8

    readonly property int lineWidth: 4

    readonly property string serverUrl: 'ws://tictactoe-env.us-west-2.elasticbeanstalk.com/'
//    readonly property string serverUrl: 'ws://127.0.0.1:3000/'

    function playerColor(color) {
        switch (color) {
        case Lib.TicTacToe.Player1: return '#083d77';
        case Lib.TicTacToe.Player2: return '#ff9f1c';
        default: return '';
        }
    }

    Timer {
        id: dotsAnimation
        running: false
        repeat: true
        interval: 500

        property var items: []

        function addItem(item) {
            if (items.length === 0)
                start();
            items.push(item);
        }

        function removeItem(item) {
            var index = items.indexOf(item);
            if (index !== -1) {
                items.splice(index, 1);
                if (items.length === 0)
                    stop();
            }
        }

        onTriggered: {
            items.forEach(function(item) {
                var text = item.text;
                if (text.endsWith('...'))
                    text = text.substr(0, text.length - '...'.length);
                else if (text.endsWith('..'))
                    text = text.substr(0, text.length - '..'.length) + '...';
                else if (text.endsWith('.'))
                    text = text.substr(0, text.length - '.'.length) + '..';
                else
                    text += '.';
                item.text = text;
            });
        }
    }

    QtObject {
        id: controller
        property var gameClient
        property var match
        property var players

        function move(row, column) {
            gameClient.move(row, column);
        }

        function updateName(player) {
            if (player.index === Lib.TicTacToe.Player1)
                player1Name.text = player.name;
            else if (player.index === Lib.TicTacToe.Player2)
                player2Name.text = player.name;

            if (player.index === moveStatus.playerIndex)
                currentPlayerName.text = player.name;
            if (player.index === winStatus.playerIndex)
                winnerName.text = player.name;
        }

        function clearName(player) {
            if (player.index === Lib.TicTacToe.Player1) {
                player1Name.text = Lib.TicTacToe.playerName(Lib.TicTacToe.Player1);
                player1SelfMark.opacity = 0;
            }
            else if (player.index === Lib.TicTacToe.Player2) {
                player2Name.text = Lib.TicTacToe.playerName(Lib.TicTacToe.Player2);
                player2SelfMark.opacity = 0;
            }
        }

        function updateScore(player) {
            if (player.index === Lib.TicTacToe.Player1)
                player1Score.text = player.score;
            else if (player.index === Lib.TicTacToe.Player2)
                player2Score.text = player.score;
        }

        function clearScore(player) {
            if (player.index === Lib.TicTacToe.Player1)
                player1Score.text = 0;
            else if (player.index === Lib.TicTacToe.Player2)
                player2Score.text = 0;
        }

        function removePlayer(player) {
            var index = players.indexOf(player);
            if (index !== -1) {
                players.splice(index, 1);
                player.nameChanged.disconnect(updateName);
                player.scoreChanged.disconnect(updateScore);
                clearName(player);
                clearScore(player);
            }
        }

        function setPlayers(newPlayers) {
            players = newPlayers.slice();
            players.forEach(function(player, index) {
                if (index === Lib.TicTacToe.Player1)
                    player1SelfMark.opacity = player.isSelf() ? 1 : 0;
                else if (index === Lib.TicTacToe.Player2)
                    player2SelfMark.opacity = player.isSelf() ? 1 : 0;
                player.nameChanged.connect(updateName);
                player.scoreChanged.connect(updateScore);
            });
        }

        function updateMatchState(state, winner) {
            if (state === Lib.TicTacToe.PlayersReadyState) {
                setPlayers(match.players);
            }
            else if (state === Lib.TicTacToe.MatchFinishedState) {
                if (winner !== undefined) {
                    winStatus.playerIndex = winner.index;
                    winnerName.text = winner.name;
                    matchStatus.toggleStatus('winStatus');
                }
                else
                    matchStatus.toggleStatus('drawStatus');
            }
            else if (state === Lib.TicTacToe.WaitingForPlayersState) {
                matchStatus.toggleStatus('waitStatus');
            }
        }

        function updateCurrentPlayer(player) {
            moveStatus.playerIndex = player.index;
            currentPlayerName.text = player.name;
            currentPlayerMark.text = player.markText();
            matchStatus.toggleStatus('moveStatus');
        }

        function setMatch(newMatch) {
            if (match) {
                match.movePassed.disconnect(updateCurrentPlayer);
                match.stateChanged.disconnect(updateMatchState);
                match.playerRemoved.disconnect(removePlayer);
            }
            match = newMatch;
            if (match) {
                match.movePassed.connect(updateCurrentPlayer);
                match.stateChanged.connect(updateMatchState);
                match.playerRemoved.connect(removePlayer);
                gridModel.setGrid(match.grid);
            }
        }

        function showClientStatus(status) {
            dotsAnimation.removeItem(clientStatus);
            if (status.text.endsWith('...'))
                dotsAnimation.addItem(clientStatus);
            clientStatus.text = status.text;
            clientStatus.opacity = 1;
        }

        function hideClientStatus() {
            clientStatus.opacity = 0;
        }

        Component.onCompleted: {
            gameClient = new Lib.TicTacToe.GameClient(serverUrl)
            gameClient.matchReady.connect(setMatch)
            gameClient.showStatus.connect(showClientStatus);
            gameClient.hideStatus.connect(hideClientStatus);
            gameModes.itemAt(0).checked = true
        }
    }

    ListModel {
        id: gridModel
        property var grid

        function updateCell(row, column, mark, index) {
            set(Lib.TicTacToe.Grid.toIndex(row, column), { playerMark: mark, playerIndex: index });
        }

        function updateGrid() {
            clear();
            grid.cells.forEach(function(mark) {
                append({ playerMark: mark, playerIndex: -1 });
            });
        }

        function setGrid(newGrid) {
            if (grid) {
                grid.cellChanged.disconnect(updateCell);
                grid.cleared.disconnect(updateGrid);
            }
            grid = newGrid;
            if (grid) {
                grid.cellChanged.connect(updateCell);
                grid.cleared.connect(updateGrid);
            }
        }
    }

    ButtonGroup {
        id: gameModesGroup
        onCheckedButtonChanged: controller.gameClient.setMode(checkedButton.value)
    }

    ColumnLayout {
        anchors.fill: parent

        ColumnLayout {
            Layout.fillWidth: true
            Layout.alignment: Qt.AlignCenter
            Layout.topMargin: 10
            Layout.bottomMargin: 10

            RowLayout {
                Layout.alignment: Qt.AlignCenter
                spacing: 0
                Repeater {
                    id: gameModes
                    model: Lib.TicTacToe.availableGameModes()
                    Button {
                        Layout.maximumWidth: window.width*.33
                        text: modelData.text
                        font.pointSize: level3PointSize
                        property int value: modelData.value
                        ButtonGroup.group: gameModesGroup
                        onClicked: checked = true
                    }
                }
            }

            RowLayout {
                Layout.alignment: Qt.AlignCenter
                spacing: 0

                Label {
                    id: clientStatus
                    text: ' '
                    font.pointSize: level3PointSize
                    Behavior on opacity {
                        enabled: clientStatus.opacity === 1
                        NumberAnimation { duration: 2000 }
                    }
                }
            }

            RowLayout {
                Layout.alignment: Qt.AlignCenter
                spacing: 0

                TextField {
                    id: player1Name
                    Layout.maximumWidth: window.width*.35

                    font.pointSize: level1PointSize
                    horizontalAlignment: Text.AlignHCenter
                    color: playerColor(Lib.TicTacToe.Player1)

                    onTextChanged: {
                        var player = controller.match.findPlayer(Lib.TicTacToe.player1)
                        if (player)
                            player.setName(player1Name.text)
                    }
                }
                Label {
                    id: player1SelfMark
                    text: '*'
                    font.pointSize: level2PointSize
                    opacity: 0
                    MouseArea {
                        anchors.fill: parent
                        hoverEnabled: true
                        onEntered: selfMarkTip.state = player1SelfMark.opacity === 1 ? '' : 'hidden'
                        onExited:  selfMarkTip.state = 'hidden'
                    }
                }
                Label {
                    text: ' : '
                    font.pointSize: level1PointSize
                    anchors.verticalCenter: parent.verticalCenter
                }
                TextField {
                    id: player2Name
                    Layout.maximumWidth: window.width*.35

                    font.pointSize: level1PointSize
                    horizontalAlignment: Text.AlignHCenter
                    color: playerColor(Lib.TicTacToe.Player2)

                    onTextChanged: {
                        var player = controller.match.findPlayer(Lib.TicTacToe.player2)
                        if (player)
                            player.setName(player2Name.text)
                    }
                }
                Label {
                    id: player2SelfMark
                    text: '*'
                    opacity: 0
                    font.pointSize: level2PointSize
                    MouseArea {
                        anchors.fill: parent
                        hoverEnabled: true
                        onEntered: selfMarkTip.state = player2SelfMark.opacity === 1 ? '' : 'hidden'
                        onExited:  selfMarkTip.state = 'hidden'
                    }
                }
            }

            RowLayout {
                Layout.alignment: Qt.AlignCenter
                Label {
                    id: selfMarkTip
                    text: 'It\'s you'
                    font.pointSize: level4PointSize
                    state: 'hidden'
                    states: [
                        State {
                            name: ''
                            PropertyChanges { target: selfMarkTip; opacity: 1 }
                        },
                        State {
                            name: 'hidden'
                            PropertyChanges { target: selfMarkTip; opacity: 0 }
                        }
                    ]
                    transitions: [
                        Transition {
                            from: ''
                            to: 'hidden'
                            PropertyAnimation { target: selfMarkTip; property: 'opacity' }
                        },
                        Transition {
                            from: 'hidden'
                            to: ''
                            PropertyAnimation { target: selfMarkTip; property: 'opacity' }
                        }
                    ]
                }
            }

            RowLayout {
                Layout.alignment: Qt.AlignCenter

                Label {
                    id: player1Score
                    text: '0'
                    font.pointSize: level2PointSize
                    color: playerColor(Lib.TicTacToe.Player1)
                }
                Label {
                    text: ' : '
                    font.pointSize: level2PointSize
                }
                Label {
                    id: player2Score
                    text: '0'
                    font.pointSize: level2PointSize
                    color: playerColor(Lib.TicTacToe.Player2)
                }
            }
        }

        Item {
            Layout.fillHeight: true
            Layout.fillWidth: true

            Grid {
                id: gridView
                anchors.centerIn: parent
                spacing: -1
                rows: Lib.TicTacToe.Grid.Size
                columns: Lib.TicTacToe.Grid.Size

                Repeater {
                    model: gridModel

                    Rectangle {
                        width: 64
                        height: 64
                        color: 'lightgray'
                        property int rowIndex: Lib.TicTacToe.Grid.toRow(index)
                        property int columnIndex: Lib.TicTacToe.Grid.toColumn(index)

                        Rectangle { // border
                            anchors {
                                fill: parent
                                leftMargin: columnIndex === 0 ? 0 : 1
                                topMargin: rowIndex === 0 ? 0 : 1
                            }
                        }

                        Canvas {
                            anchors {
                                fill: parent
                                margins: 4
                            }

//                            renderTarget: Canvas.FramebufferObject

                            property int playerMark: model.playerMark
                            property int playerIndex: model.playerIndex

                            onPaint: {
                                var context = getContext('2d');
                                context.clearRect(0, 0, width, height);
                                if (playerMark !== Lib.TicTacToe._) {
                                    context.beginPath();
                                    var offset = Math.floor(lineWidth/2),
                                            left   = offset,
                                            top    = offset,
                                            right  = width - offset,
                                            bottom = height - offset;
                                    if (playerMark === Lib.TicTacToe.X) {
                                        context.moveTo(left, top);
                                        context.lineTo(right, bottom);
                                        context.moveTo(right, top);
                                        context.lineTo(left, bottom);
                                    }
                                    else if (playerMark === Lib.TicTacToe.O) {
                                        context.arc(width/2, height/2, width/2 - offset - 1, 0, Math.PI*2, false);
                                        context.strokeStyle = playerColor(playerIndex);
                                    }
                                    context.lineWidth = lineWidth;
                                    context.strokeStyle = playerColor(playerIndex);
                                    context.stroke();
                                }
                            }
                            onPlayerMarkChanged: requestPaint()

                            MouseArea {
                                anchors.fill: parent
                                onClicked: controller.move(rowIndex, columnIndex)
                            }
                        }
                    }
                }
            }
        }

        ColumnLayout {
            Layout.alignment: Qt.AlignCenter
            Layout.topMargin: 10
            Layout.bottomMargin: 10

            StackLayout {
                id: matchStatus

                Layout.fillHeight: false
                Layout.fillWidth: false

                property var statusItems: ({})

                function toggleStatus(status) {
                    console.log('statusWidget.toggleStatus', status)
                    currentIndex = statusItems[status].targetIndex;
                }

                Row {
                    objectName: 'waitStatus'
                    property int targetIndex
                    Label {
                        text: 'Not Enough Players'
                        font.pointSize: level3PointSize
                    }
                }

                Item {
                    id: moveStatus
                    objectName: 'moveStatus'
                    property int targetIndex
                    property int playerIndex

                    Row {
                        anchors.centerIn: parent

                        Label {
                            id: currentPlayerName
                            font.pointSize: level3PointSize
                            color: playerColor(moveStatus.playerIndex)
                        }

                        Label {
                            text: ' moves '
                            font.pointSize: level3PointSize
                            color: playerColor(moveStatus.playerIndex)
                        }

                        Label {
                            id: currentPlayerMark
                            font.pointSize: level3PointSize
                            color: playerColor(moveStatus.playerIndex)
                        }
                    }
                }

                Item {
                    objectName: 'drawStatus'
                    property int targetIndex

                    Label {
                        anchors.centerIn: parent
                        text: 'Draw!'
                        font.pointSize: level3PointSize
                    }
                }

                Item {
                    id: winStatus
                    objectName: 'winStatus'
                    property int targetIndex
                    property int playerIndex

                    Row {
                        anchors.centerIn: parent

                        Label {
                            id: winnerName
                            font.pointSize: level3PointSize
                            color: playerColor(winStatus.playerIndex)
                        }

                        Label {
                            font.pointSize: level3PointSize
                            text: ' won!'
                            color: playerColor(winStatus.playerIndex)
                        }
                    }
                }

                Component.onCompleted: {
                    Array.prototype.forEach.call(children, function(statusItem, index) {
                        statusItem.targetIndex = index;
                        statusItems[statusItem.objectName] = statusItem;
                    });
                }
            }
        }
    }

    Component.onCompleted: {
    }
}
