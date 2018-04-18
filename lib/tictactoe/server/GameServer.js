import * as TicTacToe from '../base/TicTacToe';
import { ServerClient } from './ServerClient';
import { ServerMatch } from './ServerMatch';

/*!
    \class GameServer
*/
export class GameServer {
    constructor(httpServer, WebSocket) {
        this.findingQueue = [];
        this.socketServer = new WebSocket.Server({ server: httpServer });
        this.handleConnection = this.handleConnection.bind(this);
        this.socketServer.on('connection', this.handleConnection);
    }

    handleConnection(socket) {
        console.log('GameServer.handleConnection()');
        new ServerClient(this, socket);
    }

    findMatch(client, action) {
        console.log('GameServer.findMatch()', action);
        client.playerName = action.playerName;
        this.findingQueue.push(client);
        if (this.findingQueue.length < TicTacToe.MaxPlayers)
            return;
        const clients = [];
        let count = TicTacToe.MaxPlayers;
        while (count-- > 0)
            clients.push(this.findingQueue.shift());
        new ServerMatch(this, clients);
    }

    removeClient(client) {
        const index = this.findingQueue.indexOf(client);
        console.log('GameServer.removeClient()', index);
        if (index !== -1)
            this.findingQueue.splice(index, 1);
    }
}
