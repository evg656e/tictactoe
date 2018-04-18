import EventEmitter from 'events';
import { Action } from '../actions/Action';
import { QuitAction } from '../actions/QuitAction';

/*!
    \class ServerClient
    \extends EventEmitter
*/
export class ServerClient extends EventEmitter {
    constructor(server, socket) {
        super();
        this.server = server;
        this.socket = socket;
        this.match = null;
        this.playerName = '';
        this.playerIndex = -1;

        this.handleClose = this.handleClose.bind(this);
        this.handleMessage = this.handleMessage.bind(this);
        this.handleFindMatch = this.handleFindMatch.bind(this);
        this.handleUpdatePlayer = this.handleUpdatePlayer.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleQuit = this.handleQuit.bind(this);
        this.handleSync = this.handleSync.bind(this);

        socket.on('close', this.handleClose);
        socket.on('message', this.handleMessage);

        this.on('findMatch', this.handleFindMatch);
        this.on('updatePlayer', this.handleUpdatePlayer);
        this.on('movePlayer', this.handleMove);
        this.on('quit', this.handleQuit);
        this.on('sync', this.handleSync);
    }

    send(action) {
        if (this.socket.readyState !== this.socket.constructor.OPEN)
            return;
        const data = action.stringify();
        console.log('ServerClient.send()', data, action);
        this.socket.send(data);
    }

    handleFindMatch(action) {
        this.server.findMatch(this, action);
    }

    handleUpdatePlayer(action) {
        if (this.match)
            this.match.updatePlayer(this, action);
        else {
            if (action.propertyName === 'name')
                this.playerName = action.propertyValue;
            this.send(action);
        }
    }

    handleMove(action) {
        if (this.match)
            this.match.movePlayer(this, action);
    }

    handleQuit(action) {
        if (this.match)
            this.match.quitPlayer(this, action);
    }

    handleSync(action) {
        if (this.match)
            this.match.syncPlayer(this, action);
    }

    handleClose() {
        console.log('ServerClient.handleClose()');
        if (this.match)
            this.match.quitPlayer(this, QuitAction.Disconnected);
        this.server.removeClient(this);
        this.socket.removeListener('close', this.handleClose);
        this.socket.removeListener('message', this.handleMessage);
        this.socket = null;
    }

    handleMessage(data) {
        try {
            const action = Action.parse(data);
            console.log('ServerClient.handleMessage()', data, action);
            this.emit(action.type(), action);
        }
        catch (err) {
            console.error('ServerClient.handleMessage()', err);
        }
    }

    matchFound(playersInfo) {
        console.log('ServerClient.matchFound()', playersInfo);
        this.send(Action.create('matchFound', playersInfo));
    }

    quit(code) {
        console.log('ServerClient.quit()', this.playerIndex, code);
        this.send(Action.create('quit', this.playerIndex, code));
        this.playerIndex = -1;
    }
}
