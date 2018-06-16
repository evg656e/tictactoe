import * as TicTacToe from '../base/TicTacToe';
import { PlayerInfo } from '../actions/PlayerInfo';
import { Action } from '../actions/Action';
import { QuitAction } from '../actions/QuitAction';

/*!
    \class ServerMatch
*/
export class ServerMatch {
    constructor(server, clients) {
        this.server = server;
        this.clients = clients;
        this.current = -1;
        this.syncActions = {};
        this.state = ServerMatch.InitState;
        if (this.clients.length === TicTacToe.MaxPlayers) {
            this.clients.forEach((client) => {
                client.match = this;
                const playersInfo = this.clients.map(function (otherClient) {
                    return new PlayerInfo(otherClient.playerName, client === otherClient);
                });
                client.matchFound(playersInfo);
            });
            this.state = ServerMatch.SyncState;
        }
    }

    updatePlayer(client, action) {
        this.clients.forEach((otherClient) => {
            otherClient.send(action);
        });
    }

    movePlayer(client, action) {
        console.log('ServerMatch.movePlayer()', client.playerIndex, action.playerIndex);
        if (this.state === ServerMatch.MoveState
            && (this.current === client.playerIndex || this.current === -1)) { // this.current === -1 for game over state
            this.clients.forEach((otherClient) => {
                otherClient.send(action);
            });
            this.state = ServerMatch.SyncState;
        }
    }

    syncPlayer(client, action) {
        if (this.state === ServerMatch.SyncState) {
            const index = this.clients.indexOf(client);
            if (index !== -1) {
                client.playerIndex = action.playerIndex;
                this.syncActions[index] = action;
                if (Object.keys(this.syncActions).length === this.clients.length) {
                    for (let i = 1; i < this.clients.length; i++) {
                        const prevAction = this.syncActions[i - 1], currAction = this.syncActions[i];
                        if (prevAction.stateHash !== currAction.stateHash) {
                            console.error('ServerMatch.syncPlayer(): state desynchronized.', prevAction, currAction);
                            this.clients.forEach((client) => {
                                client.quit(QuitAction.Desynchronized);
                            });
                            this.close();
                            return;
                        }
                    }
                    console.log('ServerMatch.syncPlayer(): state synchronized.');
                    this.current = action.current;
                    this.syncActions = {};
                    this.state = ServerMatch.MoveState;
                }
            }
        }
    }

    quitPlayer(client, code) {
        const index = this.clients.indexOf(client);
        console.log('ServerMatch.quitPlayer()', index, client.playerIndex);
        if (index !== -1) {
            this.clients.splice(index, 1);
            this.clients.forEach((otherClient) => {
                otherClient.send(Action.create('quit', client.playerIndex, code));
            });
            this.close();
            client.quit(code);
        }
    }

    close() {
        console.log('ServerMatch.close()');
        this.clients.forEach((client) => {
            client.match = null;
        });
        this.clients = [];
        this.server = null;
        this.current = -1;
        this.syncActions = {};
        this.state = ServerMatch.InitState;
    }
}

ServerMatch.InitState = 0;
ServerMatch.SyncState = 1;
ServerMatch.MoveState = 1;
